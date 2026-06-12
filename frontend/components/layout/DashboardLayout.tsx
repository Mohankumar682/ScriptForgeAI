'use client'
import { ReactNode, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Sidebar } from './Sidebar'
import { useAuth } from '@/hooks/useAuth'
import { Loader2 } from 'lucide-react'

export function DashboardLayout({ children }: { children: ReactNode }) {
  const { user, token } = useAuth()
  const router = useRouter()
  // Track whether Zustand has finished rehydrating from localStorage
  const [hydrated, setHydrated] = useState(false)

  useEffect(() => {
    setHydrated(true)
  }, [])

  useEffect(() => {
    // Only redirect after hydration is complete and we confirm no token+user
    if (hydrated && !token && !user) {
      router.push('/login')
    }
  }, [hydrated, token, user, router])

  // Show spinner while Zustand is still rehydrating OR while we have a token
  // but user object hasn't populated yet (e.g. first load)
  if (!hydrated || (token && !user)) {
    return (
      <div className="min-h-screen bg-dark-950 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-brand-500 to-purple-600 flex items-center justify-center animate-pulse">
            <Loader2 className="w-6 h-6 text-white animate-spin" />
          </div>
          <p className="text-dark-400 text-sm">Loading ScriptForge AI...</p>
        </div>
      </div>
    )
  }

  // After hydration: no token and no user → redirect handled above, render nothing
  if (!user) {
    return null
  }

  return (
    <div className="min-h-screen bg-dark-950 flex">
      <Sidebar />
      <main className="flex-1 ml-64 transition-all duration-300 min-h-screen">
        <div className="p-6 max-w-7xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  )
}
