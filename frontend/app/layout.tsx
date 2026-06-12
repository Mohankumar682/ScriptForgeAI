import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { Toaster } from 'react-hot-toast'
import { AuthProvider } from '@/components/layout/AuthProvider'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'ScriptForge AI — Multi-Agent Install Script Generator',
  description: 'AI-powered installation script generation using multi-agent collaboration. Generate secure, OS-specific installation scripts automatically.',
  keywords: ['AI', 'installation scripts', 'DevOps', 'automation', 'multi-agent'],
  openGraph: {
    title: 'ScriptForge AI',
    description: 'Generate production-ready installation scripts with AI',
    type: 'website',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.className} bg-dark-950 text-dark-100 antialiased`}>
        <AuthProvider>
          {children}
        </AuthProvider>
        <Toaster
          position="top-right"
          toastOptions={{
            style: {
              background: '#1a1c26',
              color: '#e2e3e7',
              border: '1px solid #3d4050',
              borderRadius: '12px',
              fontSize: '14px',
            },
            success: {
              iconTheme: { primary: '#12b7e8', secondary: '#0d0e17' },
            },
            error: {
              iconTheme: { primary: '#ef4444', secondary: '#0d0e17' },
            },
            duration: 4000,
          }}
        />
      </body>
    </html>
  )
}
