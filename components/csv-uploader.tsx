'use client'

import { useState, useRef } from 'react'
import { parseGeoStXRCSV, validateCSVFormat } from '@/lib/csv-parser'
import type { DrillHole } from '@/types/geostxr-data'

interface CSVUploaderProps {
  onDataImported: (drillHole: DrillHole) => void
}

export function CSVUploader({ onDataImported }: CSVUploaderProps) {
  const [isDragging, setIsDragging] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [preview, setPreview] = useState<any>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileSelect = async (file: File) => {
    setIsProcessing(true)
    setError(null)
    
    try {
      const content = await file.text()
      
      // Validate format
      if (!validateCSVFormat(content)) {
        throw new Error('Formato de CSV inválido. Asegúrate de usar un archivo exportado de GEOSTXR.')
      }
      
      // Parse CSV
      const data = parseGeoStXRCSV(content)
      if (!data) {
        throw new Error('Error al procesar el archivo CSV.')
      }
      
      setPreview(data)
      
      // Convert to DrillHole format
      const drillHole: DrillHole = {
        id: `dh-${Date.now()}`,
        name: data.drillHoleInfo.holeName,
        info: data.drillHoleInfo,
        totalDepth: Math.max(...data.structures.map(s => s.depth)) / 100, // cm to meters
        scenes: [{
          id: `scene-${Date.now()}`,
          depthStart: data.manualDepth,
          depthEnd: data.manualDepth + 30,
          capturedAt: new Date(data.timestamp),
          boh1Angle: 90, // Default, could extract from CSV if available
          boh2Angle: 90,
          acAngle: data.structures[0]?.ac || 0,
          structures: data.structures
        }],
        createdAt: new Date()
      }
      
      onDataImported(drillHole)
      
    } catch (err) {
      console.error('Error processing file:', err)
      setError(err instanceof Error ? err.message : 'Error desconocido')
    } finally {
      setIsProcessing(false)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    
    const files = Array.from(e.dataTransfer.files)
    const csvFile = files.find(f => f.name.endsWith('.csv'))
    
    if (csvFile) {
      handleFileSelect(csvFile)
    } else {
      setError('Por favor selecciona un archivo CSV')
    }
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 border border-white/20">
        <h2 className="text-2xl font-bold text-white mb-6">
          📤 Importar Datos de GEOSTXR
        </h2>
        
        {/* Drop Zone */}
        <div
          onDrop={handleDrop}
          onDragOver={(e) => { e.preventDefault(); setIsDragging(true) }}
          onDragLeave={() => setIsDragging(false)}
          onClick={() => fileInputRef.current?.click()}
          className={`
            border-2 border-dashed rounded-xl p-12 text-center cursor-pointer
            transition-all duration-300
            ${isDragging 
              ? 'border-blue-400 bg-blue-500/20 scale-105' 
              : 'border-gray-400 bg-white/5 hover:bg-white/10'
            }
            ${isProcessing ? 'opacity-50 cursor-wait' : ''}
          `}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept=".csv"
            onChange={(e) => {
              const file = e.target.files?.[0]
              if (file) handleFileSelect(file)
            }}
            className="hidden"
          />
          
          <div className="text-6xl mb-4">
            {isProcessing ? '⏳' : '📄'}
          </div>
          
          <p className="text-xl font-semibold text-white mb-2">
            {isProcessing ? 'Procesando...' : 'Arrastra tu archivo CSV aquí'}
          </p>
          <p className="text-sm text-gray-300">
            o haz clic para seleccionar
          </p>
          
          <p className="text-xs text-gray-400 mt-4">
            Formatos aceptados: CSV exportado desde GEOSTXR
          </p>
        </div>
        
        {/* Error Message */}
        {error && (
          <div className="mt-6 p-4 bg-red-500/20 border border-red-500 rounded-lg">
            <p className="text-red-200 font-semibold">❌ {error}</p>
          </div>
        )}
        
        {/* Preview */}
        {preview && (
          <div className="mt-6 p-6 bg-green-500/10 border border-green-500 rounded-lg">
            <h3 className="text-lg font-bold text-green-400 mb-4">
              ✅ Archivo Procesado Exitosamente
            </h3>
            
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-gray-400">Sondaje:</p>
                <p className="text-white font-semibold">{preview.drillHoleInfo.holeName || 'Sin nombre'}</p>
              </div>
              <div>
                <p className="text-gray-400">Profundidad Manual:</p>
                <p className="text-white font-semibold">{preview.manualDepth} cm</p>
              </div>
              <div>
                <p className="text-gray-400">Estructuras Detectadas:</p>
                <p className="text-white font-semibold">{preview.structures.length}</p>
              </div>
              <div>
                <p className="text-gray-400">Puntos 3D Capturados:</p>
                <p className="text-white font-semibold">
                  {preview.structures.filter(s => s.p1 && s.p2 && s.p3).length} de {preview.structures.length}
                </p>
              </div>
            </div>
            
            {/* Structure Details */}
            <div className="mt-4 pt-4 border-t border-green-500/30">
              <p className="text-gray-400 text-xs mb-2">Estructuras capturadas:</p>
              {preview.structures.map((structure, index) => (
                <div key={index} className="flex items-center justify-between text-xs mb-1">
                  <div className="flex items-center gap-2">
                    <div 
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: structure.color }}
                    />
                    <span className="text-white capitalize">{structure.structureType}</span>
                  </div>
                  <span className="text-gray-400">
                    {structure.depth} cm • α={structure.alpha.toFixed(1)}° β={structure.beta.toFixed(1)}°
                  </span>
                </div>
              ))}
            </div>
            
            <button
              onClick={() => {
                setPreview(null)
                setError(null)
              }}
              className="mt-4 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition-colors"
            >
              Importar Otro Archivo
            </button>
          </div>
        )}
      </div>
    </div>
  )
}


