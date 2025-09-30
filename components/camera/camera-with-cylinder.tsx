'use client'

import React from 'react'
import FinalAlignedCylinder from '@/components/geometry/final-aligned-cylinder'

interface CameraWithCylinderProps {
  className?: string
}

export const CameraWithCylinder: React.FC<CameraWithCylinderProps> = ({ 
  className = '' 
}) => {
  return (
    <div className={`camera-with-cylinder ${className}`}>
      <div className="flex h-screen bg-background">
        {/* Camera Feed with Virtual Cylinder */}
        <div className="flex-1 relative">
          <FinalAlignedCylinder className="w-full h-full" />
        </div>
      </div>
    </div>
  )
}

export default CameraWithCylinder