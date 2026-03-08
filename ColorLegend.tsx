'use client'

/**
 * components/preview/ColorLegend.tsx
 *
 * Displays the reduced colour palette with:
 * - Colour swatch
 * - Symbol character
 * - Colour label (if available) or fallback "Colour N"
 * - Stitch count and percentage
 *
 * Tapping a swatch highlights that colour in the parent (via onSelect).
 * This is optional — component works fine without the callback.
 */

import { ColorEntry } from '@/types/pattern'

interface ColorLegendProps {
  palette:         ColorEntry[]
  totalStitches:   number
  selectedIndex?:  number | null
  onSelect?:       (index: number | null) => void
}

export default function ColorLegend({
  palette,
  totalStitches,
  selectedIndex = null,
  onSelect,
}: ColorLegendProps) {
  function handleTap(i: number) {
    if (!onSelect) return
    onSelect(selectedIndex === i ? null : i)
  }

  return (
    <div style={{
      background:   'white',
      borderRadius: 20,
      padding:      16,
      boxShadow:    '0 2px 16px rgba(44,34,24,0.07)',
    }}>
      {/* Header */}
      <div style={{
        display:        'flex',
        justifyContent: 'space-between',
        alignItems:     'baseline',
        marginBottom:   14,
      }}>
        <p style={{
          fontSize:      11,
          fontWeight:    500,
          textTransform: 'uppercase',
          letterSpacing: '0.08em',
          color:         '#6B5744',
          fontFamily:    "'DM Sans', sans-serif",
        }}>
          Colour Key
        </p>
        <p style={{ fontSize: 11, color: '#C8BFB0', fontFamily: "'DM Sans', sans-serif" }}>
          {palette.length} colour{palette.length !== 1 ? 's' : ''}
        </p>
      </div>

      {/* Swatches */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
        {palette.map((entry, i) => {
          const count = entry.stitchCount ?? 0
          const pct   = totalStitches > 0 ? Math.round((count / totalStitches) * 100) : 0
          const isSelected = selectedIndex === i

          return (
            <button
              key={i}
              onClick={() => handleTap(i)}
              style={{
                display:       'flex',
                alignItems:    'center',
                gap:           10,
                background:    isSelected ? 'rgba(196,97,74,0.06)' : 'transparent',
                border:        `1.5px solid ${isSelected ? '#C4614A' : 'transparent'}`,
                borderRadius:  12,
                padding:       '8px 10px',
                cursor:        onSelect ? 'pointer' : 'default',
                textAlign:     'left',
                transition:    'all 0.15s ease',
              }}
            >
              {/* Swatch */}
              <div style={{
                width:        36,
                height:       36,
                borderRadius: 10,
                flexShrink:   0,
                background:   entry.hex,
                display:      'flex',
                alignItems:   'center',
                justifyContent: 'center',
                fontSize:     15,
                color:        'rgba(255,255,255,0.9)',
                boxShadow:    '0 2px 8px rgba(44,34,24,0.15)',
                fontFamily:   'sans-serif',
              }}>
                {entry.symbol}
              </div>

              {/* Label + count */}
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{
                  fontSize:   13,
                  fontWeight: 500,
                  color:      '#2C2218',
                  fontFamily: "'DM Sans', sans-serif",
                  whiteSpace: 'nowrap',
                  overflow:   'hidden',
                  textOverflow: 'ellipsis',
                }}>
                  {entry.label ?? `Colour ${i + 1}`}
                </div>
                <div style={{
                  fontSize:   11,
                  color:      '#6B5744',
                  fontFamily: "'DM Sans', sans-serif",
                  marginTop:  2,
                }}>
                  {count.toLocaleString()} st · {pct}%
                </div>
              </div>
            </button>
          )
        })}
      </div>
    </div>
  )
}
