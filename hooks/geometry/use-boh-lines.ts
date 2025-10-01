import { useState, useCallback } from 'react'
import { GEOSTXR_CONFIG } from '@/lib/config'

export interface BOHLinesState {
  line1Angle: number
  line2Angle: number
  isVisible: boolean
  isInteractive: boolean
  enableSnapping: boolean
}

export interface BOHLinesActions {
  setLine1Angle: (angle: number) => void
  setLine2Angle: (angle: number) => void
  setVisibility: (visible: boolean) => void
  setInteractive: (interactive: boolean) => void
  setSnapping: (enabled: boolean) => void
  resetAngles: () => void
  updateBOHLines: (line1Angle: number, line2Angle: number) => void
}

export function useBOHLines() {
  const [state, setState] = useState<BOHLinesState>({
    line1Angle: GEOSTXR_CONFIG.BOH.LINE1.OFFSET_ANGLE, // 90°
    line2Angle: GEOSTXR_CONFIG.BOH.LINE2.OFFSET_ANGLE, // 90°
    isVisible: true,
    isInteractive: true,
    enableSnapping: false
  })

  const setLine1Angle = useCallback((angle: number) => {
    // Clamp angle within displacement range (90° ± 20°)
    const clampedAngle = Math.max(
      90 - GEOSTXR_CONFIG.BOH.DISPLACEMENT_RANGE, // 70°
      Math.min(90 + GEOSTXR_CONFIG.BOH.DISPLACEMENT_RANGE, angle) // 110°
    )
    setState(prev => ({ ...prev, line1Angle: clampedAngle }))
  }, [])

  const setLine2Angle = useCallback((angle: number) => {
    // Clamp angle within displacement range (90° ± 20°)
    const clampedAngle = Math.max(
      90 - GEOSTXR_CONFIG.BOH.DISPLACEMENT_RANGE, // 70°
      Math.min(90 + GEOSTXR_CONFIG.BOH.DISPLACEMENT_RANGE, angle) // 110°
    )
    setState(prev => ({ ...prev, line2Angle: clampedAngle }))
  }, [])

  const setVisibility = useCallback((visible: boolean) => {
    setState(prev => ({ ...prev, isVisible: visible }))
  }, [])

  const setInteractive = useCallback((interactive: boolean) => {
    setState(prev => ({ ...prev, isInteractive: interactive }))
  }, [])

  const setSnapping = useCallback((enabled: boolean) => {
    setState(prev => ({ ...prev, enableSnapping: enabled }))
  }, [])

  const resetAngles = useCallback(() => {
    setState(prev => ({
      ...prev,
      line1Angle: GEOSTXR_CONFIG.BOH.LINE1.OFFSET_ANGLE, // 90°
      line2Angle: GEOSTXR_CONFIG.BOH.LINE2.OFFSET_ANGLE  // 90°
    }))
  }, [])

  const updateBOHLines = useCallback((line1Angle: number, line2Angle: number) => {
    setState(prev => ({
      ...prev,
      line1Angle: Math.max(
        90 - GEOSTXR_CONFIG.BOH.DISPLACEMENT_RANGE, // 70°
        Math.min(90 + GEOSTXR_CONFIG.BOH.DISPLACEMENT_RANGE, line1Angle) // 110°
      ),
      line2Angle: Math.max(
        90 - GEOSTXR_CONFIG.BOH.DISPLACEMENT_RANGE, // 70°
        Math.min(90 + GEOSTXR_CONFIG.BOH.DISPLACEMENT_RANGE, line2Angle) // 110°
      )
    }))
  }, [])

  const actions: BOHLinesActions = {
    setLine1Angle,
    setLine2Angle,
    setVisibility,
    setInteractive,
    setSnapping,
    resetAngles,
    updateBOHLines
  }

  return { state, actions }
}
