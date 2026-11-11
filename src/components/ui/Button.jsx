import { motion } from 'framer-motion'
import { forwardRef } from 'react'

const variantClasses = {
  primary: 'btn-3d-primary',
  secondary: 'btn-3d-secondary',
}

const sizeClasses = {
  sm: 'px-4 h-10 text-[11px] rounded-xl',
  md: 'px-5 h-11 text-xs rounded-xl',
  lg: 'px-6 h-[52px] text-[11px] sm:text-xs rounded-xl',
}

const Button = forwardRef(
  (
    {
      children,
      variant = 'primary',
      size = 'lg',
      fullWidth = false,
      disabled = false,
      loading = false,
      icon,
      className = '',
      onClick,
      type = 'button',
      ...props
    },
    ref
  ) => {
    return (
      <motion.button
        ref={ref}
        type={type}
        whileHover={!disabled && !loading ? { scale: 1.012 } : {}}
        whileTap={!disabled && !loading ? { scale: 0.988 } : {}}
        transition={{ type: 'spring', stiffness: 500, damping: 22 }}
        className={`
          ${variantClasses[variant] || variantClasses.primary}
          ${sizeClasses[size] || sizeClasses.lg}
          ${fullWidth ? 'w-full' : ''}
          ${disabled || loading ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer'}
          font-extrabold tracking-wide uppercase
          flex items-center justify-center gap-2
          select-none
          ${className}
        `}
        disabled={disabled || loading}
        onClick={onClick}
        {...props}
      >
        {loading ? (
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 0.9, repeat: Infinity, ease: 'linear' }}
            className="w-4 h-4 border-2 border-current border-t-transparent rounded-full"
          />
        ) : (
          <>
            {icon && <span className="flex items-center">{icon}</span>}
            <span>{children}</span>
          </>
        )}
      </motion.button>
    )
  }
)

Button.displayName = 'Button'

export default Button
