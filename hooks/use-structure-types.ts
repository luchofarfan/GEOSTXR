'use client'

import { useState, useCallback, useEffect } from 'react'

export interface StructureType {
  id: string
  name: string
  color: string
  useCount: number
}

const STRUCTURE_TYPES_STORAGE_KEY = 'geostxr_structure_types'

// Predefined colors for structure types
const STRUCTURE_COLORS = [
  '#3B82F6', // Blue
  '#10B981', // Green
  '#F59E0B', // Amber
  '#EF4444', // Red
  '#8B5CF6', // Purple
  '#EC4899', // Pink
  '#06B6D4', // Cyan
  '#F97316', // Orange
  '#14B8A6', // Teal
  '#6366F1', // Indigo
  '#84CC16', // Lime
  '#F43F5E', // Rose
]

// Default structure types (can be removed by user)
const DEFAULT_STRUCTURE_TYPES: Omit<StructureType, 'id'>[] = [
  { name: 'Plano de Estratificación', color: '#3B82F6', useCount: 0 },
  { name: 'Fractura', color: '#EF4444', useCount: 0 },
  { name: 'Falla', color: '#F59E0B', useCount: 0 },
  { name: 'Diaclasa', color: '#10B981', useCount: 0 },
  { name: 'Foliación', color: '#8B5CF6', useCount: 0 },
  { name: 'Contacto Geológico', color: '#EC4899', useCount: 0 },
  { name: 'Veta', color: '#F97316', useCount: 0 }
]

export function useStructureTypes() {
  const [structureTypes, setStructureTypes] = useState<StructureType[]>([])

  // Load structure types from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STRUCTURE_TYPES_STORAGE_KEY)
      if (stored) {
        const parsed = JSON.parse(stored) as StructureType[]
        
        // MIGRATION: Add colors to types that don't have them
        const migrated = parsed.map((type, index) => {
          if (!type.color) {
            const colorIndex = index % STRUCTURE_COLORS.length
            return { ...type, color: STRUCTURE_COLORS[colorIndex] }
          }
          return type
        })
        
        // Save migrated data
        localStorage.setItem(STRUCTURE_TYPES_STORAGE_KEY, JSON.stringify(migrated))
        
        const sorted = migrated.sort((a, b) => b.useCount - a.useCount)
        setStructureTypes(sorted)
        console.log('🏔️ Loaded and migrated structure types:', sorted.length)
        sorted.forEach(t => console.log(`   ✓ ${t.name}: ${t.color} (used ${t.useCount} times)`))
      } else {
        // Initialize with defaults
        const defaultTypes = DEFAULT_STRUCTURE_TYPES.map((type, index) => ({
          ...type,
          id: `struct-type-${Date.now()}-${index}`
        }))
        setStructureTypes(defaultTypes)
        localStorage.setItem(STRUCTURE_TYPES_STORAGE_KEY, JSON.stringify(defaultTypes))
        console.log('🏔️ Initialized with default structure types:')
        defaultTypes.forEach(t => console.log(`   ${t.name}: ${t.color}`))
      }
    } catch (error) {
      console.error('Error loading structure types:', error)
      // Fallback to defaults
      const defaultTypes = DEFAULT_STRUCTURE_TYPES.map((type, index) => ({
        ...type,
        id: `struct-type-${Date.now()}-${index}`
      }))
      setStructureTypes(defaultTypes)
      localStorage.setItem(STRUCTURE_TYPES_STORAGE_KEY, JSON.stringify(defaultTypes))
    }
  }, [])

  // Save structure types to localStorage
  const saveToStorage = useCallback((types: StructureType[]) => {
    try {
      localStorage.setItem(STRUCTURE_TYPES_STORAGE_KEY, JSON.stringify(types))
      setStructureTypes(types)
    } catch (error) {
      console.error('Error saving structure types:', error)
    }
  }, [])

  // Add a new structure type
  const addStructureType = useCallback((name: string) => {
    const nameTrimmed = name.trim()
    if (!nameTrimmed) return null

    // Check if already exists
    const existing = structureTypes.find(t => t.name.toLowerCase() === nameTrimmed.toLowerCase())
    if (existing) {
      alert(`El tipo de estructura "${nameTrimmed}" ya existe`)
      return null
    }

    // Assign color (cycle through predefined colors)
    const colorIndex = structureTypes.length % STRUCTURE_COLORS.length
    const color = STRUCTURE_COLORS[colorIndex]

    const newType: StructureType = {
      id: `struct-type-${Date.now()}-${Math.random()}`,
      name: nameTrimmed,
      color,
      useCount: 0
    }

    const updated = [...structureTypes, newType].sort((a, b) => b.useCount - a.useCount)
    saveToStorage(updated)
    console.log('✅ Structure type added:', nameTrimmed, 'with color:', color)
    return newType.id
  }, [structureTypes, saveToStorage])

  // Remove a structure type
  const removeStructureType = useCallback((typeId: string) => {
    const updated = structureTypes.filter(t => t.id !== typeId)
    saveToStorage(updated)
    console.log('🗑️ Structure type removed:', typeId)
  }, [structureTypes, saveToStorage])

  // Update structure type name
  const updateStructureTypeName = useCallback((typeId: string, newName: string) => {
    const updated = structureTypes.map(t => 
      t.id === typeId ? { ...t, name: newName.trim() } : t
    )
    saveToStorage(updated)
  }, [structureTypes, saveToStorage])

  // Update structure type color
  const updateStructureTypeColor = useCallback((typeId: string, newColor: string) => {
    const type = structureTypes.find(t => t.id === typeId)
    if (!type) return
    
    const updated = structureTypes.map(t => 
      t.id === typeId ? { ...t, color: newColor } : t
    )
    saveToStorage(updated)
    console.log(`🎨 Color updated for type "${type.name}": ${newColor}`)
    
    // Dispatch event to update all trios of this type
    const event = new CustomEvent('structureTypeColorChanged', {
      detail: { typeName: type.name, newColor }
    })
    window.dispatchEvent(event)
  }, [structureTypes, saveToStorage])

  // Increment use count when a type is selected
  const incrementUseCount = useCallback((typeName: string) => {
    const updated = structureTypes.map(t => 
      t.name === typeName ? { ...t, useCount: t.useCount + 1 } : t
    ).sort((a, b) => b.useCount - a.useCount) // Re-sort by usage
    
    saveToStorage(updated)
    console.log(`📊 Use count incremented for "${typeName}": ${updated.find(t => t.name === typeName)?.useCount}`)
  }, [structureTypes, saveToStorage])

  // Reset all to defaults
  const resetToDefaults = useCallback(() => {
    const defaultTypes = DEFAULT_STRUCTURE_TYPES.map((type, index) => ({
      ...type,
      id: `struct-type-${Date.now()}-${index}`
    }))
    saveToStorage(defaultTypes)
    console.log('🔄 Structure types reset to defaults')
  }, [saveToStorage])

  return {
    structureTypes,
    addStructureType,
    removeStructureType,
    updateStructureTypeName,
    updateStructureTypeColor,
    incrementUseCount,
    resetToDefaults
  }
}

