import { DrillHole, Project } from '@/types/geostxr-data'

/**
 * Simulates Android PWA data capture for testing multi-drillhole visualization
 */
export function simulateAndroidCapture() {
  const now = new Date()
  
  // Simulate first drill hole capture
  const drillHole1: DrillHole = {
    id: 'android-dh-001',
    name: 'DDH-ANDROID-001',
    info: {
      holeName: 'DDH-ANDROID-001',
      azimuth: 45,
      dip: -60,
      utmEast: 350100, // 100m east of base
      utmNorth: 6500100, // 100m north of base
      elevation: 2010 // 10m higher
    },
    totalDepth: 450,
    scenes: [
      {
        id: 'scene-android-001-1',
        depthStart: 0,
        depthEnd: 30,
        capturedAt: new Date(now.getTime() - 3600000), // 1 hour ago
        boh1Angle: 85,
        boh2Angle: 95,
        acAngle: 45,
        structures: [
          {
            id: 'struct-android-001-1',
            structureType: 'Fractura',
            depth: 15,
            alpha: 82.15,
            beta: 7.85,
            ac: 45,
            dipReal: 82.85,
            dipDirection: 52.85,
            utmEast: 350100 + 2.15,
            utmNorth: 6500100 + 1.25,
            elevationMeters: 2010 - 4.33,
            color: '#ff6b6b'
          },
          {
            id: 'struct-android-001-2',
            structureType: 'Veta',
            depth: 25,
            alpha: 75.32,
            beta: 12.68,
            ac: 45,
            dipReal: 77.68,
            dipDirection: 57.68,
            utmEast: 350100 + 3.25,
            utmNorth: 6500100 + 2.10,
            elevationMeters: 2010 - 7.2,
            color: '#4ecdc4'
          }
        ]
      },
      {
        id: 'scene-android-001-2',
        depthStart: 30,
        depthEnd: 60,
        capturedAt: new Date(now.getTime() - 3000000), // 50 minutes ago
        boh1Angle: 80,
        boh2Angle: 100,
        acAngle: 50,
        structures: [
          {
            id: 'struct-android-001-3',
            structureType: 'Falla',
            depth: 45,
            alpha: 68.45,
            beta: 18.75,
            ac: 50,
            dipReal: 71.25,
            dipDirection: 68.25,
            utmEast: 350100 + 4.50,
            utmNorth: 6500100 + 3.80,
            elevationMeters: 2010 - 12.5,
            color: '#45b7d1'
          }
        ]
      }
    ],
    createdAt: new Date(now.getTime() - 3600000)
  }

  // Simulate second drill hole capture
  const drillHole2: DrillHole = {
    id: 'android-dh-002',
    name: 'DDH-ANDROID-002',
    info: {
      holeName: 'DDH-ANDROID-002',
      azimuth: 135,
      dip: -45,
      utmEast: 349800, // 200m west of base
      utmNorth: 6499900, // 100m south of base
      elevation: 1995 // 5m lower
    },
    totalDepth: 380,
    scenes: [
      {
        id: 'scene-android-002-1',
        depthStart: 0,
        depthEnd: 30,
        capturedAt: new Date(now.getTime() - 1800000), // 30 minutes ago
        boh1Angle: 75,
        boh2Angle: 105,
        acAngle: 40,
        structures: [
          {
            id: 'struct-android-002-1',
            structureType: 'Contacto',
            depth: 12,
            alpha: 88.25,
            beta: 5.75,
            ac: 40,
            dipReal: 84.25,
            dipDirection: 140.25,
            utmEast: 349800 + 1.85,
            utmNorth: 6499900 - 1.20,
            elevationMeters: 1995 - 2.5,
            color: '#96ceb4'
          },
          {
            id: 'struct-android-002-2',
            structureType: 'Fractura',
            depth: 28,
            alpha: 72.80,
            beta: 15.45,
            ac: 40,
            dipReal: 74.55,
            dipDirection: 150.45,
            utmEast: 349800 + 3.20,
            utmNorth: 6499900 - 2.85,
            elevationMeters: 1995 - 8.1,
            color: '#ff6b6b'
          }
        ]
      },
      {
        id: 'scene-android-002-2',
        depthStart: 30,
        depthEnd: 60,
        capturedAt: new Date(now.getTime() - 900000), // 15 minutes ago
        boh1Angle: 70,
        boh2Angle: 110,
        acAngle: 55,
        structures: [
          {
            id: 'struct-android-002-3',
            structureType: 'Veta',
            depth: 42,
            alpha: 65.15,
            beta: 22.35,
            ac: 55,
            dipReal: 67.65,
            dipDirection: 157.35,
            utmEast: 349800 + 5.10,
            utmNorth: 6499900 - 4.25,
            elevationMeters: 1995 - 15.8,
            color: '#4ecdc4'
          }
        ]
      }
    ],
    createdAt: new Date(now.getTime() - 1800000)
  }

  return {
    drillHole1,
    drillHole2,
    project: {
      id: 'android-project-001',
      name: 'Proyecto Android Test',
      client: 'Mining Corp Android',
      location: 'Campo Android UTM',
      drillHoles: [drillHole1, drillHole2],
      createdAt: new Date(now.getTime() - 3600000),
      updatedAt: now
    } as Project
  }
}

/**
 * Simulates the sync process from Android PWA to Hub
 */
export function simulateAndroidSync() {
  const { drillHole1, drillHole2, project } = simulateAndroidCapture()
  
  console.log('📱 Simulating Android PWA capture...')
  console.log('🔬 Captured Drill Hole 1:', drillHole1.name)
  console.log('   - UTM East:', drillHole1.info.utmEast)
  console.log('   - UTM North:', drillHole1.info.utmNorth)
  console.log('   - Elevation:', drillHole1.info.elevation)
  console.log('   - Structures:', drillHole1.scenes.reduce((sum, s) => sum + s.structures.length, 0))
  
  console.log('🔬 Captured Drill Hole 2:', drillHole2.name)
  console.log('   - UTM East:', drillHole2.info.utmEast)
  console.log('   - UTM North:', drillHole2.info.utmNorth)
  console.log('   - Elevation:', drillHole2.info.elevation)
  console.log('   - Structures:', drillHole2.scenes.reduce((sum, s) => sum + s.structures.length, 0))
  
  console.log('🔄 Syncing to Hub...')
  
  return { drillHole1, drillHole2, project }
}
