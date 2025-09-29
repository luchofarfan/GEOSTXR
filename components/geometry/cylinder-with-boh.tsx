'use client'

import React from 'react'
import VirtualCylinder from './virtual-cylinder'
import BOHLines from './boh-lines'
import BOHControls from './boh-controls'
import { useBOHLines } from '@/hooks/geometry/use-boh-lines'

interface CylinderWithBOHProps {
  className?: string
  showControls?: boolean
}

export default function CylinderWithBOH({ 
  className = '', 
  showControls = true 
}: CylinderWithBOHProps) {
  const { state, actions } = useBOHLines()

  const handleBOHChange = (line1Angle: number, line2Angle: number) => {
    actions.updateBOHLines(line1Angle, line2Angle)
  }

  return (
    <div className={`cylinder-with-boh ${className}`}>
      <div className="flex h-full">
        {/* 3D Scene */}
        <div className="flex-1 relative">
          <VirtualCylinder className="w-full h-full" />
          {state.isVisible && (
            <div className="absolute inset-0 pointer-events-none">
              <BOHLines 
                className="w-full h-full"
                onBOHChange={handleBOHChange}
              />
            </div>
          )}
        </div>

        {/* Controls Panel */}
        {showControls && (
          <div className="w-80 bg-white border-l border-gray-200 p-4 overflow-y-auto">
            <BOHControls 
              state={state} 
              actions={actions}
              className="w-full"
            />
          </div>
        )}
      </div>
    </div>
  )
}
