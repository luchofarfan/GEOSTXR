'use client'

import React, { useEffect, useState, useRef } from 'react'
import * as THREE from 'three'
import { GEOSTXR_CONFIG } from '@/lib/config'

interface BOHLinesOverlayProps {
  line1Angle: number
  line2Angle: number
  containerWidth: number
  containerHeight: number
  camera?: THREE.Camera
  cylinderHeight?: number
  radius?: number
  onLine1AngleChange?: (angle: number) => void
  onLine2AngleChange?: (angle: number) => void
  isInteractive?: boolean
  enableSnapping?: boolean
}

export function BOHLinesOverlay({ 
  line1Angle, 
  line2Angle,
  containerWidth,
  containerHeight,
  camera,
  cylinderHeight: cylHeight,
  radius: cylRadius,
  onLine1AngleChange,
  onLine2AngleChange,
  isInteractive = true,
  enableSnapping = false
}: BOHLinesOverlayProps) {
  const radius = cylRadius || GEOSTXR_CONFIG.CYLINDER.RADIUS // 3.175 cm
  const cylinderHeight = cylHeight || GEOSTXR_CONFIG.CYLINDER.HEIGHT // 30 cm
  
  // Drag state
  const [draggingLine, setDraggingLine] = useState<'line1' | 'line2' | null>(null)
  const [hoveredLine, setHoveredLine] = useState<'line1' | 'line2' | null>(null)
  
  // Calculate 3D positions on cylinder surface
  const angle1Rad = (line1Angle * Math.PI) / 180
  const angle2Rad = (line2Angle * Math.PI) / 180
  
  // Position on cylinder surface (viewing from +Y axis)
  // Camera is at +Y looking at origin, so:
  // - X = horizontal position (left/right)
  // - Y = depth (towards/away from camera)
  // - Z = vertical (up/down)
  // For angles measured from X-axis counterclockwise (top view):
  // - Angle 0° = right side (X=radius, Y=0)
  // - Angle 90° = front (X=0, Y=radius) - closest to camera at +Y
  // - Angle 180° = left side (X=-radius, Y=0)
  // - Angle 270° = back (X=0, Y=-radius) - farthest from camera
  
  // BOH lines should be slightly closer to camera than cylinder borders
  // Borders are at y=0, so BOH at 90° will be at y=radius (closer to camera)
  // Add small offset to ensure they're always in front
  const bohOffset = 0.1 // 1mm offset towards camera
  
  const x1 = radius * Math.cos(angle1Rad)
  const y1 = radius * Math.sin(angle1Rad) + bohOffset // Slightly closer to camera
  const x2 = radius * Math.cos(angle2Rad)
  const y2 = radius * Math.sin(angle2Rad) + bohOffset // Slightly closer to camera
  
  // Project 3D points to 2D screen using camera (if available)
  let line1Left = containerWidth / 2
  let line2Left = containerWidth / 2
  let boh1TopY = containerHeight * 0.5
  let boh1BottomY = containerHeight * 0.85
  let boh1Height = containerHeight * 0.35
  let boh2TopY = containerHeight * 0.15
  let boh2Height = containerHeight * 0.35
  
  if (camera) {
    // Project actual 3D points to screen coordinates
    // Note: We invert Z to Y mapping so higher Z = lower Y on screen
    const project3DTo2D = (x: number, y: number, z: number) => {
      const vector = new THREE.Vector3(x, y, z)
      vector.project(camera)
      
      // Standard projection, but we'll need to handle Z->screen Y mapping
      return {
        x: (vector.x * 0.5 + 0.5) * containerWidth,
        y: (-vector.y * 0.5 + 0.5) * containerHeight,
        screenZ: vector.z // Keep original for debugging
      }
    }
    
    // Project BOH positions - note camera projects Z inversely to screen Y
    // z=0 (world bottom) → top of screen (low Y value)
    // z=30 (world top) → bottom of screen (high Y value)
    // Using y1/y2 to position on cylinder surface
    
    // BOH 1 (Red): z=0 to z=15
    const boh1_bottom = project3DTo2D(x1, y1, 0)       // z=0 (cylinder bottom)
    const boh1_top = project3DTo2D(x1, y1, cylinderHeight / 2) // z=15 (cylinder center)
    
    // BOH 2 (Green): z=15 to z=30
    const boh2_bottom = project3DTo2D(x2, y2, cylinderHeight / 2) // z=15 (cylinder center)
    const boh2_top = project3DTo2D(x2, y2, cylinderHeight)        // z=30 (cylinder top)
    
    // BOH 1 (Red): z=0 to z=15 → screen top to middle
    line1Left = boh1_bottom.x
    boh1TopY = boh1_bottom.y      // z=0 is at top of screen
    boh1BottomY = boh1_top.y      // z=15 is at middle
    boh1Height = Math.abs(boh1BottomY - boh1TopY)
    
    // BOH 2 (Green): z=15 to z=30 → screen middle to bottom
    line2Left = boh2_bottom.x
    boh2TopY = boh2_bottom.y      // z=15 is at middle
    const boh2BottomY = boh2_top.y // z=30 is at bottom of screen
    boh2Height = Math.abs(boh2BottomY - boh2TopY)
    
    // Debug: Verify total height matches cylinder
    const totalBOHHeight = boh1Height + boh2Height
    const cylinderScreenTop = boh1_bottom.y
    const cylinderScreenBottom = boh2_top.y
    const cylinderScreenHeight = Math.abs(cylinderScreenBottom - cylinderScreenTop)
    
    console.log(`BOH Heights: BOH1=${boh1Height.toFixed(0)}px + BOH2=${boh2Height.toFixed(0)}px = ${totalBOHHeight.toFixed(0)}px`)
    console.log(`Cylinder screen height: ${cylinderScreenHeight.toFixed(0)}px (should match total BOH)`)
    console.log(`Height match: ${Math.abs(totalBOHHeight - cylinderScreenHeight) < 1 ? '✓ OK' : '✗ MISMATCH'}`)
    
    console.log(`BOH1 (${line1Angle}°): 3D(${x1.toFixed(2)}, ${y1.toFixed(2)}) → Screen X=${line1Left.toFixed(0)}px, Y=${boh1TopY.toFixed(0)}-${boh1BottomY.toFixed(0)}px`)
    console.log(`BOH2 (${line2Angle}°): 3D(${x2.toFixed(2)}, ${y2.toFixed(2)}) → Screen X=${line2Left.toFixed(0)}px, Y=${boh2TopY.toFixed(0)}-${(boh2TopY + boh2Height).toFixed(0)}px`)
  } else {
    // Fallback to approximate positioning
    const centerX = containerWidth / 2
    const cylinderPixelHeight = containerHeight * 0.7
    const pixelsPerCm = cylinderPixelHeight / cylinderHeight
    
    // Use X coordinate for horizontal position (Y affects depth/occlusion)
    line1Left = centerX + (x1 * pixelsPerCm)
    line2Left = centerX + (x2 * pixelsPerCm)
    
    console.log(`Fallback positioning: L1 at x=${x1.toFixed(2)}, y=${y1.toFixed(2)} → screen ${line1Left.toFixed(0)}px`)
    console.log(`Fallback positioning: L2 at x=${x2.toFixed(2)}, y=${y2.toFixed(2)} → screen ${line2Left.toFixed(0)}px`)
  }
  
  // Calculate angle from screen X position with improved sensitivity
  const calculateAngleFromX = (screenX: number, currentAngle: number): number => {
    if (!camera) return 90
    
    const centerX = containerWidth / 2
    
    // Calculate pixel offset from center
    const pixelOffset = screenX - centerX
    
    // Map pixel movement to angle change with reduced sensitivity
    // Using a much smaller factor for smoother, more gradual control
    // Range: 40 degrees (70° to 110°) mapped across a wider range for finer control
    const cylinderVisibleWidth = containerWidth * 0.6 // Map across 60% of screen width for smoother control
    const degreesPerPixel = 40 / cylinderVisibleWidth // ~0.067 degrees per pixel for very smooth control
    
    // Calculate target angle based on pixel offset (INVERTED: negative to fix direction)
    let targetAngle = 90 - (pixelOffset * degreesPerPixel) // Inverted: drag right = move right
    
    // Clamp to valid range [70, 110]
    targetAngle = Math.max(70, Math.min(110, targetAngle))
    
    // Apply smoothing: interpolate between current and target angle
    // This creates a damped, gradual movement
    const smoothingFactor = 0.15 // Lower = smoother but slower, Higher = more responsive
    let finalAngle = currentAngle + (targetAngle - currentAngle) * smoothingFactor
    
    // Apply snapping if enabled (after smoothing)
    if (enableSnapping) {
      finalAngle = Math.round(finalAngle / 1) * 1 // Snap to 1° increments
    }
    
    // Final clamp to ensure we stay in range
    finalAngle = Math.max(70, Math.min(110, finalAngle))
    
    return finalAngle
  }
  
  // Handle drag events
  const handleMouseDown = (line: 'line1' | 'line2') => (e: React.MouseEvent) => {
    if (!isInteractive) return
    e.preventDefault()
    e.stopPropagation()
    setDraggingLine(line)
  }
  
  const handleTouchStart = (line: 'line1' | 'line2') => (e: React.TouchEvent) => {
    if (!isInteractive) return
    e.stopPropagation()
    setDraggingLine(line)
  }
  
  // Global mouse/touch move handlers
  useEffect(() => {
    if (!draggingLine) return
    
    const handleMove = (clientX: number) => {
      // Get current angle to apply smoothing
      const currentAngle = draggingLine === 'line1' ? line1Angle : line2Angle
      const newAngle = calculateAngleFromX(clientX, currentAngle)
      
      if (draggingLine === 'line1' && onLine1AngleChange) {
        onLine1AngleChange(newAngle)
      } else if (draggingLine === 'line2' && onLine2AngleChange) {
        onLine2AngleChange(newAngle)
      }
    }
    
    const handleMouseMove = (e: MouseEvent) => {
      handleMove(e.clientX)
    }
    
    const handleTouchMove = (e: TouchEvent) => {
      if (e.touches.length > 0) {
        handleMove(e.touches[0].clientX)
      }
    }
    
    const handleEnd = () => {
      setDraggingLine(null)
    }
    
    window.addEventListener('mousemove', handleMouseMove)
    window.addEventListener('mouseup', handleEnd)
    window.addEventListener('touchmove', handleTouchMove)
    window.addEventListener('touchend', handleEnd)
    
    return () => {
      window.removeEventListener('mousemove', handleMouseMove)
      window.removeEventListener('mouseup', handleEnd)
      window.removeEventListener('touchmove', handleTouchMove)
      window.removeEventListener('touchend', handleEnd)
    }
  }, [draggingLine, onLine1AngleChange, onLine2AngleChange, containerWidth, camera, enableSnapping, line1Angle, line2Angle])
  
  // Visual states for lines
  const getLineStyle = (line: 'line1' | 'line2', baseColor: string, glowColor: string) => {
    const isHovered = hoveredLine === line
    const isDragging = draggingLine === line
    
    return {
      backgroundColor: baseColor,
      width: isDragging ? '4px' : isHovered ? '3px' : '2px', // Reduced from 8/7/5 to 4/3/2
      boxShadow: isDragging 
        ? `0 0 15px ${glowColor}, 0 0 30px ${glowColor}` 
        : isHovered 
        ? `0 0 10px ${glowColor}` 
        : `0 0 8px ${glowColor}`,
      cursor: isInteractive ? (isDragging ? 'grabbing' : 'grab') : 'default',
      opacity: isDragging ? 0.9 : isHovered ? 0.95 : 0.85,
      transition: isDragging ? 'none' : 'all 0.2s ease'
    }
  }
  
  return (
    <div style={{
      position: 'absolute',
      top: 0,
      left: 0,
      width: '100%',
      height: '100%',
      pointerEvents: isInteractive ? 'auto' : 'none',
      zIndex: 1000
    }}>
      {/* BOH Line 1 - RED - From z=0 (bottom) to z=15 (center) */}
      <div 
        style={{
          position: 'absolute',
          left: `${line1Left}px`,
          top: camera ? `${boh1TopY}px` : '50%',
          height: camera ? `${boh1Height}px` : '35%',
          transform: 'translateX(-50%)',
          zIndex: 1001,
          pointerEvents: isInteractive ? 'auto' : 'none',
          touchAction: 'none',
          userSelect: 'none',
          ...getLineStyle('line1', '#FF0000', 'rgba(255,0,0,1)')
        }}
        onMouseDown={handleMouseDown('line1')}
        onTouchStart={handleTouchStart('line1')}
        onMouseEnter={() => isInteractive && setHoveredLine('line1')}
        onMouseLeave={() => setHoveredLine(null)}
      />
      
      {/* BOH Line 2 - GREEN - From z=15 (center) to z=30 (top) */}
      <div 
        style={{
          position: 'absolute',
          left: `${line2Left}px`,
          top: camera ? `${boh2TopY}px` : '15%',
          height: camera ? `${boh2Height}px` : '35%',
          transform: 'translateX(-50%)',
          zIndex: 1002,
          pointerEvents: isInteractive ? 'auto' : 'none',
          touchAction: 'none',
          userSelect: 'none',
          ...getLineStyle('line2', '#00FF00', 'rgba(0,255,0,1)')
        }}
        onMouseDown={handleMouseDown('line2')}
        onTouchStart={handleTouchStart('line2')}
        onMouseEnter={() => isInteractive && setHoveredLine('line2')}
        onMouseLeave={() => setHoveredLine(null)}
      />
      
      {/* Debug info */}
      <div style={{
        position: 'absolute',
        top: '10px',
        left: '10px',
        color: 'white',
        backgroundColor: 'rgba(0,0,0,0.7)',
        padding: '8px 12px',
        borderRadius: '6px',
        fontSize: '12px',
        fontFamily: 'monospace',
        pointerEvents: 'none',
        userSelect: 'none'
      }}>
        <div style={{ marginBottom: '4px' }}>
          🔴 L1: {line1Angle.toFixed(1)}° {draggingLine === 'line1' ? '🖐️' : hoveredLine === 'line1' ? '👆' : ''}
        </div>
        <div>
          🟢 L2: {line2Angle.toFixed(1)}° {draggingLine === 'line2' ? '🖐️' : hoveredLine === 'line2' ? '👆' : ''}
        </div>
        {isInteractive && !draggingLine && !hoveredLine && (
          <div style={{ marginTop: '6px', fontSize: '10px', color: '#aaa' }}>
            💡 Arrastra las líneas horizontalmente
          </div>
        )}
        {enableSnapping && (
          <div style={{ marginTop: '4px', fontSize: '10px', color: '#4ade80' }}>
            🧲 Snapping: 1°
          </div>
        )}
      </div>
    </div>
  )
}

