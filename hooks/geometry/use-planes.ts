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

export interface EllipsePoint {
  x: number
  y: number
  z: number
}

export interface PlaneAngles {
  alpha: number // Angle relative to Z-axis (degrees)
  beta: number // Angle relative to BOH line (degrees)
  azimuth: number // Azimuth/strike angle (degrees)
}

export interface Plane {
  id: string
  trioId: string
  equation: PlaneEquation
  color: string
  visible: boolean
  createdAt: Date
  ellipsePoints?: EllipsePoint[] // Points forming the ellipse
  angles?: PlaneAngles // Alpha, beta, and azimuth angles
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

/**
 * Calculate alpha angle (α): angle between plane and Z-axis
 * α = angle between plane normal and Z-axis
 * Returns angle in degrees (0° = perpendicular to Z, 90° = parallel to Z)
 */
export function calculateAlphaAngle(equation: PlaneEquation): number {
  const { normal } = equation
  
  // Angle between normal vector and Z-axis (0, 0, 1)
  // cos(α) = |nz| / |n|
  const normalMagnitude = Math.sqrt(normal.x ** 2 + normal.y ** 2 + normal.z ** 2)
  
  if (normalMagnitude === 0) return 0
  
  const cosAlpha = Math.abs(normal.z) / normalMagnitude
  const alphaRad = Math.acos(Math.max(-1, Math.min(1, cosAlpha))) // Clamp to [-1, 1]
  const alphaDeg = (alphaRad * 180) / Math.PI
  
  // Return complementary angle (90° - angle with Z) to get dip angle
  // 0° = horizontal plane, 90° = vertical plane
  const dipAngle = 90 - alphaDeg
  
  console.log(`Alpha angle: ${dipAngle.toFixed(2)}° (dip from horizontal)`)
  
  return dipAngle
}

/**
 * Calculate beta angle (β): angle of plane dip in the direction of BOH line
 * β measures how the plane tilts relative to the radial direction at the BOH position
 * 
 * Interpretation:
 * - 0° = plane is perpendicular to the BOH radial direction (plane faces the BOH)
 * - 90° = plane is parallel to the BOH radial direction (plane runs along BOH)
 * 
 * This is dynamic: changes when BOH angle changes (70-110°)
 */
export function calculateBetaAngle(
  equation: PlaneEquation,
  bohAngle: number, // BOH angle in degrees (70-110)
  cylinderRadius: number = 3.175
): number {
  const { normal } = equation
  
  // BOH radial direction at angular position (pointing outward from cylinder center)
  const bohAngleRad = (bohAngle * Math.PI) / 180
  const radialDirection = {
    x: Math.cos(bohAngleRad),
    y: Math.sin(bohAngleRad),
    z: 0
  }
  
  // Calculate dot product between plane normal and radial direction
  const dotProduct = normal.x * radialDirection.x + normal.y * radialDirection.y + normal.z * radialDirection.z
  const normalMag = Math.sqrt(normal.x ** 2 + normal.y ** 2 + normal.z ** 2)
  const radialMag = Math.sqrt(radialDirection.x ** 2 + radialDirection.y ** 2 + radialDirection.z ** 2)
  
  if (normalMag === 0 || radialMag === 0) return 0
  
  // Angle between normal and radial direction
  const cosBeta = dotProduct / (normalMag * radialMag)
  const betaRad = Math.acos(Math.max(-1, Math.min(1, cosBeta)))
  const betaDeg = (betaRad * 180) / Math.PI
  
  // β is the angle of the plane relative to the radial direction
  // We want the angle of inclination, so:
  // - If normal is perpendicular to radial → β = 0° (plane faces BOH)
  // - If normal is parallel to radial → β = 90° (plane along BOH)
  const beta = Math.abs(90 - betaDeg)
  
  console.log(`Beta (BOH at ${bohAngle}°, radial dir: [${radialDirection.x.toFixed(2)}, ${radialDirection.y.toFixed(2)}, ${radialDirection.z.toFixed(2)}]): ${beta.toFixed(2)}°`)
  
  return beta
}

/**
 * Calculate azimuth/strike angle: direction of the plane's horizontal line
 * Measured clockwise from North (0° = North, 90° = East, 180° = South, 270° = West)
 */
export function calculateAzimuthAngle(equation: PlaneEquation): number {
  const { normal } = equation
  
  // Project normal onto XY plane
  const horizontalX = normal.x
  const horizontalY = normal.y
  
  // Calculate azimuth (direction perpendicular to dip direction)
  let azimuthRad = Math.atan2(horizontalX, horizontalY)
  let azimuthDeg = (azimuthRad * 180) / Math.PI
  
  // Convert to 0-360° range
  if (azimuthDeg < 0) azimuthDeg += 360
  
  // Add 90° to get strike (perpendicular to dip)
  let strike = azimuthDeg + 90
  if (strike >= 360) strike -= 360
  
  console.log(`Azimuth/Strike: ${strike.toFixed(2)}°`)
  
  return strike
}

/**
 * Calculate ellipse points from cylinder-plane intersection
 * Cylinder: x² + y² = R², axis along Z
 * Plane: ax + by + cz + d = 0
 */
export function calculateEllipsePoints(
  equation: PlaneEquation,
  cylinderRadius: number,
  numPoints: number = 64
): EllipsePoint[] {
  const { a, b, c, d } = equation
  const points: EllipsePoint[] = []
  
  // If plane is parallel to Z-axis (c = 0), the intersection is not an ellipse
  if (Math.abs(c) < 0.0001) {
    console.warn('Plane is nearly parallel to Z-axis, ellipse calculation may be inaccurate')
    return points
  }
  
  // Generate points around the cylinder
  for (let i = 0; i < numPoints; i++) {
    const theta = (i / numPoints) * 2 * Math.PI
    
    // Point on cylinder surface
    const x = cylinderRadius * Math.cos(theta)
    const y = cylinderRadius * Math.sin(theta)
    
    // Calculate z from plane equation: ax + by + cz + d = 0
    // z = -(ax + by + d) / c
    const z = -(a * x + b * y + d) / c
    
    points.push({ x, y, z })
  }
  
  console.log(`Generated ${numPoints} ellipse points for cylinder-plane intersection`)
  
  return points
}

export function usePlanes(
  trios: PointTrio[], 
  cylinderRadius: number = 3.175,
  line1Angle: number = 90,
  line2Angle: number = 90
) {
  const [planes, setPlanes] = useState<Plane[]>([])
  
  // Automatically generate planes from complete trios
  useEffect(() => {
    const newPlanes: Plane[] = []
    
    if (!trios || trios.length === 0) {
      setPlanes([])
      return
    }
    
    console.log(`🔄 Recalculating ${trios.length} plane(s) and ellipse(s)...`)
    
    trios.forEach(trio => {
      if (trio.points.length !== 3) return
      
      // Always recalculate plane equation (dynamic, based on current point positions)
      const equation = calculatePlaneFromPoints(
        trio.points[0],
        trio.points[1],
        trio.points[2]
      )
      
      // Calculate ellipse points (cylinder-plane intersection) - DYNAMIC
      const ellipsePoints = calculateEllipsePoints(equation, cylinderRadius, 64)
      console.log(`  ⭕ Ellipse recalculated for trio ${trio.id} with ${ellipsePoints.length} points`)
      
      // Calculate plane depth (Z-axis intersection)
      const planeDepth = calculatePlaneDepth(equation)
      
      // Determine which BOH line this plane corresponds to
      // BOH1 (line1): z=0 to z=15 (bottom half)
      // BOH2 (line2): z=15 to z=30 (top half)
      const correspondingBOH = planeDepth !== null && planeDepth < 15 ? line1Angle : line2Angle
      const bohLabel = planeDepth !== null && planeDepth < 15 ? 'BOH1' : 'BOH2'
      const bohAngleValue = planeDepth !== null && planeDepth < 15 ? line1Angle : line2Angle
      
      // Calculate angles - ALWAYS RECALCULATE for dynamic β update
      const alpha = calculateAlphaAngle(equation)
      const beta = calculateBetaAngle(equation, correspondingBOH, cylinderRadius) // Dynamic based on BOH
      const azimuth = calculateAzimuthAngle(equation)
      
      const angles: PlaneAngles = { alpha, beta, azimuth }
      
      console.log(`✓ Plane ${trio.id} - α: ${alpha.toFixed(2)}°, β: ${beta.toFixed(2)}° (vs ${bohLabel}@${bohAngleValue}°), Azimuth: ${azimuth.toFixed(2)}°`)
      
      // Create/update plane
      const newPlane: Plane = {
        id: `plane-${trio.id}`,
        trioId: trio.id,
        equation,
        color: trio.color,
        visible: true,
        createdAt: new Date(),
        ellipsePoints,
        angles // Dynamic angles including β
      }
      
      newPlanes.push(newPlane)
    })
    
    setPlanes(newPlanes)
  }, [trios, cylinderRadius, line1Angle, line2Angle]) // Recalculate when BOH angles change
  
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

