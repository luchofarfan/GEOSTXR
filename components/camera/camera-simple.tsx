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
  }

  const handleEndCapture = () => {
    console.log('🏁 Ending capture...')
    setIsCapturing(false)
    setShowResults(true)
    // Simular resultados
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
    <div className="flex w-full h-screen bg-black">
      {/* Left - Camera with Cylinder - Maximized */}
      <div className="w-1/2 relative bg-black">
        <WebGLUnifiedCylinder
          className="w-full h-full"
          cameraRef={cameraRef}
          isFrozen={false}
          scenePhotoId={scenePhotoId}
          frozenImageDataUrl={basePhotoDataUrl}
          onScenePhotoCaptured={handleScenePhotoCaptured}
          line1Angle={line1Angle}
          line2Angle={line2Angle}
          onLine1AngleChange={setLine1Angle}
          onLine2AngleChange={setLine2Angle}
        />
        
        {/* Status Indicator */}
        {scenePhotoId && (
          <div className="absolute top-4 right-4 bg-green-600 text-white px-3 py-2 rounded">
            ✅ Escena capturada
          </div>
        )}
      </div>

      {/* Right - Controls Panel */}
      <div className="w-1/2 bg-gray-900 flex flex-col p-4 overflow-y-auto">
        {/* Capture Buttons */}
        <div className="flex flex-col gap-3 mb-6">
          <button
            onClick={handleStartCapture}
            disabled={isCapturing}
            className={`w-full h-12 rounded text-lg font-bold shadow-lg flex items-center justify-center ${
              isCapturing 
                ? 'bg-green-600 text-white cursor-not-allowed' 
                : 'bg-blue-600 text-white hover:bg-blue-700 active:bg-blue-800'
            }`}
            style={{
              border: '2px solid white',
              boxShadow: '0 4px 8px rgba(0,0,0,0.5)'
            }}
          >
            {isCapturing ? '🎬 Capturando...' : '▶️ Iniciar Captura'}
          </button>
          
          <button
            onClick={handleEndCapture}
            disabled={!isCapturing}
            className={`w-full h-12 rounded text-lg font-bold shadow-lg flex items-center justify-center ${
              !isCapturing 
                ? 'bg-gray-500 text-white cursor-not-allowed' 
                : 'bg-red-600 text-white hover:bg-red-700 active:bg-red-800'
            }`}
            style={{
              border: '2px solid white',
              boxShadow: '0 4px 8px rgba(0,0,0,0.5)'
            }}
          >
            🏁 Terminar Captura
          </button>
        </div>

        {/* L1 and L2 Information */}
        <div className="bg-gray-800/50 rounded p-4 mb-6">
          <h3 className="text-white text-lg font-bold mb-3">📐 Líneas</h3>
          <div className="text-white text-base space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-4 h-4 bg-red-500 rounded-full"></div>
              <span className="text-lg">L1: {line1Angle.toFixed(1)}°</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-4 h-4 bg-green-500 rounded-full"></div>
              <span className="text-lg">L2: {line2Angle.toFixed(1)}°</span>
            </div>
          </div>
        </div>

        {/* Results Panel */}
        {showResults && (
          <div className="bg-gray-800/50 rounded p-4 mb-6">
            <h3 className="text-white text-lg font-bold mb-3">📊 Resultados</h3>
            <div className="text-white text-base space-y-2">
              {captureResults.map((result) => (
                <div key={result.id} className="flex justify-between">
                  <span>{result.type}:</span>
                  <span className="font-bold">{result.value} {result.unit}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Reset Button */}
        <button
          onClick={handleResetScene}
          className="w-full h-12 bg-gray-600 text-white rounded text-lg font-bold hover:bg-gray-700 active:bg-gray-800 shadow-lg flex items-center justify-center"
          style={{
            border: '2px solid white',
            boxShadow: '0 4px 8px rgba(0,0,0,0.5)'
          }}
        >
          🔄 Reset
        </button>
      </div>
    </div>
  )
}
