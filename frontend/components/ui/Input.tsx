'use client'
import { clsx } from 'clsx'
import { InputHTMLAttributes, ReactNode, forwardRef, useId } from 'react'

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
  icon?: ReactNode
  rightElement?: ReactNode
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, icon, rightElement, className, id, name, ...props }, ref) => {
    const generatedId = useId()
    const inputId = id || (name ? `field-${name}` : generatedId)

    return (
      <div className="flex flex-col gap-1.5 w-full">
        {label && (
          <label htmlFor={inputId} className="text-sm font-medium text-dark-300">
            {label}
          </label>
        )}
        <div className="relative">
          {icon && (
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-dark-400">
              {icon}
            </span>
          )}
          <input
            ref={ref}
            id={inputId}
            name={name || inputId}
            className={clsx(
              'w-full bg-dark-900/80 border rounded-xl px-4 py-2.5 text-sm text-dark-100',
              'placeholder:text-dark-500 outline-none transition-all duration-200',
              'focus:border-brand-500/60 focus:ring-2 focus:ring-brand-500/20',
              'hover:border-dark-600',
              error ? 'border-red-500/50' : 'border-dark-700',
              icon && 'pl-10',
              rightElement && 'pr-10',
              className
            )}
            {...props}
          />
          {rightElement && (
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-dark-400">
              {rightElement}
            </span>
          )}
        </div>
        {error && <p className="text-xs text-red-400">{error}</p>}
      </div>
    )
  }
)
Input.displayName = 'Input'
