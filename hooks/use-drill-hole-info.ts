'use client'

import { useState, useEffect, useCallback } from 'react'

/**
 * Drill hole information - collar location and orientation
 */
export interface DrillHoleInfo {
  holeName: string // Nombre del sondaje (ej: "DDH-001")
  azimuth: number // Azimut del sondaje (0-360°, desde Norte)
  dip: number // Inclinación del sondaje (-90 a 90°, negativo = hacia abajo)
  utmEast: number // Coordenada Este (UTM)
  utmNorth: number // Coordenada Norte (UTM)
  elevation: number // Cota/Elevación (m.s.n.m.)
}

const STORAGE_KEY = 'geostxr_drillhole_info'
const TEMPLATES_KEY = 'geostxr_drillhole_templates'

const DEFAULT_INFO: DrillHoleInfo = {
  holeName: '',
  azimuth: 0,
  dip: -90, // Vertical hacia abajo (convención minera)
  utmEast: 0,
  utmNorth: 0,
  elevation: 0
}

export function useDrillHoleInfo() {
  const [info, setInfo] = useState<DrillHoleInfo>(DEFAULT_INFO)
  const [templates, setTemplates] = useState<DrillHoleInfo[]>([])

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY)
      if (saved) {
        const parsed = JSON.parse(saved)
        setInfo(parsed)
      }

      const savedTemplates = localStorage.getItem(TEMPLATES_KEY)
      if (savedTemplates) {
        const parsedTemplates = JSON.parse(savedTemplates)
        setTemplates(parsedTemplates)
      }
    } catch (error) {
      console.error('Error loading drill hole info:', error)
    }
  }, [])

  // Save to localStorage when changed
  const updateInfo = useCallback((newInfo: Partial<DrillHoleInfo>) => {
    setInfo(prev => {
      const updated = { ...prev, ...newInfo }
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated))
      return updated
    })
  }, [])

  // Reset to defaults
  const resetInfo = useCallback(() => {
    setInfo(DEFAULT_INFO)
    localStorage.removeItem(STORAGE_KEY)
  }, [])

  // Save current info as template
  const saveAsTemplate = useCallback(() => {
    if (!info.holeName) {
      alert('Debes ingresar un nombre de sondaje para guardar como plantilla')
      return
    }

    setTemplates(prev => {
      // Check if template with same name exists
      const existingIndex = prev.findIndex(t => t.holeName === info.holeName)
      let updated: DrillHoleInfo[]

      if (existingIndex >= 0) {
        // Update existing
        updated = [...prev]
        updated[existingIndex] = { ...info }
      } else {
        // Add new
        updated = [...prev, { ...info }]
      }

      localStorage.setItem(TEMPLATES_KEY, JSON.stringify(updated))
      return updated
    })
  }, [info])

  // Load from template
  const loadTemplate = useCallback((holeName: string) => {
    const template = templates.find(t => t.holeName === holeName)
    if (template) {
      updateInfo(template)
    }
  }, [templates, updateInfo])

  // Delete template
  const deleteTemplate = useCallback((holeName: string) => {
    setTemplates(prev => {
      const updated = prev.filter(t => t.holeName !== holeName)
      localStorage.setItem(TEMPLATES_KEY, JSON.stringify(updated))
      return updated
    })
  }, [])

  // Validation
  const isValid = useCallback(() => {
    return (
      info.holeName.trim().length > 0 &&
      info.azimuth >= 0 && info.azimuth <= 360 &&
      info.dip >= -90 && info.dip <= 90
    )
  }, [info])

  return {
    info,
    updateInfo,
    resetInfo,
    templates,
    saveAsTemplate,
    loadTemplate,
    deleteTemplate,
    isValid
  }
}

