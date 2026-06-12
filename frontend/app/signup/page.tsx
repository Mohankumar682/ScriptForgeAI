'use client'
import { useState } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Mail, Lock, User, Terminal, Eye, EyeOff, CheckCircle2 } from 'lucide-react'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { useAuth } from '@/hooks/useAuth'
import toast from 'react-hot-toast'

const requirements = [
  { label: 'At least 8 characters', check: (p: string) => p.length >= 8 },
  { label: 'Contains a number', check: (p: string) => /\d/.test(p) },
  { label: 'Contains a letter', check: (p: string) => /[a-zA-Z]/.test(p) },
]

export default function SignupPage() {
  const [form, setForm] = useState({ username: '', email: '', password: '', confirm: '' })
  const [showPass, setShowPass] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const { signup, isLoading } = useAuth()
  const router = useRouter()

  const set = (k: string) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm(prev => ({ ...prev, [k]: e.target.value }))

  const validate = () => {
    const e: Record<string, string> = {}
    if (!form.username || form.username.length < 3) e.username = 'Username must be at least 3 characters'
    if (!form.email || !/\S+@\S+\.\S+/.test(form.email)) e.email = 'Valid email required'
    if (form.password.length < 8) e.password = 'Password must be 8+ characters'
    if (form.password !== form.confirm) e.confirm = 'Passwords do not match'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validate()) return
    try {
      await signup(form.username, form.email, form.password)
      toast.success('Account created! Welcome to ScriptForge AI 🚀')
      router.push('/dashboard')
    } catch (err: any) {
      const msg = err?.response?.data?.detail || 'Signup failed. Please try again.'
      toast.error(msg)
    }
  }

  return (
    <div className="min-h-screen bg-dark-950 flex items-center justify-center p-4 relative overflow-hidden">
      <div className="absolute inset-0 bg-grid-pattern opacity-20" />
      <div className="absolute top-1/4 right-1/4 w-96 h-96 rounded-full bg-purple-500/5 blur-3xl" />
      <div className="absolute bottom-1/4 left-1/4 w-64 h-64 rounded-full bg-brand-500/5 blur-2xl" />

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative z-10 w-full max-w-md"
      >
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-brand-500 to-purple-600 mb-4 glow-blue">
            <Terminal className="w-7 h-7 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-white">Create your account</h1>
          <p className="text-dark-400 text-sm mt-1">Start generating scripts with AI</p>
        </div>

        <div className="glass rounded-2xl p-8 border border-dark-700">
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Username"
              id="signup-username"
              name="username"
              placeholder="devhero"
              value={form.username}
              onChange={set('username')}
              icon={<User className="w-4 h-4" />}
              error={errors.username}
              autoComplete="username"
            />
            <Input
              label="Email Address"
              id="signup-email"
              name="email"
              type="email"
              placeholder="you@example.com"
              value={form.email}
              onChange={set('email')}
              icon={<Mail className="w-4 h-4" />}
              error={errors.email}
              autoComplete="email"
            />
            <div>
              <Input
                label="Password"
                id="signup-password"
                name="password"
                type={showPass ? 'text' : 'password'}
                placeholder="••••••••"
                value={form.password}
                onChange={set('password')}
                icon={<Lock className="w-4 h-4" />}
                error={errors.password}
                autoComplete="new-password"
                rightElement={
                  <button type="button" onClick={() => setShowPass(!showPass)}>
                    {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                }
              />
              {form.password && (
                <div className="mt-2 space-y-1">
                  {requirements.map((r, i) => (
                    <div key={i} className="flex items-center gap-1.5">
                      <CheckCircle2 className={`w-3 h-3 ${r.check(form.password) ? 'text-green-400' : 'text-dark-600'}`} />
                      <span className={`text-xs ${r.check(form.password) ? 'text-green-400' : 'text-dark-500'}`}>{r.label}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
            <Input
              label="Confirm Password"
              id="signup-confirm"
              name="confirm"
              type="password"
              placeholder="••••••••"
              value={form.confirm}
              onChange={set('confirm')}
              icon={<Lock className="w-4 h-4" />}
              error={errors.confirm}
              autoComplete="new-password"
            />

            <Button type="submit" className="w-full mt-2" size="lg" isLoading={isLoading}>
              {isLoading ? 'Creating account...' : 'Create Account'}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-dark-400 text-sm">
              Already have an account?{' '}
              <Link href="/login" className="text-brand-400 hover:text-brand-300 font-medium">
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  )
}
