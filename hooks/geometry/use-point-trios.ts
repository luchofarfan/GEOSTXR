'use client'

import { useState, useCallback } from 'react'

export interface Point3D {
  x: number
  y: number
  z: number
  id: string
}

export interface PointTrio {
  id: string
  points: Point3D[]
  depth?: number // Manual depth for first trio, calculated for others
  color: string
  createdAt: Date
}

const TRIO_COLORS = [
  '#3B82F6', // Blue (Trio 1)
  '#10B981', // Green (Trio 2)
  '#F59E0B', // Yellow (Trio 3)
  '#EF4444', // Red (Trio 4)
  '#8B5CF6', // Purple (Trio 5)
  '#EC4899', // Pink (Trio 6)
]

const MAX_TRIOS = 100
const POINTS_PER_TRIO = 3

export function usePointTrios() {
  const [trios, setTrios] = useState<PointTrio[]>([])
  const [currentTrio, setCurrentTrio] = useState<PointTrio | null>(null)
  const [selectedTrioId, setSelectedTrioId] = useState<string | null>(null)

  // Get color for trio based on index
  const getTrioColor = useCallback((index: number): string => {
    return TRIO_COLORS[index % TRIO_COLORS.length]
  }, [])

  // Add a point to current trio
  const addPoint = useCallback((point: Omit<Point3D, 'id'>) => {
    const pointWithId: Point3D = {
      ...point,
      id: `point-${Date.now()}-${Math.random()}`
    }

    setCurrentTrio(prev => {
      // If no current trio, create new one
      if (!prev) {
        const trioIndex = trios.length
        const newTrio: PointTrio = {
          id: `trio-${Date.now()}`,
          points: [pointWithId],
          color: getTrioColor(trioIndex),
          createdAt: new Date()
        }
        console.log(`Point added (1/3): (${point.x.toFixed(2)}, ${point.y.toFixed(2)}, ${point.z.toFixed(2)})`)
        return newTrio
      }

      // If trio is complete, don't add
      if (prev.points.length >= POINTS_PER_TRIO) {
        console.log('Trio already complete, ignoring click')
        return prev
      }

      // Add point to current trio
      const updatedTrio = {
        ...prev,
        points: [...prev.points, pointWithId]
      }

      console.log(`Point added (${updatedTrio.points.length}/3): (${point.x.toFixed(2)}, ${point.y.toFixed(2)}, ${point.z.toFixed(2)})`)

      // Auto-complete if we now have 3 points
      if (updatedTrio.points.length === POINTS_PER_TRIO) {
        console.log(`Trio ${trios.length + 1} auto-completed with 3 points`)
        
        // Use setTimeout to ensure state update completes first
        setTimeout(() => {
          setTrios(prevTrios => [...prevTrios, updatedTrio])
          setCurrentTrio(null)
        }, 0)
      }

      return updatedTrio
    })
  }, [trios.length, getTrioColor])

  // Complete current trio and start a new one
  const completeTrio = useCallback(() => {
    if (!currentTrio || currentTrio.points.length !== POINTS_PER_TRIO) {
      console.warn('Cannot complete trio: needs exactly 3 points')
      return
    }

    if (trios.length >= MAX_TRIOS) {
      console.warn(`Maximum number of trios (${MAX_TRIOS}) reached`)
      return
    }

    setTrios(prev => [...prev, currentTrio])
    setCurrentTrio(null)
    console.log(`Trio ${trios.length + 1} completed with 3 points`)
  }, [currentTrio, trios.length])

  // Set depth for a specific trio (usually the first one)
  const setTrioDepth = useCallback((trioId: string, depth: number) => {
    setTrios(prev => prev.map(trio => 
      trio.id === trioId ? { ...trio, depth } : trio
    ))
    console.log(`Depth set for trio ${trioId}: ${depth}cm`)
  }, [])

  // Remove a specific trio
  const removeTrio = useCallback((trioId: string) => {
    setTrios(prev => prev.filter(trio => trio.id !== trioId))
    if (selectedTrioId === trioId) {
      setSelectedTrioId(null)
    }
    console.log(`Trio ${trioId} removed`)
  }, [selectedTrioId])

  // Clear all trios
  const clearAllTrios = useCallback(() => {
    setTrios([])
    setCurrentTrio(null)
    setSelectedTrioId(null)
    console.log('All trios cleared')
  }, [])

  // Cancel current incomplete trio
  const cancelCurrentTrio = useCallback(() => {
    setCurrentTrio(null)
    console.log('Current trio cancelled')
  }, [])

  // Select a trio for editing/viewing
  const selectTrio = useCallback((trioId: string | null) => {
    setSelectedTrioId(trioId)
  }, [])

  return {
    // State
    trios,
    currentTrio,
    selectedTrioId,
    
    // Computed
    triosCount: trios.length,
    currentTrioPointsCount: currentTrio?.points.length || 0,
    canAddMoreTrios: trios.length < MAX_TRIOS,
    isCurrentTrioComplete: currentTrio?.points.length === POINTS_PER_TRIO,
    
    // Actions
    addPoint,
    completeTrio,
    setTrioDepth,
    removeTrio,
    clearAllTrios,
    cancelCurrentTrio,
    selectTrio,
    
    // Utils
    getTrioColor,
    MAX_TRIOS,
    POINTS_PER_TRIO
  }
}

