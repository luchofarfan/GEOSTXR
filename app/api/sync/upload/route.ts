import { NextRequest, NextResponse } from 'next/server'
import type { DrillHole, Project, DrillHoleInfo, Scene, Structure } from '@/types/geostxr-data'

// In-memory storage for demo (in production, use a database)
let projects: Project[] = []

interface SyncData {
  projectId?: string
  drillHole: DrillHole
  timestamp: string
  deviceInfo?: {
    userAgent: string
    platform: string
    geolocation?: {
      latitude: number
      longitude: number
      accuracy: number
    }
  }
}

export async function POST(request: NextRequest) {
  try {
    const data: SyncData = await request.json()
    
    // Validate required fields
    if (!data.drillHole) {
      return NextResponse.json(
        { error: 'Missing drill hole data' },
        { status: 400 }
      )
    }

    // Authenticate request (simple API key for now)
    const apiKey = request.headers.get('x-api-key')
    if (!apiKey || apiKey !== 'geostxr-sync-2024') {
      return NextResponse.json(
        { error: 'Invalid API key' },
        { status: 401 }
      )
    }

    // Process drill hole data
    const newDrillHole: DrillHole = {
      ...data.drillHole,
      id: data.drillHole.id || `dh-${Date.now()}`,
      createdAt: new Date(data.timestamp || Date.now())
    }

    // Find or create project
    let targetProject: Project
    if (data.projectId) {
      targetProject = projects.find(p => p.id === data.projectId) || createDefaultProject()
    } else {
      targetProject = createDefaultProject()
    }

    // Add drill hole to project
    const existingIndex = targetProject.drillHoles.findIndex(dh => dh.id === newDrillHole.id)
    if (existingIndex >= 0) {
      // Update existing drill hole
      targetProject.drillHoles[existingIndex] = newDrillHole
    } else {
      // Add new drill hole
      targetProject.drillHoles.push(newDrillHole)
    }

    targetProject.updatedAt = new Date()

    // Update projects array
    const projectIndex = projects.findIndex(p => p.id === targetProject.id)
    if (projectIndex >= 0) {
      projects[projectIndex] = targetProject
    } else {
      projects.push(targetProject)
    }

    // Log sync event
    console.log(`📱 PWA Sync: Drill hole ${newDrillHole.name} synced to project ${targetProject.name}`)
    console.log(`   📊 Structures: ${newDrillHole.scenes.reduce((sum, scene) => sum + scene.structures.length, 0)}`)
    console.log(`   📍 Location: E${newDrillHole.info.utmEast} N${newDrillHole.info.utmNorth}`)

    return NextResponse.json({
      success: true,
      message: 'Data synced successfully',
      data: {
        projectId: targetProject.id,
        drillHoleId: newDrillHole.id,
        timestamp: new Date().toISOString(),
        structuresCount: newDrillHole.scenes.reduce((sum, scene) => sum + scene.structures.length, 0),
        totalDepth: newDrillHole.totalDepth
      }
    })

  } catch (error) {
    console.error('❌ Sync API Error:', error)
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}

export async function GET() {
  return NextResponse.json({
    message: 'GeoStXR Sync API',
    version: '1.0.0',
    endpoints: {
      upload: 'POST /api/sync/upload',
      status: 'GET /api/sync/status',
      projects: 'GET /api/sync/projects'
    },
    usage: {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': 'geostxr-sync-2024'
      },
      body: {
        drillHole: 'DrillHole object',
        timestamp: 'ISO string',
        deviceInfo: 'optional device info'
      }
    }
  })
}

function createDefaultProject(): Project {
  return {
    id: `project-${Date.now()}`,
    name: `PWA Sync Project - ${new Date().toLocaleDateString()}`,
    drillHoles: [],
    createdAt: new Date(),
    updatedAt: new Date(),
    coordinateSystem: {
      projection: 'UTM',
      datum: 'WGS84',
      utmZone: 19,
      utmHemisphere: 'S',
      epsgCode: 32719,
      description: 'WGS84 UTM Zone 19S'
    }
  }
}
