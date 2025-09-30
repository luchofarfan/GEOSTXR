'use client'

import React from 'react'
import FinalAlignedCylinder from '@/components/geometry/final-aligned-cylinder'
import BOHControls from '@/components/geometry/boh-controls'
import { useBOHLines } from '@/hooks/geometry/use-boh-lines'

interface CameraWithCylinderProps {
  className?: string
}

export const CameraWithCylinder: React.FC<CameraWithCylinderProps> = ({ 
  className = '' 
}) => {
  const { state, actions } = useBOHLines()

  return (
    <div className={`camera-with-cylinder ${className}`}>
      <div className="flex h-screen bg-background">
        {/* Camera Feed with Virtual Cylinder */}
        <div className="flex-1 relative">
          <FinalAlignedCylinder 
            className="w-full h-full"
            line1Angle={state.line1Angle}
            line2Angle={state.line2Angle}
          />
        </div>
        
        {/* BOH Controls Panel */}
        <div className="w-80 bg-card border-l border-border p-4 overflow-y-auto">
          <BOHControls
            line1Angle={state.line1Angle}
            line2Angle={state.line2Angle}
            onLine1AngleChange={actions.setLine1Angle}
            onLine2AngleChange={actions.setLine2Angle}
            onReset={actions.resetAngles}
          />
        </div>
      </div>
    </div>
  )
}

export default CameraWithCylinder