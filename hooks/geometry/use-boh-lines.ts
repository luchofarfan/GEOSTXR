import { useState, useCallback } from 'react'
import { GEOSTXR_CONFIG } from '@/lib/config'

export interface BOHLinesState {
  line1Angle: number
  line2Angle: number
  isVisible: boolean
  isInteractive: boolean
}

export interface BOHLinesActions {
  setLine1Angle: (angle: number) => void
  setLine2Angle: (angle: number) => void
  setVisibility: (visible: boolean) => void
  setInteractive: (interactive: boolean) => void
  resetAngles: () => void
  updateBOHLines: (line1Angle: number, line2Angle: number) => void
}

export function useBOHLines() {
  const [state, setState] = useState<BOHLinesState>({
    line1Angle: GEOSTXR_CONFIG.BOH.LINE1.OFFSET_ANGLE, // 0°
    line2Angle: GEOSTXR_CONFIG.BOH.LINE2.OFFSET_ANGLE, // 90°
    isVisible: true,
    isInteractive: true
  })

  const setLine1Angle = useCallback((angle: number) => {
    // Clamp angle within displacement range
    const clampedAngle = Math.max(
      -GEOSTXR_CONFIG.BOH.DISPLACEMENT_RANGE,
      Math.min(GEOSTXR_CONFIG.BOH.DISPLACEMENT_RANGE, angle)
    )
    setState(prev => ({ ...prev, line1Angle: clampedAngle }))
  }, [])

  const setLine2Angle = useCallback((angle: number) => {
    // Clamp angle within displacement range
    const clampedAngle = Math.max(
      -GEOSTXR_CONFIG.BOH.DISPLACEMENT_RANGE,
      Math.min(GEOSTXR_CONFIG.BOH.DISPLACEMENT_RANGE, angle)
    )
    setState(prev => ({ ...prev, line2Angle: clampedAngle }))
  }, [])

  const setVisibility = useCallback((visible: boolean) => {
    setState(prev => ({ ...prev, isVisible: visible }))
  }, [])

  const setInteractive = useCallback((interactive: boolean) => {
    setState(prev => ({ ...prev, isInteractive: interactive }))
  }, [])

  const resetAngles = useCallback(() => {
    setState(prev => ({
      ...prev,
      line1Angle: GEOSTXR_CONFIG.BOH.LINE1.OFFSET_ANGLE, // 0°
      line2Angle: GEOSTXR_CONFIG.BOH.LINE2.OFFSET_ANGLE  // 90°
    }))
  }, [])

  const updateBOHLines = useCallback((line1Angle: number, line2Angle: number) => {
    setState(prev => ({
      ...prev,
      line1Angle: Math.max(
        -GEOSTXR_CONFIG.BOH.DISPLACEMENT_RANGE,
        Math.min(GEOSTXR_CONFIG.BOH.DISPLACEMENT_RANGE, line1Angle)
      ),
      line2Angle: Math.max(
        -GEOSTXR_CONFIG.BOH.DISPLACEMENT_RANGE,
        Math.min(GEOSTXR_CONFIG.BOH.DISPLACEMENT_RANGE, line2Angle)
      )
    }))
  }, [])

  const actions: BOHLinesActions = {
    setLine1Angle,
    setLine2Angle,
    setVisibility,
    setInteractive,
    resetAngles,
    updateBOHLines
  }

  return { state, actions }
}
