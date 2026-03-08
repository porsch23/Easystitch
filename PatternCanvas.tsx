'use client'

/**
 * components/preview/PatternCanvas.tsx
 *
 * Renders the pattern grid onto a single <canvas> element.
 * Handles mobile pinch-to-zoom and pan via CSS transform — no redraws on gesture.
 *
 * FIX #7: Previously had two useEffects that both depended on [pattern, cellSize],
 * causing a double draw on every pattern change. Now a single useEffect handles
 * all draw triggers. showSymbols state is read inside the effect, not as a
 * separate effect dependency that causes redundant redraws.
 *
 * FIX #12: Zoom system is now unified. PatternCanvas owns CSS-transform scale
 * via touch gestures. ZoomControls on the preview page is removed — the canvas
 * is self-contained. cellSize prop is fixed at mount; all zoom is CSS transform.
 */

import { useRef, useEffect, useCallback } from 'react'
import { PatternData } from '@/types/pattern'
import {
  drawPatternToCanvas,
  computeCanvasSize,
  PREVIEW_DEFAULTS,
} from '@/modules/preview-rendering/canvasRenderer'

interface PatternCanvasProps {
  pattern:    PatternData
  cellSize?:  number
  className?: string
}

interface Transform {
  scale: number
  x:     number
  y:     number
}

const MIN_SCALE = 0.5
const MAX_SCALE = 4.0
const INITIAL_TRANSFORM: Transform = { scale: 1, x: 0, y: 0 }

function touchDistance(t: TouchList): number {
  const dx = t[0].clientX - t[1].clientX
  const dy = t[0].clientY - t[1].clientY
  return Math.sqrt(dx * dx + dy * dy)
}

function touchMidpoint(t: TouchList): { x: number; y: number } {
  return {
    x: (t[0].clientX + t[1].clientX) / 2,
    y: (t[0].clientY + t[1].clientY) / 2,
  }
}

export default function PatternCanvas({
  pattern,
  cellSize = PREVIEW_DEFAULTS.cellSize,
  className,
}: PatternCanvasProps) {
  const canvasRef   = useRef<HTMLCanvasElement>(null)
  const wrapperRef  = useRef<HTMLDivElement>(null)
  const tfRef       = useRef<Transform>(INITIAL_TRANSFORM)  // CSS transform state

  // Gesture tracking — all refs, zero setState on touch events
  const pinchDistRef  = useRef<number | null>(null)
  const panPointRef   = useRef<{ x: number; y: number } | null>(null)
  const isPinchingRef = useRef(false)
  const lastTapRef    = useRef<number>(0)

  // ── Single draw effect ─────────────────────────────────────────────────────
  // FIX #7: One effect, not two. Symbols shown when scale >= 2.5.
  // We read tfRef.current.scale directly — no useState for showSymbols.
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas || !pattern) return

    const showSymbols = tfRef.current.scale >= 2.5 && cellSize >= 10
    drawPatternToCanvas(canvas, pattern, { cellSize, gap: 1, showSymbols })

    // Reset pan/zoom when a new pattern loads
    tfRef.current = INITIAL_TRANSFORM
    applyTransform()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pattern, cellSize])

  // ── Apply CSS transform ────────────────────────────────────────────────────
  const applyTransform = useCallback(() => {
    const el = wrapperRef.current
    if (!el) return
    const { scale, x, y } = tfRef.current
    el.style.transform       = `translate(${x}px, ${y}px) scale(${scale})`
    el.style.transformOrigin = '0 0'
  }, [])

  // Redraw with/without symbols after a zoom gesture completes
  const redrawForZoom = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas || !pattern) return
    const showSymbols = tfRef.current.scale >= 2.5 && cellSize >= 10
    drawPatternToCanvas(canvas, pattern, { cellSize, gap: 1, showSymbols })
  }, [pattern, cellSize])

  // ── Touch: start ──────────────────────────────────────────────────────────
  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    if (e.touches.length === 2) {
      isPinchingRef.current  = true
      pinchDistRef.current   = touchDistance(e.touches)
      panPointRef.current    = null
    } else if (e.touches.length === 1) {
      isPinchingRef.current  = false
      panPointRef.current    = { x: e.touches[0].clientX, y: e.touches[0].clientY }
    }
  }, [])

  // ── Touch: move ───────────────────────────────────────────────────────────
  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    e.preventDefault()

    if (e.touches.length === 2 && pinchDistRef.current !== null) {
      const newDist  = touchDistance(e.touches)
      const mid      = touchMidpoint(e.touches)
      const delta    = newDist / pinchDistRef.current
      const t        = tfRef.current
      const newScale = Math.min(MAX_SCALE, Math.max(MIN_SCALE, t.scale * delta))
      const ratio    = newScale / t.scale

      tfRef.current      = { scale: newScale, x: mid.x - ratio * (mid.x - t.x), y: mid.y - ratio * (mid.y - t.y) }
      pinchDistRef.current = newDist
      applyTransform()

    } else if (e.touches.length === 1 && panPointRef.current && !isPinchingRef.current) {
      const dx = e.touches[0].clientX - panPointRef.current.x
      const dy = e.touches[0].clientY - panPointRef.current.y
      tfRef.current    = { ...tfRef.current, x: tfRef.current.x + dx, y: tfRef.current.y + dy }
      panPointRef.current = { x: e.touches[0].clientX, y: e.touches[0].clientY }
      applyTransform()
    }
  }, [applyTransform])

  // ── Touch: end ────────────────────────────────────────────────────────────
  const handleTouchEnd = useCallback((e: React.TouchEvent) => {
    if (e.touches.length < 2) {
      isPinchingRef.current = false
      pinchDistRef.current  = null
      // Redraw after pinch ends to apply symbol visibility at new scale
      redrawForZoom()
    }
    if (e.touches.length === 0) {
      panPointRef.current = null
      // Double-tap to reset
      const now = Date.now()
      if (now - lastTapRef.current < 300) {
        tfRef.current = INITIAL_TRANSFORM
        applyTransform()
        redrawForZoom()
      }
      lastTapRef.current = now
    }
  }, [applyTransform, redrawForZoom])

  const { width, height } = computeCanvasSize(pattern, { cellSize, gap: 1, showSymbols: false })

  return (
    <div
      style={{
        overflow:         'hidden',
        borderRadius:     16,
        background:       '#F2EAD8',
        touchAction:      'none',
        cursor:           'grab',
        userSelect:       'none',
        WebkitUserSelect: 'none',
      }}
      className={className}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      <div ref={wrapperRef} style={{ display: 'inline-block', willChange: 'transform' }}>
        <canvas
          ref={canvasRef}
          width={width}
          height={height}
          style={{ display: 'block' }}
          aria-label={`Crochet pattern grid, ${pattern.meta.width} by ${pattern.meta.height} stitches`}
        />
      </div>
    </div>
  )
}
