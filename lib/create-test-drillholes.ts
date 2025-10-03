import { DrillHole, Project } from '@/types/geostxr-data'

/**
 * Create test drill holes with different UTM coordinates for testing multi-drillhole visualization
 */
export function createTestDrillHoles(): Project[] {
  const baseUTMEast = 350000
  const baseUTMNorth = 6500000
  const baseElevation = 2000

  const testDrillHoles: DrillHole[] = [
    {
      id: 'test-dh-001',
      name: 'DDH-TEST-001',
      info: {
        holeName: 'DDH-TEST-001',
        azimuth: 60,
        dip: -60,
        utmEast: baseUTMEast,
        utmNorth: baseUTMNorth,
        elevation: baseElevation
      },
      totalDepth: 500,
      scenes: [
        {
          id: 'scene-001-1',
          depthStart: 0,
          depthEnd: 30,
          capturedAt: new Date(),
          boh1Angle: 80,
          boh2Angle: 97,
          acAngle: 45,
          structures: [
            {
              id: 'struct-001-1',
              structureType: 'Fractura',
              depth: 15,
              alpha: 85.48,
              beta: 4.21,
              ac: 45,
              dipReal: 87.17,
              dipDirection: 68.90,
              utmEast: baseUTMEast + 2.17,
              utmNorth: baseUTMNorth + 1.25,
              elevationMeters: baseElevation - 4.33,
              color: '#ff6b6b'
            }
          ]
        }
      ],
      createdAt: new Date()
    },
    {
      id: 'test-dh-002',
      name: 'DDH-TEST-002',
      info: {
        holeName: 'DDH-TEST-002',
        azimuth: 45,
        dip: -45,
        utmEast: baseUTMEast + 100, // 100m east
        utmNorth: baseUTMNorth + 50, // 50m north
        elevation: baseElevation + 10 // 10m higher
      },
      totalDepth: 300,
      scenes: [
        {
          id: 'scene-002-1',
          depthStart: 0,
          depthEnd: 30,
          capturedAt: new Date(),
          boh1Angle: 75,
          boh2Angle: 95,
          acAngle: 50,
          structures: [
            {
              id: 'struct-002-1',
              structureType: 'Veta',
              depth: 12,
              alpha: 78.32,
              beta: 6.15,
              ac: 50,
              dipReal: 83.85,
              dipDirection: 51.15,
              utmEast: baseUTMEast + 100 + 3.25,
              utmNorth: baseUTMNorth + 50 + 2.10,
              elevationMeters: baseElevation + 10 - 2.5,
              color: '#4ecdc4'
            }
          ]
        }
      ],
      createdAt: new Date()
    },
    {
      id: 'test-dh-003',
      name: 'DDH-TEST-003',
      info: {
        holeName: 'DDH-TEST-003',
        azimuth: 90,
        dip: -75,
        utmEast: baseUTMEast - 80, // 80m west
        utmNorth: baseUTMNorth - 30, // 30m south
        elevation: baseElevation - 5 // 5m lower
      },
      totalDepth: 400,
      scenes: [
        {
          id: 'scene-003-1',
          depthStart: 0,
          depthEnd: 30,
          capturedAt: new Date(),
          boh1Angle: 85,
          boh2Angle: 90,
          acAngle: 35,
          structures: [
            {
              id: 'struct-003-1',
              structureType: 'Falla',
              depth: 18,
              alpha: 72.15,
              beta: 8.45,
              ac: 35,
              dipReal: 81.55,
              dipDirection: 98.45,
              utmEast: baseUTMEast - 80 + 1.85,
              utmNorth: baseUTMNorth - 30 - 1.20,
              elevationMeters: baseElevation - 5 - 3.8,
              color: '#45b7d1'
            }
          ]
        }
      ],
      createdAt: new Date()
    },
    {
      id: 'test-dh-004',
      name: 'DDH-TEST-004',
      info: {
        holeName: 'DDH-TEST-004',
        azimuth: 135,
        dip: -30,
        utmEast: baseUTMEast + 200, // 200m east
        utmNorth: baseUTMNorth - 100, // 100m south
        elevation: baseElevation + 25 // 25m higher
      },
      totalDepth: 250,
      scenes: [
        {
          id: 'scene-004-1',
          depthStart: 0,
          depthEnd: 30,
          capturedAt: new Date(),
          boh1Angle: 70,
          boh2Angle: 88,
          acAngle: 60,
          structures: [
            {
              id: 'struct-004-1',
              structureType: 'Contacto',
              depth: 20,
              alpha: 65.80,
              beta: 12.30,
              ac: 60,
              dipReal: 77.70,
              dipDirection: 147.30,
              utmEast: baseUTMEast + 200 + 4.50,
              utmNorth: baseUTMNorth - 100 - 2.80,
              elevationMeters: baseElevation + 25 - 5.2,
              color: '#96ceb4'
            }
          ]
        }
      ],
      createdAt: new Date()
    }
  ]

  return [
    {
      id: 'test-project-1',
      name: 'Proyecto Test Multi-Sondaje',
      client: 'Mining Corp Test',
      location: 'Zona Test UTM',
      drillHoles: testDrillHoles,
      createdAt: new Date(),
      updatedAt: new Date()
    }
  ]
}

/**
 * Add test drill holes to existing projects
 */
export function addTestDrillHolesToProjects(projects: Project[]): Project[] {
  const testProjects = createTestDrillHoles()
  
  // Find if test project already exists
  const existingTestProject = projects.find(p => p.name === 'Proyecto Test Multi-Sondaje')
  
  if (existingTestProject) {
    // Update existing test project
    return projects.map(project => 
      project.id === existingTestProject.id 
        ? { ...project, drillHoles: testProjects[0].drillHoles, updatedAt: new Date() }
        : project
    )
  } else {
    // Add new test project
    return [...projects, ...testProjects]
  }
}
