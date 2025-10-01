'use client'

import React from 'react'
import { ACAngleData, validateACAngle } from '@/hooks/geometry/use-ac-angle'

interface ACMeasurementDisplayProps {
  acData: ACAngleData
  className?: string
}

export function ACMeasurementDisplay({ acData, className = '' }: ACMeasurementDisplayProps) {
  const validation = validateACAngle(acData.ac)
  
  return (
    <div className={`ac-measurement-display ${className}`}>
      <div style={{
        backgroundColor: validation.valid ? '#ECFDF5' : '#FEF2F2',
        border: `2px solid ${validation.valid ? '#10B981' : '#EF4444'}`,
        borderRadius: '12px',
        padding: '16px',
        marginBottom: '16px'
      }}>
        {/* Header */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '12px'
        }}>
          <h3 style={{
            fontSize: '16px',
            fontWeight: 'bold',
            color: '#1F2937'
          }}>
            📏 AC (Ángulo de Calce)
          </h3>
          {validation.valid ? (
            <span style={{
              fontSize: '11px',
              fontWeight: 'bold',
              color: '#10B981',
              backgroundColor: '#D1FAE5',
              padding: '4px 8px',
              borderRadius: '6px'
            }}>
              ✓ VÁLIDO
            </span>
          ) : (
            <span style={{
              fontSize: '11px',
              fontWeight: 'bold',
              color: '#EF4444',
              backgroundColor: '#FEE2E2',
              padding: '4px 8px',
              borderRadius: '6px'
            }}>
              ⚠ FUERA DE RANGO
            </span>
          )}
        </div>

        {/* AC Value - Large and prominent */}
        <div style={{
          textAlign: 'center',
          marginBottom: '16px'
        }}>
          <div style={{
            fontSize: '48px',
            fontWeight: 'bold',
            color: validation.valid ? '#10B981' : '#EF4444',
            lineHeight: '1',
            fontFamily: 'monospace',
            letterSpacing: '-1px'
          }}>
            {acData.ac.toFixed(2)}°
          </div>
          <div style={{
            fontSize: '12px',
            color: '#6B7280',
            marginTop: '4px',
            fontWeight: '500'
          }}>
            Diferencia Angular entre BOHs
          </div>
        </div>

        {/* Relative Position Summary */}
        <div style={{
          backgroundColor: 'rgba(59, 130, 246, 0.1)',
          border: '1px solid rgba(59, 130, 246, 0.3)',
          borderRadius: '8px',
          padding: '10px',
          marginBottom: '12px',
          textAlign: 'center'
        }}>
          <div style={{ fontSize: '11px', color: '#6B7280', marginBottom: '4px' }}>
            Posición Relativa
          </div>
          <div style={{ fontSize: '13px', fontWeight: 'bold', color: '#1F2937' }}>
            {acData.relativePosition}
          </div>
          <div style={{ fontSize: '10px', color: '#6B7280', marginTop: '4px' }}>
            {acData.convergence > 0 ? '📐 Divergentes' : acData.convergence < 0 ? '📐 Convergentes' : '📐 Paralelas'}
            {acData.convergence !== 0 && ` (${Math.abs(acData.convergence).toFixed(1)}°)`}
          </div>
        </div>

        {/* BOH Positions - Detailed */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '12px',
          marginBottom: '12px'
        }}>
          {/* BOH 1 */}
          <div style={{
            backgroundColor: 'rgba(239, 68, 68, 0.1)',
            border: '1px solid rgba(239, 68, 68, 0.3)',
            borderRadius: '8px',
            padding: '10px'
          }}>
            <div style={{ fontSize: '11px', color: '#6B7280', marginBottom: '4px', fontWeight: '600' }}>
              🔴 BOH Línea 1
            </div>
            <div style={{ fontSize: '20px', fontWeight: 'bold', color: '#EF4444', fontFamily: 'monospace' }}>
              {acData.boh1.angle.toFixed(1)}°
            </div>
            <div style={{ fontSize: '10px', color: '#9CA3AF', marginTop: '4px', lineHeight: '1.4' }}>
              <div><strong>Posición:</strong> {acData.boh1.position}</div>
              <div><strong>Δ Centro:</strong> {acData.boh1.displacement > 0 ? '+' : ''}{acData.boh1.displacement.toFixed(1)}°</div>
              <div><strong>Superficie:</strong> ({acData.boh1.radialX.toFixed(2)}, {acData.boh1.radialY.toFixed(2)})cm</div>
            </div>
          </div>

          {/* BOH 2 */}
          <div style={{
            backgroundColor: 'rgba(16, 185, 129, 0.1)',
            border: '1px solid rgba(16, 185, 129, 0.3)',
            borderRadius: '8px',
            padding: '10px'
          }}>
            <div style={{ fontSize: '11px', color: '#6B7280', marginBottom: '4px', fontWeight: '600' }}>
              🟢 BOH Línea 2
            </div>
            <div style={{ fontSize: '20px', fontWeight: 'bold', color: '#10B981', fontFamily: 'monospace' }}>
              {acData.boh2.angle.toFixed(1)}°
            </div>
            <div style={{ fontSize: '10px', color: '#9CA3AF', marginTop: '4px', lineHeight: '1.4' }}>
              <div><strong>Posición:</strong> {acData.boh2.position}</div>
              <div><strong>Δ Centro:</strong> {acData.boh2.displacement > 0 ? '+' : ''}{acData.boh2.displacement.toFixed(1)}°</div>
              <div><strong>Superficie:</strong> ({acData.boh2.radialX.toFixed(2)}, {acData.boh2.radialY.toFixed(2)})cm</div>
            </div>
          </div>
        </div>

        {/* Validation Warning */}
        {validation.warning && (
          <div style={{
            backgroundColor: '#FEF2F2',
            border: '1px solid #FCA5A5',
            borderRadius: '6px',
            padding: '8px',
            fontSize: '11px',
            color: '#991B1B'
          }}>
            ⚠️ {validation.warning}
          </div>
        )}

        {/* Info */}
        <div style={{
          fontSize: '11px',
          color: '#6B7280',
          marginTop: '12px',
          padding: '8px',
          backgroundColor: 'rgba(59, 130, 246, 0.05)',
          borderRadius: '6px',
          lineHeight: '1.5'
        }}>
          💡 <strong>AC</strong> mide la separación angular entre las dos líneas BOH en la superficie del cilindro.
          Se actualiza automáticamente al mover los sliders.
        </div>
      </div>
    </div>
  )
}

