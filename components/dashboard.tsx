'use client'

import type { Project, DrillHole } from '@/types/geostxr-data'
import { StatisticsPanel } from '@/components/statistics-panel'
import { StructureTable } from '@/components/structure-table'
import { PhotoGallery } from '@/components/photo-gallery'
import { PhotoSync } from '@/components/photo-sync'
import { DrillHoleTimeline } from '@/components/drill-hole-timeline'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { PhotoMetadata } from '@/hooks/use-photo-registry'
import { simulateAndroidSync } from '@/lib/simulate-android-capture'
import { CreateProjectForm } from '@/components/project/create-project-form'
import { CreateDrillHoleForm } from '@/components/drill-hole/create-drillhole-form'
import { useState } from 'react'

interface DashboardProps {
  projects: Project[]
  onSelectDrillHole: (drillHole: DrillHole) => void
  onImportClick?: () => void
  onProjectsUpdate?: (projects: Project[]) => void
  photos?: PhotoMetadata[]
  onUploadPhotos?: (photos: PhotoMetadata[]) => Promise<void>
  onDownloadPhotos?: () => Promise<PhotoMetadata[]>
  onPhotoClick?: (photo: PhotoMetadata) => void
  onDownloadPhoto?: (photoId: string) => void
  onRemovePhoto?: (photoId: string) => void
}

export function Dashboard({ 
  projects, 
  onSelectDrillHole, 
  onImportClick,
  onProjectsUpdate,
  photos = [],
  onUploadPhotos,
  onDownloadPhotos,
  onPhotoClick,
  onDownloadPhoto,
  onRemovePhoto
}: DashboardProps) {
  const [selectedDrillHoleForTimeline, setSelectedDrillHoleForTimeline] = useState<DrillHole | null>(null)
  const [showCreateProject, setShowCreateProject] = useState(false)
  const [showCreateDrillHole, setShowCreateDrillHole] = useState(false)
  const [selectedProjectForDrillHole, setSelectedProjectForDrillHole] = useState<Project | null>(null)
  const totalDrillHoles = projects.reduce((sum, p) => sum + p.drillHoles.length, 0)
  const totalStructures = projects.reduce((sum, p) => 
    sum + p.drillHoles.reduce((s, dh) => 
      s + dh.scenes.reduce((sc, scene) => sc + scene.structures.length, 0)
    , 0)
  , 0)
  
  const totalMeters = projects.reduce((sum, p) =>
    sum + p.drillHoles.reduce((s, dh) => s + dh.totalDepth, 0)
  , 0)

  const handleSimulateAndroidCapture = () => {
    const { project } = simulateAndroidSync()
    
    // Add the Android project to existing projects
    const updatedProjects = [...projects, project]
    onProjectsUpdate?.(updatedProjects)
    
    console.log('✅ Android data synced to Hub successfully!')
  }

  const handleProjectCreated = (project: Project) => {
    onProjectsUpdate?.([...projects, project])
    setShowCreateProject(false)
  }

  const handleDrillHoleCreated = (drillHole: DrillHole) => {
    if (selectedProjectForDrillHole) {
      const updatedProjects = projects.map(p => 
        p.id === selectedProjectForDrillHole.id 
          ? { ...p, drillHoles: [...p.drillHoles, drillHole], updatedAt: new Date() }
          : p
      )
      onProjectsUpdate?.(updatedProjects)
    }
    setShowCreateDrillHole(false)
    setSelectedProjectForDrillHole(null)
  }

  const handleCreateDrillHoleClick = (project: Project) => {
    setSelectedProjectForDrillHole(project)
    setShowCreateDrillHole(true)
  }

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

      {/* Action Buttons */}
      <div className="flex gap-4 flex-wrap">
        <button
          onClick={() => setShowCreateProject(true)}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition-colors flex items-center gap-2"
        >
          ➕ Nuevo Proyecto
        </button>
        <button
          onClick={onImportClick}
          className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-semibold transition-colors flex items-center gap-2"
        >
          📤 Importar CSV
        </button>
        <button
          onClick={handleSimulateAndroidCapture}
          className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-semibold transition-colors flex items-center gap-2"
        >
          📱 Simular Captura Android
        </button>
      </div>

      {/* Projects List or Enhanced Views */}
      {projects.length === 0 ? (
        <div className="bg-white/5 backdrop-blur-lg rounded-xl p-12 border border-white/10 text-center">
          <div className="text-6xl mb-4">📂</div>
          <h3 className="text-xl font-bold text-white mb-2">
            No hay proyectos aún
          </h3>
          <p className="text-gray-400 mb-6">
            Comienza importando datos desde GEOSTXR
          </p>
                 <div className="flex gap-4 justify-center">
                   <button
                     onClick={onImportClick}
                     className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition-colors"
                   >
                     📤 Importar Datos
                   </button>
                   <button
                     onClick={handleSimulateAndroidCapture}
                     className="px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg font-semibold transition-colors"
                   >
                     📱 Simular Captura Android
                   </button>
                 </div>
        </div>
      ) : (
        <Tabs defaultValue="projects" className="w-full">
          <TabsList className="grid w-full grid-cols-5 bg-white/10">
            <TabsTrigger value="projects">Proyectos</TabsTrigger>
            <TabsTrigger value="statistics">Estadísticas</TabsTrigger>
            <TabsTrigger value="table">Tabla de Datos</TabsTrigger>
            <TabsTrigger value="photos">Fotos</TabsTrigger>
            <TabsTrigger value="timeline">Timeline</TabsTrigger>
          </TabsList>
          
          <TabsContent value="projects" className="space-y-4 mt-6">
            {projects.map(project => (
              <div
                key={project.id}
                className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20"
              >
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-bold text-white flex items-center gap-2">
                    <span>📁</span>
                    {project.name}
                    {project.client && (
                      <span className="text-sm font-normal text-gray-400">
                        - {project.client}
                      </span>
                    )}
                  </h3>
                  <button
                    onClick={() => handleCreateDrillHoleClick(project)}
                    className="px-3 py-1 bg-green-600 hover:bg-green-700 text-white text-sm rounded-lg transition-colors"
                  >
                    ➕ Sondaje
                  </button>
                </div>
                
                {/* Drill Holes List */}
                <div className="space-y-2">
                  {project.drillHoles.map(dh => (
                    <div
                      key={dh.id}
                      onClick={() => onSelectDrillHole(dh)}
                      onDoubleClick={() => setSelectedDrillHoleForTimeline(dh)}
                      className="bg-white/5 hover:bg-white/10 rounded-lg p-4 cursor-pointer transition-all border border-white/10 hover:border-blue-400 group"
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
                          <div className="mt-1 opacity-0 group-hover:opacity-100 transition-opacity text-blue-400">
                            Doble click para timeline
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </TabsContent>
          
          <TabsContent value="statistics" className="mt-6">
            <StatisticsPanel projects={projects} />
          </TabsContent>
          
          <TabsContent value="table" className="mt-6">
            <StructureTable projects={projects} />
          </TabsContent>
          
          <TabsContent value="photos" className="mt-6 space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Photo Gallery */}
              <div className="lg:col-span-2">
                <PhotoGallery
                  photos={photos}
                  onRemovePhoto={onRemovePhoto}
                  onDownloadPhoto={onDownloadPhoto}
                  onUpdateMetadata={(photoId, metadata) => {
                    // Handle metadata updates
                    console.log('Update photo metadata:', photoId, metadata)
                  }}
                />
              </div>
              
              {/* Photo Sync */}
              <div>
                <PhotoSync
                  photos={photos}
                  onUploadPhotos={onUploadPhotos}
                  onDownloadPhotos={onDownloadPhotos}
                  drillHoleId={selectedDrillHoleForTimeline?.id}
                  projectId={selectedDrillHoleForTimeline ? projects.find(p => 
                    p.drillHoles.some(dh => dh.id === selectedDrillHoleForTimeline.id)
                  )?.id : undefined}
                />
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="timeline" className="mt-6">
            {selectedDrillHoleForTimeline ? (
              <DrillHoleTimeline
                drillHole={selectedDrillHoleForTimeline}
                photos={photos}
                onPhotoClick={onPhotoClick}
                onDownloadPhoto={onDownloadPhoto}
                onRemovePhoto={onRemovePhoto}
              />
            ) : (
              <div className="bg-white/5 backdrop-blur-lg rounded-xl p-12 border border-white/10 text-center">
                <div className="text-6xl mb-4">📏</div>
                <h3 className="text-xl font-bold text-white mb-2">
                  Selecciona un sondaje
                </h3>
                <p className="text-gray-400 mb-6">
                  Elige un sondaje de la lista para ver la línea de tiempo con fotos
                </p>
              </div>
            )}
        </TabsContent>
      </Tabs>
      )}

      {/* Create Project Modal */}
      {showCreateProject && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-2xl max-h-full overflow-y-auto">
            <CreateProjectForm
              onProjectCreated={handleProjectCreated}
              onCancel={() => setShowCreateProject(false)}
            />
          </div>
        </div>
      )}

      {/* Create Drill Hole Modal */}
      {showCreateDrillHole && selectedProjectForDrillHole && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-2xl max-h-full overflow-y-auto">
            <CreateDrillHoleForm
              project={selectedProjectForDrillHole}
              onDrillHoleCreated={handleDrillHoleCreated}
              onCancel={() => {
                setShowCreateDrillHole(false)
                setSelectedProjectForDrillHole(null)
              }}
            />
          </div>
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


