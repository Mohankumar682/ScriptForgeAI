'use client'
import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { StatsCard } from '@/components/dashboard/StatsCard'
import { RecentScripts } from '@/components/dashboard/RecentScripts'
import { useAuth } from '@/hooks/useAuth'
import { historyAPI } from '@/services/api'
import { FileCode2, CheckCircle2, Clock, Zap, Plus, Terminal, TrendingUp, Cpu } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'

const quickActions = [
  { label: 'MERN Stack', icon: '⚡', href: '/generate?stack=mern', color: 'from-green-500/10 to-emerald-500/5 border-green-500/20' },
  { label: 'Python ML', icon: '🐍', href: '/generate?stack=python_ml', color: 'from-yellow-500/10 to-orange-500/5 border-yellow-500/20' },
  { label: 'DevOps', icon: '🚀', href: '/generate?stack=devops', color: 'from-blue-500/10 to-indigo-500/5 border-blue-500/20' },
  { label: 'Docker', icon: '🐳', href: '/generate?stack=docker', color: 'from-cyan-500/10 to-blue-500/5 border-cyan-500/20' },
]

export default function DashboardPage() {
  const { user } = useAuth()
  const [stats, setStats] = useState({ total: 0, completed: 0, pending: 0 })

  useEffect(() => {
    historyAPI.list(1, 100).then((res) => {
      const scripts = res.data.scripts || []
      setStats({
        total: scripts.length,
        completed: scripts.filter((s: any) => s.status === 'completed').length,
        pending: scripts.filter((s: any) => s.status === 'processing' || s.status === 'pending').length,
      })
    }).catch(() => {})
  }, [])

  const hour = new Date().getHours()
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening'

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-start justify-between"
        >
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Badge variant="info" dot>Active</Badge>
            </div>
            <h1 className="text-3xl font-bold text-white">
              {greeting}, <span className="gradient-text">{user?.username}</span> 👋
            </h1>
            <p className="text-dark-400 mt-1">Welcome to your ScriptForge AI dashboard</p>
          </div>
          <Link href="/generate">
            <Button size="lg" icon={<Plus className="w-5 h-5" />}>
              New Script
            </Button>
          </Link>
        </motion.div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatsCard
            title="Total Scripts"
            value={stats.total}
            icon={<FileCode2 className="w-5 h-5" />}
            color="blue"
            change="All time"
            changeType="neutral"
            delay={0}
          />
          <StatsCard
            title="Completed"
            value={stats.completed}
            icon={<CheckCircle2 className="w-5 h-5" />}
            color="green"
            change={stats.total > 0 ? `${Math.round(stats.completed / stats.total * 100)}% success rate` : '–'}
            changeType="up"
            delay={0.05}
          />
          <StatsCard
            title="AI Agents"
            value={7}
            icon={<Cpu className="w-5 h-5" />}
            color="purple"
            change="Always running"
            changeType="neutral"
            delay={0.1}
          />
          <StatsCard
            title="Avg. Gen Time"
            value="~30s"
            icon={<Zap className="w-5 h-5" />}
            color="orange"
            change="Gemini 1.5 Flash"
            changeType="neutral"
            delay={0.15}
          />
        </div>

        {/* Quick Actions */}
        <div>
          <h2 className="text-lg font-semibold text-dark-200 mb-4">Quick Generate</h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {quickActions.map((action, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.2 + i * 0.05 }}
              >
                <Link href={action.href}>
                  <div className={`p-4 rounded-2xl border bg-gradient-to-br ${action.color} hover:scale-105 transition-transform cursor-pointer`}>
                    <span className="text-2xl">{action.icon}</span>
                    <p className="text-sm font-medium text-dark-200 mt-2">{action.label}</p>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Main content grid */}
        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <RecentScripts />
          </div>

          {/* AI Status panel */}
          <div className="space-y-4">
            <div className="glass rounded-2xl p-5">
              <h3 className="text-sm font-semibold text-dark-200 mb-4 flex items-center gap-2">
                <Cpu className="w-4 h-4 text-brand-400" />
                Agent Status
              </h3>
              <div className="space-y-3">
                {[
                  { name: 'Coordinator',    status: 'idle', color: 'text-cyan-400' },
                  { name: 'OS Detection',   status: 'idle', color: 'text-green-400' },
                  { name: 'Dependency',     status: 'idle', color: 'text-yellow-400' },
                  { name: 'Security',       status: 'idle', color: 'text-red-400' },
                  { name: 'Compatibility',  status: 'idle', color: 'text-purple-400' },
                  { name: 'Script Gen',     status: 'idle', color: 'text-brand-400' },
                  { name: 'Reporter',       status: 'idle', color: 'text-orange-400' },
                ].map((agent, i) => (
                  <div key={i} className="flex items-center justify-between">
                    <span className={`text-xs font-mono ${agent.color}`}>{agent.name}</span>
                    <div className="flex items-center gap-1.5">
                      <div className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
                      <span className="text-xs text-dark-500">Ready</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="glass rounded-2xl p-5">
              <h3 className="text-sm font-semibold text-dark-200 mb-3 flex items-center gap-2">
                <Terminal className="w-4 h-4 text-brand-400" />
                Sample Prompts
              </h3>
              <div className="space-y-2">
                {[
                  'Set up MERN on Ubuntu 22.04',
                  'Python ML env with Jupyter',
                  'K8s cluster with Helm',
                  'Java Spring Boot DevEnv',
                ].map((p, i) => (
                  <Link key={i} href={`/generate?q=${encodeURIComponent(p)}`}>
                    <div className="text-xs text-dark-400 hover:text-brand-300 p-2 rounded-lg hover:bg-dark-800/50 transition-all font-mono cursor-pointer">
                      $ {p}
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
