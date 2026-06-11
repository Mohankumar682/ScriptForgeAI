'use client'
import { motion } from 'framer-motion'
import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { useAuth } from '@/hooks/useAuth'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { User, Mail, Shield, Calendar, LogOut, Terminal, Key } from 'lucide-react'
import { Button } from '@/components/ui/Button'

export default function ProfilePage() {
  const { user, logout } = useAuth()

  return (
    <DashboardLayout>
      <div className="space-y-6 max-w-2xl">
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-3xl font-bold text-white flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-500 to-red-600 flex items-center justify-center">
              <User className="w-5 h-5 text-white" />
            </div>
            Profile
          </h1>
          <p className="text-dark-400 mt-2">Manage your account settings</p>
        </motion.div>

        {/* Avatar + info */}
        <Card>
          <div className="flex items-center gap-5">
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-brand-500 to-purple-600 flex items-center justify-center text-3xl font-bold text-white">
              {user?.username?.[0]?.toUpperCase() || 'U'}
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">{user?.username}</h2>
              <p className="text-dark-400 text-sm">{user?.email}</p>
              <div className="flex gap-2 mt-2">
                <Badge variant={user?.is_active ? 'success' : 'error'} dot>
                  {user?.is_active ? 'Active' : 'Inactive'}
                </Badge>
                {user?.is_admin && <Badge variant="purple">Admin</Badge>}
              </div>
            </div>
          </div>
        </Card>

        {/* Details */}
        <Card>
          <h3 className="text-sm font-semibold text-dark-200 mb-4">Account Details</h3>
          <div className="space-y-4">
            {[
              { icon: User, label: 'Username', value: user?.username || '–' },
              { icon: Mail, label: 'Email', value: user?.email || '–' },
              { icon: Shield, label: 'Role', value: user?.is_admin ? 'Administrator' : 'User' },
              { icon: Key, label: 'User ID', value: `#${user?.id}` },
            ].map(({ icon: Icon, label, value }) => (
              <div key={label} className="flex items-center justify-between py-3 border-b border-dark-800 last:border-0">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-dark-800 flex items-center justify-center">
                    <Icon className="w-4 h-4 text-dark-400" />
                  </div>
                  <span className="text-sm text-dark-400">{label}</span>
                </div>
                <span className="text-sm font-medium text-dark-200">{value}</span>
              </div>
            ))}
          </div>
        </Card>

        {/* Danger zone */}
        <Card>
          <h3 className="text-sm font-semibold text-red-400 mb-4">Danger Zone</h3>
          <Button
            variant="danger"
            icon={<LogOut className="w-4 h-4" />}
            onClick={logout}
          >
            Sign Out
          </Button>
        </Card>
      </div>
    </DashboardLayout>
  )
}
