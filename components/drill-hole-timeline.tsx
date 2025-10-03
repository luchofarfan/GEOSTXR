'use client'

import { useState, useCallback, useMemo } from 'react'
import { PhotoMetadata } from '@/hooks/use-photo-registry'
import type { DrillHole, Scene } from '@/types/geostxr-data'
import { Eye, Download, MapPin, Clock, Camera, ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

interface DrillHoleTimelineProps {
  drillHole: DrillHole
  photos: PhotoMetadata[]
  onPhotoClick?: (photo: PhotoMetadata) => void
  onDownloadPhoto?: (photoId: string) => void
  onRemovePhoto?: (photoId: string) => void
}

interface PhotoWithPosition extends PhotoMetadata {
  depthPercent: number // 0-100% along the timeline
  depthMeters: number // Converted to meters
}

export function DrillHoleTimeline({ 
  drillHole, 
  photos, 
  onPhotoClick, 
  onDownloadPhoto,
  onRemovePhoto 
}: DrillHoleTimelineProps) {
  const [selectedPhoto, setSelectedPhoto] = useState<PhotoMetadata | null>(null)
  const [hoveredPhoto, setHoveredPhoto] = useState<PhotoMetadata | null>(null)

  // Calculate photo positions along the timeline
  const photosWithPositions = useMemo((): PhotoWithPosition[] => {
    const maxDepthMeters = drillHole.totalDepth
    
    return photos
      .map(photo => {
        const depthMeters = (photo.depth || 0) / 100 // Convert cm to meters
        const depthPercent = maxDepthMeters > 0 ? (depthMeters / maxDepthMeters) * 100 : 0
        
        return {
          ...photo,
          depthPercent: Math.min(Math.max(depthPercent, 0), 100),
          depthMeters
        }
      })
      .sort((a, b) => a.depthMeters - b.depthMeters) // Sort by depth
  }, [photos, drillHole.totalDepth])

  // Get scenes with their positions
  const scenesWithPositions = useMemo(() => {
    const maxDepthMeters = drillHole.totalDepth
    
    return drillHole.scenes.map(scene => {
      const startDepthMeters = scene.depthStart / 100
      const endDepthMeters = scene.depthEnd / 100
      const startPercent = maxDepthMeters > 0 ? (startDepthMeters / maxDepthMeters) * 100 : 0
      const endPercent = maxDepthMeters > 0 ? (endDepthMeters / maxDepthMeters) * 100 : 0
      
      return {
        ...scene,
        startDepthMeters,
        endDepthMeters,
        startPercent: Math.min(Math.max(startPercent, 0), 100),
        endPercent: Math.min(Math.max(endPercent, 0), 100)
      }
    })
  }, [drillHole.scenes, drillHole.totalDepth])

  const formatDepth = (meters: number) => {
    return `${meters.toFixed(1)}m`
  }

  const formatTimestamp = (date: Date) => {
    return new Intl.DateTimeFormat('es-ES', {
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date)
  }

  const PhotoViewer = ({ photo }: { photo: PhotoMetadata }) => (
    <div className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4">
      <div className="relative max-w-4xl max-h-full bg-white rounded-lg overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 bg-gray-100 border-b">
          <div className="flex items-center gap-4">
            <h3 className="font-semibold text-gray-800">
              {drillHole.name} - {formatDepth(photo.depth || 0)}
            </h3>
            <Badge variant="secondary" className="text-xs">
              {formatTimestamp(photo.timestamp)}
            </Badge>
          </div>
          
          <div className="flex items-center gap-2">
            {onDownloadPhoto && (
              <Button
                size="sm"
                variant="outline"
                onClick={() => onDownloadPhoto(photo.id)}
              >
                <Download className="w-4 h-4 mr-2" />
                Descargar
              </Button>
            )}
            <Button
              size="sm"
              variant="ghost"
              onClick={() => setSelectedPhoto(null)}
            >
              <span className="text-xl">×</span>
            </Button>
          </div>
        </div>

        {/* Image */}
        <div className="relative bg-black flex items-center justify-center">
          <img
            src={photo.imageDataUrl}
            alt={`Foto a ${formatDepth(photo.depth || 0)}`}
            className="max-w-full max-h-[70vh] object-contain"
          />
        </div>

        {/* Metadata */}
        <div className="p-4 bg-gray-50 border-t">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div>
              <span className="font-medium text-gray-600">Profundidad:</span>
              <div>{formatDepth(photo.depth || 0)}</div>
            </div>
            {photo.angles && (
              <>
                <div>
                  <span className="font-medium text-gray-600">Alpha:</span>
                  <div>{photo.angles.alpha.toFixed(1)}°</div>
                </div>
                <div>
                  <span className="font-medium text-gray-600">Beta:</span>
                  <div>{photo.angles.beta.toFixed(1)}°</div>
                </div>
                <div>
                  <span className="font-medium text-gray-600">Azimuth:</span>
                  <div>{photo.angles.azimuth.toFixed(1)}°</div>
                </div>
              </>
            )}
          </div>
          
          {photo.notes && (
            <div className="mt-3 pt-3 border-t">
              <span className="font-medium text-gray-600">Notas:</span>
              <p className="text-gray-700 mt-1">{photo.notes}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )

  return (
    <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="text-2xl">📏</div>
          <div>
            <h3 className="text-xl font-bold text-white">
              Línea de Tiempo del Sondaje
            </h3>
            <p className="text-sm text-gray-400">
              {drillHole.name} • {formatDepth(drillHole.totalDepth)} total
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4 text-sm text-gray-400">
          <div className="flex items-center gap-1">
            <Camera className="w-4 h-4" />
            {photosWithPositions.length} fotos
          </div>
          <div className="flex items-center gap-1">
            <MapPin className="w-4 h-4" />
            {scenesWithPositions.length} escenas
          </div>
        </div>
      </div>

      {/* Timeline Container */}
      <div className="relative">
        {/* Depth Scale */}
        <div className="flex justify-between text-xs text-gray-400 mb-2">
          <span>0m</span>
          <span className="text-center">
            {formatDepth(drillHole.totalDepth / 4)}
          </span>
          <span className="text-center">
            {formatDepth(drillHole.totalDepth / 2)}
          </span>
          <span className="text-center">
            {formatDepth((drillHole.totalDepth * 3) / 4)}
          </span>
          <span>{formatDepth(drillHole.totalDepth)}</span>
        </div>

        {/* Main Timeline Line */}
        <div className="relative h-8 bg-gradient-to-r from-blue-600 via-blue-500 to-blue-700 rounded-full mb-4 shadow-lg">
          {/* Scene Markers */}
          {scenesWithPositions.map((scene, index) => (
            <div
              key={scene.id}
              className="absolute top-0 h-full flex items-center"
              style={{ left: `${scene.startPercent}%` }}
            >
              <div className="w-0.5 h-full bg-white/30"></div>
              <div className="absolute -top-6 left-1/2 transform -translate-x-1/2 text-xs text-white font-medium whitespace-nowrap">
                {formatDepth(scene.startDepthMeters)}
              </div>
            </div>
          ))}
        </div>

        {/* Photo Timeline */}
        <div className="relative h-32 bg-gradient-to-r from-slate-800 via-slate-700 to-slate-800 rounded-lg p-4 overflow-x-auto">
          <div className="relative h-full min-w-full">
            {/* Photo Markers */}
            {photosWithPositions.map((photo) => (
              <div
                key={photo.id}
                className="absolute top-2 cursor-pointer group"
                style={{ left: `${photo.depthPercent}%` }}
                onClick={() => {
                  setSelectedPhoto(photo)
                  onPhotoClick?.(photo)
                }}
                onMouseEnter={() => setHoveredPhoto(photo)}
                onMouseLeave={() => setHoveredPhoto(null)}
              >
                {/* Photo Thumbnail */}
                <div className="relative w-16 h-20 bg-black rounded-lg overflow-hidden border-2 border-blue-400 shadow-lg group-hover:border-yellow-400 transition-all">
                  <img
                    src={photo.imageDataUrl}
                    alt={`Foto a ${formatDepth(photo.depthMeters)}`}
                    className="w-full h-full object-cover"
                  />
                  
                  {/* Depth Badge */}
                  <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2">
                    <Badge variant="secondary" className="text-xs px-1 py-0">
                      {formatDepth(photo.depthMeters)}
                    </Badge>
                  </div>

                  {/* Hover Actions */}
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <div className="flex gap-1">
                      <Button
                        size="sm"
                        variant="secondary"
                        className="h-6 w-6 p-0"
                        onClick={(e) => {
                          e.stopPropagation()
                          setSelectedPhoto(photo)
                        }}
                      >
                        <Eye className="w-3 h-3" />
                      </Button>
                      {onDownloadPhoto && (
                        <Button
                          size="sm"
                          variant="secondary"
                          className="h-6 w-6 p-0"
                          onClick={(e) => {
                            e.stopPropagation()
                            onDownloadPhoto(photo.id)
                          }}
                        >
                          <Download className="w-3 h-3" />
                        </Button>
                      )}
                    </div>
                  </div>
                </div>

                {/* Connection Line to Timeline */}
                <div className="absolute -bottom-4 left-1/2 transform -translate-x-1/2 w-0.5 h-4 bg-blue-400"></div>
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
                    <div className="space-y-0.5">
                      <div>α: {hoveredPhoto.angles.alpha.toFixed(1)}°</div>
                      <div>β: {hoveredPhoto.angles.beta.toFixed(1)}°</div>
                      <div>Az: {hoveredPhoto.angles.azimuth.toFixed(1)}°</div>
                    </div>
                  )}
                  {hoveredPhoto.notes && (
                    <div className="mt-2 pt-2 border-t border-gray-600 max-w-xs">
                      {hoveredPhoto.notes}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Scene Information */}
        {scenesWithPositions.length > 0 && (
          <div className="mt-4 p-3 bg-white/5 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <ChevronRight className="w-4 h-4 text-blue-400" />
              <span className="text-sm font-medium text-white">Escenas de 30cm</span>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs text-gray-400">
              {scenesWithPositions.slice(0, 8).map((scene, index) => (
                <div key={scene.id} className="flex justify-between">
                  <span>Escena {index + 1}:</span>
                  <span className="text-white">
                    {formatDepth(scene.startDepthMeters)} - {formatDepth(scene.endDepthMeters)}
                  </span>
                </div>
              ))}
              {scenesWithPositions.length > 8 && (
                <div className="col-span-full text-center text-gray-500">
                  ... y {scenesWithPositions.length - 8} más
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Photo Viewer Modal */}
      {selectedPhoto && (
        <PhotoViewer photo={selectedPhoto} />
      )}
    </div>
  )
}
