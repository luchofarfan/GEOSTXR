'use client'

import React from 'react'
import { GEOSTXR_CONFIG } from '@/lib/config'

export default function TestDebugPage() {
  return (
    <div style={{
      width: '100vw',
      height: '100vh',
      background: '#1a1a1a',
      position: 'relative'
    }}>
      {/* VERSION INDICATOR - Verde */}
      <div style={{
        position: 'fixed',
        top: '5px',
        right: '5px',
        background: '#00FF00',
        color: '#000000',
        padding: '8px 12px',
        borderRadius: '4px',
        fontSize: '16px',
        fontWeight: 'bold',
        fontFamily: 'Arial, sans-serif',
        zIndex: 99999,
        border: '3px solid #000000',
        boxShadow: '0 0 15px rgba(0,255,0,0.8)'
      }}>
        v3.0 - {new Date().toISOString().slice(0,16)}
      </div>
      
      {/* DEBUG PANEL - Rojo */}
      <div style={{
        position: 'fixed',
        top: '80px',
        right: '10px',
        background: '#FF0000',
        color: '#FFFFFF',
        padding: '15px',
        borderRadius: '8px',
        fontSize: '14px',
        fontWeight: 'bold',
        fontFamily: 'Arial, sans-serif',
        lineHeight: '1.8',
        zIndex: 99999,
        minWidth: '200px',
        border: '4px solid #FFFF00',
        boxShadow: '0 0 20px rgba(255,255,0,0.8)'
      }}>
        <div style={{ marginBottom: '8px', fontSize: '16px' }}>
          🔴 DEBUG v3 TEST
        </div>
        <div style={{ marginBottom: '5px', background: 'rgba(0,0,0,0.3)', padding: '5px', borderRadius: '4px' }}>
          Cylinder: {GEOSTXR_CONFIG.CYLINDER.RADIUS}cm
        </div>
        <div style={{ marginBottom: '5px', background: 'rgba(0,0,0,0.3)', padding: '5px', borderRadius: '4px' }}>
          Height: {GEOSTXR_CONFIG.CYLINDER.HEIGHT}cm
        </div>
        <div style={{ marginBottom: '5px', background: 'rgba(0,0,0,0.3)', padding: '5px', borderRadius: '4px' }}>
          Status: ✅ Working!
        </div>
        <div style={{ marginTop: '10px', fontSize: '12px', color: '#FFD700' }}>
          Si ves esto, el código está actualizado
        </div>
      </div>
      
      {/* Center Message */}
      <div style={{
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        color: 'white',
        fontSize: '24px',
        fontWeight: 'bold',
        textAlign: 'center'
      }}>
        <div>🧪 TEST PAGE</div>
        <div style={{ fontSize: '16px', marginTop: '20px', color: '#888' }}>
          Verifica que los paneles sean visibles
        </div>
      </div>
    </div>
  )
}

