/**
 * Test de invarianza CORRECTO
 * Si tengo el MISMO plano físico, pero lo mido con diferentes BOH,
 * las mediciones (α, β) cambiarán, pero el resultado global debe ser el mismo
 */

console.log('🔍 ===== TEST DE INVARIANZA CORRECTO =====\n')

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

console.log('Escenario: MISMO plano físico, diferentes mediciones')
console.log('─'.repeat(70))
console.log('')

// Plano real en cilindro: α=30°, apuntando hacia azimuth=135° (45° desde Y+)
const realAlpha = 30
const realAzimuthInCylinder = 135  // En grados, medido desde Y+ (BOH estándar)

console.log(`Plano Real:`)
console.log(`  α = ${realAlpha}° (ángulo desde eje)`)
console.log(`  Azimuth real en cilindro = ${realAzimuthInCylinder}° (desde Y+)`)
console.log('')

// Medición 1: Con BOH en posición estándar (90°)
const boh1 = 90  // BOH en Y+
const beta1 = realAzimuthInCylinder - 90  // β se mide desde BOH
console.log(`Medición 1: BOH=${boh1}°`)
console.log(`  α = ${realAlpha}°`)
console.log(`  β = ${beta1}° (desde BOH)`)
const n1 = getPlaneNormalInCylinder(realAlpha, beta1, boh1)
console.log(`  Normal = [${n1.map(v => v.toFixed(3)).join(', ')}]`)
console.log('')

// Medición 2: Con BOH rotado +20° (110°)
const boh2 = 110
const beta2 = realAzimuthInCylinder - 110  // Ajustar β para mantener mismo azimuth real
console.log(`Medición 2: BOH=${boh2}°`)
console.log(`  α = ${realAlpha}°`)
console.log(`  β = ${beta2}° (desde BOH)`)
const n2 = getPlaneNormalInCylinder(realAlpha, beta2, boh2)
console.log(`  Normal = [${n2.map(v => v.toFixed(3)).join(', ')}]`)
console.log('')

// Medición 3: Con BOH rotado -20° (70°)
const boh3 = 70
const beta3 = realAzimuthInCylinder - 70
console.log(`Medición 3: BOH=${boh3}°`)
console.log(`  α = ${realAlpha}°`)
console.log(`  β = ${beta3}° (desde BOH)`)
const n3 = getPlaneNormalInCylinder(realAlpha, beta3, boh3)
console.log(`  Normal = [${n3.map(v => v.toFixed(3)).join(', ')}]`)
console.log('')

// Verificar que los vectores son iguales
console.log('Comparación:')
console.log('─'.repeat(70))
console.log(`n1 = [${n1.map(v => v.toFixed(4)).join(', ')}]`)
console.log(`n2 = [${n2.map(v => v.toFixed(4)).join(', ')}]`)
console.log(`n3 = [${n3.map(v => v.toFixed(4)).join(', ')}]`)
console.log('')

// Calcular diferencias
const diff12 = Math.sqrt((n1[0]-n2[0])**2 + (n1[1]-n2[1])**2 + (n1[2]-n2[2])**2)
const diff13 = Math.sqrt((n1[0]-n3[0])**2 + (n1[1]-n3[1])**2 + (n1[2]-n3[2])**2)
const diff23 = Math.sqrt((n2[0]-n3[0])**2 + (n2[1]-n3[1])**2 + (n2[2]-n3[2])**2)

console.log(`Diferencia |n1-n2| = ${diff12.toFixed(6)}`)
console.log(`Diferencia |n1-n3| = ${diff13.toFixed(6)}`)
console.log(`Diferencia |n2-n3| = ${diff23.toFixed(6)}`)
console.log('')

const maxDiff = Math.max(diff12, diff13, diff23)
const pass = maxDiff < 0.001

console.log(`Diferencia máxima: ${maxDiff.toFixed(6)}`)
console.log(`✓ Esperado: < 0.001 (vectores prácticamente idénticos)`)
console.log('')

if (pass) {
  console.log('✅ TEST PASS: Los vectores son idénticos')
  console.log('   Las fórmulas son correctas para invarianza rotacional')
} else {
  console.log('❌ TEST FAIL: Los vectores difieren significativamente')
  console.log('   Hay un error en cómo se combinan α, β y BOH')
}
console.log('')

