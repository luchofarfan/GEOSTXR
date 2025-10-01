'use client'

import React, { useState, useRef, useEffect } from 'react'

interface FloatingCustomColumnsPanelProps {
  columns: Array<{ id: string; header: string; order: number }>
  templates: Array<{ header: string; useCount: number }>
  canAddMore: boolean
  maxColumns: number
  onAddColumn: (header: string, saveAsTemplate: boolean) => string | null
  onRemoveColumn: (columnId: string) => void
  onUpdateHeader: (columnId: string, newHeader: string) => void
  onSetValueForAllTrios: (columnId: string, value: string, trioIds: string[]) => void
  onLoadFromTemplates: (templateHeaders: string[]) => void
  trioIds: string[]
  onClose: () => void
  initialPosition?: { x: number; y: number }
}

export function FloatingCustomColumnsPanel({
  columns,
  templates,
  canAddMore,
  maxColumns,
  onAddColumn,
  onRemoveColumn,
  onUpdateHeader,
  onSetValueForAllTrios,
  onLoadFromTemplates,
  trioIds,
  onClose,
  initialPosition = { x: 100, y: 100 }
}: FloatingCustomColumnsPanelProps) {
  const [position, setPosition] = useState(initialPosition)
  const [isDragging, setIsDragging] = useState(false)
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 })
  const [isMinimized, setIsMinimized] = useState(false)
  const [newHeader, setNewHeader] = useState('')
  const [editingId, setEditingId] = useState<string | null>(null)
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

  const handleAddColumn = () => {
    if (!newHeader.trim()) {
      alert('El nombre de la columna no puede estar vacío')
      return
    }

    const header = newHeader.trim()
    
    // Ask if user wants to save as template and apply to all planes
    const saveAsTemplate = confirm(
      `¿Guardar "${header}" como columna frecuente para futuras escenas?\n\n` +
      `✅ Sí: Se guardará y aparecerá en sugerencias\n` +
      `❌ No: Solo para esta escena`
    )
    
    const columnId = onAddColumn(header, saveAsTemplate)
    
    if (columnId && trioIds.length > 1) {
      const applyToAll = confirm(
        `Hay ${trioIds.length} planos en esta escena.\n\n` +
        `¿Deseas aplicar un valor común a todos los planos para "${header}"?\n\n` +
        `✅ Sí: Ingresa el valor ahora\n` +
        `❌ No: Ingresar valores individualmente`
      )
      
      if (applyToAll) {
        const commonValue = prompt(`Ingresa el valor común para "${header}":`)
        if (commonValue !== null && commonValue.trim()) {
          onSetValueForAllTrios(columnId, commonValue.trim(), trioIds)
        }
      }
    }
    
    setNewHeader('')
  }

  return (
    <div
      ref={panelRef}
      style={{
        position: 'fixed',
        left: `${position.x}px`,
        top: `${position.y}px`,
        zIndex: 3500,
        minWidth: '400px',
        maxWidth: '500px',
        backgroundColor: 'rgba(0, 0, 0, 0.92)',
        borderRadius: '12px',
        boxShadow: '0 10px 40px rgba(0,0,0,0.5), 0 0 0 1px rgba(255,255,255,0.2)',
        overflow: 'hidden',
        backdropFilter: 'blur(20px)',
        transition: isDragging ? 'none' : 'all 0.2s ease'
      }}
    >
      {/* Header */}
      <div
        onMouseDown={handleMouseDown}
        style={{
          background: 'linear-gradient(135deg, #8b5cf6 0%, #6d28d9 100%)',
          padding: '12px 16px',
          cursor: isDragging ? 'grabbing' : 'grab',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          userSelect: 'none'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontSize: '20px' }}>📋</span>
          <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 'bold', color: 'white' }}>
            Columnas Personalizadas
          </h3>
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
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
              fontSize: '16px',
              width: '32px',
              height: '32px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            {isMinimized ? '▼' : '▲'}
          </button>
          <button
            onClick={onClose}
            style={{
              background: 'rgba(255,255,255,0.2)',
              border: 'none',
              borderRadius: '6px',
              color: 'white',
              fontSize: '16px',
              width: '32px',
              height: '32px',
              cursor: 'pointer'
            }}
          >
            ✕
          </button>
        </div>
      </div>

      {/* Content */}
      {!isMinimized && (
        <div style={{ padding: '16px', color: 'white' }}>
          {/* Info */}
          <div style={{
            padding: '12px',
            background: 'rgba(139, 92, 246, 0.2)',
            borderRadius: '8px',
            marginBottom: '16px',
            fontSize: '12px',
            color: '#d1d5db'
          }}>
            💡 Agrega columnas personalizadas al reporte CSV. Máximo {maxColumns} columnas.
            Las columnas frecuentes se guardan para reutilizar en futuras escenas.
          </div>

          {/* Templates Section */}
          {templates.length > 0 && (
            <div style={{ marginBottom: '16px' }}>
              <label style={{
                display: 'block',
                marginBottom: '8px',
                fontSize: '12px',
                fontWeight: 'bold',
                color: '#93c5fd'
              }}>
                🔖 Columnas Frecuentes
              </label>
              <div style={{ 
                display: 'flex', 
                flexWrap: 'wrap', 
                gap: '6px',
                maxHeight: '120px',
                overflowY: 'auto',
                padding: '8px',
                background: 'rgba(255,255,255,0.03)',
                borderRadius: '6px'
              }}>
                {templates.slice(0, 10).map((template) => (
                  <button
                    key={template.header}
                    onClick={() => {
                      const columnId = onAddColumn(template.header, false)
                      if (columnId && trioIds.length > 1) {
                        const applyToAll = confirm(
                          `¿Aplicar un valor común a todos los ${trioIds.length} planos para "${template.header}"?`
                        )
                        if (applyToAll) {
                          const value = prompt(`Valor común para "${template.header}":`)
                          if (value !== null && value.trim()) {
                            onSetValueForAllTrios(columnId, value.trim(), trioIds)
                          }
                        }
                      }
                    }}
                    style={{
                      padding: '6px 10px',
                      borderRadius: '6px',
                      border: 'none',
                      background: 'rgba(147, 197, 253, 0.2)',
                      color: '#93c5fd',
                      fontSize: '11px',
                      cursor: 'pointer',
                      fontWeight: '600',
                      whiteSpace: 'nowrap'
                    }}
                  >
                    {template.header} {template.useCount > 1 && `(${template.useCount})`}
                  </button>
                ))}
              </div>
              <div style={{ fontSize: '10px', color: '#9ca3af', marginTop: '4px' }}>
                Haz clic en una columna frecuente para agregarla rápidamente
              </div>
            </div>
          )}

          {/* Add new column */}
          <div style={{ marginBottom: '16px' }}>
            <label style={{
              display: 'block',
              marginBottom: '6px',
              fontSize: '12px',
              fontWeight: 'bold',
              color: '#93c5fd'
            }}>
              Nueva Columna
            </label>
            <div style={{ display: 'flex', gap: '8px' }}>
              <input
                type="text"
                value={newHeader}
                onChange={(e) => setNewHeader(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleAddColumn()
                }}
                placeholder="Nombre de la columna..."
                disabled={!canAddMore}
                style={{
                  flex: 1,
                  padding: '8px 12px',
                  borderRadius: '6px',
                  border: '1px solid rgba(255,255,255,0.2)',
                  background: 'rgba(255,255,255,0.1)',
                  color: 'white',
                  fontSize: '13px'
                }}
              />
              <button
                onClick={handleAddColumn}
                disabled={!canAddMore || !newHeader.trim()}
                style={{
                  padding: '8px 16px',
                  borderRadius: '6px',
                  border: 'none',
                  background: canAddMore && newHeader.trim() 
                    ? 'linear-gradient(135deg, #10b981 0%, #059669 100%)'
                    : '#374151',
                  color: 'white',
                  fontSize: '13px',
                  fontWeight: 'bold',
                  cursor: canAddMore && newHeader.trim() ? 'pointer' : 'not-allowed'
                }}
              >
                ➕ Agregar
              </button>
            </div>
            <div style={{ fontSize: '10px', color: '#9ca3af', marginTop: '4px' }}>
              {columns.length} / {maxColumns} columnas
            </div>
          </div>

          {/* Columns list */}
          {columns.length > 0 && (
            <div>
              <h4 style={{
                fontSize: '12px',
                fontWeight: 'bold',
                color: '#93c5fd',
                marginBottom: '8px'
              }}>
                Columnas Configuradas ({columns.length})
              </h4>
              <div style={{
                maxHeight: '300px',
                overflowY: 'auto',
                display: 'flex',
                flexDirection: 'column',
                gap: '6px'
              }}>
                {columns.map((col, index) => (
                  <div
                    key={col.id}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      padding: '8px 12px',
                      background: 'rgba(255,255,255,0.05)',
                      borderRadius: '6px',
                      border: '1px solid rgba(255,255,255,0.1)'
                    }}
                  >
                    <span style={{
                      fontSize: '11px',
                      color: '#9ca3af',
                      minWidth: '30px'
                    }}>
                      #{index + 1}
                    </span>
                    {editingId === col.id ? (
                      <input
                        type="text"
                        defaultValue={col.header}
                        onBlur={(e) => {
                          if (e.target.value.trim()) {
                            onUpdateHeader(col.id, e.target.value.trim())
                          }
                          setEditingId(null)
                        }}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            if (e.currentTarget.value.trim()) {
                              onUpdateHeader(col.id, e.currentTarget.value.trim())
                            }
                            setEditingId(null)
                          }
                          if (e.key === 'Escape') {
                            setEditingId(null)
                          }
                        }}
                        autoFocus
                        style={{
                          flex: 1,
                          padding: '4px 8px',
                          borderRadius: '4px',
                          border: '1px solid #3b82f6',
                          background: 'rgba(59, 130, 246, 0.1)',
                          color: 'white',
                          fontSize: '13px'
                        }}
                      />
                    ) : (
                      <span
                        onClick={() => setEditingId(col.id)}
                        style={{
                          flex: 1,
                          fontSize: '13px',
                          color: 'white',
                          cursor: 'pointer'
                        }}
                      >
                        {col.header}
                      </span>
                    )}
                    <button
                      onClick={() => onRemoveColumn(col.id)}
                      style={{
                        background: 'rgba(239, 68, 68, 0.2)',
                        border: 'none',
                        borderRadius: '4px',
                        color: '#f87171',
                        fontSize: '12px',
                        padding: '4px 8px',
                        cursor: 'pointer',
                        fontWeight: 'bold'
                      }}
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Empty state */}
          {columns.length === 0 && (
            <div style={{
              padding: '20px',
              textAlign: 'center',
              color: '#6b7280',
              fontSize: '12px',
              fontStyle: 'italic'
            }}>
              No hay columnas personalizadas configuradas
            </div>
          )}
        </div>
      )}
    </div>
  )
}

