'use client'
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { clsx } from 'clsx'
import {
  LayoutDashboard, Plus, History, User, Settings, Shield,
  LogOut, Zap, ChevronLeft, ChevronRight, Terminal, FileCode2
} from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import { useState } from 'react'

const navItems = [
  { href: '/dashboard',  label: 'Dashboard',  icon: LayoutDashboard },
  { href: '/generate',   label: 'Generate',   icon: Plus },
  { href: '/history',    label: 'History',    icon: History },
  { href: '/profile',    label: 'Profile',    icon: User },
]

const adminItems = [
  { href: '/admin',      label: 'Admin Panel', icon: Shield },
]

export function Sidebar() {
  const pathname = usePathname()
  const { user, logout } = useAuth()
  const [collapsed, setCollapsed] = useState(false)

  return (
    <motion.aside
      initial={{ x: -20, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      className={clsx(
        'fixed left-0 top-0 h-screen flex flex-col z-40',
        'bg-dark-950/95 backdrop-blur-xl border-r border-dark-800',
        'transition-all duration-300',
        collapsed ? 'w-16' : 'w-64'
      )}
    >
      {/* Logo */}
      <div className="flex items-center h-16 px-4 border-b border-dark-800">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-brand-500 to-purple-600 flex items-center justify-center flex-shrink-0">
            <Terminal className="w-4 h-4 text-white" />
          </div>
          <AnimatePresence>
            {!collapsed && (
              <motion.div
                initial={{ opacity: 0, width: 0 }}
                animate={{ opacity: 1, width: 'auto' }}
                exit={{ opacity: 0, width: 0 }}
                className="overflow-hidden whitespace-nowrap"
              >
                <span className="font-bold text-sm gradient-text">ScriptForge</span>
                <span className="text-xs text-brand-400 ml-1 font-mono">AI</span>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
        {navItems.map(({ href, label, icon: Icon }) => {
          const active = pathname === href || pathname.startsWith(href + '/')
          return (
            <Link key={href} href={href}>
              <motion.div
                whileHover={{ x: 2 }}
                className={clsx(
                  'flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 group',
                  active
                    ? 'bg-brand-500/15 text-brand-400 border border-brand-500/20'
                    : 'text-dark-400 hover:text-dark-200 hover:bg-dark-800/60'
                )}
              >
                <Icon className={clsx('w-5 h-5 flex-shrink-0', active && 'text-brand-400')} />
                <AnimatePresence>
                  {!collapsed && (
                    <motion.span
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="text-sm font-medium whitespace-nowrap"
                    >
                      {label}
                    </motion.span>
                  )}
                </AnimatePresence>
                {active && !collapsed && (
                  <motion.div
                    layoutId="activeIndicator"
                    className="ml-auto w-1.5 h-1.5 rounded-full bg-brand-400"
                  />
                )}
              </motion.div>
            </Link>
          )
        })}

        {user?.is_admin && (
          <>
            <div className={clsx('px-3 py-2', collapsed && 'hidden')}>
              <p className="text-xs text-dark-600 uppercase tracking-wider font-semibold">Admin</p>
            </div>
            {adminItems.map(({ href, label, icon: Icon }) => {
              const active = pathname.startsWith(href)
              return (
                <Link key={href} href={href}>
                  <motion.div
                    whileHover={{ x: 2 }}
                    className={clsx(
                      'flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200',
                      active
                        ? 'bg-purple-500/15 text-purple-400 border border-purple-500/20'
                        : 'text-dark-400 hover:text-dark-200 hover:bg-dark-800/60'
                    )}
                  >
                    <Icon className="w-5 h-5 flex-shrink-0" />
                    {!collapsed && <span className="text-sm font-medium">{label}</span>}
                  </motion.div>
                </Link>
              )
            })}
          </>
        )}
      </nav>

      {/* User + Collapse */}
      <div className="p-3 border-t border-dark-800 space-y-2">
        {!collapsed && user && (
          <div className="px-3 py-2 rounded-xl bg-dark-900/60 border border-dark-800">
            <p className="text-sm font-medium text-dark-200 truncate">{user.username}</p>
            <p className="text-xs text-dark-500 truncate">{user.email}</p>
          </div>
        )}
        <button
          onClick={logout}
          className={clsx(
            'w-full flex items-center gap-3 px-3 py-2.5 rounded-xl',
            'text-dark-400 hover:text-red-400 hover:bg-red-500/10 transition-all duration-200'
          )}
        >
          <LogOut className="w-5 h-5 flex-shrink-0" />
          {!collapsed && <span className="text-sm font-medium">Logout</span>}
        </button>
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="w-full flex items-center justify-center p-2 rounded-xl text-dark-500 hover:text-dark-300 hover:bg-dark-800 transition-all"
        >
          {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>
      </div>
    </motion.aside>
  )
}
