import type { DrillHole, Project } from '@/types/geostxr-data'

export interface SyncOptions {
  hubUrl: string
  apiKey?: string
  projectId?: string
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

export interface SyncResult {
  success: boolean
  message: string
  data?: {
    projectId: string
    drillHoleId: string
    timestamp: string
    structuresCount: number
    totalDepth: number
  }
  error?: string
}

export class PWASyncClient {
  private hubUrl: string
  private apiKey: string

  constructor(options: SyncOptions) {
    this.hubUrl = options.hubUrl.replace(/\/$/, '') // Remove trailing slash
    this.apiKey = options.apiKey || 'geostxr-sync-2024'
  }

  /**
   * Sync drill hole data to the Hub
   */
  async syncDrillHole(
    drillHole: DrillHole, 
    options: Partial<SyncOptions> = {}
  ): Promise<SyncResult> {
    try {
      const payload = {
        projectId: options.projectId,
        drillHole,
        timestamp: new Date().toISOString(),
        deviceInfo: options.deviceInfo || this.getDeviceInfo()
      }

      const response = await fetch(`${this.hubUrl}/api/sync/upload`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': this.apiKey
        },
        body: JSON.stringify(payload)
      })

      const result = await response.json()

      if (!response.ok) {
        return {
          success: false,
          message: result.error || 'Sync failed',
          error: result.details
        }
      }

      return {
        success: true,
        message: result.message,
        data: result.data
      }

    } catch (error) {
      console.error('❌ PWA Sync Error:', error)
      return {
        success: false,
        message: 'Network error during sync',
        error: error instanceof Error ? error.message : 'Unknown error'
      }
    }
  }

  /**
   * Get Hub status
   */
  async getHubStatus(): Promise<{
    status: string
    stats: {
      projects: number
      drillHoles: number
      structures: number
      lastSync: string | null
    }
  } | null> {
    try {
      const response = await fetch(`${this.hubUrl}/api/sync/status`)
      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Status check failed')
      }

      return result

    } catch (error) {
      console.error('❌ Hub Status Error:', error)
      return null
    }
  }

  /**
   * Get projects from Hub
   */
  async getProjects(): Promise<Project[] | null> {
    try {
      const response = await fetch(`${this.hubUrl}/api/sync/projects`)
      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Projects fetch failed')
      }

      return result.data

    } catch (error) {
      console.error('❌ Projects Fetch Error:', error)
      return null
    }
  }

  /**
   * Create a new project in the Hub
   */
  async createProject(project: Partial<Project>): Promise<{ id: string } | null> {
    try {
      const response = await fetch(`${this.hubUrl}/api/sync/projects`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': this.apiKey
        },
        body: JSON.stringify(project)
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Project creation failed')
      }

      return result.data

    } catch (error) {
      console.error('❌ Create Project Error:', error)
      return null
    }
  }

  /**
   * Test connection to Hub
   */
  async testConnection(): Promise<boolean> {
    try {
      const response = await fetch(`${this.hubUrl}/api/sync/status`, {
        method: 'GET',
        headers: {
          'x-api-key': this.apiKey
        }
      })

      return response.ok

    } catch (error) {
      console.error('❌ Connection Test Error:', error)
      return false
    }
  }

  /**
   * Get device information
   */
  private getDeviceInfo() {
    if (typeof window === 'undefined') {
      return {
        userAgent: 'Node.js',
        platform: 'server'
      }
    }

    return {
      userAgent: navigator.userAgent,
      platform: navigator.platform,
      geolocation: undefined // Would be set if geolocation is available
    }
  }

  /**
   * Get geolocation (requires user permission)
   */
  async getGeolocation(): Promise<{
    latitude: number
    longitude: number
    accuracy: number
  } | null> {
    return new Promise((resolve) => {
      if (typeof window === 'undefined' || !navigator.geolocation) {
        resolve(null)
        return
      }

      navigator.geolocation.getCurrentPosition(
        (position) => {
          resolve({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            accuracy: position.coords.accuracy
          })
        },
        (error) => {
          console.warn('Geolocation error:', error)
          resolve(null)
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 300000 // 5 minutes
        }
      )
    })
  }
}

// Convenience function for quick sync
export async function syncToHub(
  drillHole: DrillHole,
  hubUrl: string = 'https://geostxr-hub.vercel.app',
  options: Partial<SyncOptions> = {}
): Promise<SyncResult> {
  const client = new PWASyncClient({ hubUrl, ...options })
  return await client.syncDrillHole(drillHole, options)
}

// Example usage for PWA
export const PWA_SYNC_EXAMPLE = `
// In your PWA measurement app:

import { PWASyncClient, syncToHub } from '@/lib/pwa-sync-client'

// Method 1: Using the client class
const syncClient = new PWASyncClient({
  hubUrl: 'https://geostxr-hub.vercel.app',
  apiKey: 'geostxr-sync-2024'
})

// Sync drill hole data
const result = await syncClient.syncDrillHole(drillHoleData, {
  projectId: 'your-project-id',
  deviceInfo: {
    userAgent: navigator.userAgent,
    platform: navigator.platform,
    geolocation: await syncClient.getGeolocation()
  }
})

if (result.success) {
  console.log('✅ Data synced successfully!')
  console.log('Project ID:', result.data?.projectId)
} else {
  console.error('❌ Sync failed:', result.error)
}

// Method 2: Using the convenience function
const quickResult = await syncToHub(drillHoleData, 'https://geostxr-hub.vercel.app')
`
