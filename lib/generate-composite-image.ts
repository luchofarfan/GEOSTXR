import * as THREE from 'three'

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

interface Plane {
  id: string
  trioId: string
  ellipsePoints: Array<{ x: number; y: number; z: number }>
  color: string
}

interface GenerateCompositeImageParams {
  baseImageDataUrl: string
  trios: PointTrio[]
  planes: Plane[]
  camera: THREE.Camera
  containerWidth: number
  containerHeight: number
  cylinderHeight?: number
  cylinderRadius?: number
  acAngle?: number
  bohAngles?: {
    line1: number
    line2: number
  }
  manualDepth?: number
}

export async function generateCompositeImage({
  baseImageDataUrl,
  trios,
  planes,
  camera,
  containerWidth,
  containerHeight,
  cylinderHeight = 30,
  cylinderRadius = 3.175,
  acAngle = 0,
  bohAngles = { line1: 90, line2: 90 },
  manualDepth = 0
}: GenerateCompositeImageParams): Promise<string> {
  return new Promise((resolve, reject) => {
    // Create canvas
    const canvas = document.createElement('canvas')
    canvas.width = containerWidth
    canvas.height = containerHeight
    const ctx = canvas.getContext('2d')
    
    if (!ctx) {
      reject(new Error('Could not get canvas context'))
      return
    }

    // Load base image
    const img = new Image()
    img.crossOrigin = 'anonymous'
    
    img.onload = () => {
      // Draw base image
      ctx.drawImage(img, 0, 0, containerWidth, containerHeight)
      
      // Function to project 3D point to 2D screen
      const project3DTo2D = (x: number, y: number, z: number) => {
        const vector = new THREE.Vector3(x, y, z)
        vector.project(camera)
        
        return {
          x: (vector.x * 0.5 + 0.5) * containerWidth,
          y: (-vector.y * 0.5 + 0.5) * containerHeight
        }
      }

      // Draw BOH lines
      const bohOffset = 0.1 // cm offset towards camera
      
      // BOH1 (top half: z=0 to z=15) - RED
      const angle1Rad = (bohAngles.line1 * Math.PI) / 180
      const x1_start = cylinderRadius * Math.cos(angle1Rad)
      const y1_start = cylinderRadius * Math.sin(angle1Rad) + bohOffset
      const pos1_start = project3DTo2D(x1_start, y1_start, 0)
      const pos1_end = project3DTo2D(x1_start, y1_start, cylinderHeight / 2)
      
      ctx.strokeStyle = '#FF0000' // RED for BOH1
      ctx.lineWidth = 3
      ctx.shadowColor = 'rgba(0, 0, 0, 0.8)'
      ctx.shadowBlur = 5
      ctx.beginPath()
      ctx.moveTo(pos1_start.x, pos1_start.y)
      ctx.lineTo(pos1_end.x, pos1_end.y)
      ctx.stroke()
      ctx.shadowBlur = 0
      
      // BOH2 (bottom half: z=15 to z=30) - GREEN
      const angle2Rad = (bohAngles.line2 * Math.PI) / 180
      const x2_start = cylinderRadius * Math.cos(angle2Rad)
      const y2_start = cylinderRadius * Math.sin(angle2Rad) + bohOffset
      const pos2_start = project3DTo2D(x2_start, y2_start, cylinderHeight / 2)
      const pos2_end = project3DTo2D(x2_start, y2_start, cylinderHeight)
      
      ctx.strokeStyle = '#00FF00' // GREEN for BOH2
      ctx.lineWidth = 3
      ctx.shadowColor = 'rgba(0, 0, 0, 0.8)'
      ctx.shadowBlur = 5
      ctx.beginPath()
      ctx.moveTo(pos2_start.x, pos2_start.y)
      ctx.lineTo(pos2_end.x, pos2_end.y)
      ctx.stroke()
      ctx.shadowBlur = 0

      // Draw depth ticks (ruler marks)
      const rulerX = -cylinderRadius - 0.4
      const rulerY = 0
      
      for (let zDepth = 0; zDepth <= cylinderHeight; zDepth += 10) {
        const tickPos = project3DTo2D(rulerX, rulerY, zDepth)
        
        // Tick mark
        ctx.fillStyle = '#FFF'
        ctx.fillRect(tickPos.x - 15, tickPos.y - 1.5, 15, 3)
        
        // Label
        ctx.font = 'bold 12px monospace'
        ctx.fillStyle = '#FFF'
        ctx.strokeStyle = 'black'
        ctx.lineWidth = 3
        ctx.shadowColor = 'rgba(0, 0, 0, 0.9)'
        ctx.shadowBlur = 5
        
        ctx.strokeText(`${zDepth} cm`, tickPos.x - 60, tickPos.y + 4)
        ctx.fillText(`${zDepth} cm`, tickPos.x - 60, tickPos.y + 4)
        ctx.shadowBlur = 0
      }

      // Draw ellipses
      planes.forEach((plane) => {
        if (!plane.ellipsePoints || plane.ellipsePoints.length === 0) return
        
        ctx.beginPath()
        ctx.strokeStyle = plane.color
        ctx.lineWidth = 3
        ctx.shadowColor = 'rgba(0, 0, 0, 0.8)'
        ctx.shadowBlur = 10
        
        plane.ellipsePoints.forEach((point, index) => {
          const screenPos = project3DTo2D(point.x, point.y, point.z)
          
          if (index === 0) {
            ctx.moveTo(screenPos.x, screenPos.y)
          } else {
            ctx.lineTo(screenPos.x, screenPos.y)
          }
        })
        
        // Close the ellipse
        if (plane.ellipsePoints.length > 0) {
          const firstPoint = plane.ellipsePoints[0]
          const screenPos = project3DTo2D(firstPoint.x, firstPoint.y, firstPoint.z)
          ctx.lineTo(screenPos.x, screenPos.y)
        }
        
        ctx.stroke()
        ctx.shadowBlur = 0
      })

      // Draw points (smaller, no labels)
      trios.forEach((trio, trioIndex) => {
        trio.points.forEach((point, pointIndex) => {
          const screenPos = project3DTo2D(point.x, point.y, point.z)
          
          // Draw point circle (reduced to 1/4 size: 8 → 2)
          ctx.beginPath()
          ctx.arc(screenPos.x, screenPos.y, 2, 0, Math.PI * 2)
          ctx.fillStyle = trio.color
          ctx.shadowColor = 'rgba(0, 0, 0, 0.8)'
          ctx.shadowBlur = 8
          ctx.fill()
          
          // Draw point border (thinner)
          ctx.strokeStyle = 'white'
          ctx.lineWidth = 1
          ctx.shadowBlur = 0
          ctx.stroke()
        })
      })

      // Draw results table on the right side
      const tableX = containerWidth - 380
      const tableY = 40
      const tableWidth = 360
      const rowHeight = 28
      
      // Table background
      ctx.fillStyle = 'rgba(0, 0, 0, 0.85)'
      const tableHeight = rowHeight * (trios.length + 4) + 60 // +20 for BOH line
      ctx.fillRect(tableX, tableY, tableWidth, tableHeight)
      
      // Table border
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)'
      ctx.lineWidth = 2
      ctx.strokeRect(tableX, tableY, tableWidth, tableHeight)
      
      // Table title
      ctx.font = 'bold 16px sans-serif'
      ctx.fillStyle = '#93c5fd'
      ctx.textAlign = 'left'
      ctx.shadowColor = 'rgba(0, 0, 0, 0.9)'
      ctx.shadowBlur = 4
      ctx.fillText('📊 RESULTADOS DE MEDICIÓN', tableX + 15, tableY + 25)
      
      // Subtitle with timestamp
      ctx.font = '11px sans-serif'
      ctx.fillStyle = '#d1d5db'
      const timestamp = new Date().toLocaleString('es-ES')
      ctx.fillText(timestamp, tableX + 15, tableY + 45)
      
      // Manual depth info
      ctx.font = 'bold 12px sans-serif'
      ctx.fillStyle = '#fbbf24'
      ctx.fillText(`📏 Profundidad Manual: ${manualDepth.toFixed(2)} cm (${(manualDepth/100).toFixed(2)} m)`, tableX + 15, tableY + 68)
      
      // AC Angle
      ctx.font = 'bold 12px sans-serif'
      ctx.fillStyle = '#34d399'
      ctx.fillText(`🔺 AC (Ángulo de Calce): ${acAngle.toFixed(2)}°`, tableX + 15, tableY + 88)
      
      // BOH Angles (MOVED HERE - just below AC)
      ctx.font = 'bold 11px sans-serif'
      ctx.fillStyle = '#ef4444'
      ctx.fillText(`🔴 BOH1: ${bohAngles.line1.toFixed(1)}°`, tableX + 15, tableY + 108)
      ctx.fillStyle = '#10b981'
      ctx.fillText(`🟢 BOH2: ${bohAngles.line2.toFixed(1)}°`, tableX + 130, tableY + 108)
      
      // Table headers
      let currentY = tableY + 135
      ctx.font = 'bold 10px sans-serif'
      ctx.fillStyle = '#93c5fd'
      ctx.fillText('Plano', tableX + 15, currentY)
      ctx.fillText('Tipo', tableX + 55, currentY)
      ctx.fillText('Prof', tableX + 140, currentY)
      ctx.fillText('α(°)', tableX + 190, currentY)
      ctx.fillText('β(°)', tableX + 230, currentY)
      ctx.fillText('Az(°)', tableX + 270, currentY)
      
      // Separator line
      currentY += 5
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)'
      ctx.lineWidth = 1
      ctx.beginPath()
      ctx.moveTo(tableX + 10, currentY)
      ctx.lineTo(tableX + tableWidth - 10, currentY)
      ctx.stroke()
      
      // Table rows - one per trio
      currentY += 15
      ctx.font = '10px sans-serif'
      trios.forEach((trio, index) => {
        const plane = planes.find(p => p.trioId === trio.id)
        if (!plane || !plane.angles || !trio.depth) return
        
        // Row background (alternating)
        if (index % 2 === 0) {
          ctx.fillStyle = 'rgba(255, 255, 255, 0.05)'
          ctx.fillRect(tableX + 5, currentY - 15, tableWidth - 10, rowHeight)
        }
        
        // Color indicator
        ctx.fillStyle = trio.color
        ctx.fillRect(tableX + 12, currentY - 8, 8, 8)
        
        // Data
        ctx.fillStyle = 'white'
        ctx.textAlign = 'left'
        ctx.fillText(`${index + 1}`, tableX + 28, currentY)
        
        // Structure type (abbreviated if too long)
        const structType = trio.structureType || 'N/E'
        const maxTypeLength = 10
        const displayType = structType.length > maxTypeLength 
          ? structType.substring(0, maxTypeLength - 1) + '…' 
          : structType
        ctx.fillText(displayType, tableX + 55, currentY)
        
        ctx.fillText(trio.depth.toFixed(1), tableX + 140, currentY)
        ctx.fillText(plane.angles.alpha.toFixed(1), tableX + 190, currentY)
        ctx.fillText(plane.angles.beta.toFixed(1), tableX + 230, currentY)
        ctx.fillText(plane.angles.azimuth.toFixed(1), tableX + 270, currentY)
        
        currentY += rowHeight
      })
      
      // Footer info
      currentY += 10
      ctx.font = '10px sans-serif'
      ctx.fillStyle = '#9ca3af'
      ctx.textAlign = 'left'
      ctx.fillText(`Total: ${trios.length} plano(s) identificado(s)`, tableX + 15, currentY)
      
      ctx.shadowBlur = 0

      // Convert canvas to data URL
      const compositeImage = canvas.toDataURL('image/jpeg', 0.95)
      resolve(compositeImage)
    }
    
    img.onerror = () => {
      reject(new Error('Failed to load base image'))
    }
    
    img.src = baseImageDataUrl
  })
}

