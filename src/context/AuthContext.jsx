import { createContext, useContext, useState, useEffect } from 'react'
import toast from 'react-hot-toast'
import { authService, fetchOrCreateSupabaseProfile, DEMO_USER } from '../services/storage'
import { supabase, isSupabaseConfigured } from '../services/supabaseClient'

const ACTIVITY_KEY = 'handoora_last_activity'
const IDLE_LIMIT_MS = 30 * 60 * 1000

const AuthContext = createContext(null)

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Pastikan splash/loading screen tampil minimal 1.5 - 2 detik saat inisialisasi awal
    const minSplashPromise = new Promise((resolve) => setTimeout(resolve, 1800))

    // Cek apakah ada sesi akun lokal/demo yang sedang aktif di localStorage
    const isLocalActive = localStorage.getItem('handoora_local_active') === 'true' || localStorage.getItem('handoora_demo_active') === 'true'
    const storedUser = localStorage.getItem('handoora_user')
    if (isLocalActive && storedUser) {
      try {
        const parsed = JSON.parse(storedUser)
        if (parsed?.id) {
          setUser(parsed)
          minSplashPromise.then(() => setLoading(false))
          return
        }
      } catch {
        // ignore
      }
    }

    if (!isSupabaseConfigured || !supabase) {
      minSplashPromise.then(() => setLoading(false))
      return
    }

    // 1. Cek sesi aktif dari Supabase Auth bersamaan dengan timer minimal splash
    Promise.all([
      supabase.auth.getSession().then(async ({ data: { session } }) => {
        if (session?.user) {
          const profile = await fetchOrCreateSupabaseProfile(session.user)
          setUser(profile)
        }
      }),
      minSplashPromise,
    ]).finally(() => {
      setLoading(false)
    })

    // 2. Dengarkan perubahan status login/logout/OAuth callback dari Supabase
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.user) {
        const profile = await fetchOrCreateSupabaseProfile(session.user)
        setUser(profile)
      } else if (event === 'SIGNED_OUT') {
        setUser(null)
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  // Auto-logout: 30 menit tanpa interaksi / keluar dari aplikasi
  useEffect(() => {
    if (!user) {
      localStorage.removeItem(ACTIVITY_KEY)
      return
    }

    const expireSession = async () => {
      localStorage.removeItem(ACTIVITY_KEY)
      try {
        await authService.logout()
      } catch {
        /* abaikan */
      }
      setUser(null)
      toast('Sesi berakhir karena tidak aktif lebih dari 30 menit. Silakan masuk kembali.', {
        icon: '🔒',
        duration: 6000,
      })
      // Refresh halaman ke login agar seluruh state UI ter-reset bersih
      window.location.href = '/login'
    }

    const isExpired = () => {
      const last = parseInt(localStorage.getItem(ACTIVITY_KEY) || '0', 10)
      return last > 0 && Date.now() - last > IDLE_LIMIT_MS
    }

    // Saat aplikasi dibuka kembali setelah ditutup lama
    if (isExpired()) {
      expireSession()
      return
    }

    let lastWrite = 0
    const markActive = () => {
      const now = Date.now()
      if (now - lastWrite > 5000) {
        lastWrite = now
        localStorage.setItem(ACTIVITY_KEY, String(now))
      }
    }
    localStorage.setItem(ACTIVITY_KEY, String(Date.now()))

    const events = ['mousemove', 'mousedown', 'keydown', 'scroll', 'touchstart', 'click']
    events.forEach((e) => window.addEventListener(e, markActive, { passive: true }))

    const check = () => {
      if (isExpired()) expireSession()
    }
    const onVisible = () => {
      if (document.visibilityState === 'visible') check()
    }
    document.addEventListener('visibilitychange', onVisible)
    window.addEventListener('focus', check)
    const timer = setInterval(check, 30 * 1000)

    return () => {
      events.forEach((e) => window.removeEventListener(e, markActive))
      document.removeEventListener('visibilitychange', onVisible)
      window.removeEventListener('focus', check)
      clearInterval(timer)
    }
  }, [user?.id])

  const login = async (credentials) => {
    const profile = await authService.login(credentials)
    setUser(profile)
    return profile
  }

  const register = async (userData) => {
    const profile = await authService.register(userData)
    setUser(profile)
    return profile
  }

  const loginWithGoogle = async () => {
    return await authService.loginWithGoogle()
  }

  const completeGoogleProfile = async (formData) => {
    if (!user) return null
    const updated = await authService.completeGoogleProfile(
      user.id,
      user.email,
      formData
    )
    setUser((prev) => ({ ...prev, ...updated }))
    return updated
  }

  const updateProfile = async (updates) => {
    if (!user) return null
    if (updates.avatar_url && user.id) {
      localStorage.setItem(`handoora_avatar_${user.id}`, updates.avatar_url)
    }
    const updated = await authService.updateProfile(user.id, updates)
    setUser((prev) => ({
      ...prev,
      ...updated,
      avatar_url: updates.avatar_url || updated.avatar_url || prev?.avatar_url
    }))
    return updated
  }

  const updatePassword = async (newPassword) => {
    return await authService.updatePassword(newPassword, user?.id)
  }

  const logout = async () => {
    localStorage.removeItem(ACTIVITY_KEY)
    try {
      await authService.logout()
    } catch {
      /* abaikan */
    }
    setUser(null)
    // Langsung arahkan dan refresh halaman penuh ke '/' agar seluruh state UI ter-reset bersih
    window.location.href = '/'
  }

  const value = {
    user,
    loading,
    login,
    register,
    loginWithGoogle,
    completeGoogleProfile,
    updateProfile,
    updatePassword,
    logout,
    isAuthenticated: !!user,
    isSupabaseConfigured,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
