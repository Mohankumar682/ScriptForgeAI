'use client'
import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import Cookies from 'js-cookie'
import { authAPI } from '@/services/api'

interface User {
  id: number
  username: string
  email: string
  is_active: boolean
  is_admin: boolean
}

interface AuthState {
  user: User | null
  token: string | null
  isLoading: boolean
  setUser: (user: User | null) => void
  setToken: (token: string | null) => void
  login: (email: string, password: string) => Promise<void>
  signup: (username: string, email: string, password: string) => Promise<void>
  logout: () => void
  fetchMe: () => Promise<void>
}

export const useAuth = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isLoading: false,

      setUser: (user) => set({ user }),
      setToken: (token) => set({ token }),

      login: async (email, password) => {
        set({ isLoading: true })
        try {
          const res = await authAPI.login(email, password)
          const { access_token, user } = res.data
          Cookies.set('token', access_token, { expires: 1 })
          localStorage.setItem('token', access_token)
          set({ token: access_token, user, isLoading: false })
        } catch (err) {
          set({ isLoading: false })
          throw err
        }
      },

      signup: async (username, email, password) => {
        set({ isLoading: true })
        try {
          const res = await authAPI.signup({ username, email, password })
          const { access_token, user } = res.data
          Cookies.set('token', access_token, { expires: 1 })
          localStorage.setItem('token', access_token)
          set({ token: access_token, user, isLoading: false })
        } catch (err) {
          set({ isLoading: false })
          throw err
        }
      },

      logout: () => {
        Cookies.remove('token')
        localStorage.removeItem('token')
        set({ user: null, token: null })
        window.location.href = '/login'
      },

      fetchMe: async () => {
        try {
          const res = await authAPI.me()
          set({ user: res.data })
        } catch {
          get().logout()
        }
      },
    }),
    {
      name: 'scriptforge-auth',
      partialize: (state) => ({ user: state.user, token: state.token }),
    }
  )
)
