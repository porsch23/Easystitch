'use client'

interface BottomCTAProps {
  primaryLabel:    string
  onPrimary:       () => void
  secondaryLabel?: string
  onSecondary?:    () => void
  primaryDisabled?: boolean
  isLoading?:      boolean
}

export default function BottomCTA({
  primaryLabel,
  onPrimary,
  secondaryLabel,
  onSecondary,
  primaryDisabled = false,
  isLoading       = false,
}: BottomCTAProps) {
  return (
    <div className="fixed bottom-0 left-0 right-0 bg-cream-50/95 backdrop-blur-sm border-t border-cream-200 px-5 pt-4 pb-safe z-50">
      {/* Primary action */}
      <button
        onClick={onPrimary}
        disabled={primaryDisabled || isLoading}
        className={[
          'w-full rounded-2xl py-4 font-body font-semibold text-base transition-all duration-200',
          primaryDisabled || isLoading
            ? 'bg-cream-200 text-ink/30 cursor-not-allowed'
            : 'bg-rose-DEFAULT text-white shadow-soft active:scale-[0.98] hover:bg-rose-deep',
        ].join(' ')}
      >
        {isLoading ? (
          <span className="flex items-center justify-center gap-2">
            <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"/>
            </svg>
            Working on it…
          </span>
        ) : primaryLabel}
      </button>

      {/* Optional secondary action */}
      {secondaryLabel && onSecondary && (
        <button
          onClick={onSecondary}
          className="w-full mt-3 py-2.5 font-body text-sm text-ink/50 hover:text-ink transition-colors"
        >
          {secondaryLabel}
        </button>
      )}
    </div>
  )
}
