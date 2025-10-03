'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/hooks/use-auth'
import { useSessionPersistence } from '@/hooks/use-session-persistence'
import { DrillHoleProgress, SessionRestoreOptions } from '@/types/session'
import { DrillHole, Project } from '@/types/geostxr-data'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { 
  Clock, 
  MapPin, 
  Camera, 
  Activity, 
  Play, 
  Plus, 
  ArrowRight,
  Calendar,
  Timer,
  Target
} from 'lucide-react'

interface SessionRestoreProps {
  projects: Project[]
  onDrillHoleSelected: (drillHole: DrillHole, project: Project) => void
  onNewSession: () => void
}

export function SessionRestore({ projects, onDrillHoleSelected, onNewSession }: SessionRestoreProps) {
  const { user } = useAuth()
  const { 
    getActiveDrillHoles, 
    getRecentPhotos, 
    hasPreviousSession,
    getSessionStats,
    setCurrentDrillHole
  } = useSessionPersistence()
  
  const [activeDrillHoles, setActiveDrillHoles] = useState<DrillHoleProgress[]>([])
  const [selectedDrillHole, setSelectedDrillHole] = useState<DrillHoleProgress | null>(null)
  const [sessionStats, setSessionStats] = useState<any>(null)

  useEffect(() => {
    const activeHoles = getActiveDrillHoles()
    setActiveDrillHoles(activeHoles)
    setSessionStats(getSessionStats())
  }, [getActiveDrillHoles, getSessionStats])

  const handleDrillHoleSelect = (progress: DrillHoleProgress) => {
    const project = projects.find(p => p.id === progress.projectId)
    const drillHole = project?.drillHoles.find(dh => dh.id === progress.drillHoleId)
    
    if (project && drillHole) {
      setCurrentDrillHole(progress.drillHoleId, progress.projectId)
      onDrillHoleSelected(drillHole, project)
    }
  }

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60
    if (hours > 0) {
      return `${hours}h ${mins}m`
    }
    return `${mins}m`
  }

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('es-ES', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date)
  }

  const getDrillHoleFromProgress = (progress: DrillHoleProgress) => {
    const project = projects.find(p => p.id === progress.projectId)
    return project?.drillHoles.find(dh => dh.id === progress.drillHoleId)
  }

  if (!user) {
    return null
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="text-6xl mb-4">🌐</div>
          <h1 className="text-3xl font-bold text-white mb-2">
            ¡Bienvenido de vuelta, {user.name}!
          </h1>
          <p className="text-gray-400">
            Continúa donde lo dejaste o inicia una nueva sesión
          </p>
        </div>

        {/* Session Statistics */}
        {sessionStats && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <Card className="bg-white/10 backdrop-blur-lg border-white/20">
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <Target className="w-5 h-5 text-blue-400" />
                  <div>
                    <div className="text-2xl font-bold text-white">{sessionStats.totalDrillHoles}</div>
                    <div className="text-xs text-gray-400">Sondajes Activos</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white/10 backdrop-blur-lg border-white/20">
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <Activity className="w-5 h-5 text-green-400" />
                  <div>
                    <div className="text-2xl font-bold text-white">{sessionStats.totalMeasurements}</div>
                    <div className="text-xs text-gray-400">Mediciones</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white/10 backdrop-blur-lg border-white/20">
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <Camera className="w-5 h-5 text-purple-400" />
                  <div>
                    <div className="text-2xl font-bold text-white">{sessionStats.totalPhotos}</div>
                    <div className="text-xs text-gray-400">Fotos</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white/10 backdrop-blur-lg border-white/20">
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <Timer className="w-5 h-5 text-orange-400" />
                  <div>
                    <div className="text-2xl font-bold text-white">{formatDuration(sessionStats.sessionDuration)}</div>
                    <div className="text-xs text-gray-400">Tiempo Total</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Active Drill Holes */}
        {activeDrillHoles.length > 0 ? (
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-white mb-2">
                Sondajes en Progreso
              </h2>
              <p className="text-gray-400">
                Selecciona un sondaje para continuar donde lo dejaste
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {activeDrillHoles.map((progress) => {
                const drillHole = getDrillHoleFromProgress(progress)
                const recentPhotos = getRecentPhotos(progress.drillHoleId, 3)
                
                if (!drillHole) return null

                return (
                  <Card 
                    key={progress.drillHoleId}
                    className="bg-white/10 backdrop-blur-lg border-white/20 hover:border-blue-400 transition-all cursor-pointer group"
                    onClick={() => setSelectedDrillHole(progress)}
                  >
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <div>
                          <CardTitle className="text-white text-lg">
                            {progress.drillHoleName}
                          </CardTitle>
                          <CardDescription className="text-gray-400">
                            {progress.projectName}
                          </CardDescription>
                        </div>
                        <Badge variant="secondary" className="bg-green-500/20 text-green-400 border-green-500/30">
                          Activo
                        </Badge>
                      </div>
                    </CardHeader>

                    <CardContent className="space-y-4">
                      {/* Progress Info */}
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div className="flex items-center gap-2">
                          <MapPin className="w-4 h-4 text-blue-400" />
                          <div>
                            <div className="text-white font-medium">{progress.currentDepth} cm</div>
                            <div className="text-gray-400 text-xs">Profundidad actual</div>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <Activity className="w-4 h-4 text-green-400" />
                          <div>
                            <div className="text-white font-medium">{progress.totalMeasurements}</div>
                            <div className="text-gray-400 text-xs">Mediciones</div>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <Camera className="w-4 h-4 text-purple-400" />
                          <div>
                            <div className="text-white font-medium">{progress.totalPhotos}</div>
                            <div className="text-gray-400 text-xs">Fotos</div>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <Clock className="w-4 h-4 text-orange-400" />
                          <div>
                            <div className="text-white font-medium">
                              {formatDate(progress.lastSaved)}
                            </div>
                            <div className="text-gray-400 text-xs">Última actividad</div>
                          </div>
                        </div>
                      </div>

                      {/* Recent Photos Preview */}
                      {recentPhotos.length > 0 && (
                        <div className="space-y-2">
                          <div className="text-xs text-gray-400">Fotos recientes:</div>
                          <div className="flex gap-2">
                            {recentPhotos.map((photo, index) => (
                              <div
                                key={photo.id}
                                className="w-12 h-12 rounded-lg overflow-hidden bg-gray-800 border border-gray-600"
                              >
                                <img
                                  src={photo.imageDataUrl}
                                  alt={`Foto ${index + 1}`}
                                  className="w-full h-full object-cover"
                                />
                              </div>
                            ))}
                            {recentPhotos.length < 3 && (
                              <div className="w-12 h-12 rounded-lg bg-gray-800/50 border border-gray-600 flex items-center justify-center">
                                <Camera className="w-4 h-4 text-gray-400" />
                              </div>
                            )}
                          </div>
                        </div>
                      )}

                      {/* Action Button */}
                      <Button
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white group-hover:bg-blue-700 transition-colors"
                        onClick={(e) => {
                          e.stopPropagation()
                          handleDrillHoleSelect(progress)
                        }}
                      >
                        <Play className="w-4 h-4 mr-2" />
                        Continuar Sondaje
                        <ArrowRight className="w-4 h-4 ml-2" />
                      </Button>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          </div>
        ) : (
          <div className="text-center mb-8">
            <div className="text-6xl mb-4">🆕</div>
            <h2 className="text-2xl font-bold text-white mb-2">
              No hay sesiones activas
            </h2>
            <p className="text-gray-400 mb-6">
              Comienza un nuevo sondaje o selecciona uno existente
            </p>
          </div>
        )}

        {/* New Session Button */}
        <div className="text-center">
          <Button
            onClick={onNewSession}
            className="bg-green-600 hover:bg-green-700 text-white px-8 py-3 text-lg font-semibold"
          >
            <Plus className="w-5 h-5 mr-2" />
            Iniciar Nueva Sesión
          </Button>
        </div>
      </div>
    </div>
  )
}
