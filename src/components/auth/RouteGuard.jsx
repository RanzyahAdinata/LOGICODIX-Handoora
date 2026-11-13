import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import SplashScreen from '../common/SplashScreen'

/**
 * ProtectedRoute: Menjaga halaman agar hanya dapat diakses pengguna terautentikasi.
 * Jika belum login, redirect ke /login dengan state from untuk seamless return.
 */
export const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth()
  const location = useLocation()

  if (loading) {
    return <SplashScreen text="MEMUAT..." />
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  return children
}

/**
 * PublicOnlyRoute: Mencegah pengguna yang sudah login mengakses halaman /login atau /register.
 * Langsung diarahkan ke /belajar.
 */
export const PublicOnlyRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth()

  if (loading) {
    return <SplashScreen text="MEMUAT..." />
  }

  if (isAuthenticated) {
    return <Navigate to="/belajar" replace />
  }

  return children
}
