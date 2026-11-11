import { motion, AnimatePresence } from 'framer-motion'
import { forwardRef, useState } from 'react'

const EyeIcon = () => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
    <circle cx="12" cy="12" r="3" />
  </svg>
)

const EyeOffIcon = () => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
    <line x1="1" y1="1" x2="23" y2="23" />
  </svg>
)

const Input = forwardRef(
  (
    {
      label,
      type = 'text',
      placeholder,
      value,
      onChange,
      error,
      icon,
      className = '',
      ...props
    },
    ref
  ) => {
    const [isFocused, setIsFocused] = useState(false)
    const [showPassword, setShowPassword] = useState(false)

    const isPassword = type === 'password'
    const inputType = isPassword ? (showPassword ? 'text' : 'password') : type

    return (
      <div className={`w-full ${className}`}>
        {label && (
          <label className="block text-xs font-bold text-handoora-heading mb-1.5">
            {label}
          </label>
        )}
        <div className="relative">
          {icon && (
            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-handoora-placeholder">
              {icon}
            </div>
          )}
          <motion.input
            ref={ref}
            type={inputType}
            placeholder={placeholder}
            value={value}
            onChange={onChange}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            animate={{
              borderColor: error
                ? '#EF4444'
                : isFocused
                  ? '#EB2B36'
                  : '#E9E9E9',
              backgroundColor: isFocused ? '#FFFFFF' : '#F7F7F7',
              boxShadow: isFocused
                ? '0 0 0 3px rgba(235, 43, 54, 0.1)'
                : '0 0 0 0px rgba(235, 43, 54, 0)',
            }}
            transition={{ duration: 0.16 }}
            className={`
              w-full h-[48px] px-5 rounded-xl
              bg-[#F7F7F7] border border-[#E9E9E9]
              text-[#4B5563] placeholder-[#A6A6A6]
              font-bold text-xs sm:text-[13px] outline-none
              transition-colors duration-150
              ${icon ? 'pl-11' : ''}
              ${isPassword ? 'pr-11' : ''}
            `}
            {...props}
          />
          {isPassword && value && (
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-[#A6A6A6] hover:text-[#666666] transition-colors cursor-pointer"
              tabIndex={-1}
              aria-label={showPassword ? 'Sembunyikan password' : 'Lihat password'}
            >
              {showPassword ? <EyeOffIcon /> : <EyeIcon />}
            </button>
          )}
        </div>
        <AnimatePresence>
          {error && (
            <motion.p
              initial={{ opacity: 0, y: -3, height: 0 }}
              animate={{ opacity: 1, y: 0, height: 'auto' }}
              exit={{ opacity: 0, y: -3, height: 0 }}
              className="text-[#EB2B36] text-[11px] mt-1.5 pl-1 font-bold"
            >
              {error}
            </motion.p>
          )}
        </AnimatePresence>
      </div>
    )
  }
)

Input.displayName = 'Input'

export default Input
