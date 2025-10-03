'use client'

import { useState, useCallback, useRef } from 'react'
import { PhotoMetadata } from '@/hooks/use-photo-registry'
import { Upload, Download, Wifi, WifiOff, CheckCircle, AlertCircle, Clock, RefreshCw } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'

interface PhotoSyncProps {
  photos: PhotoMetadata[]
  onUploadPhotos?: (photos: PhotoMetadata[]) => Promise<void>
  onDownloadPhotos?: () => Promise<PhotoMetadata[]>
  drillHoleId?: string
  projectId?: string
}

interface SyncStatus {
  status: 'idle' | 'uploading' | 'downloading' | 'success' | 'error'
  progress: number
  message: string
  error?: string
}

export function PhotoSync({ 
  photos, 
  onUploadPhotos, 
  onDownloadPhotos, 
  drillHoleId,
  projectId 
}: PhotoSyncProps) {
  const [syncStatus, setSyncStatus] = useState<SyncStatus>({
    status: 'idle',
    progress: 0,
    message: ''
  })
  const [isOnline, setIsOnline] = useState(typeof navigator !== 'undefined' ? navigator.onLine : true)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Monitor online status
  useState(() => {
    if (typeof window === 'undefined') return

    const handleOnline = () => setIsOnline(true)
    const handleOffline = () => setIsOnline(false)

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  })

  // Upload photos to hub
  const handleUploadPhotos = useCallback(async () => {
    if (!onUploadPhotos || photos.length === 0) return

    setSyncStatus({
      status: 'uploading',
      progress: 0,
      message: 'Preparando fotos para subir...'
    })

    try {
      // Simulate upload progress
      const uploadProgress = () => {
        return new Promise<void>((resolve) => {
          const interval = setInterval(() => {
            setSyncStatus(prev => {
              const newProgress = Math.min(prev.progress + 10, 90)
              if (newProgress >= 90) {
                clearInterval(interval)
                resolve()
              }
              return {
                ...prev,
                progress: newProgress,
                message: `Subiendo fotos... ${newProgress}%`
              }
            })
          }, 200)
        })
      }

      await uploadProgress()
      await onUploadPhotos(photos)

      setSyncStatus({
        status: 'success',
        progress: 100,
        message: `✅ ${photos.length} fotos subidas exitosamente`
      })

      // Reset status after 3 seconds
      setTimeout(() => {
        setSyncStatus({
          status: 'idle',
          progress: 0,
          message: ''
        })
      }, 3000)

    } catch (error) {
      setSyncStatus({
        status: 'error',
        progress: 0,
        message: 'Error al subir fotos',
        error: error instanceof Error ? error.message : 'Error desconocido'
      })
    }
  }, [photos, onUploadPhotos])

  // Download photos from hub
  const handleDownloadPhotos = useCallback(async () => {
    if (!onDownloadPhotos) return

    setSyncStatus({
      status: 'downloading',
      progress: 0,
      message: 'Descargando fotos del hub...'
    })

    try {
      // Simulate download progress
      const downloadProgress = () => {
        return new Promise<void>((resolve) => {
          const interval = setInterval(() => {
            setSyncStatus(prev => {
              const newProgress = Math.min(prev.progress + 15, 90)
              if (newProgress >= 90) {
                clearInterval(interval)
                resolve()
              }
              return {
                ...prev,
                progress: newProgress,
                message: `Descargando fotos... ${newProgress}%`
              }
            })
          }, 150)
        })
      }

      await downloadProgress()
      const downloadedPhotos = await onDownloadPhotos()

      setSyncStatus({
        status: 'success',
        progress: 100,
        message: `✅ ${downloadedPhotos.length} fotos descargadas`
      })

      // Reset status after 3 seconds
      setTimeout(() => {
        setSyncStatus({
          status: 'idle',
          progress: 0,
          message: ''
        })
      }, 3000)

    } catch (error) {
      setSyncStatus({
        status: 'error',
        progress: 0,
        message: 'Error al descargar fotos',
        error: error instanceof Error ? error.message : 'Error desconocido'
      })
    }
  }, [onDownloadPhotos])

  // Import photos from file
  const handleImportPhotos = useCallback(async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files
    if (!files || files.length === 0) return

    setSyncStatus({
      status: 'uploading',
      progress: 0,
      message: 'Procesando archivos...'
    })

    try {
      const importedPhotos: PhotoMetadata[] = []

      for (let i = 0; i < files.length; i++) {
        const file = files[i]
        
        // Update progress
        setSyncStatus(prev => ({
          ...prev,
          progress: (i / files.length) * 100,
          message: `Procesando ${file.name}...`
        }))

        // Read file as data URL
        const dataUrl = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader()
          reader.onload = () => resolve(reader.result as string)
          reader.onerror = reject
          reader.readAsDataURL(file)
        })

        // Extract metadata from filename if possible
        const photo: PhotoMetadata = {
          id: `imported-${Date.now()}-${i}`,
          timestamp: new Date(file.lastModified || Date.now()),
          imageDataUrl: dataUrl,
          planeId: drillHoleId,
          notes: `Importado desde ${file.name}`
        }

        importedPhotos.push(photo)
      }

      // Upload imported photos
      if (onUploadPhotos) {
        await onUploadPhotos(importedPhotos)
      }

      setSyncStatus({
        status: 'success',
        progress: 100,
        message: `✅ ${importedPhotos.length} fotos importadas`
      })

      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }

      // Reset status after 3 seconds
      setTimeout(() => {
        setSyncStatus({
          status: 'idle',
          progress: 0,
          message: ''
        })
      }, 3000)

    } catch (error) {
      setSyncStatus({
        status: 'error',
        progress: 0,
        message: 'Error al importar fotos',
        error: error instanceof Error ? error.message : 'Error desconocido'
      })
    }
  }, [drillHoleId, onUploadPhotos])

  // Get status icon
  const getStatusIcon = () => {
    switch (syncStatus.status) {
      case 'uploading':
      case 'downloading':
        return <RefreshCw className="w-4 h-4 animate-spin" />
      case 'success':
        return <CheckCircle className="w-4 h-4 text-green-500" />
      case 'error':
        return <AlertCircle className="w-4 h-4 text-red-500" />
      default:
        return <Clock className="w-4 h-4" />
    }
  }

  // Get status color
  const getStatusColor = () => {
    switch (syncStatus.status) {
      case 'success':
        return 'text-green-500'
      case 'error':
        return 'text-red-500'
      case 'uploading':
      case 'downloading':
        return 'text-blue-500'
      default:
        return 'text-gray-500'
    }
  }

  return (
    <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-bold text-white flex items-center gap-2">
          <span>🔄</span>
          Sincronización de Fotos
        </h3>
        
        {/* Online Status */}
        <div className="flex items-center gap-2">
          {isOnline ? (
            <Badge variant="secondary" className="text-green-500 border-green-500">
              <Wifi className="w-3 h-3 mr-1" />
              En línea
            </Badge>
          ) : (
            <Badge variant="secondary" className="text-red-500 border-red-500">
              <WifiOff className="w-3 h-3 mr-1" />
              Sin conexión
            </Badge>
          )}
        </div>
      </div>

      {/* Status Display */}
      {syncStatus.message && (
        <div className="mb-4">
          <div className="flex items-center gap-2 mb-2">
            {getStatusIcon()}
            <span className={`text-sm ${getStatusColor()}`}>
              {syncStatus.message}
            </span>
          </div>
          
          {(syncStatus.status === 'uploading' || syncStatus.status === 'downloading') && (
            <Progress value={syncStatus.progress} className="h-2" />
          )}

          {syncStatus.error && (
            <Alert variant="destructive" className="mt-2">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription className="text-sm">
                {syncStatus.error}
              </AlertDescription>
            </Alert>
          )}
        </div>
      )}

      {/* Photo Count */}
      <div className="mb-4 p-3 bg-white/5 rounded-lg">
        <div className="text-sm text-gray-400 mb-1">Fotos locales:</div>
        <div className="text-xl font-bold text-white">{photos.length}</div>
      </div>

      {/* Action Buttons */}
      <div className="grid grid-cols-2 gap-3">
        {/* Upload to Hub */}
        <Button
          onClick={handleUploadPhotos}
          disabled={!isOnline || photos.length === 0 || syncStatus.status === 'uploading'}
          className="flex items-center gap-2"
        >
          <Upload className="w-4 h-4" />
          Subir al Hub
        </Button>

        {/* Download from Hub */}
        <Button
          onClick={handleDownloadPhotos}
          disabled={!isOnline || syncStatus.status === 'downloading'}
          variant="outline"
          className="flex items-center gap-2"
        >
          <Download className="w-4 h-4" />
          Descargar
        </Button>
      </div>

      {/* Import from Files */}
      <div className="mt-4 pt-4 border-t border-white/10">
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          multiple
          onChange={handleImportPhotos}
          className="hidden"
        />
        
        <Button
          onClick={() => fileInputRef.current?.click()}
          disabled={syncStatus.status === 'uploading'}
          variant="secondary"
          className="w-full flex items-center gap-2"
        >
          <Upload className="w-4 h-4" />
          Importar desde Archivos
        </Button>
        
        <p className="text-xs text-gray-400 mt-2 text-center">
          Selecciona múltiples imágenes para importar
        </p>
      </div>

      {/* Connection Info */}
      {drillHoleId && projectId && (
        <div className="mt-4 pt-4 border-t border-white/10">
          <div className="text-xs text-gray-400 space-y-1">
            <div>Proyecto: {projectId}</div>
            <div>Sondaje: {drillHoleId}</div>
          </div>
        </div>
      )}
    </div>
  )
}
