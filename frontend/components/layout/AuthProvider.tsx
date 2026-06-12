'use client'
import { useEffect } from 'react'
import { useAuth } from '@/hooks/useAuth'

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { token, user, fetchMe } = useAuth()

  useEffect(() => {
    // If we have a stored token but no user (e.g. after page refresh),
    // validate the token with the server and populate user
    if (token && !user) {
      fetchMe()
    }
  }, []) // run once on mount only

  return <>{children}</>
}
