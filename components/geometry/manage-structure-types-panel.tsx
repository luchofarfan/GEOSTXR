'use client'

import React, { useState, useRef, useEffect } from 'react'

interface ManageStructureTypesPanelProps {
  structureTypes: Array<{ id: string; name: string; color: string; useCount: number }>
  onAddType: (name: string) => string | null
  onRemoveType: (typeId: string) => void
  onUpdateName: (typeId: string, newName: string) => void
  onUpdateColor: (typeId: string, newColor: string) => void
  onResetToDefaults: () => void
  onClose: () => void
  initialPosition?: { x: number; y: number }
}

export function ManageStructureTypesPanel({
  structureTypes,
  onAddType,
  onRemoveType,
  onUpdateName,
  onUpdateColor,
  onResetToDefaults,
  onClose,
  initialPosition = { x: 150, y: 150 }
}: ManageStructureTypesPanelProps) {
  const [position, setPosition] = useState(initialPosition)
  const [isDragging, setIsDragging] = useState(false)
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 })
  const [editingId, setEditingId] = useState<string | null>(null)
  const [newTypeName, setNewTypeName] = useState('')
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

  const handleAdd = () => {
    if (newTypeName.trim()) {
      onAddType(newTypeName.trim())
      setNewTypeName('')
    }
  }

  const handleReset = () => {
    if (confirm('¿Restaurar los tipos de estructura a los valores por defecto? Esto eliminará todos los tipos personalizados.')) {
      onResetToDefaults()
    }
  }

  return (
    <div
      ref={panelRef}
      style={{
        position: 'fixed',
        left: `${position.x}px`,
        top: `${position.y}px`,
        zIndex: 4500,
        width: '450px',
        backgroundColor: 'rgba(0, 0, 0, 0.95)',
        borderRadius: '12px',
        boxShadow: '0 10px 40px rgba(0,0,0,0.7), 0 0 0 2px rgba(139, 92, 246, 0.5)',
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
          justifyContent: 'space-between',
          alignItems: 'center',
          userSelect: 'none'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontSize: '20px' }}>🏔️</span>
          <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 'bold', color: 'white' }}>
            Gestionar Tipos de Estructura
          </h3>
        </div>
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

      {/* Content */}
      <div style={{ padding: '16px', color: 'white', maxHeight: '70vh', overflowY: 'auto' }}>
        {/* Add new type */}
        <div style={{ marginBottom: '20px' }}>
          <label style={{
            display: 'block',
            marginBottom: '8px',
            fontSize: '12px',
            fontWeight: 'bold',
            color: '#93c5fd'
          }}>
            ➕ Agregar Nuevo Tipo
          </label>
          <div style={{ display: 'flex', gap: '8px' }}>
            <input
              type="text"
              value={newTypeName}
              onChange={(e) => setNewTypeName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && newTypeName.trim()) handleAdd()
              }}
              placeholder="Nombre del tipo de estructura..."
              style={{
                flex: 1,
                padding: '10px 12px',
                borderRadius: '6px',
                border: '1px solid rgba(255,255,255,0.2)',
                background: 'rgba(255,255,255,0.1)',
                color: 'white',
                fontSize: '13px'
              }}
            />
            <button
              onClick={handleAdd}
              disabled={!newTypeName.trim()}
              style={{
                padding: '10px 20px',
                borderRadius: '6px',
                border: 'none',
                background: newTypeName.trim()
                  ? 'linear-gradient(135deg, #10b981 0%, #059669 100%)'
                  : '#374151',
                color: 'white',
                fontSize: '13px',
                fontWeight: 'bold',
                cursor: newTypeName.trim() ? 'pointer' : 'not-allowed'
              }}
            >
              Agregar
            </button>
          </div>
        </div>

        {/* Structure types list */}
        <div style={{ marginBottom: '16px' }}>
          <h4 style={{
            fontSize: '12px',
            fontWeight: 'bold',
            color: '#93c5fd',
            marginBottom: '8px'
          }}>
            Tipos Configurados ({structureTypes.length})
          </h4>
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '6px'
          }}>
            {structureTypes.map((type) => (
              <div
                key={type.id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '10px 12px',
                  background: 'rgba(255,255,255,0.05)',
                  borderRadius: '6px',
                  border: '1px solid rgba(255,255,255,0.1)'
                }}
              >
                {editingId === type.id ? (
                  <>
                    <input
                      type="text"
                      defaultValue={type.name}
                      onBlur={(e) => {
                        if (e.target.value.trim()) {
                          onUpdateName(type.id, e.target.value.trim())
                        }
                        setEditingId(null)
                      }}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && e.currentTarget.value.trim()) {
                          onUpdateName(type.id, e.currentTarget.value.trim())
                          setEditingId(null)
                        }
                        if (e.key === 'Escape') {
                          setEditingId(null)
                        }
                      }}
                      autoFocus
                      style={{
                        flex: 1,
                        padding: '6px 10px',
                        borderRadius: '4px',
                        border: '1px solid #8b5cf6',
                        background: 'rgba(139, 92, 246, 0.1)',
                        color: 'white',
                        fontSize: '13px'
                      }}
                    />
                  </>
                ) : (
                  <>
                    {/* Color picker */}
                    <input
                      type="color"
                      value={type.color}
                      onChange={(e) => onUpdateColor(type.id, e.target.value)}
                      onClick={(e) => e.stopPropagation()}
                      style={{
                        width: '32px',
                        height: '32px',
                        border: '2px solid white',
                        borderRadius: '6px',
                        cursor: 'pointer',
                        flexShrink: 0,
                        boxShadow: '0 0 8px rgba(0,0,0,0.5)'
                      }}
                      title="Click para cambiar el color"
                    />
                    <span
                      onClick={() => setEditingId(type.id)}
                      style={{
                        flex: 1,
                        fontSize: '13px',
                        color: 'white',
                        cursor: 'pointer'
                      }}
                    >
                      {type.name}
                    </span>
                    {type.useCount > 0 && (
                      <span style={{
                        fontSize: '11px',
                        color: '#9ca3af',
                        background: 'rgba(255,255,255,0.1)',
                        padding: '2px 6px',
                        borderRadius: '10px'
                      }}>
                        {type.useCount} usos
                      </span>
                    )}
                    <button
                      onClick={() => {
                        if (confirm(`¿Eliminar tipo "${type.name}"?`)) {
                          onRemoveType(type.id)
                        }
                      }}
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
                  </>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Actions */}
        <div style={{ display: 'flex', gap: '8px' }}>
          <button
            onClick={handleReset}
            style={{
              flex: 1,
              padding: '10px',
              borderRadius: '6px',
              border: '1px solid rgba(255,255,255,0.2)',
              background: 'rgba(239, 68, 68, 0.2)',
              color: '#f87171',
              fontSize: '12px',
              fontWeight: 'bold',
              cursor: 'pointer'
            }}
          >
            🔄 Restaurar Predeterminados
          </button>
        </div>

        {/* Info */}
        <div style={{
          marginTop: '12px',
          padding: '10px',
          background: 'rgba(139, 92, 246, 0.15)',
          borderRadius: '6px',
          fontSize: '11px',
          color: '#d1d5db'
        }}>
          💡 <strong>Los tipos más usados aparecen primero.</strong><br/>
          🎨 Click en el cuadro de color para cambiarlo.<br/>
          ✏️ Click en el nombre para editarlo.<br/>
          ⚠️ Cambiar el color afectará a TODOS los planos de ese tipo.
        </div>
      </div>
    </div>
  )
}

