'use client'
import { useEffect } from 'react'
import { useAuth } from '@/hooks/useAuth'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://scriptforgeai.onrender.com'

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { token, user, fetchMe } = useAuth()

  useEffect(() => {
    // Wake up the Render backend on app load (free tier cold start fix)
    fetch(`${API_URL}/health`, { method: 'GET' }).catch(() => {})

    // If we have a stored token but no user (e.g. after page refresh),
    // validate the token with the server and populate user
    if (token && !user) {
      fetchMe()
    }
  }, []) // run once on mount only

  return <>{children}</>
}
