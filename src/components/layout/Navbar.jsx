import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'

const HandooraLogo = () => (
  <Link to="/" className="flex items-center focus:outline-none">
    <motion.img
      src="/assets/logo-full.png"
      alt="Handoora"
      className="h-5 sm:h-6 md:h-[26px] w-auto object-contain select-none"
      whileHover={{ scale: 1.03 }}
      whileTap={{ scale: 0.97 }}
      transition={{ type: 'spring', stiffness: 400, damping: 18 }}
      draggable={false}
    />
  </Link>
)

const IndonesiaFlag = () => (
  <motion.div
    whileHover={{ scale: 1.02 }}
    className="flex items-center gap-3 sm:gap-3.5 select-none cursor-default translate-y-1 sm:translate-y-1.5"
  >
    <span className="text-[11px] sm:text-xs md:text-[13px] font-extrabold text-[#A6A6A6] tracking-wide uppercase hidden sm:inline">
      BAHASA SITUS: BAHASA INDONESIA
    </span>
    <span className="text-[10px] font-extrabold text-[#A6A6A6] tracking-wide uppercase sm:hidden">
      BAHASA INDONESIA
    </span>
    <img
      src="/assets/flag-id.png"
      alt="Bendera Indonesia"
      className="w-8 sm:w-10 h-auto object-contain select-none"
      draggable={false}
    />
  </motion.div>
)

const Navbar = () => {
  return (
    <motion.header
      initial={{ y: -16, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
      className="fixed top-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-xs"
    >
      <div className="w-full max-w-[1040px] mx-auto px-6 sm:px-10 md:px-14">
        <div className="flex justify-between items-center h-16 sm:h-24">
          <HandooraLogo />
          <IndonesiaFlag />
        </div>
      </div>
    </motion.header>
  )
}

export default Navbar
