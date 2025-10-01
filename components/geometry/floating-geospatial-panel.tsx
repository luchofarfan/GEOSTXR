'use client'

import React, { useState, useRef, useEffect } from 'react'
import { GeospatialPlaneData } from '@/hooks/geometry/use-geospatial-calculations'
import { formatOrientation, formatCoordinates } from '@/lib/geospatial-transforms'

interface FloatingGeospatialPanelProps {
  geospatialData: GeospatialPlaneData[]
  selectedPlaneId?: string | null
  onClose: () => void
}

export function FloatingGeospatialPanel({
  geospatialData,
  selectedPlaneId,
  onClose
}: FloatingGeospatialPanelProps) {
  const [position, setPosition] = useState({ x: 400, y: 100 })
  const [isDragging, setIsDragging] = useState(false)
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 })
  const [isMinimized, setIsMinimized] = useState(false)
  const [selectedTab, setSelectedTab] = useState<'all' | 'single'>('all')
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

  // Filter data
  const hasGeospatialData = geospatialData.some(d => d.realOrientation !== null)
  const selectedPlane = selectedPlaneId ? geospatialData.find(d => d.planeId === selectedPlaneId) : null

  return (
    <div
      ref={panelRef}
      style={{
        position: 'fixed',
        left: `${position.x}px`,
        top: `${position.y}px`,
        zIndex: 3600,
        minWidth: '420px',
        maxWidth: '500px',
        boxShadow: '0 10px 40px rgba(0,0,0,0.5)',
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
          background: 'linear-gradient(135deg, #059669, #10b981)',
          padding: '12px 14px',
          cursor: isDragging ? 'grabbing' : 'grab',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          userSelect: 'none',
          borderBottom: '2px solid #34d399'
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
          <span>🌍</span>
          <span>Datos Geoespaciales</span>
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
          {!hasGeospatialData ? (
            // No data available
            <div style={{
              background: 'rgba(239, 68, 68, 0.2)',
              border: '1px solid rgba(239, 68, 68, 0.4)',
              borderRadius: '8px',
              padding: '12px',
              textAlign: 'center',
              lineHeight: '1.6'
            }}>
              <div style={{ fontSize: '32px', marginBottom: '8px' }}>⚠️</div>
              <div style={{ fontWeight: 'bold', marginBottom: '8px' }}>
                Sin Información del Sondaje
              </div>
              <div style={{ fontSize: '11px', color: '#fca5a5' }}>
                Para calcular orientaciones reales y coordenadas espaciales,
                debes configurar primero la información del sondaje 
                (azimut, inclinación, collar UTM).
              </div>
              <div style={{ marginTop: '12px' }}>
                <button
                  onClick={onClose}
                  style={{
                    padding: '8px 16px',
                    background: '#ef4444',
                    border: 'none',
                    borderRadius: '6px',
                    color: 'white',
                    cursor: 'pointer',
                    fontSize: '12px',
                    fontWeight: 'bold'
                  }}
                >
                  Entendido
                </button>
              </div>
            </div>
          ) : (
            <>
              {/* Tabs */}
              <div style={{
                display: 'flex',
                gap: '8px',
                marginBottom: '16px'
              }}>
                <button
                  onClick={() => setSelectedTab('all')}
                  style={{
                    flex: 1,
                    padding: '8px',
                    background: selectedTab === 'all' 
                      ? 'rgba(16, 185, 129, 0.4)' 
                      : 'rgba(255,255,255,0.1)',
                    border: selectedTab === 'all' 
                      ? '2px solid #10b981' 
                      : '2px solid transparent',
                    borderRadius: '6px',
                    color: 'white',
                    cursor: 'pointer',
                    fontSize: '12px',
                    fontWeight: 'bold',
                    transition: 'all 0.2s'
                  }}
                >
                  📊 Todos los Planos ({geospatialData.length})
                </button>
                <button
                  onClick={() => setSelectedTab('single')}
                  style={{
                    flex: 1,
                    padding: '8px',
                    background: selectedTab === 'single' 
                      ? 'rgba(16, 185, 129, 0.4)' 
                      : 'rgba(255,255,255,0.1)',
                    border: selectedTab === 'single' 
                      ? '2px solid #10b981' 
                      : '2px solid transparent',
                    borderRadius: '6px',
                    color: 'white',
                    cursor: 'pointer',
                    fontSize: '12px',
                    fontWeight: 'bold',
                    transition: 'all 0.2s'
                  }}
                  disabled={!selectedPlane}
                >
                  🎯 Plano Seleccionado
                </button>
              </div>

              {/* Content based on tab */}
              {selectedTab === 'all' ? (
                // All planes view
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {geospatialData.map((data, index) => (
                    <div
                      key={data.planeId}
                      style={{
                        background: data.planeId === selectedPlaneId 
                          ? 'rgba(16, 185, 129, 0.2)' 
                          : 'rgba(255,255,255,0.05)',
                        border: data.planeId === selectedPlaneId 
                          ? '2px solid #10b981' 
                          : '1px solid rgba(255,255,255,0.1)',
                        borderRadius: '8px',
                        padding: '12px'
                      }}
                    >
                      <div style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        marginBottom: '10px'
                      }}>
                        <div style={{ fontWeight: 'bold', fontSize: '13px' }}>
                          📐 Plano {index + 1}
                        </div>
                        <div style={{
                          fontSize: '10px',
                          background: data.bohNumber === 1 ? '#ef4444' : '#10b981',
                          padding: '2px 8px',
                          borderRadius: '10px',
                          fontWeight: 'bold'
                        }}>
                          BOH{data.bohNumber}
                        </div>
                      </div>

                      {data.realOrientation ? (
                        <>
                          {/* Orientation */}
                          <div style={{
                            background: 'rgba(59, 130, 246, 0.15)',
                            borderRadius: '6px',
                            padding: '8px',
                            marginBottom: '8px'
                          }}>
                            <div style={{ fontSize: '10px', color: '#93c5fd', marginBottom: '4px' }}>
                              🧭 Orientación Real
                            </div>
                            <div style={{ fontSize: '18px', fontWeight: 'bold', fontFamily: 'monospace' }}>
                              {data.realOrientation.dip.toFixed(1)}° / {data.realOrientation.dipDirection.toFixed(1)}°
                            </div>
                            <div style={{ fontSize: '10px', color: '#d1d5db', marginTop: '2px' }}>
                              Dip / Dip Direction
                            </div>
                          </div>

                          {/* Coordinates */}
                          {data.spatialCoords && (
                            <div style={{
                              background: 'rgba(16, 185, 129, 0.15)',
                              borderRadius: '6px',
                              padding: '8px'
                            }}>
                              <div style={{ fontSize: '10px', color: '#6ee7b7', marginBottom: '4px' }}>
                                📍 Coordenadas Espaciales
                              </div>
                              <div style={{ fontSize: '11px', lineHeight: '1.6', fontFamily: 'monospace' }}>
                                <div><strong>E:</strong> {data.spatialCoords.east.toFixed(2)} m</div>
                                <div><strong>N:</strong> {data.spatialCoords.north.toFixed(2)} m</div>
                                <div><strong>Z:</strong> {data.spatialCoords.elevation.toFixed(2)} m.s.n.m.</div>
                              </div>
                            </div>
                          )}
                        </>
                      ) : (
                        <div style={{
                          fontSize: '11px',
                          color: '#fca5a5',
                          fontStyle: 'italic',
                          textAlign: 'center',
                          padding: '8px'
                        }}>
                          Sin datos geoespaciales
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                // Single plane detailed view
                selectedPlane && selectedPlane.realOrientation ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                    {/* Local measurements */}
                    <div style={{
                      background: 'rgba(168, 85, 247, 0.15)',
                      border: '1px solid rgba(168, 85, 247, 0.3)',
                      borderRadius: '8px',
                      padding: '12px'
                    }}>
                      <div style={{ fontWeight: 'bold', marginBottom: '10px', color: '#c4b5fd' }}>
                        📏 Mediciones Locales (Cilindro)
                      </div>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', fontSize: '11px' }}>
                        <div>
                          <div style={{ color: '#9ca3af' }}>Alpha (α)</div>
                          <div style={{ fontWeight: 'bold', fontFamily: 'monospace' }}>
                            {selectedPlane.alpha.toFixed(2)}°
                          </div>
                        </div>
                        <div>
                          <div style={{ color: '#9ca3af' }}>Beta (β)</div>
                          <div style={{ fontWeight: 'bold', fontFamily: 'monospace' }}>
                            {selectedPlane.beta.toFixed(2)}°
                          </div>
                        </div>
                        <div>
                          <div style={{ color: '#9ca3af' }}>Azimuth Local</div>
                          <div style={{ fontWeight: 'bold', fontFamily: 'monospace' }}>
                            {selectedPlane.azimuthLocal.toFixed(2)}°
                          </div>
                        </div>
                        <div>
                          <div style={{ color: '#9ca3af' }}>Profundidad</div>
                          <div style={{ fontWeight: 'bold', fontFamily: 'monospace' }}>
                            {selectedPlane.depthCm.toFixed(2)} cm
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Real orientation */}
                    <div style={{
                      background: 'rgba(59, 130, 246, 0.15)',
                      border: '1px solid rgba(59, 130, 246, 0.3)',
                      borderRadius: '8px',
                      padding: '12px'
                    }}>
                      <div style={{ fontWeight: 'bold', marginBottom: '10px', color: '#93c5fd' }}>
                        🧭 Orientación Real (Global)
                      </div>
                      <div style={{
                        display: 'flex',
                        justifyContent: 'space-around',
                        marginBottom: '10px'
                      }}>
                        <div style={{ textAlign: 'center' }}>
                          <div style={{ fontSize: '10px', color: '#9ca3af', marginBottom: '4px' }}>
                            Dip (Buzamiento)
                          </div>
                          <div style={{
                            fontSize: '28px',
                            fontWeight: 'bold',
                            fontFamily: 'monospace',
                            color: '#60a5fa'
                          }}>
                            {selectedPlane.realOrientation.dip.toFixed(1)}°
                          </div>
                        </div>
                        <div style={{
                          width: '1px',
                          background: 'rgba(255,255,255,0.2)',
                          margin: '0 10px'
                        }} />
                        <div style={{ textAlign: 'center' }}>
                          <div style={{ fontSize: '10px', color: '#9ca3af', marginBottom: '4px' }}>
                            Dip Direction
                          </div>
                          <div style={{
                            fontSize: '28px',
                            fontWeight: 'bold',
                            fontFamily: 'monospace',
                            color: '#34d399'
                          }}>
                            {selectedPlane.realOrientation.dipDirection.toFixed(1)}°
                          </div>
                        </div>
                      </div>
                      <div style={{
                        fontSize: '11px',
                        color: '#d1d5db',
                        textAlign: 'center',
                        padding: '6px',
                        background: 'rgba(0,0,0,0.2)',
                        borderRadius: '4px'
                      }}>
                        Notación: {formatOrientation(selectedPlane.realOrientation)}
                      </div>
                    </div>

                    {/* Spatial coordinates */}
                    {selectedPlane.spatialCoords && (
                      <div style={{
                        background: 'rgba(16, 185, 129, 0.15)',
                        border: '1px solid rgba(16, 185, 129, 0.3)',
                        borderRadius: '8px',
                        padding: '12px'
                      }}>
                        <div style={{ fontWeight: 'bold', marginBottom: '10px', color: '#6ee7b7' }}>
                          📍 Coordenadas Espaciales (UTM)
                        </div>
                        <div style={{ fontSize: '12px', lineHeight: '1.8', fontFamily: 'monospace' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                            <span style={{ color: '#9ca3af' }}>Este (E):</span>
                            <span style={{ fontWeight: 'bold' }}>
                              {selectedPlane.spatialCoords.east.toFixed(2)} m
                            </span>
                          </div>
                          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                            <span style={{ color: '#9ca3af' }}>Norte (N):</span>
                            <span style={{ fontWeight: 'bold' }}>
                              {selectedPlane.spatialCoords.north.toFixed(2)} m
                            </span>
                          </div>
                          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                            <span style={{ color: '#9ca3af' }}>Elevación (Z):</span>
                            <span style={{ fontWeight: 'bold' }}>
                              {selectedPlane.spatialCoords.elevation.toFixed(2)} m.s.n.m.
                            </span>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* BOH reference */}
                    <div style={{
                      fontSize: '11px',
                      color: '#d1d5db',
                      padding: '8px',
                      background: 'rgba(0,0,0,0.2)',
                      borderRadius: '6px',
                      textAlign: 'center'
                    }}>
                      🎯 Referencia: BOH{selectedPlane.bohNumber} @ {selectedPlane.bohAngle.toFixed(1)}°
                    </div>
                  </div>
                ) : (
                  <div style={{
                    fontSize: '11px',
                    color: '#fca5a5',
                    fontStyle: 'italic',
                    textAlign: 'center',
                    padding: '20px'
                  }}>
                    Selecciona un plano para ver detalles
                  </div>
                )
              )}
            </>
          )}
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

