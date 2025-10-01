'use client'

import { useState, useCallback, useEffect } from 'react'

export interface CustomColumn {
  id: string
  header: string
  order: number
  isTemplate?: boolean // Is this a saved template for future use?
}

export interface ColumnValue {
  trioId: string
  columnId: string
  value: string
}

export interface ColumnTemplate {
  header: string
  useCount: number // How many times this column has been used
}

const TEMPLATES_STORAGE_KEY = 'geostxr_column_templates'

export function useCustomColumns() {
  const [columns, setColumns] = useState<CustomColumn[]>([])
  const [values, setValues] = useState<ColumnValue[]>([])
  const [templates, setTemplates] = useState<ColumnTemplate[]>([])
  const MAX_COLUMNS = 100

  // Load templates from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(TEMPLATES_STORAGE_KEY)
      if (stored) {
        const parsed = JSON.parse(stored) as ColumnTemplate[]
        setTemplates(parsed.sort((a, b) => b.useCount - a.useCount)) // Most used first
        console.log('📋 Loaded column templates:', parsed.length)
      }
    } catch (error) {
      console.error('Error loading templates:', error)
    }
  }, [])

  // Save templates to localStorage
  const saveTemplates = useCallback((newTemplates: ColumnTemplate[]) => {
    try {
      localStorage.setItem(TEMPLATES_STORAGE_KEY, JSON.stringify(newTemplates))
      setTemplates(newTemplates)
    } catch (error) {
      console.error('Error saving templates:', error)
    }
  }, [])

  // Add a new custom column
  const addColumn = useCallback((header: string, saveAsTemplate: boolean = false) => {
    if (columns.length >= MAX_COLUMNS) {
      alert(`Máximo ${MAX_COLUMNS} columnas personalizadas permitidas`)
      return null
    }

    const headerTrimmed = header.trim()
    const newColumn: CustomColumn = {
      id: `col-${Date.now()}-${Math.random()}`,
      header: headerTrimmed,
      order: columns.length,
      isTemplate: saveAsTemplate
    }

    setColumns(prev => [...prev, newColumn])
    console.log('✅ Custom column added:', headerTrimmed)
    
    // Update or create template
    if (saveAsTemplate) {
      const existingTemplate = templates.find(t => t.header === headerTrimmed)
      let newTemplates: ColumnTemplate[]
      
      if (existingTemplate) {
        // Increment use count
        newTemplates = templates.map(t => 
          t.header === headerTrimmed 
            ? { ...t, useCount: t.useCount + 1 }
            : t
        )
      } else {
        // Add new template
        newTemplates = [...templates, { header: headerTrimmed, useCount: 1 }]
      }
      
      saveTemplates(newTemplates.sort((a, b) => b.useCount - a.useCount))
      console.log('💾 Template saved/updated:', headerTrimmed)
    }
    
    return newColumn.id
  }, [columns, templates, saveTemplates])

  // Remove a custom column
  const removeColumn = useCallback((columnId: string) => {
    setColumns(prev => prev.filter(c => c.id !== columnId))
    // Also remove all values for this column
    setValues(prev => prev.filter(v => v.columnId !== columnId))
    console.log('🗑️ Custom column removed:', columnId)
  }, [])

  // Update column header
  const updateColumnHeader = useCallback((columnId: string, newHeader: string) => {
    setColumns(prev => prev.map(c => 
      c.id === columnId ? { ...c, header: newHeader.trim() } : c
    ))
  }, [])

  // Set value for a specific trio and column
  const setValue = useCallback((trioId: string, columnId: string, value: string) => {
    setValues(prev => {
      const existing = prev.find(v => v.trioId === trioId && v.columnId === columnId)
      
      if (existing) {
        // Update existing value
        return prev.map(v => 
          v.trioId === trioId && v.columnId === columnId 
            ? { ...v, value: value.trim() }
            : v
        )
      } else {
        // Add new value
        return [...prev, { trioId, columnId, value: value.trim() }]
      }
    })
  }, [])

  // Set value for ALL trios for a specific column
  const setValueForAllTrios = useCallback((columnId: string, value: string, trioIds: string[]) => {
    const trimmedValue = value.trim()
    setValues(prev => {
      // Remove existing values for this column
      const filtered = prev.filter(v => v.columnId !== columnId)
      
      // Add new values for all trios
      const newValues = trioIds.map(trioId => ({
        trioId,
        columnId,
        value: trimmedValue
      }))
      
      return [...filtered, ...newValues]
    })
    console.log(`✅ Value "${trimmedValue}" applied to all ${trioIds.length} trios for column ${columnId}`)
  }, [])

  // Load columns from templates
  const loadFromTemplates = useCallback((templateHeaders: string[]) => {
    const newColumns = templateHeaders.map((header, index) => ({
      id: `col-${Date.now()}-${index}-${Math.random()}`,
      header,
      order: columns.length + index,
      isTemplate: true
    }))
    
    setColumns(prev => [...prev, ...newColumns])
    console.log(`✅ Loaded ${newColumns.length} columns from templates`)
  }, [columns.length])

  // Get value for a specific trio and column
  const getValue = useCallback((trioId: string, columnId: string): string => {
    const found = values.find(v => v.trioId === trioId && v.columnId === columnId)
    return found?.value || ''
  }, [values])

  // Get all values for a specific trio
  const getTrioValues = useCallback((trioId: string): Record<string, string> => {
    const result: Record<string, string> = {}
    columns.forEach(col => {
      result[col.id] = getValue(trioId, col.id)
    })
    return result
  }, [columns, getValue])

  // Clear all custom columns and values
  const clearAll = useCallback(() => {
    setColumns([])
    setValues([])
    console.log('🧹 All custom columns cleared')
  }, [])

  return {
    columns,
    values,
    templates,
    canAddMore: columns.length < MAX_COLUMNS,
    MAX_COLUMNS,
    addColumn,
    removeColumn,
    updateColumnHeader,
    setValue,
    setValueForAllTrios,
    getValue,
    getTrioValues,
    loadFromTemplates,
    clearAll
  }
}

