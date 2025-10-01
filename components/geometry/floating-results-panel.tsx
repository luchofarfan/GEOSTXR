'use client'

import React, { useState, useRef, useEffect } from 'react'

interface FloatingResultsPanelProps {
  trioNumber: number
  trioColor: string
  depth: number
  depthType: 'manual' | 'auto'
  angles: {
    alpha: number
    beta: number
    azimuth: number
  }
  bohNumber: number
  bohAngle: number
  isValidation?: boolean
  onClose?: () => void
}

export function FloatingResultsPanel({
  trioNumber,
  trioColor,
  depth,
  depthType,
  angles,
  bohNumber,
  bohAngle,
  isValidation = false,
  onClose
}: FloatingResultsPanelProps) {
  const [position, setPosition] = useState({ x: 20, y: 100 })
  const [isDragging, setIsDragging] = useState(false)
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 })
  const [isMinimized, setIsMinimized] = useState(false)
  const panelRef = useRef<HTMLDivElement>(null)

  // Handle mouse down on header (start dragging)
  const handleMouseDown = (e: React.MouseEvent) => {
    if (!panelRef.current) return
    
    const rect = panelRef.current.getBoundingClientRect()
    setDragOffset({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    })
    setIsDragging(true)
  }

  // Handle mouse move (dragging)
  useEffect(() => {
    if (!isDragging) return

    const handleMouseMove = (e: MouseEvent) => {
      setPosition({
        x: e.clientX - dragOffset.x,
        y: e.clientY - dragOffset.y
      })
    }

    const handleMouseUp = () => {
      setIsDragging(false)
    }

    window.addEventListener('mousemove', handleMouseMove)
    window.addEventListener('mouseup', handleMouseUp)

    return () => {
      window.removeEventListener('mousemove', handleMouseMove)
      window.removeEventListener('mouseup', handleMouseUp)
    }
  }, [isDragging, dragOffset])

  return (
    <div
      ref={panelRef}
      style={{
        position: 'fixed',
        left: `${position.x}px`,
        top: `${position.y}px`,
        zIndex: 3000,
        minWidth: '280px',
        maxWidth: '400px',
        boxShadow: '0 10px 30px rgba(0,0,0,0.3)',
        borderRadius: '12px',
        overflow: 'hidden',
        transition: isDragging ? 'none' : 'all 0.2s ease'
      }}
    >
      {/* Header - Draggable */}
      <div
        onMouseDown={handleMouseDown}
        style={{
          background: `linear-gradient(135deg, ${trioColor}dd, ${trioColor}99)`,
          padding: '10px 12px',
          cursor: isDragging ? 'grabbing' : 'grab',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          userSelect: 'none',
          borderBottom: `2px solid ${trioColor}`
        }}
      >
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: '8px',
          color: 'white',
          fontWeight: 'bold',
          fontSize: '14px'
        }}>
          <span>{isValidation ? '🧪' : '⭕'}</span>
          <span>Plano #{trioNumber}</span>
          {isValidation && (
            <span style={{
              fontSize: '10px',
              background: 'rgba(255,255,255,0.3)',
              padding: '2px 6px',
              borderRadius: '10px'
            }}>
              VALIDACIÓN
            </span>
          )}
        </div>
        
        <div style={{ display: 'flex', gap: '4px' }}>
          {/* Minimize Button */}
          <button
            onClick={() => setIsMinimized(!isMinimized)}
            style={{
              background: 'rgba(255,255,255,0.2)',
              border: 'none',
              color: 'white',
              padding: '4px 8px',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '12px',
              fontWeight: 'bold'
            }}
            onMouseDown={(e) => e.stopPropagation()}
          >
            {isMinimized ? '▲' : '▼'}
          </button>
          
          {/* Close Button */}
          {onClose && (
            <button
              onClick={onClose}
              style={{
                background: 'rgba(255,255,255,0.2)',
                border: 'none',
                color: 'white',
                padding: '4px 8px',
                borderRadius: '4px',
                cursor: 'pointer',
                fontSize: '12px',
                fontWeight: 'bold'
              }}
              onMouseDown={(e) => e.stopPropagation()}
            >
              ✕
            </button>
          )}
        </div>
      </div>

      {/* Content */}
      {!isMinimized && (
        <div style={{
          background: 'rgba(0, 0, 0, 0.3)',
          backdropFilter: 'blur(20px)',
          padding: '12px',
          fontSize: '12px',
          color: 'white'
        }}>
          {/* Depth Information */}
          <div style={{
            marginBottom: '12px',
            paddingBottom: '12px',
            borderBottom: '2px solid rgba(255,255,255,0.2)'
          }}>
            <div style={{ color: '#93c5fd', fontWeight: 'bold', marginBottom: '4px', textShadow: '0 1px 2px rgba(0,0,0,0.5)' }}>
              {depthType === 'manual' ? '📝' : '✨'} Profundidad
            </div>
            <div style={{ color: 'white', fontSize: '13px', textShadow: '0 1px 2px rgba(0,0,0,0.5)' }}>
              <strong>{depth.toFixed(2)} cm</strong> ({(depth/100).toFixed(2)} m)
              <span style={{ 
                marginLeft: '6px', 
                fontSize: '10px', 
                color: '#d1d5db',
                fontStyle: 'italic'
              }}>
                ({depthType === 'manual' ? 'manual' : 'automática'})
              </span>
            </div>
          </div>

          {/* Angles Information */}
          <div style={{
            marginBottom: '12px',
            paddingBottom: '12px',
            borderBottom: '2px solid rgba(255,255,255,0.2)'
          }}>
            <div style={{ color: '#93c5fd', fontWeight: 'bold', marginBottom: '6px', textShadow: '0 1px 2px rgba(0,0,0,0.5)' }}>
              📐 Ángulos
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', color: 'white', textShadow: '0 1px 2px rgba(0,0,0,0.5)' }}>
              <div>
                <strong>α (Buzamiento):</strong> {angles.alpha.toFixed(2)}°
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <strong>β (vs BOH{bohNumber}):</strong> {angles.beta.toFixed(2)}°
                <span style={{ 
                  fontSize: '10px', 
                  color: 'white',
                  background: 'rgba(59, 130, 246, 0.6)',
                  padding: '2px 6px',
                  borderRadius: '10px'
                }}>
                  BOH{bohNumber}@{bohAngle.toFixed(1)}°
                </span>
              </div>
              <div>
                <strong>🧭 Azimuth:</strong> {angles.azimuth.toFixed(2)}°
              </div>
            </div>
          </div>

          {/* Dynamic Update Info */}
          <div style={{
            fontSize: '10px',
            color: '#93c5fd',
            fontStyle: 'italic',
            textAlign: 'center',
            padding: '6px',
            background: 'rgba(59, 130, 246, 0.3)',
            borderRadius: '6px',
            textShadow: '0 1px 2px rgba(0,0,0,0.5)'
          }}>
            ↻ β se actualiza al mover BOH{bohNumber}
          </div>
        </div>
      )}

      {/* Drag Indicator */}
      {isDragging && (
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0,0,0,0.1)',
          pointerEvents: 'none',
          borderRadius: '12px'
        }} />
      )}
    </div>
  )
}

