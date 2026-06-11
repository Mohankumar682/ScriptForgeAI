'use client'
import { motion } from 'framer-motion'
import { clsx } from 'clsx'
import { Loader2 } from 'lucide-react'
import { ReactNode, ButtonHTMLAttributes } from 'react'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger' | 'outline'
  size?: 'sm' | 'md' | 'lg'
  isLoading?: boolean
  icon?: ReactNode
  children: ReactNode
}

const variants = {
  primary: 'bg-brand-500 hover:bg-brand-400 text-white shadow-lg hover:shadow-brand-500/30 border border-brand-500/50',
  secondary: 'bg-dark-800 hover:bg-dark-700 text-dark-100 border border-dark-700 hover:border-dark-600',
  ghost: 'bg-transparent hover:bg-dark-800/50 text-dark-300 hover:text-dark-100',
  danger: 'bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/30 hover:border-red-500/50',
  outline: 'bg-transparent border border-brand-500/50 text-brand-400 hover:bg-brand-500/10',
}

const sizes = {
  sm: 'px-3 py-1.5 text-sm gap-1.5',
  md: 'px-4 py-2 text-sm gap-2',
  lg: 'px-6 py-3 text-base gap-2.5',
}

export function Button({
  variant = 'primary',
  size = 'md',
  isLoading = false,
  icon,
  children,
  className,
  disabled,
  ...props
}: ButtonProps) {
  return (
    <motion.button
      whileTap={{ scale: 0.97 }}
      whileHover={{ scale: 1.01 }}
      transition={{ duration: 0.1 }}
      className={clsx(
        'inline-flex items-center justify-center font-medium rounded-xl transition-all duration-200 cursor-pointer select-none',
        'disabled:opacity-50 disabled:cursor-not-allowed disabled:pointer-events-none',
        variants[variant],
        sizes[size],
        className
      )}
      disabled={disabled || isLoading}
      {...(props as any)}
    >
      {isLoading ? (
        <Loader2 className="w-4 h-4 animate-spin" />
      ) : (
        icon && <span className="flex-shrink-0">{icon}</span>
      )}
      {children}
    </motion.button>
  )
}
