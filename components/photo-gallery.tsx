'use client'

import { useState, useCallback } from 'react'
import { PhotoMetadata } from '@/hooks/use-photo-registry'
import { X, Download, Eye, Calendar, Tag, MapPin, RotateCcw, RotateCw } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

interface PhotoGalleryProps {
  photos: PhotoMetadata[]
  onRemovePhoto?: (photoId: string) => void
  onDownloadPhoto?: (photoId: string) => void
  onUpdateMetadata?: (photoId: string, metadata: Partial<PhotoMetadata>) => void
  selectedStructureId?: string
  drillHoleName?: string
}

export function PhotoGallery({ 
  photos, 
  onRemovePhoto, 
  onDownloadPhoto, 
  onUpdateMetadata,
  selectedStructureId,
  drillHoleName 
}: PhotoGalleryProps) {
  const [selectedPhoto, setSelectedPhoto] = useState<PhotoMetadata | null>(null)
  const [filteredPhotos, setFilteredPhotos] = useState<PhotoMetadata[]>(photos)
  const [filterByStructure, setFilterByStructure] = useState(selectedStructureId || '')

  // Filter photos based on structure selection
  const handleFilterChange = useCallback((structureId: string) => {
    setFilterByStructure(structureId)
    if (structureId) {
      setFilteredPhotos(photos.filter(p => p.planeId === structureId))
    } else {
      setFilteredPhotos(photos)
    }
  }, [photos])

  // Get unique structure IDs from photos
  const structureIds = [...new Set(photos.map(p => p.planeId).filter(Boolean))]

  const formatTimestamp = (date: Date) => {
    return new Intl.DateTimeFormat('es-ES', {
      year: 'numeric',
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
              {drillHoleName && `${drillHoleName} - `}
              Foto {photo.planeNumber || 'Sin número'}
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
              <X className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Image */}
        <div className="relative bg-black flex items-center justify-center">
          <img
            src={photo.imageDataUrl}
            alt={`Foto estructura ${photo.planeNumber || 'desconocida'}`}
            className="max-w-full max-h-[70vh] object-contain"
          />
        </div>

        {/* Metadata */}
        <div className="p-4 bg-gray-50 border-t">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            {photo.depth && (
              <div>
                <span className="font-medium text-gray-600">Profundidad:</span>
                <div>{photo.depth} cm</div>
              </div>
            )}
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
            {photo.bohAngles && (
              <>
                <div>
                  <span className="font-medium text-gray-600">BOH1:</span>
                  <div>{photo.bohAngles.line1.toFixed(1)}°</div>
                </div>
                <div>
                  <span className="font-medium text-gray-600">BOH2:</span>
                  <div>{photo.bohAngles.line2.toFixed(1)}°</div>
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
          
          {photo.tags && photo.tags.length > 0 && (
            <div className="mt-3 pt-3 border-t">
              <span className="font-medium text-gray-600">Tags:</span>
              <div className="flex flex-wrap gap-1 mt-1">
                {photo.tags.map((tag, index) => (
                  <Badge key={index} variant="outline" className="text-xs">
                    {tag}
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )

  if (photos.length === 0) {
    return (
      <div className="bg-white/5 backdrop-blur-lg rounded-xl p-12 border border-white/10 text-center">
        <div className="text-6xl mb-4">📸</div>
        <h3 className="text-xl font-bold text-white mb-2">
          No hay fotos disponibles
        </h3>
        <p className="text-gray-400">
          Las fotos capturadas desde GEOSTXR aparecerán aquí
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header and Filters */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <h3 className="text-xl font-bold text-white flex items-center gap-2">
            <span>📸</span>
            Galería de Fotos
          </h3>
          <Badge variant="secondary" className="text-sm">
            {filteredPhotos.length} de {photos.length} fotos
          </Badge>
        </div>

        {/* Structure Filter */}
        {structureIds.length > 0 && (
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-400">Filtrar por estructura:</span>
            <select
              value={filterByStructure}
              onChange={(e) => handleFilterChange(e.target.value)}
              className="px-3 py-1 bg-white/10 border border-white/20 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Todas las estructuras</option>
              {structureIds.map(structureId => (
                <option key={structureId} value={structureId}>
                  Estructura {structureId}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* Photo Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {filteredPhotos.map(photo => (
          <div
            key={photo.id}
            className="bg-white/10 backdrop-blur-lg rounded-xl overflow-hidden border border-white/20 hover:border-blue-400 transition-all group cursor-pointer"
            onClick={() => setSelectedPhoto(photo)}
          >
            {/* Thumbnail */}
            <div className="relative aspect-square bg-black">
              <img
                src={photo.imageDataUrl}
                alt={`Foto ${photo.planeNumber || 'desconocida'}`}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform"
              />
              
              {/* Overlay info */}
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors flex items-end">
                <div className="p-3 opacity-0 group-hover:opacity-100 transition-opacity">
                  <div className="text-white text-sm">
                    {photo.planeNumber && (
                      <div className="font-semibold">Plano {photo.planeNumber}</div>
                    )}
                    {photo.depth && (
                      <div>{photo.depth} cm</div>
                    )}
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <div className="flex gap-1">
                  <Button
                    size="sm"
                    variant="secondary"
                    className="h-8 w-8 p-0"
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
                      className="h-8 w-8 p-0"
                      onClick={(e) => {
                        e.stopPropagation()
                        onDownloadPhoto(photo.id)
                      }}
                    >
                      <Download className="w-3 h-3" />
                    </Button>
                  )}
                  {onRemovePhoto && (
                    <Button
                      size="sm"
                      variant="destructive"
                      className="h-8 w-8 p-0"
                      onClick={(e) => {
                        e.stopPropagation()
                        onRemovePhoto(photo.id)
                      }}
                    >
                      <X className="w-3 h-3" />
                    </Button>
                  )}
                </div>
              </div>
            </div>

            {/* Metadata */}
            <div className="p-3 space-y-2">
              <div className="flex items-center justify-between text-xs text-gray-400">
                <div className="flex items-center gap-1">
                  <Calendar className="w-3 h-3" />
                  {formatTimestamp(photo.timestamp)}
                </div>
                {photo.planeId && (
                  <Badge variant="outline" className="text-xs">
                    #{photo.planeId}
                  </Badge>
                )}
              </div>

              {photo.depth && (
                <div className="text-sm text-gray-300">
                  Profundidad: {photo.depth} cm
                </div>
              )}

              {photo.angles && (
                <div className="text-xs text-gray-400 space-y-1">
                  <div>α: {photo.angles.alpha.toFixed(1)}°</div>
                  <div>β: {photo.angles.beta.toFixed(1)}°</div>
                  <div>Az: {photo.angles.azimuth.toFixed(1)}°</div>
                </div>
              )}

              {photo.tags && photo.tags.length > 0 && (
                <div className="flex flex-wrap gap-1">
                  {photo.tags.slice(0, 2).map((tag, index) => (
                    <Badge key={index} variant="secondary" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                  {photo.tags.length > 2 && (
                    <Badge variant="secondary" className="text-xs">
                      +{photo.tags.length - 2}
                    </Badge>
                  )}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Photo Viewer Modal */}
      {selectedPhoto && (
        <PhotoViewer photo={selectedPhoto} />
      )}
    </div>
  )
}
