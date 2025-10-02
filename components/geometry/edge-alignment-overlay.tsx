/**
 * Edge Alignment Overlay
 * Displays detected real cylinder edges and compares with virtual cylinder borders
 */

import { useEffect, useState } from 'react'

interface EdgeAlignmentOverlayProps {
  detectedLeftX: number
  detectedRightX: number
  virtualLeftX: number
  virtualRightX: number
  alignmentQuality: number // 0-1
  canvasWidth: number
  canvasHeight: number
  enabled: boolean
}

export function EdgeAlignmentOverlay({
  detectedLeftX,
  detectedRightX,
  virtualLeftX,
  virtualRightX,
  alignmentQuality,
  canvasWidth,
  canvasHeight,
  enabled
}: EdgeAlignmentOverlayProps) {
  const [showHelp, setShowHelp] = useState(true)

  useEffect(() => {
    // Auto-hide help after 5 seconds
    const timer = setTimeout(() => setShowHelp(false), 5000)
    return () => clearTimeout(timer)
  }, [])

  if (!enabled || detectedLeftX === 0 || detectedRightX === 0) {
    return null
  }

  // Calculate alignment metrics
  const leftDiff = Math.abs(detectedLeftX - virtualLeftX)
  const rightDiff = Math.abs(detectedRightX - virtualRightX)
  const avgDiff = (leftDiff + rightDiff) / 2
  const maxAllowedDiff = canvasWidth * 0.05 // 5% of canvas width
  const isWellAligned = avgDiff < maxAllowedDiff

  // Determine color based on alignment quality
  const getAlignmentColor = () => {
    if (alignmentQuality > 0.8 || isWellAligned) return '#00ff00' // Green: good
    if (alignmentQuality > 0.5) return '#ffaa00' // Orange: ok
    return '#ff0000' // Red: poor
  }

  const color = getAlignmentColor()
  const opacity = enabled ? 0.7 : 0

  return (
    <div
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        pointerEvents: 'none',
        zIndex: 15,
        opacity,
        transition: 'opacity 0.3s ease'
      }}
    >
      {/* Detected Left Edge - Limited to visible cylinder area (middle 80% of screen) */}
      <div
        style={{
          position: 'absolute',
          left: `${(detectedLeftX / canvasWidth) * 100}%`,
          top: '10%',
          width: '3px',
          height: '80%',
          background: `linear-gradient(to bottom, transparent 0%, ${color} 15%, ${color} 85%, transparent 100%)`,
          boxShadow: `0 0 10px ${color}`,
          animation: 'pulse-edge 2s ease-in-out infinite'
        }}
      />

      {/* Detected Right Edge - Limited to visible cylinder area (middle 80% of screen) */}
      <div
        style={{
          position: 'absolute',
          left: `${(detectedRightX / canvasWidth) * 100}%`,
          top: '10%',
          width: '3px',
          height: '80%',
          background: `linear-gradient(to bottom, transparent 0%, ${color} 15%, ${color} 85%, transparent 100%)`,
          boxShadow: `0 0 10px ${color}`,
          animation: 'pulse-edge 2s ease-in-out infinite'
        }}
      />

      {/* Alignment Status Indicator */}
      <div
        style={{
          position: 'absolute',
          top: '10px',
          left: '50%',
          transform: 'translateX(-50%)',
          background: 'rgba(0, 0, 0, 0.7)',
          backdropFilter: 'blur(10px)',
          padding: '8px 16px',
          borderRadius: '20px',
          color: 'white',
          fontSize: '14px',
          fontWeight: '600',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          border: `2px solid ${color}`,
          boxShadow: `0 0 15px ${color}40`
        }}
      >
        <div
          style={{
            width: '10px',
            height: '10px',
            borderRadius: '50%',
            background: color,
            boxShadow: `0 0 8px ${color}`
          }}
        />
        {isWellAligned ? '✅ Bordes Alineados' : '⚠️ Ajustar Alineamiento'}
      </div>

      {/* Alignment Metrics (Debug Info) */}
      <div
        style={{
          position: 'absolute',
          bottom: '10px',
          left: '10px',
          background: 'rgba(0, 0, 0, 0.6)',
          backdropFilter: 'blur(8px)',
          padding: '6px 10px',
          borderRadius: '8px',
          color: 'white',
          fontSize: '11px',
          fontFamily: 'monospace',
          lineHeight: '1.5'
        }}
      >
        <div>🎯 Calidad: {(alignmentQuality * 100).toFixed(0)}%</div>
        <div>📏 Ancho: {(detectedRightX - detectedLeftX).toFixed(0)}px</div>
        <div>⬅️ Izq: Δ{leftDiff.toFixed(0)}px</div>
        <div>➡️ Der: Δ{rightDiff.toFixed(0)}px</div>
      </div>

      {/* Help Text (temporary) */}
      {showHelp && (
        <div
          style={{
            position: 'absolute',
            bottom: '80px',
            left: '50%',
            transform: 'translateX(-50%)',
            background: 'rgba(0, 0, 0, 0.8)',
            backdropFilter: 'blur(10px)',
            padding: '12px 20px',
            borderRadius: '12px',
            color: 'white',
            fontSize: '13px',
            maxWidth: '300px',
            textAlign: 'center',
            border: '1px solid rgba(255, 255, 255, 0.2)'
          }}
        >
          Los bordes detectados del testigo se muestran con líneas de color.
          Alinea el testigo real con los bordes virtuales negros.
        </div>
      )}

      {/* CSS Animation */}
      <style jsx>{`
        @keyframes pulse-edge {
          0%, 100% {
            opacity: 0.7;
          }
          50% {
            opacity: 1;
          }
        }
      `}</style>
    </div>
  )
}

