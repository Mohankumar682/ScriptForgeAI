'use client'
import { motion } from 'framer-motion'
import { clsx } from 'clsx'
import { ReactNode } from 'react'

interface CardProps {
  children: ReactNode
  className?: string
  hover?: boolean
  glow?: boolean
  onClick?: () => void
}

export function Card({ children, className, hover = false, glow = false, onClick }: CardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      whileHover={hover ? { y: -2, transition: { duration: 0.2 } } : undefined}
      onClick={onClick}
      className={clsx(
        'glass rounded-2xl p-6',
        hover && 'cursor-pointer neon-border',
        glow && 'glow-blue-sm',
        onClick && 'cursor-pointer',
        className
      )}
    >
      {children}
    </motion.div>
  )
}

export function CardHeader({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={clsx('mb-4', className)}>{children}</div>
}

export function CardTitle({ children, className }: { children: ReactNode; className?: string }) {
  return <h3 className={clsx('text-lg font-semibold text-dark-100', className)}>{children}</h3>
}
