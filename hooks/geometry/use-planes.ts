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
 * Calculate alpha angle (α): angle between PLANE and Z-axis (borehole axis)
 * 
 * IMPORTANT: α is the angle between the PLANE and the Z-axis, NOT the normal vector.
 * 
 * Method:
 * 1. Calculate angle θ between normal vector and Z-axis: θ = acos(|nz| / |n|)
 * 2. Calculate α as complementary angle: α = 90° - θ
 * 
 * Result:
 * - α = 0°: Plane is PERPENDICULAR to Z-axis (horizontal plane)
 * - α = 90°: Plane is PARALLEL to Z-axis (vertical plane)
 */
export function calculateAlphaAngle(equation: PlaneEquation): number {
  const { normal } = equation
  
  // Step 1: Calculate angle θ between normal vector and Z-axis (0, 0, 1)
  // cos(θ) = |nz| / |n|
  const normalMagnitude = Math.sqrt(normal.x ** 2 + normal.y ** 2 + normal.z ** 2)
  
  if (normalMagnitude === 0) return 0
  
  const cosTheta = Math.abs(normal.z) / normalMagnitude
  const thetaRad = Math.acos(Math.max(-1, Math.min(1, cosTheta))) // Clamp to [-1, 1]
  const thetaDeg = (thetaRad * 180) / Math.PI
  
  // Step 2: Calculate α as complementary angle (angle between PLANE and Z-axis)
  // α = 90° - θ
  const alpha = 90 - thetaDeg
  
  console.log(`✓ α (alpha): ${alpha.toFixed(2)}° - Angle between PLANE and Z-axis (not normal)`)
  console.log(`  (θ normal-to-Z: ${thetaDeg.toFixed(2)}°, α = 90° - θ)`)
  
  return alpha
}

/**
 * Calculate beta angle (β): angle between BOH line and the dip direction of the ellipse
 * 
 * β is the angle between:
 * 1. The BOH line (vertical line on cylinder surface)
 * 2. The dip direction (direction of steepest descent of the plane, projected onto cylinder surface)
 * 
 * Method:
 * 1. Calculate dip direction: perpendicular to strike, in direction of normal's XY component
 * 2. Project dip direction onto cylinder surface at BOH angular position
 * 3. Calculate angle between BOH (vertical) and projected dip direction
 * 
 * Interpretation:
 * - β = 0°: Dip direction is parallel to BOH (plane dips along BOH line)
 * - β = 90°: Dip direction is perpendicular to BOH (plane dips perpendicular to BOH)
 */
export function calculateBetaAngle(
  equation: PlaneEquation,
  bohAngle: number, // BOH angle in degrees (70-110)
  cylinderRadius: number = 3.175
): number {
  const { normal } = equation
  
  // Step 1: Calculate dip direction (direction of steepest descent)
  // Dip direction is the horizontal projection of the normal vector
  const dipDirectionXY = {
    x: normal.x,
    y: normal.y
  }
  
  const dipMagnitudeXY = Math.sqrt(dipDirectionXY.x ** 2 + dipDirectionXY.y ** 2)
  
  if (dipMagnitudeXY < 0.0001) {
    // Plane is horizontal, no preferred dip direction
    console.log(`β (beta): N/A - Plane is horizontal (normal parallel to Z)`)
    return 0
  }
  
  // Normalize dip direction
  const dipDirectionNormalized = {
    x: dipDirectionXY.x / dipMagnitudeXY,
    y: dipDirectionXY.y / dipMagnitudeXY
  }
  
  // Step 2: Calculate azimuth of dip direction (0-360°)
  const dipAzimuthRad = Math.atan2(dipDirectionNormalized.y, dipDirectionNormalized.x)
  let dipAzimuthDeg = (dipAzimuthRad * 180) / Math.PI
  if (dipAzimuthDeg < 0) dipAzimuthDeg += 360
  
  // Step 3: BOH angular position
  let bohAzimuthDeg = bohAngle
  if (bohAzimuthDeg < 0) bohAzimuthDeg += 360
  
  // Step 4: Calculate β as angular difference between dip direction and BOH
  // β is the angle between the dip direction and the BOH line
  let beta = Math.abs(dipAzimuthDeg - bohAzimuthDeg)
  
  // Normalize to 0-180° range
  if (beta > 180) beta = 360 - beta
  
  console.log(`✓ β (beta): ${beta.toFixed(2)}° - Angle between BOH@${bohAngle.toFixed(1)}° and dip direction@${dipAzimuthDeg.toFixed(1)}°`)
  
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
    
    console.log(`🔄 usePlanes useEffect triggered with trios:`, trios)
    
    if (!trios || trios.length === 0) {
      console.log(`   No trios available, setting empty planes`)
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
      
      // Calculate center of ellipse (average of all ellipse points)
      let ellipseCenterZ = 0
      if (ellipsePoints.length > 0) {
        ellipseCenterZ = ellipsePoints.reduce((sum, p) => sum + p.z, 0) / ellipsePoints.length
      }
      
      // Determine which BOH line is closer to the ellipse center
      // BOH1 RED (line1): z=15 to z=30 (UPPER half)
      // BOH2 GREEN (line2): z=0 to z=15 (LOWER half)
      const distanceToBOH1 = Math.abs(ellipseCenterZ - 22.5) // BOH1 (RED) center at z=22.5 (upper)
      const distanceToBOH2 = Math.abs(ellipseCenterZ - 7.5)  // BOH2 (GREEN) center at z=7.5 (lower)
      
      const correspondingBOH = distanceToBOH1 < distanceToBOH2 ? line1Angle : line2Angle
      const bohLabel = distanceToBOH1 < distanceToBOH2 ? 'BOH1 (RED, upper)' : 'BOH2 (GREEN, lower)'
      const bohAngleValue = correspondingBOH
      
      // Calculate plane depth (Z-axis intersection) for reference
      const planeDepth = calculatePlaneDepth(equation)
      
      // Calculate angles - ALWAYS RECALCULATE for dynamic β update
      const alpha = calculateAlphaAngle(equation)
      const beta = calculateBetaAngle(equation, correspondingBOH, cylinderRadius) // Dynamic based on BOH
      const azimuth = calculateAzimuthAngle(equation)
      
      const angles: PlaneAngles = { alpha, beta, azimuth }
      
      console.log(`✓ Plane ${trio.id}:`)
      console.log(`   Ellipse center Z: ${ellipseCenterZ.toFixed(2)}cm`)
      console.log(`   Distance to BOH1 (RED, z=15-30, center 22.5): ${distanceToBOH1.toFixed(2)}cm`)
      console.log(`   Distance to BOH2 (GREEN, z=0-15, center 7.5): ${distanceToBOH2.toFixed(2)}cm`)
      console.log(`   → Using ${bohLabel} @ ${bohAngleValue.toFixed(1)}° (closest to ellipse)`)
      console.log(`   α: ${alpha.toFixed(2)}°, β: ${beta.toFixed(2)}°, Azimuth: ${azimuth.toFixed(2)}°`)
      
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
    
    console.log(`🔄 Generated ${newPlanes.length} plane(s) from ${trios.length} trio(s)`)
    console.log(`   Planes:`, newPlanes.map(p => ({ id: p.id, ellipsePoints: p.ellipsePoints?.length || 0 })))
    
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

