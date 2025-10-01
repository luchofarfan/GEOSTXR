'use client'

import React, { useState, useEffect } from 'react'
import WebGLUnifiedCylinder from '@/components/geometry/webgl-unified-cylinder'
import BOHControls from '@/components/geometry/boh-controls'
import { FloatingResultsPanel } from '@/components/geometry/floating-results-panel'
import { FloatingDepthInput } from '@/components/geometry/floating-depth-input'
import { FloatingValidationPanel } from '@/components/geometry/floating-validation-panel'
import { useBOHLines } from '@/hooks/geometry/use-boh-lines'
import { usePointTrios } from '@/hooks/geometry/use-point-trios'
import { usePlanes } from '@/hooks/geometry/use-planes'
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

  // State for depth input modal
  const [showDepthInput, setShowDepthInput] = useState(false)
  
  // State for validation panel
  const [showValidationPanel, setShowValidationPanel] = useState(false)
  
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
      <div className="flex h-screen bg-background">
        {/* Camera Feed with Virtual Cylinder */}
        <div className="flex-1 relative">
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
        </div>
        
        {/* BOH Controls Panel */}
        <div className="w-80 bg-card border-l border-border p-4 overflow-y-auto">
          <BOHControls
            state={state}
            actions={actions}
            trioManager={trioManager}
            planeManager={planeManager}
          />
        </div>
      </div>
    </div>
  )
}

export default CameraWithCylinder