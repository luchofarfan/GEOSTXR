'use client'

import React, { useRef, useEffect, useState } from 'react'
import WebGLUnifiedCylinder from '@/components/geometry/webgl-unified-cylinder'

export const CameraSimple: React.FC = () => {
  const cameraRef = useRef<any>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    console.log('🎬 CameraSimple: Component mounted')
    const timer = setTimeout(() => {
      setIsLoading(false)
    }, 2000)
    
    return () => clearTimeout(timer)
  }, [])

  if (isLoading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center text-white">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
          <p className="text-lg">Inicializando cámara...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="w-full h-screen bg-black">
      <WebGLUnifiedCylinder
        className="w-full h-full"
        cameraRef={cameraRef}
        isFrozen={false}
        scenePhotoId={null}
        frozenImageDataUrl={null}
        onScenePhotoCaptured={() => {}}
        line1Angle={90}
        line2Angle={90}
        onLine1AngleChange={() => {}}
        onLine2AngleChange={() => {}}
      />
    </div>
  )
}
