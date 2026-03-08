/**
 * preview-rendering/canvasRenderer.ts
 *
 * Pure function that draws a PatternData grid onto an HTMLCanvasElement.
 *
 * Why canvas and not DOM cells?
 * A 60×60 grid = 3,600 cells. As <div> elements that's 3,600 DOM nodes with
 * style recalculations on every render. As canvas fillRect() calls it's ~2ms
 * of painting with zero DOM overhead.
 *
 * The draw function is called once when patternData changes (via useEffect).
 * Zoom and pan are applied with CSS transform after that — no redraws needed.
 *
 * Also exported: a lightweight thumbnail draw for the "original → pattern"
 * comparison card that renders at a fixed small size.
 */

import { PatternData } from '@/types/pattern'

export interface DrawOptions {
  cellSize:    number   // px per cell, e.g. 12 for preview, 20 for PDF
  gap:         number   // px between cells (1 looks clean; 0 for tight PDF)
  showSymbols: boolean  // only legible when cellSize >= 14
}

export const PREVIEW_DEFAULTS: DrawOptions = {
  cellSize:    14,
  gap:         1,
  showSymbols: false,   // Off by default — toggle on when zoomed in
}

export const THUMBNAIL_DEFAULTS: DrawOptions = {
  cellSize:    6,
  gap:         0,
  showSymbols: false,
}

/**
 * Compute the pixel dimensions a canvas needs for a given pattern + options.
 */
export function computeCanvasSize(
  pattern:  PatternData,
  options:  DrawOptions
): { width: number; height: number } {
  const stride = options.cellSize + options.gap
  return {
    width:  pattern.meta.width  * stride - options.gap,
    height: pattern.meta.height * stride - options.gap,
  }
}

/**
 * Draw a full PatternData grid onto the provided canvas.
 *
 * Sets canvas.width/height automatically — caller just needs to size the
 * container element. Returns the computed pixel dimensions for layout use.
 *
 * Safe to call multiple times (e.g. when settings change) — overwrites cleanly.
 */
export function drawPatternToCanvas(
  canvas:  HTMLCanvasElement,
  pattern: PatternData,
  options: DrawOptions = PREVIEW_DEFAULTS
): { width: number; height: number } {
  const ctx = canvas.getContext('2d')
  if (!ctx) throw new Error('Could not acquire 2D canvas context')

  const { cellSize, gap, showSymbols } = options
  const stride = cellSize + gap
  const { width, height } = computeCanvasSize(pattern, options)

  // Set physical canvas resolution
  canvas.width  = width
  canvas.height = height

  // Background — matches the app parchment tone so gaps look intentional
  ctx.fillStyle = '#E4D9C8'
  ctx.fillRect(0, 0, width, height)

  const { grid, palette } = pattern

  // ── Draw cells ─────────────────────────────────────────────────────────────
  // All cells are drawn in a single loop — no batching needed at these sizes.
  // For grids >100×100 (future), batch by colour to reduce fillStyle switches.
  for (let row = 0; row < grid.length; row++) {
    for (let col = 0; col < grid[row].length; col++) {
      const cell  = grid[row][col]
      const color = palette[cell.colorIndex]
      if (!color) continue

      const x = col * stride
      const y = row * stride

      ctx.fillStyle = color.hex
      ctx.fillRect(x, y, cellSize, cellSize)
    }
  }

  // ── Draw symbols (only when cells are large enough to read) ───────────────
  if (showSymbols && cellSize >= 14) {
    ctx.textAlign    = 'center'
    ctx.textBaseline = 'middle'
    ctx.font         = `${Math.floor(cellSize * 0.5)}px sans-serif`

    for (let row = 0; row < grid.length; row++) {
      for (let col = 0; col < grid[row].length; col++) {
        const cell  = grid[row][col]
        const color = palette[cell.colorIndex]
        if (!color || !cell.symbol) continue

        const x = col * stride + cellSize / 2
        const y = row * stride + cellSize / 2

        // White symbol with slight shadow for contrast on any background
        ctx.fillStyle    = 'rgba(255,255,255,0.75)'
        ctx.fillText(cell.symbol, x, y)
      }
    }
  }

  return { width, height }
}

/**
 * Draw a small thumbnail of the pattern — used in the export confirmation card.
 * Renders at THUMBNAIL_DEFAULTS (6px cells, no gap, no symbols).
 */
export function drawPatternThumbnail(
  canvas:  HTMLCanvasElement,
  pattern: PatternData
): void {
  drawPatternToCanvas(canvas, pattern, THUMBNAIL_DEFAULTS)
}
