/**
 * GeoStXR Data Types
 * Type definitions for geological data from GEOSTXR PWA
 */

export interface CoordinateSystem {
  projection: 'UTM' | 'LOCAL' | 'GEOGRAPHIC'
  datum: 'WGS84' | 'SIRGAS2000' | 'PSAD56' | 'NAD83' | 'GDA2020' | 'SAD69' | string
  utmZone?: number  // 1-60
  utmHemisphere?: 'N' | 'S'
  epsgCode?: number  // e.g., 32719 for WGS84 UTM 19S
  description?: string
}

export interface Position3D {
  x: number  // Este (UTM) o X local (meters)
  y: number  // Norte (UTM) o Y local (meters)
  z: number  // Elevación (meters)
  coordinateSystem?: CoordinateSystem
  accuracy?: {
    horizontal: number  // meters
    vertical: number    // meters
  }
}

export interface DrillHoleInfo {
  holeName: string
  azimuth: number // 0-360°
  dip: number // -90 to 90°
  
  // Coordenadas del collar
  utmEast: number // meters
  utmNorth: number // meters
  elevation: number // meters
  
  // Sistema de coordenadas (opcional, por defecto WGS84 UTM)
  coordinateSystem?: CoordinateSystem
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
  
  // Sistema de coordenadas del proyecto
  coordinateSystem?: CoordinateSystem
  
  // Área de cobertura (opcional)
  boundingBox?: {
    minX: number
    maxX: number
    minY: number
    maxY: number
    minZ?: number
    maxZ?: number
  }
}

export interface CSVImportData {
  drillHoleInfo: DrillHoleInfo
  manualDepth: number // cm
  structures: Structure[]
  timestamp: string
}

/**
 * Sistemas de coordenadas predefinidos comunes en minería
 */
export const PREDEFINED_COORDINATE_SYSTEMS: Record<string, CoordinateSystem> = {
  // WGS84 UTM - Global
  WGS84_UTM_19S: {
    projection: 'UTM',
    datum: 'WGS84',
    utmZone: 19,
    utmHemisphere: 'S',
    epsgCode: 32719,
    description: 'WGS84 UTM Zona 19 Sur (Chile Norte, Perú Sur)'
  },
  
  WGS84_UTM_18S: {
    projection: 'UTM',
    datum: 'WGS84',
    utmZone: 18,
    utmHemisphere: 'S',
    epsgCode: 32718,
    description: 'WGS84 UTM Zona 18 Sur (Perú Central)'
  },
  
  WGS84_UTM_20S: {
    projection: 'UTM',
    datum: 'WGS84',
    utmZone: 20,
    utmHemisphere: 'S',
    epsgCode: 32720,
    description: 'WGS84 UTM Zona 20 Sur (Argentina, Brasil)'
  },
  
  // SIRGAS2000 - Sudamérica
  SIRGAS2000_UTM_19S: {
    projection: 'UTM',
    datum: 'SIRGAS2000',
    utmZone: 19,
    utmHemisphere: 'S',
    epsgCode: 31983,
    description: 'SIRGAS2000 UTM Zona 19 Sur (Chile - Oficial)'
  },
  
  SIRGAS2000_UTM_18S: {
    projection: 'UTM',
    datum: 'SIRGAS2000',
    utmZone: 18,
    utmHemisphere: 'S',
    epsgCode: 31982,
    description: 'SIRGAS2000 UTM Zona 18 Sur (Perú - Oficial)'
  },
  
  // PSAD56 - Histórico Sudamérica
  PSAD56_UTM_19S: {
    projection: 'UTM',
    datum: 'PSAD56',
    utmZone: 19,
    utmHemisphere: 'S',
    epsgCode: 24879,
    description: 'PSAD56 UTM Zona 19 Sur (Chile - Histórico)'
  },
  
  // NAD83 - Norteamérica
  NAD83_UTM_12N: {
    projection: 'UTM',
    datum: 'NAD83',
    utmZone: 12,
    utmHemisphere: 'N',
    epsgCode: 26912,
    description: 'NAD83 UTM Zona 12 Norte (Nevada, USA)'
  },
  
  NAD83_UTM_13N: {
    projection: 'UTM',
    datum: 'NAD83',
    utmZone: 13,
    utmHemisphere: 'N',
    epsgCode: 26913,
    description: 'NAD83 UTM Zona 13 Norte (Arizona, USA)'
  },
  
  // GDA2020 - Australia
  GDA2020_UTM_51S: {
    projection: 'UTM',
    datum: 'GDA2020',
    utmZone: 51,
    utmHemisphere: 'S',
    epsgCode: 7851,
    description: 'GDA2020 UTM Zona 51 Sur (Australia Oeste)'
  },
  
  GDA2020_UTM_54S: {
    projection: 'UTM',
    datum: 'GDA2020',
    utmZone: 54,
    utmHemisphere: 'S',
    epsgCode: 7854,
    description: 'GDA2020 UTM Zona 54 Sur (Australia Este)'
  }
}

/**
 * Obtiene el sistema de coordenadas por defecto según la zona geográfica
 */
export function getDefaultCoordinateSystem(longitude: number, latitude: number): CoordinateSystem {
  // Calcular zona UTM
  const utmZone = Math.floor((longitude + 180) / 6) + 1
  const hemisphere = latitude >= 0 ? 'N' : 'S'
  
  // Determinar datum según región
  let datum: string
  let epsgCode: number
  
  if (latitude < 0 && longitude >= -90 && longitude <= -30) {
    // Sudamérica
    datum = 'SIRGAS2000'
    epsgCode = 31900 + Math.abs(utmZone)  // Aproximado
  } else if (latitude >= 0 && longitude >= -180 && longitude <= -60) {
    // Norteamérica
    datum = 'NAD83'
    epsgCode = 26900 + utmZone  // Aproximado
  } else if (latitude < 0 && longitude >= 110 && longitude <= 155) {
    // Australia
    datum = 'GDA2020'
    epsgCode = 7800 + Math.abs(utmZone)  // Aproximado
  } else {
    // Global por defecto
    datum = 'WGS84'
    epsgCode = hemisphere === 'N' ? 32600 + utmZone : 32700 + utmZone
  }
  
  return {
    projection: 'UTM',
    datum,
    utmZone,
    utmHemisphere: hemisphere,
    epsgCode,
    description: `${datum} UTM Zona ${utmZone}${hemisphere}`
  }
}


