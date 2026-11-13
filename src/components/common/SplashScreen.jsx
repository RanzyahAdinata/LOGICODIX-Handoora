import { motion } from 'framer-motion'

export default function SplashScreen({ text = 'MEMUAT...' }) {
  return (
    <div className="fixed inset-0 z-[9999] bg-white flex flex-col items-center justify-center font-nunito select-none px-4">
      {/* Container Maskot Group Beranimasi Lucu & Ekspresif */}
      <div className="relative flex flex-col items-center justify-center">
        {/* Ikon Not Musik Melayang / Bergoyang (Khas Duolingo Splash) */}
        <motion.div
          animate={{
            y: [-4, -14, -4],
            x: [0, 8, 0],
            rotate: [0, 18, -12, 0],
            opacity: [0.7, 1, 0.7],
          }}
          transition={{
            duration: 1.8,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
          className="absolute -top-6 right-6 sm:right-10 text-[#38BDF8] select-none pointer-events-none z-10"
        >
          <svg className="w-7 h-7 sm:w-8 sm:h-8 drop-shadow-sm" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z" />
          </svg>
        </motion.div>

        {/* Maskot Group Ramah (Doora & Teman-teman) Beranimasi Halus */}
        <motion.div
          animate={{
            y: [0, -10, 0],
            rotate: [-1.2, 1.2, -1.2],
            scale: [1, 1.025, 1],
          }}
          transition={{
            duration: 1.8,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
          className="relative w-52 sm:w-64 md:w-72 aspect-4/3 flex items-center justify-center"
        >
          <img
            src="/assets/mascot-group.png"
            alt="Mascot Group Handoora"
            className="w-full h-full object-contain filter drop-shadow-[0_12px_24px_rgba(0,0,0,0.08)]"
          />
        </motion.div>

        {/* Bayangan Halus di Bawah Kaki Maskot Group yang Menyesuaikan Gerakan */}
        <motion.div
          animate={{
            scaleX: [1, 0.8, 1],
            opacity: [0.35, 0.18, 0.35],
          }}
          transition={{
            duration: 1.8,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
          className="w-40 sm:w-52 h-3.5 bg-gray-400/35 rounded-[100%] blur-[2px] mt-0.5"
        />

        {/* Teks MEMUAT... Minimalis, Clean & Elegan */}
        <motion.p
          animate={{ opacity: [0.6, 1, 0.6] }}
          transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
          className="mt-6 text-xs sm:text-sm font-black text-gray-400 tracking-[0.25em] uppercase text-center"
        >
          {text}
        </motion.p>
      </div>
    </div>
  )
}
