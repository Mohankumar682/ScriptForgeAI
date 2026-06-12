'use client'
import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Mail, Lock, Terminal, Eye, EyeOff, Loader2 } from 'lucide-react'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { useAuth } from '@/hooks/useAuth'
import toast from 'react-hot-toast'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://scriptforgeai.onrender.com'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPass, setShowPass] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [serverReady, setServerReady] = useState(false)
  const { login, isLoading } = useAuth()
  const router = useRouter()

  // Wake up Render backend on page load
  useEffect(() => {
    const wake = async () => {
      try {
        await fetch(`${API_URL}/health`)
        setServerReady(true)
      } catch {
        // still let the user try — server may respond by then
        setServerReady(true)
      }
    }
    wake()
  }, [])

  const validate = () => {
    const e: Record<string, string> = {}
    if (!email) e.email = 'Email is required'
    else if (!/\S+@\S+\.\S+/.test(email)) e.email = 'Invalid email'
    if (!password) e.password = 'Password is required'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validate()) return
    try {
      await login(email, password)
      toast.success('Welcome back!')
      router.push('/dashboard')
    } catch (err: any) {
      const msg = err?.response?.data?.detail || 'Login failed. Please try again.'
      toast.error(msg)
    }
  }

  return (
    <div className="min-h-screen bg-dark-950 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-grid-pattern opacity-20" />
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-96 h-96 rounded-full bg-brand-500/5 blur-3xl" />
      <div className="absolute bottom-20 right-20 w-64 h-64 rounded-full bg-purple-500/5 blur-2xl" />

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative z-10 w-full max-w-md"
      >
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-brand-500 to-purple-600 mb-4 glow-blue">
            <Terminal className="w-7 h-7 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-white">Welcome back</h1>
          <p className="text-dark-400 text-sm mt-1">Sign in to ScriptForge AI</p>
        </div>

        {/* Server wake-up notice */}
        {!serverReady && (
          <div className="flex items-center gap-2 justify-center mb-4 text-xs text-dark-400">
            <Loader2 className="w-3 h-3 animate-spin text-brand-400" />
            <span>Waking up server, please wait a moment…</span>
          </div>
        )}

        {/* Form */}
        <div className="glass rounded-2xl p-8 border border-dark-700">
          <form onSubmit={handleSubmit} className="space-y-5">
            <Input
              label="Email Address"
              id="login-email"
              name="email"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              icon={<Mail className="w-4 h-4" />}
              error={errors.email}
              autoComplete="email"
            />
            <Input
              label="Password"
              id="login-password"
              name="password"
              type={showPass ? 'text' : 'password'}
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              icon={<Lock className="w-4 h-4" />}
              error={errors.password}
              autoComplete="current-password"
              rightElement={
                <button type="button" onClick={() => setShowPass(!showPass)} className="cursor-pointer">
                  {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              }
            />

            <Button
              type="submit"
              className="w-full mt-2"
              size="lg"
              isLoading={isLoading}
              disabled={!serverReady || isLoading}
            >
              {isLoading ? 'Signing in...' : !serverReady ? 'Connecting…' : 'Sign In'}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-dark-400 text-sm">
              Don&apos;t have an account?{' '}
              <Link href="/signup" className="text-brand-400 hover:text-brand-300 font-medium">
                Sign up free
              </Link>
            </p>
          </div>
        </div>

        <p className="text-center text-xs text-dark-600 mt-6">
          Hosted on Render free tier — first load may take up to 30s
        </p>
      </motion.div>
    </div>
  )
}
