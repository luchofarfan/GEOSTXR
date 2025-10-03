/**
 * Generate CSV report for captured planes
 */

interface Point3D {
  x: number
  y: number
  z: number
  id: string
}

interface PointTrio {
  id: string
  points: Point3D[]
  color: string
  depth?: number
}

interface PlaneAngles {
  alpha: number
  beta: number
  azimuth: number
}

interface Plane {
  id: string
  trioId: string
  angles: PlaneAngles
}

interface DrillHoleInfo {
  holeName: string
  azimuth: number // Azimut del sondaje (grados)
  dip: number // Inclinación del sondaje (grados)
  utmEast: number // Coordenada Este UTM (metros)
  utmNorth: number // Coordenada Norte UTM (metros)
  elevation: number // Cota (m.s.n.m.)
}

interface ReportMetadata {
  timestamp: string
  manualDepth: number // Profundidad manual del primer trío
  acAngle?: number // Ángulo de Calce
  bohAngles: {
    line1: number
    line2: number
  }
  totalPlanes: number
  customColumns?: Array<{ id: string; header: string }>
  customValues?: Record<string, Record<string, string>> // trioId -> columnId -> value
  drillHoleInfo?: DrillHoleInfo // Información del sondaje
}

export function generateCSVReport(
  trios: PointTrio[],
  planes: Plane[],
  metadata: ReportMetadata
): string {
  const lines: string[] = []
  
  // Header with metadata
  lines.push('# REPORTE DE MEDICIÓN ESTRUCTURAL - GeoStXR')
  lines.push(`# Fecha: ${metadata.timestamp}`)
  lines.push('')
  
  // Drill hole information
  if (metadata.drillHoleInfo) {
    const dh = metadata.drillHoleInfo
    lines.push('# === INFORMACIÓN DEL SONDAJE ===')
    lines.push(`# Sondaje: ${dh.holeName || 'N/E'}`)
    lines.push(`# Azimut: ${dh.azimuth.toFixed(2)}°`)
    lines.push(`# Inclinación: ${dh.dip.toFixed(2)}°`)
    lines.push(`# UTM Este: ${dh.utmEast.toFixed(2)} m`)
    lines.push(`# UTM Norte: ${dh.utmNorth.toFixed(2)} m`)
    lines.push(`# Cota: ${dh.elevation.toFixed(2)} m.s.n.m.`)
    lines.push('')
  }
  
  // Measurement summary
  lines.push('# === RESUMEN DE MEDICIÓN ===')
  lines.push(`# Profundidad Manual: ${metadata.manualDepth.toFixed(2)} cm (${(metadata.manualDepth/100).toFixed(2)} m)`)
  lines.push(`# AC (Ángulo de Calce): ${metadata.acAngle?.toFixed(2) || '0.00'}°`)
  lines.push(`# BOH1: ${metadata.bohAngles.line1.toFixed(1)}°`)
  lines.push(`# BOH2: ${metadata.bohAngles.line2.toFixed(1)}°`)
  lines.push(`# Total de Planos: ${metadata.totalPlanes}`)
  lines.push('')
  
  // CSV Header with custom columns
  const baseHeaders = 'Plano,Tipo_Estructura,Profundidad_cm,Profundidad_m,Tipo_Prof,Alpha_grados,Beta_grados,Azimuth_grados,BOH_Referencia,P1_X,P1_Y,P1_Z,P2_X,P2_Y,P2_Z,P3_X,P3_Y,P3_Z'
  const customHeaders = metadata.customColumns?.map(col => col.header.replace(/,/g, ';')).join(',') || ''
  lines.push(customHeaders ? `${baseHeaders},${customHeaders}` : baseHeaders)
  
  // Data rows
  trios.forEach((trio, index) => {
    const plane = planes.find(p => p.trioId === trio.id)
    if (!plane || !trio.depth) return
    
    const planeNumber = index + 1
    const structureType = (trio as any).structureType || 'No especificado'
    const depthCm = trio.depth.toFixed(2)
    const depthM = (trio.depth / 100).toFixed(2)
    const depthType = index === 0 ? 'manual' : 'automático'
    const alpha = 'N/A'
    const beta = 'N/A'
    const azimuth = 'N/A'
    const bohRef = trio.depth < 15 ? 'BOH1' : 'BOH2'
    
    // Points
    const p1 = trio.points[0] || { x: 0, y: 0, z: 0 }
    const p2 = trio.points[1] || { x: 0, y: 0, z: 0 }
    const p3 = trio.points[2] || { x: 0, y: 0, z: 0 }
    
    const baseRow = [
      planeNumber,
      structureType,
      depthCm,
      depthM,
      depthType,
      alpha,
      beta,
      azimuth,
      bohRef,
      p1.x.toFixed(4),
      p1.y.toFixed(4),
      p1.z.toFixed(4),
      p2.x.toFixed(4),
      p2.y.toFixed(4),
      p2.z.toFixed(4),
      p3.x.toFixed(4),
      p3.y.toFixed(4),
      p3.z.toFixed(4)
    ]
    
    // Add custom column values
    const customValues: string[] = []
    if (metadata.customColumns && metadata.customValues) {
      metadata.customColumns.forEach(col => {
        const value = metadata.customValues?.[trio.id]?.[col.id] || ''
        customValues.push(value.replace(/,/g, ';')) // Replace commas in user input
      })
    }
    
    const row = customValues.length > 0 
      ? [...baseRow, ...customValues].join(',')
      : baseRow.join(',')
    
    lines.push(row)
  })
  
  // Summary statistics
  lines.push('')
  lines.push('# RESUMEN ESTADÍSTICO')
  
  const alphas = planes.filter(p => p.angles).map(p => p.angles.alpha)
  const betas = planes.filter(p => p.angles).map(p => p.angles.beta)
  
  if (alphas.length > 0) {
    const avgAlpha = alphas.reduce((a, b) => a + b, 0) / alphas.length
    const minAlpha = Math.min(...alphas)
    const maxAlpha = Math.max(...alphas)
    
    lines.push(`# Alpha promedio: ${avgAlpha.toFixed(2)}° (min: ${minAlpha.toFixed(2)}°, max: ${maxAlpha.toFixed(2)}°)`)
  }
  
  if (betas.length > 0) {
    const avgBeta = betas.reduce((a, b) => a + b, 0) / betas.length
    const minBeta = Math.min(...betas)
    const maxBeta = Math.max(...betas)
    
    lines.push(`# Beta promedio: ${avgBeta.toFixed(2)}° (min: ${minBeta.toFixed(2)}°, max: ${maxBeta.toFixed(2)}°)`)
  }
  
  return lines.join('\n')
}

/**
 * Download CSV file
 */
export function downloadCSV(csvContent: string, filename: string) {
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
  const link = document.createElement('a')
  const url = URL.createObjectURL(blob)
  
  link.setAttribute('href', url)
  link.setAttribute('download', filename)
  link.style.visibility = 'hidden'
  
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  
  URL.revokeObjectURL(url)
}

/**
 * Download image file
 */
export function downloadImage(imageDataUrl: string, filename: string) {
  const link = document.createElement('a')
  link.setAttribute('href', imageDataUrl)
  link.setAttribute('download', filename)
  link.style.visibility = 'hidden'
  
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}

