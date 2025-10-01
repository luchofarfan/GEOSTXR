/**
 * Geospatial Transformations for Structural Geology
 * 
 * This module provides functions to transform local measurements on a cylinder
 * to real-world geospatial coordinates and orientations.
 * 
 * Key Concepts:
 * - Local Frame: Cylinder coordinate system (α, β, BOH angles)
 * - Global Frame: Real-world coordinate system (UTM, elevation, true dip/dip direction)
 * - Drill Hole: Oriented cylinder in space (azimuth, dip)
 */

/**
 * Real-world orientation of a geological structure
 */
export interface RealOrientation {
  dip: number           // True dip angle (0-90°, from horizontal)
  dipDirection: number  // True dip direction (0-360°, clockwise from North)
}

/**
 * Spatial coordinates in UTM system
 */
export interface SpatialCoordinates {
  east: number       // UTM Easting (meters)
  north: number      // UTM Northing (meters)
  elevation: number  // Elevation above sea level (m.a.s.l.)
}

/**
 * Convert degrees to radians
 */
function toRadians(degrees: number): number {
  return degrees * Math.PI / 180
}

/**
 * Convert radians to degrees
 */
function toDegrees(radians: number): number {
  return radians * 180 / Math.PI
}

/**
 * Normalize angle to 0-360° range
 */
function normalizeAngle(degrees: number): number {
  let normalized = degrees % 360
  if (normalized < 0) normalized += 360
  return normalized
}

/**
 * Calculate 3D rotation matrix for drill hole orientation
 * 
 * @param azimuth - Drill hole azimuth (0-360°, clockwise from North)
 * @param dip - Drill hole dip (-90 to 90°, negative = downward)
 * @returns 3x3 rotation matrix
 */
function getDrillHoleRotationMatrix(azimuth: number, dip: number): number[][] {
  const azRad = toRadians(azimuth)
  const dipRad = toRadians(-dip) // Negative because dip is downward
  
  // Rotation around Z-axis (azimuth)
  const cosAz = Math.cos(azRad)
  const sinAz = Math.sin(azRad)
  
  // Rotation around Y-axis (dip)
  const cosDip = Math.cos(dipRad)
  const sinDip = Math.sin(dipRad)
  
  // Combined rotation matrix (Rz * Ry)
  // For a vertical hole (dip = -90°), Z_drill = -Z_global
  // For azimuth = 0°, drill points North
  return [
    [cosAz * cosDip,  -sinAz,  cosAz * sinDip],
    [sinAz * cosDip,   cosAz,  sinAz * sinDip],
    [-sinDip,          0,      cosDip]
  ]
}

/**
 * Transform a vector from drill hole coordinates to global coordinates
 * 
 * @param localVector - Vector in drill hole frame [x, y, z]
 * @param rotationMatrix - 3x3 rotation matrix
 * @returns Vector in global frame [x, y, z]
 */
function transformVector(localVector: number[], rotationMatrix: number[][]): number[] {
  const [x, y, z] = localVector
  return [
    rotationMatrix[0][0] * x + rotationMatrix[0][1] * y + rotationMatrix[0][2] * z,
    rotationMatrix[1][0] * x + rotationMatrix[1][1] * y + rotationMatrix[1][2] * z,
    rotationMatrix[2][0] * x + rotationMatrix[2][1] * y + rotationMatrix[2][2] * z
  ]
}

/**
 * Calculate plane normal vector in cylinder coordinate system
 * 
 * @param alpha - Dip angle relative to cylinder axis (0-90°)
 * @param beta - Angle relative to BOH line (0-180°)
 * @param bohAngle - BOH reference angle on cylinder surface (0-180°)
 * @param cylinderRadius - Cylinder radius (cm)
 * @returns Normal vector in cylinder frame [x, y, z]
 */
function getPlaneNormalInCylinder(
  alpha: number,
  beta: number,
  bohAngle: number,
  cylinderRadius: number
): number[] {
  // Convert to radians
  const alphaRad = toRadians(alpha)
  const betaRad = toRadians(beta)
  const bohRad = toRadians(bohAngle)
  
  // In cylinder frame:
  // - Z axis = along drill hole
  // - X axis = horizontal (East in cylinder view)
  // - Y axis = horizontal (North in cylinder view)
  // - BOH is at angle bohRad from X axis
  
  // Plane normal components
  // The plane has dip alpha from horizontal plane of cylinder
  // The dip direction is beta degrees from BOH line
  
  const azimuthInCylinder = bohRad + betaRad
  
  const nx = Math.sin(alphaRad) * Math.cos(azimuthInCylinder)
  const ny = Math.sin(alphaRad) * Math.sin(azimuthInCylinder)
  const nz = Math.cos(alphaRad)
  
  return [nx, ny, nz]
}

/**
 * Calculate real-world orientation (dip and dip direction) of a geological structure
 * 
 * Transforms local measurements on cylinder to true orientation in space.
 * 
 * @param alpha - Dip angle measured on cylinder (0-90°, from cylinder axis)
 * @param beta - Angle from BOH line (0-180°)
 * @param bohAngle - BOH reference angle on cylinder (0-180°, 90° = front)
 * @param drillAzimuth - Drill hole azimuth (0-360°, clockwise from North)
 * @param drillDip - Drill hole dip (-90 to 90°, negative = downward)
 * @param cylinderRadius - Cylinder radius (cm)
 * @returns Real-world dip and dip direction
 */
export function calculateRealOrientation(
  alpha: number,
  beta: number,
  bohAngle: number,
  drillAzimuth: number,
  drillDip: number,
  cylinderRadius: number = 3.0
): RealOrientation {
  console.log('🌍 Calculating real-world orientation:')
  console.log(`   Input: α=${alpha.toFixed(2)}°, β=${beta.toFixed(2)}°, BOH=${bohAngle.toFixed(1)}°`)
  console.log(`   Drill: Az=${drillAzimuth.toFixed(2)}°, Dip=${drillDip.toFixed(2)}°`)
  
  // 1. Get plane normal in cylinder frame
  const normalLocal = getPlaneNormalInCylinder(alpha, beta, bohAngle, cylinderRadius)
  console.log(`   Normal (local): [${normalLocal.map(v => v.toFixed(3)).join(', ')}]`)
  
  // 2. Get rotation matrix for drill hole orientation
  const rotMatrix = getDrillHoleRotationMatrix(drillAzimuth, drillDip)
  
  // 3. Transform normal to global frame
  const normalGlobal = transformVector(normalLocal, rotMatrix)
  console.log(`   Normal (global): [${normalGlobal.map(v => v.toFixed(3)).join(', ')}]`)
  
  // 4. Calculate dip (angle from horizontal)
  const [nx, ny, nz] = normalGlobal
  const dipRad = Math.asin(Math.abs(nz))
  const dip = toDegrees(dipRad)
  
  // 5. Calculate dip direction (azimuth of steepest descent)
  // Dip direction is perpendicular to strike, points downward
  let dipDirectionRad = Math.atan2(nx, ny)
  
  // Ensure dip direction points downward (in direction of negative gradient)
  if (nz > 0) {
    dipDirectionRad += Math.PI
  }
  
  let dipDirection = toDegrees(dipDirectionRad)
  dipDirection = normalizeAngle(dipDirection)
  
  console.log(`   ✓ Result: Dip=${dip.toFixed(2)}°, Dip Direction=${dipDirection.toFixed(2)}°`)
  
  return {
    dip,
    dipDirection
  }
}

/**
 * Calculate spatial coordinates (UTM and elevation) of a structure
 * 
 * Uses drill hole trajectory to calculate position of structure in space.
 * 
 * @param collarEast - Collar UTM Easting (meters)
 * @param collarNorth - Collar UTM Northing (meters)
 * @param collarElevation - Collar elevation (m.a.s.l.)
 * @param depthAlongHole - Depth along drill hole (meters, from collar)
 * @param drillAzimuth - Drill hole azimuth (0-360°, clockwise from North)
 * @param drillDip - Drill hole dip (-90 to 90°, negative = downward)
 * @returns Spatial coordinates of the structure
 */
export function calculateSpatialCoordinates(
  collarEast: number,
  collarNorth: number,
  collarElevation: number,
  depthAlongHole: number,
  drillAzimuth: number,
  drillDip: number
): SpatialCoordinates {
  console.log('📍 Calculating spatial coordinates:')
  console.log(`   Collar: E=${collarEast.toFixed(2)}m, N=${collarNorth.toFixed(2)}m, Z=${collarElevation.toFixed(2)}m`)
  console.log(`   Depth: ${depthAlongHole.toFixed(2)}m along hole`)
  console.log(`   Drill: Az=${drillAzimuth.toFixed(2)}°, Dip=${drillDip.toFixed(2)}°`)
  
  // Convert angles to radians
  const azRad = toRadians(drillAzimuth)
  const dipRad = toRadians(drillDip)
  
  // Calculate displacement in each direction
  // For dip = -90° (vertical down): dE = 0, dN = 0, dZ = -depth
  // For dip = 0° (horizontal): dE = depth*sin(az), dN = depth*cos(az), dZ = 0
  // For dip = +90° (vertical up): dE = 0, dN = 0, dZ = +depth
  
  const horizontalDistance = depthAlongHole * Math.cos(dipRad)
  const verticalDistance = depthAlongHole * Math.sin(dipRad)
  
  const dEast = horizontalDistance * Math.sin(azRad)
  const dNorth = horizontalDistance * Math.cos(azRad)
  const dElevation = verticalDistance
  
  const east = collarEast + dEast
  const north = collarNorth + dNorth
  const elevation = collarElevation + dElevation
  
  console.log(`   Δ: E=${dEast.toFixed(2)}m, N=${dNorth.toFixed(2)}m, Z=${dElevation.toFixed(2)}m`)
  console.log(`   ✓ Result: E=${east.toFixed(2)}m, N=${north.toFixed(2)}m, Z=${elevation.toFixed(2)}m`)
  
  return {
    east,
    north,
    elevation
  }
}

/**
 * Validate drill hole parameters
 */
export function validateDrillHoleParams(
  azimuth: number,
  dip: number
): { valid: boolean; errors: string[] } {
  const errors: string[] = []
  
  if (azimuth < 0 || azimuth > 360) {
    errors.push(`Azimuth must be 0-360° (got ${azimuth.toFixed(2)}°)`)
  }
  
  if (dip < -90 || dip > 90) {
    errors.push(`Dip must be -90° to 90° (got ${dip.toFixed(2)}°)`)
  }
  
  return {
    valid: errors.length === 0,
    errors
  }
}

/**
 * Format coordinates for display
 */
export function formatCoordinates(coords: SpatialCoordinates): string {
  return `E: ${coords.east.toFixed(2)}m, N: ${coords.north.toFixed(2)}m, Z: ${coords.elevation.toFixed(2)}m`
}

/**
 * Format orientation for display
 */
export function formatOrientation(orientation: RealOrientation): string {
  return `${orientation.dip.toFixed(1)}°/${orientation.dipDirection.toFixed(1)}°`
}

