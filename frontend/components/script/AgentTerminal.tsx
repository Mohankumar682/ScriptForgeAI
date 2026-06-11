'use client'
import { motion, AnimatePresence } from 'framer-motion'
import { useEffect, useRef, useState } from 'react'
import { clsx } from 'clsx'
import { Terminal, CheckCircle2, AlertCircle, Info, Loader2, Cpu } from 'lucide-react'

interface LogEntry {
  agent: string
  message: string
  status: 'info' | 'success' | 'warning' | 'error' | 'processing'
}

interface AgentTerminalProps {
  logs: LogEntry[]
  isRunning: boolean
}

const agentColors: Record<string, string> = {
  'System':           'text-dark-400',
  'Coordinator':      'text-cyan-400',
  'Dependency Agent': 'text-yellow-400',
  'OS Agent':         'text-green-400',
  'Security Agent':   'text-red-400',
  'Compatibility Agent': 'text-purple-400',
  'Script Generator': 'text-brand-400',
  'Report Agent':     'text-orange-400',
}

const statusIcons = {
  info:       <Info className="w-3.5 h-3.5 text-brand-400" />,
  success:    <CheckCircle2 className="w-3.5 h-3.5 text-green-400" />,
  warning:    <AlertCircle className="w-3.5 h-3.5 text-amber-400" />,
  error:      <AlertCircle className="w-3.5 h-3.5 text-red-400" />,
  processing: <Loader2 className="w-3.5 h-3.5 text-purple-400 animate-spin" />,
}

const agentSteps = [
  { agent: 'Coordinator',      message: 'Analyzing user requirements and creating task plan...', status: 'processing' },
  { agent: 'Dependency Agent', message: 'Resolving dependencies and package requirements...', status: 'processing' },
  { agent: 'OS Agent',         message: 'Generating OS-specific commands and configurations...', status: 'processing' },
  { agent: 'Security Agent',   message: 'Running security validation and risk assessment...', status: 'processing' },
  { agent: 'Compatibility Agent', message: 'Verifying version compatibility and execution order...', status: 'processing' },
  { agent: 'Script Generator', message: 'Assembling final executable installation script...', status: 'processing' },
  { agent: 'Report Agent',     message: 'Generating documentation and setup summary...', status: 'processing' },
]

export function AgentTerminal({ logs, isRunning }: AgentTerminalProps) {
  const bottomRef = useRef<HTMLDivElement>(null)
  const [simulatedLogs, setSimulatedLogs] = useState<LogEntry[]>([])
  const [stepIndex, setStepIndex] = useState(0)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [simulatedLogs, logs])

  // Simulate agent progress when running
  useEffect(() => {
    if (!isRunning) return
    setSimulatedLogs([{ agent: 'System', message: '🚀 Initializing ScriptForge AI multi-agent system...', status: 'info' }])
    setStepIndex(0)
  }, [isRunning])

  useEffect(() => {
    if (!isRunning || stepIndex >= agentSteps.length) return
    const timer = setTimeout(() => {
      setSimulatedLogs(prev => [...prev, agentSteps[stepIndex] as LogEntry])
      setStepIndex(prev => prev + 1)
    }, 1200)
    return () => clearTimeout(timer)
  }, [isRunning, stepIndex])

  const displayLogs = logs.length > 0 ? logs : simulatedLogs

  return (
    <div className="terminal rounded-2xl overflow-hidden border border-dark-800">
      {/* Header */}
      <div className="flex items-center gap-2 px-4 py-3 bg-dark-900 border-b border-dark-800">
        <div className="flex gap-1.5">
          <div className="w-3 h-3 rounded-full bg-red-500/80" />
          <div className="w-3 h-3 rounded-full bg-amber-500/80" />
          <div className="w-3 h-3 rounded-full bg-green-500/80" />
        </div>
        <div className="flex items-center gap-2 ml-2">
          <Terminal className="w-3.5 h-3.5 text-dark-400" />
          <span className="text-xs text-dark-400 font-mono">ScriptForge AI — Agent Logs</span>
        </div>
        {isRunning && (
          <div className="ml-auto flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
            <span className="text-xs text-green-400 font-mono">RUNNING</span>
          </div>
        )}
      </div>

      {/* Log content */}
      <div className="p-4 h-72 overflow-y-auto font-mono text-xs space-y-1.5 bg-dark-950">
        {displayLogs.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-dark-600 gap-2">
            <Cpu className="w-8 h-8" />
            <span>Waiting for agent execution...</span>
          </div>
        ) : (
          <AnimatePresence initial={false}>
            {displayLogs.map((log, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -5 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.2 }}
                className="flex items-start gap-2 terminal-line"
              >
                <span className="text-dark-600 flex-shrink-0 mt-0.5">
                  {String(i + 1).padStart(2, '0')}
                </span>
                <span className="flex-shrink-0 mt-0.5">
                  {statusIcons[log.status] || statusIcons.info}
                </span>
                <span className={clsx('flex-shrink-0 font-semibold', agentColors[log.agent] || 'text-dark-300')}>
                  [{log.agent}]
                </span>
                <span className={clsx('flex-1', {
                  'text-green-300': log.status === 'success',
                  'text-amber-300': log.status === 'warning',
                  'text-red-300':   log.status === 'error',
                  'text-dark-300':  log.status === 'info',
                  'text-purple-300': log.status === 'processing',
                })}>
                  {log.message}
                </span>
              </motion.div>
            ))}
          </AnimatePresence>
        )}
        {isRunning && (
          <motion.div
            animate={{ opacity: [1, 0] }}
            transition={{ duration: 0.8, repeat: Infinity, repeatType: 'reverse' }}
            className="text-brand-400"
          >
            ▋
          </motion.div>
        )}
        <div ref={bottomRef} />
      </div>
    </div>
  )
}
