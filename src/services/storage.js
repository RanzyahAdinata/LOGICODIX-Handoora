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
    streak: 1,
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

export const authService = {
  // 1. REGISTER PENGGUNA BARU (MULAI DARI LEVEL 1)
  async register({ nama, umur, email, password }) {
    if (!isSupabaseConfigured || !supabase) {
      throw new Error('Layanan autentikasi belum aktif.')
    }

    const cleanNama = nama.trim()
    const cleanEmail = email.trim().toLowerCase()
    const parsedUmur = parseInt(umur, 10)
    const passwordHash = await hashPasswordSecure(password, cleanEmail)

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
          streak: 1,
          gems: 500,
          hearts: 5,
          completed_lessons: [],
          unlocked_islands: [1],
        },
      },
    })

    if (error) {
      if (error.message?.toLowerCase().includes('already registered')) {
        throw new Error('Email sudah terdaftar. Silakan masuk melalui halaman Login.')
      }
      throw new Error(error.message)
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
    await supabase.auth.updateUser({
      data: metaUpdates,
    })

    const { data: updatedRow } = await supabase
      .from('profiles')
      .update({
        ...updates,
        updated_at: new Date().toISOString(),
      })
      .eq('id', userId)
      .select('*')
      .maybeSingle()

    return (
      updatedRow || {
        ...updates,
      }
    )
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

// Semua pengguna mulai dari Level 1 (Pulau 1 terbuka, belum ada pulau yang selesai)
const DEFAULT_PROGRESS = {
  xp: 0,
  streak: 1,
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
    if (userId) {
      const cached = localStorage.getItem(`handoora_progress_${userId}`)
      if (cached) {
        try {
          return JSON.parse(cached)
        } catch {
          // ignore
        }
      }
    }
    return { ...DEFAULT_PROGRESS }
  },

  resetProgress(userId) {
    const fresh = {
      ...DEFAULT_PROGRESS,
      xp: 0,
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

      const result = {
        xp: norm.xp,
        streak: data.streak ?? 1,
        gems: data.gems ?? 500,
        hearts: data.hearts ?? 5,
        completedIslands: norm.completedIslands,
        unlockedIslands: norm.unlockedIslands,
        dailyQuests: {
          xpEarned: Math.min(20, norm.xp),
          xpEarnedToday: Math.min(50, norm.xp),
          highScoreLessons: norm.completedIslands.length,
        },
      }

      localStorage.setItem(`handoora_progress_${userId}`, JSON.stringify(result))

      // Jika akun masih memiliki seed lama ([1, 2]), perbarui otomatis agar mulai dari Level 1
      if (norm.wasNormalized) {
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

    const fallback = {
      xp: norm.xp,
      streak: meta.streak ?? 1,
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
    if (userId) {
      localStorage.setItem(`handoora_lvl1_init_${userId}`, 'true')
      localStorage.setItem(`handoora_progress_${userId}`, JSON.stringify(progress))
    }

    if (!supabase || !userId) return progress

    await supabase.auth.updateUser({
      data: {
        xp: progress.xp,
        streak: progress.streak,
        gems: progress.gems,
        hearts: progress.hearts,
        completed_lessons: progress.completedIslands,
        unlocked_islands: progress.unlockedIslands,
      },
    })

    await supabase
      .from('profiles')
      .update({
        xp: progress.xp,
        streak: progress.streak,
        gems: progress.gems,
        hearts: progress.hearts,
        completed_lessons: progress.completedIslands,
        unlocked_islands: progress.unlockedIslands,
        updated_at: new Date().toISOString(),
      })
      .eq('id', userId)

    return progress
  },
}
