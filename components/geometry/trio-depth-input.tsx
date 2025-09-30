'use client'

import React, { useState, useEffect } from 'react'
import { PointTrio } from '@/hooks/geometry/use-point-trios'

interface TrioDepthInputProps {
  trio: PointTrio
  onDepthChange: (trioId: string, depth: number) => void
  minDepth?: number
  maxDepth?: number
}

export function TrioDepthInput({
  trio,
  onDepthChange,
  minDepth = 0,
  maxDepth = 500000 // 5000 meters = 500000 cm
}: TrioDepthInputProps) {
  const [inputValue, setInputValue] = useState(trio.depth?.toString() || '')
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    setInputValue(trio.depth?.toString() || '')
  }, [trio.depth])

  const validateAndSubmit = (value: string) => {
    const numValue = parseFloat(value)

    // Validation
    if (value === '') {
      setError('La profundidad es requerida')
      return false
    }

    if (isNaN(numValue)) {
      setError('Ingrese un número válido')
      return false
    }

    if (numValue < minDepth) {
      setError(`Profundidad mínima: ${minDepth}cm (${(minDepth/100).toFixed(1)}m)`)
      return false
    }

    if (numValue > maxDepth) {
      setError(`Profundidad máxima: ${maxDepth}cm (${(maxDepth/100).toFixed(0)}m)`)
      return false
    }

    // Valid
    setError(null)
    onDepthChange(trio.id, numValue)
    return true
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setInputValue(value)
    
    // Clear error on input
    if (error) {
      setError(null)
    }
  }

  const handleBlur = () => {
    if (inputValue) {
      validateAndSubmit(inputValue)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      validateAndSubmit(inputValue)
      e.currentTarget.blur()
    }
  }

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      gap: '8px',
      padding: '12px',
      backgroundColor: 'rgba(59, 130, 246, 0.1)',
      borderRadius: '8px',
      border: '2px solid #3B82F6'
    }}>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        marginBottom: '8px'
      }}>
        <div style={{
          width: '12px',
          height: '12px',
          backgroundColor: trio.color,
          borderRadius: '50%',
          boxShadow: `0 0 8px ${trio.color}`
        }} />
        <span style={{
          fontSize: '14px',
          fontWeight: 'bold',
          color: '#1F2937'
        }}>
          Trío 1 - Profundidad Manual
        </span>
        {!trio.depth && (
          <span style={{
            fontSize: '11px',
            fontWeight: 'bold',
            color: '#EF4444',
            backgroundColor: '#FEE2E2',
            padding: '2px 8px',
            borderRadius: '4px'
          }}>
            ⚠️ REQUERIDO
          </span>
        )}
      </div>
      
      {!trio.depth && (
        <div style={{
          fontSize: '12px',
          color: '#DC2626',
          backgroundColor: '#FEE2E2',
          padding: '8px',
          borderRadius: '6px',
          marginBottom: '8px',
          fontWeight: '500'
        }}>
          📍 Ingrese la profundidad para continuar
        </div>
      )}

      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '8px'
      }}>
        <input
          type="number"
          value={inputValue}
          onChange={handleChange}
          onBlur={handleBlur}
          onKeyDown={handleKeyDown}
          min={minDepth}
          max={maxDepth}
          step="1"
          placeholder="Ej: 15000 (150m)"
          style={{
            flex: 1,
            padding: '8px 12px',
            fontSize: '14px',
            border: error ? '2px solid #EF4444' : '2px solid #D1D5DB',
            borderRadius: '6px',
            outline: 'none',
            transition: 'border-color 0.2s',
            fontFamily: 'monospace'
          }}
          onFocus={(e) => {
            e.target.style.borderColor = error ? '#EF4444' : '#3B82F6'
          }}
          onBlurCapture={(e) => {
            if (!error) {
              e.target.style.borderColor = '#D1D5DB'
            }
          }}
        />
        <span style={{
          fontSize: '14px',
          fontWeight: 'bold',
          color: '#6B7280',
          minWidth: '30px'
        }}>
          cm
        </span>
      </div>

      {error && (
        <div style={{
          fontSize: '12px',
          color: '#EF4444',
          fontWeight: '500'
        }}>
          ⚠️ {error}
        </div>
      )}

      <div style={{
        fontSize: '11px',
        color: '#6B7280',
        lineHeight: '1.4'
      }}>
        Rango válido: {minDepth}cm - {maxDepth}cm ({(minDepth/100).toFixed(0)}m - {(maxDepth/100).toFixed(0)}m)
        {trio.depth && (
          <div style={{ marginTop: '4px', color: '#10B981', fontWeight: 'bold' }}>
            ✓ Profundidad: {trio.depth}cm ({(trio.depth/100).toFixed(2)}m)
          </div>
        )}
      </div>
    </div>
  )
}

