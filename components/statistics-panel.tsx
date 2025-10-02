'use client'

import { useStatistics } from '@/hooks/use-statistics'
import type { Project } from '@/types/geostxr-data'
import { 
  BarChart, 
  Bar, 
  PieChart, 
  Pie, 
  Cell,
  LineChart,
  Line,
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer 
} from 'recharts'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Card } from '@/components/ui/card'
import { Stereonet } from '@/components/stereonet'
import { useMemo } from 'react'

interface StatisticsPanelProps {
  projects: Project[]
}

const STRUCTURE_COLORS: Record<string, string> = {
  'Fractura': '#3b82f6',  // blue
  'Veta': '#10b981',      // green
  'Falla': '#ef4444',     // red
  'Contacto': '#f59e0b',  // amber
  'Diaclasa': '#8b5cf6',  // purple
  'default': '#6b7280'    // gray
}

export function StatisticsPanel({ projects }: StatisticsPanelProps) {
  const stats = useStatistics(projects)
  
  // Recopilar todas las estructuras para stereonet
  const allStructures = useMemo(() => {
    const structures: any[] = []
    projects.forEach(project => {
      project.drillHoles.forEach(dh => {
        dh.scenes.forEach(scene => {
          structures.push(...scene.structures)
        })
      })
    })
    return structures
  }, [projects])
  
  if (stats.totalStructures === 0) {
    return (
      <div className="bg-white/5 backdrop-blur-lg rounded-xl p-12 border border-white/10 text-center">
        <div className="text-6xl mb-4">📊</div>
        <h3 className="text-xl font-bold text-white mb-2">
          No hay datos para analizar
        </h3>
        <p className="text-gray-400">
          Importa datos para ver estadísticas y gráficos
        </p>
      </div>
    )
  }
  
  return (
    <div className="space-y-6">
      {/* Métricas Principales */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <MetricCard
          label="Total Estructuras"
          value={stats.totalStructures}
          icon="🪨"
          color="blue"
        />
        <MetricCard
          label="Estructuras/Metro"
          value={stats.structuresPerMeter.toFixed(2)}
          icon="📏"
          color="green"
        />
        <MetricCard
          label="Alpha Promedio"
          value={`${stats.alphaRange.avg.toFixed(1)}°`}
          icon="📐"
          color="purple"
        />
        <MetricCard
          label="Dip Promedio"
          value={`${stats.dipRange.avg.toFixed(1)}°`}
          icon="🔻"
          color="orange"
        />
      </div>
      
      {/* Tabs con diferentes análisis */}
      <Tabs defaultValue="types" className="w-full">
        <TabsList className="grid w-full grid-cols-5 bg-white/10">
          <TabsTrigger value="types">Por Tipo</TabsTrigger>
          <TabsTrigger value="orientations">Orientaciones</TabsTrigger>
          <TabsTrigger value="stereonet">Stereonet</TabsTrigger>
          <TabsTrigger value="depth">Profundidad</TabsTrigger>
          <TabsTrigger value="drillholes">Sondajes</TabsTrigger>
        </TabsList>
        
        {/* Tab: Distribución por Tipo */}
        <TabsContent value="types" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Gráfico de Pastel */}
            <Card className="bg-white/10 backdrop-blur-lg border-white/20 p-6">
              <h3 className="text-lg font-bold text-white mb-4">Distribución por Tipo</h3>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={stats.structuresByType}
                    dataKey="count"
                    nameKey="type"
                    cx="50%"
                    cy="50%"
                    outerRadius={100}
                    label={({ type, percentage }) => `${type} (${percentage.toFixed(1)}%)`}
                  >
                    {stats.structuresByType.map((entry, index) => (
                      <Cell 
                        key={`cell-${index}`} 
                        fill={STRUCTURE_COLORS[entry.type] || STRUCTURE_COLORS.default} 
                      />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'rgba(0,0,0,0.8)', 
                      border: '1px solid rgba(255,255,255,0.2)' 
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </Card>
            
            {/* Tabla de Estadísticas por Tipo */}
            <Card className="bg-white/10 backdrop-blur-lg border-white/20 p-6">
              <h3 className="text-lg font-bold text-white mb-4">Estadísticas Detalladas</h3>
              <div className="space-y-3 overflow-y-auto max-h-[300px]">
                {stats.structuresByType.map(stat => (
                  <div 
                    key={stat.type}
                    className="bg-white/5 rounded-lg p-3 border border-white/10"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-semibold text-white">{stat.type}</span>
                      <span className="text-sm text-gray-300">{stat.count} estructuras</span>
                    </div>
                    <div className="grid grid-cols-3 gap-2 text-xs text-gray-400">
                      <div>
                        <div className="text-gray-500">Profundidad Media</div>
                        <div className="text-white">{(stat.avgDepth / 100).toFixed(1)}m</div>
                      </div>
                      <div>
                        <div className="text-gray-500">Dip Promedio</div>
                        <div className="text-white">{stat.avgDip.toFixed(1)}°</div>
                      </div>
                      <div>
                        <div className="text-gray-500">Dip Dir Promedio</div>
                        <div className="text-white">{stat.avgDipDirection.toFixed(1)}°</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        </TabsContent>
        
        {/* Tab: Orientaciones */}
        <TabsContent value="orientations" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Distribución Alpha */}
            <Card className="bg-white/10 backdrop-blur-lg border-white/20 p-6">
              <h3 className="text-lg font-bold text-white mb-4">
                Distribución Alpha (Ángulo Local)
              </h3>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={stats.alphaDistribution}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                  <XAxis 
                    dataKey="range" 
                    stroke="#9ca3af"
                    tick={{ fill: '#9ca3af', fontSize: 12 }}
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
                  <Bar dataKey="count" fill="#3b82f6" />
                </BarChart>
              </ResponsiveContainer>
              <div className="text-xs text-gray-400 mt-2">
                Min: {stats.alphaRange.min.toFixed(1)}° | 
                Max: {stats.alphaRange.max.toFixed(1)}° | 
                Prom: {stats.alphaRange.avg.toFixed(1)}°
              </div>
            </Card>
            
            {/* Distribución Beta */}
            <Card className="bg-white/10 backdrop-blur-lg border-white/20 p-6">
              <h3 className="text-lg font-bold text-white mb-4">
                Distribución Beta (Ángulo Local)
              </h3>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={stats.betaDistribution}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                  <XAxis 
                    dataKey="range" 
                    stroke="#9ca3af"
                    tick={{ fill: '#9ca3af', fontSize: 10 }}
                    angle={-45}
                    textAnchor="end"
                    height={60}
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
                  <Bar dataKey="count" fill="#10b981" />
                </BarChart>
              </ResponsiveContainer>
              <div className="text-xs text-gray-400 mt-2">
                Min: {stats.betaRange.min.toFixed(1)}° | 
                Max: {stats.betaRange.max.toFixed(1)}° | 
                Prom: {stats.betaRange.avg.toFixed(1)}°
              </div>
            </Card>
            
            {/* Distribución Dip */}
            <Card className="bg-white/10 backdrop-blur-lg border-white/20 p-6">
              <h3 className="text-lg font-bold text-white mb-4">
                Distribución Dip (Buzamiento Real)
              </h3>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={stats.dipDistribution}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                  <XAxis 
                    dataKey="range" 
                    stroke="#9ca3af"
                    tick={{ fill: '#9ca3af', fontSize: 12 }}
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
                  <Bar dataKey="count" fill="#8b5cf6" />
                </BarChart>
              </ResponsiveContainer>
              <div className="text-xs text-gray-400 mt-2">
                Min: {stats.dipRange.min.toFixed(1)}° | 
                Max: {stats.dipRange.max.toFixed(1)}° | 
                Prom: {stats.dipRange.avg.toFixed(1)}°
              </div>
            </Card>
            
            {/* Distribución Dip Direction */}
            <Card className="bg-white/10 backdrop-blur-lg border-white/20 p-6">
              <h3 className="text-lg font-bold text-white mb-4">
                Distribución Dip Direction (Dirección de Buzamiento)
              </h3>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={stats.dipDirectionDistribution}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                  <XAxis 
                    dataKey="range" 
                    stroke="#9ca3af"
                    tick={{ fill: '#9ca3af', fontSize: 10 }}
                    angle={-45}
                    textAnchor="end"
                    height={60}
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
                  <Bar dataKey="count" fill="#f59e0b" />
                </BarChart>
              </ResponsiveContainer>
              <div className="text-xs text-gray-400 mt-2">
                Min: {stats.dipDirectionRange.min.toFixed(1)}° | 
                Max: {stats.dipDirectionRange.max.toFixed(1)}° | 
                Prom: {stats.dipDirectionRange.avg.toFixed(1)}°
              </div>
            </Card>
          </div>
        </TabsContent>
        
        {/* Tab: Red Estereográfica */}
        <TabsContent value="stereonet">
          <Stereonet structures={allStructures} width={600} height={600} />
        </TabsContent>
        
        {/* Tab: Distribución por Profundidad */}
        <TabsContent value="depth">
          <Card className="bg-white/10 backdrop-blur-lg border-white/20 p-6">
            <h3 className="text-lg font-bold text-white mb-4">
              Frecuencia de Estructuras por Profundidad
            </h3>
            <ResponsiveContainer width="100%" height={400}>
              <BarChart data={stats.depthDistribution}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                <XAxis 
                  dataKey="range" 
                  stroke="#9ca3af"
                  tick={{ fill: '#9ca3af', fontSize: 12 }}
                />
                <YAxis 
                  stroke="#9ca3af"
                  tick={{ fill: '#9ca3af', fontSize: 12 }}
                  label={{ value: 'N° Estructuras', angle: -90, position: 'insideLeft', fill: '#9ca3af' }}
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'rgba(0,0,0,0.8)', 
                    border: '1px solid rgba(255,255,255,0.2)' 
                  }}
                />
                <Legend />
                {/* Apilar por tipo de estructura */}
                {Object.keys(STRUCTURE_COLORS).filter(k => k !== 'default').map(type => (
                  <Bar 
                    key={type}
                    dataKey={`types.${type}`}
                    stackId="a"
                    fill={STRUCTURE_COLORS[type]}
                    name={type}
                  />
                ))}
              </BarChart>
            </ResponsiveContainer>
          </Card>
        </TabsContent>
        
        {/* Tab: Estadísticas por Sondaje */}
        <TabsContent value="drillholes">
          <Card className="bg-white/10 backdrop-blur-lg border-white/20 p-6">
            <h3 className="text-lg font-bold text-white mb-4">
              Análisis por Sondaje
            </h3>
            <div className="space-y-4">
              {stats.drillHoleStats.map(dh => (
                <div 
                  key={dh.id}
                  className="bg-white/5 rounded-lg p-4 border border-white/10"
                >
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <h4 className="font-bold text-white">{dh.name}</h4>
                      <p className="text-sm text-gray-400">
                        Profundidad: {dh.depth.toFixed(1)}m
                      </p>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-white">{dh.structureCount}</div>
                      <div className="text-xs text-gray-400">estructuras</div>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 mb-3">
                    <div className="bg-white/5 rounded p-2">
                      <div className="text-xs text-gray-500">Frecuencia</div>
                      <div className="text-lg font-semibold text-white">
                        {dh.structuresPerMeter.toFixed(2)} est/m
                      </div>
                    </div>
                    <div className="bg-white/5 rounded p-2">
                      <div className="text-xs text-gray-500">Tipos Dominantes</div>
                      <div className="text-sm text-white">
                        {dh.dominantTypes.slice(0, 2).map(t => t.type).join(', ')}
                      </div>
                    </div>
                  </div>
                  
                  {/* Mini gráfico de tipos */}
                  <div className="space-y-1">
                    {dh.dominantTypes.map(t => (
                      <div key={t.type} className="flex items-center gap-2">
                        <div 
                          className="w-3 h-3 rounded"
                          style={{ backgroundColor: STRUCTURE_COLORS[t.type] || STRUCTURE_COLORS.default }}
                        />
                        <span className="text-xs text-gray-300">{t.type}</span>
                        <div className="flex-1 bg-white/10 rounded-full h-2">
                          <div 
                            className="h-full rounded-full"
                            style={{ 
                              width: `${(t.count / dh.structureCount) * 100}%`,
                              backgroundColor: STRUCTURE_COLORS[t.type] || STRUCTURE_COLORS.default
                            }}
                          />
                        </div>
                        <span className="text-xs text-gray-400">{t.count}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

function MetricCard({ 
  label, 
  value, 
  icon, 
  color 
}: { 
  label: string
  value: string | number
  icon: string
  color: 'blue' | 'green' | 'purple' | 'orange'
}) {
  const colorClasses = {
    blue: 'from-blue-600 to-blue-700 shadow-blue-500/50',
    green: 'from-green-600 to-green-700 shadow-green-500/50',
    purple: 'from-purple-600 to-purple-700 shadow-purple-500/50',
    orange: 'from-orange-600 to-orange-700 shadow-orange-500/50'
  }

  return (
    <div className={`bg-gradient-to-br ${colorClasses[color]} rounded-xl p-6 shadow-lg`}>
      <div className="text-3xl mb-2">{icon}</div>
      <div className="text-2xl font-bold text-white mb-1">{value}</div>
      <div className="text-sm text-white/80">{label}</div>
    </div>
  )
}

