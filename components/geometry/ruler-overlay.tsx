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

  // Position ruler to the left of cylinder
  // Left border is at x=-radius, y=0 (front plane)
  const rulerX = -radius - 0.4 // 4mm to the left of left border
  const rulerY = 0 // Same Y plane as border (front)

  // Calculate screen positions for top and bottom of ruler
  const rulerTop = project3DTo2D(rulerX, rulerY, cylinderHeight) // z=30 (bottom on screen)
  const rulerBottom = project3DTo2D(rulerX, rulerY, 0) // z=0 (top on screen)
  
  // Calculate pixel height of ruler
  const rulerPixelHeight = Math.abs(rulerBottom.y - rulerTop.y)
  
  // Generate tick marks every 10cm (0, 10, 20, 30)
  const ticks = []
  for (let zDepth = 0; zDepth <= cylinderHeight; zDepth += 10) {
    const tickPos = project3DTo2D(rulerX, rulerY, zDepth)
    ticks.push({
      depth: zDepth,
      y: tickPos.y
    })
  }

  // Ruler line X position
  const rulerLineX = rulerTop.x

  return (
    <div style={{
      position: 'absolute',
      top: 0,
      left: 0,
      width: '100%',
      height: '100%',
      pointerEvents: 'none',
      zIndex: 998
    }}>
      {/* Tick marks and labels */}
      {ticks.map((tick) => (
        <React.Fragment key={tick.depth}>
          {/* Tick mark */}
          <div style={{
            position: 'absolute',
            left: `${rulerLineX - 15}px`,
            top: `${tick.y}px`,
            width: '15px',
            height: '3px',
            backgroundColor: '#FFF',
            transform: 'translateY(-50%)',
            boxShadow: '0 0 3px rgba(0,0,0,0.8)'
          }} />
          
          {/* Label */}
          <div style={{
            position: 'absolute',
            left: `${rulerLineX - 60}px`,
            top: `${tick.y}px`,
            transform: 'translateY(-50%)',
            fontSize: '12px',
            fontWeight: 'bold',
            color: '#FFF',
            textShadow: '0 0 4px #000, 0 0 8px #000, 1px 1px 3px #000',
            fontFamily: 'monospace',
            whiteSpace: 'nowrap',
            userSelect: 'none'
          }}>
            {tick.depth} cm
          </div>
        </React.Fragment>
      ))}
    </div>
  )
}

