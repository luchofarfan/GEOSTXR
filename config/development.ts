// GEOSTXR Development Configuration
export const DEV_CONFIG = {
  // Development Settings
  DEBUG: true,
  LOG_LEVEL: 'debug' as const,
  HOT_RELOAD: true,
  
  // Camera Development
  CAMERA: {
    MOCK_CAMERA: false,
    SIMULATE_PERMISSIONS: true,
    DEBUG_OVERLAY: true,
  },
  
  // AR Development
  AR: {
    MOCK_TRACKING: false,
    SIMULATE_GEOMETRY: true,
    DEBUG_RENDERING: true,
    PERFORMANCE_MONITOR: true,
  },
  
  // Geometry Development
  GEOMETRY: {
    DEBUG_POINTS: true,
    DEBUG_PLANES: true,
    DEBUG_ANGLES: true,
    SIMULATE_CALCULATIONS: false,
  },
  
  // Measurement Development
  MEASUREMENT: {
    DEBUG_CALCULATIONS: true,
    SIMULATE_DEPTH: false,
    DEBUG_ACCURACY: true,
    MOCK_REPORTS: false,
  },
  
  // Performance Development
  PERFORMANCE: {
    MONITOR_FPS: true,
    MONITOR_MEMORY: true,
    DEBUG_RENDERING: true,
    OPTIMIZATION_HINTS: true,
  },
} as const;

export type DevConfig = typeof DEV_CONFIG;

