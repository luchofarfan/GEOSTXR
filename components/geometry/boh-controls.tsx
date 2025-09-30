'use client'

import React from 'react'
import { useBOHLines, BOHLinesState, BOHLinesActions } from '@/hooks/geometry/use-boh-lines'

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
    </div>
  )
}
