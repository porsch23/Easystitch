import type { Metadata, Viewport } from 'next'
import { PatternProvider } from '@/context/PatternContext'
import './globals.css'

export const metadata: Metadata = {
  title: 'EasyStitch — Turn Photos into Crochet Patterns',
  description: 'Upload any photo and get a beginner-friendly crochet graph pattern in seconds.',
  manifest: '/manifest.json',
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,   // Prevent accidental zoom on input focus
  themeColor: '#faf3e7',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <PatternProvider>
          {children}
        </PatternProvider>
      </body>
    </html>
  )
}
