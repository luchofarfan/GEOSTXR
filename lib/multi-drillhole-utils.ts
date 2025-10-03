import type { Project, DrillHole, Structure } from '@/types/geostxr-data'

export interface DrillHoleDistance {
  drillHole1: DrillHole
  drillHole2: DrillHole
  distance: number
  azimuth: number
}

export interface StructureCorrelation {
  drillHolePair: string
  correlation: number
  commonStructures: number
  distance: number
  jaccardIndex: number
}

export interface SpatialAnalysis {
  boundingBox: {
    minX: number
    maxX: number
    minY: number
    maxY: number
    minZ: number
    maxZ: number
  }
  center: {
    x: number
    y: number
    z: number
  }
  spread: {
    x: number
    y: number
    z: number
  }
}

/**
 * Calculate distance between two drill holes in 3D space
 */
export function calculateDrillHoleDistance(dh1: DrillHole, dh2: DrillHole): DrillHoleDistance {
  const dx = dh2.info.utmEast - dh1.info.utmEast
  const dy = dh2.info.utmNorth - dh1.info.utmNorth
  const dz = dh2.info.elevation - dh1.info.elevation
  
  const distance = Math.sqrt(dx * dx + dy * dy + dz * dz)
  
  // Calculate azimuth from dh1 to dh2
  const azimuth = Math.atan2(dx, dy) * (180 / Math.PI)
  const normalizedAzimuth = azimuth < 0 ? azimuth + 360 : azimuth
  
  return {
    drillHole1: dh1,
    drillHole2: dh2,
    distance,
    azimuth: normalizedAzimuth
  }
}

/**
 * Calculate correlation between two drill holes based on structure types
 */
export function calculateStructureCorrelation(dh1: DrillHole, dh2: DrillHole): StructureCorrelation {
  // Get structure types for both drill holes
  const types1 = new Set(dh1.scenes.flatMap(s => s.structures.map(st => st.structureType)))
  const types2 = new Set(dh2.scenes.flatMap(s => s.structures.map(st => st.structureType)))
  
  // Calculate Jaccard similarity
  const intersection = new Set([...types1].filter(x => types2.has(x)))
  const union = new Set([...types1, ...types2])
  const jaccardIndex = union.size > 0 ? intersection.size / union.size : 0
  
  // Calculate distance
  const distance = calculateDrillHoleDistance(dh1, dh2).distance
  
  return {
    drillHolePair: `${dh1.name} - ${dh2.name}`,
    correlation: jaccardIndex,
    commonStructures: intersection.size,
    distance,
    jaccardIndex
  }
}

/**
 * Perform spatial analysis on a set of drill holes
 */
export function analyzeSpatialDistribution(drillHoles: DrillHole[]): SpatialAnalysis {
  if (drillHoles.length === 0) {
    return {
      boundingBox: { minX: 0, maxX: 0, minY: 0, maxY: 0, minZ: 0, maxZ: 0 },
      center: { x: 0, y: 0, z: 0 },
      spread: { x: 0, y: 0, z: 0 }
    }
  }

  const xCoords = drillHoles.map(dh => dh.info.utmEast)
  const yCoords = drillHoles.map(dh => dh.info.utmNorth)
  const zCoords = drillHoles.map(dh => dh.info.elevation)

  const minX = Math.min(...xCoords)
  const maxX = Math.max(...xCoords)
  const minY = Math.min(...yCoords)
  const maxY = Math.max(...yCoords)
  const minZ = Math.min(...zCoords)
  const maxZ = Math.max(...zCoords)

  const centerX = (minX + maxX) / 2
  const centerY = (minY + maxY) / 2
  const centerZ = (minZ + maxZ) / 2

  return {
    boundingBox: { minX, maxX, minY, maxY, minZ, maxZ },
    center: { x: centerX, y: centerY, z: centerZ },
    spread: { x: maxX - minX, y: maxY - minY, z: maxZ - minZ }
  }
}

/**
 * Group drill holes by proximity
 */
export function groupDrillHolesByProximity(
  drillHoles: DrillHole[], 
  maxDistance: number = 1000
): DrillHole[][] {
  const groups: DrillHole[][] = []
  const processed = new Set<string>()

  drillHoles.forEach(dh => {
    if (processed.has(dh.id)) return

    const group = [dh]
    processed.add(dh.id)

    // Find all drill holes within maxDistance
    drillHoles.forEach(otherDh => {
      if (processed.has(otherDh.id)) return

      const distance = calculateDrillHoleDistance(dh, otherDh).distance
      if (distance <= maxDistance) {
        group.push(otherDh)
        processed.add(otherDh.id)
      }
    })

    groups.push(group)
  })

  return groups
}

/**
 * Calculate structure density in a given area
 */
export function calculateStructureDensity(
  drillHoles: DrillHole[],
  area: { minX: number; maxX: number; minY: number; maxY: number }
): number {
  const relevantDrillHoles = drillHoles.filter(dh => 
    dh.info.utmEast >= area.minX && dh.info.utmEast <= area.maxX &&
    dh.info.utmNorth >= area.minY && dh.info.utmNorth <= area.maxY
  )

  const totalStructures = relevantDrillHoles.reduce((sum, dh) => 
    sum + dh.scenes.reduce((s, scene) => s + scene.structures.length, 0), 0
  )

  const areaSize = (area.maxX - area.minX) * (area.maxY - area.minY)
  return areaSize > 0 ? totalStructures / areaSize : 0
}

/**
 * Find drill holes with similar structural characteristics
 */
export function findSimilarDrillHoles(
  targetDrillHole: DrillHole,
  allDrillHoles: DrillHole[],
  minCorrelation: number = 0.3
): Array<{ drillHole: DrillHole; correlation: number }> {
  const similarities = allDrillHoles
    .filter(dh => dh.id !== targetDrillHole.id)
    .map(dh => ({
      drillHole: dh,
      correlation: calculateStructureCorrelation(targetDrillHole, dh).correlation
    }))
    .filter(item => item.correlation >= minCorrelation)
    .sort((a, b) => b.correlation - a.correlation)

  return similarities
}

/**
 * Calculate structural trend analysis
 */
export function analyzeStructuralTrends(drillHoles: DrillHole[]) {
  const allStructures = drillHoles.flatMap(dh => 
    dh.scenes.flatMap(scene => scene.structures)
  )

  if (allStructures.length === 0) {
    return {
      dominantDip: 0,
      dominantDipDirection: 0,
      dipVariance: 0,
      dipDirectionVariance: 0,
      structureTypes: {},
      avgDepth: 0
    }
  }

  // Calculate average dip and dip direction
  const avgDip = allStructures.reduce((sum, s) => sum + s.dipReal, 0) / allStructures.length
  const avgDipDirection = allStructures.reduce((sum, s) => sum + s.dipDirection, 0) / allStructures.length

  // Calculate variance
  const dipVariance = allStructures.reduce((sum, s) => sum + Math.pow(s.dipReal - avgDip, 2), 0) / allStructures.length
  const dipDirectionVariance = allStructures.reduce((sum, s) => sum + Math.pow(s.dipDirection - avgDipDirection, 2), 0) / allStructures.length

  // Count structure types
  const structureTypes = allStructures.reduce((acc, s) => {
    acc[s.structureType] = (acc[s.structureType] || 0) + 1
    return acc
  }, {} as Record<string, number>)

  // Calculate average depth
  const avgDepth = allStructures.reduce((sum, s) => sum + s.depth, 0) / allStructures.length

  return {
    dominantDip: avgDip,
    dominantDipDirection: avgDipDirection,
    dipVariance,
    dipDirectionVariance,
    structureTypes,
    avgDepth
  }
}

/**
 * Export multi-drillhole data to CSV format
 */
export function exportMultiDrillHoleData(
  projects: Project[],
  selectedDrillHoles?: DrillHole[]
): string {
  const drillHoles = selectedDrillHoles || projects.flatMap(p => p.drillHoles)
  
  const headers = [
    'Proyecto',
    'Sondaje',
    'Profundidad_Total_m',
    'Azimuth_grados',
    'Dip_grados',
    'UTM_Este_m',
    'UTM_Norte_m',
    'Elevacion_m',
    'Total_Estructuras',
    'Estructuras_por_Metro',
    'Tipo_Dominante',
    'Dip_Promedio_grados',
    'Dip_Direction_Promedio_grados'
  ]

  const rows = drillHoles.map(dh => {
    const allStructures = dh.scenes.flatMap(scene => scene.structures)
    const structureCount = allStructures.length
    const structuresPerMeter = dh.totalDepth > 0 ? structureCount / dh.totalDepth : 0
    
    // Find dominant structure type
    const typeCounts = allStructures.reduce((acc, s) => {
      acc[s.structureType] = (acc[s.structureType] || 0) + 1
      return acc
    }, {} as Record<string, number>)
    
    const dominantType = Object.entries(typeCounts)
      .sort(([,a], [,b]) => b - a)[0]?.[0] || 'N/A'
    
    // Calculate average dip and dip direction
    const avgDip = allStructures.length > 0 
      ? allStructures.reduce((sum, s) => sum + s.dipReal, 0) / allStructures.length 
      : 0
    
    const avgDipDirection = allStructures.length > 0 
      ? allStructures.reduce((sum, s) => sum + s.dipDirection, 0) / allStructures.length 
      : 0

    const project = projects.find(p => p.drillHoles.some(d => d.id === dh.id))

    return [
      project?.name || 'N/A',
      dh.name,
      dh.totalDepth.toFixed(2),
      dh.info.azimuth.toFixed(2),
      dh.info.dip.toFixed(2),
      dh.info.utmEast.toFixed(2),
      dh.info.utmNorth.toFixed(2),
      dh.info.elevation.toFixed(2),
      structureCount,
      structuresPerMeter.toFixed(2),
      dominantType,
      avgDip.toFixed(2),
      avgDipDirection.toFixed(2)
    ]
  })

  return [headers.join(','), ...rows.map(row => row.join(','))].join('\n')
}

/**
 * Validate drill hole data for multi-drillhole analysis
 */
export function validateDrillHoleData(drillHoles: DrillHole[]): {
  isValid: boolean
  errors: string[]
  warnings: string[]
} {
  const errors: string[] = []
  const warnings: string[] = []

  if (drillHoles.length === 0) {
    errors.push('No hay sondajes para analizar')
    return { isValid: false, errors, warnings }
  }

  drillHoles.forEach((dh, index) => {
    // Check for missing coordinate data
    if (dh.info.utmEast === 0 && dh.info.utmNorth === 0) {
      warnings.push(`Sondaje ${dh.name}: Coordenadas UTM en (0,0) - verificar datos`)
    }

    // Check for unrealistic depths
    if (dh.totalDepth <= 0) {
      errors.push(`Sondaje ${dh.name}: Profundidad inválida (${dh.totalDepth}m)`)
    }

    if (dh.totalDepth > 2000) {
      warnings.push(`Sondaje ${dh.name}: Profundidad muy alta (${dh.totalDepth}m) - verificar datos`)
    }

    // Check for missing structures
    const totalStructures = dh.scenes.reduce((sum, scene) => sum + scene.structures.length, 0)
    if (totalStructures === 0) {
      warnings.push(`Sondaje ${dh.name}: No tiene estructuras registradas`)
    }

    // Check for invalid azimuth/dip values
    if (dh.info.azimuth < 0 || dh.info.azimuth >= 360) {
      errors.push(`Sondaje ${dh.name}: Azimuth inválido (${dh.info.azimuth}°)`)
    }

    if (Math.abs(dh.info.dip) > 90) {
      errors.push(`Sondaje ${dh.name}: Dip inválido (${dh.info.dip}°)`)
    }
  })

  // Check for duplicate drill hole names
  const names = drillHoles.map(dh => dh.name)
  const duplicates = names.filter((name, index) => names.indexOf(name) !== index)
  if (duplicates.length > 0) {
    warnings.push(`Nombres de sondajes duplicados: ${duplicates.join(', ')}`)
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings
  }
}
