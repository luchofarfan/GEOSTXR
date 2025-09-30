'use client'

import { useState, useCallback, useEffect } from 'react'
import { Point3D, PointTrio } from './use-point-trios'

export interface PlaneEquation {
  a: number // x coefficient
  b: number // y coefficient
  c: number // z coefficient
  d: number // constant
  normal: { x: number; y: number; z: number } // Normal vector
}

export interface Plane {
  id: string
  trioId: string
  equation: PlaneEquation
  color: string
  visible: boolean
  createdAt: Date
}

const MAX_PLANES = 100

/**
 * Calculate plane equation from 3 points
 * Plane equation: ax + by + cz + d = 0
 */
export function calculatePlaneFromPoints(p1: Point3D, p2: Point3D, p3: Point3D): PlaneEquation {
  // Calculate two vectors in the plane
  const v1 = {
    x: p2.x - p1.x,
    y: p2.y - p1.y,
    z: p2.z - p1.z
  }
  
  const v2 = {
    x: p3.x - p1.x,
    y: p3.y - p1.y,
    z: p3.z - p1.z
  }
  
  // Normal vector = cross product of v1 and v2
  const normal = {
    x: v1.y * v2.z - v1.z * v2.y,
    y: v1.z * v2.x - v1.x * v2.z,
    z: v1.x * v2.y - v1.y * v2.x
  }
  
  // Normalize the normal vector
  const magnitude = Math.sqrt(normal.x ** 2 + normal.y ** 2 + normal.z ** 2)
  
  if (magnitude === 0) {
    console.error('Points are collinear, cannot form a plane')
    return { a: 0, b: 0, c: 1, d: 0, normal: { x: 0, y: 0, z: 1 } }
  }
  
  const normalizedNormal = {
    x: normal.x / magnitude,
    y: normal.y / magnitude,
    z: normal.z / magnitude
  }
  
  // Plane equation: a(x - x0) + b(y - y0) + c(z - z0) = 0
  // Expanded: ax + by + cz - (ax0 + by0 + cz0) = 0
  const a = normal.x
  const b = normal.y
  const c = normal.z
  const d = -(a * p1.x + b * p1.y + c * p1.z)
  
  console.log(`Plane equation: ${a.toFixed(3)}x + ${b.toFixed(3)}y + ${c.toFixed(3)}z + ${d.toFixed(3)} = 0`)
  console.log(`Normal vector: (${normalizedNormal.x.toFixed(3)}, ${normalizedNormal.y.toFixed(3)}, ${normalizedNormal.z.toFixed(3)})`)
  
  return { a, b, c, d, normal: normalizedNormal }
}

/**
 * Calculate depth (Z-axis intersection) for a plane
 * Returns the Z coordinate where the plane intersects the cylinder axis (x=0, y=0)
 */
export function calculatePlaneDepth(equation: PlaneEquation): number | null {
  // At cylinder axis: x = 0, y = 0
  // Plane equation: ax + by + cz + d = 0
  // Substitute: 0 + 0 + c*z + d = 0
  // z = -d/c
  
  if (equation.c === 0) {
    console.warn('Plane is parallel to Z-axis, no unique Z intersection')
    return null
  }
  
  const z = -equation.d / equation.c
  console.log(`Plane intersects Z-axis at z = ${z.toFixed(2)}cm`)
  
  return z
}

export function usePlanes(trios: PointTrio[]) {
  const [planes, setPlanes] = useState<Plane[]>([])
  
  // Automatically generate planes from complete trios
  useEffect(() => {
    const newPlanes: Plane[] = []
    
    trios.forEach(trio => {
      if (trio.points.length !== 3) return
      
      // Check if plane already exists for this trio
      const existingPlane = planes.find(p => p.trioId === trio.id)
      if (existingPlane) {
        newPlanes.push(existingPlane)
        return
      }
      
      // Calculate plane equation
      const equation = calculatePlaneFromPoints(
        trio.points[0],
        trio.points[1],
        trio.points[2]
      )
      
      // Create new plane
      const newPlane: Plane = {
        id: `plane-${trio.id}`,
        trioId: trio.id,
        equation,
        color: trio.color,
        visible: true,
        createdAt: new Date()
      }
      
      newPlanes.push(newPlane)
      console.log(`Plane generated for trio ${trio.id}`)
    })
    
    setPlanes(newPlanes)
  }, [trios])
  
  // Toggle plane visibility
  const togglePlaneVisibility = useCallback((planeId: string) => {
    setPlanes(prev => prev.map(plane =>
      plane.id === planeId ? { ...plane, visible: !plane.visible } : plane
    ))
  }, [])
  
  // Remove a plane
  const removePlane = useCallback((planeId: string) => {
    setPlanes(prev => prev.filter(plane => plane.id !== planeId))
  }, [])
  
  // Clear all planes
  const clearAllPlanes = useCallback(() => {
    setPlanes([])
  }, [])
  
  return {
    planes,
    planesCount: planes.length,
    togglePlaneVisibility,
    removePlane,
    clearAllPlanes,
    MAX_PLANES
  }
}

