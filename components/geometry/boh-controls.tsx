'use client'

import React from 'react'
import { useBOHLines, BOHLinesState, BOHLinesActions } from '@/hooks/geometry/use-boh-lines'
import { TrioDepthInput } from './trio-depth-input'
import { ACMeasurementDisplay } from './ac-measurement-display'
import { useACAngle } from '@/hooks/geometry/use-ac-angle'
import { GEOSTXR_CONFIG } from '@/lib/config'

interface BOHControlsProps {
  state: BOHLinesState
  actions: BOHLinesActions
  className?: string
  trioManager?: any // Optional trio manager from usePointTrios hook
  planeManager?: any // Optional plane manager from usePlanes hook
}

export default function BOHControls({ state, actions, className = '', trioManager, planeManager }: BOHControlsProps) {
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

  // Calculate AC (Ángulo de Calce)
  const acData = useACAngle(line1Angle, line2Angle, GEOSTXR_CONFIG.CYLINDER.RADIUS)

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

      {/* Snapping Toggle */}
      <div className="mb-4">
        <label className="flex items-center space-x-2">
          <input
            type="checkbox"
            checked={state.enableSnapping || false}
            onChange={(e) => actions.setSnapping && actions.setSnapping(e.target.checked)}
            disabled={!isInteractive}
            className="rounded"
          />
          <span className="text-sm font-medium">🧲 Snapping (1°)</span>
        </label>
        <p className="text-xs text-gray-500 mt-1 ml-6">
          Los ángulos se ajustarán a valores enteros al arrastrar (sin decimales)
        </p>
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

      {/* Planes Section */}
      {trioManager && (
        <div className="mt-6 pt-6 border-t border-gray-300">
          <h3 className="text-lg font-semibold mb-4 text-gray-800">Medición de Planos</h3>
          
          {/* Instructions */}
          {trioManager.triosCount === 0 && !trioManager.currentTrio && (
            <div className="bg-blue-50 p-3 rounded-lg border border-blue-200 mb-4">
              <p className="text-sm text-blue-900">
                💡 <strong>Instrucciones:</strong><br />
                Haz click en el cilindro para seleccionar 3 puntos y crear un plano.
              </p>
            </div>
          )}
          
          {/* Validation Button */}
          <div className="mb-4">
            <button
              onClick={() => {
                // Trigger opening validation panel (will be handled by parent)
                const event = new CustomEvent('openValidationPanel')
                window.dispatchEvent(event)
              }}
              className="w-full py-2 px-4 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white rounded-lg font-bold text-sm transition-all shadow-md flex items-center justify-center gap-2"
            >
              <span>🧪</span>
              <span>Abrir Validación de Planos</span>
            </button>
          </div>

          {/* Current Trio Progress */}
          {trioManager.currentTrio && (
            <div className="mb-4 p-3 rounded-lg border-2 border-dashed" style={{ borderColor: trioManager.currentTrio.color }}>
              <div className="flex items-center gap-2 mb-3">
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
              <div className="flex gap-2">
                <button
                  onClick={() => trioManager.removeLastPoint && trioManager.removeLastPoint()}
                  disabled={trioManager.currentTrioPointsCount === 0}
                  className="flex-1 px-3 py-2 bg-orange-500 hover:bg-orange-600 disabled:bg-gray-300 disabled:cursor-not-allowed text-white rounded font-bold text-xs transition-colors"
                >
                  ↶ Deshacer Último
                </button>
                <button
                  onClick={() => trioManager.cancelCurrentTrio()}
                  className="flex-1 px-3 py-2 bg-red-600 hover:bg-red-700 text-white rounded font-bold text-xs transition-colors"
                >
                  ✕ Cancelar Todo
                </button>
              </div>
              {trioManager.currentTrioPointsCount > 0 && (
                <div className="mt-2 text-xs text-gray-600 italic">
                  💡 Tip: También puedes presionar Ctrl+Z para deshacer
                </div>
              )}
            </div>
          )}

          {/* Planes List */}
          {trioManager.triosCount > 0 && (
            <div className="space-y-2">
              <h4 className="text-sm font-medium text-gray-700">
                Planos Completados ({trioManager.triosCount} / {trioManager.MAX_TRIOS})
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
                        <div className="flex flex-col">
                          <div className="flex items-center gap-1">
                            <span className="text-sm font-bold text-gray-800">
                              Plano {index + 1}
                            </span>
                            {trio.isValidation && (
                              <span className="text-xs bg-purple-600 text-white px-1.5 py-0.5 rounded font-bold">
                                🧪 VAL
                              </span>
                            )}
                          </div>
                          {trio.depth && (
                            <span className="text-xs text-gray-600 font-medium">
                              {trio.isValidation ? '🧪' : (index === 0 ? '📝' : '✨')} {trio.depth.toFixed(2)} cm ({(trio.depth/100).toFixed(2)} m)
                            </span>
                          )}
                        </div>
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
                    
                    {/* Info about depth calculation */}
                    {index === 0 && trio.depth && (
                      <div className="mt-2" onClick={(e) => e.stopPropagation()}>
                        <div className="bg-green-50 p-2 rounded border border-green-200">
                          <p className="text-xs text-green-900">
                            ✨ <strong>Cálculo automático activado:</strong> Los siguientes planos calcularán su profundidad automáticamente usando la intersección plano-eje Z.
                          </p>
                        </div>
                      </div>
                    )}
                    
                    {/* Auto depth info for subsequent planes */}
                    {index > 0 && trio.depth && (
                      <div className="mt-2" onClick={(e) => e.stopPropagation()}>
                        <div className="bg-blue-50 p-2 rounded border border-blue-200">
                          <p className="text-xs text-blue-900">
                            <strong>Profundidad calculada automáticamente</strong> basada en la intersección del plano con el eje Z del cilindro.
                          </p>
                        </div>
                      </div>
                    )}
                    
                    {/* Quick Info - Click to see details in floating panel */}
                    {planeManager && planeManager.planes && trio.depth && (() => {
                      const plane = planeManager.planes.find((p: any) => p.trioId === trio.id)
                      if (plane && plane.angles) {
                        return (
                          <div className="text-xs mt-2 p-2 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-300">
                            <div className="flex items-center justify-between mb-1">
                              <span className="text-blue-900 font-bold">📊 Ángulos del Plano</span>
                            </div>
                            <div className="text-blue-700 text-xs space-y-1">
                              <div><strong>α:</strong> {plane.angles.alpha.toFixed(2)}° | <strong>β:</strong> {plane.angles.beta.toFixed(2)}°</div>
                            </div>
                            <div className="text-blue-600 text-xs mt-2 italic flex items-center gap-1">
                              💡 Click en el plano para ver detalles completos
                            </div>
                          </div>
                        )
                      }
                      return null
                    })()}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Clear All Button */}
          {trioManager.triosCount > 0 && (
            <button
              onClick={() => {
                if (confirm('¿Eliminar todos los planos?')) {
                  trioManager.clearAllTrios()
                }
              }}
              className="mt-4 w-full py-2 px-4 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium text-sm transition-colors"
            >
              🗑️ Eliminar Todos los Planos
            </button>
          )}

          {/* Info */}
          {!trioManager.canAddMoreTrios && (
            <div className="mt-4 bg-yellow-50 p-3 rounded-lg border border-yellow-200">
              <p className="text-xs text-yellow-900">
                ⚠️ Límite alcanzado: {trioManager.MAX_TRIOS} planos máximo
              </p>
            </div>
          )}
        </div>
      )}
      
      {/* AC Measurement Display - Moved to the end */}
      <div className="mt-6 pt-6 border-t border-gray-300">
        <ACMeasurementDisplay acData={acData} />
      </div>
    </div>
  )
}
