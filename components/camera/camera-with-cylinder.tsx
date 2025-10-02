'use client'

import React, { useState, useEffect, useRef, useCallback } from 'react'
import WebGLUnifiedCylinder from '@/components/geometry/webgl-unified-cylinder'
import { FloatingControlsPanel } from '@/components/geometry/floating-controls-panel'
import { FloatingResultsPanel } from '@/components/geometry/floating-results-panel'
import { FloatingDepthInput } from '@/components/geometry/floating-depth-input'
import { FloatingStructureTypeInput } from '@/components/geometry/floating-structure-type-input'
import { FloatingValidationPanel } from '@/components/geometry/floating-validation-panel'
import { PhotoGalleryPanel } from '@/components/geometry/photo-gallery-panel'
import { SceneCaptureButtons } from '@/components/geometry/scene-capture-buttons'
import { DistanceIndicator } from '@/components/geometry/distance-indicator'
import { FloatingCustomColumnsPanel } from '@/components/geometry/floating-custom-columns-panel'
import { ManageStructureTypesPanel } from '@/components/geometry/manage-structure-types-panel'
import { FloatingDrillHoleInfoPanel } from '@/components/geometry/floating-drillhole-info-panel'
import { useBOHLines } from '@/hooks/geometry/use-boh-lines'
import { usePointTrios } from '@/hooks/geometry/use-point-trios'
import { usePlanes } from '@/hooks/geometry/use-planes'
import { useACAngle } from '@/hooks/geometry/use-ac-angle'
import { useCustomColumns } from '@/hooks/use-custom-columns'
import { useStructureTypes } from '@/hooks/use-structure-types'
import { useDrillHoleInfo } from '@/hooks/use-drill-hole-info'
import { usePhotoRegistry } from '@/hooks/use-photo-registry'
import { generateCompositeImage } from '@/lib/generate-composite-image'
import { generateCSVReport, downloadCSV, downloadImage } from '@/lib/generate-csv-report'
import { CylinderDetector } from '@/lib/cylinder-detection'
import { isMobileDevice } from '@/lib/device-detection'
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
  const acData = useACAngle(state.line1Angle, state.line2Angle, GEOSTXR_CONFIG.CYLINDER.RADIUS)
  const customColumns = useCustomColumns()
  const structureTypesManager = useStructureTypes()
  const drillHoleInfo = useDrillHoleInfo()
  const photoRegistry = usePhotoRegistry()
  
  const cylinderContainerRef = useRef<HTMLDivElement>(null)
  const cameraRef = useRef<any>(null) // Reference to Three.js camera
  const detectorRef = useRef<CylinderDetector | null>(null)
  
  // State for scene photo (one photo for the entire 30cm cylinder scene)
  const [scenePhotoId, setScenePhotoId] = useState<string | null>(null)
  const [basePhotoDataUrl, setBasePhotoDataUrl] = useState<string | null>(null)
  const [isFrozen, setIsFrozen] = useState(false) // Freeze video during point selection
  const [estimatedDistance, setEstimatedDistance] = useState<number>(999)
  const [isDetecting, setIsDetecting] = useState(false)

  // State for depth input modal
  const [showDepthInput, setShowDepthInput] = useState(false)
  
  // State for structure type input modal
  const [showStructureTypeInput, setShowStructureTypeInput] = useState(false)
  const [pendingStructureTrioId, setPendingStructureTrioId] = useState<string | null>(null)
  
  // State for validation panel
  const [showValidationPanel, setShowValidationPanel] = useState(false)
  
  // State for photo gallery
  const [showPhotoGallery, setShowPhotoGallery] = useState(false)
  
  // State for custom columns panel
  const [showCustomColumnsPanel, setShowCustomColumnsPanel] = useState(false)
  
  // State for manage structure types panel
  const [showManageStructureTypes, setShowManageStructureTypes] = useState(false)
  
  // State for drill hole info panel
  const [showDrillHoleInfo, setShowDrillHoleInfo] = useState(false)
  
  // State for hiding all panels (useful in mobile)
  const [allPanelsHidden, setAllPanelsHidden] = useState(false)
  const [isMobile, setIsMobile] = useState(false)
  
  // Detect mobile on mount
  useEffect(() => {
    setIsMobile(isMobileDevice())
  }, [])
  
  // Get selected trio and its plane data (from all trios including validation)
  const selectedTrio = trioManager.allTrios.find((t: any) => t.id === trioManager.selectedTrioId)
  const selectedPlane = selectedTrio ? planeManager.planes.find((p: any) => p.trioId === selectedTrio.id) : null
  const selectedTrioIndex = selectedTrio ? trioManager.allTrios.indexOf(selectedTrio) : -1
  
  // Get first normal trio (not validation)
  const firstTrio = trioManager.normalTrios.length > 0 ? trioManager.normalTrios[0] : null
  
  // Get trio pending structure type
  const pendingStructureTrio = pendingStructureTrioId 
    ? trioManager.normalTrios.find((t: any) => t.id === pendingStructureTrioId)
    : null
  
  // Show structure type input when ANY trio is complete but has no structure type
  useEffect(() => {
    // Find first trio without structure type (excluding validation trios)
    const trioWithoutType = trioManager.normalTrios.find((t: any) => 
      t.points.length === 3 && !t.structureType
    )
    
    if (trioWithoutType && trioWithoutType.id !== pendingStructureTrioId) {
      setPendingStructureTrioId(trioWithoutType.id)
      setShowStructureTypeInput(true)
      console.log('🏔️ Requesting structure type for trio:', trioWithoutType.id)
    } else if (!trioWithoutType) {
      setShowStructureTypeInput(false)
    }
  }, [trioManager.normalTrios, pendingStructureTrioId])

  // Show depth input when first trio has structure type but no depth
  useEffect(() => {
    if (firstTrio && firstTrio.points.length === 3 && firstTrio.structureType && !firstTrio.depth) {
      setShowDepthInput(true)
    } else {
      setShowDepthInput(false)
    }
  }, [firstTrio])
  
  // Handle structure type save
  const handleStructureTypeSave = (trioId: string, structureType: string) => {
    console.log('🔍 Available structure types:', structureTypesManager.structureTypes)
    
    // Find the structure type to get its color
    const structType = structureTypesManager.structureTypes.find(t => t.name === structureType)
    
    if (!structType) {
      console.error('❌ Structure type not found:', structureType)
      console.error('Available types:', structureTypesManager.structureTypes.map(t => t.name))
      return
    }
    
    if (!structType.color) {
      console.error('❌ Structure type has no color!', structType)
      return
    }
    
    console.log(`🎨 Assigning structure type "${structureType}" with color ${structType.color} to trio ${trioId}`)
    console.log(`   Full structure type object:`, structType)
    
    // Update trio with structure type and color
    trioManager.setStructureType(trioId, structureType, structType.color)
    setShowStructureTypeInput(false)
    setPendingStructureTrioId(null)
    
    console.log(`✅ Structure type saved. All "${structureType}" planos will be ${structType.color}`)
  }

  // Handle depth save
  const handleDepthSave = (trioId: string, depth: number) => {
    trioManager.setTrioDepth(trioId, depth)
    setShowDepthInput(false)
  }

  // Capture scene photo manually (BEFORE selecting points)
  const captureScenePhoto = useCallback(() => {
    // Need to capture from the WebGL canvas with cylinder mask
    // This will be handled by passing a callback to the WebGL component
    // For now, we'll trigger the capture event
    const event = new CustomEvent('captureScenePhoto')
    window.dispatchEvent(event)
  }, [])

  // Finalize capture: Generate composite image with overlays and CSV report
  const finalizeCapture = useCallback(async () => {
    if (!basePhotoDataUrl || !cameraRef.current) {
      console.error('Missing base photo or camera reference')
      return
    }

    if (trioManager.normalTrios.length === 0) {
      alert('No hay planos para finalizar. Selecciona al menos un trío de puntos.')
      return
    }

    // Get manual depth from first trio
    const firstTrio = trioManager.normalTrios[0]
    if (!firstTrio || !firstTrio.depth) {
      alert('Error: El primer trío debe tener profundidad manual.')
      return
    }

    const manualDepth = firstTrio.depth

    try {
      console.log('📊 Generating final report:')
      console.log('   acData object:', acData)
      console.log(`   Manual Depth: ${manualDepth} cm`)
      console.log(`   AC (Ángulo de Calce): ${acData?.ac?.toFixed(2) || '0.00'}°`)
      console.log(`   BOH1: ${state.line1Angle.toFixed(1)}°`)
      console.log(`   BOH2: ${state.line2Angle.toFixed(1)}°`)
      console.log(`   Total Planes: ${trioManager.normalTrios.length}`)
      
      const container = cylinderContainerRef.current
      if (!container) {
        throw new Error('Container not found')
      }

      // Generate composite image with points, ellipses, BOH lines, and depth ticks
      console.log('🎨 Generating composite image with results table, BOH lines, and depth ticks...')
      
      // Filter planes that have all required data
      const validPlanes = planeManager.planes.filter((p: any) => 
        trioManager.normalTrios.some((t: any) => t.id === p.trioId) &&
        p.ellipsePoints && p.ellipsePoints.length > 0
      )
      
      const compositeImageDataUrl = await generateCompositeImage({
        baseImageDataUrl: basePhotoDataUrl,
        trios: trioManager.normalTrios,
        planes: validPlanes as any,
        camera: cameraRef.current,
        containerWidth: container.clientWidth,
        containerHeight: container.clientHeight,
        cylinderHeight: GEOSTXR_CONFIG.CYLINDER.HEIGHT,
        cylinderRadius: GEOSTXR_CONFIG.CYLINDER.RADIUS,
        acAngle: acData?.ac || 0,
        bohAngles: {
          line1: state.line1Angle,
          line2: state.line2Angle
        },
        manualDepth: manualDepth
      })

      // Generate CSV report
      console.log('📝 Generating CSV report...')
      const timestamp = new Date().toLocaleString('es-ES', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
      })
      
      // Prepare custom columns data
      const customColumnsData = customColumns.columns.map(col => ({
        id: col.id,
        header: col.header
      }))
      
      const customValuesData: Record<string, Record<string, string>> = {}
      trioManager.normalTrios.forEach((trio: any) => {
        customValuesData[trio.id] = customColumns.getTrioValues(trio.id)
      })

      const csvContent = generateCSVReport(
        trioManager.normalTrios,
        validPlanes as any,
        {
          timestamp,
          manualDepth,
          acAngle: acData?.ac || 0, // Dynamic AC value at time of finalization
          bohAngles: {
            line1: state.line1Angle,
            line2: state.line2Angle
          },
          totalPlanes: trioManager.normalTrios.length,
          customColumns: customColumnsData,
          customValues: customValuesData,
          drillHoleInfo: drillHoleInfo.info // Información del sondaje
        }
      )

      // Generate filenames based on manual depth
      const depthLabel = `${manualDepth.toFixed(0)}cm`
      const dateLabel = new Date().toISOString().slice(0, 10).replace(/-/g, '')
      const timeLabel = new Date().toISOString().slice(11, 19).replace(/:/g, '')
      
      const imageFilename = `GeoStXR_${depthLabel}_${dateLabel}_${timeLabel}.jpg`
      const csvFilename = `GeoStXR_${depthLabel}_${dateLabel}_${timeLabel}.csv`

      // Download files
      console.log('💾 Downloading files...')
      downloadImage(compositeImageDataUrl, imageFilename)
      downloadCSV(csvContent, csvFilename)

      // Save composite image to photo registry
      const photoId = 'scene-' + Date.now()
      photoRegistry.photos.push({
        id: photoId,
        timestamp: new Date(),
        imageDataUrl: compositeImageDataUrl,
        metadata: {
          notes: `Escena QA/QC - ${trioManager.normalTrios.length} plano(s) - Profundidad: ${manualDepth}cm`,
          bohAngles: {
            line1: state.line1Angle,
            line2: state.line2Angle
          },
          tags: ['scene-composite', 'qa-qc', 'cylinder-30cm', `depth-${depthLabel}`],
          triosCount: trioManager.normalTrios.length
        },
        notes: `Imagen compuesta con ${trioManager.normalTrios.length} plano(s) - Prof. ${manualDepth}cm`
      })

      setScenePhotoId(photoId)
      console.log('✅ Report generated successfully')
      alert(`✅ Reporte Generado!\n\n📊 Archivos descargados:\n- ${imageFilename}\n- ${csvFilename}\n\n📈 ${trioManager.normalTrios.length} plano(s) registrados\n📏 Profundidad: ${manualDepth}cm`)
      
      // Show photo gallery
      setShowPhotoGallery(true)
    } catch (error) {
      console.error('Error generating report:', error)
      alert('Error al generar el reporte. Ver consola para detalles.')
    }
  }, [basePhotoDataUrl, trioManager.normalTrios, planeManager.planes, state.line1Angle, state.line2Angle, photoRegistry, cameraRef, acData, customColumns])

  // Reset scene (clear all trios and scene photo)
  const resetScene = useCallback(() => {
    if (confirm('¿Deseas iniciar una nueva escena? Esto eliminará todos los planos y la foto actual.')) {
      trioManager.clearAllTrios()
      setScenePhotoId(null)
      setBasePhotoDataUrl(null)
      setIsFrozen(false)
      
      // Resume video playback
      const video = document.querySelector('video')
      if (video) {
        video.play().catch(err => console.error('Error resuming video:', err))
      }
      
      console.log('🔄 Scene reset complete - video resumed')
    }
  }, [trioManager])

  // Start automatic cylinder detection when video is ready
  useEffect(() => {
    // Only start detection if no photo has been captured yet
    if (scenePhotoId || isFrozen) {
      // Stop detection if it's running
      if (detectorRef.current) {
        detectorRef.current.stopDetection()
      }
      return
    }

    // Wait a bit for video to stabilize
    const startDetectionTimer = setTimeout(() => {
      const video = document.querySelector('video')
      if (!video || video.readyState < video.HAVE_ENOUGH_DATA) {
        console.log('⏳ Waiting for video to be ready...')
        return
      }

      // Create detector if it doesn't exist
      if (!detectorRef.current) {
        detectorRef.current = new CylinderDetector()
      }

      // Start detection
      detectorRef.current.startDetection(
        video, 
        () => {
          console.log('🎯 Auto-capture triggered by distance detection!')
          captureScenePhoto()
        },
        (distance) => {
          // Update estimated distance in real-time
          setEstimatedDistance(distance)
        }
      )
      
      setIsDetecting(true)
      console.log('🔍 Cylinder detection active - monitoring distance...')
    }, 2000) // Wait 2 seconds for camera to stabilize

    return () => {
      clearTimeout(startDetectionTimer)
      if (detectorRef.current) {
        detectorRef.current.stopDetection()
      }
      setIsDetecting(false)
    }
  }, [scenePhotoId, isFrozen, captureScenePhoto])

  // Listen for structure type color changes
  useEffect(() => {
    const handleColorChange = (event: any) => {
      const { typeName, newColor } = event.detail
      console.log(`🎨 Updating all "${typeName}" trios to color ${newColor}`)
      trioManager.updateColorForStructureType(typeName, newColor)
    }

    window.addEventListener('structureTypeColorChanged', handleColorChange)

    return () => {
      window.removeEventListener('structureTypeColorChanged', handleColorChange)
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
          cameraRef={cameraRef}
          scenePhotoId={scenePhotoId}
          isFrozen={isFrozen}
          frozenImageDataUrl={basePhotoDataUrl}
          onScenePhotoCaptured={(imageDataUrl) => {
            setBasePhotoDataUrl(imageDataUrl)
            setScenePhotoId('temp-scene-' + Date.now())
            setIsFrozen(true)
            console.log('📸 Scene photo received and frozen')
          }}
        />
        
        {/* Distance Indicator (top-center) */}
        <DistanceIndicator
          estimatedDistance={estimatedDistance}
          targetDistance={26}
          tolerance={3}
          isDetecting={isDetecting && !scenePhotoId}
        />

        {/* Scene Capture Buttons (top-right) */}
        <SceneCaptureButtons
          scenePhotoId={scenePhotoId}
          hasActiveTrios={trioManager.normalTrios.length > 0}
          onCaptureScene={captureScenePhoto}
          onFinalizeCapture={finalizeCapture}
          disabled={false}
        />
          
          {/* Floating Validation Panel */}
          {!allPanelsHidden && showValidationPanel && (
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
          
          {/* Manage Structure Types Panel */}
          {!allPanelsHidden && showManageStructureTypes && (
            <ManageStructureTypesPanel
              structureTypes={structureTypesManager.structureTypes}
              onAddType={structureTypesManager.addStructureType}
              onRemoveType={structureTypesManager.removeStructureType}
              onUpdateName={structureTypesManager.updateStructureTypeName}
              onUpdateColor={structureTypesManager.updateStructureTypeColor}
              onResetToDefaults={structureTypesManager.resetToDefaults}
              onClose={() => setShowManageStructureTypes(false)}
              initialPosition={{ x: 150, y: 150 }}
            />
          )}

          {/* Floating Structure Type Input (appears first for each trio) */}
          {showStructureTypeInput && pendingStructureTrio && (
            <FloatingStructureTypeInput
              trio={pendingStructureTrio}
              trioNumber={trioManager.normalTrios.indexOf(pendingStructureTrio) + 1}
              structureTypes={structureTypesManager.structureTypes}
              onStructureTypeChange={handleStructureTypeSave}
              onAddStructureType={structureTypesManager.addStructureType}
              onIncrementUseCount={structureTypesManager.incrementUseCount}
              onOpenManageTypes={() => setShowManageStructureTypes(true)}
              onClose={() => {
                setShowStructureTypeInput(false)
                setPendingStructureTrioId(null)
              }}
              initialPosition={{ 
                x: typeof window !== 'undefined' ? window.innerWidth / 2 - 190 : 300, 
                y: 120 
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
        
        {/* Custom Columns Panel */}
        {showCustomColumnsPanel && (
          <FloatingCustomColumnsPanel
            columns={customColumns.columns}
            templates={customColumns.templates}
            canAddMore={customColumns.canAddMore}
            maxColumns={customColumns.MAX_COLUMNS}
            onAddColumn={customColumns.addColumn}
            onRemoveColumn={customColumns.removeColumn}
            onUpdateHeader={customColumns.updateColumnHeader}
            onSetValueForAllTrios={customColumns.setValueForAllTrios}
            onLoadFromTemplates={customColumns.loadFromTemplates}
            trioIds={trioManager.normalTrios.map((t: any) => t.id)}
            onClose={() => setShowCustomColumnsPanel(false)}
            initialPosition={{ x: 120, y: 120 }}
          />
        )}
        
        {/* Drill Hole Info Panel */}
        {showDrillHoleInfo && (
          <FloatingDrillHoleInfoPanel
            info={drillHoleInfo.info}
            onUpdate={drillHoleInfo.updateInfo}
            onSaveTemplate={drillHoleInfo.saveAsTemplate}
            templates={drillHoleInfo.templates}
            onLoadTemplate={drillHoleInfo.loadTemplate}
            onDeleteTemplate={drillHoleInfo.deleteTemplate}
            onClose={() => setShowDrillHoleInfo(false)}
          />
        )}

        {/* Toggle Panels Button (Mobile) */}
        <button
          onClick={() => setAllPanelsHidden(!allPanelsHidden)}
          style={{
            position: 'fixed',
            top: '10px',
            left: '10px',
            zIndex: 5000,
            padding: isMobile ? '10px 16px' : '8px 14px',
            background: allPanelsHidden 
              ? 'linear-gradient(135deg, #ef4444, #dc2626)' 
              : 'linear-gradient(135deg, #10b981, #059669)',
            border: 'none',
            borderRadius: '10px',
            color: 'white',
            fontSize: isMobile ? '14px' : '12px',
            fontWeight: 'bold',
            cursor: 'pointer',
            boxShadow: '0 4px 12px rgba(0,0,0,0.4)',
            display: 'flex',
            alignItems: 'center',
            gap: '6px'
          }}
        >
          <span style={{ fontSize: isMobile ? '18px' : '16px' }}>
            {allPanelsHidden ? '👁️' : '🙈'}
          </span>
          <span>{allPanelsHidden ? 'Mostrar Paneles' : 'Ocultar Paneles'}</span>
        </button>

        {/* Floating Controls Panel */}
        {!allPanelsHidden && (
          <FloatingControlsPanel
            state={state}
            actions={actions}
            trioManager={trioManager}
            planeManager={planeManager}
            scenePhotoId={scenePhotoId}
            onOpenPhotoGallery={() => setShowPhotoGallery(true)}
            onResetScene={resetScene}
            onOpenCustomColumns={() => setShowCustomColumnsPanel(true)}
            onOpenDrillHoleInfo={() => setShowDrillHoleInfo(true)}
            customColumns={customColumns}
          />
        )}
      </div>
    </div>
  )
}

export default CameraWithCylinder