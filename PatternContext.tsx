'use client'

import React, { createContext, useContext, useReducer } from 'react'
import { PatternContextState, PatternSettings, PatternData } from '@/types/pattern'
import { DEFAULT_SETTINGS } from '@/lib/constants'

// ─── Mock pattern data — matches current PatternData shape exactly ────────────

const MOCK_PALETTE = [
  { hex: '#2a2118', r: 42,  g: 33,  b: 24,  symbol: '■', label: 'Dark Cocoa',   stitchCount: 62  },
  { hex: '#5c7a55', r: 92,  g: 122, b: 85,  symbol: '●', label: 'Forest Green', stitchCount: 58  },
  { hex: '#c9a96e', r: 201, g: 169, b: 110, symbol: '▲', label: 'Golden Sand',  stitchCount: 72  },
  { hex: '#89a882', r: 137, g: 168, b: 130, symbol: '◆', label: 'Sage Green',   stitchCount: 88  },
  { hex: '#e8786e', r: 232, g: 120, b: 110, symbol: '★', label: 'Coral Red',    stitchCount: 54  },
  { hex: '#faf3e7', r: 250, g: 243, b: 231, symbol: '✿', label: 'Cream White',  stitchCount: 66  },
]

const MOCK_PATTERN_DATA: PatternData = {
  palette: MOCK_PALETTE,
  grid: Array.from({ length: 20 }, (_, row) =>
    Array.from({ length: 20 }, (_, col) => ({
      colorIndex: (row * 3 + col * 2) % 6,
      symbol: MOCK_PALETTE[(row * 3 + col * 2) % 6].symbol,
    }))
  ),
  meta: {
    width:          20,
    height:         20,
    colorCount:     6,
    stitchStyle:    'graphghan',
    traversalOrder: 'rowByRow',
    totalStitches:  400,
    generatedAt:    new Date().toISOString(),
  },
}

// ─── State & Actions ─────────────────────────────────────────────────────────

type Action =
  | { type: 'SET_RAW_IMAGE';        payload: string }
  | { type: 'SET_ENHANCED_IMAGE';   payload: string }
  | { type: 'CLEAR_ENHANCED_IMAGE' }
  | { type: 'UPDATE_SETTINGS';      payload: Partial<PatternSettings> }
  | { type: 'SET_PATTERN_DATA';     payload: PatternData }
  | { type: 'SET_GENERATING';       payload: boolean }
  | { type: 'RESET' }

const initialState: PatternContextState = {
  rawImage:      null,
  enhancedImage: null,
  settings:      DEFAULT_SETTINGS,
  patternData:   MOCK_PATTERN_DATA,
  isGenerating:  false,
}

function patternReducer(state: PatternContextState, action: Action): PatternContextState {
  switch (action.type) {
    case 'SET_RAW_IMAGE':
      // Clear enhanced image and pattern when user uploads new photo
      return { ...state, rawImage: action.payload, enhancedImage: null, patternData: null }
    case 'SET_ENHANCED_IMAGE':
      return { ...state, enhancedImage: action.payload }
    case 'CLEAR_ENHANCED_IMAGE':
      return { ...state, enhancedImage: null }
    case 'UPDATE_SETTINGS':
      return { ...state, settings: { ...state.settings, ...action.payload } }
    case 'SET_PATTERN_DATA':
      return { ...state, patternData: action.payload, isGenerating: false }
    case 'SET_GENERATING':
      return { ...state, isGenerating: action.payload }
    case 'RESET':
      return initialState
    default:
      return state
  }
}

// ─── Context ─────────────────────────────────────────────────────────────────

interface PatternContextValue {
  state:    PatternContextState
  dispatch: React.Dispatch<Action>
}

const PatternContext = createContext<PatternContextValue | null>(null)

export function PatternProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(patternReducer, initialState)
  return (
    <PatternContext.Provider value={{ state, dispatch }}>
      {children}
    </PatternContext.Provider>
  )
}

export function usePattern() {
  const ctx = useContext(PatternContext)
  if (!ctx) throw new Error('usePattern must be used within PatternProvider')
  return ctx
}
