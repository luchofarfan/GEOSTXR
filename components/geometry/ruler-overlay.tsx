'use client'

import React from 'react'
import * as THREE from 'three'

interface RulerOverlayProps {
  containerWidth: number
  containerHeight: number
  camera?: THREE.Camera
  cylinderHeight?: number
  radius?: number
}

export function RulerOverlay({ 
  containerWidth,
  containerHeight,
  camera,
  cylinderHeight = 30,
  radius = 3.175
}: RulerOverlayProps) {
  if (!camera) return null

  // Project 3D point to 2D screen
  const project3DTo2D = (x: number, y: number, z: number) => {
    const vector = new THREE.Vector3(x, y, z)
    vector.project(camera)
    
    return {
      x: (vector.x * 0.5 + 0.5) * containerWidth,
      y: (-vector.y * 0.5 + 0.5) * containerHeight
    }
  }

  // Position ruler on the left side of cylinder
  // Left edge is at x=-radius, y=0 (side view)
  const rulerX = -radius - 1 // 1cm to the left of cylinder edge
  const rulerY = 0

  // Calculate screen positions for ruler
  const rulerTop = project3DTo2D(rulerX, rulerY, cylinderHeight) // z=30 (top of cylinder)
  const rulerBottom = project3DTo2D(rulerX, rulerY, 0) // z=0 (bottom of cylinder)
  
  // Calculate pixel height of cylinder on screen
  const cylinderScreenHeight = Math.abs(rulerBottom.y - rulerTop.y)
  
  // Calculate how many cm per pixel
  const cmPerPixel = cylinderHeight / cylinderScreenHeight
  
  // Generate tick marks every 10cm for the cylinder height (0-30cm)
  // Z increases downward in screen space (z=0 at top, z=30 at bottom)
  const ticks = []
  
  // Show ticks from z=0 (top) to z=30 (bottom) every 10cm
  for (let zCylinder = 0; zCylinder <= cylinderHeight; zCylinder += 10) {
    const tickPos = project3DTo2D(rulerX, rulerY, zCylinder)
    const isMajorTick = true // All are major ticks since we only have 4 (0, 10, 20, 30)
    const showLabel = true // Show all labels
    
    ticks.push({
      depth: zCylinder, // Z coordinate (0 at top, 30 at bottom)
      y: tickPos.y,
      isMajor: isMajorTick,
      showLabel
    })
  }

  // Ruler line screen position
  const rulerLineX = rulerTop.x

  return (
    <div style={{
      position: 'absolute',
      top: 0,
      left: 0,
      width: '100%',
      height: '100%',
      pointerEvents: 'none',
      zIndex: 999 // Below BOH lines but above cylinder
    }}>
      {/* Ruler vertical line */}
      <div style={{
        position: 'absolute',
        left: `${rulerLineX}px`,
        top: `${rulerTop.y}px`,
        width: '2px',
        height: `${cylinderScreenHeight}px`,
        backgroundColor: '#666',
        boxShadow: '0 0 3px rgba(0,0,0,0.5)'
      }} />

      {/* Tick marks and labels */}
      {ticks.map((tick) => (
        <React.Fragment key={tick.depth}>
          {/* Tick mark */}
          <div style={{
            position: 'absolute',
            left: `${rulerLineX - (tick.isMajor ? 12 : 8)}px`,
            top: `${tick.y}px`,
            width: tick.isMajor ? '12px' : '8px',
            height: '2px',
            backgroundColor: tick.isMajor ? '#333' : '#666',
            transform: 'translateY(-50%)'
          }} />
          
          {/* Label */}
          {tick.showLabel && (
            <div style={{
              position: 'absolute',
              left: `${rulerLineX - 50}px`,
              top: `${tick.y}px`,
              transform: 'translateY(-50%)',
              fontSize: '11px',
              fontWeight: 'bold',
              color: '#fff',
              textShadow: '0 0 3px #000, 0 0 5px #000, 1px 1px 2px #000',
              fontFamily: 'monospace',
              whiteSpace: 'nowrap',
              userSelect: 'none'
            }}>
              {tick.depth} cm
            </div>
          )}
        </React.Fragment>
      ))}

      {/* Ruler title */}
      <div style={{
        position: 'absolute',
        left: `${rulerLineX - 60}px`,
        top: `${rulerTop.y - 25}px`,
        fontSize: '10px',
        fontWeight: 'bold',
        color: '#fff',
        textShadow: '0 0 3px #000, 0 0 5px #000',
        fontFamily: 'sans-serif',
        userSelect: 'none',
        backgroundColor: 'rgba(0,0,0,0.6)',
        padding: '3px 6px',
        borderRadius: '3px'
      }}>
        📏 Eje Z (cm)
      </div>

      {/* Debug info */}
      <div style={{
        position: 'absolute',
        bottom: '10px',
        left: '10px',
        fontSize: '10px',
        color: '#fff',
        backgroundColor: 'rgba(0,0,0,0.7)',
        padding: '4px 8px',
        borderRadius: '4px',
        fontFamily: 'monospace',
        userSelect: 'none'
      }}>
        📏 Cilindro: 0-{cylinderHeight}cm | Escala: {cmPerPixel.toFixed(3)} cm/px
      </div>
    </div>
  )
}

