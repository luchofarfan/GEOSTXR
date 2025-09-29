// GEOSTXR Environment Configuration
export const ENV_CONFIG = {
  // Application
  APP_NAME: process.env.NEXT_PUBLIC_APP_NAME || 'GEOSTXR',
  APP_VERSION: process.env.NEXT_PUBLIC_APP_VERSION || '1.0.0',
  APP_ENV: process.env.NEXT_PUBLIC_APP_ENV || 'development',
  
  // Camera Configuration
  CAMERA: {
    WIDTH: parseInt(process.env.NEXT_PUBLIC_CAMERA_WIDTH || '1920'),
    HEIGHT: parseInt(process.env.NEXT_PUBLIC_CAMERA_HEIGHT || '1080'),
    FPS: parseInt(process.env.NEXT_PUBLIC_CAMERA_FPS || '30'),
    QUALITY: (process.env.NEXT_PUBLIC_CAMERA_QUALITY || 'high') as 'low' | 'medium' | 'high',
  },
  
  // AR Configuration
  AR: {
    ENABLED: process.env.NEXT_PUBLIC_AR_ENABLED === 'true',
    TRACKING: process.env.NEXT_PUBLIC_AR_TRACKING === 'true',
    OVERLAY: process.env.NEXT_PUBLIC_AR_OVERLAY === 'true',
    PERFORMANCE: (process.env.NEXT_PUBLIC_AR_PERFORMANCE || 'medium') as 'low' | 'medium' | 'high',
  },
  
  // Geometry Configuration
  GEOMETRY: {
    CYLINDER_DIAMETER: parseFloat(process.env.NEXT_PUBLIC_CYLINDER_DIAMETER || '6.35'),
    CYLINDER_HEIGHT: parseFloat(process.env.NEXT_PUBLIC_CYLINDER_HEIGHT || '15'),
    BOH_DISPLACEMENT_RANGE: parseInt(process.env.NEXT_PUBLIC_BOH_DISPLACEMENT_RANGE || '20'),
    MAX_TRIOS: parseInt(process.env.NEXT_PUBLIC_MAX_TRIOS || '100'),
  },
  
  // Performance Configuration
  PERFORMANCE: {
    MAX_FPS: parseInt(process.env.NEXT_PUBLIC_MAX_FPS || '30'),
    MEMORY_LIMIT: parseInt(process.env.NEXT_PUBLIC_MEMORY_LIMIT || '100'),
    OPTIMIZATION: process.env.NEXT_PUBLIC_OPTIMIZATION === 'true',
  },
  
  // UI Configuration
  UI: {
    THEME: (process.env.NEXT_PUBLIC_THEME || 'dark') as 'light' | 'dark',
    ANIMATIONS: process.env.NEXT_PUBLIC_ANIMATIONS === 'true',
    RESPONSIVE: process.env.NEXT_PUBLIC_RESPONSIVE === 'true',
  },
} as const;

export type EnvConfig = typeof ENV_CONFIG;

