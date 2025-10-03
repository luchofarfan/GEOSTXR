'use client'

import { useState, useEffect, useCallback, createContext, useContext } from 'react'
import { 
  UserProfile, 
  UserSession, 
  LoginCredentials, 
  RegisterData, 
  AuthState, 
  UserRole,
  ROLE_PERMISSIONS,
  hasPermission,
  canAccess,
  getAllowedActions
} from '@/types/auth'

// Mock users for development (in production, this would be an API)
const MOCK_USERS: UserProfile[] = [
  {
    id: 'admin-1',
    email: 'admin@geostxr.com',
    name: 'Administrador Sistema',
    role: 'admin',
    company: 'GeoStXR',
    isActive: true,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date(),
    lastLoginAt: new Date()
  },
  {
    id: 'pm-1',
    email: 'pm@geostxr.com',
    name: 'Juan Pérez',
    role: 'project_manager',
    company: 'Mining Corp',
    phone: '+56 9 1234 5678',
    isActive: true,
    createdAt: new Date('2024-01-15'),
    updatedAt: new Date(),
    lastLoginAt: new Date()
  },
  {
    id: 'geo-1',
    email: 'geologo@geostxr.com',
    name: 'María González',
    role: 'geologist',
    company: 'Mining Corp',
    phone: '+56 9 8765 4321',
    isActive: true,
    createdAt: new Date('2024-02-01'),
    updatedAt: new Date(),
    lastLoginAt: new Date()
  },
  {
    id: 'tech-1',
    email: 'tecnico@geostxr.com',
    name: 'Carlos Rodríguez',
    role: 'field_tech',
    company: 'Mining Corp',
    phone: '+56 9 5555 1234',
    isActive: true,
    createdAt: new Date('2024-02-15'),
    updatedAt: new Date(),
    lastLoginAt: new Date()
  }
]

// Mock passwords (in production, these would be hashed)
const MOCK_PASSWORDS: Record<string, string> = {
  'admin@geostxr.com': 'admin123',
  'pm@geostxr.com': 'pm123',
  'geologo@geostxr.com': 'geo123',
  'tecnico@geostxr.com': 'tech123'
}

interface AuthContextType extends AuthState {
  login: (credentials: LoginCredentials) => Promise<void>
  register: (data: RegisterData) => Promise<void>
  logout: () => void
  updateProfile: (updates: Partial<UserProfile>) => Promise<void>
  changePassword: (currentPassword: string, newPassword: string) => Promise<void>
  hasPermission: (permission: string) => boolean
  canAccess: (resource: string, action: 'read' | 'write' | 'delete') => boolean
  getAllowedActions: (resource: string) => string[]
}

export const AuthContext = createContext<AuthContextType | null>(null)

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

export function useAuthProvider() {
  const [authState, setAuthState] = useState<AuthState>({
    isAuthenticated: false,
    isLoading: true,
    user: null,
    session: null,
    error: null
  })

  // Check for existing session on mount
  useEffect(() => {
    const checkExistingSession = async () => {
      try {
        const storedSession = localStorage.getItem('geostxr_session')
        if (storedSession) {
          const session: UserSession = JSON.parse(storedSession)
          
          // Check if session is still valid
          if (new Date(session.expiresAt) > new Date()) {
            setAuthState({
              isAuthenticated: true,
              isLoading: false,
              user: session.user,
              session,
              error: null
            })
          } else {
            // Session expired, clear it
            localStorage.removeItem('geostxr_session')
            setAuthState(prev => ({ ...prev, isLoading: false }))
          }
        } else {
          setAuthState(prev => ({ ...prev, isLoading: false }))
        }
      } catch (error) {
        console.error('Error checking existing session:', error)
        localStorage.removeItem('geostxr_session')
        setAuthState(prev => ({ ...prev, isLoading: false }))
      }
    }

    checkExistingSession()
  }, [])

  const login = useCallback(async (credentials: LoginCredentials) => {
    setAuthState(prev => ({ ...prev, isLoading: true, error: null }))

    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000))

      // Find user by email
      const user = MOCK_USERS.find(u => u.email === credentials.email)
      if (!user || !user.isActive) {
        throw new Error('Usuario no encontrado o inactivo')
      }

      // Check password
      const storedPassword = MOCK_PASSWORDS[credentials.email]
      if (!storedPassword || storedPassword !== credentials.password) {
        throw new Error('Contraseña incorrecta')
      }

      // Create session
      const session: UserSession = {
        user: {
          ...user,
          lastLoginAt: new Date()
        },
        token: `mock_token_${Date.now()}`,
        expiresAt: new Date(Date.now() + (credentials.rememberMe ? 30 : 7) * 24 * 60 * 60 * 1000), // 7 or 30 days
        permissions: ROLE_PERMISSIONS[user.role]
      }

      // Store session
      localStorage.setItem('geostxr_session', JSON.stringify(session))

      setAuthState({
        isAuthenticated: true,
        isLoading: false,
        user: session.user,
        session,
        error: null
      })

      console.log('✅ Login successful:', user.email, user.role)

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error de autenticación'
      setAuthState(prev => ({
        ...prev,
        isLoading: false,
        error: errorMessage
      }))
      throw error
    }
  }, [])

  const register = useCallback(async (data: RegisterData) => {
    setAuthState(prev => ({ ...prev, isLoading: true, error: null }))

    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1500))

      // Check if user already exists
      const existingUser = MOCK_USERS.find(u => u.email === data.email)
      if (existingUser) {
        throw new Error('El usuario ya existe')
      }

      // Create new user
      const newUser: UserProfile = {
        id: `user-${Date.now()}`,
        email: data.email,
        name: data.name,
        role: data.role,
        company: data.company,
        phone: data.phone,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      }

      // Add to mock users (in production, this would be an API call)
      MOCK_USERS.push(newUser)
      MOCK_PASSWORDS[data.email] = data.password

      // Auto-login after registration
      await login({ email: data.email, password: data.password })

      console.log('✅ Registration successful:', newUser.email, newUser.role)

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error de registro'
      setAuthState(prev => ({
        ...prev,
        isLoading: false,
        error: errorMessage
      }))
      throw error
    }
  }, [login])

  const logout = useCallback(() => {
    localStorage.removeItem('geostxr_session')
    setAuthState({
      isAuthenticated: false,
      isLoading: false,
      user: null,
      session: null,
      error: null
    })
    console.log('👋 Logout successful')
  }, [])

  const updateProfile = useCallback(async (updates: Partial<UserProfile>) => {
    if (!authState.user) return

    setAuthState(prev => ({ ...prev, isLoading: true, error: null }))

    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000))

      const updatedUser = { ...authState.user, ...updates, updatedAt: new Date() }
      
      // Update in mock users (in production, this would be an API call)
      const userIndex = MOCK_USERS.findIndex(u => u.id === updatedUser.id)
      if (userIndex !== -1) {
        MOCK_USERS[userIndex] = updatedUser
      }

      // Update session
      const updatedSession = authState.session ? {
        ...authState.session,
        user: updatedUser
      } : null

      if (updatedSession) {
        localStorage.setItem('geostxr_session', JSON.stringify(updatedSession))
      }

      setAuthState(prev => ({
        ...prev,
        isLoading: false,
        user: updatedUser,
        session: updatedSession,
        error: null
      }))

      console.log('✅ Profile updated:', updatedUser.email)

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error actualizando perfil'
      setAuthState(prev => ({
        ...prev,
        isLoading: false,
        error: errorMessage
      }))
      throw error
    }
  }, [authState.user, authState.session])

  const changePassword = useCallback(async (currentPassword: string, newPassword: string) => {
    if (!authState.user) return

    setAuthState(prev => ({ ...prev, isLoading: true, error: null }))

    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000))

      // Verify current password
      const storedPassword = MOCK_PASSWORDS[authState.user.email]
      if (!storedPassword || storedPassword !== currentPassword) {
        throw new Error('Contraseña actual incorrecta')
      }

      // Update password
      MOCK_PASSWORDS[authState.user.email] = newPassword

      setAuthState(prev => ({ ...prev, isLoading: false, error: null }))

      console.log('✅ Password changed for:', authState.user.email)

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error cambiando contraseña'
      setAuthState(prev => ({
        ...prev,
        isLoading: false,
        error: errorMessage
      }))
      throw error
    }
  }, [authState.user])

  // Permission helpers
  const hasPermissionHelper = useCallback((permission: string) => {
    if (!authState.user) return false
    return hasPermission(authState.user, permission as any)
  }, [authState.user])

  const canAccessHelper = useCallback((resource: string, action: 'read' | 'write' | 'delete') => {
    if (!authState.user) return false
    return canAccess(authState.user, resource, action)
  }, [authState.user])

  const getAllowedActionsHelper = useCallback((resource: string) => {
    if (!authState.user) return []
    return getAllowedActions(authState.user, resource)
  }, [authState.user])

  return {
    ...authState,
    login,
    register,
    logout,
    updateProfile,
    changePassword,
    hasPermission: hasPermissionHelper,
    canAccess: canAccessHelper,
    getAllowedActions: getAllowedActionsHelper
  }
}

// Export mock data for testing
export { MOCK_USERS, MOCK_PASSWORDS }
