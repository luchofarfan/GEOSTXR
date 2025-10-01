'use client'

import { useState, useCallback } from 'react'
import { calculatePlaneFromPoints, calculatePlaneDepth } from './use-planes'

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
  isValidation?: boolean // Flag to mark validation trios (excluded from reports)
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
  const [validationTriosVisible, setValidationTriosVisible] = useState(true)

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
        const trioIndex = trios.length
        console.log(`Trio ${trioIndex + 1} auto-completed with 3 points`)
        
        // Calculate depth automatically for trios 2+ (first trio requires manual input)
        let autoDepth: number | undefined
        
        if (trioIndex > 0) {
          // Calculate plane equation from the 3 points
          const planeEquation = calculatePlaneFromPoints(
            updatedTrio.points[0],
            updatedTrio.points[1],
            updatedTrio.points[2]
          )
          
          // Calculate depth as Z-axis intersection
          const calculatedDepth = calculatePlaneDepth(planeEquation)
          
          if (calculatedDepth !== null) {
            autoDepth = calculatedDepth
            console.log(`Auto-calculated depth for trio ${trioIndex + 1}: ${calculatedDepth.toFixed(2)}cm`)
          } else {
            console.warn(`Could not auto-calculate depth for trio ${trioIndex + 1}`)
          }
        }
        
        // Use setTimeout to ensure state update completes first
        setTimeout(() => {
          const completedTrio = autoDepth !== undefined 
            ? { ...updatedTrio, depth: autoDepth }
            : updatedTrio
            
          setTrios(prevTrios => [...prevTrios, completedTrio])
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

  // Remove last point from current trio (undo)
  const removeLastPoint = useCallback(() => {
    if (!currentTrio || currentTrio.points.length === 0) {
      console.warn('No points to remove from current trio')
      return
    }

    const updatedPoints = currentTrio.points.slice(0, -1)
    
    if (updatedPoints.length === 0) {
      // If no points left, cancel the trio
      setCurrentTrio(null)
      console.log('✓ Last point removed - trio cancelled')
    } else {
      setCurrentTrio({
        ...currentTrio,
        points: updatedPoints
      })
      console.log(`✓ Last point removed - ${updatedPoints.length} point(s) remaining in current trio`)
    }
  }, [currentTrio])

  // Update position of a specific point (for drag repositioning)
  const updatePointPosition = useCallback((trioId: string, pointId: string, newPosition: Point3D) => {
    // Update in completed trios - force new array creation
    setTrios(prev => {
      const updated = prev.map(trio => {
        if (trio.id !== trioId) return trio
        
        // Create entirely new point objects array to ensure React detects change
        const updatedPoints = trio.points.map(point => 
          point.id === pointId 
            ? { id: point.id, x: newPosition.x, y: newPosition.y, z: newPosition.z }
            : { id: point.id, x: point.x, y: point.y, z: point.z }
        )
        
        return {
          ...trio,
          points: updatedPoints,
          // Force update by updating timestamp
          createdAt: new Date().getTime()
        }
      })
      
      console.log(`✓ Point ${pointId} repositioned to (${newPosition.x.toFixed(2)}, ${newPosition.y.toFixed(2)}, ${newPosition.z.toFixed(2)})`)
      console.log(`  → Triggering plane and ellipse recalculation...`)
      
      return updated
    })
    
    // Update in current trio if applicable
    if (currentTrio && currentTrio.id === trioId) {
      const updatedPoints = currentTrio.points.map(point => 
        point.id === pointId 
          ? { id: point.id, x: newPosition.x, y: newPosition.y, z: newPosition.z }
          : { id: point.id, x: point.x, y: point.y, z: point.z }
      )
      
      setCurrentTrio({
        ...currentTrio,
        points: updatedPoints
      })
    }
  }, [currentTrio])

  // Select a trio for editing/viewing
  const selectTrio = useCallback((trioId: string | null) => {
    setSelectedTrioId(trioId)
  }, [])

  // VALIDATION FUNCTION: Create trio from α, β, and depth
  const createValidationTrio = useCallback((
    alpha: number,    // Buzamiento (dip angle) in degrees (0-90)
    beta: number,     // Angle relative to BOH in degrees
    depthInMeters: number, // Depth in meters
    bohAngle: number = 90  // BOH reference angle in degrees
  ) => {
    const depthCm = depthInMeters * 100 // Convert to cm
    const radius = 3.175 // Cylinder radius in cm
    
    console.log(`🧪 VALIDATION: Creating trio for α=${alpha}°, β=${beta}°, depth=${depthCm}cm, BOH=${bohAngle}°`)
    
    // Convert angles to radians
    const alphaRad = (alpha * Math.PI) / 180
    const betaRad = (beta * Math.PI) / 180
    const bohRad = (bohAngle * Math.PI) / 180
    
    // Calculate plane normal vector from α and β
    // α = dip angle (angle from horizontal)
    // β = angle in horizontal plane relative to BOH
    
    // Azimuth of the plane (direction of steepest descent)
    // β is measured from BOH, so azimuth = BOH + β
    const azimuthRad = bohRad + betaRad
    
    // Plane normal components
    // For a plane with dip α and azimuth ψ:
    const nx = Math.sin(alphaRad) * Math.cos(azimuthRad)
    const ny = Math.sin(alphaRad) * Math.sin(azimuthRad)
    const nz = Math.cos(alphaRad)
    
    // Plane equation: nx*x + ny*y + nz*z = d
    // The plane intersects Z-axis at (0, 0, depthCm)
    const d = nz * depthCm
    
    console.log(`  Normal vector: (${nx.toFixed(3)}, ${ny.toFixed(3)}, ${nz.toFixed(3)})`)
    console.log(`  Plane equation: ${nx.toFixed(3)}*x + ${ny.toFixed(3)}*y + ${nz.toFixed(3)}*z = ${d.toFixed(3)}`)
    
    // Generate 3 points on cylinder surface that lie on this plane
    // Point on cylinder: x² + y² = r²
    // Point on plane: nx*x + ny*y + nz*z = d
    
    // Strategy: Pick 3 different angles around cylinder and solve for z
    const angles = [0, 120, 240] // Three points evenly distributed
    const points: Point3D[] = []
    
    angles.forEach((angle, idx) => {
      const angleRad = (angle * Math.PI) / 180
      const x = radius * Math.cos(angleRad)
      const y = radius * Math.sin(angleRad)
      
      // Solve for z: z = (d - nx*x - ny*y) / nz
      let z = (d - nx * x - ny * y) / nz
      
      // Clamp z to valid cylinder range [0, 30]
      z = Math.max(0, Math.min(30, z))
      
      points.push({
        id: `val-p${idx + 1}-${Date.now()}`,
        x,
        y,
        z
      })
      
      console.log(`  Point ${idx + 1}: (${x.toFixed(3)}, ${y.toFixed(3)}, ${z.toFixed(3)})`)
    })
    
    // Verify points are on plane
    points.forEach((p, idx) => {
      const planeValue = nx * p.x + ny * p.y + nz * p.z
      const error = Math.abs(planeValue - d)
      console.log(`  Verification P${idx + 1}: ${planeValue.toFixed(3)} = ${d.toFixed(3)} (error: ${error.toFixed(6)})`)
    })
    
    const newTrio: PointTrio = {
      id: `validation-trio-${Date.now()}`,
      points,
      color: getTrioColor(trios.length),
      createdAt: Date.now(),
      depth: depthCm,
      isValidation: true // Mark as validation trio - excluded from reports
    }
    
    setTrios([...trios, newTrio])
    setCurrentTrio(null)
    
    console.log(`✅ VALIDATION trio created (excluded from reports) - Check calculated α and β in UI`)
    
    return newTrio
  }, [trios, getTrioColor])
  
  // Simple test function (keep for backward compatibility)
  const createTestTrio = useCallback((depthInMeters: number, targetAlpha: number) => {
    // Use validation function with default β=0
    return createValidationTrio(targetAlpha, 0, depthInMeters, 90)
  }, [createValidationTrio])

  // Toggle validation trios visibility
  const toggleValidationVisibility = useCallback((visible: boolean) => {
    setValidationTriosVisible(visible)
  }, [])

  // Clear only validation trios
  const clearValidationTrios = useCallback(() => {
    setTrios(prev => prev.filter(t => !t.isValidation))
    console.log('🧹 All validation trios cleared')
  }, [])

  // Computed values
  const normalTrios = trios.filter(t => !t.isValidation)
  const validationTrios = trios.filter(t => t.isValidation)
  const visibleTrios = trios.filter(t => !t.isValidation || validationTriosVisible)

  return {
    // State
    trios: visibleTrios, // Only return visible trios
    allTrios: trios, // All trios including hidden validation ones
    normalTrios, // Only non-validation trios
    validationTrios, // Only validation trios
    currentTrio,
    selectedTrioId,
    validationTriosVisible,
    
    // Computed
    triosCount: normalTrios.length, // Only count normal trios for reports
    validationTriosCount: validationTrios.length,
    currentTrioPointsCount: currentTrio?.points.length || 0,
    canAddMoreTrios: normalTrios.length < MAX_TRIOS, // Check only normal trios
    isCurrentTrioComplete: currentTrio?.points.length === POINTS_PER_TRIO,
    
    // Actions
    addPoint,
    completeTrio,
    setTrioDepth,
    removeTrio,
    clearAllTrios,
    clearValidationTrios,
    cancelCurrentTrio,
    removeLastPoint,
    updatePointPosition,
    selectTrio,
    createTestTrio,
    createValidationTrio,
    toggleValidationVisibility,
    
    // Utils
    getTrioColor,
    MAX_TRIOS,
    POINTS_PER_TRIO
  }
}

