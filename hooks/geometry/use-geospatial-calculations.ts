'use client'

import { useMemo } from 'react'
import { 
  calculateRealOrientation, 
  calculateSpatialCoordinates,
  RealOrientation,
  SpatialCoordinates
} from '@/lib/geospatial-transforms'
import { DrillHoleInfo } from '@/hooks/use-drill-hole-info'

/**
 * Extended plane information with geospatial data
 */
export interface GeospatialPlaneData {
  planeId: string
  trioId: string
  
  // Local measurements (on cylinder)
  alpha: number           // Dip angle in cylinder
  beta: number            // Angle vs BOH
  azimuthLocal: number    // Azimuth in cylinder frame
  depthCm: number         // Depth along hole (cm)
  
  // Real-world orientation
  realOrientation: RealOrientation | null
  
  // Real-world coordinates
  spatialCoords: SpatialCoordinates | null
  
  // BOH reference
  bohAngle: number
  bohNumber: 1 | 2
}

/**
 * Hook to calculate geospatial data for all planes
 * 
 * @param trios - Array of point trios
 * @param planes - Array of calculated planes
 * @param drillHoleInfo - Drill hole collar and orientation info
 * @param bohAngles - Current BOH line angles
 * @param cylinderRadius - Cylinder radius (cm)
 * @returns Array of planes with geospatial data
 */
export function useGeospatialCalculations(
  trios: any[],
  planes: any[],
  drillHoleInfo: DrillHoleInfo | null,
  bohAngles: { line1: number; line2: number },
  cylinderRadius: number = 3.0
): GeospatialPlaneData[] {
  
  return useMemo(() => {
    // If no drill hole info, return empty calculations
    if (!drillHoleInfo || !drillHoleInfo.holeName) {
      console.log('⚠️ No drill hole info available - geospatial calculations disabled')
      return planes.map((plane: any) => {
        const trio = trios.find((t: any) => t.id === plane.trioId)
        return {
          planeId: plane.id,
          trioId: plane.trioId,
          alpha: plane.angles?.alpha || 0,
          beta: plane.angles?.beta || 0,
          azimuthLocal: plane.angles?.azimuth || 0,
          depthCm: trio?.depth || 0,
          realOrientation: null,
          spatialCoords: null,
          bohAngle: 0,
          bohNumber: 1
        }
      })
    }
    
    console.log('🌍 ===== GEOSPATIAL CALCULATIONS START =====')
    console.log(`Drill Hole: ${drillHoleInfo.holeName}`)
    console.log(`  Az: ${drillHoleInfo.azimuth.toFixed(2)}°, Dip: ${drillHoleInfo.dip.toFixed(2)}°`)
    console.log(`  Collar: E=${drillHoleInfo.utmEast.toFixed(2)}m, N=${drillHoleInfo.utmNorth.toFixed(2)}m, Z=${drillHoleInfo.elevation.toFixed(2)}m`)
    console.log(`Total planes: ${planes.length}`)
    console.log('')
    
    const geospatialData: GeospatialPlaneData[] = planes.map((plane: any, index: number) => {
      const trio = trios.find((t: any) => t.id === plane.trioId)
      
      if (!plane.angles || !trio || !trio.depth) {
        console.warn(`⚠️ Plane ${plane.id}: Missing data, skipping`)
        return {
          planeId: plane.id,
          trioId: plane.trioId,
          alpha: 0,
          beta: 0,
          azimuthLocal: 0,
          depthCm: 0,
          realOrientation: null,
          spatialCoords: null,
          bohAngle: 0,
          bohNumber: 1
        }
      }
      
      const alpha = plane.angles.alpha
      const beta = plane.angles.beta
      const azimuthLocal = plane.angles.azimuth
      const depthCm = trio.depth
      
      // Determine which BOH this plane corresponds to
      const bohNumber = depthCm < 15 ? 1 : 2
      const bohAngle = bohNumber === 1 ? bohAngles.line1 : bohAngles.line2
      
      console.log(`\n--- Plane ${index + 1} (${plane.id}) ---`)
      console.log(`  Depth: ${depthCm.toFixed(2)} cm (${(depthCm/100).toFixed(4)} m)`)
      console.log(`  Local: α=${alpha.toFixed(2)}°, β=${beta.toFixed(2)}°, Az=${azimuthLocal.toFixed(2)}°`)
      console.log(`  BOH${bohNumber}: ${bohAngle.toFixed(1)}°`)
      
      // Calculate real-world orientation
      const realOrientation = calculateRealOrientation(
        alpha,
        beta,
        bohAngle,
        drillHoleInfo.azimuth,
        drillHoleInfo.dip,
        cylinderRadius
      )
      
      // Calculate spatial coordinates
      const depthMeters = depthCm / 100 // Convert cm to meters
      const spatialCoords = calculateSpatialCoordinates(
        drillHoleInfo.utmEast,
        drillHoleInfo.utmNorth,
        drillHoleInfo.elevation,
        depthMeters,
        drillHoleInfo.azimuth,
        drillHoleInfo.dip
      )
      
      return {
        planeId: plane.id,
        trioId: plane.trioId,
        alpha,
        beta,
        azimuthLocal,
        depthCm,
        realOrientation,
        spatialCoords,
        bohAngle,
        bohNumber: bohNumber as 1 | 2
      }
    })
    
    console.log('\n🌍 ===== GEOSPATIAL CALCULATIONS END =====\n')
    
    return geospatialData
    
  }, [trios, planes, drillHoleInfo, bohAngles, cylinderRadius])
}

/**
 * Get geospatial data for a specific plane
 */
export function getGeospatialDataForPlane(
  geospatialData: GeospatialPlaneData[],
  planeId: string
): GeospatialPlaneData | null {
  return geospatialData.find(data => data.planeId === planeId) || null
}

/**
 * Check if geospatial calculations are available
 */
export function hasGeospatialData(data: GeospatialPlaneData): boolean {
  return data.realOrientation !== null && data.spatialCoords !== null
}

