import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import toast from 'react-hot-toast'
import Navbar from '../components/layout/Navbar'
import PageTransition from '../components/layout/PageTransition'
import Input from '../components/ui/Input'
import Button from '../components/ui/Button'
import GoogleButton from '../components/ui/GoogleButton'
import GoogleAuthModal from '../components/ui/GoogleAuthModal'
import Divider from '../components/ui/Divider'
import { useAuth } from '../context/AuthContext'

const containerVariants = {
  initial: { opacity: 0 },
  animate: {
    opacity: 1,
    transition: {
      staggerChildren: 0.07,
      delayChildren: 0.04,
    },
  },
}

const itemVariants = {
  initial: { opacity: 0, y: 12 },
  animate: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.38, ease: [0.22, 1, 0.36, 1] },
  },
}

const LoginPage = () => {
  const navigate = useNavigate()
  const { login, loginWithGoogle } = useAuth()
  const [loading, setLoading] = useState(false)
  const [showGoogleSetupModal, setShowGoogleSetupModal] = useState(false)
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  })
  const [errors, setErrors] = useState({})

  const handleChange = (field) => (e) => {
    setFormData((prev) => ({ ...prev, [field]: e.target.value }))
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: '' }))
    }
  }

  const validate = () => {
    const newErrors = {}
    if (!formData.email.trim()) {
      newErrors.email = 'Email wajib diisi'
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Format email tidak valid'
    }
    if (!formData.password) {
      newErrors.password = 'Password wajib diisi'
    }
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!validate()) return

    setLoading(true)
    try {
      const user = await login(formData)
      toast.success(`Selamat datang kembali, ${user.nama}! 🤟`)
      navigate('/belajar')
    } catch (error) {
      toast.error(error.message)
    } finally {
      setLoading(false)
    }
  }

  const handleGoogleClick = async () => {
    setLoading(true)
    try {
      await loginWithGoogle()
    } catch (error) {
      if (error.code === 'GOOGLE_PROVIDER_NOT_ENABLED') {
        setShowGoogleSetupModal(true)
      } else {
        toast.error(error.message || 'Gagal menghubungkan ke Google OAuth')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <PageTransition>
      <Navbar />
      <main className="min-h-screen w-full flex flex-col items-center justify-center px-5 pt-20 pb-10 bg-white">
        <motion.div
          variants={containerVariants}
          initial="initial"
          animate="animate"
          className="w-full max-w-[320px] mx-auto flex flex-col items-center"
        >
          {/* Title matching exact UI design */}
          <motion.h1
            variants={itemVariants}
            className="text-2xl sm:text-[32px] font-bold text-[#666666] text-center mb-11 font-display"
          >
            Login
          </motion.h1>

          {/* Form */}
          <form onSubmit={handleSubmit} className="w-full flex flex-col gap-5" noValidate>
            <motion.div variants={itemVariants} className="w-full">
              <Input
                placeholder="Email"
                type="email"
                autoComplete="email"
                value={formData.email}
                onChange={handleChange('email')}
                error={errors.email}
              />
            </motion.div>

            <motion.div variants={itemVariants} className="w-full">
              <Input
                placeholder="Password"
                type="password"
                autoComplete="current-password"
                value={formData.password}
                onChange={handleChange('password')}
                error={errors.password}
              />
            </motion.div>

            <motion.div variants={itemVariants} className="w-full mt-5">
              <Button
                type="submit"
                variant="primary"
                size="lg"
                fullWidth
                loading={loading}
              >
                LOGIN
              </Button>
            </motion.div>
          </form>

          {/* ATAU Divider */}
          <motion.div variants={itemVariants} className="w-full">
            <Divider text="ATAU" />
          </motion.div>

          {/* Real Google OAuth Button */}
          <motion.div variants={itemVariants} className="w-full">
            <GoogleButton onClick={handleGoogleClick} loading={loading} />
          </motion.div>
        </motion.div>

        <GoogleAuthModal
          isOpen={showGoogleSetupModal}
          onClose={() => setShowGoogleSetupModal(false)}
          onRetryGoogle={handleGoogleClick}
        />
      </main>
    </PageTransition>
  )
}

export default LoginPage
