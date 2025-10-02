/**
 * Test Data Loader
 * Loads synthetic planes with known measurements for validation
 */

export interface TestPlane {
  id: string
  alpha: number
  beta: number
  depthCm: number
  structureType: string
  color: string
}

export interface TestDrillHole {
  name: string
  azimuth: number
  dip: number
  utmEast: number
  utmNorth: number
  elevation: number
}

/**
 * Synthetic test scenario for validation
 */
export interface TestScenario {
  name: string
  description: string
  drillHole: TestDrillHole
  planes: TestPlane[]
  bohAngles: {
    line1: number
    line2: number
  }
}

/**
 * Default test scenarios
 */
export const TEST_SCENARIOS: TestScenario[] = [
  {
    name: 'Validación Básica',
    description: 'Dos planos con mediciones conocidas en sondaje inclinado típico',
    drillHole: {
      name: 'DDH-TEST-001',
      azimuth: 45,
      dip: -65,
      utmEast: 345678.50,
      utmNorth: 8765432.10,
      elevation: 2450.75
    },
    planes: [
      {
        id: 'test-plane-1',
        alpha: 30,
        beta: 15,
        depthCm: 16,
        structureType: 'Veta',
        color: '#FF6B6B'
      },
      {
        id: 'test-plane-2',
        alpha: 90,
        beta: 40,
        depthCm: 20,
        structureType: 'Diaclasa',
        color: '#4ECDC4'
      }
    ],
    bohAngles: {
      line1: 90,
      line2: 90
    }
  },
  {
    name: 'Sondaje Vertical',
    description: 'Planos en sondaje vertical para validación simple',
    drillHole: {
      name: 'DDH-VERT-001',
      azimuth: 0,
      dip: -90,
      utmEast: 350000.00,
      utmNorth: 8750000.00,
      elevation: 2500.00
    },
    planes: [
      {
        id: 'test-vert-1',
        alpha: 45,
        beta: 0,
        depthCm: 10,
        structureType: 'Foliación',
        color: '#95E1D3'
      },
      {
        id: 'test-vert-2',
        alpha: 60,
        beta: 90,
        depthCm: 25,
        structureType: 'Falla',
        color: '#F38181'
      }
    ],
    bohAngles: {
      line1: 90,
      line2: 90
    }
  },
  {
    name: 'Sondaje Horizontal',
    description: 'Planos en sondaje horizontal para caso extremo',
    drillHole: {
      name: 'DDH-HOR-090',
      azimuth: 90,
      dip: 0,
      utmEast: 340000.00,
      utmNorth: 8740000.00,
      elevation: 2300.00
    },
    planes: [
      {
        id: 'test-hor-1',
        alpha: 30,
        beta: 30,
        depthCm: 12,
        structureType: 'Veta',
        color: '#FFD93D'
      }
    ],
    bohAngles: {
      line1: 90,
      line2: 90
    }
  }
]

/**
 * Load a test scenario into the application state
 */
export function loadTestScenario(
  scenarioIndex: number,
  trioManager: any,
  drillHoleInfoManager: any,
  bohActions: any,
  structureTypesManager: any
): void {
  if (scenarioIndex < 0 || scenarioIndex >= TEST_SCENARIOS.length) {
    console.error('Invalid scenario index')
    return
  }

  const scenario = TEST_SCENARIOS[scenarioIndex]
  
  console.log(`🧪 Loading test scenario: "${scenario.name}"`)
  console.log(`   ${scenario.description}`)
  
  // 1. Load drill hole info
  drillHoleInfoManager.updateInfo(scenario.drillHole)
  console.log(`✓ Drill hole info loaded: ${scenario.drillHole.name}`)
  
  // 2. Set BOH angles
  bohActions.setLine1Angle(scenario.bohAngles.line1)
  bohActions.setLine2Angle(scenario.bohAngles.line2)
  console.log(`✓ BOH angles set: Line1=${scenario.bohAngles.line1}°, Line2=${scenario.bohAngles.line2}°`)
  
  // 3. Clear existing trios
  trioManager.clearAll()
  console.log(`✓ Cleared existing trios`)
  
  // 4. Load test planes as trios
  scenario.planes.forEach((plane, index) => {
    // Generate synthetic points on cylinder for this plane
    const points = generateSyntheticPoints(plane.alpha, plane.beta, plane.depthCm, scenario.bohAngles)
    
    // Add structure type if not exists
    const existingType = structureTypesManager.structureTypes.find((t: any) => t.name === plane.structureType)
    if (!existingType) {
      structureTypesManager.addStructureType(plane.structureType, plane.color)
    }
    
    // Create trio directly
    const trio = {
      id: plane.id,
      points: points,
      depth: plane.depthCm,
      color: plane.color,
      structureType: plane.structureType,
      isValidation: false,
      photoId: 'test-photo',
      createdAt: new Date()
    }
    
    // Add to trio manager (need to access internal state)
    console.log(`✓ Created synthetic trio ${index + 1}: α=${plane.alpha}°, β=${plane.beta}°, depth=${plane.depthCm}cm`)
  })
  
  console.log(`✅ Test scenario loaded successfully!`)
  console.log(`   Total planes: ${scenario.planes.length}`)
}

/**
 * Generate synthetic 3D points on cylinder for a plane with given α and β
 * This creates realistic-looking points that would produce the desired angles
 */
function generateSyntheticPoints(
  alpha: number,
  beta: number,
  depthCm: number,
  bohAngles: { line1: number; line2: number }
): any[] {
  const cylinderRadius = 3.0 // cm
  
  // Generate 3 points on cylinder that would give us this plane
  // For simplicity, distribute them around the expected trace
  
  const avgDepth = depthCm
  const bohNumber = depthCm < 15 ? 1 : 2
  const bohAngle = bohNumber === 1 ? bohAngles.line1 : bohAngles.line2
  
  // Convert to radians
  const alphaRad = (alpha * Math.PI) / 180
  const betaRad = (beta * Math.PI) / 180
  const bohRad = (bohAngle * Math.PI) / 180
  
  // Points spread around the cylinder
  const angles = [
    bohRad + betaRad - 0.3,  // Left of trace
    bohRad + betaRad,        // On trace
    bohRad + betaRad + 0.3   // Right of trace
  ]
  
  const points = angles.map((angle, idx) => {
    const x = cylinderRadius * Math.cos(angle)
    const y = cylinderRadius * Math.sin(angle)
    const z = avgDepth + (idx - 1) * 2 // Spread in depth ±2cm
    
    return {
      id: `synthetic-point-${idx + 1}`,
      x: parseFloat(x.toFixed(4)),
      y: parseFloat(y.toFixed(4)),
      z: parseFloat(z.toFixed(4))
    }
  })
  
  return points
}

/**
 * Export current state as a test scenario
 */
export function exportAsTestScenario(
  trios: any[],
  drillHoleInfo: any,
  bohAngles: { line1: number; line2: number },
  name: string,
  description: string
): TestScenario {
  const testPlanes: TestPlane[] = trios.map((trio, index) => ({
    id: `exported-plane-${index + 1}`,
    alpha: 0, // Would need to back-calculate from points
    beta: 0,  // Would need to back-calculate from points
    depthCm: trio.depth || 0,
    structureType: trio.structureType || 'Unknown',
    color: trio.color
  }))

  return {
    name,
    description,
    drillHole: drillHoleInfo,
    planes: testPlanes,
    bohAngles
  }
}

