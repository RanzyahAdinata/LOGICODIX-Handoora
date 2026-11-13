import { motion } from 'framer-motion'

export default function SplashScreen({ text = 'MEMUAT...' }) {
  return (
    <div className="fixed inset-0 z-[9999] bg-white flex flex-col items-center justify-center font-nunito select-none">
      {/* Container Maskot Beranimasi Lucu & Ekspresif */}
      <div className="relative flex flex-col items-center justify-center">
        {/* Ikon Not Musik Melayang / Bergoyang (Khas Duolingo Splash) */}
        <motion.div
          animate={{
            y: [-4, -14, -4],
            x: [0, 6, 0],
            rotate: [0, 15, -10, 0],
            opacity: [0.7, 1, 0.7],
          }}
          transition={{
            duration: 1.8,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
          className="absolute -top-7 right-3 text-[#38BDF8] select-none pointer-events-none"
        >
          <svg className="w-6 h-6 drop-shadow-sm" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z" />
          </svg>
        </motion.div>

        {/* Maskot Harimau Doora Menggemaskan dengan Animasi Melompat & Bergoyang Halus */}
        <motion.div
          animate={{
            y: [0, -12, 0],
            rotate: [-2, 2, -2],
            scale: [1, 1.04, 1],
          }}
          transition={{
            duration: 1.6,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
          className="relative w-32 h-32 sm:w-36 sm:h-36 flex items-center justify-center"
        >
          <img
            src="/assets/avatar-tiger.png"
            alt="Doora Maskot Handoora"
            className="w-full h-full object-contain filter drop-shadow-[0_8px_16px_rgba(224,36,36,0.15)]"
          />
        </motion.div>

        {/* Bayangan Halus di Bawah Kaki Maskot yang Membesar-Mengecil Mengikuti Gerakan */}
        <motion.div
          animate={{
            scaleX: [1, 0.75, 1],
            opacity: [0.35, 0.15, 0.35],
          }}
          transition={{
            duration: 1.6,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
          className="w-20 h-3 bg-gray-400/40 rounded-[100%] blur-[2px] mt-1"
        />

        {/* Teks MEMUAT... Minimalis, Clean, & Proporsional (Sesuai Referensi) */}
        <motion.p
          animate={{ opacity: [0.6, 1, 0.6] }}
          transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
          className="mt-6 text-xs sm:text-sm font-black text-gray-400 tracking-[0.22em] uppercase text-center"
        >
          {text}
        </motion.p>
      </div>
    </div>
  )
}
