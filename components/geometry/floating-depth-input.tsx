'use client'

import React, { useState, useRef, useEffect } from 'react'
import { PointTrio } from '@/hooks/geometry/use-point-trios'
import { GEOSTXR_CONFIG } from '@/lib/config'

interface FloatingDepthInputProps {
  trio: PointTrio
  onDepthChange: (trioId: string, depth: number) => void
  onClose?: () => void
  initialPosition?: { x: number; y: number }
}

export function FloatingDepthInput({
  trio,
  onDepthChange,
  onClose,
  initialPosition = { x: 20, y: 150 }
}: FloatingDepthInputProps) {
  const [inputValue, setInputValue] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [position, setPosition] = useState(initialPosition)
  const [isDragging, setIsDragging] = useState(false)
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 })
  const panelRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const minDepth = GEOSTXR_CONFIG.DEPTH.MANUAL_RANGE.MIN
  const maxDepth = GEOSTXR_CONFIG.DEPTH.MANUAL_RANGE.MAX

  // Auto-focus input when component mounts
  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus()
    }
  }, [])

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

  const handleSave = () => {
    const numValue = parseFloat(inputValue)

    // Validation
    if (!inputValue.trim()) {
      setError('Debe ingresar una profundidad')
      return
    }

    if (isNaN(numValue)) {
      setError('Debe ingresar un número válido')
      return
    }

    if (numValue < minDepth) {
      setError(`Profundidad mínima: ${minDepth}cm (${(minDepth/100).toFixed(1)}m)`)
      return
    }

    if (numValue > maxDepth) {
      setError(`Profundidad máxima: ${maxDepth}cm (${(maxDepth/100).toFixed(0)}m)`)
      return
    }

    // Save and close
    setError(null)
    onDepthChange(trio.id, numValue)
    onClose?.()
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSave()
    } else if (e.key === 'Escape') {
      onClose?.()
    }
  }

  return (
    <div
      ref={panelRef}
      style={{
        position: 'fixed',
        left: `${position.x}px`,
        top: `${position.y}px`,
        zIndex: 4000,
        minWidth: '320px',
        maxWidth: '400px',
        boxShadow: '0 10px 40px rgba(0,0,0,0.4)',
        borderRadius: '12px',
        overflow: 'hidden',
        border: '3px solid #3B82F6',
        animation: 'slideIn 0.3s ease-out'
      }}
    >
      {/* Header - Draggable */}
      <div
        onMouseDown={handleMouseDown}
        style={{
          background: `linear-gradient(135deg, ${trio.color}dd, ${trio.color}99)`,
          padding: '12px 16px',
          cursor: isDragging ? 'grabbing' : 'grab',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          userSelect: 'none',
          borderBottom: `3px solid ${trio.color}`
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
          <span>📝</span>
          <span>Ingresar Profundidad - Trío 1</span>
        </div>
        
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

      {/* Content */}
      <div style={{
        background: 'linear-gradient(to bottom, #EFF6FF, #DBEAFE)',
        padding: '20px',
        fontSize: '13px'
      }}>
        {/* Instructions */}
        <div style={{
          background: '#FEF3C7',
          border: '2px solid #FCD34D',
          borderRadius: '8px',
          padding: '12px',
          marginBottom: '16px',
          fontSize: '12px',
          color: '#92400E'
        }}>
          <div style={{ fontWeight: 'bold', marginBottom: '4px' }}>
            ⚠️ Importante:
          </div>
          <div>
            Esta profundidad será usada como <strong>referencia</strong> para calcular automáticamente las profundidades de los siguientes tríos.
          </div>
        </div>

        {/* Input Field */}
        <div style={{ marginBottom: '16px' }}>
          <label style={{
            display: 'block',
            fontWeight: 'bold',
            color: '#1E40AF',
            marginBottom: '8px'
          }}>
            Profundidad (cm):
          </label>
          <input
            ref={inputRef}
            type="number"
            value={inputValue}
            onChange={(e) => {
              setInputValue(e.target.value)
              setError(null)
            }}
            onKeyDown={handleKeyPress}
            placeholder="Ej: 100"
            style={{
              width: '100%',
              padding: '12px',
              fontSize: '16px',
              border: error ? '2px solid #EF4444' : '2px solid #3B82F6',
              borderRadius: '8px',
              outline: 'none',
              boxSizing: 'border-box'
            }}
            onClick={(e) => e.stopPropagation()}
          />
          {error && (
            <div style={{
              color: '#EF4444',
              fontSize: '11px',
              marginTop: '6px',
              fontWeight: 'bold'
            }}>
              ⚠️ {error}
            </div>
          )}
        </div>

        {/* Helper text */}
        <div style={{
          fontSize: '11px',
          color: '#6B7280',
          marginBottom: '16px',
          fontStyle: 'italic'
        }}>
          Rango válido: {minDepth}cm - {maxDepth.toLocaleString()}cm 
          ({(minDepth/100).toFixed(0)}m - {(maxDepth/100).toFixed(0)}m)
        </div>

        {/* Buttons */}
        <div style={{
          display: 'flex',
          gap: '12px'
        }}>
          <button
            onClick={handleSave}
            style={{
              flex: 1,
              padding: '12px 24px',
              background: 'linear-gradient(135deg, #3B82F6, #2563EB)',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              fontWeight: 'bold',
              fontSize: '14px',
              cursor: 'pointer',
              boxShadow: '0 4px 12px rgba(59, 130, 246, 0.4)'
            }}
            onMouseDown={(e) => e.stopPropagation()}
          >
            💾 Guardar
          </button>
          {onClose && (
            <button
              onClick={onClose}
              style={{
                padding: '12px 24px',
                background: '#E5E7EB',
                color: '#374151',
                border: 'none',
                borderRadius: '8px',
                fontWeight: 'bold',
                fontSize: '14px',
                cursor: 'pointer'
              }}
              onMouseDown={(e) => e.stopPropagation()}
            >
              Cancelar
            </button>
          )}
        </div>

        {/* Keyboard shortcuts */}
        <div style={{
          marginTop: '12px',
          fontSize: '10px',
          color: '#9CA3AF',
          textAlign: 'center'
        }}>
          💡 Enter para guardar • Esc para cancelar
        </div>
      </div>

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

      <style jsx>{`
        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translateY(-20px) scale(0.95);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }
      `}</style>
    </div>
  )
}

