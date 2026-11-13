import { supabase, isSupabaseConfigured } from './supabaseClient'

// ============================================================
// Keamanan Kriptografi: PBKDF2-HMAC-SHA256 (100.000 Iterasi)
// ============================================================
export async function hashPasswordSecure(password, emailSalt = '') {
  const encoder = new TextEncoder()
  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    encoder.encode(password),
    { name: 'PBKDF2' },
    false,
    ['deriveBits']
  )
  const salt = encoder.encode(`handoora_v2_salt_${emailSalt.toLowerCase().trim()}`)
  const derivedBits = await crypto.subtle.deriveBits(
    {
      name: 'PBKDF2',
      salt,
      iterations: 100000,
      hash: 'SHA-256',
    },
    keyMaterial,
    256
  )
  const hashArray = Array.from(new Uint8Array(derivedBits))
  return `pbkdf2_sha256$100000$${hashArray.map((b) => b.toString(16).padStart(2, '0')).join('')}`
}

export async function checkIsGoogleOAuthEnabled() {
  if (!isSupabaseConfigured) return false
  try {
    const url = import.meta.env.VITE_SUPABASE_URL
    const key = import.meta.env.VITE_SUPABASE_ANON_KEY
    const res = await fetch(`${url}/auth/v1/settings`, {
      headers: { apikey: key },
    })
    if (!res.ok) return false
    const settings = await res.json()
    return Boolean(settings?.external?.google)
  } catch {
    return false
  }
}

// Helper: Normalisasi progres agar akun yang belum pernah bermain mulai dari Level 1
function normalizeInitialProgress(xp, completedLessons, unlockedIslands, userId) {
  const migKey = userId ? `handoora_lvl1_init_${userId}` : 'handoora_lvl1_init'
  const cArr = Array.isArray(completedLessons) ? completedLessons : []
  const uArr = Array.isArray(unlockedIslands) && unlockedIslands.length > 0 ? unlockedIslands : [1]

  // Jika data masih berupa seed default lama (xp=120, completed=[1], unlocked=[1,2]), reset ke Level 1 murni
  const isLegacyDefaultSeed =
    xp === 120 &&
    cArr.length === 1 &&
    cArr[0] === 1 &&
    uArr.length === 2 &&
    uArr.includes(1) &&
    uArr.includes(2) &&
    !localStorage.getItem(migKey)

  if (isLegacyDefaultSeed) {
    return {
      xp: 0,
      completedIslands: [],
      unlockedIslands: [1],
      wasNormalized: true,
    }
  }

  return {
    xp: xp ?? 0,
    completedIslands: cArr,
    unlockedIslands: uArr.includes(1) ? uArr : [1, ...uArr],
    wasNormalized: false,
  }
}

export async function fetchOrCreateSupabaseProfile(authUser, extraData = {}) {
  if (!supabase || !authUser) return null

  const localAvatar = localStorage.getItem(`handoora_avatar_${authUser.id}`)

  const defaultNama =
    extraData.nama ||
    authUser.user_metadata?.nama ||
    authUser.user_metadata?.full_name ||
    authUser.user_metadata?.name ||
    authUser.email?.split('@')[0] ||
    'Sobat Handoora'

  const defaultUmur =
    extraData.umur !== undefined
      ? extraData.umur
      : authUser.user_metadata?.umur
        ? parseInt(authUser.user_metadata.umur, 10)
        : null

  const defaultProvider =
    authUser.app_metadata?.provider ||
    authUser.user_metadata?.auth_provider ||
    'email'

  const defaultAvatar =
    localAvatar ||
    authUser.user_metadata?.avatar_url ||
    authUser.user_metadata?.picture ||
    null

  const { data: existingProfile, error: selectErr } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', authUser.id)
    .maybeSingle()

  if (!selectErr && existingProfile) {
    return {
      ...existingProfile,
      avatar_url: existingProfile.avatar_url || localAvatar || defaultAvatar,
    }
  }

  // Baris baru mulai dari Level 1 (completed_lessons: [], unlocked_islands: [1])
  const newProfileRow = {
    id: authUser.id,
    nama: defaultNama,
    umur: defaultUmur,
    email: authUser.email,
    password_hash: extraData.password_hash || authUser.user_metadata?.password_hash || null,
    auth_provider: defaultProvider,
    avatar_url: defaultAvatar,
    xp: 0,
    streak: 0,
    gems: 500,
    hearts: 5,
    current_unit: 1,
    completed_lessons: [],
    unlocked_islands: [1],
    last_activity_date: null,
    streak_history: [],
  }

  const { data: insertedProfile, error: insertErr } = await supabase
    .from('profiles')
    .upsert(newProfileRow, { onConflict: 'id' })
    .select('*')
    .maybeSingle()

  if (!insertErr && insertedProfile) {
    return insertedProfile
  }

  return {
    ...newProfileRow,
    _tableMissing: Boolean(insertErr || selectErr),
  }
}

export const authService = {
  // 1. REGISTER PENGGUNA BARU (MULAI DARI LEVEL 1)
  async register({ nama, umur, email, password }) {
    if (!isSupabaseConfigured || !supabase) {
      throw new Error('Layanan autentikasi belum aktif.')
    }

    const cleanNama = nama.trim()
    let rawEmail = email.trim().toLowerCase()
    // Dukung input bebas: jika pengguna hanya memasukkan username/nama tanpa @domain, otomatis tambahkan @handoora.local
    const cleanEmail = rawEmail.includes('@') ? rawEmail : `${rawEmail}@handoora.local`
    const parsedUmur = parseInt(umur, 10)
    const passwordHash = await hashPasswordSecure(password, cleanEmail)

    // Cek apakah email sudah terdaftar di tabel profiles terlebih dahulu
    try {
      const { data: existingProfile } = await supabase
        .from('profiles')
        .select('id')
        .eq('email', cleanEmail)
        .maybeSingle()

      if (existingProfile) {
        throw new Error('Email sudah terdaftar. Silakan masuk melalui halaman Login.')
      }
    } catch (checkErr) {
      if (checkErr.message?.includes('Email sudah terdaftar')) {
        throw checkErr
      }
      // Jika error lain (misal koneksi/tabel), lanjut ke signUp
    }

    const { data, error } = await supabase.auth.signUp({
      email: cleanEmail,
      password,
      options: {
        data: {
          nama: cleanNama,
          full_name: cleanNama,
          umur: parsedUmur,
          password_hash: passwordHash,
          auth_provider: 'email',
          xp: 0,
          streak: 0,
          gems: 500,
          hearts: 5,
          completed_lessons: [],
          unlocked_islands: [1],
          last_activity_date: null,
          streak_history: [],
        },
      },
    })

    if (error) {
      const msg = error.message?.toLowerCase() || ''
      if (
        msg.includes('already registered') ||
        msg.includes('user already exists') ||
        msg.includes('unique constraint') ||
        error.status === 422
      ) {
        throw new Error('Email sudah terdaftar. Silakan masuk melalui halaman Login.')
      }
      throw new Error(error.message)
    }

    // Supabase Auth dengan email confirmation disabled / identities
    if (data?.user && (!data.user.identities || data.user.identities.length === 0)) {
      throw new Error('Email sudah terdaftar. Silakan masuk melalui halaman Login.')
    }

    if (!data?.user) {
      throw new Error('Gagal membuat akun pengguna.')
    }

    const profile = await fetchOrCreateSupabaseProfile(data.user, {
      nama: cleanNama,
      umur: parsedUmur,
      password_hash: passwordHash,
    })

    return profile
  },

  // 2. LOGIN DENGAN EMAIL & PASSWORD
  async login({ email, password }) {
    if (!isSupabaseConfigured || !supabase) {
      throw new Error('Layanan autentikasi belum aktif.')
    }

    const cleanEmail = email.trim().toLowerCase()

    const { data, error } = await supabase.auth.signInWithPassword({
      email: cleanEmail,
      password,
    })

    if (error) {
      if (error.message?.toLowerCase().includes('email not confirmed')) {
        throw new Error(
          'Email kamu belum dikonfirmasi. Silakan cek kotak masuk email kamu.'
        )
      }
      throw new Error('Email atau password salah. Silakan periksa kembali.')
    }

    const profile = await fetchOrCreateSupabaseProfile(data.user)
    return profile
  },

  // 3. LOGIN DENGAN GOOGLE OAUTH 2.0
  async loginWithGoogle() {
    if (!isSupabaseConfigured || !supabase) {
      throw new Error('Layanan autentikasi belum aktif.')
    }

    const isGoogleEnabled = await checkIsGoogleOAuthEnabled()
    if (!isGoogleEnabled) {
      const err = new Error('GOOGLE_PROVIDER_NOT_ENABLED')
      err.code = 'GOOGLE_PROVIDER_NOT_ENABLED'
      throw err
    }

    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/belajar`,
        queryParams: {
          access_type: 'offline',
          prompt: 'select_account',
        },
      },
    })

    if (error) {
      throw new Error(error.message)
    }

    if (data?.url) {
      window.location.href = data.url
    }
    return null
  },

  // 4. UPDATE PROFIL (NAMA, UMUR, DAN FOTO PROFIL / AVATAR)
  async updateProfile(userId, updates) {
    if (updates.avatar_url && userId) {
      localStorage.setItem(`handoora_avatar_${userId}`, updates.avatar_url)
    }

    if (!supabase || !userId) return updates

    // Simpan ke user_metadata hanya jika avatar_url bukan base64 panjang (agar ukuran JWT tetap kecil)
    const metaUpdates = { ...updates }
    if (metaUpdates.avatar_url && metaUpdates.avatar_url.startsWith('data:')) {
      delete metaUpdates.avatar_url
    }
    try {
      await supabase.auth.updateUser({
        data: metaUpdates,
      })
    } catch {
      // ignore
    }

    // Upsert ke tabel profiles agar foto profil tersimpan permanen
    try {
      const { data: updatedRow, error: profileErr } = await supabase
        .from('profiles')
        .upsert({
          id: userId,
          nama: updates.nama,
          umur: updates.umur,
          avatar_url: updates.avatar_url,
          updated_at: new Date().toISOString(),
        }, { onConflict: 'id' })
        .select('*')
        .maybeSingle()

      if (!profileErr && updatedRow) {
        return updatedRow
      }
    } catch {
      // Fallback update jika schema lama
      try {
        const { data: updatedRow } = await supabase
          .from('profiles')
          .update({
            ...updates,
            updated_at: new Date().toISOString(),
          })
          .eq('id', userId)
          .select('*')
          .maybeSingle()

        if (updatedRow) return updatedRow
      } catch {
        // ignore
      }
    }

    return {
      ...updates,
      avatar_url: updates.avatar_url || (userId ? localStorage.getItem(`handoora_avatar_${userId}`) : null),
    }
  },

  // 4.1. UPDATE PASSWORD PENGGUNA
  async updatePassword(newPassword) {
    if (!newPassword || newPassword.length < 6) {
      throw new Error('Password baru minimal 6 karakter.')
    }
    if (supabase && isSupabaseConfigured) {
      const { data, error } = await supabase.auth.updateUser({
        password: newPassword,
      })
      if (error) {
        throw new Error(error.message || 'Gagal mengubah password.')
      }
      return data
    }
    return true
  },

  // 5. LOGOUT
  async logout() {
    if (supabase) {
      await supabase.auth.signOut()
    }
    return true
  },
}

// Format tanggal lokal (YYYY-MM-DD)
export function getLocalDateString(d = new Date()) {
  const year = d.getFullYear()
  const month = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

// Menghitung selisih hari kalender antara dua tanggal (YYYY-MM-DD)
export function getCalendarDayDiff(dateStrA, dateStrB) {
  if (!dateStrA || !dateStrB) return null
  const [y1, m1, d1] = dateStrA.split('-').map(Number)
  const [y2, m2, d2] = dateStrB.split('-').map(Number)
  const utc1 = Date.UTC(y1, m1 - 1, d1)
  const utc2 = Date.UTC(y2, m2 - 1, d2)
  return Math.round((utc2 - utc1) / (1000 * 60 * 60 * 24))
}

// Menghitung status streak terkini secara real-time
// Aturan:
// 1. User baru streak = 0 (api mati)
// 2. Jika hari ini user sudah menyelesaikan minimal 1 level/stage: api menyala (isStreakActiveToday = true)
// 3. Jika hari ini belum menyelesaikan:
//    - Jika kemarin mengerjakan (diff === 1): streak tetap bertahan, api belum nyala hari ini (isStreakActiveToday = false)
//    - Jika kemarin TIDAK mengerjakan (diff > 1): streak padam & reset ke 0!
export function calculateCurrentStreak(streak = 0, lastActivityDate = null, streakHistory = []) {
  const todayStr = getLocalDateString()
  const numStreak = Number(streak) || 0

  if (!lastActivityDate) {
    return {
      streak: 0,
      isStreakActiveToday: false,
      lastActivityDate: null,
      streakHistory: Array.isArray(streakHistory) ? streakHistory : [],
    }
  }

  const diff = getCalendarDayDiff(lastActivityDate, todayStr)

  if (diff === 0) {
    // Hari ini sudah mengerjakan minimal 1 level -> api streak aktif & menyala
    return {
      streak: Math.max(1, numStreak),
      isStreakActiveToday: true,
      lastActivityDate,
      streakHistory: Array.isArray(streakHistory) ? streakHistory : [],
    }
  }

  if (diff === 1) {
    // Kemarin mengerjakan, hari ini belum -> streak kemarin masih tersimpan tapi api belum menyala hari ini
    return {
      streak: numStreak,
      isStreakActiveToday: false,
      lastActivityDate,
      streakHistory: Array.isArray(streakHistory) ? streakHistory : [],
    }
  }

  // diff > 1 (atau < 0 karena jam berubah) -> kemarin tidak mengerjakan, streak putus & reset ke 0
  return {
    streak: 0,
    isStreakActiveToday: false,
    lastActivityDate,
    streakHistory: Array.isArray(streakHistory) ? streakHistory : [],
  }
}

// Mencatat penyelesaian level harian untuk menambah streak
// Aturan:
// - Menyelesaikan minimal 1 level membuat api streak menyala hari ini
// - Maksimal penambahan streak cuma 1 tiap 1 hari
export function recordDailyLessonCompletion(currentProgress) {
  const todayStr = getLocalDateString()
  const lastDate = currentProgress?.last_activity_date || currentProgress?.lastActivityDate || null
  const currentStreakVal = Number(currentProgress?.streak) || 0
  const history = Array.isArray(currentProgress?.streak_history || currentProgress?.streakHistory)
    ? [...(currentProgress.streak_history || currentProgress.streakHistory)]
    : []

  if (!history.includes(todayStr)) {
    history.push(todayStr)
    // Simpan riwayat 60 hari terakhir agar efisien
    if (history.length > 60) {
      history.splice(0, history.length - 60)
    }
  }

  // Jika hari ini sudah tercatat penambahan streak, pertahankan streak hari ini (maks 1 per hari)
  if (lastDate === todayStr) {
    return {
      ...currentProgress,
      streak: Math.max(1, currentStreakVal),
      isStreakActiveToday: true,
      last_activity_date: todayStr,
      lastActivityDate: todayStr,
      streak_history: history,
      streakHistory: history,
    }
  }

  const diff = lastDate ? getCalendarDayDiff(lastDate, todayStr) : null

  let nextStreak = 1
  if (diff === 1) {
    // Konsisten beruntun dari kemarin! Tambah 1
    nextStreak = currentStreakVal + 1
  } else {
    // Baru mulai / sempat putus kemarin
    nextStreak = 1
  }

  return {
    ...currentProgress,
    streak: nextStreak,
    isStreakActiveToday: true,
    last_activity_date: todayStr,
    lastActivityDate: todayStr,
    streak_history: history,
    streakHistory: history,
  }
}

// Helper: Dapatkan identifikasi siklus mingguan (Minggu s.d. Sabtu)
// Format: "YYYY-MM-DD" berbasis hari Minggu pukul 00:00:00 lokal
export function getWeeklyCycleId(date = new Date()) {
  const sunday = new Date(date)
  sunday.setDate(sunday.getDate() - sunday.getDay())
  sunday.setHours(0, 0, 0, 0)
  const y = sunday.getFullYear()
  const m = String(sunday.getMonth() + 1).padStart(2, '0')
  const d = String(sunday.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

// Semua pengguna mulai dari Level 1 (Pulau 1 terbuka, belum ada pulau yang selesai)
const DEFAULT_PROGRESS = {
  xp: 0,
  weekly_xp: 0,
  weekly_cycle_id: getWeeklyCycleId(),
  streak: 0,
  isStreakActiveToday: false,
  last_activity_date: null,
  streak_history: [],
  gems: 500,
  hearts: 5,
  completedIslands: [],
  unlockedIslands: [1],
  dailyQuests: {
    xpEarned: 0,
    xpEarnedToday: 0,
    highScoreLessons: 0,
  },
}

export const progressService = {
  getProgress(userId) {
    const currentCycle = getWeeklyCycleId()
    if (userId) {
      const cached = localStorage.getItem(`handoora_progress_${userId}`)
      if (cached) {
        try {
          const parsed = JSON.parse(cached)
          // Hitung status streak real-time terhadap hari ini
          const streakState = calculateCurrentStreak(
            parsed.streak,
            parsed.last_activity_date || parsed.lastActivityDate,
            parsed.streak_history || parsed.streakHistory
          )

          // Reset mingguan XP leaderboard jika sudah masuk ke siklus minggu yang baru
          let weeklyXp = Number(parsed.weekly_xp)
          if (parsed.weekly_cycle_id !== currentCycle) {
            weeklyXp = 0
          } else if (isNaN(weeklyXp)) {
            // Fallback untuk akun lama: jika minggu ini baru dibuat/diupdate, gunakan xp
            weeklyXp = Number(parsed.xp) || 0
          }

          return {
            ...parsed,
            weekly_xp: weeklyXp,
            weekly_cycle_id: currentCycle,
            streak: streakState.streak,
            isStreakActiveToday: streakState.isStreakActiveToday,
            last_activity_date: streakState.lastActivityDate,
            streak_history: streakState.streakHistory,
          }
        } catch {
          // ignore
        }
      }
    }
    return { ...DEFAULT_PROGRESS, weekly_cycle_id: currentCycle }
  },

  resetProgress(userId) {
    const currentCycle = getWeeklyCycleId()
    const fresh = {
      ...DEFAULT_PROGRESS,
      xp: 0,
      weekly_xp: 0,
      weekly_cycle_id: currentCycle,
      completedIslands: [],
      unlockedIslands: [1],
    }
    if (userId) {
      localStorage.setItem(`handoora_lvl1_init_${userId}`, 'true')
      localStorage.setItem(`handoora_progress_${userId}`, JSON.stringify(fresh))
    }
    return fresh
  },

  async syncFromSupabase(userId) {
    return this.fetchProgressFromSupabase(userId)
  },

  async fetchProgressFromSupabase(userId) {
    if (!supabase || !userId) return { ...DEFAULT_PROGRESS }

    const currentCycle = getWeeklyCycleId()

    // Ambil cache lokal terkini jika ada, agar XP yang baru saja diperoleh tidak tertimpa data lama
    const cached = this.getProgress(userId)

    const { data, error } = await supabase
      .from('profiles')
      .select('xp, weekly_xp, weekly_cycle_id, streak, gems, hearts, current_unit, completed_lessons, unlocked_islands, last_activity_date, streak_history')
      .eq('id', userId)
      .maybeSingle()

    if (!error && data) {
      const norm = normalizeInitialProgress(
        data.xp,
        data.completed_lessons,
        data.unlocked_islands,
        userId
      )

      // Ambil XP tertinggi antara database dan cache lokal agar perolehan kuis tidak hilang
      const resolvedXp = Math.max(norm.xp, Number(cached?.xp) || 0)

      // Hitung streak real-time
      const streakState = calculateCurrentStreak(
        data.streak ?? cached?.streak ?? 0,
        data.last_activity_date || cached?.last_activity_date,
        data.streak_history || cached?.streak_history
      )

      const result = {
        xp: resolvedXp,
        weekly_xp: resolvedXp,
        weekly_cycle_id: currentCycle,
        streak: streakState.streak,
        isStreakActiveToday: streakState.isStreakActiveToday,
        last_activity_date: streakState.lastActivityDate,
        streak_history: streakState.streakHistory,
        gems: data.gems ?? cached?.gems ?? 500,
        hearts: data.hearts ?? cached?.hearts ?? 5,
        completedIslands: Array.isArray(data.completed_lessons) && data.completed_lessons.length > 0 ? data.completed_lessons : (cached?.completedIslands || []),
        unlockedIslands: norm.unlockedIslands,
        dailyQuests: {
          xpEarned: Math.min(20, resolvedXp),
          xpEarnedToday: Math.min(50, resolvedXp),
          highScoreLessons: (data.completed_lessons || []).length,
        },
      }

      localStorage.setItem(`handoora_progress_${userId}`, JSON.stringify(result))

      // Jika ada perbedaan atau normalisasi, sinkronkan balik ke database
      if (norm.wasNormalized || resolvedXp > norm.xp) {
        localStorage.setItem(`handoora_lvl1_init_${userId}`, 'true')
        await this.saveProgressToSupabase(userId, result)
      }

      return result
    }

    const { data: userData } = await supabase.auth.getUser()
    const meta = userData?.user?.user_metadata || {}
    const norm = normalizeInitialProgress(
      meta.xp,
      meta.completed_lessons,
      meta.unlocked_islands,
      userId
    )

    const streakState = calculateCurrentStreak(
      meta.streak ?? 0,
      meta.last_activity_date || meta.lastActivityDate,
      meta.streak_history || meta.streakHistory
    )

    let weeklyXp = Number(meta.weekly_xp)
    if (meta.weekly_cycle_id !== currentCycle) {
      weeklyXp = 0
    } else if (isNaN(weeklyXp)) {
      weeklyXp = norm.xp
    }

    const fallback = {
      xp: norm.xp,
      weekly_xp: weeklyXp,
      weekly_cycle_id: currentCycle,
      streak: streakState.streak,
      isStreakActiveToday: streakState.isStreakActiveToday,
      last_activity_date: streakState.lastActivityDate,
      streak_history: streakState.streakHistory,
      gems: meta.gems ?? 500,
      hearts: meta.hearts ?? 5,
      completedIslands: norm.completedIslands,
      unlockedIslands: norm.unlockedIslands,
      dailyQuests: {
        xpEarned: Math.min(20, norm.xp),
        xpEarnedToday: Math.min(50, norm.xp),
        highScoreLessons: norm.completedIslands.length,
      },
    }

    localStorage.setItem(`handoora_progress_${userId}`, JSON.stringify(fallback))
    return fallback
  },

  async saveProgressToSupabase(userId, progress) {
    const currentCycle = getWeeklyCycleId()
    const finalWeeklyCycle = progress.weekly_cycle_id || currentCycle
    let finalWeeklyXp = Number(progress.weekly_xp)
    if (finalWeeklyCycle !== currentCycle) {
      finalWeeklyXp = 0
    } else if (isNaN(finalWeeklyXp)) {
      finalWeeklyXp = Number(progress.xp) || 0
    }

    const updatedProgress = {
      ...progress,
      weekly_xp: finalWeeklyXp,
      weekly_cycle_id: currentCycle,
    }

    if (userId) {
      localStorage.setItem(`handoora_lvl1_init_${userId}`, 'true')
      localStorage.setItem(`handoora_progress_${userId}`, JSON.stringify(updatedProgress))
      
      // Simpan juga ke known local profiles untuk sinkronisasi fallback multi-akun
      try {
        const knownProfiles = JSON.parse(localStorage.getItem('handoora_known_profiles') || '{}')
        const currentMeta = JSON.parse(localStorage.getItem('handoora_user') || '{}')
        knownProfiles[userId] = {
          id: userId,
          nama: currentMeta.nama || progress.nama || 'Sobat Handoora',
          email: currentMeta.email || '',
          xp: updatedProgress.xp,
          weekly_xp: finalWeeklyXp,
          weekly_cycle_id: currentCycle,
          current_unit: updatedProgress.current_unit || (updatedProgress.unlockedIslands?.slice(-1)[0] || 1),
          avatar_url: currentMeta.avatar_url || localStorage.getItem(`handoora_avatar_${userId}`) || null,
          updated_at: new Date().toISOString()
        }
        localStorage.setItem('handoora_known_profiles', JSON.stringify(knownProfiles))
      } catch {
        // ignore
      }
    }

    if (!supabase || !userId) return updatedProgress

    const lastDate = updatedProgress.last_activity_date || updatedProgress.lastActivityDate || null
    const history = updatedProgress.streak_history || updatedProgress.streakHistory || []

    await supabase.auth.updateUser({
      data: {
        xp: updatedProgress.xp,
        weekly_xp: finalWeeklyXp,
        weekly_cycle_id: currentCycle,
        streak: updatedProgress.streak,
        last_activity_date: lastDate,
        streak_history: history,
        gems: updatedProgress.gems,
        hearts: updatedProgress.hearts,
        completed_lessons: updatedProgress.completedIslands,
        unlocked_islands: updatedProgress.unlockedIslands,
      },
    })

    // Upsert ke tabel profiles agar row akun dipastikan ada di database (bukan sekadar update)
    try {
      const { error: upsertError } = await supabase
        .from('profiles')
        .upsert({
          id: userId,
          nama: progress.nama || undefined,
          xp: updatedProgress.xp,
          weekly_xp: finalWeeklyXp,
          weekly_cycle_id: currentCycle,
          streak: updatedProgress.streak,
          last_activity_date: lastDate,
          streak_history: history,
          gems: updatedProgress.gems,
          hearts: updatedProgress.hearts,
          completed_lessons: updatedProgress.completedIslands,
          unlocked_islands: updatedProgress.unlockedIslands,
          updated_at: new Date().toISOString(),
        }, { onConflict: 'id' })

      if (upsertError) {
        // Fallback jika kolom weekly_xp / weekly_cycle_id belum ada di schema database
        await supabase
          .from('profiles')
          .upsert({
            id: userId,
            nama: progress.nama || undefined,
            xp: updatedProgress.xp,
            streak: updatedProgress.streak,
            last_activity_date: lastDate,
            streak_history: history,
            gems: updatedProgress.gems,
            hearts: updatedProgress.hearts,
            completed_lessons: updatedProgress.completedIslands,
            unlocked_islands: updatedProgress.unlockedIslands,
            updated_at: new Date().toISOString(),
          }, { onConflict: 'id' })
      }
    } catch {
      // Fallback kedua jika upsert gagal
      try {
        await supabase
          .from('profiles')
          .update({
            xp: updatedProgress.xp,
            streak: updatedProgress.streak,
            last_activity_date: lastDate,
            streak_history: history,
            gems: updatedProgress.gems,
            hearts: updatedProgress.hearts,
            completed_lessons: updatedProgress.completedIslands,
            unlocked_islands: updatedProgress.unlockedIslands,
            updated_at: new Date().toISOString(),
          })
          .eq('id', userId)
      } catch {
        // ignore
      }
    }

    return updatedProgress
  },

  // Mendapatkan daftar leaderboard peringkat aktual dari Supabase profiles
  async getLeaderboard(limit = 10) {
    // Helper untuk mengambil cache profil lokal multi-akun jika Supabase offline/terkendala
    const getCachedKnownProfiles = () => {
      try {
        const stored = JSON.parse(localStorage.getItem('handoora_known_profiles') || '{}')
        return Object.values(stored).map(p => ({
          ...p,
          xp: Number(p.xp) || 0,
          weekly_xp: Number(p.xp) || 0,
        })).sort((a, b) => b.xp - a.xp)
      } catch {
        return []
      }
    }

    if (!supabase || !isSupabaseConfigured) {
      return getCachedKnownProfiles().slice(0, limit)
    }

    try {
      // Ambil seluruh profil di database diurutkan berdasarkan total XP aktual
      const { data, error } = await supabase
        .from('profiles')
        .select('id, nama, email, xp, current_unit, avatar_url, updated_at')
        .order('xp', { ascending: false })
        .limit(limit)

      if (!error && Array.isArray(data) && data.length > 0) {
        const mapped = data.map((p) => ({
          ...p,
          xp: Number(p.xp) || 0,
          weekly_xp: Number(p.xp) || 0,
        }))

        // Cache ke handoora_known_profiles
        try {
          const known = JSON.parse(localStorage.getItem('handoora_known_profiles') || '{}')
          mapped.forEach((p) => {
            if (p.id) known[p.id] = { ...known[p.id], ...p }
          })
          localStorage.setItem('handoora_known_profiles', JSON.stringify(known))
        } catch {
          // ignore
        }

        return mapped
      }

      return getCachedKnownProfiles().slice(0, limit)
    } catch (err) {
      console.warn('Error fetching leaderboard:', err)
      return getCachedKnownProfiles().slice(0, limit)
    }
  },
}
