'use client'

import React from 'react'
import { useBOHLines, BOHLinesState, BOHLinesActions } from '@/hooks/geometry/use-boh-lines'
import { TrioDepthInput } from './trio-depth-input'

interface BOHControlsProps {
  state: BOHLinesState
  actions: BOHLinesActions
  className?: string
  trioManager?: any // Optional trio manager from usePointTrios hook
}

export default function BOHControls({ state, actions, className = '', trioManager }: BOHControlsProps) {
  const {
    line1Angle,
    line2Angle,
    isVisible,
    isInteractive
  } = state

  const {
    setLine1Angle,
    setLine2Angle,
    setVisibility,
    setInteractive,
    resetAngles
  } = actions

  return (
    <div className={`boh-controls ${className}`}>
      <h3 className="text-lg font-semibold mb-4 text-gray-800">Controles BOH</h3>
      
      {/* Visibility Toggle */}
      <div className="mb-4">
        <label className="flex items-center space-x-2">
          <input
            type="checkbox"
            checked={isVisible}
            onChange={(e) => setVisibility(e.target.checked)}
            className="rounded"
          />
          <span className="text-sm font-medium">Mostrar líneas BOH</span>
        </label>
      </div>

      {/* Interactive Toggle */}
      <div className="mb-4">
        <label className="flex items-center space-x-2">
          <input
            type="checkbox"
            checked={isInteractive}
            onChange={(e) => setInteractive(e.target.checked)}
            className="rounded"
          />
          <span className="text-sm font-medium">Modo interactivo</span>
        </label>
      </div>

      {/* Line 1 Angle Control */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Línea BOH 1: {line1Angle.toFixed(1)}°
        </label>
        <input
          type="range"
          min="70"
          max="110"
          step="0.1"
          value={line1Angle}
          onChange={(e) => setLine1Angle(parseFloat(e.target.value))}
          disabled={!isInteractive}
          className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
        />
        <div className="flex justify-between text-xs text-gray-500 mt-1">
          <span>70°</span>
          <span>90°</span>
          <span>110°</span>
        </div>
      </div>

      {/* Line 2 Angle Control */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Línea BOH 2: {line2Angle.toFixed(1)}°
        </label>
        <input
          type="range"
          min="70"
          max="110"
          step="0.1"
          value={line2Angle}
          onChange={(e) => setLine2Angle(parseFloat(e.target.value))}
          disabled={!isInteractive}
          className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
        />
        <div className="flex justify-between text-xs text-gray-500 mt-1">
          <span>70°</span>
          <span>90°</span>
          <span>110°</span>
        </div>
      </div>

      {/* Reset Button */}
      <div className="mb-4">
        <button
          onClick={resetAngles}
          disabled={!isInteractive}
          className="w-full px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
        >
          Resetear a Valores por Defecto
        </button>
      </div>

      {/* Current Values Display */}
      <div className="bg-gray-50 p-3 rounded-lg">
        <h4 className="text-sm font-medium text-gray-700 mb-2">Valores Actuales:</h4>
        <div className="space-y-1 text-sm text-gray-600">
          <div>Línea BOH 1: {line1Angle.toFixed(1)}°</div>
          <div>Línea BOH 2: {line2Angle.toFixed(1)}°</div>
          <div>Diferencia: {Math.abs(line2Angle - line1Angle).toFixed(1)}°</div>
        </div>
      </div>

      {/* Point Trios Section */}
      {trioManager && (
        <div className="mt-6 pt-6 border-t border-gray-300">
          <h3 className="text-lg font-semibold mb-4 text-gray-800">Tríos de Puntos</h3>
          
          {/* Instructions */}
          {trioManager.triosCount === 0 && !trioManager.currentTrio && (
            <div className="bg-blue-50 p-3 rounded-lg border border-blue-200 mb-4">
              <p className="text-sm text-blue-900">
                💡 <strong>Instrucciones:</strong><br />
                Haz click en el cilindro para seleccionar 3 puntos y crear un trío.
              </p>
            </div>
          )}

          {/* Current Trio Progress */}
          {trioManager.currentTrio && (
            <div className="mb-4 p-3 rounded-lg border-2 border-dashed" style={{ borderColor: trioManager.currentTrio.color }}>
              <div className="flex items-center gap-2 mb-2">
                <div style={{
                  width: '12px',
                  height: '12px',
                  backgroundColor: trioManager.currentTrio.color,
                  borderRadius: '50%'
                }} />
                <span className="text-sm font-semibold text-gray-800">
                  Trío en progreso: {trioManager.currentTrioPointsCount} / 3 puntos
                </span>
              </div>
              <button
                onClick={() => trioManager.cancelCurrentTrio()}
                className="text-xs text-red-600 hover:text-red-800 font-medium"
              >
                ✕ Cancelar
              </button>
            </div>
          )}

          {/* Depth Input for First Trio (Manual) */}
          {trioManager.trios.length > 0 && (
            <div className="mb-4">
              <TrioDepthInput
                trio={trioManager.trios[0]}
                onDepthChange={trioManager.setTrioDepth}
                minDepth={0}
                maxDepth={500000}
              />
            </div>
          )}
          
          {/* Info about automatic depth calculation */}
          {trioManager.trios.length > 0 && trioManager.trios[0].depth && (
            <div className="mb-4 bg-green-50 p-3 rounded-lg border border-green-200">
              <p className="text-xs text-green-900">
                ✨ <strong>Cálculo Automático:</strong><br />
                Los siguientes tríos calcularán su profundidad automáticamente usando la intersección plano-eje Z.
              </p>
            </div>
          )}

          {/* Trios List */}
          {trioManager.triosCount > 0 && (
            <div className="space-y-2">
              <h4 className="text-sm font-medium text-gray-700">
                Tríos Completados ({trioManager.triosCount} / {trioManager.MAX_TRIOS})
              </h4>
              <div className="space-y-2 max-h-60 overflow-y-auto">
                {trioManager.trios.map((trio, index) => (
                  <div
                    key={trio.id}
                    className="p-2 rounded border cursor-pointer hover:bg-gray-50 transition-colors"
                    style={{
                      borderColor: trioManager.selectedTrioId === trio.id ? trio.color : '#E5E7EB',
                      backgroundColor: trioManager.selectedTrioId === trio.id ? `${trio.color}10` : 'transparent'
                    }}
                    onClick={() => trioManager.selectTrio(trio.id === trioManager.selectedTrioId ? null : trio.id)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div style={{
                          width: '10px',
                          height: '10px',
                          backgroundColor: trio.color,
                          borderRadius: '50%'
                        }} />
                        <span className="text-sm font-medium text-gray-800">
                          Trío {index + 1}
                        </span>
                        <span className="text-xs text-gray-500">
                          ({trio.points.length} puntos)
                        </span>
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          trioManager.removeTrio(trio.id)
                        }}
                        className="text-red-600 hover:text-red-800 text-xs font-bold"
                      >
                        ✕
                      </button>
                    </div>
                    {trio.depth && (
                      <div className="text-xs text-gray-600 mt-1 ml-5">
                        {index === 0 ? '📝' : '✨'} Profundidad: {trio.depth.toFixed(2)}cm ({(trio.depth/100).toFixed(2)}m)
                        {index === 0 ? ' (manual)' : ' (auto)'}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Clear All Button */}
          {trioManager.triosCount > 0 && (
            <button
              onClick={() => {
                if (confirm('¿Eliminar todos los tríos?')) {
                  trioManager.clearAllTrios()
                }
              }}
              className="mt-4 w-full py-2 px-4 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium text-sm transition-colors"
            >
              🗑️ Eliminar Todos los Tríos
            </button>
          )}

          {/* Info */}
          {!trioManager.canAddMoreTrios && (
            <div className="mt-4 bg-yellow-50 p-3 rounded-lg border border-yellow-200">
              <p className="text-xs text-yellow-900">
                ⚠️ Límite alcanzado: {trioManager.MAX_TRIOS} tríos máximo
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
