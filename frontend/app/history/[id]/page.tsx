'use client'
import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { ScriptViewer } from '@/components/script/ScriptViewer'
import { AgentTerminal } from '@/components/script/AgentTerminal'
import { historyAPI } from '@/services/api'
import { Button } from '@/components/ui/Button'
import { Badge, StatusBadge } from '@/components/ui/Badge'
import { Loader2, ArrowLeft, Calendar, Monitor, Layers } from 'lucide-react'
import { formatDate } from '@/utils/time'
import toast from 'react-hot-toast'

export default function ScriptDetailPage() {
  const { id } = useParams()
  const router = useRouter()
  const [script, setScript] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!id) return
    historyAPI.detail(Number(id))
      .then(res => setScript(res.data))
      .catch(() => {
        toast.error('Script not found')
        router.push('/history')
      })
      .finally(() => setLoading(false))
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id])

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex justify-center py-20">
          <Loader2 className="w-8 h-8 text-brand-400 animate-spin" />
        </div>
      </DashboardLayout>
    )
  }

  if (!script) return null

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
          <Button
            variant="ghost"
            size="sm"
            icon={<ArrowLeft className="w-4 h-4" />}
            onClick={() => router.back()}
          >
            Back to History
          </Button>

          <div className="mt-4">
            <div className="flex items-start justify-between">
              <div>
                <h1 className="text-2xl font-bold text-white">{script.title}</h1>
                <div className="flex items-center gap-3 mt-2 flex-wrap">
                  <StatusBadge status={script.status} />
                  <Badge variant="info">
                    <Monitor className="w-3 h-3 mr-1" />{script.os_type}
                  </Badge>
                  <Badge variant="purple">
                    <Layers className="w-3 h-3 mr-1" />{script.stack}
                  </Badge>
                  <span className="text-xs text-dark-500 flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    {formatDate(script.created_at)}
                  </span>
                </div>
              </div>
            </div>

            {script.user_request && (
              <div className="mt-4 p-4 rounded-xl bg-dark-900/60 border border-dark-800">
                <p className="text-xs text-dark-500 mb-1 font-mono">Original Request:</p>
                <p className="text-sm text-dark-300">{script.user_request}</p>
              </div>
            )}
          </div>
        </motion.div>

        {/* Agent logs */}
        {script.agent_logs && script.agent_logs.length > 0 && (
          <AgentTerminal logs={script.agent_logs} isRunning={false} />
        )}

        {/* Script viewer */}
        {script.script_content ? (
          <ScriptViewer
            scriptContent={script.script_content}
            documentation={script.documentation}
            summary={script.summary}
            riskAnalysis={script.risk_analysis}
            dependencyTree={script.dependency_tree}
            osType={script.os_type}
            outputType={script.output_type}
            title={script.title}
          />
        ) : (
          <div className="glass rounded-2xl p-10 text-center text-dark-400">
            <Loader2 className="w-8 h-8 mx-auto mb-3 animate-spin text-brand-400" />
            <p>Script is still being generated...</p>
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}
