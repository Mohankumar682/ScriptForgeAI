'use client'
import { useState, useEffect, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { AgentTerminal } from '@/components/script/AgentTerminal'
import { ScriptViewer } from '@/components/script/ScriptViewer'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { scriptsAPI } from '@/services/api'
import toast from 'react-hot-toast'
import { Zap, Terminal, Settings, Cpu, ChevronRight, Sparkles } from 'lucide-react'
import { clsx } from 'clsx'

const osOptions = [
  { value: 'ubuntu',  label: 'Ubuntu / Debian', icon: '🐧' },
  { value: 'windows', label: 'Windows',          icon: '🪟' },
  { value: 'macos',   label: 'macOS',            icon: '🍎' },
]

const stackOptions = [
  { value: 'mern',       label: 'MERN Stack',         icon: '⚡' },
  { value: 'python_ml',  label: 'Python ML',           icon: '🐍' },
  { value: 'devops',     label: 'DevOps',              icon: '🚀' },
  { value: 'java',       label: 'Java / Spring',       icon: '☕' },
  { value: 'docker',     label: 'Docker',              icon: '🐳' },
  { value: 'kubernetes', label: 'Kubernetes',          icon: '⎈' },
  { value: 'custom',     label: 'Custom',              icon: '🔧' },
]

const outputOptions = [
  { value: 'bash',       label: 'Bash Script (.sh)',       icon: '📄' },
  { value: 'powershell', label: 'PowerShell (.ps1)',        icon: '💠' },
  { value: 'docker',     label: 'Docker Compose (.yml)',   icon: '🐋' },
]

const samplePrompts = [
  'Set up a MERN stack development environment on Ubuntu with MongoDB and Redis',
  'Install Python ML environment with TensorFlow, PyTorch and Jupyter on macOS',
  'Configure a complete DevOps toolchain with Docker, Kubernetes, Terraform on Ubuntu',
  'Set up Java Spring Boot dev environment with Maven, Gradle and PostgreSQL',
  'Install a Docker + Docker Compose development environment on Windows',
]

function GeneratePageContent() {
  const searchParams = useSearchParams()
  const [title, setTitle] = useState('')
  const [userRequest, setUserRequest] = useState('')
  const [osType, setOsType] = useState('ubuntu')
  const [stack, setStack] = useState('mern')
  const [outputType, setOutputType] = useState('bash')
  const [securityMode, setSecurityMode] = useState(true)
  const [minimalInstall, setMinimalInstall] = useState(false)
  const [fullDevSetup, setFullDevSetup] = useState(false)
  const [isGenerating, setIsGenerating] = useState(false)
  const [result, setResult] = useState<any>(null)
  const [step, setStep] = useState<'form' | 'generating' | 'result'>('form')

  // Handle query params for quick start
  useEffect(() => {
    const q = searchParams.get('q')
    const s = searchParams.get('stack')
    if (q) setUserRequest(decodeURIComponent(q))
    if (s) setStack(s)
  }, [searchParams])

  // Auto-suggest title
  useEffect(() => {
    if (userRequest && !title) {
      const words = userRequest.split(' ').slice(0, 5).join(' ')
      setTitle(words)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userRequest])

  const handleGenerate = async () => {
    if (!userRequest.trim()) {
      toast.error('Please describe what you want to set up')
      return
    }
    if (!title.trim()) {
      toast.error('Please add a title for this script')
      return
    }

    setIsGenerating(true)
    setStep('generating')

    try {
      const res = await scriptsAPI.generate({
        title,
        user_request: userRequest,
        os_type: osType,
        stack,
        output_type: outputType,
        security_mode: securityMode,
        minimal_install: minimalInstall,
        full_dev_setup: fullDevSetup,
      })
      setResult(res.data)
      setStep('result')
      toast.success('Script generated successfully! 🎉')
    } catch (err: any) {
      const msg = err?.response?.data?.detail || 'Generation failed. Please try again.'
      toast.error(msg)
      setStep('form')
    } finally {
      setIsGenerating(false)
    }
  }

  const handleReset = () => {
    setResult(null)
    setStep('form')
    setTitle('')
    setUserRequest('')
  }

  return (
    <DashboardLayout>
      <div className="space-y-6 max-w-5xl">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-3xl font-bold text-white flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-brand-500 to-purple-600 flex items-center justify-center">
              <Zap className="w-5 h-5 text-white" />
            </div>
            Generate Script
          </h1>
          <p className="text-dark-400 mt-2">Describe your environment and let 7 AI agents build your installation script</p>
        </motion.div>

        <AnimatePresence mode="wait">
          {step === 'form' && (
            <motion.div
              key="form"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="grid lg:grid-cols-3 gap-6"
            >
              {/* Main form */}
              <div className="lg:col-span-2 space-y-5">
                <div className="glass rounded-2xl p-6">
                  <h2 className="text-sm font-semibold text-dark-200 mb-4 flex items-center gap-2">
                    <Terminal className="w-4 h-4 text-brand-400" />
                    Describe Your Setup
                  </h2>

                  <div className="space-y-4">
                    <Input
                      label="Script Title"
                      placeholder="MERN Dev Environment Setup"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                    />
                    <div>
                      <label className="text-sm font-medium text-dark-300 mb-1.5 block">
                        What do you want to set up?
                      </label>
                      <textarea
                        className="w-full h-32 bg-dark-900/80 border border-dark-700 rounded-xl px-4 py-3 text-sm text-dark-100 placeholder:text-dark-500 outline-none resize-none focus:border-brand-500/60 focus:ring-2 focus:ring-brand-500/20 transition-all"
                        placeholder="e.g. I want to set up a MERN stack development environment on Ubuntu 22.04 with MongoDB, Express, React, and Node.js. Include Git, VS Code extensions, and Docker support."
                        value={userRequest}
                        onChange={(e) => setUserRequest(e.target.value)}
                      />
                    </div>
                  </div>
                </div>

                {/* Config */}
                <div className="glass rounded-2xl p-6">
                  <h2 className="text-sm font-semibold text-dark-200 mb-4 flex items-center gap-2">
                    <Settings className="w-4 h-4 text-brand-400" />
                    Configuration
                  </h2>
                  <div className="grid sm:grid-cols-3 gap-4">
                    <Select
                      label="Operating System"
                      value={osType}
                      onChange={(e) => setOsType(e.target.value)}
                      options={osOptions}
                    />
                    <Select
                      label="Technology Stack"
                      value={stack}
                      onChange={(e) => setStack(e.target.value)}
                      options={stackOptions}
                    />
                    <Select
                      label="Output Format"
                      value={outputType}
                      onChange={(e) => setOutputType(e.target.value)}
                      options={outputOptions}
                    />
                  </div>

                  {/* Options */}
                  <div className="grid grid-cols-3 gap-3 mt-4">
                    {[
                      { key: 'security', label: 'Security Mode', desc: 'Validate for risks', value: securityMode, set: setSecurityMode },
                      { key: 'minimal', label: 'Minimal Install', desc: 'Essential only', value: minimalInstall, set: setMinimalInstall },
                      { key: 'full', label: 'Full Dev Setup', desc: 'All dev tools', value: fullDevSetup, set: setFullDevSetup },
                    ].map((opt) => (
                      <label
                        key={opt.key}
                        className={clsx(
                          'flex flex-col gap-1 p-3 rounded-xl border cursor-pointer transition-all',
                          opt.value
                            ? 'bg-brand-500/10 border-brand-500/30 text-brand-300'
                            : 'bg-dark-900/40 border-dark-700 text-dark-400 hover:border-dark-600'
                        )}
                      >
                        <div className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            className="custom-checkbox"
                            checked={opt.value}
                            onChange={(e) => opt.set(e.target.checked)}
                          />
                          <span className="text-xs font-medium">{opt.label}</span>
                        </div>
                        <span className="text-xs opacity-70 ml-5">{opt.desc}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <Button
                  size="lg"
                  className="w-full"
                  onClick={handleGenerate}
                  icon={<Sparkles className="w-5 h-5" />}
                >
                  Generate with AI Agents
                </Button>
              </div>

              {/* Sample prompts sidebar */}
              <div className="space-y-4">
                <div className="glass rounded-2xl p-5">
                  <h3 className="text-sm font-semibold text-dark-200 mb-3 flex items-center gap-2">
                    <Cpu className="w-4 h-4 text-brand-400" />
                    Sample Prompts
                  </h3>
                  <div className="space-y-2">
                    {samplePrompts.map((p, i) => (
                      <button
                        key={i}
                        onClick={() => {
                          setUserRequest(p)
                          setTitle(p.split(' ').slice(0, 5).join(' '))
                        }}
                        className="w-full text-left p-3 rounded-xl text-xs text-dark-400 hover:text-dark-200 hover:bg-dark-800/60 transition-all border border-transparent hover:border-dark-700"
                      >
                        <ChevronRight className="w-3 h-3 inline mr-1 text-brand-400" />
                        {p}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="glass rounded-2xl p-5">
                  <h3 className="text-sm font-semibold text-dark-200 mb-3">Agent Pipeline</h3>
                  <div className="space-y-2">
                    {['Coordinator', 'Dependency', 'OS Detection', 'Security', 'Compatibility', 'Script Gen', 'Reporter'].map((a, i) => (
                      <div key={i} className="flex items-center gap-2 text-xs text-dark-500">
                        <div className="w-1.5 h-1.5 rounded-full bg-dark-600" />
                        {a} Agent
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {step === 'generating' && (
            <motion.div
              key="generating"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-6"
            >
              <div className="glass rounded-2xl p-6 text-center">
                <div className="flex flex-col items-center gap-4">
                  <div className="relative">
                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-brand-500 to-purple-600 flex items-center justify-center animate-pulse">
                      <Cpu className="w-8 h-8 text-white" />
                    </div>
                    <div className="absolute inset-0 rounded-2xl border-2 border-brand-400/50 animate-ping" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-white">AI Agents Working...</h2>
                    <p className="text-dark-400 text-sm mt-1">7 agents collaborating to generate your script</p>
                  </div>
                </div>
              </div>
              <AgentTerminal logs={[]} isRunning={true} />
            </motion.div>
          )}

          {step === 'result' && result && (
            <motion.div
              key="result"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                  <span className="text-green-400 text-sm font-medium">Script Generated Successfully</span>
                </div>
                <Button variant="secondary" size="sm" onClick={handleReset}>
                  Generate Another
                </Button>
              </div>

              {result.agent_logs && result.agent_logs.length > 0 && (
                <AgentTerminal logs={result.agent_logs} isRunning={false} />
              )}

              <ScriptViewer
                scriptContent={result.script_content || '# No script content generated'}
                documentation={result.documentation}
                summary={result.summary}
                riskAnalysis={result.risk_analysis}
                dependencyTree={result.dependency_tree}
                osType={result.os_type || osType}
                outputType={result.output_type || outputType}
                title={result.title || title}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </DashboardLayout>
  )
}

export default function GeneratePage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-dark-950" />}>
      <GeneratePageContent />
    </Suspense>
  )
}
