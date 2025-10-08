'use client'

import React, { useRef, useEffect, useState } from 'react'
import WebGLUnifiedCylinder from '@/components/geometry/webgl-unified-cylinder'

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
    const event = new CustomEvent('captureScenePhoto')
    window.dispatchEvent(event)
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
    setScenePhotoId('scene_' + Date.now())
    setBasePhotoDataUrl(imageDataUrl)
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
    <div className="flex w-full h-screen bg-black" style={{ display: 'flex', flexDirection: 'row' }}>
      {/* Left - Camera with Cylinder - 50% width */}
      <div className="relative bg-gray-800" style={{ width: '50%', height: '100%', overflow: 'hidden' }}>
        
        
        
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
        />
        
        {/* Status Indicator */}
        {isCapturing && (
          <div className="absolute top-4 right-4 bg-blue-600 text-white px-3 py-2 rounded animate-pulse">
            🎬 Capturando...
          </div>
        )}
        {scenePhotoId && (
          <div className="absolute top-4 right-4 bg-green-600 text-white px-3 py-2 rounded">
            ✅ Escena capturada - Selecciona puntos
          </div>
        )}
      </div>

      {/* Right - Controls Panel - 50% width */}
      <div className="bg-gray-900 flex flex-col p-3 gap-3 overflow-y-auto" style={{ width: '50%', height: '100%' }}>
        
        {/* Capture Buttons */}
        <div className="flex flex-col gap-2">
          <button
            onClick={handleStartCapture}
            disabled={isCapturing}
            className={`w-full h-10 rounded text-sm font-bold shadow-lg flex items-center justify-center ${
              isCapturing 
                ? 'bg-green-600 text-white cursor-not-allowed' 
                : 'bg-blue-600 text-white hover:bg-blue-700 active:bg-blue-800'
            }`}
            style={{
              border: '2px solid white',
              boxShadow: '0 4px 8px rgba(0,0,0,0.7)'
            }}
          >
            {isCapturing ? '🎬 Capturando...' : '▶️ Iniciar Captura'}
          </button>
          
          <button
            onClick={handleEndCapture}
            disabled={!isCapturing}
            className={`w-full h-10 rounded text-sm font-bold shadow-lg flex items-center justify-center ${
              !isCapturing 
                ? 'bg-gray-500 text-white cursor-not-allowed' 
                : 'bg-red-600 text-white hover:bg-red-700 active:bg-red-800'
            }`}
            style={{
              border: '2px solid white',
              boxShadow: '0 4px 8px rgba(0,0,0,0.7)'
            }}
          >
            🏁 Terminar Captura
          </button>
        </div>
        
        {/* L1/L2 Info */}
        <div className="bg-gray-800/50 rounded p-3">
          <h3 className="text-white text-sm font-bold mb-2">📐 Líneas</h3>
          <div className="text-white text-sm space-y-2">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-red-500 rounded-full"></div>
              <span>L1: {line1Angle.toFixed(1)}°</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              <span>L2: {line2Angle.toFixed(1)}°</span>
            </div>
          </div>
        </div>

        {/* Results */}
        {showResults ? (
          <div className="bg-gray-800/50 rounded p-3">
            <h3 className="text-white text-sm font-bold mb-2">📊 Resultados</h3>
            <div className="text-white text-sm space-y-1">
              {captureResults.map((result) => (
                <div key={result.id} className="flex justify-between">
                  <span>{result.type}:</span>
                  <span className="font-bold">{result.value} {result.unit}</span>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="bg-gray-800/50 rounded p-3 flex items-center justify-center">
            <p className="text-gray-400 text-xs text-center">
              📊 Resultados aparecerán aquí
            </p>
          </div>
        )}

        {/* Actions */}
        <button
          onClick={handleResetScene}
          className="h-10 bg-gray-600 text-white rounded text-sm font-bold hover:bg-gray-700 active:bg-gray-800 shadow-lg flex items-center justify-center"
          style={{
            border: '1px solid white',
            boxShadow: '0 2px 4px rgba(0,0,0,0.5)',
            width: '100%',
            maxWidth: '200px',
            margin: '0 auto'
          }}
        >
          🔄 Reset
        </button>
        
        {/* Instructions */}
        <div className="bg-gray-800/50 rounded p-3 flex-1 flex items-center justify-center">
          <p className="text-gray-400 text-xs text-center">
            Usa los botones de arriba para iniciar y terminar la captura
          </p>
        </div>
      </div>
    </div>
  )
}
