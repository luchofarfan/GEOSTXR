'use client'

import React from 'react'

interface DistanceIndicatorProps {
  estimatedDistance: number
  targetDistance: number
  tolerance: number
  isDetecting: boolean
}

export function DistanceIndicator({
  estimatedDistance,
  targetDistance,
  tolerance,
  isDetecting
}: DistanceIndicatorProps) {
  if (!isDetecting) return null

  const difference = Math.abs(estimatedDistance - targetDistance)
  const isInRange = difference <= tolerance
  const isTooClose = estimatedDistance < targetDistance - tolerance
  const isTooFar = estimatedDistance > targetDistance + tolerance

  // Calculate progress percentage (0-100%)
  const minRange = targetDistance - tolerance * 2
  const maxRange = targetDistance + tolerance * 2
  const progress = Math.min(100, Math.max(0, 
    ((estimatedDistance - minRange) / (maxRange - minRange)) * 100
  ))

  return (
    <div style={{
      position: 'absolute',
      top: '80px',
      left: '50%',
      transform: 'translateX(-50%)',
      zIndex: 3001,
      pointerEvents: 'none'
    }}>
      <div style={{
        background: isInRange 
          ? 'linear-gradient(135deg, #10b981 0%, #059669 100%)'
          : isTooClose
            ? 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)'
            : 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
        borderRadius: '12px',
        padding: '12px 20px',
        boxShadow: '0 8px 20px rgba(0,0,0,0.5)',
        backdropFilter: 'blur(10px)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '8px',
        minWidth: '220px',
        transition: 'all 0.3s ease'
      }}>
        {/* Distance Display */}
        <div style={{
          fontSize: '24px',
          fontWeight: 'bold',
          color: 'white',
          textShadow: '0 2px 4px rgba(0,0,0,0.5)'
        }}>
          {estimatedDistance < 100 ? estimatedDistance.toFixed(1) : '---'} cm
        </div>

        {/* Status Message */}
        <div style={{
          fontSize: '12px',
          color: 'white',
          textAlign: 'center',
          fontWeight: '600',
          textShadow: '0 1px 2px rgba(0,0,0,0.5)'
        }}>
          {isInRange && '✅ Distancia Óptima - Capturando...'}
          {isTooClose && '⬆️ Aléjate un poco'}
          {isTooFar && '⬇️ Acércate más'}
        </div>

        {/* Progress Bar */}
        <div style={{
          width: '100%',
          height: '4px',
          background: 'rgba(255,255,255,0.3)',
          borderRadius: '2px',
          overflow: 'hidden'
        }}>
          <div style={{
            width: `${100 - Math.abs(50 - progress)}%`,
            height: '100%',
            background: isInRange ? '#10b981' : '#3b82f6',
            transition: 'width 0.2s ease'
          }} />
        </div>

        {/* Target Info */}
        <div style={{
          fontSize: '10px',
          color: 'rgba(255,255,255,0.8)',
          textAlign: 'center'
        }}>
          Objetivo: {targetDistance}cm ± {tolerance}cm
        </div>
      </div>
    </div>
  )
}

