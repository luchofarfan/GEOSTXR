import { NextRequest, NextResponse } from 'next/server'
import type { Project } from '@/types/geostxr-data'

// In-memory storage for demo (in production, use a database)
let projects: Project[] = []

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const projectId = searchParams.get('id')
    const includeDrillHoles = searchParams.get('drillHoles') === 'true'
    
    if (projectId) {
      // Get specific project
      const project = projects.find(p => p.id === projectId)
      if (!project) {
        return NextResponse.json(
          { error: 'Project not found' },
          { status: 404 }
        )
      }
      
      return NextResponse.json({
        success: true,
        data: includeDrillHoles ? project : {
          id: project.id,
          name: project.name,
          client: project.client,
          location: project.location,
          coordinateSystem: project.coordinateSystem,
          createdAt: project.createdAt,
          updatedAt: project.updatedAt,
          drillHolesCount: project.drillHoles.length
        }
      })
    } else {
      // Get all projects (summary)
      const projectsSummary = projects.map(project => ({
        id: project.id,
        name: project.name,
        client: project.client,
        location: project.location,
        coordinateSystem: project.coordinateSystem,
        createdAt: project.createdAt,
        updatedAt: project.updatedAt,
        drillHolesCount: project.drillHoles.length,
        totalStructures: project.drillHoles.reduce((sum, dh) => 
          sum + dh.scenes.reduce((sc, scene) => sc + scene.structures.length, 0)
        , 0),
        totalDepth: project.drillHoles.reduce((sum, dh) => sum + dh.totalDepth, 0)
      }))
      
      return NextResponse.json({
        success: true,
        data: projectsSummary,
        count: projectsSummary.length
      })
    }

  } catch (error) {
    console.error('❌ Projects API Error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const projectData = await request.json()
    
    const newProject: Project = {
      id: projectData.id || `project-${Date.now()}`,
      name: projectData.name,
      client: projectData.client,
      location: projectData.location,
      coordinateSystem: projectData.coordinateSystem,
      drillHoles: projectData.drillHoles || [],
      createdAt: new Date(),
      updatedAt: new Date()
    }

    projects.push(newProject)

    console.log(`📁 New project created: ${newProject.name} (${newProject.id})`)

    return NextResponse.json({
      success: true,
      message: 'Project created successfully',
      data: {
        id: newProject.id,
        name: newProject.name,
        createdAt: newProject.createdAt
      }
    })

  } catch (error) {
    console.error('❌ Create Project API Error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// Note: In production, projects would be stored in a database
// This is just for demo purposes
