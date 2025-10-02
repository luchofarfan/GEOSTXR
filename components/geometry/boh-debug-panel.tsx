'use client'

import React from 'react'

interface BOHDebugPanelProps {
  data: {
    radius: number
    cylinderHeight: number
    containerWidth: number
    containerHeight: number
    line1Angle: number
    line2Angle: number
    boh1_3d: { x: number; y: number; z_bottom: number; z_top: number }
    boh2_3d: { x: number; y: number; z_bottom: number; z_top: number }
    boh1_2d: { 
      bottom: { x: number; y: number; screenZ: number }
      top: { x: number; y: number; screenZ: number }
    }
    boh2_2d: { 
      bottom: { x: number; y: number; screenZ: number }
      top: { x: number; y: number; screenZ: number }
    }
  }
}

export function BOHDebugPanel({ data }: BOHDebugPanelProps) {
  return (
    <div
      style={{
        position: 'fixed',
        bottom: '10px',
        left: '10px',
        maxWidth: '95%',
        maxHeight: '400px',
        overflowY: 'auto',
        background: 'rgba(0, 0, 0, 0.9)',
        color: 'white',
        padding: '12px',
        borderRadius: '8px',
        fontSize: '11px',
        fontFamily: 'monospace',
        zIndex: 9999,
        border: '2px solid #4ade80',
        lineHeight: '1.4'
      }}
    >
      <div style={{ fontWeight: 'bold', marginBottom: '8px', color: '#4ade80', fontSize: '12px' }}>
        🔍 BOH DEBUG INFO
      </div>
      
      <div style={{ marginBottom: '6px' }}>
        <strong style={{ color: '#60a5fa' }}>Configuración:</strong>
        <div>• Radius: {data.radius.toFixed(3)} cm</div>
        <div>• CylinderHeight: {data.cylinderHeight} cm</div>
        <div>• Canvas: {data.containerWidth}x{data.containerHeight}px</div>
      </div>

      <div style={{ marginBottom: '6px' }}>
        <strong style={{ color: '#f87171' }}>BOH1 (ROJA) - Ángulo: {data.line1Angle.toFixed(1)}°</strong>
        <div>• 3D: x={data.boh1_3d.x.toFixed(2)}, y={data.boh1_3d.y.toFixed(2)}</div>
        <div>• Z: {data.boh1_3d.z_bottom} → {data.boh1_3d.z_top} cm</div>
        <div>• 2D bottom (z={data.boh1_3d.z_bottom}): 
          screen ({data.boh1_2d.bottom.x.toFixed(0)}, {data.boh1_2d.bottom.y.toFixed(0)})
          screenZ={data.boh1_2d.bottom.screenZ.toFixed(3)}
        </div>
        <div>• 2D top (z={data.boh1_3d.z_top}): 
          screen ({data.boh1_2d.top.x.toFixed(0)}, {data.boh1_2d.top.y.toFixed(0)})
          screenZ={data.boh1_2d.top.screenZ.toFixed(3)}
        </div>
      </div>

      <div style={{ marginBottom: '6px' }}>
        <strong style={{ color: '#4ade80' }}>BOH2 (VERDE) - Ángulo: {data.line2Angle.toFixed(1)}°</strong>
        <div>• 3D: x={data.boh2_3d.x.toFixed(2)}, y={data.boh2_3d.y.toFixed(2)}</div>
        <div>• Z: {data.boh2_3d.z_bottom} → {data.boh2_3d.z_top} cm</div>
        <div>• 2D bottom (z={data.boh2_3d.z_bottom}): 
          screen ({data.boh2_2d.bottom.x.toFixed(0)}, {data.boh2_2d.bottom.y.toFixed(0)})
          screenZ={data.boh2_2d.bottom.screenZ.toFixed(3)}
        </div>
        <div>• 2D top (z={data.boh2_3d.z_top}): 
          screen ({data.boh2_2d.top.x.toFixed(0)}, {data.boh2_2d.top.y.toFixed(0)})
          screenZ={data.boh2_2d.top.screenZ.toFixed(3)}
        </div>
      </div>

      <div style={{ fontSize: '9px', color: '#888', marginTop: '6px' }}>
        📌 Valores negativos en Z indican problemas
      </div>
    </div>
  )
}

