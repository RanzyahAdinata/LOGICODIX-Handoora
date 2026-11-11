import { createContext, useContext, useState, useEffect } from 'react'
import { authService, fetchOrCreateSupabaseProfile } from '../services/storage'
import { supabase, isSupabaseConfigured } from '../services/supabaseClient'

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
    if (!isSupabaseConfigured || !supabase) {
      setLoading(false)
      return
    }

    // 1. Cek sesi aktif dari Supabase Auth (termasuk setelah redirect dari Google OAuth)
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (session?.user) {
        const profile = await fetchOrCreateSupabaseProfile(session.user)
        setUser(profile)
      }
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
    const updated = await authService.updateProfile(user.id, updates)
    setUser((prev) => ({ ...prev, ...updated }))
    return updated
  }

  const logout = async () => {
    await authService.logout()
    setUser(null)
  }

  const value = {
    user,
    loading,
    login,
    register,
    loginWithGoogle,
    completeGoogleProfile,
    updateProfile,
    logout,
    isAuthenticated: !!user,
    isSupabaseConfigured,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
