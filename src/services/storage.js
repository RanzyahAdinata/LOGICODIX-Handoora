import { createClient } from '@supabase/supabase-js'
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
    const mergedProfile = {
      ...existingProfile,
      avatar_url: existingProfile.avatar_url || localAvatar || defaultAvatar,
    }
    try {
      const known = JSON.parse(localStorage.getItem('handoora_known_profiles') || '{}')
      known[authUser.id] = {
        ...(known[authUser.id] || {}),
        id: mergedProfile.id,
        nama: mergedProfile.nama,
        umur: mergedProfile.umur ?? null,
        email: mergedProfile.email,
        xp: Number(mergedProfile.xp) || 0,
        streak: Number(mergedProfile.streak) || 0,
        gems: Number(mergedProfile.gems ?? 500),
        hearts: Number(mergedProfile.hearts ?? 5),
        current_unit: Number(mergedProfile.current_unit) || 1,
        avatar_url: mergedProfile.avatar_url || null,
        updated_at: mergedProfile.updated_at || new Date().toISOString(),
      }
      localStorage.setItem('handoora_known_profiles', JSON.stringify(known))
    } catch {
      // ignore
    }
    return mergedProfile
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

export const DEMO_USER = {
  id: 'demo-handoora-juri-account',
  nama: 'Demo Pengujian (Juri)',
  email: 'demo.handoora@gmail.com',
  umur: 25,
  auth_provider: 'email',
  avatar_url: null,
  xp: 350,
  weekly_xp: 350,
  weekly_cycle_id: getWeeklyCycleId(),
  streak: 3,
  gems: 750,
  hearts: 5,
  current_unit: 2,
  completed_lessons: [1],
  unlocked_islands: [1, 2],
  last_activity_date: getLocalDateString(),
  streak_history: [getLocalDateString()],
}

export const ADMIN_EMAIL = 'admin@gmail.com'
const ADMIN_PASSWORD_HASH_PROMISE = hashPasswordSecure('admin123', ADMIN_EMAIL)
const ADMIN_SESSION_KEY = 'handoora_admin_session'

export function isDemoUser(userOrId) {
  if (!userOrId) return false
  if (typeof userOrId === 'string') {
    return userOrId === DEMO_USER.id || userOrId.toLowerCase() === DEMO_USER.email.toLowerCase()
  }
  return (
    userOrId.id === DEMO_USER.id ||
    userOrId.email?.toLowerCase() === DEMO_USER.email.toLowerCase()
  )
}

function getLocalRegisteredUsers() {
  try {
    return JSON.parse(localStorage.getItem('handoora_registered_users') || '{}')
  } catch {
    return {}
  }
}

// Reset migrasi satu kali agar XP seluruh akun selain akun demo kembali ke 0
const XP_RESET_VERSION_KEY = 'handoora_xp_reset_all_except_demo_v1'
export function performGlobalXpResetExceptDemo() {
  if (typeof window === 'undefined' || !window.localStorage) return
  if (localStorage.getItem(XP_RESET_VERSION_KEY) === 'done') return

  try {
    const demoId = DEMO_USER.id
    const demoEmail = DEMO_USER.email.toLowerCase()

    // 1. Reset user yang sedang aktif jika bukan akun demo
    const currentUser = JSON.parse(localStorage.getItem('handoora_user') || 'null')
    if (currentUser && currentUser.id !== demoId && currentUser.email?.toLowerCase() !== demoEmail) {
      currentUser.xp = 0
      currentUser.weekly_xp = 0
      localStorage.setItem('handoora_user', JSON.stringify(currentUser))
    }

    // 2. Reset handoora_known_profiles
    const knownProfiles = JSON.parse(localStorage.getItem('handoora_known_profiles') || '{}')
    Object.keys(knownProfiles).forEach((k) => {
      const p = knownProfiles[k]
      if (p.id !== demoId && p.email?.toLowerCase() !== demoEmail) {
        p.xp = 0
        p.weekly_xp = 0
      }
    })
    localStorage.setItem('handoora_known_profiles', JSON.stringify(knownProfiles))

    // 3. Reset handoora_registered_users
    const registeredUsers = JSON.parse(localStorage.getItem('handoora_registered_users') || '{}')
    Object.keys(registeredUsers).forEach((emailKey) => {
      if (emailKey.toLowerCase() !== demoEmail) {
        const u = registeredUsers[emailKey]
        if (u.profile) {
          u.profile.xp = 0
          u.profile.weekly_xp = 0
        }
        u.xp = 0
        u.weekly_xp = 0
      }
    })
    localStorage.setItem('handoora_registered_users', JSON.stringify(registeredUsers))

    // 4. Reset seluruh key handoora_progress_* di localStorage kecuali milik demo user
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i)
      if (key && key.startsWith('handoora_progress_') && !key.includes(demoId)) {
        try {
          const prog = JSON.parse(localStorage.getItem(key) || '{}')
          prog.xp = 0
          prog.weekly_xp = 0
          if (prog.dailyQuests) {
            prog.dailyQuests.xpEarned = 0
            prog.dailyQuests.xpEarnedToday = 0
          }
          localStorage.setItem(key, JSON.stringify(prog))
        } catch {
          // ignore
        }
      }
    }

    localStorage.setItem(XP_RESET_VERSION_KEY, 'done')
  } catch (err) {
    console.warn('Gagal mereset XP akun lokal:', err)
  }
}

// Jalankan otomatis saat inisialisasi modul
performGlobalXpResetExceptDemo()

function saveLocalRegisteredUser(userRecord) {
  try {
    const users = getLocalRegisteredUsers()
    users[userRecord.email.toLowerCase()] = userRecord
    localStorage.setItem('handoora_registered_users', JSON.stringify(users))

    // Simpan juga ke known profiles untuk leaderboard
    const known = JSON.parse(localStorage.getItem('handoora_known_profiles') || '{}')
    known[userRecord.id] = {
      id: userRecord.id,
      nama: userRecord.nama,
      umur: userRecord.umur ?? null,
      email: userRecord.email,
      xp: userRecord.xp || 0,
      weekly_xp: userRecord.weekly_xp || 0,
      weekly_cycle_id: userRecord.weekly_cycle_id || getWeeklyCycleId(),
      current_unit: 1,
      avatar_url: userRecord.avatar_url || null,
      updated_at: new Date().toISOString(),
    }
    localStorage.setItem('handoora_known_profiles', JSON.stringify(known))
  } catch {
    // ignore
  }
}

export const authService = {
  // 1. REGISTER PENGGUNA BARU (MULAI DARI LEVEL 1)
  async register({ nama, umur, email, password }) {
    const cleanNama = nama.trim()
    const cleanEmail = email.trim().toLowerCase()
    const parsedUmur = parseInt(umur, 10)
    const passwordHash = await hashPasswordSecure(password, cleanEmail)

    // 1. Validasi 1 email hanya untuk 1 akun
    // Cek di penyimpanan pengguna lokal terlebih dahulu
    const localUsers = getLocalRegisteredUsers()
    if (localUsers[cleanEmail] || cleanEmail === DEMO_USER.email.toLowerCase()) {
      throw new Error('Email sudah terdaftar. Silakan masuk melalui halaman Login.')
    }

    // Cek di tabel profiles Supabase (jika koneksi tersedia)
    if (isSupabaseConfigured && supabase) {
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
      }
    }

    // 2. Coba daftarkan ke Supabase Auth
    let supabaseUser = null
    if (isSupabaseConfigured && supabase) {
      try {
        const { data, error } = await supabase.auth.signUp({
          email: cleanEmail,
          password,
          options: {
            emailRedirectTo: `${window.location.origin}/belajar`,
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
          // Jika Supabase menolak karena rate limit email SMTP atau konfirmasi email wajib,
          // kita jangan biarkan user gagal mendaftar! Kita gunakan seamless user registration.
          console.warn('Supabase Auth warning:', error.message)
        } else if (data?.user && (!data.user.identities || data.user.identities.length === 0)) {
          throw new Error('Email sudah terdaftar. Silakan masuk melalui halaman Login.')
        } else if (data?.user) {
          supabaseUser = data.user
        }
      } catch (err) {
        if (err.message?.includes('Email sudah terdaftar')) {
          throw err
        }
        console.warn('Supabase Auth error fallback to secure app account:', err.message)
      }
    }

    // 3. Buat profil pengguna lengkap
    const userId = supabaseUser?.id || `user_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`
    const currentCycle = getWeeklyCycleId()

    const newProfile = {
      id: userId,
      nama: cleanNama,
      umur: parsedUmur,
      email: cleanEmail,
      password_hash: passwordHash,
      auth_provider: 'email',
      avatar_url: null,
      xp: 0,
      weekly_xp: 0,
      weekly_cycle_id: currentCycle,
      streak: 0,
      gems: 500,
      hearts: 5,
      current_unit: 1,
      completed_lessons: [],
      unlocked_islands: [1],
      last_activity_date: null,
      streak_history: [],
      created_at: new Date().toISOString(),
    }

    // Simpan akun ke local registry agar selalu bisa login
    saveLocalRegisteredUser({
      id: userId,
      nama: cleanNama,
      umur: parsedUmur,
      email: cleanEmail,
      password_hash: passwordHash,
      profile: newProfile,
    })

    // Set sesi aktif
    localStorage.setItem('handoora_user', JSON.stringify(newProfile))
    localStorage.setItem('handoora_local_active', 'true')
    localStorage.setItem(`handoora_lvl1_init_${userId}`, 'true')
    localStorage.setItem(`handoora_progress_${userId}`, JSON.stringify({
      xp: 0,
      weekly_xp: 0,
      weekly_cycle_id: currentCycle,
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
    }))

    // Jika Supabase terhubung, simpan juga ke tabel profiles Supabase dengan kolom yang valid
    if (isSupabaseConfigured && supabase) {
      try {
        await supabase.from('profiles').upsert({
          id: userId,
          nama: cleanNama,
          umur: parsedUmur,
          email: cleanEmail,
          password_hash: passwordHash,
          auth_provider: 'email',
          avatar_url: null,
          xp: 0,
          streak: 0,
          gems: 500,
          hearts: 5,
          current_unit: 1,
          completed_lessons: [],
          unlocked_islands: [1],
        }, { onConflict: 'id' })
      } catch {
        // ignore
      }
    }

    return newProfile
  },

  // 2. LOGIN DENGAN EMAIL & PASSWORD
  async login({ email, password }) {
    const cleanEmail = email.trim().toLowerCase()

    // Penanganan khusus kredensial Akun Demo Juri/Penguji (sesuai README)
    // Memastikan juri dapat langsung menguji aplikasi tanpa terhalang proses verifikasi email
    if (cleanEmail === DEMO_USER.email.toLowerCase()) {
      if (password === 'HandooraPassword123!') {
        const currentCycle = getWeeklyCycleId()
        const demoProfile = {
          ...DEMO_USER,
          weekly_cycle_id: currentCycle,
          avatar_url: localStorage.getItem(`handoora_avatar_${DEMO_USER.id}`) || null,
        }

        // Siapkan penyimpanan profil demo di localStorage
        localStorage.setItem('handoora_user', JSON.stringify(demoProfile))
        localStorage.setItem('handoora_demo_active', 'true')
        localStorage.setItem('handoora_local_active', 'true')

        // Inisialisasi progres demo jika belum ada
        const existingDemoProgress = localStorage.getItem(`handoora_progress_${DEMO_USER.id}`)
        if (!existingDemoProgress) {
          const initProgress = {
            xp: demoProfile.xp,
            weekly_xp: demoProfile.weekly_xp,
            weekly_cycle_id: currentCycle,
            streak: demoProfile.streak,
            isStreakActiveToday: true,
            last_activity_date: demoProfile.last_activity_date,
            streak_history: demoProfile.streak_history,
            gems: demoProfile.gems,
            hearts: demoProfile.hearts,
            completedIslands: [1],
            unlockedIslands: [1, 2],
            dailyQuests: {
              xpEarned: 20,
              xpEarnedToday: 50,
              highScoreLessons: 1,
            },
          }
          localStorage.setItem(`handoora_progress_${DEMO_USER.id}`, JSON.stringify(initProgress))
        }

        return demoProfile
      } else {
        throw new Error('Password akun demo salah. Silakan periksa kembali.')
      }
    }

    // Cek apakah akun terdaftar di penyimpanan lokal/aplikasi
    const localUsers = getLocalRegisteredUsers()
    const localAccount = localUsers[cleanEmail]
    if (localAccount) {
      const incomingHash = await hashPasswordSecure(password, cleanEmail)
      if (localAccount.password_hash === incomingHash) {
        const currentCycle = getWeeklyCycleId()
        const profile = {
          ...localAccount.profile,
          weekly_cycle_id: currentCycle,
          avatar_url: localStorage.getItem(`handoora_avatar_${localAccount.id}`) || localAccount.profile?.avatar_url || null,
        }
        localStorage.setItem('handoora_user', JSON.stringify(profile))
        localStorage.setItem('handoora_local_active', 'true')
        return profile
      } else {
        throw new Error('Password salah. Silakan periksa kembali.')
      }
    }

    if (!isSupabaseConfigured || !supabase) {
      throw new Error('Email tidak ditemukan atau layanan belum aktif.')
    }

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

    // Sinkronkan perubahan nama/umur/avatar ke cache lokal agar langsung akurat di Profil & Admin
    try {
      const currentMeta = JSON.parse(localStorage.getItem('handoora_user') || 'null')
      if (currentMeta?.id === userId) {
        localStorage.setItem('handoora_user', JSON.stringify({ ...currentMeta, ...updates }))
      }

      const known = JSON.parse(localStorage.getItem('handoora_known_profiles') || '{}')
      if (known[userId] || userId) {
        known[userId] = {
          ...(known[userId] || {}),
          id: userId,
          ...updates,
          updated_at: new Date().toISOString(),
        }
        localStorage.setItem('handoora_known_profiles', JSON.stringify(known))
      }

      const regUsers = getLocalRegisteredUsers()
      Object.keys(regUsers).forEach((k) => {
        if (regUsers[k]?.id === userId) {
          regUsers[k] = {
            ...regUsers[k],
            nama: updates.nama ?? regUsers[k].nama,
            umur: updates.umur ?? regUsers[k].umur,
            profile: {
              ...(regUsers[k].profile || {}),
              ...updates,
            },
          }
        }
      })
      localStorage.setItem('handoora_registered_users', JSON.stringify(regUsers))
    } catch {
      // ignore
    }

    if (isDemoUser(userId)) {
      try {
        const currentMeta = JSON.parse(localStorage.getItem('handoora_user') || '{}')
        const updatedMeta = { ...currentMeta, ...updates }
        localStorage.setItem('handoora_user', JSON.stringify(updatedMeta))
        return updatedMeta
      } catch {
        return updates
      }
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
  async updatePassword(newPassword, userId = null) {
    if (!newPassword || newPassword.length < 6) {
      throw new Error('Password baru minimal 6 karakter.')
    }
    if (isDemoUser(userId)) {
      return true
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
    localStorage.removeItem('handoora_user')
    localStorage.removeItem('handoora_demo_active')
    localStorage.removeItem('handoora_local_active')
    if (supabase) {
      try {
        await supabase.auth.signOut()
      } catch {
        // ignore
      }
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

// Helper: Hitung jumlah hari beruntun aktual dari riwayat tanggal (streak_history)
function computeConsecutiveStreakFromHistory(streakHistory = [], todayStr = getLocalDateString()) {
  if (!Array.isArray(streakHistory) || streakHistory.length === 0) {
    return { count: 0, isActiveToday: false }
  }
  const historySet = new Set(streakHistory.filter((d) => typeof d === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(d)))
  if (historySet.size === 0) {
    return { count: 0, isActiveToday: false }
  }

  const shiftDate = (dateStr, deltaDays) => {
    const [y, m, d] = dateStr.split('-').map(Number)
    const dt = new Date(Date.UTC(y, m - 1, d + deltaDays))
    const yy = dt.getUTCFullYear()
    const mm = String(dt.getUTCMonth() + 1).padStart(2, '0')
    const dd = String(dt.getUTCDate()).padStart(2, '0')
    return `${yy}-${mm}-${dd}`
  }

  const isActiveToday = historySet.has(todayStr)
  let cursor = isActiveToday ? todayStr : shiftDate(todayStr, -1)

  if (!historySet.has(cursor)) {
    return { count: 0, isActiveToday: false }
  }

  let count = 0
  while (historySet.has(cursor)) {
    count += 1
    cursor = shiftDate(cursor, -1)
  }

  return { count, isActiveToday }
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
  const safeHistory = Array.isArray(streakHistory) ? streakHistory : []
  const historyStats = computeConsecutiveStreakFromHistory(safeHistory, todayStr)

  if (!lastActivityDate && historyStats.count === 0) {
    return {
      streak: 0,
      isStreakActiveToday: false,
      lastActivityDate: null,
      streakHistory: safeHistory,
    }
  }

  const diff = lastActivityDate ? getCalendarDayDiff(lastActivityDate, todayStr) : null

  if (diff === 0 || historyStats.isActiveToday) {
    // Hari ini sudah mengerjakan minimal 1 level -> api streak aktif & menyala
    return {
      streak: Math.max(1, numStreak, historyStats.count),
      isStreakActiveToday: true,
      lastActivityDate: lastActivityDate || todayStr,
      streakHistory: safeHistory,
    }
  }

  if (diff === 1 || historyStats.count > 0) {
    // Kemarin mengerjakan, hari ini belum -> streak kemarin masih tersimpan tapi api belum menyala hari ini
    return {
      streak: Math.max(numStreak, historyStats.count),
      isStreakActiveToday: false,
      lastActivityDate,
      streakHistory: safeHistory,
    }
  }

  // diff > 1 (atau < 0 karena jam berubah) -> kemarin tidak mengerjakan, streak putus & reset ke 0
  return {
    streak: 0,
    isStreakActiveToday: false,
    lastActivityDate,
    streakHistory: safeHistory,
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

  const historyStats = computeConsecutiveStreakFromHistory(history, todayStr)

  // Jika hari ini sudah tercatat penambahan streak, pertahankan streak hari ini (maks 1 per hari)
  if (lastDate === todayStr) {
    const resolvedStreak = Math.max(1, currentStreakVal, historyStats.count)
    return {
      ...currentProgress,
      streak: resolvedStreak,
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
    nextStreak = Math.max(currentStreakVal + 1, historyStats.count)
  } else {
    // Baru mulai / sempat putus kemarin, tetap validasi terhadap history beruntun
    nextStreak = Math.max(1, historyStats.count)
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
    if (isDemoUser(userId)) {
      return this.getProgress(userId)
    }

    if (!supabase || !userId) return { ...DEFAULT_PROGRESS }

    const currentCycle = getWeeklyCycleId()

    // Ambil cache lokal terkini jika ada, agar XP yang baru saja diperoleh tidak tertimpa data lama
    const cached = this.getProgress(userId)

    const { data, error } = await supabase
      .from('profiles')
      .select('xp, streak, gems, hearts, current_unit, completed_lessons, unlocked_islands')
      .eq('id', userId)
      .maybeSingle()

    if (!error && data) {
      const norm = normalizeInitialProgress(
        data.xp,
        data.completed_lessons,
        data.unlocked_islands,
        userId
      )

      const resetSyncKey = `handoora_xp_reset_synced_${userId}`
      const hasLocalProgress = Boolean(localStorage.getItem(`handoora_progress_${userId}`))
      const isPendingResetSync =
        localStorage.getItem(XP_RESET_VERSION_KEY) === 'done' &&
        !localStorage.getItem(resetSyncKey) &&
        hasLocalProgress &&
        Number(cached?.xp) === 0

      // Ambil XP tertinggi antara database dan cache lokal, kecuali jika baru saja direset ke 0
      const resolvedXp = isPendingResetSync
        ? 0
        : Math.max(norm.xp, Number(cached?.xp) || 0)

      // Hitung streak real-time
      const streakState = calculateCurrentStreak(
        Math.max(Number(data.streak) || 0, Number(cached?.streak) || 0),
        data.last_activity_date || cached?.last_activity_date,
        data.streak_history || cached?.streak_history
      )

      const resolvedCompleted =
        Array.isArray(cached?.completedIslands) && cached.completedIslands.length > (data.completed_lessons || []).length
          ? cached.completedIslands
          : Array.isArray(data.completed_lessons) && data.completed_lessons.length > 0
            ? data.completed_lessons
            : (cached?.completedIslands || [])

      const resolvedUnlocked =
        Array.isArray(cached?.unlockedIslands) && cached.unlockedIslands.length > norm.unlockedIslands.length
          ? cached.unlockedIslands
          : norm.unlockedIslands

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
        completedIslands: resolvedCompleted,
        unlockedIslands: resolvedUnlocked,
        dailyQuests: {
          xpEarned: Math.min(20, resolvedXp),
          xpEarnedToday: Math.min(50, resolvedXp),
          highScoreLessons: resolvedCompleted.length,
        },
      }

      localStorage.setItem(`handoora_progress_${userId}`, JSON.stringify(result))

      // Jika ada perbedaan antara database & cache lokal (termasuk setelah reset, perolehan XP, atau pemulihan streak), sinkronkan balik ke database
      if (
        isPendingResetSync ||
        norm.wasNormalized ||
        resolvedXp !== Number(data.xp ?? 0) ||
        streakState.streak !== Number(data.streak ?? 0)
      ) {
        localStorage.setItem(`handoora_lvl1_init_${userId}`, 'true')
        localStorage.setItem(resetSyncKey, 'done')
        await this.saveProgressToSupabase(userId, result)
      } else {
        localStorage.setItem(resetSyncKey, 'done')
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

    const computedCurrentUnit =
      progress.current_unit ||
      Math.max(1, ...(Array.isArray(updatedProgress.unlockedIslands) && updatedProgress.unlockedIslands.length > 0 ? updatedProgress.unlockedIslands : [1]))

    if (userId) {
      localStorage.setItem(`handoora_lvl1_init_${userId}`, 'true')
      localStorage.setItem(`handoora_progress_${userId}`, JSON.stringify(updatedProgress))

      // Sinkronkan juga ke handoora_user jika user ini sedang aktif
      try {
        const currentMeta = JSON.parse(localStorage.getItem('handoora_user') || 'null')
        if (currentMeta && currentMeta.id === userId) {
          currentMeta.xp = updatedProgress.xp
          currentMeta.weekly_xp = finalWeeklyXp
          currentMeta.current_unit = computedCurrentUnit
          localStorage.setItem('handoora_user', JSON.stringify(currentMeta))
        }
      } catch {
        // ignore
      }

      // Simpan juga ke known local profiles untuk sinkronisasi fallback multi-akun
      try {
        const knownProfiles = JSON.parse(localStorage.getItem('handoora_known_profiles') || '{}')
        const currentMeta = JSON.parse(localStorage.getItem('handoora_user') || '{}')
        knownProfiles[userId] = {
          id: userId,
          nama: (currentMeta.id === userId ? currentMeta.nama : null) || knownProfiles[userId]?.nama || progress.nama || 'Sobat Handoora',
          email: (currentMeta.id === userId ? currentMeta.email : null) || knownProfiles[userId]?.email || '',
          xp: updatedProgress.xp,
          weekly_xp: finalWeeklyXp,
          weekly_cycle_id: currentCycle,
          current_unit: computedCurrentUnit,
          avatar_url: (currentMeta.id === userId ? currentMeta.avatar_url : null) || knownProfiles[userId]?.avatar_url || localStorage.getItem(`handoora_avatar_${userId}`) || null,
          updated_at: new Date().toISOString()
        }
        localStorage.setItem('handoora_known_profiles', JSON.stringify(knownProfiles))
      } catch {
        // ignore
      }
    }

    if (isDemoUser(userId)) {
      return updatedProgress
    }

    if (!supabase || !userId) return updatedProgress

    const lastDate = updatedProgress.last_activity_date || updatedProgress.lastActivityDate || null
    const history = updatedProgress.streak_history || updatedProgress.streakHistory || []

    try {
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
    } catch {
      // ignore auth metadata error if session is local-only
    }

    // Update langsung ke tabel profiles menggunakan kolom yang valid pada schema
    const profilePayload = {
      xp: updatedProgress.xp,
      streak: updatedProgress.streak,
      gems: updatedProgress.gems,
      hearts: updatedProgress.hearts,
      current_unit: computedCurrentUnit,
      completed_lessons: updatedProgress.completedIslands,
      unlocked_islands: updatedProgress.unlockedIslands,
      updated_at: new Date().toISOString(),
    }

    try {
      const { data: updatedRows, error: updateErr } = await supabase
        .from('profiles')
        .update(profilePayload)
        .eq('id', userId)
        .select('id')

      // Jika belum ada baris di tabel profiles (0 row ter-update), lakukan upsert dengan nama & email wajib
      if (updateErr || !Array.isArray(updatedRows) || updatedRows.length === 0) {
        const currentMeta = JSON.parse(localStorage.getItem('handoora_user') || '{}')
        const { data: authData } = await supabase.auth.getUser()
        const authUser = authData?.user
        const resolvedEmail =
          (currentMeta.id === userId ? currentMeta.email : null) ||
          authUser?.email ||
          `${userId}@handoora.local`
        const resolvedNama =
          progress.nama ||
          (currentMeta.id === userId ? currentMeta.nama : null) ||
          authUser?.user_metadata?.nama ||
          authUser?.user_metadata?.full_name ||
          resolvedEmail.split('@')[0] ||
          'Sobat Handoora'

        await supabase
          .from('profiles')
          .upsert(
            {
              id: userId,
              nama: resolvedNama,
              email: resolvedEmail,
              ...profilePayload,
            },
            { onConflict: 'id' }
          )
      }
    } catch {
      // ignore
    }

    return updatedProgress
  },

  // Mendapatkan daftar leaderboard peringkat aktual yang 100% sinkron dengan data Admin (/adminhandoora)
  async getLeaderboard(limit = 10) {
    try {
      const users = await adminService.listUsers()
      return users
        .filter((u) => u.email?.toLowerCase() !== ADMIN_EMAIL)
        .map((u) => ({
          id: u.id,
          nama: u.nama || (u.email ? u.email.split('@')[0] : 'Sobat Handoora'),
          email: u.email,
          xp: Number(u.xp) || 0,
          weekly_xp: Number(u.xp) || 0,
          current_unit: Number(u.current_unit) || 1,
          avatar_url: u.avatar_url || localStorage.getItem(`handoora_avatar_${u.id}`) || null,
          status: u.id === DEMO_USER.id ? '🔥' : '🌟',
        }))
        .sort((a, b) => b.xp - a.xp)
        .slice(0, limit)
    } catch (err) {
      console.warn('Error fetching leaderboard:', err)
      return []
    }
  },
}

// ============================================================
// Layanan Khusus Admin (/adminhandoora) untuk CRUD Data User
// ============================================================
function getDeletedAdminUserIds() {
  try {
    return JSON.parse(localStorage.getItem('handoora_admin_deleted_ids') || '[]')
  } catch {
    return []
  }
}

function addDeletedAdminUserId(userId) {
  try {
    const list = getDeletedAdminUserIds()
    if (!list.includes(userId)) {
      list.push(userId)
      localStorage.setItem('handoora_admin_deleted_ids', JSON.stringify(list))
    }
  } catch {
    // ignore
  }
}

function removeDeletedAdminUserId(userId) {
  try {
    const list = getDeletedAdminUserIds().filter((id) => id !== userId)
    localStorage.setItem('handoora_admin_deleted_ids', JSON.stringify(list))
  } catch {
    // ignore
  }
}

export const adminService = {
  isAdminAuthenticated() {
    try {
      const raw = localStorage.getItem(ADMIN_SESSION_KEY)
      if (!raw) return false
      const parsed = JSON.parse(raw)
      return Boolean(parsed?.active && parsed?.email?.toLowerCase() === ADMIN_EMAIL)
    } catch {
      return false
    }
  },

  async loginAdmin({ email, password }) {
    const cleanEmail = String(email || '').trim().toLowerCase()
    if (cleanEmail !== ADMIN_EMAIL) {
      throw new Error('Akses ditolak. Hanya akun admin yang dapat masuk ke halaman ini.')
    }

    const [incomingHash, expectedHash] = await Promise.all([
      hashPasswordSecure(String(password || ''), ADMIN_EMAIL),
      ADMIN_PASSWORD_HASH_PROMISE,
    ])

    if (incomingHash !== expectedHash) {
      throw new Error('Password admin salah. Silakan periksa kembali.')
    }

    const sessionPayload = {
      email: ADMIN_EMAIL,
      role: 'admin',
      active: true,
      loggedInAt: new Date().toISOString(),
    }
    localStorage.setItem(ADMIN_SESSION_KEY, JSON.stringify(sessionPayload))

    // Jika akun admin@gmail.com juga terdaftar di Supabase Auth, coba sinkronkan sesi
    if (isSupabaseConfigured && supabase) {
      try {
        await supabase.auth.signInWithPassword({
          email: ADMIN_EMAIL,
          password: String(password || ''),
        })
      } catch {
        // Tetap izinkan sesi admin lokal jika belum ada di Supabase Auth
      }
    }

    return sessionPayload
  },

  logoutAdmin() {
    localStorage.removeItem(ADMIN_SESSION_KEY)
  },

  async listUsers() {
    const userMap = new Map()
    const deletedIds = new Set(getDeletedAdminUserIds())

    // 1. Akun Demo Pengujian (Juri)
    if (!deletedIds.has(DEMO_USER.id)) {
      const hasDemoProgress = Boolean(localStorage.getItem(`handoora_progress_${DEMO_USER.id}`))
      const demoProg = hasDemoProgress ? progressService.getProgress(DEMO_USER.id) : null
      userMap.set(DEMO_USER.id, {
        id: DEMO_USER.id,
        nama: DEMO_USER.nama,
        email: DEMO_USER.email,
        umur: DEMO_USER.umur,
        auth_provider: 'demo',
        avatar_url: localStorage.getItem(`handoora_avatar_${DEMO_USER.id}`) || null,
        xp: Number(demoProg ? demoProg.xp : DEMO_USER.xp) || 0,
        streak: Number(demoProg ? demoProg.streak : DEMO_USER.streak) || 0,
        gems: Number(demoProg ? demoProg.gems : DEMO_USER.gems) || 0,
        hearts: Number(demoProg ? demoProg.hearts : DEMO_USER.hearts) || 5,
        current_unit: Number(demoProg?.unlockedIslands?.slice(-1)[0] || DEMO_USER.current_unit) || 2,
        completed_lessons: Array.isArray(demoProg?.completedIslands) ? demoProg.completedIslands : DEMO_USER.completed_lessons,
        unlocked_islands: Array.isArray(demoProg?.unlockedIslands) ? demoProg.unlockedIslands : DEMO_USER.unlocked_islands,
        updated_at: new Date().toISOString(),
        source: 'Demo',
      })
    }

    // 2. Akun dari local registry
    const localUsers = getLocalRegisteredUsers()
    Object.values(localUsers).forEach((reg) => {
      if (!reg?.id || deletedIds.has(reg.id)) return
      if (reg.email?.toLowerCase() === ADMIN_EMAIL) return
      const prog = progressService.getProgress(reg.id)
      const p = reg.profile || {}
      const norm = normalizeInitialProgress(
        prog.xp ?? p.xp ?? 0,
        Array.isArray(prog.completedIslands) ? prog.completedIslands : p.completed_lessons,
        Array.isArray(prog.unlockedIslands) ? prog.unlockedIslands : p.unlocked_islands,
        reg.id
      )
      userMap.set(reg.id, {
        id: reg.id,
        nama: reg.nama || p.nama || 'Sobat Handoora',
        email: reg.email,
        umur: reg.umur ?? p.umur ?? null,
        auth_provider: p.auth_provider || 'email',
        avatar_url: localStorage.getItem(`handoora_avatar_${reg.id}`) || p.avatar_url || null,
        xp: Number(norm.xp) || 0,
        streak: Number(prog.streak ?? p.streak ?? 0) || 0,
        gems: Number(prog.gems ?? p.gems ?? 500) || 0,
        hearts: Number(prog.hearts ?? p.hearts ?? 5),
        current_unit: Number(norm.unlockedIslands?.slice(-1)[0] || p.current_unit || 1) || 1,
        completed_lessons: norm.completedIslands,
        unlocked_islands: norm.unlockedIslands,
        updated_at: p.updated_at || reg.created_at || new Date().toISOString(),
        source: 'Lokal',
      })
    })

    // 3. Known profiles lokal (gabungkan umur & data terbaru ke entri yang sudah ada)
    try {
      const knownProfiles = JSON.parse(localStorage.getItem('handoora_known_profiles') || '{}')
      Object.values(knownProfiles).forEach((kp) => {
        if (!kp?.id || deletedIds.has(kp.id)) return
        if (kp.email?.toLowerCase() === ADMIN_EMAIL) return
        const prog = progressService.getProgress(kp.id)
        const existing = userMap.get(kp.id)
        const norm = normalizeInitialProgress(
          kp.xp ?? existing?.xp ?? prog.xp ?? 0,
          existing?.completed_lessons || prog.completedIslands,
          existing?.unlocked_islands || prog.unlockedIslands,
          kp.id
        )
        userMap.set(kp.id, {
          id: kp.id,
          nama: kp.nama || existing?.nama || (kp.email ? kp.email.split('@')[0] : 'Sobat Handoora'),
          email: kp.email || existing?.email || '-',
          umur: kp.umur ?? existing?.umur ?? null,
          auth_provider: kp.auth_provider || existing?.auth_provider || 'email',
          avatar_url: kp.avatar_url || existing?.avatar_url || localStorage.getItem(`handoora_avatar_${kp.id}`) || null,
          xp: Number(norm.xp) || 0,
          streak: Number(kp.streak ?? existing?.streak ?? prog.streak ?? 0) || 0,
          gems: Number(kp.gems ?? existing?.gems ?? prog.gems ?? 500) || 0,
          hearts: Number(kp.hearts ?? existing?.hearts ?? prog.hearts ?? 5),
          current_unit: Number(kp.current_unit ?? existing?.current_unit ?? norm.unlockedIslands?.slice(-1)[0] ?? 1) || 1,
          completed_lessons: norm.completedIslands,
          unlocked_islands: norm.unlockedIslands,
          updated_at: kp.updated_at || existing?.updated_at || new Date().toISOString(),
          source: existing?.source || 'Lokal',
        })
      })
    } catch {
      // ignore
    }

    // 3b. Akun yang sedang aktif di handoora_user (selalu memiliki profil & progres terkini di browser ini)
    try {
      const activeUser = JSON.parse(localStorage.getItem('handoora_user') || 'null')
      if (activeUser?.id && !deletedIds.has(activeUser.id) && activeUser.email?.toLowerCase() !== ADMIN_EMAIL) {
        const prog = progressService.getProgress(activeUser.id)
        const existing = userMap.get(activeUser.id)
        const activeXp = prog.xp !== undefined ? prog.xp : (activeUser.xp ?? existing?.xp ?? 0)
        const norm = normalizeInitialProgress(
          activeXp,
          prog.completedIslands || activeUser.completed_lessons || existing?.completed_lessons,
          prog.unlockedIslands || activeUser.unlocked_islands || existing?.unlocked_islands,
          activeUser.id
        )
        userMap.set(activeUser.id, {
          id: activeUser.id,
          nama: activeUser.nama || existing?.nama || 'Sobat Handoora',
          email: activeUser.email || existing?.email || '-',
          umur: activeUser.umur ?? existing?.umur ?? null,
          auth_provider: activeUser.auth_provider || existing?.auth_provider || 'email',
          avatar_url: activeUser.avatar_url || existing?.avatar_url || localStorage.getItem(`handoora_avatar_${activeUser.id}`) || null,
          xp: Number(norm.xp) || 0,
          streak: Number(prog.streak ?? activeUser.streak ?? existing?.streak ?? 0) || 0,
          gems: Number(prog.gems ?? activeUser.gems ?? existing?.gems ?? 500) || 0,
          hearts: Number(prog.hearts ?? activeUser.hearts ?? existing?.hearts ?? 5),
          current_unit: Number(norm.unlockedIslands?.slice(-1)[0] || activeUser.current_unit || existing?.current_unit || 1) || 1,
          completed_lessons: norm.completedIslands,
          unlocked_islands: norm.unlockedIslands,
          updated_at: new Date().toISOString(),
          source: existing?.source || (activeUser.id === DEMO_USER.id ? 'Demo' : 'Lokal'),
        })
      }
    } catch {
      // ignore
    }

    // 4. Data aktual dari tabel profiles Supabase (authoritative remote source)
    if (isSupabaseConfigured && supabase) {
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('id, nama, umur, email, auth_provider, avatar_url, xp, streak, gems, hearts, current_unit, completed_lessons, unlocked_islands, updated_at')
          .order('updated_at', { ascending: false })

        if (!error && Array.isArray(data)) {
          data.forEach((row) => {
            if (!row?.id || deletedIds.has(row.id)) return
            if (row.email?.toLowerCase() === ADMIN_EMAIL) return

            // Cocokkan berdasarkan ID atau email agar tidak ada duplikat dengan ID lokal lama
            let existing = userMap.get(row.id)
            if (!existing && row.email) {
              for (const [keyId, val] of userMap.entries()) {
                if (val.email?.toLowerCase() === row.email.toLowerCase()) {
                  existing = val
                  userMap.delete(keyId)
                  break
                }
              }
            }

            const norm = normalizeInitialProgress(
              row.xp ?? existing?.xp ?? 0,
              Array.isArray(row.completed_lessons) ? row.completed_lessons : existing?.completed_lessons,
              Array.isArray(row.unlocked_islands) ? row.unlocked_islands : existing?.unlocked_islands,
              row.id
            )

            userMap.set(row.id, {
              id: row.id,
              nama: row.nama || existing?.nama || (row.email ? row.email.split('@')[0] : 'Sobat Handoora'),
              email: row.email || existing?.email || '-',
              umur: row.umur ?? existing?.umur ?? null,
              auth_provider: row.auth_provider || existing?.auth_provider || 'email',
              avatar_url: row.avatar_url || existing?.avatar_url || localStorage.getItem(`handoora_avatar_${row.id}`) || null,
              xp: Number(norm.xp) || 0,
              streak: Number(row.streak ?? existing?.streak ?? 0) || 0,
              gems: Number(row.gems ?? existing?.gems ?? 500) || 0,
              hearts: Number(row.hearts ?? existing?.hearts ?? 5),
              current_unit: Number(row.current_unit ?? norm.unlockedIslands?.slice(-1)[0] ?? existing?.current_unit ?? 1) || 1,
              completed_lessons: norm.completedIslands,
              unlocked_islands: norm.unlockedIslands,
              updated_at: row.updated_at || existing?.updated_at || new Date().toISOString(),
              source: existing?.source === 'Demo' ? 'Demo' : 'Supabase',
            })
          })
        }
      } catch (err) {
        console.warn('Gagal mengambil daftar user dari Supabase:', err)
      }
    }

    return Array.from(userMap.values()).sort((a, b) => (b.xp || 0) - (a.xp || 0))
  },

  async createUser({
    nama,
    email,
    umur,
    password,
    xp = 0,
    streak = 0,
    gems = 500,
    hearts = 5,
    current_unit = 1,
    completed_lessons = [],
    unlocked_islands = [1],
  }) {
    const cleanNama = String(nama || '').trim()
    const cleanEmail = String(email || '').trim().toLowerCase()
    const parsedUmur = umur !== '' && umur !== null && umur !== undefined ? parseInt(umur, 10) : null

    if (!cleanNama) throw new Error('Nama lengkap wajib diisi.')
    if (!cleanEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) {
      throw new Error('Format email tidak valid.')
    }
    if (cleanEmail === ADMIN_EMAIL) {
      throw new Error('Email admin tidak dapat dibuat sebagai user biasa.')
    }
    if (!password || String(password).length < 6) {
      throw new Error('Password minimal 6 karakter.')
    }

    const existingUsers = await this.listUsers()
    if (existingUsers.some((u) => u.email?.toLowerCase() === cleanEmail)) {
      throw new Error('Email sudah terdaftar di aplikasi Handoora.')
    }

    const passwordHash = await hashPasswordSecure(password, cleanEmail)
    let userId = null
    let remoteSynced = false
    let remoteWarning = null

    if (isSupabaseConfigured && supabase) {
      try {
        // Gunakan client terpisah dengan persistSession: false agar sesi admin/user aktif tidak tertimpa
        const url = import.meta.env.VITE_SUPABASE_URL
        const key = import.meta.env.VITE_SUPABASE_ANON_KEY
        const ephemeralClient = createClient(url, key, {
          auth: { persistSession: false, autoRefreshToken: false },
        })
        const { data: signUpData, error: signUpErr } = await ephemeralClient.auth.signUp({
          email: cleanEmail,
          password,
          options: {
            data: {
              nama: cleanNama,
              full_name: cleanNama,
              umur: parsedUmur,
              password_hash: passwordHash,
              auth_provider: 'email',
            },
          },
        })
        if (!signUpErr && signUpData?.user?.id) {
          userId = signUpData.user.id
        }
      } catch {
        // fallback ke ID lokal
      }
    }

    if (!userId) {
      userId = (typeof crypto !== 'undefined' && crypto.randomUUID)
        ? crypto.randomUUID()
        : `user_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`
    }

    removeDeletedAdminUserId(userId)

    const cleanXp = Math.max(0, Number(xp) || 0)
    const cleanStreak = Math.max(0, Number(streak) || 0)
    const cleanGems = Math.max(0, Number(gems) || 0)
    const cleanHearts = Math.min(5, Math.max(0, Number(hearts) || 5))
    const cleanUnit = Math.min(6, Math.max(1, Number(current_unit) || 1))
    const cleanCompleted = Array.isArray(completed_lessons) ? completed_lessons : []
    const cleanUnlocked = Array.isArray(unlocked_islands) && unlocked_islands.length > 0
      ? (unlocked_islands.includes(1) ? unlocked_islands : [1, ...unlocked_islands])
      : [1]

    const currentCycle = getWeeklyCycleId()
    const newProfile = {
      id: userId,
      nama: cleanNama,
      umur: parsedUmur,
      email: cleanEmail,
      password_hash: passwordHash,
      auth_provider: 'email',
      avatar_url: null,
      xp: cleanXp,
      weekly_xp: cleanXp,
      weekly_cycle_id: currentCycle,
      streak: cleanStreak,
      gems: cleanGems,
      hearts: cleanHearts,
      current_unit: cleanUnit,
      completed_lessons: cleanCompleted,
      unlocked_islands: cleanUnlocked,
      updated_at: new Date().toISOString(),
    }

    saveLocalRegisteredUser({
      id: userId,
      nama: cleanNama,
      umur: parsedUmur,
      email: cleanEmail,
      password_hash: passwordHash,
      profile: newProfile,
    })

    localStorage.setItem(`handoora_lvl1_init_${userId}`, 'true')
    localStorage.setItem(`handoora_progress_${userId}`, JSON.stringify({
      xp: cleanXp,
      weekly_xp: cleanXp,
      weekly_cycle_id: currentCycle,
      streak: cleanStreak,
      isStreakActiveToday: cleanStreak > 0,
      last_activity_date: cleanStreak > 0 ? getLocalDateString() : null,
      streak_history: cleanStreak > 0 ? [getLocalDateString()] : [],
      gems: cleanGems,
      hearts: cleanHearts,
      completedIslands: cleanCompleted,
      unlockedIslands: cleanUnlocked,
      dailyQuests: {
        xpEarned: Math.min(20, cleanXp),
        xpEarnedToday: Math.min(50, cleanXp),
        highScoreLessons: cleanCompleted.length,
      },
    }))

    if (isSupabaseConfigured && supabase) {
      try {
        const { error: upsertErr } = await supabase.from('profiles').upsert({
          id: userId,
          nama: cleanNama,
          umur: parsedUmur,
          email: cleanEmail,
          password_hash: passwordHash,
          auth_provider: 'email',
          avatar_url: null,
          xp: cleanXp,
          streak: cleanStreak,
          gems: cleanGems,
          hearts: cleanHearts,
          current_unit: cleanUnit,
          completed_lessons: cleanCompleted,
          unlocked_islands: cleanUnlocked,
          updated_at: new Date().toISOString(),
        }, { onConflict: 'id' })

        if (!upsertErr) {
          remoteSynced = true
        } else {
          remoteWarning = upsertErr.message
        }
      } catch (err) {
        remoteWarning = err.message
      }
    }

    return { user: newProfile, remoteSynced, remoteWarning }
  },

  async updateUser(userId, updates) {
    const cleanNama = String(updates.nama || '').trim()
    const cleanEmail = String(updates.email || '').trim().toLowerCase()
    const parsedUmur = updates.umur !== '' && updates.umur !== null && updates.umur !== undefined
      ? parseInt(updates.umur, 10)
      : null

    if (!cleanNama) throw new Error('Nama lengkap wajib diisi.')
    if (!cleanEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) {
      throw new Error('Format email tidak valid.')
    }

    const cleanXp = Math.max(0, Number(updates.xp) || 0)
    const cleanStreak = Math.max(0, Number(updates.streak) || 0)
    const cleanGems = Math.max(0, Number(updates.gems) || 0)
    const cleanHearts = Math.min(5, Math.max(0, Number(updates.hearts) || 0))
    const cleanUnit = Math.min(6, Math.max(1, Number(updates.current_unit) || 1))
    const cleanCompleted = Array.isArray(updates.completed_lessons) ? updates.completed_lessons : []
    const cleanUnlocked = Array.isArray(updates.unlocked_islands) && updates.unlocked_islands.length > 0
      ? (updates.unlocked_islands.includes(1) ? updates.unlocked_islands : [1, ...updates.unlocked_islands])
      : [1]

    const newPasswordHash = updates.password && String(updates.password).trim().length >= 6
      ? await hashPasswordSecure(String(updates.password).trim(), cleanEmail)
      : null

    // 1. Update handoora_registered_users
    const registeredUsers = getLocalRegisteredUsers()
    let matchedKey = null
    Object.keys(registeredUsers).forEach((k) => {
      if (registeredUsers[k]?.id === userId || k.toLowerCase() === cleanEmail) {
        matchedKey = k
      }
    })
    if (matchedKey) {
      const oldRecord = registeredUsers[matchedKey]
      if (matchedKey.toLowerCase() !== cleanEmail) {
        delete registeredUsers[matchedKey]
      }
      registeredUsers[cleanEmail] = {
        ...oldRecord,
        id: userId,
        nama: cleanNama,
        umur: parsedUmur,
        email: cleanEmail,
        password_hash: newPasswordHash || oldRecord.password_hash,
        profile: {
          ...(oldRecord.profile || {}),
          id: userId,
          nama: cleanNama,
          umur: parsedUmur,
          email: cleanEmail,
          ...(newPasswordHash ? { password_hash: newPasswordHash } : {}),
          xp: cleanXp,
          weekly_xp: cleanXp,
          streak: cleanStreak,
          gems: cleanGems,
          hearts: cleanHearts,
          current_unit: cleanUnit,
          completed_lessons: cleanCompleted,
          unlocked_islands: cleanUnlocked,
          updated_at: new Date().toISOString(),
        },
      }
      localStorage.setItem('handoora_registered_users', JSON.stringify(registeredUsers))
    }

    // 2. Update handoora_known_profiles
    try {
      const known = JSON.parse(localStorage.getItem('handoora_known_profiles') || '{}')
      known[userId] = {
        ...(known[userId] || {}),
        id: userId,
        nama: cleanNama,
        umur: parsedUmur,
        email: cleanEmail,
        xp: cleanXp,
        weekly_xp: cleanXp,
        streak: cleanStreak,
        gems: cleanGems,
        hearts: cleanHearts,
        current_unit: cleanUnit,
        updated_at: new Date().toISOString(),
      }
      localStorage.setItem('handoora_known_profiles', JSON.stringify(known))
    } catch {
      // ignore
    }

    // 3. Update handoora_progress_${userId}
    const existingProg = progressService.getProgress(userId)
    localStorage.setItem(`handoora_progress_${userId}`, JSON.stringify({
      ...existingProg,
      xp: cleanXp,
      weekly_xp: cleanXp,
      streak: cleanStreak,
      gems: cleanGems,
      hearts: cleanHearts,
      completedIslands: cleanCompleted,
      unlockedIslands: cleanUnlocked,
      dailyQuests: {
        ...(existingProg.dailyQuests || {}),
        xpEarned: Math.min(20, cleanXp),
        xpEarnedToday: Math.min(50, cleanXp),
        highScoreLessons: cleanCompleted.length,
      },
    }))

    // 4. Update handoora_user jika user yang sedang aktif sama
    try {
      const activeUser = JSON.parse(localStorage.getItem('handoora_user') || 'null')
      if (activeUser?.id === userId) {
        localStorage.setItem('handoora_user', JSON.stringify({
          ...activeUser,
          nama: cleanNama,
          umur: parsedUmur,
          email: cleanEmail,
          xp: cleanXp,
          weekly_xp: cleanXp,
          streak: cleanStreak,
          gems: cleanGems,
          hearts: cleanHearts,
          current_unit: cleanUnit,
          completed_lessons: cleanCompleted,
          unlocked_islands: cleanUnlocked,
        }))
      }
    } catch {
      // ignore
    }

    // 5. Update ke Supabase profiles
    let remoteSynced = false
    let remoteWarning = null
    if (isSupabaseConfigured && supabase && userId !== DEMO_USER.id) {
      try {
        const updatePayload = {
          nama: cleanNama,
          umur: parsedUmur,
          email: cleanEmail,
          xp: cleanXp,
          streak: cleanStreak,
          gems: cleanGems,
          hearts: cleanHearts,
          current_unit: cleanUnit,
          completed_lessons: cleanCompleted,
          unlocked_islands: cleanUnlocked,
          updated_at: new Date().toISOString(),
        }
        if (newPasswordHash) {
          updatePayload.password_hash = newPasswordHash
        }

        const { data: updatedRows, error: updateErr } = await supabase
          .from('profiles')
          .update(updatePayload)
          .eq('id', userId)
          .select('id')

        if (!updateErr && Array.isArray(updatedRows) && updatedRows.length > 0) {
          remoteSynced = true
        } else {
          remoteWarning = updateErr?.message || 'Kebijakan RLS Supabase membatasi update profil user lain.'
        }
      } catch (err) {
        remoteWarning = err.message
      }
    }

    return {
      user: {
        id: userId,
        nama: cleanNama,
        umur: parsedUmur,
        email: cleanEmail,
        xp: cleanXp,
        streak: cleanStreak,
        gems: cleanGems,
        hearts: cleanHearts,
        current_unit: cleanUnit,
        completed_lessons: cleanCompleted,
        unlocked_islands: cleanUnlocked,
      },
      remoteSynced,
      remoteWarning,
    }
  },

  async deleteUser(userId) {
    if (!userId) throw new Error('ID user tidak valid.')

    // 1. Hapus dari handoora_registered_users
    const registeredUsers = getLocalRegisteredUsers()
    Object.keys(registeredUsers).forEach((emailKey) => {
      if (registeredUsers[emailKey]?.id === userId) {
        delete registeredUsers[emailKey]
      }
    })
    localStorage.setItem('handoora_registered_users', JSON.stringify(registeredUsers))

    // 2. Hapus dari handoora_known_profiles
    try {
      const known = JSON.parse(localStorage.getItem('handoora_known_profiles') || '{}')
      if (known[userId]) {
        delete known[userId]
        localStorage.setItem('handoora_known_profiles', JSON.stringify(known))
      }
    } catch {
      // ignore
    }

    // 3. Bersihkan progress, avatar, dan flag user
    localStorage.removeItem(`handoora_progress_${userId}`)
    localStorage.removeItem(`handoora_avatar_${userId}`)
    localStorage.removeItem(`handoora_lvl1_init_${userId}`)
    localStorage.removeItem(`handoora_xp_reset_synced_${userId}`)
    addDeletedAdminUserId(userId)

    // 4. Hapus dari Supabase profiles
    let remoteDeleted = false
    let remoteWarning = null
    if (isSupabaseConfigured && supabase && userId !== DEMO_USER.id) {
      try {
        const { data: deletedRows, error: delErr } = await supabase
          .from('profiles')
          .delete()
          .eq('id', userId)
          .select('id')

        if (!delErr && Array.isArray(deletedRows) && deletedRows.length > 0) {
          remoteDeleted = true
        } else {
          remoteWarning = delErr?.message || 'Kebijakan RLS Supabase membatasi penghapusan profil user lain.'
        }
      } catch (err) {
        remoteWarning = err.message
      }
    }

    return { remoteDeleted, remoteWarning }
  },
}
