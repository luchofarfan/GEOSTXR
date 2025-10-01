'use client'

import React from 'react'
import * as THREE from 'three'
import { PointTrio, Point3D } from '@/hooks/geometry/use-point-trios'

interface PointMarkersOverlayProps {
  trios: PointTrio[]
  currentTrio: PointTrio | null
  selectedTrioId: string | null
  containerWidth: number
  containerHeight: number
  camera?: THREE.Camera
  onPointClick?: (trioId: string, pointId: string) => void
}

export function PointMarkersOverlay({
  trios,
  currentTrio,
  selectedTrioId,
  containerWidth,
  containerHeight,
  camera,
  onPointClick
}: PointMarkersOverlayProps) {
  // Project 3D point to 2D screen coordinates
  const project3DTo2D = (point: Point3D) => {
    if (!camera) {
      // Fallback: approximate positioning
      const centerX = containerWidth / 2
      const centerY = containerHeight / 2
      return { x: centerX, y: centerY }
    }

    const vector = new THREE.Vector3(point.x, point.y, point.z)
    vector.project(camera)

    return {
      x: (vector.x * 0.5 + 0.5) * containerWidth,
      y: (-vector.y * 0.5 + 0.5) * containerHeight
    }
  }

  // Render a single point marker
  const renderPoint = (
    point: Point3D,
    color: string,
    isSelected: boolean,
    isCurrent: boolean,
    trioId: string,
    index: number
  ) => {
    const screenPos = project3DTo2D(point)
    const size = isSelected ? 16 : isCurrent ? 14 : 12

    return (
      <div
        key={point.id}
        onClick={() => onPointClick?.(trioId, point.id)}
        style={{
          position: 'absolute',
          left: `${screenPos.x}px`,
          top: `${screenPos.y}px`,
          width: `${size}px`,
          height: `${size}px`,
          backgroundColor: color,
          border: isSelected ? '3px solid white' : isCurrent ? '2px solid white' : '2px solid rgba(0,0,0,0.3)',
          borderRadius: '50%',
          transform: 'translate(-50%, -50%)',
          cursor: 'pointer',
          boxShadow: `0 0 ${isSelected ? 15 : 10}px ${color}`,
          zIndex: isSelected ? 2002 : isCurrent ? 2001 : 2000,
          transition: 'all 0.2s ease',
          pointerEvents: 'auto'
        }}
        title={`Point ${index + 1}`}
      >
        {/* Point number label */}
        <div style={{
          position: 'absolute',
          top: '-20px',
          left: '50%',
          transform: 'translateX(-50%)',
          fontSize: '10px',
          fontWeight: 'bold',
          color: 'white',
          backgroundColor: 'rgba(0,0,0,0.7)',
          padding: '2px 6px',
          borderRadius: '10px',
          whiteSpace: 'nowrap'
        }}>
          {index + 1}
        </div>
      </div>
    )
  }

  // Render connecting lines between points in a trio
  const renderTrioLines = (trio: PointTrio, isSelected: boolean, isCurrent: boolean) => {
    if (trio.points.length < 2) return null

    return trio.points.map((point, i) => {
      if (i === 0) return null

      const prevPoint = trio.points[i - 1]
      const pos1 = project3DTo2D(prevPoint)
      const pos2 = project3DTo2D(point)

      const dx = pos2.x - pos1.x
      const dy = pos2.y - pos1.y
      const length = Math.sqrt(dx * dx + dy * dy)
      const angle = Math.atan2(dy, dx) * 180 / Math.PI

      return (
        <div
          key={`line-${prevPoint.id}-${point.id}`}
          style={{
            position: 'absolute',
            left: `${pos1.x}px`,
            top: `${pos1.y}px`,
            width: `${length}px`,
            height: '2px',
            backgroundColor: trio.color,
            opacity: isSelected ? 0.8 : isCurrent ? 0.6 : 0.4,
            transform: `rotate(${angle}deg)`,
            transformOrigin: '0 0',
            zIndex: 1999,
            pointerEvents: 'none'
          }}
        />
      )
    })
  }

  return (
    <div style={{
      position: 'absolute',
      top: 0,
      left: 0,
      width: '100%',
      height: '100%',
      pointerEvents: 'none',
      zIndex: 2000
    }}>
      {/* Render completed trios */}
      {trios.map((trio, trioIndex) => (
        <React.Fragment key={trio.id}>
          {/* Connecting lines */}
          {renderTrioLines(trio, selectedTrioId === trio.id, false)}
          
          {/* Points */}
          {trio.points.map((point, pointIndex) =>
            renderPoint(
              point,
              trio.color,
              selectedTrioId === trio.id,
              false,
              trio.id,
              pointIndex
            )
          )}
        </React.Fragment>
      ))}

      {/* Render current (incomplete) trio */}
      {currentTrio && (
        <React.Fragment>
          {/* Connecting lines */}
          {renderTrioLines(currentTrio, false, true)}
          
          {/* Points */}
          {currentTrio.points.map((point, pointIndex) =>
            renderPoint(
              point,
              currentTrio.color,
              false,
              true,
              currentTrio.id,
              pointIndex
            )
          )}
        </React.Fragment>
      )}

      {/* Trio count display */}
      {(trios.length > 0 || currentTrio) && (
        <div style={{
          position: 'absolute',
          top: '60px',
          left: '10px',
          backgroundColor: 'rgba(0, 0, 0, 0.8)',
          color: 'white',
          padding: '8px 12px',
          borderRadius: '8px',
          fontSize: '12px',
          fontWeight: 'bold',
          pointerEvents: 'none'
        }}>
          <div>Trios: {trios.length} / 100</div>
          {currentTrio && (
            <div style={{ marginTop: '4px', color: currentTrio.color }}>
              Current: {currentTrio.points.length} / 3 points
            </div>
          )}
        </div>
      )}
    </div>
  )
}

