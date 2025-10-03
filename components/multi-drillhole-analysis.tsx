'use client'

import { useMemo, useState } from 'react'
import type { Project, DrillHole, Structure } from '@/types/geostxr-data'
import { Card } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  BarChart, 
  Bar, 
  PieChart, 
  Pie, 
  Cell,
  LineChart,
  Line,
  ScatterChart,
  Scatter,
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer 
} from 'recharts'

interface MultiDrillHoleAnalysisProps {
  projects: Project[]
}

interface DrillHoleComparison {
  id: string
  name: string
  projectName: string
  totalDepth: number
  structureCount: number
  structuresPerMeter: number
  avgDip: number
  avgDipDirection: number
  dominantStructureType: string
  depthRange: { min: number; max: number }
  coordinateInfo: {
    utmEast: number
    utmNorth: number
    elevation: number
  }
}

interface StructureCorrelation {
  drillHolePair: string
  correlation: number
  commonStructures: number
  distance: number
}

const STRUCTURE_COLORS: Record<string, string> = {
  'Fractura': '#3b82f6',
  'Veta': '#10b981',
  'Falla': '#ef4444',
  'Contacto': '#f59e0b',
  'Diaclasa': '#8b5cf6',
  'default': '#6b7280'
}

export function MultiDrillHoleAnalysis({ projects }: MultiDrillHoleAnalysisProps) {
  const [selectedAnalysis, setSelectedAnalysis] = useState<'comparison' | 'correlation' | 'spatial' | 'statistical'>('comparison')

  // Get all drill holes with enhanced data
  const drillHoleComparisons = useMemo((): DrillHoleComparison[] => {
    const comparisons: DrillHoleComparison[] = []
    
    projects.forEach(project => {
      project.drillHoles.forEach(dh => {
        const allStructures = dh.scenes.flatMap(scene => scene.structures)
        
        // Calculate statistics
        const structureCount = allStructures.length
        const structuresPerMeter = dh.totalDepth > 0 ? structureCount / dh.totalDepth : 0
        
        // Calculate average dip and dip direction
        const avgDip = allStructures.length > 0 
          ? allStructures.reduce((sum, s) => sum + s.dipReal, 0) / allStructures.length 
          : 0
        
        const avgDipDirection = allStructures.length > 0 
          ? allStructures.reduce((sum, s) => sum + s.dipDirection, 0) / allStructures.length 
          : 0
        
        // Find dominant structure type
        const typeCounts = allStructures.reduce((acc, s) => {
          acc[s.structureType] = (acc[s.structureType] || 0) + 1
          return acc
        }, {} as Record<string, number>)
        
        const dominantStructureType = Object.entries(typeCounts)
          .sort(([,a], [,b]) => b - a)[0]?.[0] || 'N/A'
        
        // Calculate depth range
        const depths = allStructures.map(s => s.depth)
        const depthRange = {
          min: depths.length > 0 ? Math.min(...depths) : 0,
          max: depths.length > 0 ? Math.max(...depths) : 0
        }

        comparisons.push({
          id: dh.id,
          name: dh.name,
          projectName: project.name,
          totalDepth: dh.totalDepth,
          structureCount,
          structuresPerMeter,
          avgDip,
          avgDipDirection,
          dominantStructureType,
          depthRange,
          coordinateInfo: {
            utmEast: dh.info.utmEast,
            utmNorth: dh.info.utmNorth,
            elevation: dh.info.elevation
          }
        })
      })
    })
    
    return comparisons.sort((a, b) => a.name.localeCompare(b.name))
  }, [projects])

  // Calculate correlations between drill holes
  const structureCorrelations = useMemo((): StructureCorrelation[] => {
    const correlations: StructureCorrelation[] = []
    const allDrillHoles = projects.flatMap(p => p.drillHoles)
    
    for (let i = 0; i < allDrillHoles.length; i++) {
      for (let j = i + 1; j < allDrillHoles.length; j++) {
        const dh1 = allDrillHoles[i]
        const dh2 = allDrillHoles[j]
        
        // Calculate distance between drill holes
        const distance = Math.sqrt(
          Math.pow(dh1.info.utmEast - dh2.info.utmEast, 2) +
          Math.pow(dh1.info.utmNorth - dh2.info.utmNorth, 2)
        )
        
        // Get structure types for both drill holes
        const types1 = new Set(dh1.scenes.flatMap(s => s.structures.map(st => st.structureType)))
        const types2 = new Set(dh2.scenes.flatMap(s => s.structures.map(st => st.structureType)))
        
        // Calculate correlation (Jaccard similarity)
        const intersection = new Set([...types1].filter(x => types2.has(x)))
        const union = new Set([...types1, ...types2])
        const correlation = union.size > 0 ? intersection.size / union.size : 0
        
        correlations.push({
          drillHolePair: `${dh1.name} - ${dh2.name}`,
          correlation,
          commonStructures: intersection.size,
          distance
        })
      }
    }
    
    return correlations.sort((a, b) => b.correlation - a.correlation)
  }, [projects])

  // Spatial distribution data
  const spatialData = useMemo(() => {
    return drillHoleComparisons.map(dh => ({
      name: dh.name,
      x: dh.coordinateInfo.utmEast,
      y: dh.coordinateInfo.utmNorth,
      z: dh.coordinateInfo.elevation,
      structures: dh.structureCount,
      depth: dh.totalDepth,
      structuresPerMeter: dh.structuresPerMeter,
      dominantType: dh.dominantStructureType
    }))
  }, [drillHoleComparisons])

  // Statistical summary
  const statisticalSummary = useMemo(() => {
    if (drillHoleComparisons.length === 0) return null
    
    const depths = drillHoleComparisons.map(dh => dh.totalDepth)
    const structureCounts = drillHoleComparisons.map(dh => dh.structureCount)
    const structuresPerMeter = drillHoleComparisons.map(dh => dh.structuresPerMeter)
    const avgDips = drillHoleComparisons.map(dh => dh.avgDip)
    
    return {
      totalDrillHoles: drillHoleComparisons.length,
      totalStructures: structureCounts.reduce((sum, count) => sum + count, 0),
      totalDepth: depths.reduce((sum, depth) => sum + depth, 0),
      avgDepth: depths.reduce((sum, depth) => sum + depth, 0) / depths.length,
      avgStructuresPerMeter: structuresPerMeter.reduce((sum, spm) => sum + spm, 0) / structuresPerMeter.length,
      avgDip: avgDips.reduce((sum, dip) => sum + dip, 0) / avgDips.length,
      depthRange: {
        min: Math.min(...depths),
        max: Math.max(...depths)
      },
      structureCountRange: {
        min: Math.min(...structureCounts),
        max: Math.max(...structureCounts)
      }
    }
  }, [drillHoleComparisons])

  if (drillHoleComparisons.length === 0) {
    return (
      <div className="bg-white/5 backdrop-blur-lg rounded-xl p-12 border border-white/10 text-center">
        <div className="text-6xl mb-4">📊</div>
        <h3 className="text-xl font-bold text-white mb-2">
          No hay datos para análisis multi-sondaje
        </h3>
        <p className="text-gray-400">
          Importa múltiples sondajes para realizar análisis comparativos
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-blue-600 to-blue-700 shadow-lg p-6">
          <div className="text-3xl mb-2">🔬</div>
          <div className="text-3xl font-bold text-white mb-1">
            {statisticalSummary?.totalDrillHoles || 0}
          </div>
          <div className="text-sm text-white/80">Sondajes</div>
        </Card>
        
        <Card className="bg-gradient-to-br from-green-600 to-green-700 shadow-lg p-6">
          <div className="text-3xl mb-2">🪨</div>
          <div className="text-3xl font-bold text-white mb-1">
            {statisticalSummary?.totalStructures || 0}
          </div>
          <div className="text-sm text-white/80">Estructuras</div>
        </Card>
        
        <Card className="bg-gradient-to-br from-purple-600 to-purple-700 shadow-lg p-6">
          <div className="text-3xl mb-2">📏</div>
          <div className="text-3xl font-bold text-white mb-1">
            {statisticalSummary?.totalDepth.toFixed(1) || 0}m
          </div>
          <div className="text-sm text-white/80">Metros Totales</div>
        </Card>
        
        <Card className="bg-gradient-to-br from-orange-600 to-orange-700 shadow-lg p-6">
          <div className="text-3xl mb-2">📊</div>
          <div className="text-3xl font-bold text-white mb-1">
            {statisticalSummary?.avgStructuresPerMeter.toFixed(2) || 0}
          </div>
          <div className="text-sm text-white/80">Est/Metro Prom</div>
        </Card>
      </div>

      {/* Analysis Tabs */}
      <Tabs value={selectedAnalysis} onValueChange={(value) => setSelectedAnalysis(value as any)} className="w-full">
        <TabsList className="grid w-full grid-cols-4 bg-white/10">
          <TabsTrigger value="comparison">Comparación</TabsTrigger>
          <TabsTrigger value="correlation">Correlación</TabsTrigger>
          <TabsTrigger value="spatial">Espacial</TabsTrigger>
          <TabsTrigger value="statistical">Estadístico</TabsTrigger>
        </TabsList>

        {/* Comparison Tab */}
        <TabsContent value="comparison" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Drill Hole Comparison Chart */}
            <Card className="bg-white/10 backdrop-blur-lg border-white/20 p-6">
              <h3 className="text-lg font-bold text-white mb-4">
                Estructuras por Sondaje
              </h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={drillHoleComparisons}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                  <XAxis 
                    dataKey="name" 
                    stroke="#9ca3af"
                    tick={{ fill: '#9ca3af', fontSize: 10 }}
                    angle={-45}
                    textAnchor="end"
                    height={80}
                  />
                  <YAxis 
                    stroke="#9ca3af"
                    tick={{ fill: '#9ca3af', fontSize: 12 }}
                  />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'rgba(0,0,0,0.8)', 
                      border: '1px solid rgba(255,255,255,0.2)' 
                    }}
                  />
                  <Bar dataKey="structureCount" fill="#3b82f6" />
                </BarChart>
              </ResponsiveContainer>
            </Card>

            {/* Structures per Meter */}
            <Card className="bg-white/10 backdrop-blur-lg border-white/20 p-6">
              <h3 className="text-lg font-bold text-white mb-4">
                Frecuencia de Estructuras
              </h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={drillHoleComparisons}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                  <XAxis 
                    dataKey="name" 
                    stroke="#9ca3af"
                    tick={{ fill: '#9ca3af', fontSize: 10 }}
                    angle={-45}
                    textAnchor="end"
                    height={80}
                  />
                  <YAxis 
                    stroke="#9ca3af"
                    tick={{ fill: '#9ca3af', fontSize: 12 }}
                  />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'rgba(0,0,0,0.8)', 
                      border: '1px solid rgba(255,255,255,0.2)' 
                    }}
                  />
                  <Bar dataKey="structuresPerMeter" fill="#10b981" />
                </BarChart>
              </ResponsiveContainer>
            </Card>
          </div>

          {/* Detailed Comparison Table */}
          <Card className="bg-white/10 backdrop-blur-lg border-white/20 p-6">
            <h3 className="text-lg font-bold text-white mb-4">
              Tabla Comparativa Detallada
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-white/10 border-b border-white/20">
                  <tr>
                    <th className="px-4 py-3 text-left text-white font-semibold">Sondaje</th>
                    <th className="px-4 py-3 text-left text-white font-semibold">Proyecto</th>
                    <th className="px-4 py-3 text-right text-white font-semibold">Profundidad (m)</th>
                    <th className="px-4 py-3 text-right text-white font-semibold">Estructuras</th>
                    <th className="px-4 py-3 text-right text-white font-semibold">Est/Metro</th>
                    <th className="px-4 py-3 text-right text-white font-semibold">Dip Prom (°)</th>
                    <th className="px-4 py-3 text-right text-white font-semibold">Dip Dir Prom (°)</th>
                    <th className="px-4 py-3 text-left text-white font-semibold">Tipo Dominante</th>
                  </tr>
                </thead>
                <tbody>
                  {drillHoleComparisons.map((dh, idx) => (
                    <tr 
                      key={dh.id}
                      className={`border-b border-white/10 hover:bg-white/5 ${
                        idx % 2 === 0 ? 'bg-white/5' : ''
                      }`}
                    >
                      <td className="px-4 py-3 text-white font-semibold">{dh.name}</td>
                      <td className="px-4 py-3 text-gray-300">{dh.projectName}</td>
                      <td className="px-4 py-3 text-right text-white">{dh.totalDepth.toFixed(1)}</td>
                      <td className="px-4 py-3 text-right text-white">{dh.structureCount}</td>
                      <td className="px-4 py-3 text-right text-white">{dh.structuresPerMeter.toFixed(2)}</td>
                      <td className="px-4 py-3 text-right text-gray-300">{dh.avgDip.toFixed(1)}</td>
                      <td className="px-4 py-3 text-right text-gray-300">{dh.avgDipDirection.toFixed(1)}</td>
                      <td className="px-4 py-3">
                        <Badge 
                          variant="outline" 
                          className="text-xs"
                          style={{ 
                            borderColor: STRUCTURE_COLORS[dh.dominantStructureType] || STRUCTURE_COLORS.default,
                            color: STRUCTURE_COLORS[dh.dominantStructureType] || STRUCTURE_COLORS.default
                          }}
                        >
                          {dh.dominantStructureType}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </TabsContent>

        {/* Correlation Tab */}
        <TabsContent value="correlation" className="space-y-4">
          <Card className="bg-white/10 backdrop-blur-lg border-white/20 p-6">
            <h3 className="text-lg font-bold text-white mb-4">
              Correlación entre Sondajes
            </h3>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Correlation Chart */}
              <div>
                <h4 className="text-md font-semibold text-white mb-3">
                  Similitud de Tipos de Estructura
                </h4>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={structureCorrelations.slice(0, 10)}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                    <XAxis 
                      dataKey="drillHolePair" 
                      stroke="#9ca3af"
                      tick={{ fill: '#9ca3af', fontSize: 10 }}
                      angle={-45}
                      textAnchor="end"
                      height={100}
                    />
                    <YAxis 
                      stroke="#9ca3af"
                      tick={{ fill: '#9ca3af', fontSize: 12 }}
                    />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: 'rgba(0,0,0,0.8)', 
                        border: '1px solid rgba(255,255,255,0.2)' 
                      }}
                    />
                    <Bar dataKey="correlation" fill="#8b5cf6" />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              {/* Distance vs Correlation */}
              <div>
                <h4 className="text-md font-semibold text-white mb-3">
                  Distancia vs Correlación
                </h4>
                <ResponsiveContainer width="100%" height={300}>
                  <ScatterChart data={structureCorrelations}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                    <XAxis 
                      type="number"
                      dataKey="distance" 
                      name="Distancia (m)"
                      stroke="#9ca3af"
                      tick={{ fill: '#9ca3af', fontSize: 12 }}
                    />
                    <YAxis 
                      type="number"
                      dataKey="correlation" 
                      name="Correlación"
                      stroke="#9ca3af"
                      tick={{ fill: '#9ca3af', fontSize: 12 }}
                    />
                    <Tooltip 
                      cursor={{ strokeDasharray: '3 3' }}
                      contentStyle={{ 
                        backgroundColor: 'rgba(0,0,0,0.8)', 
                        border: '1px solid rgba(255,255,255,0.2)' 
                      }}
                    />
                    <Scatter dataKey="correlation" fill="#f59e0b" />
                  </ScatterChart>
                </ResponsiveContainer>
              </div>
            </div>
          </Card>
        </TabsContent>

        {/* Spatial Tab */}
        <TabsContent value="spatial" className="space-y-4">
          <Card className="bg-white/10 backdrop-blur-lg border-white/20 p-6">
            <h3 className="text-lg font-bold text-white mb-4">
              Distribución Espacial de Sondajes
            </h3>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* UTM Coordinates */}
              <div>
                <h4 className="text-md font-semibold text-white mb-3">
                  Coordenadas UTM
                </h4>
                <ResponsiveContainer width="100%" height={300}>
                  <ScatterChart data={spatialData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                    <XAxis 
                      type="number"
                      dataKey="x" 
                      name="UTM Este (m)"
                      stroke="#9ca3af"
                      tick={{ fill: '#9ca3af', fontSize: 12 }}
                    />
                    <YAxis 
                      type="number"
                      dataKey="y" 
                      name="UTM Norte (m)"
                      stroke="#9ca3af"
                      tick={{ fill: '#9ca3af', fontSize: 12 }}
                    />
                    <Tooltip 
                      cursor={{ strokeDasharray: '3 3' }}
                      contentStyle={{ 
                        backgroundColor: 'rgba(0,0,0,0.8)', 
                        border: '1px solid rgba(255,255,255,0.2)' 
                      }}
                    />
                    <Scatter 
                      dataKey="structures" 
                      fill="#3b82f6"
                      name="Estructuras"
                    />
                  </ScatterChart>
                </ResponsiveContainer>
              </div>

              {/* Elevation Profile */}
              <div>
                <h4 className="text-md font-semibold text-white mb-3">
                  Perfil de Elevación
                </h4>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={spatialData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                    <XAxis 
                      dataKey="name" 
                      stroke="#9ca3af"
                      tick={{ fill: '#9ca3af', fontSize: 10 }}
                      angle={-45}
                      textAnchor="end"
                      height={80}
                    />
                    <YAxis 
                      stroke="#9ca3af"
                      tick={{ fill: '#9ca3af', fontSize: 12 }}
                    />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: 'rgba(0,0,0,0.8)', 
                        border: '1px solid rgba(255,255,255,0.2)' 
                      }}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="z" 
                      stroke="#10b981" 
                      strokeWidth={3}
                      name="Elevación (m)"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          </Card>
        </TabsContent>

        {/* Statistical Tab */}
        <TabsContent value="statistical" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Statistical Summary */}
            <Card className="bg-white/10 backdrop-blur-lg border-white/20 p-6">
              <h3 className="text-lg font-bold text-white mb-4">
                Resumen Estadístico
              </h3>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-white/5 rounded-lg p-3">
                    <div className="text-sm text-gray-400">Total Sondajes</div>
                    <div className="text-2xl font-bold text-white">{statisticalSummary?.totalDrillHoles}</div>
                  </div>
                  <div className="bg-white/5 rounded-lg p-3">
                    <div className="text-sm text-gray-400">Total Estructuras</div>
                    <div className="text-2xl font-bold text-white">{statisticalSummary?.totalStructures}</div>
                  </div>
                  <div className="bg-white/5 rounded-lg p-3">
                    <div className="text-sm text-gray-400">Profundidad Promedio</div>
                    <div className="text-2xl font-bold text-white">{statisticalSummary?.avgDepth.toFixed(1)}m</div>
                  </div>
                  <div className="bg-white/5 rounded-lg p-3">
                    <div className="text-sm text-gray-400">Est/Metro Promedio</div>
                    <div className="text-2xl font-bold text-white">{statisticalSummary?.avgStructuresPerMeter.toFixed(2)}</div>
                  </div>
                </div>
                
                <div className="bg-white/5 rounded-lg p-3">
                  <div className="text-sm text-gray-400 mb-2">Rango de Profundidades</div>
                  <div className="text-lg text-white">
                    {statisticalSummary?.depthRange.min.toFixed(1)}m - {statisticalSummary?.depthRange.max.toFixed(1)}m
                  </div>
                </div>
                
                <div className="bg-white/5 rounded-lg p-3">
                  <div className="text-sm text-gray-400 mb-2">Rango de Estructuras</div>
                  <div className="text-lg text-white">
                    {statisticalSummary?.structureCountRange.min} - {statisticalSummary?.structureCountRange.max} estructuras
                  </div>
                </div>
              </div>
            </Card>

            {/* Depth Distribution */}
            <Card className="bg-white/10 backdrop-blur-lg border-white/20 p-6">
              <h3 className="text-lg font-bold text-white mb-4">
                Distribución de Profundidades
              </h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={drillHoleComparisons}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                  <XAxis 
                    dataKey="name" 
                    stroke="#9ca3af"
                    tick={{ fill: '#9ca3af', fontSize: 10 }}
                    angle={-45}
                    textAnchor="end"
                    height={80}
                  />
                  <YAxis 
                    stroke="#9ca3af"
                    tick={{ fill: '#9ca3af', fontSize: 12 }}
                  />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'rgba(0,0,0,0.8)', 
                      border: '1px solid rgba(255,255,255,0.2)' 
                    }}
                  />
                  <Bar dataKey="totalDepth" fill="#f59e0b" />
                </BarChart>
              </ResponsiveContainer>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
