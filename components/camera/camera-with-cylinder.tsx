'use client'

import React, { useState, useEffect, useRef, useCallback } from 'react'
import WebGLUnifiedCylinder from '@/components/geometry/webgl-unified-cylinder'
import { FloatingControlsPanel } from '@/components/geometry/floating-controls-panel'
import { FloatingResultsPanel } from '@/components/geometry/floating-results-panel'
import { FloatingDepthInput } from '@/components/geometry/floating-depth-input'
import { FloatingValidationPanel } from '@/components/geometry/floating-validation-panel'
import { PhotoGalleryPanel } from '@/components/geometry/photo-gallery-panel'
import { useBOHLines } from '@/hooks/geometry/use-boh-lines'
import { usePointTrios } from '@/hooks/geometry/use-point-trios'
import { usePlanes } from '@/hooks/geometry/use-planes'
import { usePhotoRegistry } from '@/hooks/use-photo-registry'
import { GEOSTXR_CONFIG } from '@/lib/config'

interface CameraWithCylinderProps {
  className?: string
}

export const CameraWithCylinder: React.FC<CameraWithCylinderProps> = ({ 
  className = '' 
}) => {
  const { state, actions } = useBOHLines()
  const trioManager = usePointTrios()
  const planeManager = usePlanes(
    trioManager.allTrios, // Use allTrios to ensure updates trigger recalculation
    GEOSTXR_CONFIG.CYLINDER.RADIUS,
    state.line1Angle,
    state.line2Angle
  )
  const photoRegistry = usePhotoRegistry()
  
  const cylinderContainerRef = useRef<HTMLDivElement>(null)
  
  // State for scene photo (one photo for the entire 30cm cylinder scene)
  const [scenePhotoId, setScenePhotoId] = useState<string | null>(null)

  // State for depth input modal
  const [showDepthInput, setShowDepthInput] = useState(false)
  
  // State for validation panel
  const [showValidationPanel, setShowValidationPanel] = useState(false)
  
  // State for photo gallery
  const [showPhotoGallery, setShowPhotoGallery] = useState(false)
  
  // Get selected trio and its plane data (from all trios including validation)
  const selectedTrio = trioManager.allTrios.find((t: any) => t.id === trioManager.selectedTrioId)
  const selectedPlane = selectedTrio ? planeManager.planes.find((p: any) => p.trioId === selectedTrio.id) : null
  const selectedTrioIndex = selectedTrio ? trioManager.allTrios.indexOf(selectedTrio) : -1
  
  // Get first normal trio (not validation)
  const firstTrio = trioManager.normalTrios.length > 0 ? trioManager.normalTrios[0] : null
  
  // Show depth input when first trio is complete but has no depth
  useEffect(() => {
    if (firstTrio && firstTrio.points.length === 3 && !firstTrio.depth) {
      setShowDepthInput(true)
    } else {
      setShowDepthInput(false)
    }
  }, [firstTrio])
  
  // Handle depth save
  const handleDepthSave = (trioId: string, depth: number) => {
    trioManager.setTrioDepth(trioId, depth)
    setShowDepthInput(false)
  }

  // Capture scene photo (before first trio)
  const captureScenePhoto = useCallback(() => {
    const video = document.querySelector('video')
    if (!video) {
      console.error('No video element found')
      return null
    }

    const photo = photoRegistry.capturePhoto(video, {
      notes: 'Foto de escena - 30cm cilindro',
      bohAngles: {
        line1: state.line1Angle,
        line2: state.line2Angle
      },
      tags: ['scene', 'cylinder-30cm']
    })

    if (photo) {
      setScenePhotoId(photo.id)
      console.log(`📸 Scene photo captured: ${photo.id}`)
      return photo.id
    }
    
    return null
  }, [photoRegistry, state.line1Angle, state.line2Angle])

  // Reset scene (clear trios and scene photo)
  const resetScene = useCallback(() => {
    if (confirm('¿Limpiar escena completa y empezar nueva medición?')) {
      trioManager.clearAllTrios()
      setScenePhotoId(null)
      console.log('🔄 Scene reset - ready for new measurement')
    }
  }, [trioManager])

  // Listen for validation panel open event
  useEffect(() => {
    const handleOpenValidation = () => {
      setShowValidationPanel(true)
    }
    
    const handleClearValidation = () => {
      trioManager.clearValidationTrios()
    }
    
    window.addEventListener('openValidationPanel', handleOpenValidation)
    window.addEventListener('clearValidationTrios', handleClearValidation)
    
    return () => {
      window.removeEventListener('openValidationPanel', handleOpenValidation)
      window.removeEventListener('clearValidationTrios', handleClearValidation)
    }
  }, [trioManager])

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ctrl+Z or Cmd+Z: Undo last point
      if ((e.ctrlKey || e.metaKey) && e.key === 'z') {
        e.preventDefault()
        if (trioManager.currentTrio && trioManager.currentTrioPointsCount > 0) {
          trioManager.removeLastPoint()
          console.log('⌨️ Keyboard shortcut: Ctrl+Z - Removed last point')
        }
      }
      
      // Escape: Cancel current trio
      if (e.key === 'Escape') {
        if (trioManager.currentTrio) {
          trioManager.cancelCurrentTrio()
          console.log('⌨️ Keyboard shortcut: Escape - Cancelled current trio')
        }
      }
    }
    
    window.addEventListener('keydown', handleKeyDown)
    
    return () => {
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [trioManager])

  return (
    <div className={`camera-with-cylinder ${className}`}>
      {/* Full screen camera feed with floating panels */}
      <div className="w-full h-screen relative bg-background" ref={cylinderContainerRef}>
        {/* Camera Feed with Virtual Cylinder */}
        <WebGLUnifiedCylinder 
          className="w-full h-full"
          line1Angle={state.line1Angle}
          line2Angle={state.line2Angle}
          trioManager={trioManager}
          planeManager={planeManager}
          onLine1AngleChange={actions.setLine1Angle}
          onLine2AngleChange={actions.setLine2Angle}
          isInteractive={state.isInteractive}
          enableSnapping={state.enableSnapping}
          scenePhotoId={scenePhotoId}
          onCaptureScenePhoto={captureScenePhoto}
        />
          
          {/* Floating Validation Panel */}
          {showValidationPanel && (
            <FloatingValidationPanel
              onCreateTrio={(alpha, beta, depth, bohAngle) => {
                trioManager.createValidationTrio(alpha, beta, depth, bohAngle)
              }}
              onToggleVisibility={(visible) => {
                trioManager.toggleValidationVisibility(visible)
              }}
              validationVisible={trioManager.validationTriosVisible}
              validationCount={trioManager.validationTriosCount}
              onClose={() => setShowValidationPanel(false)}
              line1Angle={state.line1Angle}
              line2Angle={state.line2Angle}
              initialPosition={{ 
                x: typeof window !== 'undefined' ? 50 : 50, 
                y: 100 
              }}
            />
          )}
          
          {/* Floating Depth Input for First Trio */}
          {showDepthInput && firstTrio && (
            <FloatingDepthInput
              trio={firstTrio}
              onDepthChange={handleDepthSave}
              onClose={() => setShowDepthInput(false)}
              initialPosition={{ 
                x: typeof window !== 'undefined' ? window.innerWidth / 2 - 160 : 300, 
                y: 150 
              }}
            />
          )}
          
          {/* Floating Results Panel */}
          {selectedTrio && selectedPlane && selectedPlane.angles && selectedTrio.depth && (
            <FloatingResultsPanel
              trioNumber={selectedTrioIndex + 1}
              trioColor={selectedTrio.color}
              depth={selectedTrio.depth}
              depthType={selectedTrio.isValidation ? 'auto' : (selectedTrioIndex === 0 ? 'manual' : 'auto')}
              angles={selectedPlane.angles}
              bohNumber={selectedTrio.depth < 15 ? 1 : 2}
              bohAngle={selectedTrio.depth < 15 ? state.line1Angle : state.line2Angle}
              isValidation={selectedTrio.isValidation}
              onClose={() => trioManager.selectTrio(null)}
            />
          )}
          
          {/* Photo Gallery Panel */}
          {showPhotoGallery && (
            <PhotoGalleryPanel
              photos={photoRegistry.photos}
              onRemovePhoto={photoRegistry.removePhoto}
              onDownloadPhoto={photoRegistry.downloadPhoto}
              onAddNote={photoRegistry.addPhotoNote}
              onClose={() => setShowPhotoGallery(false)}
              initialPosition={{ 
                x: typeof window !== 'undefined' ? window.innerWidth - 500 : 400,
                y: 100 
              }}
            />
          )}
        
        {/* Floating Controls Panel */}
        <FloatingControlsPanel
          state={state}
          actions={actions}
          trioManager={trioManager}
          planeManager={planeManager}
          scenePhotoId={scenePhotoId}
          onOpenPhotoGallery={() => setShowPhotoGallery(true)}
          onResetScene={resetScene}
        />
      </div>
    </div>
  )
}

export default CameraWithCylinder