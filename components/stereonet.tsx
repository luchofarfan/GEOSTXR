'use client'

import { useMemo, useState } from 'react'
import type { Structure } from '@/types/geostxr-data'
import { Card } from '@/components/ui/card'
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'

interface StereonetProps {
  structures: Structure[]
  width?: number
  height?: number
}

type ProjectionType = 'schmidt' | 'wulff'
type DisplayMode = 'poles' | 'planes' | 'greatCircles'

interface Point2D {
  x: number
  y: number
}

export function Stereonet({ structures, width = 500, height = 500 }: StereonetProps) {
  const [projection, setProjection] = useState<ProjectionType>('schmidt')
  const [displayMode, setDisplayMode] = useState<DisplayMode>('poles')
  const [showGrid, setShowGrid] = useState(true)
  const [colorByType, setColorByType] = useState(true)
  
  const radius = Math.min(width, height) / 2 - 40
  const centerX = width / 2
  const centerY = height / 2
  
  // Calcular proyecciones estereográficas
  const projectedData = useMemo(() => {
    return structures.map(structure => {
      const dip = Math.abs(structure.dipReal)
      const dipDirection = structure.dipDirection
      
      let point: Point2D
      
      if (displayMode === 'poles') {
        // Proyectar polo (normal al plano)
        point = projectPole(dip, dipDirection, projection, radius)
      } else {
        // Para planos y great circles, necesitamos múltiples puntos
        point = projectPole(dip, dipDirection, projection, radius)
      }
      
      return {
        ...structure,
        projected: point,
        greatCircle: displayMode === 'greatCircles' 
          ? calculateGreatCircle(dip, dipDirection, projection, radius)
          : null
      }
    })
  }, [structures, displayMode, projection, radius])
  
  // Generar grid de la red estereográfica
  const gridLines = useMemo(() => {
    const lines: string[] = []
    
    // Círculos concéntricos (cada 10°)
    for (let angle = 10; angle <= 80; angle += 10) {
      const r = projectAngle(angle, projection, radius)
      const circle = `M ${centerX + r},${centerY} A ${r},${r} 0 1,0 ${centerX - r},${centerY} A ${r},${r} 0 1,0 ${centerX + r},${centerY}`
      lines.push(circle)
    }
    
    // Líneas radiales (cada 10°)
    for (let azimuth = 0; azimuth < 360; azimuth += 10) {
      const rad = (azimuth * Math.PI) / 180
      const x2 = centerX + radius * Math.sin(rad)
      const y2 = centerY - radius * Math.cos(rad)
      lines.push(`M ${centerX},${centerY} L ${x2},${y2}`)
    }
    
    return lines
  }, [projection, radius, centerX, centerY])
  
  // Agrupar por tipo de estructura
  const structuresByType = useMemo(() => {
    const groups = new Map<string, typeof projectedData>()
    projectedData.forEach(s => {
      if (!groups.has(s.structureType)) {
        groups.set(s.structureType, [])
      }
      groups.get(s.structureType)!.push(s)
    })
    return groups
  }, [projectedData])
  
  return (
    <Card className="bg-white/10 backdrop-blur-lg border-white/20 p-6">
      <div className="space-y-4">
        {/* Header y controles */}
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-bold text-white">Red Estereográfica</h3>
          
          <div className="flex gap-4 items-center">
            {/* Tipo de proyección */}
            <div className="flex items-center gap-2">
              <Label className="text-white text-sm">Proyección:</Label>
              <Select value={projection} onValueChange={(v) => setProjection(v as ProjectionType)}>
                <SelectTrigger className="w-32 bg-white/10 border-white/20 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="schmidt">Schmidt</SelectItem>
                  <SelectItem value="wulff">Wulff</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            {/* Modo de visualización */}
            <div className="flex items-center gap-2">
              <Label className="text-white text-sm">Mostrar:</Label>
              <Select value={displayMode} onValueChange={(v) => setDisplayMode(v as DisplayMode)}>
                <SelectTrigger className="w-40 bg-white/10 border-white/20 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="poles">Polos</SelectItem>
                  <SelectItem value="planes">Planos</SelectItem>
                  <SelectItem value="greatCircles">Gran Círculo</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
        
        {/* Opciones adicionales */}
        <div className="flex gap-6 text-sm">
          <div className="flex items-center gap-2">
            <Switch 
              id="grid" 
              checked={showGrid} 
              onCheckedChange={setShowGrid}
            />
            <Label htmlFor="grid" className="text-white cursor-pointer">
              Mostrar Grid
            </Label>
          </div>
          
          <div className="flex items-center gap-2">
            <Switch 
              id="color" 
              checked={colorByType} 
              onCheckedChange={setColorByType}
            />
            <Label htmlFor="color" className="text-white cursor-pointer">
              Color por Tipo
            </Label>
          </div>
        </div>
        
        {/* SVG Stereonet */}
        <div className="bg-white rounded-lg p-4">
          <svg width={width} height={height} className="mx-auto">
            {/* Círculo exterior (primitivo) */}
            <circle
              cx={centerX}
              cy={centerY}
              r={radius}
              fill="white"
              stroke="#333"
              strokeWidth="2"
            />
            
            {/* Grid */}
            {showGrid && gridLines.map((path, i) => (
              <path
                key={i}
                d={path}
                fill="none"
                stroke="#ddd"
                strokeWidth="0.5"
              />
            ))}
            
            {/* Marcadores cardinales */}
            <text x={centerX} y={centerY - radius - 10} textAnchor="middle" fill="#333" fontSize="14" fontWeight="bold">N</text>
            <text x={centerX + radius + 15} y={centerY + 5} textAnchor="start" fill="#333" fontSize="14" fontWeight="bold">E</text>
            <text x={centerX} y={centerY + radius + 20} textAnchor="middle" fill="#333" fontSize="14" fontWeight="bold">S</text>
            <text x={centerX - radius - 15} y={centerY + 5} textAnchor="end" fill="#333" fontSize="14" fontWeight="bold">W</text>
            
            {/* Great Circles (si está activado) */}
            {displayMode === 'greatCircles' && projectedData.map((structure, i) => 
              structure.greatCircle && (
                <path
                  key={`gc-${i}`}
                  d={structure.greatCircle}
                  fill="none"
                  stroke={colorByType ? structure.color : '#3b82f6'}
                  strokeWidth="1.5"
                  opacity="0.6"
                />
              )
            )}
            
            {/* Polos o Planos */}
            {displayMode !== 'greatCircles' && Array.from(structuresByType.entries()).map(([type, structuresGroup]) => (
              <g key={type}>
                {structuresGroup.map((structure, i) => {
                  const x = centerX + structure.projected.x
                  const y = centerY - structure.projected.y // Invertir Y para coordenadas SVG
                  
                  // Verificar que el punto está dentro del círculo
                  const distFromCenter = Math.sqrt(structure.projected.x ** 2 + structure.projected.y ** 2)
                  if (distFromCenter > radius) return null
                  
                  return (
                    <circle
                      key={`${type}-${i}`}
                      cx={x}
                      cy={y}
                      r={4}
                      fill={colorByType ? structure.color : '#3b82f6'}
                      stroke="white"
                      strokeWidth="1"
                      opacity="0.8"
                    >
                      <title>
                        {`${structure.structureType}\nDip: ${structure.dipReal.toFixed(1)}°\nDip Dir: ${structure.dipDirection.toFixed(1)}°`}
                      </title>
                    </circle>
                  )
                })}
              </g>
            ))}
          </svg>
        </div>
        
        {/* Leyenda */}
        {colorByType && (
          <div className="flex flex-wrap gap-3 text-sm">
            {Array.from(structuresByType.entries()).map(([type, structuresGroup]) => (
              <div key={type} className="flex items-center gap-2">
                <div 
                  className="w-4 h-4 rounded-full border-2 border-white"
                  style={{ backgroundColor: structuresGroup[0].color }}
                />
                <span className="text-white">
                  {type} ({structuresGroup.length})
                </span>
              </div>
            ))}
          </div>
        )}
        
        {/* Info */}
        <div className="text-xs text-gray-400 space-y-1">
          <p>
            <strong>Proyección {projection === 'schmidt' ? 'Schmidt (Equal Area)' : 'Wulff (Equal Angle)'}:</strong>
            {' '}{projection === 'schmidt' 
              ? 'Preserva áreas, ideal para análisis estadístico'
              : 'Preserva ángulos, ideal para visualización de orientaciones'}
          </p>
          <p>
            <strong>Total de estructuras:</strong> {structures.length}
          </p>
        </div>
      </div>
    </Card>
  )
}

// Funciones de proyección estereográfica

function projectPole(
  dip: number, 
  dipDirection: number, 
  projection: ProjectionType, 
  radius: number
): Point2D {
  // Convertir a radianes
  const dipRad = (dip * Math.PI) / 180
  const dipDirRad = (dipDirection * Math.PI) / 180
  
  // Calcular el ángulo desde el centro (plunge)
  const plunge = 90 - dip
  const plungeRad = (plunge * Math.PI) / 180
  
  // Calcular distancia radial según proyección
  let r: number
  if (projection === 'schmidt') {
    // Equal Area (Schmidt-Lambert)
    r = radius * Math.sqrt(2) * Math.sin(plungeRad / 2)
  } else {
    // Equal Angle (Wulff)
    r = radius * Math.tan(plungeRad / 2)
  }
  
  // Calcular coordenadas X, Y
  const x = r * Math.sin(dipDirRad)
  const y = r * Math.cos(dipDirRad)
  
  return { x, y }
}

function calculateGreatCircle(
  dip: number,
  dipDirection: number,
  projection: ProjectionType,
  radius: number
): string {
  const points: Point2D[] = []
  const numPoints = 100
  
  // Generar puntos a lo largo del gran círculo
  for (let i = 0; i <= numPoints; i++) {
    const angle = (i / numPoints) * 360
    
    // Calcular la orientación del punto en el gran círculo
    const { x, y } = calculateGreatCirclePoint(dip, dipDirection, angle, projection, radius)
    points.push({ x, y })
  }
  
  // Construir path SVG
  if (points.length === 0) return ''
  
  let path = `M ${points[0].x},${-points[0].y}`
  for (let i = 1; i < points.length; i++) {
    path += ` L ${points[i].x},${-points[i].y}`
  }
  
  return path
}

function calculateGreatCirclePoint(
  dip: number,
  dipDirection: number,
  angle: number,
  projection: ProjectionType,
  radius: number
): Point2D {
  // Simplificación: proyectar el círculo como una serie de polos
  // En una implementación completa, esto requiere geometría esférica más compleja
  const dipRad = (dip * Math.PI) / 180
  const dipDirRad = (dipDirection * Math.PI) / 180
  const angleRad = (angle * Math.PI) / 180
  
  // Calcular coordenadas en la esfera
  const x = Math.cos(angleRad) * Math.cos(dipRad)
  const y = Math.sin(angleRad) * Math.cos(dipRad)
  const z = Math.sin(dipRad)
  
  // Proyectar a 2D
  const plunge = Math.asin(z)
  const trend = Math.atan2(y, x) + dipDirRad
  
  let r: number
  if (projection === 'schmidt') {
    r = radius * Math.sqrt(2) * Math.sin((Math.PI / 2 - plunge) / 2)
  } else {
    r = radius * Math.tan((Math.PI / 2 - plunge) / 2)
  }
  
  return {
    x: r * Math.sin(trend),
    y: r * Math.cos(trend)
  }
}

function projectAngle(angle: number, projection: ProjectionType, radius: number): number {
  const angleRad = (angle * Math.PI) / 180
  
  if (projection === 'schmidt') {
    return radius * Math.sqrt(2) * Math.sin(angleRad / 2)
  } else {
    return radius * Math.tan(angleRad / 2)
  }
}

