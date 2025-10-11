'use client'

import React, { useRef, useEffect, useState } from 'react'
import WebGLUnifiedCylinder from '@/components/geometry/webgl-unified-cylinder'
import { usePointTrios } from '@/hooks/geometry/use-point-trios'
import { usePlanes } from '@/hooks/geometry/use-planes'
import { GEOSTXR_CONFIG } from '@/lib/config'

// Error Boundary Component
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error }
  }

  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo)
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex w-full h-screen bg-black items-center justify-center">
          <div className="text-white text-center p-4">
            <h2 className="text-xl font-bold mb-2">Error en la aplicación</h2>
            <p className="text-sm">Por favor, recarga la página</p>
            <button 
              onClick={() => window.location.reload()}
              className="mt-4 px-4 py-2 bg-blue-600 text-white rounded"
            >
              Recargar
            </button>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}

export const CameraSimple: React.FC = () => {
  const cameraRef = useRef<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isCapturing, setIsCapturing] = useState(false)
  const [line1Angle, setLine1Angle] = useState(90)
  const [line2Angle, setLine2Angle] = useState(90)
  const [scenePhotoId, setScenePhotoId] = useState<string | null>(null)
  const [basePhotoDataUrl, setBasePhotoDataUrl] = useState<string | null>(null)
  const [captureResults, setCaptureResults] = useState<any[]>([])
  const [showResults, setShowResults] = useState(false)
  
  // Point selection managers - Re-enabled for point selection
  const trioManager = usePointTrios()
  const planeManager = usePlanes(
    trioManager.trios,
    GEOSTXR_CONFIG.CYLINDER.RADIUS,
    line1Angle,
    line2Angle
  )

  useEffect(() => {
    console.log('🎬 CameraSimple: Component mounted')
    
    const timer = setTimeout(() => {
      setIsLoading(false)
    }, 2000)
    
    return () => clearTimeout(timer)
  }, [])

  const handleStartCapture = () => {
    console.log('🎬 Starting capture...')
    setIsCapturing(true)
    // Trigger scene photo capture in WebGLUnifiedCylinder
    console.log('📡 Dispatching captureScenePhoto event...')
    const event = new CustomEvent('captureScenePhoto')
    window.dispatchEvent(event)
    console.log('✅ Event dispatched')
  }

  const handleEndCapture = () => {
    console.log('🏁 Ending capture...')
    setIsCapturing(false)
    setShowResults(true)
    // Simular resultados por ahora
    setCaptureResults([
      { id: 1, type: 'AC', value: 45.2, unit: '°' },
      { id: 2, type: 'BOH', value: 12.8, unit: '°' },
      { id: 3, type: 'Depth', value: 15.5, unit: 'cm' }
    ])
  }

  const handleScenePhotoCaptured = (imageDataUrl: string) => {
    console.log('📸 Scene photo captured')
    const newScenePhotoId = 'scene_' + Date.now()
    console.log('🆔 Setting scenePhotoId:', newScenePhotoId)
    setScenePhotoId(newScenePhotoId)
    setBasePhotoDataUrl(imageDataUrl)
    console.log('🧊 Component should now be frozen - isFrozen will be:', !!newScenePhotoId)
  }

  const handleResetScene = () => {
    console.log('🔄 Resetting scene...')
    setScenePhotoId(null)
    setBasePhotoDataUrl(null)
    setIsCapturing(false)
    setCaptureResults([])
    setShowResults(false)
  }

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
    <ErrorBoundary>
      <div className="flex w-full h-screen bg-black" style={{ display: 'flex', flexDirection: 'row' }}>
      {/* Left - Camera with Cylinder - 75% width */}
      <div className="relative bg-gray-800" style={{ width: '75%', height: '100%', overflow: 'hidden' }}>
        
        
        
        {/* WebGLUnifiedCylinder */}
        <WebGLUnifiedCylinder
          className="w-full h-full"
          cameraRef={cameraRef}
          isFrozen={!!scenePhotoId}
          scenePhotoId={scenePhotoId}
          frozenImageDataUrl={basePhotoDataUrl}
          onScenePhotoCaptured={handleScenePhotoCaptured}
          line1Angle={line1Angle}
          line2Angle={line2Angle}
          onLine1AngleChange={setLine1Angle}
          onLine2AngleChange={setLine2Angle}
          trioManager={trioManager}
          planeManager={planeManager}
          isInteractive={true}
          enableSnapping={false}
        />
        
        {/* Status Indicator */}
        {isCapturing && (
          <div className="absolute top-4 right-4 bg-blue-600 text-white px-3 py-2 rounded animate-pulse">
            🎬 Capturando...
          </div>
        )}
        {scenePhotoId && (
          <div className="absolute top-4 right-4 bg-green-600 text-white px-3 py-2 rounded">
            ✅ Escena capturada - Zoom/rotación solidarios - Selecciona puntos
          </div>
        )}
      </div>

      {/* Right - Controls Panel - 25% width */}
      <div className="bg-gray-900 flex flex-col p-2 gap-2 overflow-y-auto" style={{ width: '25%', height: '100%' }}>
        
        {/* Capture Buttons */}
        <div className="flex flex-col gap-1">
          <button
            onClick={handleStartCapture}
            disabled={isCapturing}
            className={`w-full h-8 rounded text-xs font-bold shadow-lg flex items-center justify-center ${
              isCapturing 
                ? 'bg-green-600 text-white cursor-not-allowed' 
                : 'bg-blue-600 text-white hover:bg-blue-700 active:bg-blue-800'
            }`}
            style={{
              border: '1px solid white',
              boxShadow: '0 2px 4px rgba(0,0,0,0.7)'
            }}
          >
            {isCapturing ? '🎬' : '▶️'}
          </button>
          
          <button
            onClick={handleEndCapture}
            disabled={!isCapturing}
            className={`w-full h-8 rounded text-xs font-bold shadow-lg flex items-center justify-center ${
              !isCapturing 
                ? 'bg-gray-500 text-white cursor-not-allowed' 
                : 'bg-red-600 text-white hover:bg-red-700 active:bg-red-800'
            }`}
            style={{
              border: '1px solid white',
              boxShadow: '0 2px 4px rgba(0,0,0,0.7)'
            }}
          >
            🏁
          </button>
        </div>
        
        {/* L1/L2 Info */}
        <div className="bg-gray-800/50 rounded p-1.5">
          <h3 className="text-white text-xs font-bold mb-1">📐 Líneas</h3>
          <div className="text-white text-xs space-y-1">
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 bg-red-500 rounded-full"></div>
              <span>L1: {line1Angle.toFixed(1)}°</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span>L2: {line2Angle.toFixed(1)}°</span>
            </div>
          </div>
        </div>

        {/* Results - Measurements Panel */}
        <div className="bg-gray-800/50 rounded p-2 max-h-64 overflow-y-auto">
          <h3 className="text-white text-xs font-bold mb-2 sticky top-0 bg-gray-800/90 pb-1">📊 Mediciones</h3>
          
          {planeManager?.planes && planeManager.planes.length > 0 ? (
            <div className="space-y-2">
              {planeManager.planes.map((plane, index) => (
                <div 
                  key={plane.id} 
                  className="bg-gray-700/50 rounded p-1.5 border-l-4"
                  style={{ borderLeftColor: plane.color }}
                >
                  <div className="text-white text-xs font-bold mb-1">
                    Trio {index + 1}
                  </div>
                  <div className="text-white text-xs space-y-0.5">
                    {plane.angles && (
                      <>
                        <div className="flex justify-between">
                          <span>α (alfa):</span>
                          <span className="font-bold">{plane.angles.alpha.toFixed(1)}°</span>
                        </div>
                        <div className="flex justify-between">
                          <span>β (beta):</span>
                          <span className="font-bold">{plane.angles.beta.toFixed(1)}°</span>
                        </div>
                        <div className="flex justify-between">
                          <span>AC:</span>
                          <span className="font-bold">{Math.abs(line1Angle - line2Angle).toFixed(1)}°</span>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-400 text-xs text-center py-4">
              Selecciona 3 puntos para<br/>generar mediciones
            </p>
          )}
        </div>

        {/* Actions */}
        <button
          onClick={handleResetScene}
          className="h-8 bg-gray-600 text-white rounded text-xs font-bold hover:bg-gray-700 active:bg-gray-800 shadow-lg flex items-center justify-center"
          style={{
            border: '1px solid white',
            boxShadow: '0 2px 4px rgba(0,0,0,0.5)',
            width: '100%'
          }}
        >
          🔄
        </button>
        
        {/* Instructions */}
        <div className="bg-gray-800/50 rounded p-1.5 flex-1 flex items-center justify-center">
          <p className="text-gray-400 text-xs text-center">
            ▶️ Iniciar<br/>🏁 Terminar<br/>🔄 Reiniciar
          </p>
        </div>
      </div>
      </div>
    </ErrorBoundary>
  )
}
