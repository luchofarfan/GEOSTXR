'use client'

import React, { useState, useRef, useEffect } from 'react'
import { DrillHoleInfo } from '@/hooks/use-drill-hole-info'

interface FloatingDrillHoleInfoPanelProps {
  info: DrillHoleInfo
  onUpdate: (info: Partial<DrillHoleInfo>) => void
  onSaveTemplate: () => void
  templates: DrillHoleInfo[]
  onLoadTemplate: (holeName: string) => void
  onDeleteTemplate: (holeName: string) => void
  onClose: () => void
}

export function FloatingDrillHoleInfoPanel({
  info,
  onUpdate,
  onSaveTemplate,
  templates,
  onLoadTemplate,
  onDeleteTemplate,
  onClose
}: FloatingDrillHoleInfoPanelProps) {
  const [position, setPosition] = useState({ x: 100, y: 100 })
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
        zIndex: 3500,
        minWidth: '380px',
        maxWidth: '450px',
        boxShadow: '0 10px 30px rgba(0,0,0,0.4)',
        borderRadius: '12px',
        overflow: 'hidden',
        transition: isDragging ? 'none' : 'all 0.2s ease',
        fontFamily: 'sans-serif'
      }}
    >
      {/* Header - Draggable */}
      <div
        onMouseDown={handleMouseDown}
        style={{
          background: 'linear-gradient(135deg, #1e40af, #3b82f6)',
          padding: '12px 14px',
          cursor: isDragging ? 'grabbing' : 'grab',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          userSelect: 'none',
          borderBottom: '2px solid #60a5fa'
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
          <span>🎯</span>
          <span>Información del Sondaje</span>
        </div>
        
        <div style={{ display: 'flex', gap: '6px' }}>
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
        </div>
      </div>

      {/* Content */}
      {!isMinimized && (
        <div style={{
          background: 'rgba(0, 0, 0, 0.3)',
          backdropFilter: 'blur(20px)',
          padding: '16px',
          fontSize: '13px',
          color: 'white',
          maxHeight: '70vh',
          overflowY: 'auto'
        }}>
          {/* Info Box */}
          <div style={{
            background: 'rgba(59, 130, 246, 0.2)',
            border: '1px solid rgba(59, 130, 246, 0.4)',
            borderRadius: '8px',
            padding: '10px',
            marginBottom: '16px',
            fontSize: '11px',
            lineHeight: '1.5'
          }}>
            💡 <strong>Configura la ubicación y orientación del collar del sondaje</strong><br/>
            Estos datos se incluirán en el reporte CSV y ayudan a contextualizar las mediciones estructurales.
          </div>

          {/* Nombre del Sondaje */}
          <div style={{ marginBottom: '14px' }}>
            <label style={{ 
              display: 'block', 
              marginBottom: '6px', 
              fontWeight: 'bold',
              color: '#93c5fd',
              fontSize: '12px'
            }}>
              📋 Nombre del Sondaje
            </label>
            <input
              type="text"
              value={info.holeName}
              onChange={(e) => onUpdate({ holeName: e.target.value })}
              placeholder="Ej: DDH-001, RC-022, etc."
              style={{
                width: '100%',
                padding: '8px',
                borderRadius: '6px',
                border: '1px solid rgba(255,255,255,0.3)',
                background: 'rgba(255,255,255,0.1)',
                color: 'white',
                fontSize: '13px'
              }}
            />
          </div>

          {/* Orientación del Sondaje */}
          <div style={{
            background: 'rgba(239, 68, 68, 0.1)',
            border: '1px solid rgba(239, 68, 68, 0.3)',
            borderRadius: '8px',
            padding: '12px',
            marginBottom: '14px'
          }}>
            <div style={{ 
              fontWeight: 'bold', 
              marginBottom: '10px',
              color: '#fca5a5',
              fontSize: '12px'
            }}>
              🧭 Orientación del Sondaje
            </div>
            
            {/* Azimut */}
            <div style={{ marginBottom: '10px' }}>
              <label style={{ 
                display: 'block', 
                marginBottom: '4px',
                fontSize: '11px',
                color: '#d1d5db'
              }}>
                Azimut (grados)
                <span style={{ 
                  marginLeft: '6px',
                  fontSize: '10px',
                  color: '#9ca3af',
                  fontStyle: 'italic'
                }}>
                  0-360° (desde Norte)
                </span>
              </label>
              <input
                type="number"
                value={info.azimuth}
                onChange={(e) => onUpdate({ azimuth: parseFloat(e.target.value) || 0 })}
                min="0"
                max="360"
                step="0.1"
                style={{
                  width: '100%',
                  padding: '6px',
                  borderRadius: '4px',
                  border: '1px solid rgba(255,255,255,0.3)',
                  background: 'rgba(255,255,255,0.1)',
                  color: 'white',
                  fontSize: '12px'
                }}
              />
            </div>

            {/* Inclinación */}
            <div>
              <label style={{ 
                display: 'block', 
                marginBottom: '4px',
                fontSize: '11px',
                color: '#d1d5db'
              }}>
                Inclinación (grados)
                <span style={{ 
                  marginLeft: '6px',
                  fontSize: '10px',
                  color: '#9ca3af',
                  fontStyle: 'italic'
                }}>
                  -90° a 90° (- hacia abajo, + hacia arriba)
                </span>
              </label>
              <input
                type="number"
                value={info.dip}
                onChange={(e) => onUpdate({ dip: parseFloat(e.target.value) || 0 })}
                min="-90"
                max="90"
                step="0.1"
                style={{
                  width: '100%',
                  padding: '6px',
                  borderRadius: '4px',
                  border: '1px solid rgba(255,255,255,0.3)',
                  background: 'rgba(255,255,255,0.1)',
                  color: 'white',
                  fontSize: '12px'
                }}
              />
            </div>
          </div>

          {/* Coordenadas UTM */}
          <div style={{
            background: 'rgba(16, 185, 129, 0.1)',
            border: '1px solid rgba(16, 185, 129, 0.3)',
            borderRadius: '8px',
            padding: '12px',
            marginBottom: '14px'
          }}>
            <div style={{ 
              fontWeight: 'bold', 
              marginBottom: '10px',
              color: '#6ee7b7',
              fontSize: '12px'
            }}>
              📍 Coordenadas del Collar (UTM)
            </div>
            
            {/* Este */}
            <div style={{ marginBottom: '10px' }}>
              <label style={{ 
                display: 'block', 
                marginBottom: '4px',
                fontSize: '11px',
                color: '#d1d5db'
              }}>
                Este (m)
              </label>
              <input
                type="number"
                value={info.utmEast}
                onChange={(e) => onUpdate({ utmEast: parseFloat(e.target.value) || 0 })}
                step="0.01"
                placeholder="Ej: 345678.50"
                style={{
                  width: '100%',
                  padding: '6px',
                  borderRadius: '4px',
                  border: '1px solid rgba(255,255,255,0.3)',
                  background: 'rgba(255,255,255,0.1)',
                  color: 'white',
                  fontSize: '12px'
                }}
              />
            </div>

            {/* Norte */}
            <div style={{ marginBottom: '10px' }}>
              <label style={{ 
                display: 'block', 
                marginBottom: '4px',
                fontSize: '11px',
                color: '#d1d5db'
              }}>
                Norte (m)
              </label>
              <input
                type="number"
                value={info.utmNorth}
                onChange={(e) => onUpdate({ utmNorth: parseFloat(e.target.value) || 0 })}
                step="0.01"
                placeholder="Ej: 8765432.10"
                style={{
                  width: '100%',
                  padding: '6px',
                  borderRadius: '4px',
                  border: '1px solid rgba(255,255,255,0.3)',
                  background: 'rgba(255,255,255,0.1)',
                  color: 'white',
                  fontSize: '12px'
                }}
              />
            </div>

            {/* Cota */}
            <div>
              <label style={{ 
                display: 'block', 
                marginBottom: '4px',
                fontSize: '11px',
                color: '#d1d5db'
              }}>
                Cota / Elevación (m.s.n.m.)
              </label>
              <input
                type="number"
                value={info.elevation}
                onChange={(e) => onUpdate({ elevation: parseFloat(e.target.value) || 0 })}
                step="0.01"
                placeholder="Ej: 2450.75"
                style={{
                  width: '100%',
                  padding: '6px',
                  borderRadius: '4px',
                  border: '1px solid rgba(255,255,255,0.3)',
                  background: 'rgba(255,255,255,0.1)',
                  color: 'white',
                  fontSize: '12px'
                }}
              />
            </div>
          </div>

          {/* Templates Section */}
          <div style={{
            background: 'rgba(168, 85, 247, 0.1)',
            border: '1px solid rgba(168, 85, 247, 0.3)',
            borderRadius: '8px',
            padding: '12px',
            marginBottom: '14px'
          }}>
            <div style={{ 
              fontWeight: 'bold', 
              marginBottom: '10px',
              color: '#c4b5fd',
              fontSize: '12px'
            }}>
              💾 Plantillas Guardadas
            </div>

            {templates.length === 0 ? (
              <div style={{ 
                fontSize: '11px', 
                color: '#9ca3af',
                fontStyle: 'italic',
                textAlign: 'center',
                padding: '8px'
              }}>
                No hay plantillas guardadas
              </div>
            ) : (
              <div style={{ 
                display: 'flex', 
                flexDirection: 'column', 
                gap: '6px',
                maxHeight: '150px',
                overflowY: 'auto'
              }}>
                {templates.map((template) => (
                  <div
                    key={template.holeName}
                    style={{
                      background: 'rgba(255,255,255,0.05)',
                      padding: '8px',
                      borderRadius: '6px',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center'
                    }}
                  >
                    <div style={{ fontSize: '11px' }}>
                      <div style={{ fontWeight: 'bold', color: 'white' }}>
                        {template.holeName}
                      </div>
                      <div style={{ fontSize: '10px', color: '#9ca3af' }}>
                        Az: {template.azimuth.toFixed(1)}° | Inc: {template.dip.toFixed(1)}°
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: '4px' }}>
                      <button
                        onClick={() => onLoadTemplate(template.holeName)}
                        style={{
                          padding: '4px 8px',
                          fontSize: '10px',
                          background: 'rgba(59, 130, 246, 0.6)',
                          border: 'none',
                          borderRadius: '4px',
                          color: 'white',
                          cursor: 'pointer',
                          fontWeight: 'bold'
                        }}
                      >
                        Cargar
                      </button>
                      <button
                        onClick={() => onDeleteTemplate(template.holeName)}
                        style={{
                          padding: '4px 8px',
                          fontSize: '10px',
                          background: 'rgba(239, 68, 68, 0.6)',
                          border: 'none',
                          borderRadius: '4px',
                          color: 'white',
                          cursor: 'pointer',
                          fontWeight: 'bold'
                        }}
                      >
                        ✕
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            <button
              onClick={onSaveTemplate}
              style={{
                width: '100%',
                marginTop: '10px',
                padding: '8px',
                background: 'rgba(168, 85, 247, 0.6)',
                border: 'none',
                borderRadius: '6px',
                color: 'white',
                cursor: 'pointer',
                fontSize: '12px',
                fontWeight: 'bold'
              }}
              disabled={!info.holeName}
            >
              💾 Guardar como Plantilla
            </button>
          </div>

          {/* Summary */}
          <div style={{
            background: 'rgba(255,255,255,0.05)',
            padding: '10px',
            borderRadius: '6px',
            fontSize: '11px',
            lineHeight: '1.6',
            color: '#d1d5db'
          }}>
            <div style={{ fontWeight: 'bold', marginBottom: '6px', color: '#93c5fd' }}>
              📋 Resumen Actual:
            </div>
            <div><strong>Sondaje:</strong> {info.holeName || '(sin nombre)'}</div>
            <div><strong>Azimut:</strong> {info.azimuth.toFixed(2)}°</div>
            <div><strong>Inclinación:</strong> {info.dip.toFixed(2)}°</div>
            <div><strong>Este:</strong> {info.utmEast.toFixed(2)} m</div>
            <div><strong>Norte:</strong> {info.utmNorth.toFixed(2)} m</div>
            <div><strong>Cota:</strong> {info.elevation.toFixed(2)} m.s.n.m.</div>
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

