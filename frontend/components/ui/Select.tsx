'use client'
import { clsx } from 'clsx'
import { ChevronDown } from 'lucide-react'
import { SelectHTMLAttributes, forwardRef } from 'react'

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string
  error?: string
  options: { value: string; label: string; icon?: string }[]
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ label, error, options, className, ...props }, ref) => {
    return (
      <div className="flex flex-col gap-1.5 w-full">
        {label && <label className="text-sm font-medium text-dark-300">{label}</label>}
        <div className="relative">
          <select
            ref={ref}
            className={clsx(
              'w-full appearance-none bg-dark-900/80 border rounded-xl px-4 py-2.5 pr-10',
              'text-sm text-dark-100 outline-none transition-all duration-200 cursor-pointer',
              'focus:border-brand-500/60 focus:ring-2 focus:ring-brand-500/20',
              'hover:border-dark-600',
              error ? 'border-red-500/50' : 'border-dark-700',
              className
            )}
            {...props}
          >
            {options.map((opt) => (
              <option key={opt.value} value={opt.value} className="bg-dark-900">
                {opt.icon ? `${opt.icon} ${opt.label}` : opt.label}
              </option>
            ))}
          </select>
          <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-dark-400 pointer-events-none" />
        </div>
        {error && <p className="text-xs text-red-400">{error}</p>}
      </div>
    )
  }
)
Select.displayName = 'Select'
