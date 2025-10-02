'use client'

import React, { useState } from 'react'
import { calculateRealOrientation, calculateSpatialCoordinates } from '@/lib/geospatial-transforms'

export default function ValidationPage() {
  // Configuración del sondaje por defecto
  const [drillHole, setDrillHole] = useState({
    name: 'DDH-001',
    azimuth: 45,
    dip: -65,
    collarE: 345678.50,
    collarN: 8765432.10,
    collarZ: 2450.75,
    boh: 90
  })

  // Planos de prueba
  const [planes, setPlanes] = useState([
    { id: 1, alpha: 30, beta: 15, depth: 16 },
    { id: 2, alpha: 90, beta: 40, depth: 20 }
  ])

  // Calcular resultados para todos los planos
  const results = planes.map(plane => {
    const orientation = calculateRealOrientation(
      plane.alpha,
      plane.beta,
      drillHole.boh,
      drillHole.azimuth,
      drillHole.dip,
      3.0
    )

    const coords = calculateSpatialCoordinates(
      drillHole.collarE,
      drillHole.collarN,
      drillHole.collarZ,
      plane.depth / 100,
      drillHole.azimuth,
      drillHole.dip
    )

    return {
      ...plane,
      dip: orientation.dip,
      dipDirection: orientation.dipDirection,
      east: coords.east,
      north: coords.north,
      elevation: coords.elevation
    }
  })

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(to bottom, #0f172a, #1e293b)',
      color: 'white',
      padding: '40px 20px'
    }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        {/* Header */}
        <div style={{ marginBottom: '40px', textAlign: 'center' }}>
          <h1 style={{
            fontSize: '36px',
            fontWeight: 'bold',
            marginBottom: '10px',
            background: 'linear-gradient(to right, #3b82f6, #10b981)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent'
          }}>
            🌍 Validación de Cálculos Geoespaciales
          </h1>
          <p style={{ color: '#94a3b8', fontSize: '16px' }}>
            GeoStXR - Transformación de Coordenadas de Cilindro a UTM
          </p>
        </div>

        {/* Drill Hole Info */}
        <div style={{
          background: 'rgba(59, 130, 246, 0.1)',
          border: '2px solid rgba(59, 130, 246, 0.3)',
          borderRadius: '12px',
          padding: '24px',
          marginBottom: '30px'
        }}>
          <h2 style={{ fontSize: '20px', fontWeight: 'bold', marginBottom: '20px', color: '#93c5fd' }}>
            🎯 Información del Sondaje
          </h2>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '12px', color: '#94a3b8', marginBottom: '6px' }}>
                Nombre
              </label>
              <input
                type="text"
                value={drillHole.name}
                onChange={(e) => setDrillHole({...drillHole, name: e.target.value})}
                style={{
                  width: '100%',
                  padding: '8px',
                  borderRadius: '6px',
                  border: '1px solid rgba(255,255,255,0.2)',
                  background: 'rgba(255,255,255,0.05)',
                  color: 'white',
                  fontSize: '14px'
                }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '12px', color: '#94a3b8', marginBottom: '6px' }}>
                Azimut (°)
              </label>
              <input
                type="number"
                value={drillHole.azimuth}
                onChange={(e) => setDrillHole({...drillHole, azimuth: parseFloat(e.target.value) || 0})}
                style={{
                  width: '100%',
                  padding: '8px',
                  borderRadius: '6px',
                  border: '1px solid rgba(255,255,255,0.2)',
                  background: 'rgba(255,255,255,0.05)',
                  color: 'white',
                  fontSize: '14px'
                }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '12px', color: '#94a3b8', marginBottom: '6px' }}>
                Inclinación (°)
              </label>
              <input
                type="number"
                value={drillHole.dip}
                onChange={(e) => setDrillHole({...drillHole, dip: parseFloat(e.target.value) || 0})}
                style={{
                  width: '100%',
                  padding: '8px',
                  borderRadius: '6px',
                  border: '1px solid rgba(255,255,255,0.2)',
                  background: 'rgba(255,255,255,0.05)',
                  color: 'white',
                  fontSize: '14px'
                }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '12px', color: '#94a3b8', marginBottom: '6px' }}>
                UTM Este (m)
              </label>
              <input
                type="number"
                value={drillHole.collarE}
                onChange={(e) => setDrillHole({...drillHole, collarE: parseFloat(e.target.value) || 0})}
                style={{
                  width: '100%',
                  padding: '8px',
                  borderRadius: '6px',
                  border: '1px solid rgba(255,255,255,0.2)',
                  background: 'rgba(255,255,255,0.05)',
                  color: 'white',
                  fontSize: '14px'
                }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '12px', color: '#94a3b8', marginBottom: '6px' }}>
                UTM Norte (m)
              </label>
              <input
                type="number"
                value={drillHole.collarN}
                onChange={(e) => setDrillHole({...drillHole, collarN: parseFloat(e.target.value) || 0})}
                style={{
                  width: '100%',
                  padding: '8px',
                  borderRadius: '6px',
                  border: '1px solid rgba(255,255,255,0.2)',
                  background: 'rgba(255,255,255,0.05)',
                  color: 'white',
                  fontSize: '14px'
                }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '12px', color: '#94a3b8', marginBottom: '6px' }}>
                Elevación (m)
              </label>
              <input
                type="number"
                value={drillHole.collarZ}
                onChange={(e) => setDrillHole({...drillHole, collarZ: parseFloat(e.target.value) || 0})}
                style={{
                  width: '100%',
                  padding: '8px',
                  borderRadius: '6px',
                  border: '1px solid rgba(255,255,255,0.2)',
                  background: 'rgba(255,255,255,0.05)',
                  color: 'white',
                  fontSize: '14px'
                }}
              />
            </div>
          </div>
        </div>

        {/* Planes */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(500px, 1fr))', gap: '24px', marginBottom: '30px' }}>
          {results.map((result, index) => (
            <div key={result.id} style={{
              background: 'rgba(16, 185, 129, 0.1)',
              border: '2px solid rgba(16, 185, 129, 0.3)',
              borderRadius: '12px',
              padding: '24px'
            }}>
              <h2 style={{ fontSize: '22px', fontWeight: 'bold', marginBottom: '20px', color: '#6ee7b7' }}>
                📐 Plano {result.id}
              </h2>

              {/* Input Data */}
              <div style={{
                background: 'rgba(168, 85, 247, 0.15)',
                borderRadius: '8px',
                padding: '16px',
                marginBottom: '16px'
              }}>
                <div style={{ fontSize: '14px', fontWeight: 'bold', marginBottom: '12px', color: '#c4b5fd' }}>
                  📏 Mediciones Locales (Cilindro)
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', fontSize: '13px' }}>
                  <div>
                    <div style={{ color: '#94a3b8' }}>Profundidad</div>
                    <div style={{ fontWeight: 'bold', fontFamily: 'monospace' }}>
                      {result.depth} cm ({(result.depth/100).toFixed(2)} m)
                    </div>
                  </div>
                  <div>
                    <div style={{ color: '#94a3b8' }}>BOH Referencia</div>
                    <div style={{ fontWeight: 'bold' }}>
                      {result.depth < 15 ? 'BOH1' : 'BOH2'} ({drillHole.boh}°)
                    </div>
                  </div>
                  <div>
                    <div style={{ color: '#94a3b8' }}>α (Alpha)</div>
                    <div style={{ fontWeight: 'bold', fontFamily: 'monospace', fontSize: '18px' }}>
                      {result.alpha}°
                    </div>
                  </div>
                  <div>
                    <div style={{ color: '#94a3b8' }}>β (Beta)</div>
                    <div style={{ fontWeight: 'bold', fontFamily: 'monospace', fontSize: '18px' }}>
                      {result.beta}°
                    </div>
                  </div>
                </div>
              </div>

              {/* Real Orientation */}
              <div style={{
                background: 'rgba(59, 130, 246, 0.15)',
                borderRadius: '8px',
                padding: '16px',
                marginBottom: '16px'
              }}>
                <div style={{ fontSize: '14px', fontWeight: 'bold', marginBottom: '12px', color: '#93c5fd' }}>
                  🧭 Orientación Real (Global)
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-around', marginBottom: '12px' }}>
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: '11px', color: '#94a3b8', marginBottom: '4px' }}>
                      Dip (Buzamiento)
                    </div>
                    <div style={{
                      fontSize: '32px',
                      fontWeight: 'bold',
                      fontFamily: 'monospace',
                      color: '#60a5fa'
                    }}>
                      {result.dip.toFixed(1)}°
                    </div>
                  </div>
                  <div style={{ width: '2px', background: 'rgba(255,255,255,0.2)' }} />
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: '11px', color: '#94a3b8', marginBottom: '4px' }}>
                      Dip Direction
                    </div>
                    <div style={{
                      fontSize: '32px',
                      fontWeight: 'bold',
                      fontFamily: 'monospace',
                      color: '#34d399'
                    }}>
                      {result.dipDirection.toFixed(1)}°
                    </div>
                  </div>
                </div>
                <div style={{
                  textAlign: 'center',
                  padding: '8px',
                  background: 'rgba(0,0,0,0.2)',
                  borderRadius: '6px',
                  fontSize: '14px',
                  fontFamily: 'monospace',
                  fontWeight: 'bold'
                }}>
                  Notación: {result.dip.toFixed(1)}° / {result.dipDirection.toFixed(0)}°
                </div>
              </div>

              {/* Spatial Coordinates */}
              <div style={{
                background: 'rgba(16, 185, 129, 0.15)',
                borderRadius: '8px',
                padding: '16px'
              }}>
                <div style={{ fontSize: '14px', fontWeight: 'bold', marginBottom: '12px', color: '#6ee7b7' }}>
                  📍 Coordenadas Espaciales (UTM)
                </div>
                <div style={{ fontSize: '13px', lineHeight: '2', fontFamily: 'monospace' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: '#94a3b8' }}>Este (E):</span>
                    <span style={{ fontWeight: 'bold' }}>{result.east.toFixed(2)} m</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: '#94a3b8' }}>Norte (N):</span>
                    <span style={{ fontWeight: 'bold' }}>{result.north.toFixed(2)} m</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: '#94a3b8' }}>Elevación (Z):</span>
                    <span style={{ fontWeight: 'bold' }}>{result.elevation.toFixed(2)} m.s.n.m.</span>
                  </div>
                  <div style={{ 
                    marginTop: '12px', 
                    paddingTop: '12px', 
                    borderTop: '1px solid rgba(255,255,255,0.1)',
                    fontSize: '11px',
                    color: '#6ee7b7'
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span>Δ Este:</span>
                      <span>{(result.east - drillHole.collarE).toFixed(3)} m</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span>Δ Norte:</span>
                      <span>{(result.north - drillHole.collarN).toFixed(3)} m</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span>Δ Elevación:</span>
                      <span>{(result.elevation - drillHole.collarZ).toFixed(3)} m</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Comparison Table */}
        <div style={{
          background: 'rgba(0, 0, 0, 0.3)',
          borderRadius: '12px',
          padding: '24px',
          marginBottom: '30px',
          overflowX: 'auto'
        }}>
          <h2 style={{ fontSize: '20px', fontWeight: 'bold', marginBottom: '20px', color: '#93c5fd' }}>
            📊 Tabla Comparativa
          </h2>
          
          <table style={{ width: '100%', fontSize: '12px', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '2px solid rgba(255,255,255,0.2)' }}>
                <th style={{ padding: '12px 8px', textAlign: 'left', color: '#93c5fd' }}>Plano</th>
                <th style={{ padding: '12px 8px', textAlign: 'right', color: '#93c5fd' }}>Prof (m)</th>
                <th style={{ padding: '12px 8px', textAlign: 'right', color: '#93c5fd' }}>α (°)</th>
                <th style={{ padding: '12px 8px', textAlign: 'right', color: '#93c5fd' }}>β (°)</th>
                <th style={{ padding: '12px 8px', textAlign: 'right', color: '#34d399' }}>Dip (°)</th>
                <th style={{ padding: '12px 8px', textAlign: 'right', color: '#34d399' }}>Dip Dir (°)</th>
                <th style={{ padding: '12px 8px', textAlign: 'right', color: '#6ee7b7' }}>Este (m)</th>
                <th style={{ padding: '12px 8px', textAlign: 'right', color: '#6ee7b7' }}>Norte (m)</th>
                <th style={{ padding: '12px 8px', textAlign: 'right', color: '#6ee7b7' }}>Elev (m)</th>
              </tr>
            </thead>
            <tbody>
              {results.map((r, idx) => (
                <tr key={r.id} style={{
                  background: idx % 2 === 0 ? 'rgba(255,255,255,0.03)' : 'transparent',
                  borderBottom: '1px solid rgba(255,255,255,0.1)'
                }}>
                  <td style={{ padding: '12px 8px', fontWeight: 'bold' }}>{r.id}</td>
                  <td style={{ padding: '12px 8px', textAlign: 'right', fontFamily: 'monospace' }}>{(r.depth/100).toFixed(2)}</td>
                  <td style={{ padding: '12px 8px', textAlign: 'right', fontFamily: 'monospace' }}>{r.alpha}</td>
                  <td style={{ padding: '12px 8px', textAlign: 'right', fontFamily: 'monospace' }}>{r.beta}</td>
                  <td style={{ padding: '12px 8px', textAlign: 'right', fontFamily: 'monospace', color: '#60a5fa', fontWeight: 'bold' }}>{r.dip.toFixed(1)}</td>
                  <td style={{ padding: '12px 8px', textAlign: 'right', fontFamily: 'monospace', color: '#34d399', fontWeight: 'bold' }}>{r.dipDirection.toFixed(1)}</td>
                  <td style={{ padding: '12px 8px', textAlign: 'right', fontFamily: 'monospace', fontSize: '11px' }}>{r.east.toFixed(2)}</td>
                  <td style={{ padding: '12px 8px', textAlign: 'right', fontFamily: 'monospace', fontSize: '11px' }}>{r.north.toFixed(2)}</td>
                  <td style={{ padding: '12px 8px', textAlign: 'right', fontFamily: 'monospace', fontSize: '11px' }}>{r.elevation.toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* CSV Export */}
        <div style={{
          background: 'rgba(168, 85, 247, 0.1)',
          border: '2px solid rgba(168, 85, 247, 0.3)',
          borderRadius: '12px',
          padding: '24px'
        }}>
          <h2 style={{ fontSize: '20px', fontWeight: 'bold', marginBottom: '16px', color: '#c4b5fd' }}>
            📄 Formato CSV para Validación Externa
          </h2>
          
          <pre style={{
            background: 'rgba(0,0,0,0.4)',
            padding: '16px',
            borderRadius: '8px',
            fontSize: '11px',
            fontFamily: 'monospace',
            lineHeight: '1.6',
            overflowX: 'auto',
            color: '#d1d5db'
          }}>
{`# === INFORMACIÓN DEL SONDAJE ===
# Sondaje: ${drillHole.name}
# Azimut: ${drillHole.azimuth.toFixed(2)}°
# Inclinación: ${drillHole.dip.toFixed(2)}°
# UTM Este: ${drillHole.collarE.toFixed(2)} m
# UTM Norte: ${drillHole.collarN.toFixed(2)} m
# Cota: ${drillHole.collarZ.toFixed(2)} m.s.n.m.

Plano,Prof_cm,Prof_m,Alpha,Beta,BOH,Dip_Real,Dip_Direction,UTM_Este,UTM_Norte,Elevacion
${results.map(r => 
  `${r.id},${r.depth.toFixed(2)},${(r.depth/100).toFixed(4)},${r.alpha.toFixed(2)},${r.beta.toFixed(2)},${r.depth < 15 ? 'BOH1' : 'BOH2'},${r.dip.toFixed(2)},${r.dipDirection.toFixed(2)},${r.east.toFixed(2)},${r.north.toFixed(2)},${r.elevation.toFixed(2)}`
).join('\n')}`}
          </pre>

          <button
            onClick={() => {
              const csvText = `# === INFORMACIÓN DEL SONDAJE ===
# Sondaje: ${drillHole.name}
# Azimut: ${drillHole.azimuth.toFixed(2)}°
# Inclinación: ${drillHole.dip.toFixed(2)}°
# UTM Este: ${drillHole.collarE.toFixed(2)} m
# UTM Norte: ${drillHole.collarN.toFixed(2)} m
# Cota: ${drillHole.collarZ.toFixed(2)} m.s.n.m.

Plano,Prof_cm,Prof_m,Alpha,Beta,BOH,Dip_Real,Dip_Direction,UTM_Este,UTM_Norte,Elevacion
${results.map(r => 
  `${r.id},${r.depth.toFixed(2)},${(r.depth/100).toFixed(4)},${r.alpha.toFixed(2)},${r.beta.toFixed(2)},${r.depth < 15 ? 'BOH1' : 'BOH2'},${r.dip.toFixed(2)},${r.dipDirection.toFixed(2)},${r.east.toFixed(2)},${r.north.toFixed(2)},${r.elevation.toFixed(2)}`
).join('\n')}`
              
              navigator.clipboard.writeText(csvText)
              alert('✅ CSV copiado al portapapeles!')
            }}
            style={{
              marginTop: '12px',
              padding: '12px 24px',
              background: 'linear-gradient(to right, #8b5cf6, #a78bfa)',
              border: 'none',
              borderRadius: '8px',
              color: 'white',
              fontSize: '14px',
              fontWeight: 'bold',
              cursor: 'pointer'
            }}
          >
            📋 Copiar CSV al Portapapeles
          </button>
        </div>

        {/* Back to App */}
        <div style={{ marginTop: '30px', textAlign: 'center' }}>
          <a
            href="/"
            style={{
              display: 'inline-block',
              padding: '12px 24px',
              background: 'linear-gradient(to right, #3b82f6, #2563eb)',
              borderRadius: '8px',
              color: 'white',
              textDecoration: 'none',
              fontSize: '14px',
              fontWeight: 'bold'
            }}
          >
            ← Volver a GeoStXR
          </a>
        </div>
      </div>
    </div>
  )
}

