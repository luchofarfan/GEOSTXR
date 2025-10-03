import { NextResponse } from 'next/server'

export async function GET() {
  try {
    // Get projects from the in-memory storage (in production, query database)
    const projects = await getProjects()
    
    const totalProjects = projects.length
    const totalDrillHoles = projects.reduce((sum, p) => sum + p.drillHoles.length, 0)
    const totalStructures = projects.reduce((sum: number, p: any) => 
      sum + p.drillHoles.reduce((s: number, dh: any) => 
        s + dh.scenes.reduce((sc: number, scene: any) => sc + scene.structures.length, 0)
      , 0)
    , 0)
    
    const lastSync = projects.length > 0 
      ? Math.max(...projects.map(p => p.updatedAt.getTime()))
      : null

    return NextResponse.json({
      status: 'active',
      timestamp: new Date().toISOString(),
      stats: {
        projects: totalProjects,
        drillHoles: totalDrillHoles,
        structures: totalStructures,
        lastSync: lastSync ? new Date(lastSync).toISOString() : null
      },
      api: {
        version: '1.0.0',
        endpoints: ['upload', 'status', 'projects']
      }
    })

  } catch (error) {
    console.error('❌ Status API Error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// Mock function - in production, this would query your database
async function getProjects(): Promise<any[]> {
  // This should be replaced with actual database queries
  return []
}
