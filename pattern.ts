// ─── Core domain types for EasyStitch pattern engine ────────────────────────
//
// Pipeline flow:
//   dataUrl → PixelGrid → QuantizedPalette + ColorMap → PatternData
//
// PatternData is the single output type consumed by rendering and PDF export.
// It is identical regardless of which stitch strategy produced it.

// ─── Stitch styles ────────────────────────────────────────────────────────────

/**
 * All supported stitch styles.
 *
 * graphghan      — filled square cells, any colour per cell (default, implemented)
 * c2c            — corner-to-corner diagonal blocks (placeholder)
 * singleCrochet  — tight SC grid; same visual as graphghan but different
 *                  stitch-count metadata and instructions (placeholder)
 * tapestry       — row-level colour-carry constraints enforced (placeholder)
 */
export type StitchStyle = 'graphghan' | 'c2c' | 'singleCrochet' | 'tapestry'

/**
 * How cells are ordered for pattern-reading instructions.
 * Stored in PatternMeta so PDF and preview renderers can draw guides correctly.
 *
 * rowByRow        — left-to-right, top-to-bottom (graphghan, singleCrochet)
 * diagonal        — corner-to-corner diagonal sweeps (c2c)
 * rowConstrained  — row-by-row with colour-carry validation notes (tapestry)
 */
export type TraversalOrder = 'rowByRow' | 'diagonal' | 'rowConstrained'

// ─── Grid / sizing ────────────────────────────────────────────────────────────

export interface GridSize {
  label:  string   // Beginner-friendly label e.g. "Small"
  width:  number
  height: number
}

// ─── Internal pipeline types (not exposed to UI) ─────────────────────────────

/**
 * Raw RGBA pixel data resampled to grid dimensions.
 * width * height * 4 bytes (R, G, B, A).
 */
export interface PixelGrid {
  data:   Uint8ClampedArray
  width:  number
  height: number
}

/**
 * A single colour in LAB colour space, used during quantization.
 * RGB stored alongside for fast nearest-neighbour lookup after bucketing.
 */
export interface LabColor {
  L:  number
  a:  number
  b:  number
  r:  number
  g:  number
  bl: number   // 'bl' avoids shadowing 'b' in closures
}

/**
 * A bucket of pixels used during median-cut quantization.
 * Each bucket is recursively split along its longest colour axis.
 */
export interface ColorBucket {
  pixels: LabColor[]
}

// ─── Palette & colour assignment ──────────────────────────────────────────────

/**
 * A single colour in the reduced palette.
 * Symbol assigned by perceived lightness: dark → light = first → last symbol.
 */
export interface ColorEntry {
  hex:         string
  r:           number
  g:           number
  b:           number
  symbol:      string    // e.g. "■", "●", "▲" — unique within a palette
  label?:      string    // Optional yarn colour name (future: match to yarn DB)
  stitchCount?: number   // Populated after grid assembly
}

/**
 * Flat index array mapping each grid cell to its palette colour.
 * Length = width * height. Value = index into ColorEntry[].
 */
export type ColorMap = Uint8Array

// ─── Pattern output ───────────────────────────────────────────────────────────

/**
 * A single stitch cell in the final pattern grid.
 */
export interface Cell {
  colorIndex: number   // Index into PatternData.palette
  symbol:     string   // Copied from palette for render convenience
}

/**
 * Metadata attached to every generated pattern.
 * Includes traversal order so renderers know how to draw row guides.
 */
export interface PatternMeta {
  width:          number
  height:         number
  colorCount:     number
  stitchStyle:    StitchStyle
  traversalOrder: TraversalOrder
  totalStitches:  number
  generatedAt:    string   // ISO timestamp
}

/**
 * The complete output of the pattern engine.
 * Shape is identical regardless of which strategy produced it.
 * This is the only type that rendering, preview, and PDF modules consume.
 */
export interface PatternData {
  grid:    Cell[][]
  palette: ColorEntry[]
  meta:    PatternMeta
}

// ─── User-facing settings ─────────────────────────────────────────────────────

export interface PatternSettings {
  stitchStyle: StitchStyle
  gridSize:    GridSize
  maxColors:   number
}

// ─── Wizard context state ─────────────────────────────────────────────────────

export interface PatternContextState {
  rawImage:      string | null   // Base64 data URL of uploaded image
  enhancedImage: string | null   // After optional AI cleanup step
  settings:      PatternSettings
  patternData:   PatternData | null
  isGenerating:  boolean
}
