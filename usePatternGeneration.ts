/**
 * hooks/usePatternGeneration.ts
 *
 * React hook that bridges the pattern engine to the PatternContext.
 * Keeps all async state (loading, error) local; writes only the final
 * PatternData into context so the engine stays independent of React.
 *
 * generate() returns true on success, false on failure.
 * Callers use the return value to decide whether to navigate forward:
 *
 *   const { generate, isGenerating, error } = usePatternGeneration()
 *   const ok = await generate()
 *   if (ok) router.push('/preview')
 *
 * An inFlight ref prevents double-fire from rapid double-taps on the CTA.
 */

'use client'

import { useState, useCallback, useRef } from 'react'
import { usePattern } from '@/context/PatternContext'
import { generatePattern } from '@/modules/pattern-engine/generatePattern'

interface UsePatternGenerationResult {
  generate:     () => Promise<boolean>
  isGenerating: boolean
  error:        string | null
}

export function usePatternGeneration(): UsePatternGenerationResult {
  const { state, dispatch } = usePattern()
  const [error, setError]   = useState<string | null>(null)
  const inFlight            = useRef(false)   // prevents concurrent generations

  const generate = useCallback(async (): Promise<boolean> => {
    // Guard: ignore tap if a generation is already running
    if (inFlight.current) return false

    const image = state.enhancedImage ?? state.rawImage
    if (!image) {
      setError('No image available. Please upload a photo first.')
      return false
    }

    inFlight.current = true
    setError(null)
    dispatch({ type: 'SET_GENERATING', payload: true })

    try {
      const patternData = await generatePattern(image, state.settings)
      dispatch({ type: 'SET_PATTERN_DATA', payload: patternData })
      return true
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Pattern generation failed'
      setError(message)
      dispatch({ type: 'SET_GENERATING', payload: false })
      return false
    } finally {
      inFlight.current = false
    }
  }, [state.rawImage, state.enhancedImage, state.settings, dispatch])

  return {
    generate,
    isGenerating: state.isGenerating,
    error,
  }
}
