/**
 * Simulador de Plano Específico
 * Simula cómo se vería un plano con α y β dados
 * bajo diferentes configuraciones de sondaje
 */

console.log('🎯 ===== SIMULADOR DE PLANO ESPECÍFICO =====\n')

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
  
  return { dip, dipDir, normalGlobal }
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
    elev: collarZ + dZ
  }
}

// ==========================================
// PLANO A SIMULAR
// ==========================================
console.log('📐 PLANO A SIMULAR:')
console.log('═'.repeat(80))

const PLANO = {
  alpha: 45,      // Medición en cilindro
  beta: 0,        // Medición desde BOH
  depth: 15,      // cm
  boh: 90         // BOH en posición estándar (frente del cilindro)
}

console.log(`  α (alpha) = ${PLANO.alpha}° - Ángulo desde el eje del sondaje`)
console.log(`  β (beta) = ${PLANO.beta}° - Ángulo desde línea BOH`)
console.log(`  Profundidad = ${PLANO.depth} cm = ${(PLANO.depth/100).toFixed(2)} m`)
console.log(`  BOH = ${PLANO.boh}° (posición estándar - frente del cilindro)`)
console.log('')

console.log('💡 Interpretación:')
console.log(`  - α=45° significa: plano a 45° del eje (ni paralelo ni perpendicular)`)
console.log(`  - β=0° significa: la traza del plano apunta hacia el BOH`)
console.log('')

// Vector normal en cilindro
const normalLocal = getPlaneNormalInCylinder(PLANO.alpha, PLANO.beta, PLANO.boh)
console.log(`  Vector Normal (marco local cilindro):`)
console.log(`  n = [${normalLocal.map(v => v.toFixed(4)).join(', ')}]`)
console.log('')
console.log('')

// ==========================================
// SIMULACIÓN 1: SONDAJE VERTICAL
// ==========================================
console.log('🔍 SIMULACIÓN 1: Sondaje VERTICAL hacia abajo')
console.log('═'.repeat(80))

const SIM1 = {
  name: 'DDH-VERT-001',
  azimuth: 0,      // Norte
  dip: -90,        // Vertical hacia abajo
  collarE: 345678.50,
  collarN: 8765432.10,
  collarZ: 2450.75
}

console.log(`Sondaje: ${SIM1.name}`)
console.log(`  Azimut: ${SIM1.azimuth}° (Norte)`)
console.log(`  Inclinación: ${SIM1.dip}° (vertical hacia abajo)`)
console.log(`  Collar: E=${SIM1.collarE}m, N=${SIM1.collarN}m, Z=${SIM1.collarZ}m`)
console.log('')

const result1 = calculateRealOrientation(
  PLANO.alpha, PLANO.beta, PLANO.boh,
  SIM1.azimuth, SIM1.dip
)

const coords1 = calculateSpatialCoords(
  SIM1.collarE, SIM1.collarN, SIM1.collarZ,
  PLANO.depth / 100,  // convertir a metros
  SIM1.azimuth, SIM1.dip
)

console.log('📊 RESULTADOS:')
console.log('─'.repeat(80))
console.log(`  Vector Normal (marco global):`)
console.log(`  n = [${result1.normalGlobal.map(v => v.toFixed(4)).join(', ')}]`)
console.log('')
console.log(`  🧭 ORIENTACIÓN REAL:`)
console.log(`     Dip (buzamiento): ${result1.dip.toFixed(2)}°`)
console.log(`     Dip Direction: ${result1.dipDir.toFixed(2)}°`)
console.log(`     Notación geológica: ${result1.dip.toFixed(1)}°/${result1.dipDir.toFixed(0)}°`)
console.log('')
console.log(`  📍 COORDENADAS ESPACIALES:`)
console.log(`     UTM Este: ${coords1.east.toFixed(2)} m`)
console.log(`     UTM Norte: ${coords1.north.toFixed(2)} m`)
console.log(`     Elevación: ${coords1.elev.toFixed(2)} m.s.n.m.`)
console.log(`     Δ desde collar: ΔE=${(coords1.east-SIM1.collarE).toFixed(2)}m, ΔN=${(coords1.north-SIM1.collarN).toFixed(2)}m, ΔZ=${(coords1.elev-SIM1.collarZ).toFixed(2)}m`)
console.log('')
console.log('')

// ==========================================
// SIMULACIÓN 2: SONDAJE INCLINADO (TÍPICO)
// ==========================================
console.log('🔍 SIMULACIÓN 2: Sondaje INCLINADO hacia NE (típico en minería)')
console.log('═'.repeat(80))

const SIM2 = {
  name: 'DDH-INC-045',
  azimuth: 45,     // NE
  dip: -60,        // Inclinado hacia abajo
  collarE: 345678.50,
  collarN: 8765432.10,
  collarZ: 2450.75
}

console.log(`Sondaje: ${SIM2.name}`)
console.log(`  Azimut: ${SIM2.azimuth}° (NE)`)
console.log(`  Inclinación: ${SIM2.dip}° (inclinado hacia abajo)`)
console.log(`  Collar: E=${SIM2.collarE}m, N=${SIM2.collarN}m, Z=${SIM2.collarZ}m`)
console.log('')

const result2 = calculateRealOrientation(
  PLANO.alpha, PLANO.beta, PLANO.boh,
  SIM2.azimuth, SIM2.dip
)

const coords2 = calculateSpatialCoords(
  SIM2.collarE, SIM2.collarN, SIM2.collarZ,
  PLANO.depth / 100,
  SIM2.azimuth, SIM2.dip
)

console.log('📊 RESULTADOS:')
console.log('─'.repeat(80))
console.log(`  Vector Normal (marco global):`)
console.log(`  n = [${result2.normalGlobal.map(v => v.toFixed(4)).join(', ')}]`)
console.log('')
console.log(`  🧭 ORIENTACIÓN REAL:`)
console.log(`     Dip (buzamiento): ${result2.dip.toFixed(2)}°`)
console.log(`     Dip Direction: ${result2.dipDir.toFixed(2)}°`)
console.log(`     Notación geológica: ${result2.dip.toFixed(1)}°/${result2.dipDir.toFixed(0)}°`)
console.log('')
console.log(`  📍 COORDENADAS ESPACIALES:`)
console.log(`     UTM Este: ${coords2.east.toFixed(2)} m`)
console.log(`     UTM Norte: ${coords2.north.toFixed(2)} m`)
console.log(`     Elevación: ${coords2.elev.toFixed(2)} m.s.n.m.`)
console.log(`     Δ desde collar: ΔE=${(coords2.east-SIM2.collarE).toFixed(2)}m, ΔN=${(coords2.north-SIM2.collarN).toFixed(2)}m, ΔZ=${(coords2.elev-SIM2.collarZ).toFixed(2)}m`)
console.log('')
console.log('')

// ==========================================
// SIMULACIÓN 3: SONDAJE HORIZONTAL
// ==========================================
console.log('🔍 SIMULACIÓN 3: Sondaje HORIZONTAL hacia Este')
console.log('═'.repeat(80))

const SIM3 = {
  name: 'DDH-HOR-090',
  azimuth: 90,     // Este
  dip: 0,          // Horizontal
  collarE: 345678.50,
  collarN: 8765432.10,
  collarZ: 2450.75
}

console.log(`Sondaje: ${SIM3.name}`)
console.log(`  Azimut: ${SIM3.azimuth}° (Este)`)
console.log(`  Inclinación: ${SIM3.dip}° (horizontal)`)
console.log(`  Collar: E=${SIM3.collarE}m, N=${SIM3.collarN}m, Z=${SIM3.collarZ}m`)
console.log('')

const result3 = calculateRealOrientation(
  PLANO.alpha, PLANO.beta, PLANO.boh,
  SIM3.azimuth, SIM3.dip
)

const coords3 = calculateSpatialCoords(
  SIM3.collarE, SIM3.collarN, SIM3.collarZ,
  PLANO.depth / 100,
  SIM3.azimuth, SIM3.dip
)

console.log('📊 RESULTADOS:')
console.log('─'.repeat(80))
console.log(`  Vector Normal (marco global):`)
console.log(`  n = [${result3.normalGlobal.map(v => v.toFixed(4)).join(', ')}]`)
console.log('')
console.log(`  🧭 ORIENTACIÓN REAL:`)
console.log(`     Dip (buzamiento): ${result3.dip.toFixed(2)}°`)
console.log(`     Dip Direction: ${result3.dipDir.toFixed(2)}°`)
console.log(`     Notación geológica: ${result3.dip.toFixed(1)}°/${result3.dipDir.toFixed(0)}°`)
console.log('')
console.log(`  📍 COORDENADAS ESPACIALES:`)
console.log(`     UTM Este: ${coords3.east.toFixed(2)} m`)
console.log(`     UTM Norte: ${coords3.north.toFixed(2)} m`)
console.log(`     Elevación: ${coords3.elev.toFixed(2)} m.s.n.m.`)
console.log(`     Δ desde collar: ΔE=${(coords3.east-SIM3.collarE).toFixed(2)}m, ΔN=${(coords3.north-SIM3.collarN).toFixed(2)}m, ΔZ=${(coords3.elev-SIM3.collarZ).toFixed(2)}m`)
console.log('')
console.log('')

// ==========================================
// COMPARACIÓN
// ==========================================
console.log('📊 COMPARACIÓN DE RESULTADOS')
console.log('═'.repeat(80))
console.log('')
console.log('MISMO plano (α=45°, β=0°) medido en DIFERENTES sondajes:')
console.log('')
console.log('┌────────────────┬──────────────┬──────────────────┬─────────────────┐')
console.log('│ Sondaje        │ Dip Real     │ Dip Direction    │ Posición        │')
console.log('├────────────────┼──────────────┼──────────────────┼─────────────────┤')
console.log(`│ Vertical       │ ${result1.dip.toFixed(1).padStart(6)}°      │ ${result1.dipDir.toFixed(0).padStart(6)}°          │ E+0.00, Z-0.15  │`)
console.log(`│ Inclinado NE   │ ${result2.dip.toFixed(1).padStart(6)}°      │ ${result2.dipDir.toFixed(0).padStart(6)}°          │ E+${(coords2.east-SIM2.collarE).toFixed(2)}, Z${(coords2.elev-SIM2.collarZ).toFixed(2)} │`)
console.log(`│ Horizontal E   │ ${result3.dip.toFixed(1).padStart(6)}°      │ ${result3.dipDir.toFixed(0).padStart(6)}°          │ E+0.15, Z+0.00  │`)
console.log('└────────────────┴──────────────┴──────────────────┴─────────────────┘')
console.log('')

console.log('💡 INTERPRETACIÓN:')
console.log('  - Mismas mediciones locales (α, β) en diferentes sondajes')
console.log('  - Producen diferentes orientaciones reales (dip, dip direction)')
console.log('  - Esto es CORRECTO y esperado')
console.log('  - La orientación del sondaje afecta la orientación real del plano')
console.log('')

// ==========================================
// DATOS PARA VALIDACIÓN
// ==========================================
console.log('📋 DATOS PARA VALIDACIÓN EN SOFTWARE GEOLÓGICO')
console.log('═'.repeat(80))
console.log('')
console.log('Para validar en Dips, Leapfrog, o software similar:')
console.log('')
console.log('INPUT (Simulación 2 - Caso típico):')
console.log('─'.repeat(80))
console.log(`  Collar:`)
console.log(`    Este: ${SIM2.collarE} m`)
console.log(`    Norte: ${SIM2.collarN} m`)
console.log(`    Elevación: ${SIM2.collarZ} m`)
console.log(`  Orientación del Sondaje:`)
console.log(`    Azimut: ${SIM2.azimuth}°`)
console.log(`    Dip: ${SIM2.dip}°`)
console.log(`  Medición Estructural (en testigo):`)
console.log(`    Profundidad: ${PLANO.depth} cm (${(PLANO.depth/100).toFixed(3)} m)`)
console.log(`    Alpha (α): ${PLANO.alpha}°`)
console.log(`    Beta (β): ${PLANO.beta}°`)
console.log('')
console.log('EXPECTED OUTPUT (según GeoStXR):')
console.log('─'.repeat(80))
console.log(`  Orientación Real:`)
console.log(`    Dip: ${result2.dip.toFixed(2)}°`)
console.log(`    Dip Direction: ${result2.dipDir.toFixed(2)}°`)
console.log(`  Coordenadas:`)
console.log(`    Este: ${coords2.east.toFixed(2)} m`)
console.log(`    Norte: ${coords2.north.toFixed(2)} m`)
console.log(`    Elevación: ${coords2.elev.toFixed(2)} m`)
console.log('')
console.log('✅ Compara estos valores con el software geológico')
console.log('✅ Diferencias aceptables: ±2° en ángulos, ±0.1m en coordenadas')
console.log('')

