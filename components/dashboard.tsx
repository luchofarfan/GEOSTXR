'use client'

import type { Project, DrillHole } from '@/types/geostxr-data'

interface DashboardProps {
  projects: Project[]
  onSelectDrillHole: (drillHole: DrillHole) => void
  onImportClick?: () => void
}

export function Dashboard({ projects, onSelectDrillHole, onImportClick }: DashboardProps) {
  const totalDrillHoles = projects.reduce((sum, p) => sum + p.drillHoles.length, 0)
  const totalStructures = projects.reduce((sum, p) => 
    sum + p.drillHoles.reduce((s, dh) => 
      s + dh.scenes.reduce((sc, scene) => sc + scene.structures.length, 0)
    , 0)
  , 0)
  
  const totalMeters = projects.reduce((sum, p) => 
    sum + p.drillHoles.reduce((s, dh) => s + dh.totalDepth, 0)
  , 0)

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <StatsCard
          icon="📁"
          label="Proyectos"
          value={projects.length}
          color="blue"
        />
        <StatsCard
          icon="🔬"
          label="Sondajes"
          value={totalDrillHoles}
          color="purple"
        />
        <StatsCard
          icon="📏"
          label="Metros Perforados"
          value={`${totalMeters.toFixed(1)}m`}
          color="green"
        />
        <StatsCard
          icon="🪨"
          label="Estructuras"
          value={totalStructures}
          color="orange"
        />
      </div>

      {/* Projects List */}
      {projects.length === 0 ? (
        <div className="bg-white/5 backdrop-blur-lg rounded-xl p-12 border border-white/10 text-center">
          <div className="text-6xl mb-4">📂</div>
          <h3 className="text-xl font-bold text-white mb-2">
            No hay proyectos aún
          </h3>
          <p className="text-gray-400 mb-6">
            Comienza importando datos desde GEOSTXR
          </p>
          <button 
            onClick={onImportClick}
            className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition-colors"
          >
            📤 Importar Datos
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {projects.map(project => (
            <div
              key={project.id}
              className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20"
            >
              <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                <span>📁</span>
                {project.name}
                {project.client && (
                  <span className="text-sm font-normal text-gray-400">
                    - {project.client}
                  </span>
                )}
              </h3>
              
              {/* Drill Holes List */}
              <div className="space-y-2">
                {project.drillHoles.map(dh => (
                  <div
                    key={dh.id}
                    onClick={() => onSelectDrillHole(dh)}
                    className="bg-white/5 hover:bg-white/10 rounded-lg p-4 cursor-pointer transition-all border border-white/10 hover:border-blue-400"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <span className="text-2xl">🔬</span>
                        <div>
                          <h4 className="font-semibold text-white">{dh.name}</h4>
                          <p className="text-sm text-gray-400">
                            {dh.totalDepth.toFixed(1)}m • {
                              dh.scenes.reduce((sum, s) => sum + s.structures.length, 0)
                            } estructuras
                          </p>
                        </div>
                      </div>
                      
                      <div className="text-right text-xs text-gray-400">
                        <div>Az: {dh.info.azimuth.toFixed(0)}°</div>
                        <div>Dip: {dh.info.dip.toFixed(0)}°</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

function StatsCard({ 
  icon, 
  label, 
  value, 
  color 
}: { 
  icon: string
  label: string
  value: string | number
  color: 'blue' | 'purple' | 'green' | 'orange'
}) {
  const colorClasses = {
    blue: 'from-blue-600 to-blue-700 shadow-blue-500/50',
    purple: 'from-purple-600 to-purple-700 shadow-purple-500/50',
    green: 'from-green-600 to-green-700 shadow-green-500/50',
    orange: 'from-orange-600 to-orange-700 shadow-orange-500/50'
  }

  return (
    <div className={`bg-gradient-to-br ${colorClasses[color]} rounded-xl p-6 shadow-lg`}>
      <div className="text-3xl mb-2">{icon}</div>
      <div className="text-3xl font-bold text-white mb-1">{value}</div>
      <div className="text-sm text-white/80">{label}</div>
    </div>
  )
}


