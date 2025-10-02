/**
 * GeoStXR Data Types
 * Type definitions for geological data from GEOSTXR PWA
 */

export interface DrillHoleInfo {
  holeName: string
  azimuth: number // 0-360°
  dip: number // -90 to 90°
  utmEast: number // meters
  utmNorth: number // meters
  elevation: number // meters
}

export interface Point3D {
  x: number
  y: number
  z: number
}

export interface Structure {
  id: string
  structureType: string
  depth: number // cm from collar
  alpha: number // degrees (local angle)
  beta: number // degrees (local angle)
  ac: number // degrees (Ángulo de Calce)
  dipReal: number // degrees (geospatial)
  dipDirection: number // degrees (geospatial)
  utmEast: number // meters
  utmNorth: number // meters
  elevationMeters: number // meters
  color: string // #RRGGBB
  // Captured 3D points from Android app (cylinder coordinates)
  p1?: Point3D
  p2?: Point3D
  p3?: Point3D
  customData?: Record<string, string> // Custom columns
}

export interface Scene {
  id: string
  depthStart: number // cm
  depthEnd: number // cm (depthStart + 30)
  photoUrl?: string // URL to composite image
  capturedAt: Date
  boh1Angle: number
  boh2Angle: number
  acAngle: number
  structures: Structure[]
}

export interface DrillHole {
  id: string
  name: string
  info: DrillHoleInfo
  totalDepth: number // meters
  scenes: Scene[]
  createdAt: Date
}

export interface Project {
  id: string
  name: string
  client?: string
  location?: string
  drillHoles: DrillHole[]
  createdAt: Date
  updatedAt: Date
}

export interface CSVImportData {
  drillHoleInfo: DrillHoleInfo
  manualDepth: number // cm
  structures: Structure[]
  timestamp: string
}


