import { GridSize, StitchStyle } from '@/types/pattern'

// ─── Grid sizes ───────────────────────────────────────────────────────────────

export const GRID_SIZES: GridSize[] = [
  { label: 'Small',  width: 20, height: 20 },
  { label: 'Medium', width: 40, height: 40 },
  { label: 'Large',  width: 60, height: 60 },
]

// ─── Default settings ─────────────────────────────────────────────────────────

export const DEFAULT_SETTINGS = {
  stitchStyle: 'graphghan' as StitchStyle,
  gridSize:    GRID_SIZES[1],   // Medium
  maxColors:   6,
}

// ─── Stitch style display metadata ───────────────────────────────────────────

export interface StitchStyleMeta {
  label:       string
  description: string
  available:   boolean   // false = shown as "coming soon" in UI
}

export const STITCH_STYLE_META: Record<StitchStyle, StitchStyleMeta> = {
  graphghan: {
    label:       'Simple Blocks',
    description: 'Great for beginners',
    available:   true,
  },
  c2c: {
    label:       'Corner to Corner',
    description: 'Diagonal stitch pattern',
    available:   false,
  },
  singleCrochet: {
    label:       'Single Crochet',
    description: 'Tight, detailed grid',
    available:   false,
  },
  tapestry: {
    label:       'Tapestry',
    description: 'Colour-carry technique',
    available:   false,
  },
}

// ─── Symbols ──────────────────────────────────────────────────────────────────

// Assigned to palette colours in dark → light order
export const COLOR_SYMBOLS = ['■', '●', '▲', '◆', '★', '✿', '❤', '◉']

// ─── Color count limits ───────────────────────────────────────────────────────

export const MIN_COLORS = 2
export const MAX_COLORS = 8

// ─── Wizard steps ─────────────────────────────────────────────────────────────

export const WIZARD_STEPS = [
  { label: 'Upload',   path: '/upload'   },
  { label: 'Enhance',  path: '/enhance'  },
  { label: 'Settings', path: '/settings' },
  { label: 'Preview',  path: '/preview'  },
  { label: 'Export',   path: '/export'   },
]
