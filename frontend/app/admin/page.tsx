'use client'
import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { adminAPI } from '@/services/api'
import { StatsCard } from '@/components/dashboard/StatsCard'
import { Badge, StatusBadge } from '@/components/ui/Badge'
import { Loader2, Shield, Users, FileCode2, TrendingUp, Activity } from 'lucide-react'
import { formatDate } from '@/utils/time'
import toast from 'react-hot-toast'

export default function AdminPage() {
  const [stats, setStats] = useState<any>(null)
  const [users, setUsers] = useState<any[]>([])
  const [scripts, setScripts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([adminAPI.stats(), adminAPI.users(), adminAPI.scripts()])
      .then(([s, u, sc]) => {
        setStats(s.data)
        setUsers(u.data)
        setScripts(sc.data)
      })
      .catch(() => toast.error('Admin data failed to load'))
      .finally(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex justify-center py-20">
          <Loader2 className="w-8 h-8 text-brand-400 animate-spin" />
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <div className="space-y-8">
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-3xl font-bold text-white flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center">
              <Shield className="w-5 h-5 text-white" />
            </div>
            Admin Panel
          </h1>
          <p className="text-dark-400 mt-2">Platform analytics and user management</p>
        </motion.div>

        {/* Stats */}
        {stats && (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <StatsCard title="Total Users" value={stats.total_users} icon={<Users className="w-5 h-5" />} color="blue" delay={0} />
            <StatsCard title="Total Scripts" value={stats.total_scripts} icon={<FileCode2 className="w-5 h-5" />} color="purple" delay={0.05} />
            <StatsCard title="Completed" value={stats.completed_scripts} icon={<Activity className="w-5 h-5" />} color="green" delay={0.1} />
            <StatsCard title="Success Rate" value={`${stats.success_rate}%`} icon={<TrendingUp className="w-5 h-5" />} color="orange" delay={0.15} />
          </div>
        )}

        <div className="grid lg:grid-cols-2 gap-6">
          {/* Users */}
          <div className="glass rounded-2xl overflow-hidden">
            <div className="px-5 py-4 border-b border-dark-800">
              <h3 className="font-semibold text-dark-100 flex items-center gap-2">
                <Users className="w-4 h-4 text-brand-400" />
                Users ({users.length})
              </h3>
            </div>
            <div className="divide-y divide-dark-800/50 max-h-96 overflow-y-auto">
              {users.map((u) => (
                <div key={u.id} className="flex items-center justify-between px-5 py-3">
                  <div>
                    <p className="text-sm font-medium text-dark-200">{u.username}</p>
                    <p className="text-xs text-dark-500">{u.email}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    {u.is_admin && <Badge variant="purple">Admin</Badge>}
                    <Badge variant={u.is_active ? 'success' : 'error'} dot>
                      {u.is_active ? 'Active' : 'Inactive'}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Recent Scripts */}
          <div className="glass rounded-2xl overflow-hidden">
            <div className="px-5 py-4 border-b border-dark-800">
              <h3 className="font-semibold text-dark-100 flex items-center gap-2">
                <FileCode2 className="w-4 h-4 text-brand-400" />
                Recent Scripts
              </h3>
            </div>
            <div className="divide-y divide-dark-800/50 max-h-96 overflow-y-auto">
              {scripts.slice(0, 20).map((s) => (
                <div key={s.id} className="flex items-center justify-between px-5 py-3">
                  <div>
                    <p className="text-sm font-medium text-dark-200 truncate max-w-[180px]">{s.title}</p>
                    <p className="text-xs text-dark-500">{s.stack} · {s.os_type}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <StatusBadge status={s.status} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
