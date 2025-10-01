'use client'

import React, { useState, useRef, useEffect } from 'react'
import { PointTrio } from '@/hooks/geometry/use-point-trios'

interface FloatingStructureTypeInputProps {
  trio: PointTrio
  trioNumber: number
  structureTypes: Array<{ id: string; name: string; useCount: number }>
  onStructureTypeChange: (trioId: string, structureType: string) => void
  onAddStructureType: (name: string) => string | null
  onIncrementUseCount: (typeName: string) => void
  onOpenManageTypes?: () => void
  onClose?: () => void
  initialPosition?: { x: number; y: number }
}

export function FloatingStructureTypeInput({
  trio,
  trioNumber,
  structureTypes,
  onStructureTypeChange,
  onAddStructureType,
  onIncrementUseCount,
  onOpenManageTypes,
  onClose,
  initialPosition = { x: 20, y: 150 }
}: FloatingStructureTypeInputProps) {
  const [selectedType, setSelectedType] = useState('')
  const [showAddNew, setShowAddNew] = useState(false)
  const [newTypeName, setNewTypeName] = useState('')
  const [position, setPosition] = useState(initialPosition)
  const [isDragging, setIsDragging] = useState(false)
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 })
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

  const handleSave = () => {
    if (!selectedType) {
      alert('Debe seleccionar un tipo de estructura')
      return
    }

    // Increment use count for selected type
    onIncrementUseCount(selectedType)
    
    onStructureTypeChange(trio.id, selectedType)
    onClose?.()
  }

  const handleAddNewType = () => {
    const name = newTypeName.trim()
    if (!name) {
      alert('El nombre del tipo de estructura no puede estar vacío')
      return
    }

    const newTypeId = onAddStructureType(name)
    if (newTypeId) {
      setSelectedType(name)
      setShowAddNew(false)
      setNewTypeName('')
    }
  }

  const handleCancel = () => {
    onClose?.()
  }

  // Handle keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Enter' && selectedType && !showAddNew) {
        handleSave()
      }
      if (e.key === 'Escape' && !showAddNew) {
        handleCancel()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [selectedType, showAddNew])

  return (
    <div
      ref={panelRef}
      style={{
        position: 'fixed',
        left: `${position.x}px`,
        top: `${position.y}px`,
        zIndex: 4000,
        minWidth: '380px',
        backgroundColor: 'rgba(0, 0, 0, 0.95)',
        borderRadius: '12px',
        boxShadow: '0 10px 40px rgba(0,0,0,0.7), 0 0 0 2px rgba(251, 146, 60, 0.5)',
        overflow: 'hidden',
        backdropFilter: 'blur(20px)',
        transition: isDragging ? 'none' : 'all 0.2s ease'
      }}
    >
      {/* Header - Draggable */}
      <div
        onMouseDown={handleMouseDown}
        style={{
          background: `linear-gradient(135deg, ${trio.color}, ${trio.color}dd)`,
          padding: '12px 16px',
          cursor: isDragging ? 'grabbing' : 'grab',
          userSelect: 'none'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontSize: '20px' }}>🏔️</span>
          <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 'bold', color: 'white' }}>
            Tipo de Estructura - Plano #{trioNumber}
          </h3>
        </div>
      </div>

      {/* Content */}
      <div style={{ padding: '20px', color: 'white' }}>
        <div style={{
          padding: '12px',
          background: 'rgba(251, 146, 60, 0.2)',
          borderRadius: '8px',
          marginBottom: '16px',
          fontSize: '12px',
          color: '#fcd34d'
        }}>
          ⚠️ Campo Obligatorio: Selecciona el tipo de estructura geológica identificada
        </div>

        {/* Structure type options */}
        <div style={{ marginBottom: '16px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <label style={{
              fontSize: '13px',
              fontWeight: 'bold',
              color: '#93c5fd'
            }}>
              Tipo de Estructura
            </label>
            <button
              onClick={onOpenManageTypes}
              style={{
                padding: '4px 8px',
                borderRadius: '4px',
                border: 'none',
                background: 'rgba(139, 92, 246, 0.3)',
                color: '#c4b5fd',
                fontSize: '10px',
                cursor: 'pointer',
                fontWeight: 'bold'
              }}
            >
              ⚙️ Gestionar
            </button>
          </div>
          <div style={{ 
            display: 'flex', 
            flexDirection: 'column', 
            gap: '8px',
            maxHeight: '280px',
            overflowY: 'auto',
            padding: '4px'
          }}>
            {structureTypes.map((type) => (
              <label
                key={type.id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  padding: '10px 12px',
                  background: selectedType === type.name 
                    ? `${type.color}33` 
                    : 'rgba(255,255,255,0.05)',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  border: selectedType === type.name 
                    ? `2px solid ${type.color}` 
                    : '1px solid rgba(255,255,255,0.1)',
                  transition: 'all 0.2s'
                }}
              >
                <input
                  type="radio"
                  name="structureType"
                  value={type.name}
                  checked={selectedType === type.name}
                  onChange={(e) => setSelectedType(e.target.value)}
                  style={{ accentColor: type.color }}
                />
                {/* Color indicator */}
                <div style={{
                  width: '14px',
                  height: '14px',
                  backgroundColor: type.color,
                  borderRadius: '50%',
                  border: '2px solid white',
                  boxShadow: '0 0 8px rgba(0,0,0,0.5)'
                }} />
                <span style={{ fontSize: '13px', color: 'white', flex: 1 }}>{type.name}</span>
                {type.useCount > 0 && (
                  <span style={{ fontSize: '10px', color: '#9ca3af' }}>
                    ({type.useCount})
                  </span>
                )}
              </label>
            ))}
          </div>
        </div>

        {/* Add new structure type */}
        {showAddNew ? (
          <div style={{ marginBottom: '16px', padding: '12px', background: 'rgba(139, 92, 246, 0.2)', borderRadius: '8px' }}>
            <label style={{
              display: 'block',
              marginBottom: '6px',
              fontSize: '12px',
              fontWeight: 'bold',
              color: '#c4b5fd'
            }}>
              ➕ Nuevo Tipo de Estructura
            </label>
            <div style={{ display: 'flex', gap: '8px' }}>
              <input
                type="text"
                value={newTypeName}
                onChange={(e) => setNewTypeName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && newTypeName.trim()) handleAddNewType()
                  if (e.key === 'Escape') {
                    setShowAddNew(false)
                    setNewTypeName('')
                  }
                }}
                placeholder="Nombre del tipo..."
                autoFocus
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
                onClick={handleAddNewType}
                disabled={!newTypeName.trim()}
                style={{
                  padding: '8px 12px',
                  borderRadius: '6px',
                  border: 'none',
                  background: newTypeName.trim() ? '#10b981' : '#374151',
                  color: 'white',
                  fontSize: '12px',
                  fontWeight: 'bold',
                  cursor: newTypeName.trim() ? 'pointer' : 'not-allowed'
                }}
              >
                ✓
              </button>
              <button
                onClick={() => {
                  setShowAddNew(false)
                  setNewTypeName('')
                }}
                style={{
                  padding: '8px 12px',
                  borderRadius: '6px',
                  border: '1px solid rgba(255,255,255,0.2)',
                  background: 'rgba(255,255,255,0.1)',
                  color: 'white',
                  fontSize: '12px',
                  cursor: 'pointer'
                }}
              >
                ✕
              </button>
            </div>
          </div>
        ) : (
          <button
            onClick={() => setShowAddNew(true)}
            style={{
              width: '100%',
              padding: '10px',
              marginBottom: '16px',
              borderRadius: '6px',
              border: '2px dashed rgba(139, 92, 246, 0.5)',
              background: 'rgba(139, 92, 246, 0.1)',
              color: '#c4b5fd',
              fontSize: '13px',
              fontWeight: 'bold',
              cursor: 'pointer',
              transition: 'all 0.2s'
            }}
          >
            ➕ Agregar Nuevo Tipo de Estructura
          </button>
        )}

        {/* Action buttons */}
        <div style={{ display: 'flex', gap: '10px' }}>
          <button
            onClick={handleSave}
            disabled={!selectedType}
            style={{
              flex: 1,
              padding: '12px',
              borderRadius: '8px',
              border: 'none',
              background: selectedType
                ? 'linear-gradient(135deg, #10b981 0%, #059669 100%)'
                : '#374151',
              color: 'white',
              fontSize: '14px',
              fontWeight: 'bold',
              cursor: selectedType ? 'pointer' : 'not-allowed',
              transition: 'all 0.2s'
            }}
          >
            ✅ Guardar
          </button>
          <button
            onClick={handleCancel}
            style={{
              padding: '12px 20px',
              borderRadius: '8px',
              border: '1px solid rgba(255,255,255,0.2)',
              background: 'rgba(255,255,255,0.1)',
              color: 'white',
              fontSize: '14px',
              fontWeight: 'bold',
              cursor: 'pointer'
            }}
          >
            ❌
          </button>
        </div>

        {/* Keyboard hints */}
        <div style={{
          marginTop: '12px',
          fontSize: '10px',
          color: '#9ca3af',
          textAlign: 'center'
        }}>
          Enter: Guardar | Esc: Cancelar | {structureTypes.length} tipos disponibles
        </div>
      </div>
    </div>
  )
}

