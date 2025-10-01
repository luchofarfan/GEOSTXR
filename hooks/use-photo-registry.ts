'use client'

import { useState, useCallback } from 'react'

export interface PhotoMetadata {
  id: string
  timestamp: Date
  imageDataUrl: string
  planeId?: string
  planeNumber?: number
  depth?: number
  angles?: {
    alpha: number
    beta: number
    azimuth: number
  }
  bohAngles?: {
    line1: number
    line2: number
  }
  notes?: string
  tags?: string[]
}

export function usePhotoRegistry() {
  const [photos, setPhotos] = useState<PhotoMetadata[]>([])

  // Capture photo from video or canvas element
  const capturePhoto = useCallback((
    sourceElement: HTMLVideoElement | HTMLCanvasElement,
    metadata?: Partial<PhotoMetadata>
  ): PhotoMetadata | null => {
    try {
      const canvas = document.createElement('canvas')
      
      if (sourceElement instanceof HTMLVideoElement) {
        canvas.width = sourceElement.videoWidth || 1920
        canvas.height = sourceElement.videoHeight || 1080
      } else {
        canvas.width = sourceElement.width
        canvas.height = sourceElement.height
      }

      const ctx = canvas.getContext('2d')
      if (!ctx) {
        console.error('Could not get canvas context')
        return null
      }

      ctx.drawImage(sourceElement, 0, 0)
      const imageDataUrl = canvas.toDataURL('image/jpeg', 0.92)

      const photo: PhotoMetadata = {
        id: `photo-${Date.now()}`,
        timestamp: new Date(),
        imageDataUrl,
        ...metadata
      }

      setPhotos(prev => [...prev, photo])
      console.log(`📸 Photo captured: ${photo.id}`, metadata)

      return photo
    } catch (error) {
      console.error('Error capturing photo:', error)
      return null
    }
  }, [])

  // Capture entire viewport/container as screenshot
  const captureScreenshot = useCallback(async (
    containerElement: HTMLElement,
    metadata?: Partial<PhotoMetadata>
  ): Promise<PhotoMetadata | null> => {
    try {
      // Try using html2canvas if available, otherwise use basic canvas capture
      const canvas = document.createElement('canvas')
      const rect = containerElement.getBoundingClientRect()
      
      canvas.width = rect.width
      canvas.height = rect.height

      const ctx = canvas.getContext('2d')
      if (!ctx) return null

      // Find WebGL canvas in container
      const webglCanvas = containerElement.querySelector('canvas')
      if (webglCanvas) {
        ctx.drawImage(webglCanvas, 0, 0, rect.width, rect.height)
      }

      const imageDataUrl = canvas.toDataURL('image/png', 0.95)

      const photo: PhotoMetadata = {
        id: `screenshot-${Date.now()}`,
        timestamp: new Date(),
        imageDataUrl,
        ...metadata
      }

      setPhotos(prev => [...prev, photo])
      console.log(`📸 Screenshot captured: ${photo.id}`, metadata)

      return photo
    } catch (error) {
      console.error('Error capturing screenshot:', error)
      return null
    }
  }, [])

  // Remove a photo
  const removePhoto = useCallback((photoId: string) => {
    setPhotos(prev => prev.filter(p => p.id !== photoId))
    console.log(`🗑️ Photo removed: ${photoId}`)
  }, [])

  // Clear all photos
  const clearAllPhotos = useCallback(() => {
    setPhotos([])
    console.log('🗑️ All photos cleared')
  }, [])

  // Update photo metadata
  const updatePhotoMetadata = useCallback((photoId: string, metadata: Partial<PhotoMetadata>) => {
    setPhotos(prev => prev.map(photo => 
      photo.id === photoId ? { ...photo, ...metadata } : photo
    ))
    console.log(`✏️ Photo metadata updated: ${photoId}`)
  }, [])

  // Add note to photo
  const addPhotoNote = useCallback((photoId: string, note: string) => {
    setPhotos(prev => prev.map(photo => 
      photo.id === photoId ? { ...photo, notes: note } : photo
    ))
  }, [])

  // Add tags to photo
  const addPhotoTags = useCallback((photoId: string, tags: string[]) => {
    setPhotos(prev => prev.map(photo => 
      photo.id === photoId ? { ...photo, tags } : photo
    ))
  }, [])

  // Get photos for specific plane
  const getPhotosForPlane = useCallback((planeId: string) => {
    return photos.filter(p => p.planeId === planeId)
  }, [photos])

  // Export photos as JSON
  const exportPhotosAsJSON = useCallback(() => {
    const dataStr = JSON.stringify(photos, null, 2)
    const dataBlob = new Blob([dataStr], { type: 'application/json' })
    const url = URL.createObjectURL(dataBlob)
    
    const link = document.createElement('a')
    link.href = url
    link.download = `geostxr-photos-${Date.now()}.json`
    link.click()
    
    URL.revokeObjectURL(url)
    console.log(`📤 Exported ${photos.length} photos as JSON`)
  }, [photos])

  // Export photos as ZIP (would need library like JSZip)
  const downloadPhoto = useCallback((photoId: string) => {
    const photo = photos.find(p => p.id === photoId)
    if (!photo) return

    const link = document.createElement('a')
    link.href = photo.imageDataUrl
    link.download = `geostxr-${photoId}.jpg`
    link.click()
    
    console.log(`📥 Photo downloaded: ${photoId}`)
  }, [photos])

  return {
    photos,
    photosCount: photos.length,
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
  }
}

