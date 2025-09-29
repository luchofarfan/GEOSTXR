// GEOSTXR Production Configuration
export const PROD_CONFIG = {
  // Production Settings
  DEBUG: false,
  LOG_LEVEL: 'error' as const,
  HOT_RELOAD: false,
  
  // Camera Production
  CAMERA: {
    MOCK_CAMERA: false,
    SIMULATE_PERMISSIONS: false,
    DEBUG_OVERLAY: false,
  },
  
  // AR Production
  AR: {
    MOCK_TRACKING: false,
    SIMULATE_GEOMETRY: false,
    DEBUG_RENDERING: false,
    PERFORMANCE_MONITOR: false,
  },
  
  // Geometry Production
  GEOMETRY: {
    DEBUG_POINTS: false,
    DEBUG_PLANES: false,
    DEBUG_ANGLES: false,
    SIMULATE_CALCULATIONS: false,
  },
  
  // Measurement Production
  MEASUREMENT: {
    DEBUG_CALCULATIONS: false,
    SIMULATE_DEPTH: false,
    DEBUG_ACCURACY: false,
    MOCK_REPORTS: false,
  },
  
  // Performance Production
  PERFORMANCE: {
    MONITOR_FPS: false,
    MONITOR_MEMORY: false,
    DEBUG_RENDERING: false,
    OPTIMIZATION_HINTS: false,
  },
} as const;

export type ProdConfig = typeof PROD_CONFIG;

