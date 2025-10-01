'use client'

import React from 'react'

interface SceneCaptureButtonsProps {
  scenePhotoId: string | null
  hasActiveTrios: boolean
  onCaptureScene: () => void
  onFinalizeCapture: () => void
  disabled?: boolean
}

export function SceneCaptureButtons({
  scenePhotoId,
  hasActiveTrios,
  onCaptureScene,
  onFinalizeCapture,
  disabled = false
}: SceneCaptureButtonsProps) {
  return (
    <div
      style={{
        position: 'absolute',
        top: '20px',
        right: '20px',
        display: 'flex',
        flexDirection: 'column',
        gap: '12px',
        zIndex: 2000,
        pointerEvents: 'auto'
      }}
    >
      {/* Botón de Captura de Foto */}
      {!scenePhotoId && (
        <button
          onClick={onCaptureScene}
          disabled={disabled}
          style={{
            background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
            border: 'none',
            borderRadius: '12px',
            padding: '16px 20px',
            color: 'white',
            fontSize: '16px',
            fontWeight: 'bold',
            cursor: disabled ? 'not-allowed' : 'pointer',
            boxShadow: '0 8px 20px rgba(16, 185, 129, 0.4)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '6px',
            minWidth: '160px',
            transition: 'all 0.3s ease',
            opacity: disabled ? 0.5 : 1,
            backdropFilter: 'blur(10px)'
          }}
          onMouseEnter={(e) => {
            if (!disabled) {
              e.currentTarget.style.transform = 'scale(1.05)'
              e.currentTarget.style.boxShadow = '0 12px 30px rgba(16, 185, 129, 0.6)'
            }
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'scale(1)'
            e.currentTarget.style.boxShadow = '0 8px 20px rgba(16, 185, 129, 0.4)'
          }}
        >
          <span style={{ fontSize: '32px' }}>📸</span>
          <span style={{ fontSize: '14px', textShadow: '0 2px 4px rgba(0,0,0,0.3)' }}>
            Capturar Escena
          </span>
        </button>
      )}

      {/* Indicador de Foto Capturada + Botón Finalizar */}
      {scenePhotoId && (
        <>
          {/* Indicador de foto capturada */}
          <div
            style={{
              background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
              borderRadius: '12px',
              padding: '12px 16px',
              color: 'white',
              fontSize: '14px',
              fontWeight: 'bold',
              boxShadow: '0 8px 20px rgba(16, 185, 129, 0.4)',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '4px',
              minWidth: '160px',
              backdropFilter: 'blur(10px)'
            }}
          >
            <span style={{ fontSize: '24px' }}>✅</span>
            <span style={{ fontSize: '12px', textAlign: 'center', textShadow: '0 2px 4px rgba(0,0,0,0.3)' }}>
              Foto Capturada
            </span>
            <span style={{ fontSize: '10px', opacity: 0.9, textAlign: 'center' }}>
              Selecciona puntos
            </span>
          </div>

          {/* Botón Finalizar Captura */}
          {hasActiveTrios && (
            <button
              onClick={onFinalizeCapture}
              style={{
                background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
                border: 'none',
                borderRadius: '12px',
                padding: '16px 20px',
                color: 'white',
                fontSize: '16px',
                fontWeight: 'bold',
                cursor: 'pointer',
                boxShadow: '0 8px 20px rgba(59, 130, 246, 0.4)',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '6px',
                minWidth: '160px',
                transition: 'all 0.3s ease',
                backdropFilter: 'blur(10px)',
                animation: 'pulse 2s infinite'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'scale(1.05)'
                e.currentTarget.style.boxShadow = '0 12px 30px rgba(59, 130, 246, 0.6)'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'scale(1)'
                e.currentTarget.style.boxShadow = '0 8px 20px rgba(59, 130, 246, 0.4)'
              }}
            >
              <span style={{ fontSize: '32px' }}>✔️</span>
              <span style={{ fontSize: '14px', textShadow: '0 2px 4px rgba(0,0,0,0.3)' }}>
                Finalizar Captura
              </span>
            </button>
          )}
        </>
      )}

      <style jsx>{`
        @keyframes pulse {
          0%, 100% {
            box-shadow: 0 8px 20px rgba(59, 130, 246, 0.4);
          }
          50% {
            box-shadow: 0 12px 35px rgba(59, 130, 246, 0.8);
          }
        }
      `}</style>
    </div>
  )
}

