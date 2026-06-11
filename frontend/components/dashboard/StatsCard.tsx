'use client'
import { motion } from 'framer-motion'
import { ReactNode } from 'react'
import { clsx } from 'clsx'

interface StatsCardProps {
  title: string
  value: string | number
  icon: ReactNode
  change?: string
  changeType?: 'up' | 'down' | 'neutral'
  color?: 'blue' | 'green' | 'purple' | 'orange'
  delay?: number
}

const colors = {
  blue:   { bg: 'from-brand-500/20 to-brand-600/10', icon: 'bg-brand-500/20 text-brand-400', border: 'border-brand-500/20' },
  green:  { bg: 'from-green-500/20 to-green-600/10', icon: 'bg-green-500/20 text-green-400', border: 'border-green-500/20' },
  purple: { bg: 'from-purple-500/20 to-purple-600/10', icon: 'bg-purple-500/20 text-purple-400', border: 'border-purple-500/20' },
  orange: { bg: 'from-orange-500/20 to-orange-600/10', icon: 'bg-orange-500/20 text-orange-400', border: 'border-orange-500/20' },
}

export function StatsCard({ title, value, icon, change, changeType = 'neutral', color = 'blue', delay = 0 }: StatsCardProps) {
  const c = colors[color]
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.4 }}
      className={clsx(
        'relative overflow-hidden rounded-2xl p-5 border backdrop-blur-sm',
        'bg-gradient-to-br', c.bg, c.border
      )}
    >
      {/* Background glow */}
      <div className="absolute inset-0 bg-gradient-to-br from-white/[0.02] to-transparent pointer-events-none" />

      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-dark-400 font-medium">{title}</p>
          <p className="text-3xl font-bold text-dark-100 mt-1">{value}</p>
          {change && (
            <p className={clsx(
              'text-xs mt-1 font-medium',
              changeType === 'up' && 'text-green-400',
              changeType === 'down' && 'text-red-400',
              changeType === 'neutral' && 'text-dark-400',
            )}>
              {change}
            </p>
          )}
        </div>
        <div className={clsx('p-3 rounded-xl', c.icon)}>
          {icon}
        </div>
      </div>
    </motion.div>
  )
}
