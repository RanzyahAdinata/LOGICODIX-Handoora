import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'

/**
 * ProtectedRoute: Menjaga halaman agar hanya dapat diakses pengguna terautentikasi.
 * Jika belum login, redirect ke /login dengan state from untuk seamless return.
 */
export const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth()
  const location = useLocation()

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FDFBF7] flex items-center justify-center font-nunito">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-[#E02424] border-t-transparent rounded-full animate-spin" />
          <p className="text-xs font-black text-gray-500 uppercase tracking-wider">Memuat Handoora...</p>
        </div>
      </div>
    )
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
    return (
      <div className="min-h-screen bg-[#FDFBF7] flex items-center justify-center font-nunito">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-[#E02424] border-t-transparent rounded-full animate-spin" />
          <p className="text-xs font-black text-gray-500 uppercase tracking-wider">Memuat Handoora...</p>
        </div>
      </div>
    )
  }

  if (isAuthenticated) {
    return <Navigate to="/belajar" replace />
  }

  return children
}
