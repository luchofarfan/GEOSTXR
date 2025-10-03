'use client'

import { useEffect, useRef, useState } from 'react'
import dynamic from 'next/dynamic'

// Dynamic import for Three.js to avoid SSR issues
const ThreeViewer = dynamic(() => import('./three-viewer'), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center h-full bg-slate-950 rounded-xl">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-400 mx-auto mb-4"></div>
        <p className="text-white">Cargando visualización 3D...</p>
      </div>
    </div>
  )
})
import type { Project, DrillHole } from '@/types/geostxr-data'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import { Badge } from '@/components/ui/badge'
import { createTestDrillHoles } from '@/lib/create-test-drillholes'

interface MultiDrillHoleViewer3DProps {
  projects: Project[]
  onProjectsUpdate?: (projects: Project[]) => void
}

interface DrillHoleVisibility {
  [drillHoleId: string]: boolean
}

export function MultiDrillHoleViewer3D({ projects, onProjectsUpdate }: MultiDrillHoleViewer3DProps) {
  
  const [selectedDrillHoles, setSelectedDrillHoles] = useState<DrillHole[]>([])
  const [visibility, setVisibility] = useState<DrillHoleVisibility>({})
  const [showStructures, setShowStructures] = useState(true)
  const [showTrajectories, setShowTrajectories] = useState(true)
  const [structureOpacity, setStructureOpacity] = useState(0.75)

  // Get all drill holes from all projects
  const allDrillHoles = projects.flatMap(project => project.drillHoles)

  useEffect(() => {
    // Initialize all drill holes as selected and visible
    const initialVisibility: DrillHoleVisibility = {}
    allDrillHoles.forEach(dh => {
      initialVisibility[dh.id] = true
    })
    setVisibility(initialVisibility)
    setSelectedDrillHoles(allDrillHoles)
  }, [allDrillHoles])


  const toggleDrillHoleVisibility = (drillHoleId: string) => {
    setVisibility(prev => ({
      ...prev,
      [drillHoleId]: !prev[drillHoleId]
    }))
  }

  const selectAllDrillHoles = () => {
    const newVisibility: DrillHoleVisibility = {}
    allDrillHoles.forEach(dh => {
      newVisibility[dh.id] = true
    })
    setVisibility(newVisibility)
  }

  const deselectAllDrillHoles = () => {
    const newVisibility: DrillHoleVisibility = {}
    allDrillHoles.forEach(dh => {
      newVisibility[dh.id] = false
    })
    setVisibility(newVisibility)
  }

  const loadTestDrillHoles = () => {
    const testProjects = createTestDrillHoles()
    onProjectsUpdate?.(testProjects)
  }

  if (allDrillHoles.length === 0) {
    return (
      <div className="bg-white/5 backdrop-blur-lg rounded-xl p-12 border border-white/10 text-center">
        <div className="text-6xl mb-4">🔬</div>
        <h3 className="text-xl font-bold text-white mb-2">
          No hay sondajes para visualizar
        </h3>
        <p className="text-gray-400 mb-6">
          Importa datos de múltiples sondajes para ver la vista 3D conjunta
        </p>
        <Button
          onClick={loadTestDrillHoles}
          className="bg-blue-600 hover:bg-blue-700 text-white"
        >
          🧪 Cargar Sondajes de Prueba
        </Button>
      </div>
    )
  }

  return (
    <div className="flex h-screen gap-4">
      {/* 3D Viewer - Left Panel (Fixed) */}
      <div className="flex-1 min-w-0">
        <Card className="bg-white/10 backdrop-blur-lg border-white/20 h-full flex flex-col">
          <div className="p-4 border-b border-white/10">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <span>🗺️</span>
              Vista 3D Multi-Sondaje
            </h2>
            <p className="text-sm text-gray-400 mt-1">
              Visualización conjunta de {allDrillHoles.length} sondajes con sus estructuras
            </p>
          </div>
          
          <div className="flex-1 p-4">
            <div className="w-full h-full bg-slate-950 rounded-xl overflow-hidden border border-white/10">
              <ThreeViewer
                allDrillHoles={allDrillHoles}
                visibility={visibility}
                showStructures={showStructures}
                showTrajectories={showTrajectories}
                structureOpacity={structureOpacity}
              />
            </div>
          </div>
          
          <div className="p-4 border-t border-white/10">
            <div className="text-xs text-gray-400 text-center">
              🖱️ Click + arrastrar: rotar | Scroll: zoom | Click derecho: panear
            </div>
          </div>
        </Card>
      </div>

      {/* Data Panel - Right Panel (Scrollable) */}
      <div className="w-96 flex-shrink-0">
        <div className="h-full overflow-y-auto space-y-4 pr-2">
          {/* Drill Hole Selection */}
          <Card className="bg-white/10 backdrop-blur-lg border-white/20 p-4">
            <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
              <span>🔬</span>
              Sondajes ({allDrillHoles.length})
            </h3>
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {allDrillHoles.map((dh, index) => (
                <div key={dh.id} className="flex items-center gap-3">
                  <Checkbox
                    checked={visibility[dh.id] || false}
                    onCheckedChange={() => toggleDrillHoleVisibility(dh.id)}
                    className="data-[state=checked]:bg-blue-600"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-semibold text-white truncate">{dh.name}</div>
                    <div className="text-xs text-gray-400">
                      {dh.totalDepth.toFixed(1)}m • {
                        dh.scenes.reduce((sum, s) => sum + s.structures.length, 0)
                      } estructuras
                    </div>
                    <div className="text-xs text-gray-500">
                      UTM: {dh.info.utmEast?.toFixed(0) || 'N/A'}, {dh.info.utmNorth?.toFixed(0) || 'N/A'}
                    </div>
                  </div>
                  <Badge variant="outline" className="text-xs flex-shrink-0">
                    {dh.info.azimuth.toFixed(0)}°/{dh.info.dip.toFixed(0)}°
                  </Badge>
                </div>
              ))}
            </div>
            <div className="flex gap-2 mt-4">
              <Button 
                size="sm" 
                variant="outline"
                onClick={selectAllDrillHoles}
                className="text-xs flex-1"
              >
                Todos
              </Button>
              <Button 
                size="sm" 
                variant="outline"
                onClick={deselectAllDrillHoles}
                className="text-xs flex-1"
              >
                Ninguno
              </Button>
            </div>
          </Card>

          {/* Display Options */}
          <Card className="bg-white/10 backdrop-blur-lg border-white/20 p-4">
            <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
              <span>⚙️</span>
              Opciones de Visualización
            </h3>
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <Checkbox
                  checked={showTrajectories}
                  onCheckedChange={(checked) => setShowTrajectories(checked === true)}
                  className="data-[state=checked]:bg-blue-600"
                />
                <label className="text-sm text-white">Mostrar Trayectorias</label>
              </div>
              
              <div className="flex items-center gap-3">
                <Checkbox
                  checked={showStructures}
                  onCheckedChange={(checked) => setShowStructures(checked === true)}
                  className="data-[state=checked]:bg-blue-600"
                />
                <label className="text-sm text-white">Mostrar Estructuras</label>
              </div>

              {showStructures && (
                <div>
                  <label className="text-sm text-white mb-2 block">
                    Opacidad: {(structureOpacity * 100).toFixed(0)}%
                  </label>
                  <input
                    type="range"
                    min="0.1"
                    max="1"
                    step="0.1"
                    value={structureOpacity}
                    onChange={(e) => setStructureOpacity(parseFloat(e.target.value))}
                    className="w-full h-2 bg-white/20 rounded-lg appearance-none cursor-pointer slider"
                  />
                </div>
              )}
            </div>
          </Card>

          {/* Statistics */}
          <Card className="bg-white/10 backdrop-blur-lg border-white/20 p-4">
            <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
              <span>📊</span>
              Estadísticas
            </h3>
            <div className="space-y-3">
              <div className="bg-white/5 rounded-lg p-3">
                <div className="text-sm text-gray-400">Sondajes Visibles</div>
                <div className="text-2xl font-bold text-white">
                  {Object.values(visibility).filter(Boolean).length}
                </div>
              </div>
              
              <div className="bg-white/5 rounded-lg p-3">
                <div className="text-sm text-gray-400">Total Estructuras</div>
                <div className="text-2xl font-bold text-white">
                  {allDrillHoles.reduce((sum, dh) => 
                    sum + dh.scenes.reduce((s, scene) => s + scene.structures.length, 0), 0
                  )}
                </div>
              </div>
              
              <div className="bg-white/5 rounded-lg p-3">
                <div className="text-sm text-gray-400">Metros Totales</div>
                <div className="text-2xl font-bold text-white">
                  {allDrillHoles.reduce((sum, dh) => sum + dh.totalDepth, 0).toFixed(1)}m
                </div>
              </div>
            </div>
          </Card>

          {/* Detailed Structure Information */}
          <Card className="bg-white/10 backdrop-blur-lg border-white/20 p-4">
            <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
              <span>🪨</span>
              Estructuras por Sondaje
            </h3>
            <div className="space-y-3 max-h-64 overflow-y-auto">
              {allDrillHoles.map((dh) => (
                <div key={dh.id} className="bg-white/5 rounded-lg p-3">
                  <div className="text-sm font-semibold text-white mb-2">{dh.name}</div>
                  <div className="space-y-1">
                    {dh.scenes.map((scene) => (
                      scene.structures.map((structure) => (
                        <div key={structure.id} className="text-xs text-gray-300 flex justify-between">
                          <span>{structure.structureType}</span>
                          <span className="text-gray-400">
                            {structure.depth}cm • α:{structure.alpha.toFixed(1)}° • β:{structure.beta.toFixed(1)}°
                          </span>
                        </div>
                      ))
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </Card>

          {/* Coordinate Information */}
          <Card className="bg-white/10 backdrop-blur-lg border-white/20 p-4">
            <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
              <span>📍</span>
              Coordenadas UTM
            </h3>
            <div className="space-y-2 text-sm">
              {allDrillHoles.map((dh) => (
                <div key={dh.id} className="bg-white/5 rounded-lg p-3">
                  <div className="text-white font-medium">{dh.name}</div>
                  <div className="text-gray-400 text-xs space-y-1">
                    <div>Este: {dh.info.utmEast?.toFixed(2) || 'N/A'} m</div>
                    <div>Norte: {dh.info.utmNorth?.toFixed(2) || 'N/A'} m</div>
                    <div>Elevación: {dh.info.elevation?.toFixed(2) || 'N/A'} m</div>
                    <div>Azimut: {dh.info.azimuth?.toFixed(1)}°</div>
                    <div>Inclinación: {dh.info.dip?.toFixed(1)}°</div>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}
