/**
 * CSV Parser for GeoStXR Data
 * Parses CSV files exported from GEOSTXR PWA
 */

import Papa from 'papaparse'
import type { CSVImportData, DrillHoleInfo, Structure } from '@/types/geostxr-data'

export function parseGeoStXRCSV(csvContent: string): CSVImportData | null {
  try {
    const lines = csvContent.split('\n')
    
    // Extract metadata from header comments (lines starting with #)
    const metadata: Record<string, string> = {}
    const metadataLines = lines.filter(line => line.startsWith('#'))
    
    metadataLines.forEach(line => {
      const cleanLine = line.substring(1).trim()
      const [key, ...valueParts] = cleanLine.split(':')
      if (key && valueParts.length > 0) {
        metadata[key.trim()] = valueParts.join(':').trim()
      }
    })
    
    console.log('📊 Metadata extracted:', metadata)
    
    // Extract timestamp from Fecha field
    const fechaStr = metadata['Fecha'] || ''
    const timestamp = fechaStr || new Date().toISOString()
    
    // Extract manual depth (format: "15.00 cm (0.15 m)")
    const profundidadStr = metadata['Profundidad Manual'] || '0'
    const manualDepthMatch = profundidadStr.match(/(\d+\.?\d*)\s*cm/)
    const manualDepth = manualDepthMatch ? parseFloat(manualDepthMatch[1]) : 0
    
    // Extract drill hole info (with defaults if not present)
    const drillHoleInfo: DrillHoleInfo = {
      holeName: metadata['Sondaje'] || 'Unnamed Drill Hole',
      azimuth: parseFloat(metadata['Azimut Sondaje'] || '0'),
      dip: parseFloat(metadata['Inclinacion Sondaje'] || '-90'),
      utmEast: parseFloat(metadata['UTM Este Collar'] || '0'),
      utmNorth: parseFloat(metadata['UTM Norte Collar'] || '0'),
      elevation: parseFloat(metadata['Elevacion Collar'] || '0')
    }
    
    // Parse structures from CSV data rows
    const dataLines = lines.filter(line => !line.startsWith('#') && line.trim().length > 0)
    const csvData = Papa.parse(dataLines.join('\n'), {
      header: true,
      skipEmptyLines: true,
      dynamicTyping: true
    })
    
    console.log('📋 CSV data parsed:', csvData.data)
    
    const structures: Structure[] = (csvData.data as any[]).map((row, index) => {
      // Try both column name formats
      const structureType = row['Tipo'] || row['Tipo_Estructura'] || 'Unknown'
      const depth = parseFloat(row['Profundidad_cm'] || '0')
      const alpha = parseFloat(row['Alpha_grados'] || '0')
      const beta = parseFloat(row['Beta_grados'] || '0')
      const azimuth = parseFloat(row['Azimuth_grados'] || '0')
      
      // Generate color based on structure type
      const color = getStructureColor(structureType)
      
      // Extract 3D points captured from Android app
      const p1 = {
        x: parseFloat(row['P1_X'] || '0'),
        y: parseFloat(row['P1_Y'] || '0'),
        z: parseFloat(row['P1_Z'] || '0')
      }
      const p2 = {
        x: parseFloat(row['P2_X'] || '0'),
        y: parseFloat(row['P2_Y'] || '0'),
        z: parseFloat(row['P2_Z'] || '0')
      }
      const p3 = {
        x: parseFloat(row['P3_X'] || '0'),
        y: parseFloat(row['P3_Y'] || '0'),
        z: parseFloat(row['P3_Z'] || '0')
      }
      
      return {
        id: `structure-${index}`,
        structureType,
        depth,
        alpha,
        beta,
        ac: azimuth, // Using Azimuth as AC for now
        dipReal: parseFloat(row['Dip_Real_grados'] || '0'),
        dipDirection: parseFloat(row['Dip_Direction_grados'] || azimuth),
        utmEast: parseFloat(row['UTM_Este_m'] || '0'),
        utmNorth: parseFloat(row['UTM_Norte_m'] || '0'),
        elevationMeters: parseFloat(row['Elevacion_m'] || '0'),
        color,
        p1,
        p2,
        p3,
        customData: extractCustomColumns(row)
      }
    })
    
    return {
      drillHoleInfo,
      manualDepth,
      structures,
      timestamp
    }
  } catch (error) {
    console.error('Error parsing CSV:', error)
    return null
  }
}

function getStructureColor(structureType: string): string {
  const colors: Record<string, string> = {
    'manual': '#ef4444', // red
    'fractura': '#3b82f6', // blue
    'veta': '#22c55e', // green
    'falla': '#f59e0b', // amber
    'contacto': '#8b5cf6', // violet
    'foliacion': '#ec4899', // pink
    'default': '#888888' // gray
  }
  
  const type = structureType.toLowerCase()
  return colors[type] || colors['default']
}

function extractCustomColumns(row: any): Record<string, string> {
  const standardColumns = [
    'Plano', 'Tipo', 'Tipo_Estructura', 'Profundidad_cm', 'Profundidad_m',
    'Alpha_grados', 'Beta_grados', 'Azimuth_grados', 'BOH_Referencia',
    'AC_grados', 'Dip_Real_grados', 'Dip_Direction_grados', 
    'UTM_Este_m', 'UTM_Norte_m', 'Elevacion_m',
    'P1_X', 'P1_Y', 'P1_Z', 'P2_X', 'P2_Y', 'P2_Z', 'P3_X', 'P3_Y', 'P3_Z'
  ]
  
  const customData: Record<string, string> = {}
  
  Object.keys(row).forEach(key => {
    if (!standardColumns.includes(key) && row[key] !== null && row[key] !== undefined) {
      customData[key] = String(row[key])
    }
  })
  
  return customData
}

export function validateCSVFormat(csvContent: string): boolean {
  // Basic validation
  if (!csvContent || csvContent.trim().length === 0) {
    return false
  }
  
  // Check for GeoStXR header
  if (!csvContent.includes('REPORTE DE MEDICIÓN ESTRUCTURAL') && 
      !csvContent.includes('GeoStXR')) {
    return false
  }
  
  // Check for required headers
  const requiredHeaders = ['Profundidad_cm', 'Alpha_grados', 'Beta_grados']
  const hasRequiredHeaders = requiredHeaders.every(header => 
    csvContent.includes(header)
  )
  
  return hasRequiredHeaders
}


