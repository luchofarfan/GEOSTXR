/**
 * Simulación de dos planos específicos
 * Plano 1: Prof=16cm, α=30°, β=15°
 * Plano 2: Prof=20cm, α=90°, β=40°
 */

console.log('🎯 ===== SIMULACIÓN DE DOS PLANOS ESPECÍFICOS =====\n')

// Helper functions
function toRad(deg) { return deg * Math.PI / 180 }
function toDeg(rad) { return rad * 180 / Math.PI }

function getPlaneNormalInCylinder(alpha, beta, bohAngle) {
  const alphaRad = toRad(alpha)
  const betaRad = toRad(beta)
  const bohRad = toRad(bohAngle)
  
  const bohOffsetFromY = bohRad - Math.PI/2
  const azimuthInCylinder = bohOffsetFromY + betaRad
  
  const nx = Math.sin(alphaRad) * Math.sin(azimuthInCylinder)
  const ny = Math.sin(alphaRad) * Math.cos(azimuthInCylinder)
  const nz = Math.cos(alphaRad)
  
  return [nx, ny, nz]
}

function getDrillHoleRotationMatrix(azimuth, dip) {
  const azRad = toRad(azimuth)
  const dipRad = toRad(-dip)
  
  const cosAz = Math.cos(azRad)
  const sinAz = Math.sin(azRad)
  const cosDip = Math.cos(dipRad)
  const sinDip = Math.sin(dipRad)
  
  return [
    [cosAz * cosDip,  -sinAz,  cosAz * sinDip],
    [sinAz * cosDip,   cosAz,  sinAz * sinDip],
    [-sinDip,          0,      cosDip]
  ]
}

function transformVector(localVector, rotationMatrix) {
  const [x, y, z] = localVector
  return [
    rotationMatrix[0][0] * x + rotationMatrix[0][1] * y + rotationMatrix[0][2] * z,
    rotationMatrix[1][0] * x + rotationMatrix[1][1] * y + rotationMatrix[1][2] * z,
    rotationMatrix[2][0] * x + rotationMatrix[2][1] * y + rotationMatrix[2][2] * z
  ]
}

function calculateRealOrientation(alpha, beta, bohAngle, drillAz, drillDip) {
  const normalLocal = getPlaneNormalInCylinder(alpha, beta, bohAngle)
  const rotMatrix = getDrillHoleRotationMatrix(drillAz, drillDip)
  const normalGlobal = transformVector(normalLocal, rotMatrix)
  
  const [nx, ny, nz] = normalGlobal
  const dip = toDeg(Math.acos(Math.abs(nz)))
  
  let dipDir = toDeg(Math.atan2(nx, ny))
  if (dipDir < 0) dipDir += 360
  if (nz > 0) dipDir = (dipDir + 180) % 360
  
  return { dip, dipDir, normalGlobal, normalLocal }
}

function calculateSpatialCoords(collarE, collarN, collarZ, depth, drillAz, drillDip) {
  const azRad = toRad(drillAz)
  const dipRad = toRad(drillDip)
  
  const horizDist = depth * Math.cos(dipRad)
  const vertDist = depth * Math.sin(dipRad)
  
  const dE = horizDist * Math.sin(azRad)
  const dN = horizDist * Math.cos(azRad)
  const dZ = vertDist
  
  return {
    east: collarE + dE,
    north: collarN + dN,
    elev: collarZ + dZ,
    dE, dN, dZ
  }
}

// ==========================================
// CONFIGURACIÓN DEL SONDAJE
// ==========================================
console.log('🎯 SONDAJE DE EJEMPLO:')
console.log('═'.repeat(80))

const DRILL_HOLE = {
  name: 'DDH-001',
  azimuth: 45,      // NE (típico en minería)
  dip: -65,         // Inclinado hacia abajo (típico)
  collarE: 345678.50,
  collarN: 8765432.10,
  collarZ: 2450.75,
  boh: 90           // BOH en posición estándar
}

console.log(`  Nombre: ${DRILL_HOLE.name}`)
console.log(`  Azimut: ${DRILL_HOLE.azimuth}° (NE)`)
console.log(`  Inclinación: ${DRILL_HOLE.dip}° (hacia abajo)`)
console.log(`  Collar UTM:`)
console.log(`    Este: ${DRILL_HOLE.collarE} m`)
console.log(`    Norte: ${DRILL_HOLE.collarN} m`)
console.log(`    Elevación: ${DRILL_HOLE.collarZ} m.s.n.m.`)
console.log(`  BOH: ${DRILL_HOLE.boh}° (posición estándar)`)
console.log('')
console.log('')

// ==========================================
// PLANO 1
// ==========================================
console.log('📐 PLANO 1:')
console.log('═'.repeat(80))

const PLANO1 = {
  alpha: 30,
  beta: 15,
  depth: 16  // cm
}

console.log(`  Profundidad: ${PLANO1.depth} cm (${(PLANO1.depth/100).toFixed(3)} m)`)
console.log(`  α (alpha): ${PLANO1.alpha}°`)
console.log(`  β (beta): ${PLANO1.beta}°`)
console.log('')

const result1 = calculateRealOrientation(
  PLANO1.alpha, PLANO1.beta, DRILL_HOLE.boh,
  DRILL_HOLE.azimuth, DRILL_HOLE.dip
)

const coords1 = calculateSpatialCoords(
  DRILL_HOLE.collarE, DRILL_HOLE.collarN, DRILL_HOLE.collarZ,
  PLANO1.depth / 100,
  DRILL_HOLE.azimuth, DRILL_HOLE.dip
)

console.log('🔍 Análisis Local (en cilindro):')
console.log('─'.repeat(80))
console.log(`  Vector Normal (local): [${result1.normalLocal.map(v => v.toFixed(4)).join(', ')}]`)
console.log(`  Magnitud: ${Math.sqrt(result1.normalLocal.reduce((sum, v) => sum + v*v, 0)).toFixed(4)}`)
console.log('')

console.log('🌍 Resultados Geoespaciales:')
console.log('─'.repeat(80))
console.log(`  Vector Normal (global): [${result1.normalGlobal.map(v => v.toFixed(4)).join(', ')}]`)
console.log('')
console.log(`  🧭 ORIENTACIÓN REAL:`)
console.log(`     Dip: ${result1.dip.toFixed(2)}°`)
console.log(`     Dip Direction: ${result1.dipDir.toFixed(2)}°`)
console.log(`     Notación: ${result1.dip.toFixed(1)}°/${result1.dipDir.toFixed(0)}°`)
console.log('')
console.log(`  📍 COORDENADAS UTM:`)
console.log(`     Este: ${coords1.east.toFixed(2)} m    (Δ ${coords1.dE >= 0 ? '+' : ''}${coords1.dE.toFixed(2)} m)`)
console.log(`     Norte: ${coords1.north.toFixed(2)} m  (Δ ${coords1.dN >= 0 ? '+' : ''}${coords1.dN.toFixed(2)} m)`)
console.log(`     Elevación: ${coords1.elev.toFixed(2)} m   (Δ ${coords1.dZ >= 0 ? '+' : ''}${coords1.dZ.toFixed(2)} m)`)
console.log('')
console.log('')

// ==========================================
// PLANO 2
// ==========================================
console.log('📐 PLANO 2:')
console.log('═'.repeat(80))

const PLANO2 = {
  alpha: 90,
  beta: 40,
  depth: 20  // cm
}

console.log(`  Profundidad: ${PLANO2.depth} cm (${(PLANO2.depth/100).toFixed(3)} m)`)
console.log(`  α (alpha): ${PLANO2.alpha}°`)
console.log(`  β (beta): ${PLANO2.beta}°`)
console.log('')

const result2 = calculateRealOrientation(
  PLANO2.alpha, PLANO2.beta, DRILL_HOLE.boh,
  DRILL_HOLE.azimuth, DRILL_HOLE.dip
)

const coords2 = calculateSpatialCoords(
  DRILL_HOLE.collarE, DRILL_HOLE.collarN, DRILL_HOLE.collarZ,
  PLANO2.depth / 100,
  DRILL_HOLE.azimuth, DRILL_HOLE.dip
)

console.log('🔍 Análisis Local (en cilindro):')
console.log('─'.repeat(80))
console.log(`  Vector Normal (local): [${result2.normalLocal.map(v => v.toFixed(4)).join(', ')}]`)
console.log(`  Magnitud: ${Math.sqrt(result2.normalLocal.reduce((sum, v) => sum + v*v, 0)).toFixed(4)}`)
console.log('  💡 α=90° significa: plano paralelo al eje del sondaje')
console.log('     Para sondaje inclinado → plano también inclinado en espacio')
console.log('')

console.log('🌍 Resultados Geoespaciales:')
console.log('─'.repeat(80))
console.log(`  Vector Normal (global): [${result2.normalGlobal.map(v => v.toFixed(4)).join(', ')}]`)
console.log('')
console.log(`  🧭 ORIENTACIÓN REAL:`)
console.log(`     Dip: ${result2.dip.toFixed(2)}°`)
console.log(`     Dip Direction: ${result2.dipDir.toFixed(2)}°`)
console.log(`     Notación: ${result2.dip.toFixed(1)}°/${result2.dipDir.toFixed(0)}°`)
console.log('')
console.log(`  📍 COORDENADAS UTM:`)
console.log(`     Este: ${coords2.east.toFixed(2)} m    (Δ ${coords2.dE >= 0 ? '+' : ''}${coords2.dE.toFixed(2)} m)`)
console.log(`     Norte: ${coords2.north.toFixed(2)} m  (Δ ${coords2.dN >= 0 ? '+' : ''}${coords2.dN.toFixed(2)} m)`)
console.log(`     Elevación: ${coords2.elev.toFixed(2)} m   (Δ ${coords2.dZ >= 0 ? '+' : ''}${coords2.dZ.toFixed(2)} m)`)
console.log('')
console.log('')

// ==========================================
// RESUMEN COMPARATIVO
// ==========================================
console.log('📊 TABLA RESUMEN - REPORTE CSV')
console.log('═'.repeat(80))
console.log('')
console.log('┌───────┬────────┬────────┬────────┬────────┬────────┬───────────┬───────────────┬──────────────┬──────────────┬──────────────┐')
console.log('│ Plano │ Prof_m │ α (°)  │ β (°)  │ BOH    │ Dip(°) │ DipDir(°) │ UTM_Este (m)  │ UTM_Norte(m) │ Elevación(m) │ BOH_Ref      │')
console.log('├───────┼────────┼────────┼────────┼────────┼────────┼───────────┼───────────────┼──────────────┼──────────────┼──────────────┤')
console.log(`│   1   │ ${(PLANO1.depth/100).toFixed(2).padStart(6)} │ ${PLANO1.alpha.toFixed(0).padStart(6)} │ ${PLANO1.beta.toFixed(0).padStart(6)} │ BOH1   │ ${result1.dip.toFixed(1).padStart(6)} │ ${result1.dipDir.toFixed(1).padStart(9)} │ ${coords1.east.toFixed(2).padStart(13)} │ ${coords1.north.toFixed(2).padStart(12)} │ ${coords1.elev.toFixed(2).padStart(12)} │ BOH1 (${DRILL_HOLE.boh}°)   │`)
console.log(`│   2   │ ${(PLANO2.depth/100).toFixed(2).padStart(6)} │ ${PLANO2.alpha.toFixed(0).padStart(6)} │ ${PLANO2.beta.toFixed(0).padStart(6)} │ BOH2   │ ${result2.dip.toFixed(1).padStart(6)} │ ${result2.dipDir.toFixed(1).padStart(9)} │ ${coords2.east.toFixed(2).padStart(13)} │ ${coords2.north.toFixed(2).padStart(12)} │ ${coords2.elev.toFixed(2).padStart(12)} │ BOH2 (${DRILL_HOLE.boh}°)   │`)
console.log('└───────┴────────┴────────┴────────┴────────┴────────┴───────────┴───────────────┴──────────────┴──────────────┴──────────────┘')
console.log('')

// ==========================================
// ANÁLISIS DETALLADO
// ==========================================
console.log('🔬 ANÁLISIS DETALLADO')
console.log('═'.repeat(80))
console.log('')

console.log('PLANO 1 (α=30°, β=15°):')
console.log('─'.repeat(80))
console.log(`  💭 Interpretación física:`)
console.log(`     - α=30°: Plano a 30° del eje (moderadamente inclinado al eje)`)
console.log(`     - β=15°: Apunta 15° desde BOH en sentido horario`)
console.log(`     - En cilindro: Azimuth ≈ ${toDeg(toRad(DRILL_HOLE.boh - 90) + toRad(PLANO1.beta)).toFixed(1)}°`)
console.log(`  📏 Profundidad: ${PLANO1.depth} cm → ${(PLANO1.depth/100).toFixed(2)} m desde collar`)
console.log(`  🧭 Orientación Real: ${result1.dip.toFixed(1)}° / ${result1.dipDir.toFixed(0)}°`)
console.log(`  📍 Ubicación: Δ[E=${coords1.dE.toFixed(3)}m, N=${coords1.dN.toFixed(3)}m, Z=${coords1.dZ.toFixed(3)}m]`)
console.log('')

console.log('PLANO 2 (α=90°, β=40°):')
console.log('─'.repeat(80))
console.log(`  💭 Interpretación física:`)
console.log(`     - α=90°: Plano PARALELO al eje del sondaje`)
console.log(`     - β=40°: Apunta 40° desde BOH`)
console.log(`     - Para sondaje inclinado: Este plano también estará inclinado`)
console.log(`  📏 Profundidad: ${PLANO2.depth} cm → ${(PLANO2.depth/100).toFixed(2)} m desde collar`)
console.log(`  🧭 Orientación Real: ${result2.dip.toFixed(1)}° / ${result2.dipDir.toFixed(0)}°`)
console.log(`  📍 Ubicación: Δ[E=${coords2.dE.toFixed(3)}m, N=${coords2.dN.toFixed(3)}m, Z=${coords2.dZ.toFixed(3)}m]`)
console.log('')
console.log('')

// ==========================================
// FORMATO CSV COMPLETO
// ==========================================
console.log('📄 FORMATO CSV - COPIA Y PEGA PARA VALIDACIÓN')
console.log('═'.repeat(80))
console.log('')
console.log('# === INFORMACIÓN DEL SONDAJE ===')
console.log(`# Sondaje: ${DRILL_HOLE.name}`)
console.log(`# Azimut: ${DRILL_HOLE.azimuth.toFixed(2)}°`)
console.log(`# Inclinación: ${DRILL_HOLE.dip.toFixed(2)}°`)
console.log(`# UTM Este: ${DRILL_HOLE.collarE.toFixed(2)} m`)
console.log(`# UTM Norte: ${DRILL_HOLE.collarN.toFixed(2)} m`)
console.log(`# Cota: ${DRILL_HOLE.collarZ.toFixed(2)} m.s.n.m.`)
console.log('')
console.log('Plano,Prof_cm,Prof_m,Alpha,Beta,BOH,Dip_Real,Dip_Direction,UTM_Este,UTM_Norte,Elevacion')
console.log(`1,${PLANO1.depth.toFixed(2)},${(PLANO1.depth/100).toFixed(4)},${PLANO1.alpha.toFixed(2)},${PLANO1.beta.toFixed(2)},BOH1,${result1.dip.toFixed(2)},${result1.dipDir.toFixed(2)},${coords1.east.toFixed(2)},${coords1.north.toFixed(2)},${coords1.elev.toFixed(2)}`)
console.log(`2,${PLANO2.depth.toFixed(2)},${(PLANO2.depth/100).toFixed(4)},${PLANO2.alpha.toFixed(2)},${PLANO2.beta.toFixed(2)},BOH2,${result2.dip.toFixed(2)},${result2.dipDir.toFixed(2)},${coords2.east.toFixed(2)},${coords2.north.toFixed(2)},${coords2.elev.toFixed(2)}`)
console.log('')
console.log('')

// ==========================================
// INSTRUCCIONES DE VALIDACIÓN
// ==========================================
console.log('✅ INSTRUCCIONES PARA VALIDAR EN SOFTWARE GEOLÓGICO')
console.log('═'.repeat(80))
console.log('')
console.log('1. Abrir Dips, Leapfrog, o software similar')
console.log('2. Crear sondaje con estos parámetros:')
console.log(`   - Nombre: ${DRILL_HOLE.name}`)
console.log(`   - Collar: E=${DRILL_HOLE.collarE}, N=${DRILL_HOLE.collarN}, Z=${DRILL_HOLE.collarZ}`)
console.log(`   - Azimut: ${DRILL_HOLE.azimuth}°, Dip: ${DRILL_HOLE.dip}°`)
console.log('')
console.log('3. Ingresar mediciones estructurales:')
console.log(`   Plano 1: Depth=${(PLANO1.depth/100).toFixed(2)}m, α=${PLANO1.alpha}°, β=${PLANO1.beta}°`)
console.log(`   Plano 2: Depth=${(PLANO2.depth/100).toFixed(2)}m, α=${PLANO2.alpha}°, β=${PLANO2.beta}°`)
console.log('')
console.log('4. Exportar resultados del software y comparar:')
console.log(`   - Dip y Dip Direction (tolerancia: ±2°)`)
console.log(`   - Coordenadas UTM (tolerancia: ±0.1m)`)
console.log('')
console.log('5. Si difiere significativamente, ajustar fórmulas en GeoStXR')
console.log('')

