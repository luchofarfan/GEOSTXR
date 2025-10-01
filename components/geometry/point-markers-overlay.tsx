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
  draggingPoint?: { trioId: string; pointId: string } | null
  onPointClick?: (trioId: string, pointId: string) => void
  onPointDragStart?: (trioId: string, pointId: string) => void
}

export function PointMarkersOverlay({
  trios,
  currentTrio,
  selectedTrioId,
  containerWidth,
  containerHeight,
  camera,
  draggingPoint,
  onPointClick,
  onPointDragStart
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
    const isDragging = draggingPoint?.trioId === trioId && draggingPoint?.pointId === point.id
    const size = isDragging ? 5 : (isSelected ? 4 : isCurrent ? 4 : 3)

    return (
      <div
        key={point.id}
        onMouseDown={(e) => {
          e.stopPropagation()
          onPointDragStart?.(trioId, point.id)
        }}
        onClick={(e) => {
          e.stopPropagation()
          if (!isDragging) {
            onPointClick?.(trioId, point.id)
          }
        }}
        style={{
          position: 'absolute',
          left: `${screenPos.x}px`,
          top: `${screenPos.y}px`,
          width: `${size}px`,
          height: `${size}px`,
          backgroundColor: color,
          border: isDragging 
            ? '1px solid yellow' 
            : (isSelected ? '1px solid white' : isCurrent ? '1px solid white' : '1px solid rgba(0,0,0,0.3)'),
          borderRadius: '50%',
          transform: 'translate(-50%, -50%)',
          cursor: isDragging ? 'grabbing' : 'grab',
          boxShadow: isDragging 
            ? `0 0 8px yellow, 0 0 12px ${color}` 
            : `0 0 ${isSelected ? 6 : 4}px ${color}`,
          zIndex: isDragging ? 2003 : (isSelected ? 2002 : isCurrent ? 2001 : 2000),
          transition: isDragging ? 'none' : 'all 0.2s ease',
          pointerEvents: 'auto'
        }}
        title={`Point ${index + 1} - Click and drag to reposition`}
      />
    )
  }

  // Render connecting lines between points in a trio
  // DISABLED: Lines are hidden as per user request
  const renderTrioLines = (trio: PointTrio, isSelected: boolean, isCurrent: boolean) => {
    return null // Lines disabled - only show ellipses on cylinder
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

      {/* Drag indicator */}
      {draggingPoint && (
        <div style={{
          position: 'absolute',
          top: '60px',
          left: '10px',
          backgroundColor: 'rgba(255, 200, 0, 0.95)',
          color: '#000',
          padding: '10px 14px',
          borderRadius: '8px',
          fontSize: '13px',
          fontWeight: 'bold',
          pointerEvents: 'none',
          border: '2px solid #FFD700',
          boxShadow: '0 0 20px rgba(255, 215, 0, 0.6)'
        }}>
          <div>🖐️ Arrastrando punto...</div>
          <div style={{ fontSize: '11px', marginTop: '4px', fontWeight: 'normal' }}>
            Click en el cilindro para reposicionar
          </div>
        </div>
      )}
      
      {/* Trio count display */}
      {(trios.length > 0 || currentTrio) && !draggingPoint && (
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

