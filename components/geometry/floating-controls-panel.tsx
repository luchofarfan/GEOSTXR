'use client'

import React, { useState, useRef, useEffect } from 'react'
import BOHControls from './boh-controls'
import { BOHLinesState, BOHLinesActions } from '@/hooks/geometry/use-boh-lines'

interface FloatingControlsPanelProps {
  state: BOHLinesState
  actions: BOHLinesActions
  trioManager?: any
  planeManager?: any
  scenePhotoId?: string | null
  onOpenPhotoGallery?: () => void
  onResetScene?: () => void
  onOpenCustomColumns?: () => void
  onOpenDrillHoleInfo?: () => void
  onOpenGeospatialPanel?: () => void
  customColumns?: any
  initialPosition?: { x: number; y: number }
}

export function FloatingControlsPanel({
  state,
  actions,
  trioManager,
  planeManager,
  scenePhotoId,
  onOpenPhotoGallery,
  onResetScene,
  onOpenCustomColumns,
  onOpenDrillHoleInfo,
  onOpenGeospatialPanel,
  customColumns,
  initialPosition = { x: 20, y: 20 }
}: FloatingControlsPanelProps) {
  const [position, setPosition] = useState(initialPosition)
  const [isDragging, setIsDragging] = useState(false)
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 })
  const [isMinimized, setIsMinimized] = useState(false)
  const panelRef = useRef<HTMLDivElement>(null)

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

  return (
    <div
      ref={panelRef}
      style={{
        position: 'absolute',
        left: `${position.x}px`,
        top: `${position.y}px`,
        width: isMinimized ? '300px' : '380px',
        maxHeight: isMinimized ? 'auto' : '90vh',
        backgroundColor: 'rgba(0, 0, 0, 0.25)',
        borderRadius: '12px',
        boxShadow: '0 10px 40px rgba(0,0,0,0.5), 0 0 0 1px rgba(255,255,255,0.2)',
        zIndex: 1000,
        backdropFilter: 'blur(20px)',
        transition: isDragging ? 'none' : 'all 0.2s ease',
        overflow: 'hidden'
      }}
    >
      {/* Draggable Header */}
      <div
        onMouseDown={handleMouseDown}
        style={{
          padding: '12px 16px',
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          cursor: isDragging ? 'grabbing' : 'grab',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          userSelect: 'none'
        }}
      >
        <h3 className="text-lg font-bold text-white flex items-center gap-2">
          <span>⚙️</span>
          <span>Controles & Medición</span>
        </h3>
        <button
          onClick={(e) => {
            e.stopPropagation()
            setIsMinimized(!isMinimized)
          }}
          style={{
            background: 'rgba(255,255,255,0.2)',
            border: 'none',
            borderRadius: '6px',
            color: 'white',
            fontSize: '18px',
            width: '32px',
            height: '32px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'background 0.2s'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = 'rgba(255,255,255,0.3)'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'rgba(255,255,255,0.2)'
          }}
        >
          {isMinimized ? '▼' : '▲'}
        </button>
      </div>

      {/* Panel Content */}
      {!isMinimized && (
        <div
          className="floating-panel-content"
          style={{
            padding: '16px',
            maxHeight: 'calc(90vh - 60px)',
            overflowY: 'auto',
            color: 'white'
          }}
        >
          {/* Scene Photo Indicator */}
          {scenePhotoId && (
            <div className="mb-4 p-3 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg border-2 border-green-500">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-bold text-green-900">📸 Foto de Escena</span>
                <button
                  onClick={onOpenPhotoGallery}
                  className="text-xs bg-green-600 hover:bg-green-700 text-white px-2 py-1 rounded font-bold transition-colors"
                >
                  Ver Galería
                </button>
              </div>
              <div className="text-xs text-green-800">
                ✅ Escena capturada - Todos los planos asociados a esta foto
              </div>
            </div>
          )}

          {/* Reset Scene Button */}
          {(scenePhotoId || (trioManager && trioManager.normalTrios.length > 0)) && (
            <div className="mb-4">
              <button
                onClick={onResetScene}
                className="w-full py-2 px-4 bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 text-white rounded-lg font-bold text-sm transition-all shadow-md flex items-center justify-center gap-2"
              >
                <span>🔄</span>
                <span>Nueva Escena</span>
              </button>
            </div>
          )}

          {/* Drill Hole Info Button */}
          <div className="mb-4">
            <button
              onClick={onOpenDrillHoleInfo}
              className="w-full py-2 px-4 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white rounded-lg font-bold text-sm transition-all shadow-md flex items-center justify-center gap-2"
            >
              <span>🎯</span>
              <span>Info del Sondaje</span>
            </button>
          </div>

          {/* Geospatial Data Button */}
          <div className="mb-4">
            <button
              onClick={onOpenGeospatialPanel}
              className="w-full py-2 px-4 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white rounded-lg font-bold text-sm transition-all shadow-md flex items-center justify-center gap-2"
            >
              <span>🌍</span>
              <span>Datos Geoespaciales</span>
            </button>
          </div>

          {/* Custom Columns Button */}
          <div className="mb-4">
            <button
              onClick={onOpenCustomColumns}
              className="w-full py-2 px-4 bg-gradient-to-r from-purple-600 to-violet-600 hover:from-purple-700 hover:to-violet-700 text-white rounded-lg font-bold text-sm transition-all shadow-md flex items-center justify-center gap-2"
            >
              <span>📋</span>
              <span>Columnas Personalizadas</span>
              {customColumns && customColumns.columns.length > 0 && (
                <span className="text-xs bg-white/20 px-2 py-0.5 rounded-full">
                  {customColumns.columns.length}
                </span>
              )}
            </button>
          </div>

          {/* BOH Controls */}
          <BOHControls
            state={state}
            actions={actions}
            trioManager={trioManager}
            planeManager={planeManager}
            customColumns={customColumns}
          />
        </div>
      )}
    </div>
  )
}

