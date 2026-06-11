'use client'
import { useState } from 'react'
import { motion } from 'framer-motion'
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism'
import { Copy, Check, Download, FileCode2, BookOpen, AlertTriangle, GitBranch } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import toast from 'react-hot-toast'
import ReactMarkdown from 'react-markdown'

interface ScriptViewerProps {
  scriptContent: string
  documentation?: string
  summary?: string
  riskAnalysis?: string
  dependencyTree?: Record<string, any>
  osType: string
  outputType: string
  title: string
  onDownload?: () => void
}

type Tab = 'script' | 'docs' | 'risk' | 'deps'

export function ScriptViewer({
  scriptContent, documentation, summary, riskAnalysis,
  dependencyTree, osType, outputType, title, onDownload
}: ScriptViewerProps) {
  const [activeTab, setActiveTab] = useState<Tab>('script')
  const [copied, setCopied] = useState(false)

  const language = outputType === 'powershell' ? 'powershell'
    : outputType === 'docker' ? 'yaml'
    : 'bash'

  const extension = outputType === 'powershell' ? '.ps1'
    : outputType === 'docker' ? '.yml'
    : '.sh'

  const handleCopy = () => {
    navigator.clipboard.writeText(scriptContent)
    setCopied(true)
    toast.success('Script copied to clipboard!')
    setTimeout(() => setCopied(false), 2000)
  }

  const handleDownload = () => {
    const blob = new Blob([scriptContent], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${title.toLowerCase().replace(/\s+/g, '_')}${extension}`
    a.click()
    URL.revokeObjectURL(url)
    toast.success('Script downloaded!')
    onDownload?.()
  }

  const handleDownloadDocs = () => {
    if (!documentation) return
    const blob = new Blob([documentation], { type: 'text/markdown' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${title.toLowerCase().replace(/\s+/g, '_')}_guide.md`
    a.click()
    URL.revokeObjectURL(url)
    toast.success('Documentation downloaded!')
  }

  const tabs = [
    { id: 'script' as Tab, label: 'Script', icon: FileCode2 },
    { id: 'docs' as Tab, label: 'Docs', icon: BookOpen },
    { id: 'risk' as Tab, label: 'Risk Report', icon: AlertTriangle },
    { id: 'deps' as Tab, label: 'Dependencies', icon: GitBranch },
  ]

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass rounded-2xl overflow-hidden"
    >
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-dark-800">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-brand-500/20 flex items-center justify-center">
            <FileCode2 className="w-4 h-4 text-brand-400" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-dark-100">{title}</h3>
            <div className="flex items-center gap-2 mt-0.5">
              <Badge variant="info">{osType}</Badge>
              <Badge variant="purple">{outputType}</Badge>
            </div>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="secondary" size="sm" icon={copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />} onClick={handleCopy}>
            {copied ? 'Copied!' : 'Copy'}
          </Button>
          <Button variant="primary" size="sm" icon={<Download className="w-3.5 h-3.5" />} onClick={handleDownload}>
            Download {extension}
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-dark-800 bg-dark-900/30">
        {tabs.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setActiveTab(id)}
            className={`flex items-center gap-2 px-4 py-3 text-sm font-medium transition-all border-b-2 ${
              activeTab === id
                ? 'text-brand-400 border-brand-400'
                : 'text-dark-500 border-transparent hover:text-dark-300'
            }`}
          >
            <Icon className="w-4 h-4" />
            {label}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="max-h-[600px] overflow-auto">
        {activeTab === 'script' && (
          <div className="relative">
            {/* Line count */}
            <div className="absolute top-3 right-3 z-10">
              <Badge variant="default">{scriptContent.split('\n').length} lines</Badge>
            </div>
            <SyntaxHighlighter
              language={language}
              style={vscDarkPlus}
              showLineNumbers
              customStyle={{
                background: '#0a0b10',
                margin: 0,
                padding: '20px',
                fontSize: '12px',
                lineHeight: '1.6',
                borderRadius: 0,
              }}
              lineNumberStyle={{ color: '#3d4050', minWidth: '2.5em' }}
            >
              {scriptContent}
            </SyntaxHighlighter>
          </div>
        )}

        {activeTab === 'docs' && (
          <div className="p-6">
            {documentation ? (
              <div className="flex justify-between items-start mb-4">
                <div />
                <Button variant="secondary" size="sm" icon={<Download className="w-3.5 h-3.5" />} onClick={handleDownloadDocs}>
                  Download MD
                </Button>
              </div>
            ) : null}
            <div className="prose prose-invert prose-sm max-w-none">
              {documentation ? (
                <ReactMarkdown>{documentation}</ReactMarkdown>
              ) : (
                <p className="text-dark-400">No documentation available.</p>
              )}
            </div>
          </div>
        )}

        {activeTab === 'risk' && (
          <div className="p-6">
            {summary && (
              <div className="mb-4 p-4 rounded-xl bg-brand-500/5 border border-brand-500/20">
                <p className="text-sm text-brand-300 font-medium mb-1">Summary</p>
                <p className="text-sm text-dark-300">{summary}</p>
              </div>
            )}
            <div className="prose prose-invert prose-sm max-w-none">
              {riskAnalysis ? (
                <ReactMarkdown>{riskAnalysis}</ReactMarkdown>
              ) : (
                <div className="flex items-center gap-2 text-green-400">
                  <Check className="w-5 h-5" />
                  <span>No security risks detected. Script is safe to execute.</span>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'deps' && (
          <div className="p-6">
            {dependencyTree ? (
              <div>
                <p className="text-sm text-dark-400 mb-4">Detected dependencies and requirements:</p>
                <SyntaxHighlighter
                  language="json"
                  style={vscDarkPlus}
                  customStyle={{ background: '#0a0b10', borderRadius: '12px', fontSize: '12px' }}
                >
                  {JSON.stringify(dependencyTree, null, 2)}
                </SyntaxHighlighter>
              </div>
            ) : (
              <p className="text-dark-400 text-sm">No dependency data available.</p>
            )}
          </div>
        )}
      </div>
    </motion.div>
  )
}
