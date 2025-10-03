'use client'

import { useState, useEffect } from 'react'
import { CSVUploader } from '@/components/csv-uploader'
import { Dashboard } from '@/components/dashboard'
import { DrillHoleViewer3D } from '@/components/drill-hole-viewer-3d'
import { MultiDrillHoleViewer3D } from '@/components/multi-drillhole-viewer-3d'
import { MultiDrillHoleAnalysis } from '@/components/multi-drillhole-analysis'
import { AuthProvider } from '@/components/auth-provider'
import { useAuth } from '@/hooks/use-auth'
import { LoginForm } from '@/components/auth/login-form'
import { RegisterForm } from '@/components/auth/register-form'
import { SessionRestore } from '@/components/session/session-restore'
import { SessionTimeline } from '@/components/session/session-timeline-fixed'
import type { Project, DrillHole } from '@/types/geostxr-data'
import { PhotoMetadata, usePhotoRegistry } from '@/hooks/use-photo-registry'
import { useSessionPersistence } from '@/hooks/use-session-persistence'
import { Loader2 } from 'lucide-react'

function HubPageContent() {
  const { user, isAuthenticated, isLoading: authLoading } = useAuth()
  const [projects, setProjects] = useState<Project[]>([])
  const [selectedDrillHole, setSelectedDrillHole] = useState<DrillHole | null>(null)
  const [view, setView] = useState<'dashboard' | 'upload' | '3d' | 'multi-3d' | 'multi-analysis' | 'session-restore' | 'session-timeline'>('dashboard')
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login')
  
  // Photo management
  const {
    photos,
    capturePhoto,
    captureScreenshot,
    removePhoto,
    clearAllPhotos,
    updatePhotoMetadata,
    addPhotoNote,
    addPhotoTags,
    getPhotosForPlane,
    exportPhotosAsJSON,
    downloadPhoto
  } = usePhotoRegistry()

  // Session persistence
  const {
    sessionState,
    isLoading: sessionLoading,
    updateDrillHoleProgress,
    addPhotoToSession,
    setCurrentDrillHole,
    getActiveDrillHoles,
    getRecentPhotos,
    hasPreviousSession,
    getSessionStats
  } = useSessionPersistence()

  // Check for session restore on authentication
  useEffect(() => {
    if (isAuthenticated && user && !sessionLoading) {
      const activeDrillHoles = getActiveDrillHoles()
      
      if (activeDrillHoles.length > 0) {
        // Show session restore screen
        setView('session-restore')
      } else {
        // Go to dashboard
        setView('dashboard')
      }
    }
  }, [isAuthenticated, user, sessionLoading, getActiveDrillHoles])

  const handleDataImported = (drillHole: DrillHole) => {
    console.log('📥 Data imported:', drillHole)
    
    // For now, add to a default project
    const project = {
      id: 'default',
      name: 'Default Project',
      drillHoles: [drillHole],
      createdAt: new Date(),
      updatedAt: new Date()
    }
    
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
        return [...prev, project]
      }
    })
  }

  // Sync API endpoint for PWA
  const handlePWASync = async (drillHole: DrillHole) => {
    console.log('📱 PWA Sync received:', drillHole)
    
    // Find or create project for PWA sync
    let targetProject = projects.find(p => p.name.includes('PWA Sync'))
    if (!targetProject) {
      targetProject = {
        id: `pwa-sync-${Date.now()}`,
        name: `PWA Sync Project - ${new Date().toLocaleDateString()}`,
        drillHoles: [],
        createdAt: new Date(),
        updatedAt: new Date(),
        coordinateSystem: {
          projection: 'UTM',
          datum: 'WGS84',
          utmZone: 19,
          utmHemisphere: 'S',
          epsgCode: 32719,
          description: 'WGS84 UTM Zone 19S'
        }
      }
    }

    // Add drill hole to project
    const existingIndex = targetProject.drillHoles.findIndex(dh => dh.id === drillHole.id)
    if (existingIndex >= 0) {
      targetProject.drillHoles[existingIndex] = drillHole
    } else {
      targetProject.drillHoles.push(drillHole)
    }
    targetProject.updatedAt = new Date()

    // Update projects
    const projectIndex = projects.findIndex(p => p.id === targetProject.id)
    if (projectIndex >= 0) {
      const updatedProjects = [...projects]
      updatedProjects[projectIndex] = targetProject
      setProjects(updatedProjects)
    } else {
      setProjects(prev => [...prev, targetProject])
    }

    console.log('✅ PWA data synced to Hub successfully!')
    
    setSelectedDrillHole(drillHole)
    setView('dashboard')
  }

  // Photo sync handlers
  const handleUploadPhotos = async (photosToUpload: PhotoMetadata[]) => {
    console.log('🔄 Uploading photos to hub:', photosToUpload.length)
    // Simulate upload delay
    await new Promise(resolve => setTimeout(resolve, 2000))
    console.log('✅ Photos uploaded successfully')
  }

  const handleDownloadPhotos = async (): Promise<PhotoMetadata[]> => {
    console.log('🔄 Downloading photos from hub')
    // Simulate download delay
    await new Promise(resolve => setTimeout(resolve, 1500))
    console.log('✅ Photos downloaded successfully')
    return [] // Return empty for now, would come from hub API
  }

  const handlePhotoClick = (photo: PhotoMetadata) => {
    console.log('📸 Photo clicked:', photo.id)
  }

  // Session handlers
  const handleDrillHoleSelected = (drillHole: DrillHole, project: Project) => {
    setSelectedDrillHole(drillHole)
    setView('session-timeline')
  }

  const handleNewSession = () => {
    setView('dashboard')
  }

  const handleContinueSession = () => {
    if (selectedDrillHole) {
      // Find the project for the selected drill hole
      const project = projects.find(p => p.drillHoles.some(dh => dh.id === selectedDrillHole.id))
      if (project) {
        setView('3d')
      }
    }
  }

  // Loading state
  if (authLoading || sessionLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-blue-400 mx-auto mb-4" />
          <p className="text-white text-lg">Cargando...</p>
        </div>
      </div>
    )
  }

  // Authentication required
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 flex items-center justify-center p-4">
        {authMode === 'login' ? (
          <LoginForm 
            onSuccess={() => setView('dashboard')}
            onSwitchToRegister={() => setAuthMode('register')}
          />
        ) : (
          <RegisterForm 
            onSuccess={() => setView('dashboard')}
            onSwitchToLogin={() => setAuthMode('login')}
          />
        )}
      </div>
    )
  }

  return (
    <div className="h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 flex flex-col">
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

            {/* User Info */}
            <div className="flex items-center gap-4">
              <div className="text-right text-sm text-gray-300">
                <div className="font-medium text-white">{user?.name}</div>
                <div className="text-xs">{user?.role && user.role.charAt(0).toUpperCase() + user.role.slice(1)}</div>
              </div>
              
              <button
                onClick={() => {
                  // Handle logout
                  window.location.reload()
                }}
                className="px-3 py-2 bg-red-600/20 hover:bg-red-600/30 text-red-400 rounded-lg text-sm font-medium transition-colors border border-red-500/30"
              >
                Logout
              </button>
            </div>
            
            <div className="flex gap-2 flex-wrap">
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
                  🎮 3D Individual
                </button>
              )}
              {projects.length > 0 && (
                <>
                  <button
                    onClick={() => setView('multi-3d')}
                    className={`px-4 py-2 rounded-lg font-semibold transition-all ${
                      view === 'multi-3d'
                        ? 'bg-orange-600 text-white shadow-lg shadow-orange-500/50'
                        : 'bg-white/10 text-gray-300 hover:bg-white/20'
                    }`}
                  >
                    🗺️ Multi-3D
                  </button>
                  <button
                    onClick={() => setView('multi-analysis')}
                    className={`px-4 py-2 rounded-lg font-semibold transition-all ${
                      view === 'multi-analysis'
                        ? 'bg-cyan-600 text-white shadow-lg shadow-cyan-500/50'
                        : 'bg-white/10 text-gray-300 hover:bg-white/20'
                    }`}
                  >
                    📊 Análisis Multi
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 overflow-hidden">
        {view === 'dashboard' && (
          <div className="h-full overflow-y-auto">
            <div className="container mx-auto px-4 py-8">
              <Dashboard 
                projects={projects} 
                onSelectDrillHole={(dh) => {
                  setSelectedDrillHole(dh)
                  setView('3d')
                }}
                onImportClick={() => setView('upload')}
                onProjectsUpdate={(newProjects) => setProjects(newProjects)}
                photos={photos}
                onUploadPhotos={handleUploadPhotos}
                onDownloadPhotos={handleDownloadPhotos}
                onPhotoClick={handlePhotoClick}
                onDownloadPhoto={downloadPhoto}
                onRemovePhoto={removePhoto}
              />
            </div>
          </div>
        )}
        
        {view === 'upload' && (
          <div className="h-full overflow-y-auto">
            <div className="container mx-auto px-4 py-8">
              <CSVUploader onDataImported={handleDataImported} />
            </div>
          </div>
        )}

        {view === '3d' && selectedDrillHole && (
          <DrillHoleViewer3D drillHole={selectedDrillHole} />
        )}
        
        {view === 'multi-3d' && (
          <MultiDrillHoleViewer3D 
            projects={projects} 
            onProjectsUpdate={(newProjects) => setProjects(newProjects)}
          />
        )}
        
        {view === 'multi-analysis' && (
          <div className="h-full overflow-y-auto">
            <div className="container mx-auto px-4 py-8">
              <MultiDrillHoleAnalysis projects={projects} />
            </div>
          </div>
        )}
        
        {view === 'session-restore' && (
          <div className="h-full overflow-y-auto">
            <div className="container mx-auto px-4 py-8">
              <SessionRestore
                projects={projects}
                onDrillHoleSelected={handleDrillHoleSelected}
                onNewSession={handleNewSession}
              />
            </div>
          </div>
        )}

        {view === 'session-timeline' && selectedDrillHole && sessionState && (
          <div className="h-full overflow-y-auto">
            <div className="container mx-auto px-4 py-8">
              <SessionTimeline
                drillHole={selectedDrillHole}
                projectName={projects.find(p => p.drillHoles.some(dh => dh.id === selectedDrillHole.id))?.name || 'Proyecto'}
                progress={sessionState.sessionData.drillHoleProgress[selectedDrillHole.id] || {
                  drillHoleId: selectedDrillHole.id,
                  drillHoleName: selectedDrillHole.name,
                  projectId: projects.find(p => p.drillHoles.some(dh => dh.id === selectedDrillHole.id))?.id || '',
                  projectName: projects.find(p => p.drillHoles.some(dh => dh.id === selectedDrillHole.id))?.name || 'Proyecto',
                  currentDepth: 0,
                  lastMeasurementDepth: 0,
                  sessionStartTime: new Date(),
                  totalMeasurements: 0,
                  totalPhotos: photos.length,
                  sessionDuration: 0,
                  lastSaved: new Date(),
                  isActive: true
                }}
                photos={photos}
                onPhotoClick={handlePhotoClick}
                onDownloadPhoto={downloadPhoto}
                onRemovePhoto={removePhoto}
                onContinueSession={handleContinueSession}
              />
            </div>
          </div>
        )}
      </main>
    </div>
  )
}

export default function HubPage() {
  return (
    <AuthProvider>
      <HubPageContent />
    </AuthProvider>
  )
}
