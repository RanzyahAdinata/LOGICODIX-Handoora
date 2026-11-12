import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import Navbar from '../components/layout/Navbar'
import PageTransition from '../components/layout/PageTransition'
import Button from '../components/ui/Button'
import MascotGroup from '../components/ui/MascotGroup'
import { useAuth } from '../context/AuthContext'

const containerVariants = {
  initial: { opacity: 0 },
  animate: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.05,
    },
  },
}

const itemVariants = {
  initial: { opacity: 0, y: 14 },
  animate: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.45,
      ease: [0.22, 1, 0.36, 1],
    },
  },
}

const LandingPage = () => {
  const navigate = useNavigate()
  const { isAuthenticated } = useAuth()

  const handleStart = () => {
    if (isAuthenticated) {
      navigate('/belajar')
    } else {
      navigate('/register')
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
          className="flex flex-col items-center justify-center text-center w-full max-w-lg mx-auto"
        >
          {/* HD Transparent Mascot Group centered on vertical axis */}
          <motion.div
            variants={itemVariants}
            className="w-full flex justify-center mb-8"
          >
            <MascotGroup />
          </motion.div>

          {/* Tagline matching exact UI design */}
          <motion.h1
            variants={itemVariants}
            className="text-xl sm:text-[26px] md:text-[28px] font-black text-[#4B4B4B] leading-[1.35] mb-7 font-display tracking-tight text-center"
          >
            Cara paling asyik buat jago
            <br />
            bahasa isyarat dari nol!
          </motion.h1>

          {/* CTA Buttons matching exact UI width (320px) and vertical gap */}
          <motion.div
            variants={itemVariants}
            className="w-full max-w-[320px] flex flex-col gap-3.5 mx-auto"
          >
            <Button variant="primary" size="lg" fullWidth onClick={handleStart}>
              MULAI
            </Button>

            <Button
              variant="secondary"
              size="lg"
              fullWidth
              onClick={() => navigate('/login')}
            >
              SAYA SUDAH MEMILIKI AKUN
            </Button>
          </motion.div>
        </motion.div>
      </main>
    </PageTransition>
  )
}

export default LandingPage
