'use client'

import React, { useRef, useEffect, useState } from 'react'
import { VirtualCylinder } from '@/components/geometry/virtual-cylinder'
import { CylinderControls } from '@/components/geometry/cylinder-controls'

interface CameraWithCylinderProps {
  className?: string
}

export const CameraWithCylinder: React.FC<CameraWithCylinderProps> = ({ 
  className = '' 
}) => {
  const videoRef = useRef<HTMLVideoElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const [dimensions, setDimensions] = useState({ width: 800, height: 600 })
  const [isCameraActive, setIsCameraActive] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    // Get camera stream
    const getCameraStream = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: {
            width: { ideal: 1920 },
            height: { ideal: 1080 },
            facingMode: 'environment' // Use back camera if available
          }
        })
        
        if (videoRef.current) {
          videoRef.current.srcObject = stream
          setIsCameraActive(true)
          setError(null)
        }
      } catch (err) {
        console.error('Error accessing camera:', err)
        setError('No se pudo acceder a la cámara. Verifica los permisos.')
        setIsCameraActive(false)
      }
    }

    getCameraStream()

    // Cleanup
    return () => {
      if (videoRef.current && videoRef.current.srcObject) {
        const stream = videoRef.current.srcObject as MediaStream
        stream.getTracks().forEach(track => track.stop())
      }
    }
  }, [])

  useEffect(() => {
    // Update dimensions when container size changes
    const updateDimensions = () => {
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect()
        setDimensions({
          width: rect.width,
          height: rect.height
        })
      }
    }

    updateDimensions()
    window.addEventListener('resize', updateDimensions)
    
    return () => window.removeEventListener('resize', updateDimensions)
  }, [])

  return (
    <div className={`camera-with-cylinder ${className}`}>
      <div className="flex h-screen bg-background">
        {/* Camera Feed */}
        <div className="flex-1 relative">
          <div 
            ref={containerRef}
            className="w-full h-full relative overflow-hidden"
          >
            {/* Camera Video */}
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="w-full h-full object-cover"
            />
            
            {/* Virtual Cylinder Overlay */}
            {isCameraActive && (
              <div className="absolute inset-0 pointer-events-none">
                <VirtualCylinder
                  width={dimensions.width}
                  height={dimensions.height}
                  className="w-full h-full"
                />
              </div>
            )}
            
            {/* Error Message */}
            {error && (
              <div className="absolute inset-0 flex items-center justify-center bg-background/80">
                <div className="text-center p-4">
                  <p className="text-destructive text-lg font-semibold mb-2">
                    Error de Cámara
                  </p>
                  <p className="text-muted-foreground">{error}</p>
                </div>
              </div>
            )}
            
            {/* Camera Status */}
            <div className="absolute top-4 left-4 bg-card/80 backdrop-blur-sm rounded-lg p-2">
              <div className="flex items-center space-x-2">
                <div className={`w-2 h-2 rounded-full ${
                  isCameraActive ? 'bg-green-500' : 'bg-red-500'
                }`} />
                <span className="text-sm text-foreground">
                  {isCameraActive ? 'Cámara Activa' : 'Cámara Inactiva'}
                </span>
              </div>
            </div>
          </div>
        </div>
        
        {/* Controls Panel */}
        <div className="w-80 bg-card/80 backdrop-blur-sm border-l border-border">
          <div className="p-4">
            <h2 className="text-xl font-bold text-foreground mb-4">
              GEOSTXR - Cilindro Virtual
            </h2>
            <CylinderControls />
          </div>
        </div>
      </div>
    </div>
  )
}

export default CameraWithCylinder
