'use client'

import { useState, useEffect, useMemo } from 'react'
import { useSessionPersistence } from '@/hooks/use-session-persistence'
import { DrillHoleProgress } from '@/types/session'
import { DrillHole, Scene } from '@/types/geostxr-data'
import { PhotoMetadata } from '@/hooks/use-photo-registry'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { 
  Clock, 
  MapPin, 
  Camera, 
  Activity, 
  Play, 
  Pause,
  RotateCcw,
  Eye,
  Download,
  X,
  ChevronLeft,
  ChevronRight,
  Calendar,
  Timer,
  Target
} from 'lucide-react'

interface SessionTimelineProps {
  drillHole: DrillHole
  projectName: string
  progress: DrillHoleProgress
  photos: PhotoMetadata[]
  onPhotoClick?: (photo: PhotoMetadata) => void
  onDownloadPhoto?: (photoId: string) => void
  onRemovePhoto?: (photoId: string) => void
  onContinueSession?: () => void
}

export function SessionTimeline({
  drillHole,
  projectName,
  progress,
  photos,
  onPhotoClick,
  onDownloadPhoto,
  onRemovePhoto,
  onContinueSession
}: SessionTimelineProps) {
  const [selectedPhoto, setSelectedPhoto] = useState<PhotoMetadata | null>(null)
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0)
  const [hoveredPhoto, setHoveredPhoto] = useState<PhotoMetadata | null>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [playbackSpeed, setPlaybackSpeed] = useState(1)

  // Filter photos for this drill hole
  const drillHolePhotos = useMemo(() => {
    return photos.filter(photo => 
      photo.planeId && drillHole.scenes.some(scene => 
        scene.structures.some(structure => structure.id === photo.planeId)
      )
    ).sort((a, b) => (a.depth || 0) - (b.depth || 0))
  }, [photos, drillHole])

  // Format depth for display
  const formatDepth = (depth: number) => {
    if (depth < 100) {
      return `${depth.toFixed(1)}cm`
    } else {
      return `${(depth / 100).toFixed(2)}m`
    }
  }

  // Format timestamp
  const formatTimestamp = (timestamp: Date) => {
    return new Intl.DateTimeFormat('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(timestamp)
  }

  // Calculate timeline data
  const timelineData = useMemo(() => {
    const sortedPhotos = [...drillHolePhotos].sort((a, b) => (a.depth || 0) - (b.depth || 0))
    const maxDepth = Math.max(...sortedPhotos.map(p => p.depth || 0), drillHole.totalDepth * 100)
    
    const allMarkers = [
      // Add scene markers
      ...drillHole.scenes.map((scene, index) => ({
        depth: scene.depthStart * 100,
        depthPercent: (scene.depthStart * 100 / maxDepth) * 100,
        isScene: true,
        sceneNumber: index + 1
      })),
      // Add photo markers
      ...sortedPhotos.map(photo => ({
        depth: photo.depth || 0,
        depthPercent: ((photo.depth || 0) / maxDepth) * 100,
        isScene: false,
        photo
      }))
    ].sort((a, b) => a.depth - b.depth)

    return {
      sortedPhotos,
      allMarkers,
      maxDepth
    }
  }, [drillHolePhotos, drillHole])

  return (
    <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="text-2xl">📏</div>
          <div>
            <h3 className="text-xl font-bold text-white">
              Timeline de Capturas
            </h3>
            <p className="text-sm text-gray-400">
              {drillHole.name} • {projectName}
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <Button
            onClick={onContinueSession}
            className="bg-green-600 hover:bg-green-700 text-white"
          >
            <Play className="w-4 h-4 mr-2" />
            Continuar Sesión
          </Button>
        </div>
      </div>

      {/* Progress Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card className="bg-white/5 border-white/10">
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Camera className="w-5 h-5 text-blue-400" />
              <div>
                <p className="text-sm text-gray-400">Fotos Capturadas</p>
                <p className="text-xl font-bold text-white">{drillHolePhotos.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white/5 border-white/10">
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Target className="w-5 h-5 text-green-400" />
              <div>
                <p className="text-sm text-gray-400">Profundidad Actual</p>
                <p className="text-xl font-bold text-white">
                  {formatDepth(progress.currentDepth * 100)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white/5 border-white/10">
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Activity className="w-5 h-5 text-purple-400" />
              <div>
                <p className="text-sm text-gray-400">Mediciones</p>
                <p className="text-xl font-bold text-white">{progress.totalMeasurements}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white/5 border-white/10">
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Timer className="w-5 h-5 text-orange-400" />
              <div>
                <p className="text-sm text-gray-400">Duración</p>
                <p className="text-xl font-bold text-white">
                  {Math.round(progress.sessionDuration / 60)}min
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Timeline */}
      <Card className="bg-white/5 border-white/10">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Clock className="w-5 h-5" />
            Línea de Tiempo del Sondaje
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="relative h-32 bg-gradient-to-r from-blue-900/50 to-purple-900/50 rounded-lg p-4">
            {/* Timeline Line */}
            <div className="absolute top-8 left-4 right-4 h-1 bg-white/30 rounded-full">
              <div 
                className="h-full bg-gradient-to-r from-blue-400 to-purple-400 rounded-full"
                style={{ width: `${(progress.currentDepth / drillHole.totalDepth) * 100}%` }}
              />
            </div>

            {/* Scene Markers */}
            {timelineData.allMarkers
              .filter(marker => marker.isScene)
              .map((marker) => (
                <div
                  key={`scene-${(marker as any).sceneNumber}`}
                  className="absolute top-2 w-3 h-3 bg-green-400 rounded-full border-2 border-white shadow-lg"
                  style={{ left: `${marker.depthPercent}%` }}
                  title={`Escena ${(marker as any).sceneNumber}: ${formatDepth(marker.depth)}`}
                />
              ))}

            {/* Photo Markers */}
            {timelineData.allMarkers
              .filter(marker => !marker.isScene)
              .map((marker) => (
                <div
                  key={'photo' in marker ? marker.photo.id : `scene-${(marker as any).sceneNumber}`}
                  className="absolute top-2 cursor-pointer group"
                  style={{ left: `${marker.depthPercent}%` }}
                  onClick={() => {
                    if ('photo' in marker) {
                      setSelectedPhoto(marker.photo)
                      setCurrentPhotoIndex(timelineData.sortedPhotos.findIndex(p => p.id === marker.photo.id))
                      if ('photo' in marker) {
                        onPhotoClick?.(marker.photo)
                      }
                    }
                  }}
                  onMouseEnter={() => {
                    if ('photo' in marker) {
                      setHoveredPhoto(marker.photo)
                    }
                  }}
                  onMouseLeave={() => setHoveredPhoto(null)}
                >
                  {/* Photo Thumbnail */}
                  <div className="relative w-16 h-20 bg-black rounded-lg overflow-hidden border-2 border-purple-400 shadow-lg group-hover:border-yellow-400 transition-all">
                    {'photo' in marker && (
                      <img
                        src={marker.photo.imageDataUrl}
                        alt={`Foto a ${formatDepth(marker.photo.depth || 0)}`}
                        className="w-full h-full object-cover"
                      />
                    )}
                    
                    {/* Depth Badge */}
                    <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2">
                      <Badge variant="secondary" className="text-xs px-1 py-0">
                        {'photo' in marker ? formatDepth(marker.photo.depth || 0) : formatDepth(marker.depth)}
                      </Badge>
                    </div>
                  </div>
                </div>
              ))}

            {/* Hover Info Panel */}
            {hoveredPhoto && (
              <div className="absolute top-0 left-4 bg-black/80 backdrop-blur-sm rounded-lg p-3 text-white text-sm z-10 pointer-events-none">
                <div className="font-medium mb-1">
                  Foto a {formatDepth(hoveredPhoto.depth || 0)}
                </div>
                <div className="text-xs text-gray-300 space-y-1">
                  <div className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {formatTimestamp(hoveredPhoto.timestamp)}
                  </div>
                  {hoveredPhoto.angles && (
                    <div className="flex items-center gap-1">
                      <Target className="w-3 h-3" />
                      α:{hoveredPhoto.angles.alpha.toFixed(1)}° β:{hoveredPhoto.angles.beta.toFixed(1)}°
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Timeline Legend */}
          <div className="flex items-center justify-center gap-6 mt-4 text-xs text-gray-400">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-green-400 rounded-full"></div>
              <span>Escenas</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-5 bg-purple-400 rounded border-2 border-white"></div>
              <span>Fotos</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-8 h-1 bg-gradient-to-r from-blue-400 to-purple-400 rounded"></div>
              <span>Progreso</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Photo Viewer Modal */}
      {selectedPhoto && (
        <div className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4">
          <div className="relative max-w-4xl max-h-full bg-white rounded-lg overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between p-4 bg-gray-100 border-b">
              <div className="flex items-center gap-4">
                <h3 className="font-semibold text-gray-800">
                  {drillHole.name} - {formatDepth(selectedPhoto.depth || 0)}
                </h3>
                <Badge variant="secondary" className="text-xs">
                  {formatTimestamp(selectedPhoto.timestamp)}
                </Badge>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSelectedPhoto(null)}
              >
                <X className="w-4 h-4" />
              </Button>
            </div>

            {/* Content */}
            <div className="p-4 max-h-96 overflow-y-auto">
              {/* Photo */}
              <div className="mb-4">
                <img
                  src={selectedPhoto.imageDataUrl}
                  alt={`Foto a ${formatDepth(selectedPhoto.depth || 0)}`}
                  className="max-w-full h-auto rounded-lg shadow-lg"
                />
              </div>

              {/* Metadata */}
              <div className="space-y-3">
                <div>
                  <span className="font-medium text-gray-600">Profundidad:</span>
                  <span className="ml-2">{formatDepth(selectedPhoto.depth || 0)}</span>
                </div>
                
                {selectedPhoto.angles && (
                  <div>
                    <span className="font-medium text-gray-600">Ángulos:</span>
                    <div className="ml-2 text-sm text-gray-700">
                      <div>Alpha: {selectedPhoto.angles.alpha.toFixed(1)}°</div>
                      <div>Beta: {selectedPhoto.angles.beta.toFixed(1)}°</div>
                      <div>Azimut: {selectedPhoto.angles.azimuth.toFixed(1)}°</div>
                    </div>
                  </div>
                )}
                
                {selectedPhoto.notes && (
                  <div>
                    <span className="font-medium text-gray-600">Notas:</span>
                    <p className="text-gray-700 mt-1">{selectedPhoto.notes}</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
