'use client'

import { useState } from 'react'
import { CSVUploader } from '@/components/csv-uploader'
import { Dashboard } from '@/components/dashboard'
import { DrillHoleViewer3D } from '@/components/drill-hole-viewer-3d'
import type { Project, DrillHole } from '@/types/geostxr-data'

export default function HubPage() {
  const [projects, setProjects] = useState<Project[]>([])
  const [selectedDrillHole, setSelectedDrillHole] = useState<DrillHole | null>(null)
  const [view, setView] = useState<'dashboard' | 'upload' | '3d'>('dashboard')

  const handleDataImported = (drillHole: DrillHole) => {
    console.log('📥 Data imported:', drillHole)
    
    // For now, add to a default project
    setProjects(prev => {
      const existingProject = prev.find(p => p.name === 'Default Project')
      
      if (existingProject) {
        // Update existing project immutably
        return prev.map(p => 
          p.id === 'default' 
            ? {
                ...p,
                drillHoles: [...p.drillHoles, drillHole],
                updatedAt: new Date()
              }
            : p
        )
      } else {
        // Create new project
        return [{
          id: 'default',
          name: 'Default Project',
          drillHoles: [drillHole],
          createdAt: new Date(),
          updatedAt: new Date()
        }]
      }
    })
    
    setSelectedDrillHole(drillHole)
    setView('dashboard')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900">
      {/* Header */}
      <header className="bg-black/30 backdrop-blur-lg border-b border-white/10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-white flex items-center gap-3">
                <span className="text-3xl">🌐</span>
                GeoStXR Hub
              </h1>
              <p className="text-sm text-gray-300 mt-1">
                Análisis y Visualización de Datos Estructurales
              </p>
            </div>
            
            <div className="flex gap-2">
              <button
                onClick={() => setView('dashboard')}
                className={`px-4 py-2 rounded-lg font-semibold transition-all ${
                  view === 'dashboard'
                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/50'
                    : 'bg-white/10 text-gray-300 hover:bg-white/20'
                }`}
              >
                📊 Dashboard
              </button>
              <button
                onClick={() => setView('upload')}
                className={`px-4 py-2 rounded-lg font-semibold transition-all ${
                  view === 'upload'
                    ? 'bg-green-600 text-white shadow-lg shadow-green-500/50'
                    : 'bg-white/10 text-gray-300 hover:bg-white/20'
                }`}
              >
                📤 Importar
              </button>
              {selectedDrillHole && (
                <button
                  onClick={() => setView('3d')}
                  className={`px-4 py-2 rounded-lg font-semibold transition-all ${
                    view === '3d'
                      ? 'bg-purple-600 text-white shadow-lg shadow-purple-500/50'
                      : 'bg-white/10 text-gray-300 hover:bg-white/20'
                  }`}
                >
                  🎮 Vista 3D
                </button>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {view === 'dashboard' && (
          <Dashboard 
            projects={projects} 
            onSelectDrillHole={(dh) => {
              setSelectedDrillHole(dh)
              setView('3d')
            }}
            onImportClick={() => setView('upload')}
          />
        )}
        
        {view === 'upload' && (
          <CSVUploader onDataImported={handleDataImported} />
        )}
        
        {view === '3d' && selectedDrillHole && (
          <DrillHoleViewer3D drillHole={selectedDrillHole} />
        )}
      </main>
    </div>
  )
}
