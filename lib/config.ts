// GEOSTXR Configuration
export const GEOSTXR_CONFIG = {
  // Virtual Geometry
  CYLINDER: {
    DIAMETER: 6.35, // cm
    HEIGHT: 30, // cm
    RADIUS: 3.175, // cm
    AXIS_ALIGNMENT: 'z' as const,
    COLOR: 0x00BFFF, // Blue color
    OPACITY: 0.1, // 10% opacity for better visibility
    BORDER_COLOR: 0x000000, // Black borders
    BORDER_WIDTH: 2,
  },
  
  // BOH Lines
  BOH: {
    LINE1: {
      START_Z: 0,
      END_Z: 15,
    },
    LINE2: {
      START_Z: 15,
      END_Z: 30,
    },
    DISPLACEMENT_RANGE: {
      MIN: -20, // degrees
      MAX: 20, // degrees
    },
    SMOOTHNESS: 0.1,
    SENSITIVITY: 1.0,
  },
  
  // Point Trios
  TRIOS: {
    MAX_COUNT: 100,
    COLORS: {
      TRIO1: '#3B82F6',
      TRIO2: '#10B981',
      TRIO3: '#F59E0B',
    },
  },
  
  // Depth Calculation
  DEPTH: {
    MANUAL_RANGE: {
      MIN: 0.1, // cm
      MAX: 100, // cm
    },
    AUTO_CALCULATION: true,
    CYLINDER_REFERENCE: true,
  },
  
  // Performance
  PERFORMANCE: {
    MAX_FPS: 30,
    MEMORY_LIMIT: 100, // MB
    OPTIMIZATION: true,
  },
  
  // UI
  UI: {
    THEME: 'dark' as const,
    ANIMATIONS: true,
    RESPONSIVE: true,
  },
} as const;

export type GEOSTXRConfig = typeof GEOSTXR_CONFIG;

