'use client'

import React, { useState, useRef, useEffect } from 'react'

interface FloatingValidationPanelProps {
  onCreateTrio: (alpha: number, beta: number, depth: number, bohAngle: number) => void
  onToggleVisibility: (visible: boolean) => void
  validationVisible: boolean
  validationCount: number
  onClose?: () => void
  line1Angle: number
  line2Angle: number
  initialPosition?: { x: number; y: number }
}

export function FloatingValidationPanel({
  onCreateTrio,
  onToggleVisibility,
  validationVisible,
  validationCount,
  onClose,
  line1Angle,
  line2Angle,
  initialPosition = { x: 50, y: 100 }
}: FloatingValidationPanelProps) {
  const [alpha, setAlpha] = useState('45')
  const [beta, setBeta] = useState('0')
  const [depth, setDepth] = useState('0.1')
  const [useBOH1, setUseBOH1] = useState(true)
  const [position, setPosition] = useState(initialPosition)
  const [isDragging, setIsDragging] = useState(false)
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 })
  const [isMinimized, setIsMinimized] = useState(false)
  const panelRef = useRef<HTMLDivElement>(null)

  // Handle dragging
  const handleMouseDown = (e: React.MouseEvent) => {
    if (!panelRef.current) return
    
    const rect = panelRef.current.getBoundingClientRect()
    setDragOffset({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    })
    setIsDragging(true)
  }

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

  const handleCreate = () => {
    const alphaNum = parseFloat(alpha)
    const betaNum = parseFloat(beta)
    const depthNum = parseFloat(depth)
    const bohAngle = useBOH1 ? line1Angle : line2Angle
    
    if (isNaN(alphaNum) || isNaN(betaNum) || isNaN(depthNum)) {
      alert('Por favor ingresa valores numéricos válidos')
      return
    }
    
    if (alphaNum < 0 || alphaNum > 90) {
      alert('α debe estar entre 0° y 90°')
      return
    }
    
    if (depthNum < 0 || depthNum > 100) {
      alert('Profundidad debe estar entre 0 y 100 metros')
      return
    }
    
    onCreateTrio(alphaNum, betaNum, depthNum, bohAngle)
    
    // Optionally close after creation
    // onClose?.()
  }

  return (
    <div
      ref={panelRef}
      style={{
        position: 'fixed',
        left: `${position.x}px`,
        top: `${position.y}px`,
        zIndex: 3500,
        minWidth: '320px',
        maxWidth: '380px',
        boxShadow: '0 10px 40px rgba(138, 43, 226, 0.4)',
        borderRadius: '12px',
        overflow: 'hidden',
        border: '3px solid #9333EA',
        transition: isDragging ? 'none' : 'all 0.2s ease'
      }}
    >
      {/* Header - Draggable */}
      <div
        onMouseDown={handleMouseDown}
        style={{
          background: 'linear-gradient(135deg, #9333EA, #7C3AED)',
          padding: '12px 16px',
          cursor: isDragging ? 'grabbing' : 'grab',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          userSelect: 'none',
          borderBottom: '3px solid #7C3AED'
        }}
      >
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: '8px',
          color: 'white',
          fontWeight: 'bold',
          fontSize: '15px'
        }}>
          <span>🧪</span>
          <span>Validación de Planos</span>
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
                fontSize: '14px',
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
          background: 'linear-gradient(to bottom, #FAF5FF, #F3E8FF)',
          padding: '20px',
          fontSize: '13px'
        }}>
          {/* Visibility Toggle */}
          <div style={{
            background: validationVisible ? '#10B981' : '#EF4444',
            borderRadius: '8px',
            padding: '12px',
            marginBottom: '16px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}>
            <div style={{ color: 'white', fontWeight: 'bold', fontSize: '13px' }}>
              {validationVisible ? '👁️ Validaciones Visibles' : '🚫 Validaciones Ocultas'}
              <div style={{ fontSize: '10px', fontWeight: 'normal', marginTop: '2px' }}>
                {validationCount} plano{validationCount !== 1 ? 's' : ''} de validación
              </div>
            </div>
            <button
              onClick={() => onToggleVisibility(!validationVisible)}
              style={{
                background: 'rgba(255, 255, 255, 0.3)',
                border: '2px solid white',
                borderRadius: '20px',
                padding: '8px 16px',
                color: 'white',
                fontWeight: 'bold',
                fontSize: '12px',
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
              onMouseDown={(e) => e.stopPropagation()}
            >
              {validationVisible ? 'OFF' : 'ON'}
            </button>
          </div>
          
          {/* Info Box */}
          <div style={{
            background: '#DDD6FE',
            border: '2px solid #9333EA',
            borderRadius: '8px',
            padding: '10px',
            marginBottom: '16px',
            fontSize: '11px',
            color: '#581C87'
          }}>
            <div style={{ fontWeight: 'bold', marginBottom: '4px' }}>
              💡 Función de Validación
            </div>
            <div>
              Ingresa α, β y profundidad para crear un plano con esos valores exactos. Luego verifica que los cálculos coincidan.
            </div>
          </div>

          {/* Input Fields */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {/* Alpha */}
            <div>
              <label style={{
                display: 'block',
                fontWeight: 'bold',
                color: '#6B21A8',
                marginBottom: '6px',
                fontSize: '12px'
              }}>
                α (Buzamiento): 0-90°
              </label>
              <input
                type="number"
                value={alpha}
                onChange={(e) => setAlpha(e.target.value)}
                style={{
                  width: '100%',
                  padding: '10px',
                  fontSize: '14px',
                  border: '2px solid #9333EA',
                  borderRadius: '6px',
                  outline: 'none',
                  boxSizing: 'border-box'
                }}
                placeholder="45"
                step="0.1"
                min="0"
                max="90"
                onClick={(e) => e.stopPropagation()}
              />
            </div>

            {/* Beta */}
            <div>
              <label style={{
                display: 'block',
                fontWeight: 'bold',
                color: '#6B21A8',
                marginBottom: '6px',
                fontSize: '12px'
              }}>
                β (vs BOH): grados
              </label>
              <input
                type="number"
                value={beta}
                onChange={(e) => setBeta(e.target.value)}
                style={{
                  width: '100%',
                  padding: '10px',
                  fontSize: '14px',
                  border: '2px solid #9333EA',
                  borderRadius: '6px',
                  outline: 'none',
                  boxSizing: 'border-box'
                }}
                placeholder="0"
                step="0.1"
                onClick={(e) => e.stopPropagation()}
              />
            </div>

            {/* Depth */}
            <div>
              <label style={{
                display: 'block',
                fontWeight: 'bold',
                color: '#6B21A8',
                marginBottom: '6px',
                fontSize: '12px'
              }}>
                Profundidad (metros)
              </label>
              <input
                type="number"
                value={depth}
                onChange={(e) => setDepth(e.target.value)}
                style={{
                  width: '100%',
                  padding: '10px',
                  fontSize: '14px',
                  border: '2px solid #9333EA',
                  borderRadius: '6px',
                  outline: 'none',
                  boxSizing: 'border-box'
                }}
                placeholder="0.1"
                step="0.01"
                min="0"
                max="100"
                onClick={(e) => e.stopPropagation()}
              />
            </div>

            {/* BOH Selection */}
            <div>
              <label style={{
                display: 'block',
                fontWeight: 'bold',
                color: '#6B21A8',
                marginBottom: '6px',
                fontSize: '12px'
              }}>
                BOH de Referencia
              </label>
              <div style={{ display: 'flex', gap: '8px' }}>
                <button
                  onClick={() => setUseBOH1(true)}
                  style={{
                    flex: 1,
                    padding: '10px',
                    fontSize: '12px',
                    fontWeight: 'bold',
                    borderRadius: '6px',
                    border: 'none',
                    cursor: 'pointer',
                    background: useBOH1 ? '#DC2626' : '#FEE2E2',
                    color: useBOH1 ? 'white' : '#991B1B',
                    transition: 'all 0.2s'
                  }}
                  onMouseDown={(e) => e.stopPropagation()}
                >
                  🔴 BOH1<br/>({line1Angle.toFixed(1)}°)
                </button>
                <button
                  onClick={() => setUseBOH1(false)}
                  style={{
                    flex: 1,
                    padding: '10px',
                    fontSize: '12px',
                    fontWeight: 'bold',
                    borderRadius: '6px',
                    border: 'none',
                    cursor: 'pointer',
                    background: !useBOH1 ? '#16A34A' : '#D1FAE5',
                    color: !useBOH1 ? 'white' : '#166534',
                    transition: 'all 0.2s'
                  }}
                  onMouseDown={(e) => e.stopPropagation()}
                >
                  🟢 BOH2<br/>({line2Angle.toFixed(1)}°)
                </button>
              </div>
            </div>
          </div>

          {/* Create Button */}
          <button
            onClick={handleCreate}
            style={{
              width: '100%',
              marginTop: '16px',
              padding: '12px 24px',
              background: 'linear-gradient(135deg, #9333EA, #7C3AED)',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              fontWeight: 'bold',
              fontSize: '14px',
              cursor: 'pointer',
              boxShadow: '0 4px 12px rgba(147, 51, 234, 0.4)'
            }}
            onMouseDown={(e) => e.stopPropagation()}
          >
            🧪 Crear Plano de Validación
          </button>

          {/* Clear Validation Trios Button */}
          {validationCount > 0 && (
            <button
              onClick={() => {
                if (confirm(`¿Eliminar los ${validationCount} plano(s) de validación?`)) {
                  // Trigger clear validation event
                  const event = new CustomEvent('clearValidationTrios')
                  window.dispatchEvent(event)
                }
              }}
              style={{
                width: '100%',
                marginTop: '12px',
                padding: '8px',
                background: '#DC2626',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                fontWeight: 'bold',
                fontSize: '12px',
                cursor: 'pointer'
              }}
              onMouseDown={(e) => e.stopPropagation()}
            >
              🗑️ Limpiar Validaciones ({validationCount})
            </button>
          )}

          {/* Helper Text */}
          <div style={{
            marginTop: '12px',
            fontSize: '10px',
            color: '#6B21A8',
            textAlign: 'center',
            fontStyle: 'italic'
          }}>
            Los puntos y elipse se generarán automáticamente
          </div>
          
          {/* Exclusion Notice */}
          <div style={{
            marginTop: '8px',
            fontSize: '9px',
            color: '#7C3AED',
            textAlign: 'center',
            background: 'rgba(124, 58, 237, 0.1)',
            padding: '6px',
            borderRadius: '4px',
            fontWeight: 'bold'
          }}>
            ⚠️ Los planos de validación NO se incluyen en reportes
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

