'use client'

import { useState, useEffect, useCallback } from 'react'
import { useAuth } from '@/hooks/use-auth'
import { 
  SessionState, 
  DrillHoleProgress, 
  SessionRestoreOptions, 
  SessionManager 
} from '@/types/session'
import { DrillHole, Project } from '@/types/geostxr-data'
import { PhotoMetadata } from '@/hooks/use-photo-registry'

export function useSessionPersistence() {
  const { user, isAuthenticated } = useAuth()
  const [sessionState, setSessionState] = useState<SessionState | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Load session on user authentication
  useEffect(() => {
    if (isAuthenticated && user) {
      const session = SessionManager.loadSession(user.id)
      setSessionState(session)
      setIsLoading(false)
      
      if (!session) {
        // Create new session for new user
        const newSession = SessionManager.createSession(user.id)
        setSessionState(newSession)
        SessionManager.saveSession(newSession)
      }
    } else if (!isAuthenticated) {
      setSessionState(null)
      setIsLoading(false)
    }
  }, [isAuthenticated, user])

  // Auto-save session periodically
  useEffect(() => {
    if (!sessionState) return

    const interval = setInterval(() => {
      if (sessionState.sessionData.preferences.autoSave) {
        SessionManager.saveSession(sessionState)
      }
    }, sessionState.sessionData.preferences.autoSaveInterval * 60 * 1000)

    return () => clearInterval(interval)
  }, [sessionState])

  // Update drill hole progress
  const updateDrillHoleProgress = useCallback((
    drillHole: DrillHole,
    project: Project,
    currentDepth: number,
    measurementsCount: number,
    photosCount: number
  ) => {
    if (!sessionState) return

    const updatedSession = SessionManager.updateDrillHoleProgress(
      sessionState,
      drillHole,
      project,
      currentDepth,
      measurementsCount,
      photosCount
    )

    setSessionState(updatedSession)
    SessionManager.saveSession(updatedSession)
  }, [sessionState])

  // Add photo to session
  const addPhotoToSession = useCallback((
    drillHoleId: string,
    photo: PhotoMetadata
  ) => {
    if (!sessionState) return

    const updatedSession = SessionManager.addPhoto(sessionState, drillHoleId, photo)
    setSessionState(updatedSession)
    SessionManager.saveSession(updatedSession)
  }, [sessionState])

  // Get active drill holes
  const getActiveDrillHoles = useCallback((): DrillHoleProgress[] => {
    if (!sessionState) return []
    return SessionManager.getActiveDrillHoles(sessionState)
  }, [sessionState])

  // Get recent photos for a drill hole
  const getRecentPhotos = useCallback((drillHoleId: string, limit?: number): PhotoMetadata[] => {
    if (!sessionState) return []
    return SessionManager.getRecentPhotos(sessionState, drillHoleId, limit)
  }, [sessionState])

  // Set current drill hole
  const setCurrentDrillHole = useCallback((drillHoleId: string, projectId: string) => {
    if (!sessionState) return

    const updatedSession: SessionState = {
      ...sessionState,
      currentDrillHoleId: drillHoleId,
      currentProjectId: projectId,
      lastActivity: new Date()
    }

    setSessionState(updatedSession)
    SessionManager.saveSession(updatedSession)
  }, [sessionState])

  // Clear session
  const clearSession = useCallback(() => {
    SessionManager.clearSession()
    setSessionState(null)
  }, [])

  // Update preferences
  const updatePreferences = useCallback((preferences: Partial<SessionState['sessionData']['preferences']>) => {
    if (!sessionState) return

    const updatedSession: SessionState = {
      ...sessionState,
      sessionData: {
        ...sessionState.sessionData,
        preferences: {
          ...sessionState.sessionData.preferences,
          ...preferences
        }
      },
      lastActivity: new Date()
    }

    setSessionState(updatedSession)
    SessionManager.saveSession(updatedSession)
  }, [sessionState])

  // Get current drill hole progress
  const getCurrentDrillHoleProgress = useCallback((): DrillHoleProgress | null => {
    if (!sessionState || !sessionState.currentDrillHoleId) return null
    return sessionState.sessionData.drillHoleProgress[sessionState.currentDrillHoleId] || null
  }, [sessionState])

  // Check if drill hole has previous session
  const hasPreviousSession = useCallback((drillHoleId: string): boolean => {
    if (!sessionState) return false
    const progress = sessionState.sessionData.drillHoleProgress[drillHoleId]
    return !!(progress && progress.isActive)
  }, [sessionState])

  // Get session statistics
  const getSessionStats = useCallback(() => {
    if (!sessionState) return null

    const activeDrillHoles = getActiveDrillHoles()
    const totalPhotos = Object.values(sessionState.sessionData.photoCaptures)
      .reduce((total, photos) => total + photos.length, 0)
    
    const totalMeasurements = Object.values(sessionState.sessionData.drillHoleProgress)
      .reduce((total, progress) => total + progress.totalMeasurements, 0)

    return {
      totalDrillHoles: activeDrillHoles.length,
      totalPhotos,
      totalMeasurements,
      currentDrillHole: sessionState.currentDrillHoleId,
      currentProject: sessionState.currentProjectId,
      sessionDuration: activeDrillHoles.reduce((total, progress) => {
        const duration = Math.floor((Date.now() - progress.sessionStartTime.getTime()) / (1000 * 60))
        return total + duration
      }, 0)
    }
  }, [sessionState, getActiveDrillHoles])

  return {
    sessionState,
    isLoading,
    error,
    
    // Actions
    updateDrillHoleProgress,
    addPhotoToSession,
    setCurrentDrillHole,
    clearSession,
    updatePreferences,
    
    // Getters
    getActiveDrillHoles,
    getRecentPhotos,
    getCurrentDrillHoleProgress,
    hasPreviousSession,
    getSessionStats,
    
    // Computed
    currentDrillHoleId: sessionState?.currentDrillHoleId,
    currentProjectId: sessionState?.currentProjectId,
    preferences: sessionState?.sessionData.preferences
  }
}
