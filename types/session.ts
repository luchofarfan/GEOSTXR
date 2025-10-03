/**
 * GeoStXR Session Persistence
 * Types for managing user session state and drill hole progress
 */

import { DrillHole, Project } from '@/types/geostxr-data'
import { PhotoMetadata } from '@/hooks/use-photo-registry'

export interface SessionState {
  userId: string
  currentProjectId?: string
  currentDrillHoleId?: string
  lastActivity: Date
  sessionData: {
    // Drill hole progress
    drillHoleProgress: Record<string, DrillHoleProgress>
    
    // Photo captures for each drill hole
    photoCaptures: Record<string, PhotoMetadata[]>
    
    // User preferences
    preferences: UserPreferences
    
    // Work session info
    workSession: WorkSessionInfo
  }
}

export interface DrillHoleProgress {
  drillHoleId: string
  drillHoleName: string
  projectId: string
  projectName: string
  
  // Current position in the drill hole
  currentDepth: number // cm
  lastMeasurementDepth: number // cm
  
  // Session statistics
  sessionStartTime: Date
  sessionEndTime?: Date
  totalMeasurements: number
  totalPhotos: number
  sessionDuration: number // minutes
  
  // Work flow state
  currentScene?: {
    sceneId: string
    depthStart: number
    depthEnd: number
    isCompleted: boolean
    measurementsCount: number
    photosCount: number
  }
  
  // Last saved state
  lastSaved: Date
  isActive: boolean
}

export interface UserPreferences {
  // UI preferences
  defaultView: 'dashboard' | 'timeline' | '3d'
  photoQuality: 'low' | 'medium' | 'high'
  autoSave: boolean
  autoSaveInterval: number // minutes
  
  // Measurement preferences
  defaultStructureType: string
  measurementUnits: 'metric' | 'imperial'
  angleFormat: 'degrees' | 'radians'
  
  // Display preferences
  theme: 'light' | 'dark' | 'auto'
  language: string
  timezone: string
}

export interface WorkSessionInfo {
  sessionId: string
  startTime: Date
  endTime?: Date
  totalDrillHoles: number
  totalMeasurements: number
  totalPhotos: number
  totalDuration: number // minutes
  isActive: boolean
}

export interface SessionRestoreOptions {
  // What to restore
  restoreDrillHole?: boolean
  restorePhotos?: boolean
  restorePreferences?: boolean
  
  // Defaults if no previous session
  defaultProjectId?: string
  defaultDrillHoleId?: string
}

/**
 * Session management utilities
 */
export class SessionManager {
  private static readonly STORAGE_KEY = 'geostxr_session_state'
  private static readonly STORAGE_VERSION = '1.0.0'

  /**
   * Load session state from localStorage
   */
  static loadSession(userId: string): SessionState | null {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY)
      if (!stored) return null

      const sessionData = JSON.parse(stored)
      
      // Check version compatibility
      if (sessionData.version !== this.STORAGE_VERSION) {
        console.warn('Session version mismatch, clearing old session')
        this.clearSession()
        return null
      }

      // Validate user ID
      if (sessionData.userId !== userId) {
        console.warn('User ID mismatch, clearing session')
        this.clearSession()
        return null
      }

      // Convert dates back to Date objects
      const session: SessionState = {
        ...sessionData,
        lastActivity: new Date(sessionData.lastActivity),
        sessionData: {
          ...sessionData.sessionData,
          drillHoleProgress: Object.fromEntries(
            Object.entries(sessionData.sessionData.drillHoleProgress).map(([key, progress]: [string, any]) => [
              key,
              {
                ...progress,
                sessionStartTime: new Date(progress.sessionStartTime),
                sessionEndTime: progress.sessionEndTime ? new Date(progress.sessionEndTime) : undefined,
                lastSaved: new Date(progress.lastSaved)
              }
            ])
          ),
          preferences: {
            ...sessionData.sessionData.preferences,
            // Default preferences if missing
            defaultView: sessionData.sessionData.preferences.defaultView || 'dashboard',
            photoQuality: sessionData.sessionData.preferences.photoQuality || 'medium',
            autoSave: sessionData.sessionData.preferences.autoSave !== false,
            autoSaveInterval: sessionData.sessionData.preferences.autoSaveInterval || 5,
            defaultStructureType: sessionData.sessionData.preferences.defaultStructureType || 'Fractura',
            measurementUnits: sessionData.sessionData.preferences.measurementUnits || 'metric',
            angleFormat: sessionData.sessionData.preferences.angleFormat || 'degrees',
            theme: sessionData.sessionData.preferences.theme || 'dark',
            language: sessionData.sessionData.preferences.language || 'es',
            timezone: sessionData.sessionData.preferences.timezone || Intl.DateTimeFormat().resolvedOptions().timeZone
          },
          workSession: {
            ...sessionData.sessionData.workSession,
            startTime: new Date(sessionData.sessionData.workSession.startTime),
            endTime: sessionData.sessionData.workSession.endTime ? new Date(sessionData.sessionData.workSession.endTime) : undefined
          }
        }
      }

      return session
    } catch (error) {
      console.error('Error loading session:', error)
      this.clearSession()
      return null
    }
  }

  /**
   * Save session state to localStorage
   */
  static saveSession(session: SessionState): void {
    try {
      const sessionData = {
        ...session,
        version: this.STORAGE_VERSION,
        lastActivity: new Date()
      }
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(sessionData))
    } catch (error) {
      console.error('Error saving session:', error)
    }
  }

  /**
   * Clear session state
   */
  static clearSession(): void {
    localStorage.removeItem(this.STORAGE_KEY)
  }

  /**
   * Create new session state
   */
  static createSession(userId: string): SessionState {
    return {
      userId,
      lastActivity: new Date(),
      sessionData: {
        drillHoleProgress: {},
        photoCaptures: {},
        preferences: {
          defaultView: 'dashboard',
          photoQuality: 'medium',
          autoSave: true,
          autoSaveInterval: 5,
          defaultStructureType: 'Fractura',
          measurementUnits: 'metric',
          angleFormat: 'degrees',
          theme: 'dark',
          language: 'es',
          timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
        },
        workSession: {
          sessionId: `session_${Date.now()}`,
          startTime: new Date(),
          totalDrillHoles: 0,
          totalMeasurements: 0,
          totalPhotos: 0,
          totalDuration: 0,
          isActive: true
        }
      }
    }
  }

  /**
   * Update drill hole progress
   */
  static updateDrillHoleProgress(
    session: SessionState,
    drillHole: DrillHole,
    project: Project,
    currentDepth: number,
    measurementsCount: number,
    photosCount: number
  ): SessionState {
    const progress: DrillHoleProgress = {
      drillHoleId: drillHole.id,
      drillHoleName: drillHole.name,
      projectId: project.id,
      projectName: project.name,
      currentDepth,
      lastMeasurementDepth: currentDepth,
      sessionStartTime: session.sessionData.drillHoleProgress[drillHole.id]?.sessionStartTime || new Date(),
      totalMeasurements: measurementsCount,
      totalPhotos: photosCount,
      sessionDuration: 0, // Will be calculated
      lastSaved: new Date(),
      isActive: true
    }

    return {
      ...session,
      currentProjectId: project.id,
      currentDrillHoleId: drillHole.id,
      sessionData: {
        ...session.sessionData,
        drillHoleProgress: {
          ...session.sessionData.drillHoleProgress,
          [drillHole.id]: progress
        }
      }
    }
  }

  /**
   * Add photo to session
   */
  static addPhoto(
    session: SessionState,
    drillHoleId: string,
    photo: PhotoMetadata
  ): SessionState {
    const existingPhotos = session.sessionData.photoCaptures[drillHoleId] || []
    
    return {
      ...session,
      sessionData: {
        ...session.sessionData,
        photoCaptures: {
          ...session.sessionData.photoCaptures,
          [drillHoleId]: [...existingPhotos, photo]
        }
      }
    }
  }

  /**
   * Get active drill holes (with recent activity)
   */
  static getActiveDrillHoles(session: SessionState): DrillHoleProgress[] {
    const now = new Date()
    const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000)
    
    return Object.values(session.sessionData.drillHoleProgress)
      .filter(progress => 
        progress.isActive && 
        progress.lastSaved > oneDayAgo
      )
      .sort((a, b) => b.lastSaved.getTime() - a.lastSaved.getTime())
  }

  /**
   * Get recent photos for a drill hole
   */
  static getRecentPhotos(session: SessionState, drillHoleId: string, limit: number = 10): PhotoMetadata[] {
    const photos = session.sessionData.photoCaptures[drillHoleId] || []
    return photos
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
      .slice(0, limit)
  }
}
