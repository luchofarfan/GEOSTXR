/**
 * Step-by-step validation of geospatial calculations
 * Testing with simplest possible cases
 */

console.log('🔍 ===== STEP-BY-STEP VALIDATION =====\n')

// Helper functions
function toRad(deg) { return deg * Math.PI / 180 }
function toDeg(rad) { return rad * 180 / Math.PI }

// ========================================
// CASO 1: MÁS SIMPLE POSIBLE
// Sondaje vertical, plano horizontal
// ========================================
console.log('📋 CASO 1: Sondaje Vertical + Plano Horizontal')
console.log('═'.repeat(70))
console.log('Configuración:')
console.log('  Sondaje: Vertical hacia abajo (Az=0°, Dip=-90°)')
console.log('  Plano: Horizontal (α=90°, β=0°, BOH=90°)')
console.log('')

// Paso 1: Vector normal en cilindro
console.log('PASO 1: Vector Normal en Cilindro')
console.log('─'.repeat(70))
const alpha1 = 90  // Plano paralelo al eje = horizontal
const beta1 = 0    // Hacia BOH
const boh1 = 90    // BOH en posición estándar

// Para α=90°: plano paralelo al eje (horizontal si sondaje es vertical)
// Vector normal debería apuntar perpendicular al eje
const bohOffsetFromY = toRad(boh1 - 90)  // = 0 (BOH está en Y)
const azimuthInCylinder1 = bohOffsetFromY + toRad(beta1)  // = 0

const nx1_local = Math.sin(toRad(alpha1)) * Math.sin(azimuthInCylinder1)
const ny1_local = Math.sin(toRad(alpha1)) * Math.cos(azimuthInCylinder1)
const nz1_local = Math.cos(toRad(alpha1))

console.log(`  α = ${alpha1}° (90° = paralelo al eje)`)
console.log(`  β = ${beta1}° (0° = hacia BOH)`)
console.log(`  BOH offset = ${toDeg(bohOffsetFromY).toFixed(1)}°`)
console.log(`  Azimuth en cilindro = ${toDeg(azimuthInCylinder1).toFixed(1)}°`)
console.log(`  Normal (local) = [${nx1_local.toFixed(3)}, ${ny1_local.toFixed(3)}, ${nz1_local.toFixed(3)}]`)
console.log(`  ✓ Esperado: [0, 1, 0] - apunta hacia BOH (Y+)`)
console.log('')

// Paso 2: Matriz de rotación
console.log('PASO 2: Matriz de Rotación del Sondaje')
console.log('─'.repeat(70))
const drillAz1 = 0    // Norte
const drillDip1 = -90 // Vertical hacia abajo

const azRad1 = toRad(drillAz1)
const dipRad1 = toRad(-drillDip1)  // Negativo porque -90° es hacia abajo

console.log(`  Drill Azimut = ${drillAz1}° (Norte)`)
console.log(`  Drill Dip = ${drillDip1}° (vertical abajo)`)
console.log(`  Para vertical: Matriz rota Z local → -Z global`)
console.log('')

// Matriz simplificada para vertical
const R1 = [
  [0,  0, -1],
  [0,  1,  0],
  [1,  0,  0]
]
console.log('  Matriz R =')
console.log(`    [${R1[0].join(', ')}]`)
console.log(`    [${R1[1].join(', ')}]`)
console.log(`    [${R1[2].join(', ')}]`)
console.log('')

// Paso 3: Transformar
console.log('PASO 3: Transformación a Marco Global')
console.log('─'.repeat(70))
const nx1_global = R1[0][0]*nx1_local + R1[0][1]*ny1_local + R1[0][2]*nz1_local
const ny1_global = R1[1][0]*nx1_local + R1[1][1]*ny1_local + R1[1][2]*nz1_local
const nz1_global = R1[2][0]*nx1_local + R1[2][1]*ny1_local + R1[2][2]*nz1_local

console.log(`  Normal (global) = [${nx1_global.toFixed(3)}, ${ny1_global.toFixed(3)}, ${nz1_global.toFixed(3)}]`)
console.log(`  ✓ Esperado: [0, 1, 0] - apunta Norte (horizontal)`)
console.log('')

// Paso 4: Calcular dip y dip direction
console.log('PASO 4: Calcular Dip y Dip Direction')
console.log('─'.repeat(70))
const dip1 = toDeg(Math.acos(Math.abs(nz1_global)))
let dipDir1 = toDeg(Math.atan2(nx1_global, ny1_global))
if (dipDir1 < 0) dipDir1 += 360

console.log(`  |nz| = ${Math.abs(nz1_global).toFixed(3)}`)
console.log(`  Dip = arcsin(|nz|) = ${dip1.toFixed(1)}°`)
console.log(`  Dip Direction = atan2(nx, ny) = ${dipDir1.toFixed(1)}°`)
console.log(`  ✓ Esperado: Dip ≈ 0° (horizontal), DipDir = 0° o 360° (Norte)`)
console.log('')

const case1_pass = Math.abs(dip1) < 1 && (Math.abs(dipDir1) < 5 || Math.abs(dipDir1 - 360) < 5)
console.log(`RESULTADO: ${case1_pass ? '✅ PASS' : '❌ FAIL'}`)
console.log('')
console.log('')

// ========================================
// CASO 2: SEGUNDO MÁS SIMPLE
// Sondaje vertical, plano vertical
// ========================================
console.log('📋 CASO 2: Sondaje Vertical + Plano Vertical hacia Este')
console.log('═'.repeat(70))
console.log('Configuración:')
console.log('  Sondaje: Vertical hacia abajo (Az=0°, Dip=-90°)')
console.log('  Plano: Perpendicular al sondaje (α=0°, β=90°, BOH=90°)')
console.log('')

// Paso 1: Vector normal en cilindro
console.log('PASO 1: Vector Normal en Cilindro')
console.log('─'.repeat(70))
const alpha2 = 0   // Plano perpendicular al eje
const beta2 = 90   // 90° desde BOH = hacia Este en cilindro
const boh2 = 90

const bohOffset2 = toRad(boh2 - 90)
const azimuthCyl2 = bohOffset2 + toRad(beta2)

const nx2_local = Math.sin(toRad(alpha2)) * Math.sin(azimuthCyl2)
const ny2_local = Math.sin(toRad(alpha2)) * Math.cos(azimuthCyl2)
const nz2_local = Math.cos(toRad(alpha2))

console.log(`  α = ${alpha2}° (0° = perpendicular al eje)`)
console.log(`  β = ${beta2}° (90° desde BOH)`)
console.log(`  Normal (local) = [${nx2_local.toFixed(3)}, ${ny2_local.toFixed(3)}, ${nz2_local.toFixed(3)}]`)
console.log(`  ✓ Esperado: [0, 0, 1] - a lo largo del eje Z`)
console.log('')

// Transformar
const nx2_global = 0*nx2_local + 0*ny2_local + (-1)*nz2_local
const ny2_global = 0*nx2_local + 1*ny2_local + 0*nz2_local
const nz2_global = 1*nx2_local + 0*ny2_local + 0*nz2_local

console.log('PASO 2: Transformación')
console.log('─'.repeat(70))
console.log(`  Normal (global) = [${nx2_global.toFixed(3)}, ${ny2_global.toFixed(3)}, ${nz2_global.toFixed(3)}]`)
console.log(`  ✓ Esperado: [0, 0, -1] - hacia abajo (vertical)`)
console.log('')

const dip2 = toDeg(Math.acos(Math.abs(nz2_global)))
console.log('PASO 3: Calcular Orientación')
console.log('─'.repeat(70))
console.log(`  Dip = ${dip2.toFixed(1)}°`)
console.log(`  ✓ Esperado: Dip ≈ 90° (plano vertical)`)
console.log('')

const case2_pass = Math.abs(dip2 - 90) < 1
console.log(`RESULTADO: ${case2_pass ? '✅ PASS' : '❌ FAIL'}`)
console.log('')
console.log('')

// ========================================
// CASO 3: VALIDACIÓN GEOMÉTRICA
// ========================================
console.log('📋 CASO 3: Validación Geométrica - Invarianza Rotacional')
console.log('═'.repeat(70))
console.log('Concepto: Si cambio BOH pero mantengo la misma estructura real,')
console.log('         dip debería cambiar pero la orientación real NO.')
console.log('')

// Mismo plano físico, medido con diferentes BOH
const alpha3 = 30
const beta3 = 45

// Medir con BOH a 70°, 90°, 110°
const testBOH = [70, 90, 110]
const results = []

testBOH.forEach(bohAngle => {
  const bohOff = toRad(bohAngle - 90)
  const azCyl = bohOff + toRad(beta3)
  
  const nx_loc = Math.sin(toRad(alpha3)) * Math.sin(azCyl)
  const ny_loc = Math.sin(toRad(alpha3)) * Math.cos(azCyl)
  const nz_loc = Math.cos(toRad(alpha3))
  
  // Transformar con sondaje vertical
  const nx_glob = 0*nx_loc + 0*ny_loc + (-1)*nz_loc
  const ny_glob = 0*nx_loc + 1*ny_loc + 0*nz_loc
  const nz_glob = 1*nx_loc + 0*ny_loc + 0*nz_loc
  
  const dip = toDeg(Math.acos(Math.abs(nz_glob)))
  let dipDir = toDeg(Math.atan2(nx_glob, ny_glob))
  if (dipDir < 0) dipDir += 360
  
  results.push({ bohAngle, dip, dipDir, nx_glob, ny_glob, nz_glob })
})

console.log('Resultados:')
results.forEach(r => {
  console.log(`  BOH=${r.bohAngle}°: Dip=${r.dip.toFixed(1)}°, DipDir=${r.dipDir.toFixed(1)}°, n=[${r.nx_glob.toFixed(3)}, ${r.ny_glob.toFixed(3)}, ${r.nz_glob.toFixed(3)}]`)
})
console.log('')

// Check: Todos los vectores normales globales deberían ser iguales
const dipVariance = Math.max(...results.map(r => r.dip)) - Math.min(...results.map(r => r.dip))
console.log(`Varianza en Dip: ${dipVariance.toFixed(2)}°`)
console.log(`✓ Esperado: Varianza ≈ 0° (mismo plano físico)`)
console.log('')

const case3_pass = dipVariance < 0.1
console.log(`RESULTADO: ${case3_pass ? '✅ PASS - Todos los vectores son consistentes' : '❌ FAIL - Los vectores cambian con BOH'}`)
console.log('')
console.log('')

// ========================================
// RESUMEN FINAL
// ========================================
console.log('🎯 ===== RESUMEN DE VALIDACIÓN =====')
console.log('')
console.log(`Caso 1 (Horizontal):              ${case1_pass ? '✅' : '❌'}`)
console.log(`Caso 2 (Vertical):                ${case2_pass ? '✅' : '❌'}`)
console.log(`Caso 3 (Invarianza Rotacional):   ${case3_pass ? '✅' : '❌'}`)
console.log('')

const allPass = case1_pass && case2_pass && case3_pass

if (allPass) {
  console.log('✅ ¡TODAS LAS VALIDACIONES PASARON!')
  console.log('   Las fórmulas son correctas para estos casos básicos.')
  console.log('   Siguiente paso: Validar con software geológico.')
} else {
  console.log('❌ ALGUNAS VALIDACIONES FALLARON')
  console.log('   Las fórmulas requieren ajustes.')
  console.log('   Revisar interpretación de α, β y transformaciones.')
}
console.log('')

