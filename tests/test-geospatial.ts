/**
 * Test script for geospatial calculations
 * Run with: npx ts-node tests/test-geospatial.ts
 */

import { calculateRealOrientation, calculateSpatialCoordinates } from '../lib/geospatial-transforms.js'

console.log('🧪 ===== GEOSPATIAL CALCULATIONS TEST =====\n')

// Test Case 1: Vertical Drill Hole
console.log('📋 TEST CASE 1: Vertical Drill Hole (-90°)')
console.log('─'.repeat(60))
const test1 = calculateRealOrientation(
  30,   // alpha
  45,   // beta
  90,   // BOH angle
  0,    // azimuth (North)
  -90,  // dip (vertical down)
  3.0   // radius
)
console.log('✅ Expected: ~20.7° / ~292°')
console.log(`📊 Result: ${test1.dip.toFixed(1)}° / ${test1.dipDirection.toFixed(1)}°`)
console.log(`✓ Match: ${Math.abs(test1.dip - 20.7) < 1 && Math.abs(test1.dipDirection - 292) < 2}`)
console.log('')

// Test Case 2: Horizontal Drill Hole (East)
console.log('📋 TEST CASE 2: Horizontal Drill Hole - East (0°, Az=90°)')
console.log('─'.repeat(60))
const test2 = calculateRealOrientation(
  45,   // alpha
  0,    // beta
  90,   // BOH angle
  90,   // azimuth (East)
  0,    // dip (horizontal)
  3.0   // radius
)
console.log('✅ Expected: 45.0° / 270°')
console.log(`📊 Result: ${test2.dip.toFixed(1)}° / ${test2.dipDirection.toFixed(1)}°`)
console.log(`✓ Match: ${Math.abs(test2.dip - 45) < 1 && Math.abs(test2.dipDirection - 270) < 2}`)
console.log('')

// Test Case 3: Inclined Drill Hole (typical)
console.log('📋 TEST CASE 3: Inclined Drill Hole (Az=45°, Dip=-60°)')
console.log('─'.repeat(60))
const test3 = calculateRealOrientation(
  30,   // alpha
  45,   // beta
  90,   // BOH angle
  45,   // azimuth (NE)
  -60,  // dip (inclined down)
  3.0   // radius
)
console.log('✅ Expected: ~7.2° / ~246°')
console.log(`📊 Result: ${test3.dip.toFixed(1)}° / ${test3.dipDirection.toFixed(1)}°`)
console.log(`✓ Match: ${Math.abs(test3.dip - 7.2) < 1 && Math.abs(test3.dipDirection - 246) < 2}`)
console.log('')

// Test Case 4: Spatial Coordinates
console.log('📋 TEST CASE 4: Spatial Coordinates Calculation')
console.log('─'.repeat(60))
const coords1 = calculateSpatialCoordinates(
  345678.50,  // collar East
  8765432.10, // collar North
  2450.75,    // collar Elevation
  0.15,       // depth 15cm = 0.15m
  45,         // azimuth (NE)
  -60         // dip (down)
)
console.log('✅ Expected: ~345678.55m E, ~8765432.15m N, ~2450.62m Z')
console.log(`📊 Result: E=${coords1.east.toFixed(2)}m, N=${coords1.north.toFixed(2)}m, Z=${coords1.elevation.toFixed(2)}m`)
console.log(`✓ Match: ${Math.abs(coords1.east - 345678.55) < 0.1 && Math.abs(coords1.north - 8765432.15) < 0.1}`)
console.log('')

// Test Case 5: Different BOH angles
console.log('📋 TEST CASE 5: Same plane, different BOH angles')
console.log('─'.repeat(60))
const test5a = calculateRealOrientation(30, 45, 70, 0, -90, 3.0)  // BOH at 70°
const test5b = calculateRealOrientation(30, 45, 90, 0, -90, 3.0)  // BOH at 90°
const test5c = calculateRealOrientation(30, 45, 110, 0, -90, 3.0) // BOH at 110°
console.log(`BOH=70°:  ${test5a.dip.toFixed(1)}° / ${test5a.dipDirection.toFixed(1)}°`)
console.log(`BOH=90°:  ${test5b.dip.toFixed(1)}° / ${test5b.dipDirection.toFixed(1)}°`)
console.log(`BOH=110°: ${test5c.dip.toFixed(1)}° / ${test5c.dipDirection.toFixed(1)}°`)
console.log('💡 Dip should stay constant, dipDirection should change')
console.log('')

// Test Case 6: Edge cases
console.log('📋 TEST CASE 6: Edge Cases')
console.log('─'.repeat(60))

// Horizontal plane (alpha = 90°)
const testHorizontal = calculateRealOrientation(90, 0, 90, 0, -90, 3.0)
console.log(`Horizontal plane (α=90°): ${testHorizontal.dip.toFixed(1)}° / ${testHorizontal.dipDirection.toFixed(1)}°`)
console.log(`✓ Expected: dip ≈ 0° (horizontal)`)

// Vertical plane (alpha = 0°)
const testVertical = calculateRealOrientation(0, 0, 90, 0, -90, 3.0)
console.log(`Vertical plane (α=0°): ${testVertical.dip.toFixed(1)}° / ${testVertical.dipDirection.toFixed(1)}°`)
console.log(`✓ Expected: dip ≈ 90° (vertical)`)

console.log('')

// Summary
console.log('🧪 ===== TEST SUMMARY =====')
console.log('✅ All calculations completed')
console.log('📊 Review results above for accuracy')
console.log('🔍 Compare with Dips, Leapfrog, or Stereonet for validation')
console.log('')
console.log('💡 TIP: Use these test cases to validate against geological software')
console.log('📚 See tests/geospatial-test-cases.md for manual calculations')

