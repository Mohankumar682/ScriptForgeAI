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
  'System':              'text-dark-400',
  'Coordinator':         'text-cyan-400',
  'Dependency Agent':    'text-yellow-400',
  'OS Agent':            'text-green-400',
  'Security Agent':      'text-red-400',
  'Compatibility Agent': 'text-purple-400',
  'Script Generator':    'text-brand-400',
  'Report Agent':        'text-orange-400',
}

function StatusIcon({ status }: { status: LogEntry['status'] }) {
  switch (status) {
    case 'success':    return <CheckCircle2 className="w-3.5 h-3.5 text-green-400 flex-shrink-0" />
    case 'warning':    return <AlertCircle  className="w-3.5 h-3.5 text-amber-400 flex-shrink-0" />
    case 'error':      return <AlertCircle  className="w-3.5 h-3.5 text-red-400 flex-shrink-0" />
    case 'processing': return <Loader2      className="w-3.5 h-3.5 text-purple-400 animate-spin flex-shrink-0" />
    default:           return <Info         className="w-3.5 h-3.5 text-brand-400 flex-shrink-0" />
  }
}

// Simulated steps shown while the real request is in-flight
const agentSteps: LogEntry[] = [
  { agent: 'Coordinator',         message: 'Analyzing user requirements and creating task plan', status: 'processing' },
  { agent: 'Dependency Agent',    message: 'Resolving dependencies and package requirements',   status: 'processing' },
  { agent: 'OS Agent',            message: 'Generating OS-specific commands and configurations', status: 'processing' },
  { agent: 'Security Agent',      message: 'Running security validation and risk assessment',   status: 'processing' },
  { agent: 'Compatibility Agent', message: 'Verifying version compatibility and execution order', status: 'processing' },
  { agent: 'Script Generator',    message: 'Assembling final executable installation script',   status: 'processing' },
  { agent: 'Report Agent',        message: 'Generating documentation and setup summary',        status: 'processing' },
]

export function AgentTerminal({ logs, isRunning }: AgentTerminalProps) {
  const bottomRef = useRef<HTMLDivElement>(null)
  const [simulatedLogs, setSimulatedLogs] = useState<LogEntry[]>([])
  const [stepIndex, setStepIndex] = useState(0)

  // Auto-scroll on new entries
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [simulatedLogs, logs])

  // Reset simulation when a new run starts
  useEffect(() => {
    if (!isRunning) return
    setSimulatedLogs([{
      agent: 'System',
      message: '🚀 Initializing ScriptForge AI multi-agent system...',
      status: 'info',
    }])
    setStepIndex(0)
  }, [isRunning])

  // Add simulated steps one by one while running
  useEffect(() => {
    if (!isRunning || stepIndex >= agentSteps.length) return
    const timer = setTimeout(() => {
      setSimulatedLogs(prev => [...prev, agentSteps[stepIndex]])
      setStepIndex(prev => prev + 1)
    }, 1100)
    return () => clearTimeout(timer)
  }, [isRunning, stepIndex])

  // When real logs arrive (isRunning flips to false), normalise any
  // leftover "processing" entries to "success" so every agent shows a tick
  const displayLogs: LogEntry[] = (() => {
    const source = logs.length > 0 ? logs : simulatedLogs
    if (isRunning) return source
    // finished — replace every "processing" with "success"
    return source.map(log =>
      log.status === 'processing'
        ? { ...log, status: 'success', message: log.message.replace('...', '').trimEnd() + ' — completed' }
        : log
    )
  })()

  const isDone = !isRunning && displayLogs.length > 0

  return (
    <div className="terminal rounded-2xl overflow-hidden border border-dark-800">
      {/* Header bar */}
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
        <div className="ml-auto flex items-center gap-2">
          {isRunning ? (
            <>
              <div className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
              <span className="text-xs text-green-400 font-mono">RUNNING</span>
            </>
          ) : isDone ? (
            <>
              <CheckCircle2 className="w-3.5 h-3.5 text-green-400" />
              <span className="text-xs text-green-400 font-mono">COMPLETED</span>
            </>
          ) : null}
        </div>
      </div>

      {/* Log entries */}
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
                initial={{ opacity: 0, x: -6 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.2 }}
                className="flex items-start gap-2"
              >
                {/* Line number */}
                <span className="text-dark-600 flex-shrink-0 mt-0.5 w-5 text-right">
                  {String(i + 1).padStart(2, '0')}
                </span>

                {/* Status icon */}
                <span className="mt-0.5">
                  <StatusIcon status={log.status} />
                </span>

                {/* Agent name */}
                <span className={clsx(
                  'flex-shrink-0 font-semibold',
                  agentColors[log.agent] ?? 'text-dark-300'
                )}>
                  [{log.agent}]
                </span>

                {/* Message */}
                <span className={clsx('flex-1', {
                  'text-green-300':  log.status === 'success',
                  'text-amber-300':  log.status === 'warning',
                  'text-red-300':    log.status === 'error',
                  'text-dark-300':   log.status === 'info',
                  'text-purple-300': log.status === 'processing',
                })}>
                  {log.message}
                </span>
              </motion.div>
            ))}
          </AnimatePresence>
        )}

        {/* Blinking cursor while running */}
        {isRunning && (
          <motion.div
            animate={{ opacity: [1, 0] }}
            transition={{ duration: 0.8, repeat: Infinity, repeatType: 'reverse' }}
            className="text-brand-400 mt-1"
          >
            ▋
          </motion.div>
        )}

        <div ref={bottomRef} />
      </div>
    </div>
  )
}
