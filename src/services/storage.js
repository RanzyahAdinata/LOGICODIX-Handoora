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

// Cek apakah provider Google OAuth di Supabase Dashboard sudah di-enable
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

// Helper: Ambil atau buat baris pengguna di tabel public.profiles Supabase
export async function fetchOrCreateSupabaseProfile(authUser, extraData = {}) {
  if (!supabase || !authUser) return null

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
    authUser.user_metadata?.avatar_url ||
    authUser.user_metadata?.picture ||
    null

  // 1. Coba ambil profil dari tabel public.profiles di Supabase
  const { data: existingProfile, error: selectErr } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', authUser.id)
    .maybeSingle()

  if (!selectErr && existingProfile) {
    return existingProfile
  }

  // 2. Jika belum ada baris di public.profiles, buat baris baru di Supabase
  const newProfileRow = {
    id: authUser.id,
    nama: defaultNama,
    umur: defaultUmur,
    email: authUser.email,
    password_hash: extraData.password_hash || authUser.user_metadata?.password_hash || null,
    auth_provider: defaultProvider,
    avatar_url: defaultAvatar,
    xp: authUser.user_metadata?.xp ?? 120,
    streak: authUser.user_metadata?.streak ?? 1,
    gems: authUser.user_metadata?.gems ?? 500,
    hearts: authUser.user_metadata?.hearts ?? 5,
    current_unit: 1,
    completed_lessons: authUser.user_metadata?.completed_lessons || [1],
    unlocked_islands: authUser.user_metadata?.unlocked_islands || [1, 2],
  }

  const { data: insertedProfile, error: insertErr } = await supabase
    .from('profiles')
    .upsert(newProfileRow, { onConflict: 'id' })
    .select('*')
    .maybeSingle()

  if (!insertErr && insertedProfile) {
    return insertedProfile
  }

  // Jika tabel public.profiles belum dibuat oleh admin di SQL Editor,
  // kembalikan objek profil dari Supabase Auth user_metadata
  return {
    ...newProfileRow,
    _tableMissing: Boolean(insertErr || selectErr),
  }
}

export const authService = {
  // 1. REGISTER DENGAN EMAIL, NAMA, UMUR, DAN PASSWORD (TERSIMPAN DI SUPABASE)
  async register({ nama, umur, email, password }) {
    if (!isSupabaseConfigured || !supabase) {
      throw new Error('Konfigurasi Supabase belum aktif.')
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
          xp: 120,
          streak: 1,
          gems: 500,
          hearts: 5,
          completed_lessons: [1],
          unlocked_islands: [1, 2],
        },
      },
    })

    if (error) {
      if (error.message?.toLowerCase().includes('already registered')) {
        throw new Error('Email sudah terdaftar di Supabase. Silakan masuk di halaman Login.')
      }
      throw new Error(error.message)
    }

    if (!data?.user) {
      throw new Error('Gagal membuat pengguna di Supabase.')
    }

    const profile = await fetchOrCreateSupabaseProfile(data.user, {
      nama: cleanNama,
      umur: parsedUmur,
      password_hash: passwordHash,
    })

    return profile
  },

  // 2. LOGIN DENGAN EMAIL & PASSWORD (DIVERIFIKASI LANGSUNG OLEH SUPABASE)
  async login({ email, password }) {
    if (!isSupabaseConfigured || !supabase) {
      throw new Error('Konfigurasi Supabase belum aktif.')
    }

    const cleanEmail = email.trim().toLowerCase()

    const { data, error } = await supabase.auth.signInWithPassword({
      email: cleanEmail,
      password,
    })

    if (error) {
      if (error.message?.toLowerCase().includes('email not confirmed')) {
        throw new Error(
          'Email kamu belum dikonfirmasi. Silakan cek inbox email kamu atau matikan "Confirm email" di Supabase Dashboard -> Authentication -> Providers -> Email.'
        )
      }
      throw new Error('Email atau password salah. Silakan periksa kembali.')
    }

    const profile = await fetchOrCreateSupabaseProfile(data.user)
    return profile
  },

  // 3. LOGIN / REGISTER DENGAN AKUN GOOGLE REAL PENGGUNA (OAUTH 2.0 SUPABASE)
  async loginWithGoogle() {
    if (!isSupabaseConfigured || !supabase) {
      throw new Error('Konfigurasi Supabase belum aktif.')
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

  // 4. LENGKAPI PROFIL AKUN GOOGLE (UMUR & PASSWORD OPSIONAL) KE DATABASE SUPABASE
  async completeGoogleProfile(userId, email, { nama, umur, password }) {
    if (!supabase) return null

    const parsedUmur = parseInt(umur, 10)
    const updates = {
      nama: nama.trim(),
      umur: parsedUmur,
      updated_at: new Date().toISOString(),
    }

    let passwordHash = null
    if (password && password.length >= 6) {
      passwordHash = await hashPasswordSecure(password, email)
      updates.password_hash = passwordHash
      // Set password di Supabase Auth juga agar user Google ini bisa login pakai email + password!
      await supabase.auth.updateUser({
        password,
        data: {
          nama: updates.nama,
          umur: parsedUmur,
          password_hash: passwordHash,
        },
      })
    } else {
      await supabase.auth.updateUser({
        data: {
          nama: updates.nama,
          umur: parsedUmur,
        },
      })
    }

    const { data: updatedRow } = await supabase
      .from('profiles')
      .upsert(
        {
          id: userId,
          email,
          ...updates,
        },
        { onConflict: 'id' }
      )
      .select('*')
      .maybeSingle()

    return (
      updatedRow || {
        id: userId,
        email,
        ...updates,
      }
    )
  },

  // 5. UPDATE PROFIL DI SUPABASE DATABASE
  async updateProfile(userId, updates) {
    if (!supabase) return null

    await supabase.auth.updateUser({
      data: updates,
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

    return updatedRow || updates
  },

  // 6. LOGOUT DARI SESI SUPABASE
  async logout() {
    if (supabase) {
      await supabase.auth.signOut()
    }
    return true
  },
}

// ============================================================
// Layanan Penyimpanan Progres Level Pulau ke Database Supabase
// ============================================================
export const progressService = {
  async fetchProgressFromSupabase(userId) {
    if (!supabase || !userId) return null

    const { data, error } = await supabase
      .from('profiles')
      .select('xp, streak, gems, hearts, current_unit, completed_lessons, unlocked_islands')
      .eq('id', userId)
      .maybeSingle()

    if (!error && data) {
      return {
        xp: data.xp ?? 120,
        streak: data.streak ?? 1,
        gems: data.gems ?? 500,
        hearts: data.hearts ?? 5,
        completedIslands: Array.isArray(data.completed_lessons) ? data.completed_lessons : [1],
        unlockedIslands: Array.isArray(data.unlocked_islands) ? data.unlocked_islands : [1, 2],
        dailyQuests: {
          xpEarned: Math.min(20, data.xp ?? 20),
          highScoreLessons: 1,
        },
      }
    }

    // Fallback ke user_metadata di Supabase Auth jika tabel profiles belum dieksekusi
    const { data: userData } = await supabase.auth.getUser()
    const meta = userData?.user?.user_metadata || {}
    return {
      xp: meta.xp ?? 120,
      streak: meta.streak ?? 1,
      gems: meta.gems ?? 500,
      hearts: meta.hearts ?? 5,
      completedIslands: meta.completed_lessons || [1],
      unlockedIslands: meta.unlocked_islands || [1, 2],
      dailyQuests: {
        xpEarned: 20,
        highScoreLessons: 1,
      },
    }
  },

  async saveProgressToSupabase(userId, progress) {
    if (!supabase || !userId) return progress

    // Simpan ke user_metadata Supabase Auth
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

    // Simpan ke tabel public.profiles di PostgreSQL Supabase
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
