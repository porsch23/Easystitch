'use client'

/**
 * components/layout/Header.tsx
 *
 * FIX #9: Header previously only accepted `title?` — new pages were passing
 * `step` and `onBack` which were silently ignored. Header now uses pathname
 * (same as StepIndicator) to derive back navigation automatically.
 * No props needed for back nav — callers just render <Header />.
 * Optional `title` override still supported.
 */

import { useRouter, usePathname } from 'next/navigation'
import { WIZARD_STEPS } from '@/lib/constants'

interface HeaderProps {
  title?: string
}

export default function Header({ title }: HeaderProps) {
  const router   = useRouter()
  const pathname = usePathname()

  const currentIndex = WIZARD_STEPS.findIndex(s => s.path === pathname)
  const canGoBack    = currentIndex > 0
  const prevPath     = canGoBack ? WIZARD_STEPS[currentIndex - 1].path : '/'

  return (
    <header className="flex items-center justify-between px-5 pt-safe pb-2">
      <button
        onClick={() => router.push(prevPath)}
        className={[
          'flex items-center gap-1.5 text-sm font-body text-ink/50 hover:text-ink transition-colors',
          !canGoBack ? 'invisible' : '',
        ].join(' ')}
        aria-label="Go back"
      >
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
          <path d="M10 12L6 8L10 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
        Back
      </button>

      <span className="font-display text-lg text-ink/80">
        {title ?? 'EasyStitch'}
      </span>

      <div className="w-14" />
    </header>
  )
}
