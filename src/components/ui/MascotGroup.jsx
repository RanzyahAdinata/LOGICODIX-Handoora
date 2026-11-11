import { motion } from 'framer-motion'

const MascotGroup = () => {
  return (
    <motion.div
      initial={{ scale: 0.92, opacity: 0, y: 12 }}
      animate={{ scale: 1, opacity: 1, y: 0 }}
      transition={{
        duration: 0.55,
        ease: [0.22, 1, 0.36, 1],
      }}
      className="w-full flex justify-center items-center select-none"
    >
      <motion.div
        animate={{
          y: [0, -6, 0],
        }}
        transition={{
          duration: 3.5,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
        whileHover={{
          scale: 1.025,
          transition: { duration: 0.3 },
        }}
        className="w-[320px] sm:w-[400px] md:w-[440px] flex justify-center items-center"
      >
        <img
          src="/assets/mascot-group.png"
          alt="Maskot Handoora"
          className="w-full h-auto object-contain block mx-auto"
          draggable={false}
        />
      </motion.div>
    </motion.div>
  )
}

export default MascotGroup
