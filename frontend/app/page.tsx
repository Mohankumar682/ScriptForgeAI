'use client'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { Terminal, Zap, Shield, Code2, ArrowRight, Github, Star, CheckCircle2, Cpu, Globe, Lock } from 'lucide-react'
import { Button } from '@/components/ui/Button'

const features = [
  { icon: Cpu, title: 'Multi-Agent AI', desc: '7 specialized AI agents collaborate to generate perfect scripts', color: 'text-brand-400', bg: 'bg-brand-500/10' },
  { icon: Shield, title: 'Security First', desc: 'Built-in security validation detects malicious commands automatically', color: 'text-green-400', bg: 'bg-green-500/10' },
  { icon: Globe, title: 'Cross-Platform', desc: 'Ubuntu, Windows, macOS — all platforms supported natively', color: 'text-purple-400', bg: 'bg-purple-500/10' },
  { icon: Code2, title: 'Any Stack', desc: 'MERN, Python ML, DevOps, Java, Docker, Kubernetes and more', color: 'text-orange-400', bg: 'bg-orange-500/10' },
  { icon: Zap, title: 'Instant Generation', desc: 'Production-ready scripts in seconds with full documentation', color: 'text-yellow-400', bg: 'bg-yellow-500/10' },
  { icon: Lock, title: 'Secure Auth', desc: 'JWT-based authentication with role-based access control', color: 'text-red-400', bg: 'bg-red-500/10' },
]

const agents = [
  { name: 'Coordinator', role: 'Orchestrates all agents', color: 'from-brand-500 to-cyan-500' },
  { name: 'OS Detection', role: 'Platform-specific commands', color: 'from-green-500 to-emerald-500' },
  { name: 'Dependency', role: 'Resolves all packages', color: 'from-yellow-500 to-orange-500' },
  { name: 'Security', role: 'Validates safety', color: 'from-red-500 to-pink-500' },
  { name: 'Compatibility', role: 'Version conflict check', color: 'from-purple-500 to-violet-500' },
  { name: 'Script Gen', role: 'Builds final script', color: 'from-blue-500 to-indigo-500' },
  { name: 'Reporter', role: 'Creates documentation', color: 'from-teal-500 to-cyan-500' },
]

const stacks = ['MERN Stack', 'Python ML', 'DevOps', 'Java Spring', 'Docker', 'Kubernetes', 'CI/CD Pipeline', 'Custom']

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-dark-950 overflow-hidden">
      {/* Nav */}
      <nav className="fixed top-0 inset-x-0 z-50 flex items-center justify-between px-6 py-4 backdrop-blur-xl border-b border-dark-800/50 bg-dark-950/80">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-brand-500 to-purple-600 flex items-center justify-center">
            <Terminal className="w-4 h-4 text-white" />
          </div>
          <span className="font-bold text-white">ScriptForge</span>
          <span className="text-brand-400 font-mono text-sm">AI</span>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/login">
            <Button variant="ghost" size="sm">Login</Button>
          </Link>
          <Link href="/signup">
            <Button variant="primary" size="sm">Get Started Free</Button>
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative pt-32 pb-20 px-6 text-center overflow-hidden">
        {/* Background effects */}
        <div className="absolute inset-0 bg-grid-pattern opacity-30" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] rounded-full bg-brand-500/5 blur-3xl" />
        <div className="absolute top-20 right-20 w-64 h-64 rounded-full bg-purple-500/5 blur-2xl" />

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="relative z-10 max-w-4xl mx-auto"
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.1 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass border border-brand-500/20 text-sm text-brand-300 mb-8"
          >
            <Zap className="w-4 h-4 text-brand-400" />
            Powered by Gemini AI + CrewAI Multi-Agent Framework
          </motion.div>

          <h1 className="text-5xl md:text-7xl font-extrabold leading-tight mb-6">
            <span className="text-white">Generate Install</span>
            <br />
            <span className="gradient-text">Scripts with AI</span>
          </h1>

          <p className="text-xl text-dark-300 max-w-2xl mx-auto mb-10 leading-relaxed">
            Describe your environment. 7 AI agents collaborate to generate secure,
            OS-specific installation scripts automatically — in seconds.
          </p>

          <div className="flex items-center justify-center gap-4 flex-wrap">
            <Link href="/signup">
              <Button size="lg" icon={<Zap className="w-5 h-5" />}>
                Start Generating Free
              </Button>
            </Link>
            <Link href="/login">
              <Button variant="outline" size="lg" icon={<ArrowRight className="w-5 h-5" />}>
                View Demo
              </Button>
            </Link>
          </div>

          {/* Example prompt */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="mt-12 max-w-2xl mx-auto"
          >
            <div className="glass rounded-2xl p-4 border border-brand-500/20 text-left">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-2 h-2 rounded-full bg-red-400" />
                <div className="w-2 h-2 rounded-full bg-yellow-400" />
                <div className="w-2 h-2 rounded-full bg-green-400" />
                <span className="text-xs text-dark-500 ml-2 font-mono">ScriptForge AI</span>
              </div>
              <p className="text-sm text-dark-400 font-mono">
                <span className="text-brand-400">$</span> I want to set up a{' '}
                <span className="text-green-400 font-semibold">MERN stack</span> development environment on{' '}
                <span className="text-purple-400 font-semibold">Ubuntu 22.04</span>
                {' '}with <span className="text-orange-400">Docker support</span>
              </p>
              <div className="mt-3 flex items-center gap-2 text-xs text-dark-500">
                <CheckCircle2 className="w-3.5 h-3.5 text-green-400" />
                <span>7 agents working · 43 dependencies resolved · 0 security issues · Script ready</span>
              </div>
            </div>
          </motion.div>
        </motion.div>
      </section>

      {/* Stats */}
      <section className="py-12 px-6 border-y border-dark-800">
        <div className="max-w-5xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-6">
          {[
            { value: '7', label: 'AI Agents', suffix: '' },
            { value: '10+', label: 'Tech Stacks', suffix: '' },
            { value: '3', label: 'OS Platforms', suffix: '' },
            { value: '100%', label: 'Open Source', suffix: '' },
          ].map((stat, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.1 }}
              viewport={{ once: true }}
              className="text-center"
            >
              <p className="text-4xl font-bold gradient-text">{stat.value}</p>
              <p className="text-dark-400 text-sm mt-1">{stat.label}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section className="py-20 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Everything You Need
            </h2>
            <p className="text-dark-400 text-lg">Enterprise-grade features for developers and DevOps teams</p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
            {features.map((f, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.08 }}
                viewport={{ once: true }}
                className="glass rounded-2xl p-6 neon-border"
              >
                <div className={`w-10 h-10 rounded-xl ${f.bg} flex items-center justify-center mb-4`}>
                  <f.icon className={`w-5 h-5 ${f.color}`} />
                </div>
                <h3 className="font-semibold text-dark-100 mb-2">{f.title}</h3>
                <p className="text-sm text-dark-400 leading-relaxed">{f.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Agents workflow */}
      <section className="py-20 px-6 bg-gradient-to-b from-transparent to-dark-900/30">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              7 Agents, 1 Perfect Script
            </h2>
            <p className="text-dark-400">Each agent specializes in one aspect of script generation</p>
          </div>
          <div className="relative flex flex-wrap justify-center gap-4">
            {agents.map((agent, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.1 }}
                viewport={{ once: true }}
                whileHover={{ scale: 1.05 }}
                className="glass rounded-2xl p-5 text-center w-36"
              >
                <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${agent.color} mx-auto mb-3 flex items-center justify-center`}>
                  <Cpu className="w-5 h-5 text-white" />
                </div>
                <p className="text-xs font-semibold text-dark-100">{agent.name}</p>
                <p className="text-xs text-dark-500 mt-1">{agent.role}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Supported Stacks */}
      <section className="py-16 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-2xl font-bold text-white mb-8">Supported Stacks</h2>
          <div className="flex flex-wrap justify-center gap-3">
            {stacks.map((stack, i) => (
              <motion.span
                key={stack}
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                transition={{ delay: i * 0.05 }}
                viewport={{ once: true }}
                className="px-4 py-2 glass rounded-full text-sm text-dark-300 border border-dark-700 hover:border-brand-500/40 hover:text-brand-300 transition-all cursor-default"
              >
                {stack}
              </motion.span>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-6">
        <div className="max-w-2xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="glass rounded-3xl p-10 border border-brand-500/20 glow-blue-sm"
          >
            <Terminal className="w-12 h-12 text-brand-400 mx-auto mb-4" />
            <h2 className="text-3xl font-bold text-white mb-4">Ready to Build?</h2>
            <p className="text-dark-400 mb-8">
              Join developers using ScriptForge AI to automate their environment setup.
            </p>
            <Link href="/signup">
              <Button size="lg" icon={<ArrowRight className="w-5 h-5" />}>
                Create Free Account
              </Button>
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-6 border-t border-dark-800 text-center text-sm text-dark-500">
        <p>© 2024 ScriptForge AI · Built with Next.js, FastAPI & CrewAI</p>
      </footer>
    </div>
  )
}
