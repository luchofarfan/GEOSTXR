/**
 * Simple test script for geospatial calculations
 * Run with: node tests/test-geospatial-simple.js
 */

// Helper functions
function toRadians(degrees) {
  return degrees * Math.PI / 180
}

function toDegrees(radians) {
  return radians * 180 / Math.PI
}

function normalizeAngle(degrees) {
  let normalized = degrees % 360
  if (normalized < 0) normalized += 360
  return normalized
}

// Get rotation matrix for drill hole orientation
function getDrillHoleRotationMatrix(azimuth, dip) {
  const azRad = toRadians(azimuth)
  const dipRad = toRadians(-dip) // Negative because dip is downward
  
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

// Transform vector
function transformVector(localVector, rotationMatrix) {
  const [x, y, z] = localVector
  return [
    rotationMatrix[0][0] * x + rotationMatrix[0][1] * y + rotationMatrix[0][2] * z,
    rotationMatrix[1][0] * x + rotationMatrix[1][1] * y + rotationMatrix[1][2] * z,
    rotationMatrix[2][0] * x + rotationMatrix[2][1] * y + rotationMatrix[2][2] * z
  ]
}

// Get plane normal in cylinder frame
function getPlaneNormalInCylinder(alpha, beta, bohAngle) {
  const alphaRad = toRadians(alpha)
  const betaRad = toRadians(beta)
  const bohRad = toRadians(bohAngle)
  
  // BOH offset from Y-axis (90° = along Y)
  const bohOffsetFromY = bohRad - Math.PI/2
  
  // Total azimuth in cylinder
  const azimuthInCylinder = bohOffsetFromY + betaRad
  
  // Standard geological convention
  const nx = Math.sin(alphaRad) * Math.sin(azimuthInCylinder)
  const ny = Math.sin(alphaRad) * Math.cos(azimuthInCylinder)
  const nz = Math.cos(alphaRad)
  
  return [nx, ny, nz]
}

// Calculate real orientation
function calculateRealOrientation(alpha, beta, bohAngle, drillAzimuth, drillDip) {
  const normalLocal = getPlaneNormalInCylinder(alpha, beta, bohAngle)
  const rotMatrix = getDrillHoleRotationMatrix(drillAzimuth, drillDip)
  const normalGlobal = transformVector(normalLocal, rotMatrix)
  
  const [nx, ny, nz] = normalGlobal
  const dipRad = Math.asin(Math.abs(nz))
  const dip = toDegrees(dipRad)
  
  let dipDirectionRad = Math.atan2(nx, ny)
  
  if (nz > 0) {
    dipDirectionRad += Math.PI
  }
  
  let dipDirection = toDegrees(dipDirectionRad)
  dipDirection = normalizeAngle(dipDirection)
  
  return { dip, dipDirection }
}

// Run tests
console.log('🧪 ===== GEOSPATIAL CALCULATIONS TEST =====\n')

// Test Case 1: Vertical Drill Hole
console.log('📋 TEST CASE 1: Vertical Drill Hole (-90°)')
console.log('─'.repeat(60))
const test1 = calculateRealOrientation(30, 45, 90, 0, -90)
console.log('Input: α=30°, β=45°, BOH=90°, Az=0°, Dip=-90°')
console.log('✅ Expected: ~20.7° / ~292°')
console.log(`📊 Result: ${test1.dip.toFixed(1)}° / ${test1.dipDirection.toFixed(1)}°`)
const match1 = Math.abs(test1.dip - 20.7) < 1 && Math.abs(test1.dipDirection - 292) < 2
console.log(`✓ Match: ${match1 ? '✅ PASS' : '❌ FAIL'}`)
console.log('')

// Test Case 2: Horizontal Drill Hole (East)
console.log('📋 TEST CASE 2: Horizontal Drill Hole - East (0°, Az=90°)')
console.log('─'.repeat(60))
const test2 = calculateRealOrientation(45, 0, 90, 90, 0)
console.log('Input: α=45°, β=0°, BOH=90°, Az=90°, Dip=0°')
console.log('✅ Expected: 45.0° / 270°')
console.log(`📊 Result: ${test2.dip.toFixed(1)}° / ${test2.dipDirection.toFixed(1)}°`)
const match2 = Math.abs(test2.dip - 45) < 1 && Math.abs(test2.dipDirection - 270) < 2
console.log(`✓ Match: ${match2 ? '✅ PASS' : '❌ FAIL'}`)
console.log('')

// Test Case 3: Inclined Drill Hole (typical)
console.log('📋 TEST CASE 3: Inclined Drill Hole (Az=45°, Dip=-60°)')
console.log('─'.repeat(60))
const test3 = calculateRealOrientation(30, 45, 90, 45, -60)
console.log('Input: α=30°, β=45°, BOH=90°, Az=45°, Dip=-60°')
console.log('✅ Expected: ~7.2° / ~246°')
console.log(`📊 Result: ${test3.dip.toFixed(1)}° / ${test3.dipDirection.toFixed(1)}°`)
const match3 = Math.abs(test3.dip - 7.2) < 1 && Math.abs(test3.dipDirection - 246) < 2
console.log(`✓ Match: ${match3 ? '✅ PASS' : '❌ FAIL'}`)
console.log('')

// Test Case 4: Different BOH angles (same plane)
console.log('📋 TEST CASE 4: Same plane, different BOH angles')
console.log('─'.repeat(60))
const test4a = calculateRealOrientation(30, 45, 70, 0, -90)  // BOH at 70°
const test4b = calculateRealOrientation(30, 45, 90, 0, -90)  // BOH at 90°
const test4c = calculateRealOrientation(30, 45, 110, 0, -90) // BOH at 110°
console.log(`BOH=70°:  ${test4a.dip.toFixed(1)}° / ${test4a.dipDirection.toFixed(1)}°`)
console.log(`BOH=90°:  ${test4b.dip.toFixed(1)}° / ${test4b.dipDirection.toFixed(1)}°`)
console.log(`BOH=110°: ${test4c.dip.toFixed(1)}° / ${test4c.dipDirection.toFixed(1)}°`)
console.log('💡 Dip should stay constant, dipDirection should change by BOH difference')
console.log('')

// Test Case 5: Edge cases
console.log('📋 TEST CASE 5: Edge Cases')
console.log('─'.repeat(60))

// Horizontal plane (alpha = 90°)
const testHorizontal = calculateRealOrientation(90, 0, 90, 0, -90)
console.log(`Horizontal plane (α=90°): ${testHorizontal.dip.toFixed(1)}° / ${testHorizontal.dipDirection.toFixed(1)}°`)
console.log(`✓ Expected: dip ≈ 0° (horizontal)`)

// Vertical plane (alpha = 0°)
const testVertical = calculateRealOrientation(0, 0, 90, 0, -90)
console.log(`Vertical plane (α=0°): ${testVertical.dip.toFixed(1)}° / ${testVertical.dipDirection.toFixed(1)}°`)
console.log(`✓ Expected: dip ≈ 90° (vertical)`)

console.log('')

// Summary
console.log('🧪 ===== TEST SUMMARY =====')
const allPass = match1 && match2 && match3
console.log(allPass ? '✅ ALL TESTS PASSED' : '❌ SOME TESTS FAILED')
console.log('📊 Review results above for accuracy')
console.log('🔍 Compare with Dips, Leapfrog, or Stereonet for validation')
console.log('')
console.log('💡 TIP: Use these test cases to validate against geological software')
console.log('📚 See tests/geospatial-test-cases.md for manual calculations')

