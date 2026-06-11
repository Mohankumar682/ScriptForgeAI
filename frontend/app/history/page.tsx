'use client'
import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { historyAPI } from '@/services/api'
import { StatusBadge, Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Loader2, Search, FileCode2, Trash2, Eye, ChevronLeft, ChevronRight, Clock } from 'lucide-react'
import { formatDistanceToNow } from '@/utils/time'
import toast from 'react-hot-toast'

const osIcons: Record<string, string> = { ubuntu: '🐧', windows: '🪟', macos: '🍎' }
const stackLabels: Record<string, string> = {
  mern: 'MERN', python_ml: 'Python ML', devops: 'DevOps',
  java: 'Java', docker: 'Docker', kubernetes: 'K8s', custom: 'Custom',
}

export default function HistoryPage() {
  const [scripts, setScripts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [search, setSearch] = useState('')
  const [deleting, setDeleting] = useState<number | null>(null)

  const fetchHistory = async (p = 1) => {
    setLoading(true)
    try {
      const res = await historyAPI.list(p, 10)
      setScripts(res.data.scripts || [])
      setTotalPages(res.data.pages || 1)
    } catch {
      toast.error('Failed to load history')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchHistory(page) }, [page])

  const handleDelete = async (id: number) => {
    if (!confirm('Delete this script?')) return
    setDeleting(id)
    try {
      await historyAPI.delete(id)
      setScripts(prev => prev.filter(s => s.id !== id))
      toast.success('Script deleted')
    } catch {
      toast.error('Failed to delete')
    } finally {
      setDeleting(null)
    }
  }

  const filtered = search
    ? scripts.filter(s =>
        s.title.toLowerCase().includes(search.toLowerCase()) ||
        s.stack.toLowerCase().includes(search.toLowerCase())
      )
    : scripts

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center">
                <Clock className="w-5 h-5 text-white" />
              </div>
              Script History
            </h1>
            <p className="text-dark-400 mt-2">All your previously generated installation scripts</p>
          </div>
          <Link href="/generate">
            <Button icon={<FileCode2 className="w-4 h-4" />}>New Script</Button>
          </Link>
        </motion.div>

        {/* Search */}
        <Input
          placeholder="Search by title or stack..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          icon={<Search className="w-4 h-4" />}
        />

        {/* Table */}
        <div className="glass rounded-2xl overflow-hidden">
          <div className="px-5 py-4 border-b border-dark-800 flex items-center justify-between">
            <p className="text-sm text-dark-400">{filtered.length} scripts</p>
          </div>

          {loading ? (
            <div className="flex justify-center py-16">
              <Loader2 className="w-8 h-8 text-brand-400 animate-spin" />
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-16">
              <FileCode2 className="w-12 h-12 text-dark-600 mx-auto mb-3" />
              <p className="text-dark-400">No scripts found</p>
              <Link href="/generate" className="text-brand-400 text-sm hover:underline mt-2 block">
                Generate your first script →
              </Link>
            </div>
          ) : (
            <div className="divide-y divide-dark-800/50">
              {filtered.map((script, i) => (
                <motion.div
                  key={script.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.03 }}
                  className="flex items-center gap-4 px-5 py-4 hover:bg-dark-800/30 transition-all group"
                >
                  <div className="w-10 h-10 rounded-xl bg-dark-800 flex items-center justify-center text-xl flex-shrink-0">
                    {osIcons[script.os_type] || '💻'}
                  </div>

                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-dark-200 truncate group-hover:text-white">
                      {script.title}
                    </p>
                    <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                      <Badge variant="default">{stackLabels[script.stack] || script.stack}</Badge>
                      <Badge variant="info">{script.os_type}</Badge>
                      <span className="text-xs text-dark-500 flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {formatDistanceToNow(script.created_at)}
                      </span>
                    </div>
                  </div>

                  <StatusBadge status={script.status} />

                  <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Link href={`/history/${script.id}`}>
                      <Button variant="ghost" size="sm" icon={<Eye className="w-3.5 h-3.5" />}>
                        View
                      </Button>
                    </Link>
                    <Button
                      variant="danger"
                      size="sm"
                      icon={deleting === script.id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
                      onClick={() => handleDelete(script.id)}
                      isLoading={deleting === script.id}
                    >
                      Delete
                    </Button>
                  </div>
                </motion.div>
              ))}
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-3 py-4 border-t border-dark-800">
              <Button
                variant="ghost" size="sm"
                icon={<ChevronLeft className="w-4 h-4" />}
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
              >
                Prev
              </Button>
              <span className="text-sm text-dark-400">{page} / {totalPages}</span>
              <Button
                variant="ghost" size="sm"
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
              >
                Next <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  )
}
