import { clsx } from 'clsx'
import { ReactNode } from 'react'

type BadgeVariant = 'default' | 'success' | 'warning' | 'error' | 'info' | 'purple'

const variants: Record<BadgeVariant, string> = {
  default:  'bg-dark-700 text-dark-300 border-dark-600',
  success:  'bg-green-500/10 text-green-400 border-green-500/20',
  warning:  'bg-amber-500/10 text-amber-400 border-amber-500/20',
  error:    'bg-red-500/10 text-red-400 border-red-500/20',
  info:     'bg-brand-500/10 text-brand-400 border-brand-500/20',
  purple:   'bg-purple-500/10 text-purple-400 border-purple-500/20',
}

interface BadgeProps {
  children: ReactNode
  variant?: BadgeVariant
  className?: string
  dot?: boolean
}

export function Badge({ children, variant = 'default', className, dot }: BadgeProps) {
  return (
    <span className={clsx(
      'inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium border',
      variants[variant],
      className
    )}>
      {dot && <span className={clsx('w-1.5 h-1.5 rounded-full', {
        'bg-green-400': variant === 'success',
        'bg-amber-400': variant === 'warning',
        'bg-red-400': variant === 'error',
        'bg-brand-400': variant === 'info',
        'bg-purple-400': variant === 'purple',
        'bg-dark-400': variant === 'default',
      })} />}
      {children}
    </span>
  )
}

export function StatusBadge({ status }: { status: string }) {
  const map: Record<string, BadgeVariant> = {
    completed:  'success',
    processing: 'info',
    pending:    'warning',
    failed:     'error',
  }
  return <Badge variant={map[status] || 'default'} dot>{status}</Badge>
}
