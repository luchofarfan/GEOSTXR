/**
 * Video Gestures Hook
 * Handles pinch-zoom and rotation gestures for video feed adjustment
 */

import { useEffect, useRef, useState } from 'react'

interface GestureState {
  zoom: number
  rotation: number
}

export function useVideoGestures(containerRef: React.RefObject<HTMLElement>) {
  const [zoom, setZoom] = useState(1.0)
  const [rotation, setRotation] = useState(0)
  
  const gestureRef = useRef({
    initialDistance: 0,
    initialAngle: 0,
    initialZoom: 1.0,
    initialRotation: 0,
    isGesturing: false
  })

  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    const getTouchDistance = (touch1: Touch, touch2: Touch): number => {
      const dx = touch2.clientX - touch1.clientX
      const dy = touch2.clientY - touch1.clientY
      return Math.sqrt(dx * dx + dy * dy)
    }

    const getTouchAngle = (touch1: Touch, touch2: Touch): number => {
      const dx = touch2.clientX - touch1.clientX
      const dy = touch2.clientY - touch1.clientY
      return Math.atan2(dy, dx) * (180 / Math.PI)
    }

    const handleTouchStart = (e: TouchEvent) => {
      if (e.touches.length === 2) {
        // Two fingers - start gesture
        e.preventDefault()
        
        const touch1 = e.touches[0]
        const touch2 = e.touches[1]
        
        gestureRef.current.initialDistance = getTouchDistance(touch1, touch2)
        gestureRef.current.initialAngle = getTouchAngle(touch1, touch2)
        gestureRef.current.initialZoom = zoom
        gestureRef.current.initialRotation = rotation
        gestureRef.current.isGesturing = true
        
        console.log('🤞 Gesture started - 2 fingers detected')
      }
    }

    const handleTouchMove = (e: TouchEvent) => {
      if (e.touches.length === 2 && gestureRef.current.isGesturing) {
        e.preventDefault()
        
        const touch1 = e.touches[0]
        const touch2 = e.touches[1]
        
        // Calculate pinch zoom
        const currentDistance = getTouchDistance(touch1, touch2)
        const distanceRatio = currentDistance / gestureRef.current.initialDistance
        const newZoom = Math.max(0.5, Math.min(3.0, gestureRef.current.initialZoom * distanceRatio))
        
        // Calculate rotation
        const currentAngle = getTouchAngle(touch1, touch2)
        const angleDelta = currentAngle - gestureRef.current.initialAngle
        let newRotation = (gestureRef.current.initialRotation + angleDelta) % 360
        if (newRotation < 0) newRotation += 360
        
        setZoom(newZoom)
        setRotation(newRotation)
      }
    }

    const handleTouchEnd = (e: TouchEvent) => {
      if (e.touches.length < 2) {
        gestureRef.current.isGesturing = false
        console.log('🤚 Gesture ended')
      }
    }

    container.addEventListener('touchstart', handleTouchStart, { passive: false })
    container.addEventListener('touchmove', handleTouchMove, { passive: false })
    container.addEventListener('touchend', handleTouchEnd)
    container.addEventListener('touchcancel', handleTouchEnd)

    return () => {
      container.removeEventListener('touchstart', handleTouchStart)
      container.removeEventListener('touchmove', handleTouchMove)
      container.removeEventListener('touchend', handleTouchEnd)
      container.removeEventListener('touchcancel', handleTouchEnd)
    }
  }, [containerRef, zoom, rotation])

  const reset = () => {
    setZoom(1.0)
    setRotation(0)
  }

  return {
    zoom,
    rotation,
    setZoom,
    setRotation,
    reset
  }
}

