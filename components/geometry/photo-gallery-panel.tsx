'use client'

import React, { useState, useRef, useEffect } from 'react'
import { PhotoMetadata } from '@/hooks/use-photo-registry'

interface PhotoGalleryPanelProps {
  photos: PhotoMetadata[]
  onRemovePhoto: (photoId: string) => void
  onDownloadPhoto: (photoId: string) => void
  onAddNote: (photoId: string, note: string) => void
  onClose?: () => void
  initialPosition?: { x: number; y: number }
}

export function PhotoGalleryPanel({
  photos,
  onRemovePhoto,
  onDownloadPhoto,
  onAddNote,
  onClose,
  initialPosition = { x: 400, y: 100 }
}: PhotoGalleryPanelProps) {
  const [position, setPosition] = useState(initialPosition)
  const [isDragging, setIsDragging] = useState(false)
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 })
  const [isMinimized, setIsMinimized] = useState(false)
  const [selectedPhotoId, setSelectedPhotoId] = useState<string | null>(null)
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

  const selectedPhoto = selectedPhotoId ? photos.find(p => p.id === selectedPhotoId) : null

  return (
    <div
      ref={panelRef}
      style={{
        position: 'fixed',
        left: `${position.x}px`,
        top: `${position.y}px`,
        zIndex: 3200,
        width: isMinimized ? '350px' : '450px',
        maxHeight: '80vh',
        boxShadow: '0 10px 40px rgba(0,0,0,0.4)',
        borderRadius: '12px',
        overflow: 'hidden',
        border: '3px solid #059669',
        transition: isDragging ? 'none' : 'all 0.2s ease'
      }}
    >
      {/* Header */}
      <div
        onMouseDown={handleMouseDown}
        style={{
          background: 'linear-gradient(135deg, #059669, #10B981)',
          padding: '12px 16px',
          cursor: isDragging ? 'grabbing' : 'grab',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          userSelect: 'none',
          borderBottom: '3px solid #047857'
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
          <span>📸</span>
          <span>Registro Fotográfico QA/QC</span>
          <span style={{
            fontSize: '11px',
            background: 'rgba(255,255,255,0.3)',
            padding: '2px 8px',
            borderRadius: '10px'
          }}>
            {photos.length}
          </span>
        </div>
        
        <div style={{ display: 'flex', gap: '4px' }}>
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
          background: 'linear-gradient(to bottom, #ECFDF5, #D1FAE5)',
          maxHeight: 'calc(80vh - 60px)',
          overflow: 'auto'
        }}>
          {photos.length === 0 ? (
            <div style={{
              padding: '40px 20px',
              textAlign: 'center',
              color: '#059669'
            }}>
              <div style={{ fontSize: '48px', marginBottom: '16px' }}>📸</div>
              <div style={{ fontWeight: 'bold', marginBottom: '8px' }}>
                No hay fotos capturadas
              </div>
              <div style={{ fontSize: '12px', color: '#6B7280' }}>
                Usa el botón de captura para agregar fotos
              </div>
            </div>
          ) : (
            <div style={{ padding: '12px' }}>
              {/* Photo Grid */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: selectedPhoto ? '1fr' : 'repeat(2, 1fr)',
                gap: '12px'
              }}>
                {(selectedPhoto ? [selectedPhoto] : photos).map((photo) => (
                  <div
                    key={photo.id}
                    style={{
                      background: 'white',
                      borderRadius: '8px',
                      overflow: 'hidden',
                      border: selectedPhotoId === photo.id ? '3px solid #059669' : '2px solid #D1D5DB',
                      boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                      cursor: selectedPhoto ? 'default' : 'pointer'
                    }}
                    onClick={() => !selectedPhoto && setSelectedPhotoId(photo.id)}
                  >
                    {/* Image */}
                    <div style={{ 
                      width: '100%', 
                      height: selectedPhoto ? '400px' : '150px',
                      overflow: 'hidden',
                      background: '#000'
                    }}>
                      <img 
                        src={photo.imageDataUrl} 
                        alt={`Photo ${photo.id}`}
                        style={{ 
                          width: '100%', 
                          height: '100%', 
                          objectFit: 'contain'
                        }}
                      />
                    </div>
                    
                    {/* Metadata */}
                    <div style={{ padding: '12px', fontSize: '11px' }}>
                      <div style={{ 
                        fontWeight: 'bold', 
                        color: '#059669',
                        marginBottom: '8px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between'
                      }}>
                        <span>
                          {photo.metadata?.tags?.includes('scene-composite') 
                            ? `🎬 Escena Completa (${photo.metadata.triosCount || 0} planos)` 
                            : photo.planeNumber 
                              ? `Plano #${photo.planeNumber}` 
                              : 'Foto de Escena'}
                        </span>
                        <span style={{ fontSize: '10px', color: '#6B7280' }}>
                          {new Date(photo.timestamp).toLocaleTimeString()}
                        </span>
                      </div>
                      
                      {photo.depth !== undefined && (
                        <div style={{ color: '#374151', marginBottom: '4px' }}>
                          📏 Profundidad: {photo.depth.toFixed(2)} cm
                        </div>
                      )}
                      
                      {photo.angles && (
                        <div style={{ color: '#374151', marginBottom: '4px' }}>
                          📐 α: {photo.angles.alpha.toFixed(2)}° | β: {photo.angles.beta.toFixed(2)}°
                        </div>
                      )}
                      
                      {photo.bohAngles && (
                        <div style={{ color: '#374151', marginBottom: '8px', fontSize: '10px' }}>
                          BOH1: {photo.bohAngles.line1.toFixed(1)}° | BOH2: {photo.bohAngles.line2.toFixed(1)}°
                        </div>
                      )}
                      
                      {/* Actions */}
                      <div style={{ 
                        display: 'flex', 
                        gap: '6px',
                        marginTop: '8px',
                        paddingTop: '8px',
                        borderTop: '1px solid #E5E7EB'
                      }}>
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            onDownloadPhoto(photo.id)
                          }}
                          style={{
                            flex: 1,
                            padding: '6px',
                            background: '#10B981',
                            color: 'white',
                            border: 'none',
                            borderRadius: '4px',
                            fontSize: '10px',
                            fontWeight: 'bold',
                            cursor: 'pointer'
                          }}
                          onMouseDown={(e) => e.stopPropagation()}
                        >
                          💾 Descargar
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            if (confirm('¿Eliminar esta foto?')) {
                              onRemovePhoto(photo.id)
                              if (selectedPhotoId === photo.id) {
                                setSelectedPhotoId(null)
                              }
                            }
                          }}
                          style={{
                            flex: 1,
                            padding: '6px',
                            background: '#EF4444',
                            color: 'white',
                            border: 'none',
                            borderRadius: '4px',
                            fontSize: '10px',
                            fontWeight: 'bold',
                            cursor: 'pointer'
                          }}
                          onMouseDown={(e) => e.stopPropagation()}
                        >
                          🗑️ Eliminar
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              
              {/* Back button when viewing single photo */}
              {selectedPhoto && (
                <button
                  onClick={() => setSelectedPhotoId(null)}
                  style={{
                    width: '100%',
                    marginTop: '12px',
                    padding: '10px',
                    background: '#6B7280',
                    color: 'white',
                    border: 'none',
                    borderRadius: '6px',
                    fontSize: '12px',
                    fontWeight: 'bold',
                    cursor: 'pointer'
                  }}
                  onMouseDown={(e) => e.stopPropagation()}
                >
                  ← Volver a la galería
                </button>
              )}
            </div>
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

