'use client'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { useEffect, useState } from 'react'
import { historyAPI } from '@/services/api'
import { StatusBadge } from '@/components/ui/Badge'
import { FileCode2, Clock, ChevronRight, Loader2 } from 'lucide-react'
import { formatDistanceToNow } from '@/utils/time'

interface Script {
  id: number
  title: string
  status: string
  os_type: string
  stack: string
  output_type: string
  created_at: string
}

const osIcons: Record<string, string> = {
  ubuntu: '🐧', windows: '🪟', macos: '🍎',
}

const stackColors: Record<string, string> = {
  mern: 'text-green-400', python_ml: 'text-yellow-400',
  devops: 'text-blue-400', java: 'text-orange-400',
  docker: 'text-cyan-400', kubernetes: 'text-purple-400',
}

export function RecentScripts() {
  const [scripts, setScripts] = useState<Script[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    historyAPI.list(1, 5).then((res) => {
      setScripts(res.data.scripts || [])
    }).catch(() => {}).finally(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <div className="glass rounded-2xl p-6">
        <h3 className="text-lg font-semibold text-dark-100 mb-4">Recent Scripts</h3>
        <div className="flex justify-center py-8">
          <Loader2 className="w-6 h-6 text-brand-400 animate-spin" />
        </div>
      </div>
    )
  }

  return (
    <div className="glass rounded-2xl p-6">
      <div className="flex items-center justify-between mb-5">
        <h3 className="text-lg font-semibold text-dark-100">Recent Scripts</h3>
        <Link href="/history" className="text-sm text-brand-400 hover:text-brand-300 flex items-center gap-1">
          View all <ChevronRight className="w-3 h-3" />
        </Link>
      </div>

      {scripts.length === 0 ? (
        <div className="text-center py-10">
          <FileCode2 className="w-12 h-12 text-dark-600 mx-auto mb-3" />
          <p className="text-dark-400 text-sm">No scripts generated yet</p>
          <Link href="/generate" className="text-brand-400 text-sm hover:underline mt-1 block">
            Generate your first script →
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {scripts.map((script, i) => (
            <motion.div
              key={script.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.05 }}
            >
              <Link href={`/history/${script.id}`}>
                <div className="flex items-center gap-4 p-3 rounded-xl hover:bg-dark-800/50 transition-all group">
                  <div className="w-10 h-10 rounded-lg bg-dark-800 flex items-center justify-center text-lg flex-shrink-0">
                    {osIcons[script.os_type] || '💻'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-dark-200 truncate group-hover:text-white transition-colors">
                      {script.title}
                    </p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className={`text-xs font-mono ${stackColors[script.stack] || 'text-dark-400'}`}>
                        {script.stack}
                      </span>
                      <span className="text-dark-600">·</span>
                      <span className="text-xs text-dark-500 flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {formatDistanceToNow(script.created_at)}
                      </span>
                    </div>
                  </div>
                  <StatusBadge status={script.status} />
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  )
}
