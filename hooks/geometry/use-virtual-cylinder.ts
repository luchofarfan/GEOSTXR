import { useState, useCallback } from 'react'
import { GEOSTXR_CONFIG } from '@/lib/config'

interface VirtualCylinderState {
  isVisible: boolean
  opacity: number
  position: {
    x: number
    y: number
    z: number
  }
  rotation: {
    x: number
    y: number
    z: number
  }
  scale: {
    x: number
    y: number
    z: number
  }
}

interface VirtualCylinderControls {
  toggleVisibility: () => void
  setOpacity: (opacity: number) => void
  setPosition: (x: number, y: number, z: number) => void
  setRotation: (x: number, y: number, z: number) => void
  setScale: (x: number, y: number, z: number) => void
  resetToDefault: () => void
}

export const useVirtualCylinder = (): [VirtualCylinderState, VirtualCylinderControls] => {
  const [state, setState] = useState<VirtualCylinderState>({
    isVisible: true,
    opacity: GEOSTXR_CONFIG.CYLINDER.OPACITY,
    position: { x: 0, y: 0, z: 0 },
    rotation: { x: 0, y: 0, z: 0 },
    scale: { x: 1, y: 1, z: 1 }
  })

  const toggleVisibility = useCallback(() => {
    setState(prev => ({ ...prev, isVisible: !prev.isVisible }))
  }, [])

  const setOpacity = useCallback((opacity: number) => {
    setState(prev => ({ ...prev, opacity: Math.max(0, Math.min(1, opacity)) }))
  }, [])

  const setPosition = useCallback((x: number, y: number, z: number) => {
    setState(prev => ({ ...prev, position: { x, y, z } }))
  }, [])

  const setRotation = useCallback((x: number, y: number, z: number) => {
    setState(prev => ({ ...prev, rotation: { x, y, z } }))
  }, [])

  const setScale = useCallback((x: number, y: number, z: number) => {
    setState(prev => ({ ...prev, scale: { x, y, z } }))
  }, [])

  const resetToDefault = useCallback(() => {
    setState({
      isVisible: true,
      opacity: GEOSTXR_CONFIG.CYLINDER.OPACITY,
      position: { x: 0, y: 0, z: 0 },
      rotation: { x: 0, y: 0, z: 0 },
      scale: { x: 1, y: 1, z: 1 }
    })
  }, [])

  const controls: VirtualCylinderControls = {
    toggleVisibility,
    setOpacity,
    setPosition,
    setRotation,
    setScale,
    resetToDefault
  }

  return [state, controls]
}
