/**
 * GeoStXR Authentication System
 * Types and interfaces for user management and permissions
 */

export type UserRole = 
  | 'admin'           // Administrador del sistema
  | 'project_manager' // Gestor de proyectos
  | 'geologist'       // Geólogo senior
  | 'field_tech'      // Técnico de campo
  | 'viewer'          // Solo visualización

export type Permission = 
  | 'read_projects'      // Ver proyectos
  | 'write_projects'     // Crear/editar proyectos
  | 'delete_projects'    // Eliminar proyectos
  | 'read_drillholes'    // Ver sondajes
  | 'write_drillholes'   // Crear/editar sondajes
  | 'delete_drillholes'  // Eliminar sondajes
  | 'capture_data'       // Capturar datos en campo
  | 'upload_photos'      // Subir fotos
  | 'export_data'        // Exportar datos
  | 'manage_users'       // Gestionar usuarios
  | 'system_config'      // Configuración del sistema

export interface UserProfile {
  id: string
  email: string
  name: string
  role: UserRole
  avatar?: string
  company?: string
  phone?: string
  location?: string
  isActive: boolean
  createdAt: Date
  updatedAt: Date
  lastLoginAt?: Date
}

export interface UserSession {
  user: UserProfile
  token: string
  expiresAt: Date
  permissions: Permission[]
}

export interface LoginCredentials {
  email: string
  password: string
  rememberMe?: boolean
}

export interface RegisterData {
  email: string
  password: string
  name: string
  role: UserRole
  company?: string
  phone?: string
}

export interface AuthState {
  isAuthenticated: boolean
  isLoading: boolean
  user: UserProfile | null
  session: UserSession | null
  error: string | null
}

/**
 * Role-based permissions mapping
 */
export const ROLE_PERMISSIONS: Record<UserRole, Permission[]> = {
  admin: [
    'read_projects', 'write_projects', 'delete_projects',
    'read_drillholes', 'write_drillholes', 'delete_drillholes',
    'capture_data', 'upload_photos', 'export_data',
    'manage_users', 'system_config'
  ],
  
  project_manager: [
    'read_projects', 'write_projects',
    'read_drillholes', 'write_drillholes',
    'capture_data', 'upload_photos', 'export_data'
  ],
  
  geologist: [
    'read_projects', 'read_drillholes', 'write_drillholes',
    'capture_data', 'upload_photos', 'export_data'
  ],
  
  field_tech: [
    'read_projects', 'read_drillholes',
    'capture_data', 'upload_photos'
  ],
  
  viewer: [
    'read_projects', 'read_drillholes'
  ]
}

/**
 * Role descriptions for UI
 */
export const ROLE_DESCRIPTIONS: Record<UserRole, {
  title: string
  description: string
  icon: string
  color: string
}> = {
  admin: {
    title: 'Administrador',
    description: 'Acceso completo al sistema, gestión de usuarios y configuración',
    icon: '👑',
    color: 'red'
  },
  
  project_manager: {
    title: 'Gestor de Proyectos',
    description: 'Gestión completa de proyectos y sondajes, análisis y reportes',
    icon: '📊',
    color: 'blue'
  },
  
  geologist: {
    title: 'Geólogo Senior',
    description: 'Análisis geológico, captura de datos y generación de reportes',
    icon: '🪨',
    color: 'green'
  },
  
  field_tech: {
    title: 'Técnico de Campo',
    description: 'Captura de datos en campo, fotos y mediciones básicas',
    icon: '🏕️',
    color: 'orange'
  },
  
  viewer: {
    title: 'Visualizador',
    description: 'Solo lectura de datos y visualizaciones',
    icon: '👁️',
    color: 'gray'
  }
}

/**
 * Check if user has specific permission
 */
export function hasPermission(user: UserProfile, permission: Permission): boolean {
  const userPermissions = ROLE_PERMISSIONS[user.role]
  return userPermissions.includes(permission)
}

/**
 * Check if user can access specific resource
 */
export function canAccess(user: UserProfile, resource: string, action: 'read' | 'write' | 'delete'): boolean {
  switch (resource) {
    case 'projects':
      return action === 'read' ? hasPermission(user, 'read_projects') :
             action === 'write' ? hasPermission(user, 'write_projects') :
             hasPermission(user, 'delete_projects')
    
    case 'drillholes':
      return action === 'read' ? hasPermission(user, 'read_drillholes') :
             action === 'write' ? hasPermission(user, 'write_drillholes') :
             hasPermission(user, 'delete_drillholes')
    
    case 'photos':
      return hasPermission(user, 'upload_photos')
    
    case 'data':
      return action === 'read' ? true :
             hasPermission(user, 'capture_data') || hasPermission(user, 'export_data')
    
    case 'users':
      return hasPermission(user, 'manage_users')
    
    case 'system':
      return hasPermission(user, 'system_config')
    
    default:
      return false
  }
}

/**
 * Get user's allowed actions for a resource
 */
export function getAllowedActions(user: UserProfile, resource: string): string[] {
  const actions: string[] = []
  
  if (canAccess(user, resource, 'read')) actions.push('read')
  if (canAccess(user, resource, 'write')) actions.push('write')
  if (canAccess(user, resource, 'delete')) actions.push('delete')
  
  return actions
}
