import { Routes, Route, useLocation } from 'react-router-dom'
import { AnimatePresence } from 'framer-motion'
import { Toaster } from 'react-hot-toast'
import { AuthProvider } from './context/AuthContext'
import LandingPage from './pages/LandingPage'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import DashboardPage from './pages/DashboardPage'
import QuizPage from './pages/QuizPage'
import TrainingPage from './pages/TrainingPage'

function App() {
  const location = useLocation()

  return (
    <AuthProvider>
      <Toaster
        position="top-center"
        toastOptions={{
          duration: 3000,
          style: {
            borderRadius: '16px',
            background: '#333333',
            color: '#fff',
            fontSize: '14px',
            fontWeight: '700',
          },
        }}
      />
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/belajar" element={<DashboardPage />} />
        <Route path="/quiz/:levelId" element={<QuizPage />} />
        <Route path="/quiz/:levelId/:stageId" element={<QuizPage />} />
        <Route path="/training" element={<TrainingPage />} />
        <Route path="/training/:letterParam" element={<TrainingPage />} />
      </Routes>
    </AuthProvider>
  )
}

export default App
