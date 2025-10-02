import { useMemo } from 'react'
import type { Project, DrillHole, Structure } from '@/types/geostxr-data'

export interface StatisticsData {
  // General
  totalStructures: number
  totalDrillHoles: number
  totalMeters: number
  
  // Por tipo de estructura
  structuresByType: {
    type: string
    count: number
    percentage: number
    avgDepth: number
    avgDip: number
    avgDipDirection: number
  }[]
  
  // Distribución de orientaciones
  alphaDistribution: { range: string; count: number }[]
  betaDistribution: { range: string; count: number }[]
  dipDistribution: { range: string; count: number }[]
  dipDirectionDistribution: { range: string; count: number }[]
  
  // Distribución por profundidad
  depthDistribution: { 
    range: string
    count: number
    types: Record<string, number>
  }[]
  
  // Frecuencia de estructuras
  structuresPerMeter: number
  
  // Rangos
  alphaRange: { min: number; max: number; avg: number }
  betaRange: { min: number; max: number; avg: number }
  dipRange: { min: number; max: number; avg: number }
  dipDirectionRange: { min: number; max: number; avg: number }
  
  // Por sondaje
  drillHoleStats: {
    id: string
    name: string
    structureCount: number
    depth: number
    structuresPerMeter: number
    dominantTypes: { type: string; count: number }[]
  }[]
}

export function useStatistics(projects: Project[]): StatisticsData {
  return useMemo(() => {
    // Recopilar todas las estructuras
    const allStructures: Structure[] = []
    const drillHoles: DrillHole[] = []
    
    projects.forEach(project => {
      project.drillHoles.forEach(dh => {
        drillHoles.push(dh)
        dh.scenes.forEach(scene => {
          allStructures.push(...scene.structures)
        })
      })
    })
    
    const totalStructures = allStructures.length
    const totalDrillHoles = drillHoles.length
    const totalMeters = drillHoles.reduce((sum, dh) => sum + dh.totalDepth, 0)
    
    // Estadísticas por tipo de estructura
    const typeGroups = new Map<string, Structure[]>()
    allStructures.forEach(s => {
      if (!typeGroups.has(s.structureType)) {
        typeGroups.set(s.structureType, [])
      }
      typeGroups.get(s.structureType)!.push(s)
    })
    
    const structuresByType = Array.from(typeGroups.entries()).map(([type, structures]) => {
      const count = structures.length
      const percentage = (count / totalStructures) * 100
      const avgDepth = structures.reduce((sum, s) => sum + s.depth, 0) / count
      const avgDip = structures.reduce((sum, s) => sum + s.dipReal, 0) / count
      const avgDipDirection = structures.reduce((sum, s) => sum + s.dipDirection, 0) / count
      
      return { type, count, percentage, avgDepth, avgDip, avgDipDirection }
    }).sort((a, b) => b.count - a.count)
    
    // Función helper para crear distribuciones
    const createDistribution = (
      values: number[],
      binSize: number,
      min: number = 0,
      max: number = 360
    ) => {
      const bins = new Map<string, number>()
      const numBins = Math.ceil((max - min) / binSize)
      
      for (let i = 0; i < numBins; i++) {
        const start = min + i * binSize
        const end = start + binSize
        const range = `${start.toFixed(0)}-${end.toFixed(0)}°`
        bins.set(range, 0)
      }
      
      values.forEach(value => {
        const binIndex = Math.floor((value - min) / binSize)
        const start = min + binIndex * binSize
        const end = start + binSize
        const range = `${start.toFixed(0)}-${end.toFixed(0)}°`
        bins.set(range, (bins.get(range) || 0) + 1)
      })
      
      return Array.from(bins.entries()).map(([range, count]) => ({ range, count }))
    }
    
    // Distribuciones de orientaciones
    const alphaValues = allStructures.map(s => s.alpha)
    const betaValues = allStructures.map(s => s.beta)
    const dipValues = allStructures.map(s => Math.abs(s.dipReal))
    const dipDirectionValues = allStructures.map(s => s.dipDirection)
    
    const alphaDistribution = createDistribution(alphaValues, 5, 0, 90)
    const betaDistribution = createDistribution(betaValues, 20, 0, 360)
    const dipDistribution = createDistribution(dipValues, 10, 0, 90)
    const dipDirectionDistribution = createDistribution(dipDirectionValues, 30, 0, 360)
    
    // Distribución por profundidad
    const depthBinSize = 50 // metros
    const maxDepth = Math.max(...allStructures.map(s => s.depth / 100)) // convertir cm a m
    const numDepthBins = Math.ceil(maxDepth / depthBinSize)
    
    const depthBins = Array.from({ length: numDepthBins }, (_, i) => {
      const start = i * depthBinSize
      const end = start + depthBinSize
      return {
        range: `${start}-${end}m`,
        count: 0,
        types: {} as Record<string, number>
      }
    })
    
    allStructures.forEach(s => {
      const depthM = s.depth / 100
      const binIndex = Math.floor(depthM / depthBinSize)
      if (binIndex < depthBins.length) {
        depthBins[binIndex].count++
        const type = s.structureType
        depthBins[binIndex].types[type] = (depthBins[binIndex].types[type] || 0) + 1
      }
    })
    
    const depthDistribution = depthBins.filter(bin => bin.count > 0)
    
    // Rangos estadísticos
    const calcRange = (values: number[]) => {
      if (values.length === 0) return { min: 0, max: 0, avg: 0 }
      return {
        min: Math.min(...values),
        max: Math.max(...values),
        avg: values.reduce((a, b) => a + b, 0) / values.length
      }
    }
    
    const alphaRange = calcRange(alphaValues)
    const betaRange = calcRange(betaValues)
    const dipRange = calcRange(dipValues)
    const dipDirectionRange = calcRange(dipDirectionValues)
    
    // Frecuencia de estructuras
    const structuresPerMeter = totalMeters > 0 ? totalStructures / totalMeters : 0
    
    // Estadísticas por sondaje
    const drillHoleStats = drillHoles.map(dh => {
      const structures = dh.scenes.flatMap(s => s.structures)
      const structureCount = structures.length
      const depth = dh.totalDepth
      const structuresPerMeter = depth > 0 ? structureCount / depth : 0
      
      // Tipos dominantes
      const typeCount = new Map<string, number>()
      structures.forEach(s => {
        typeCount.set(s.structureType, (typeCount.get(s.structureType) || 0) + 1)
      })
      
      const dominantTypes = Array.from(typeCount.entries())
        .map(([type, count]) => ({ type, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 3)
      
      return {
        id: dh.id,
        name: dh.name,
        structureCount,
        depth,
        structuresPerMeter,
        dominantTypes
      }
    })
    
    return {
      totalStructures,
      totalDrillHoles,
      totalMeters,
      structuresByType,
      alphaDistribution,
      betaDistribution,
      dipDistribution,
      dipDirectionDistribution,
      depthDistribution,
      structuresPerMeter,
      alphaRange,
      betaRange,
      dipRange,
      dipDirectionRange,
      drillHoleStats
    }
  }, [projects])
}

