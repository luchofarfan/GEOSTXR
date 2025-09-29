// GEOSTXR Configuration
export const GEOSTXR_CONFIG = {
  // Virtual Geometry
  CYLINDER: {
    DIAMETER: 6.35, // cm
    HEIGHT: 30, // cm
    RADIUS: 3.175, // cm
    AXIS_ALIGNMENT: 'z' as const,
    COLOR: 0x00BFFF, // Blue color
    OPACITY: 0.3, // 30% opacity for better visibility over camera feed
    BORDER_COLOR: 0x000000, // Black borders
    BORDER_WIDTH: 3,
  },
  
  // BOH Lines
  BOH: {
    LINE1: {
      START_Z: 0,
      END_Z: 15,
      COLOR: 0xFF0000, // Red color
      WIDTH: 3,
      OFFSET_ANGLE: 0, // Initial offset from 0 degrees
    },
    LINE2: {
      START_Z: 15,
      END_Z: 30,
      COLOR: 0xFF0000, // Red color
      WIDTH: 3,
      OFFSET_ANGLE: 90, // Initial offset from 0 degrees
    },
    DISPLACEMENT_RANGE: 20, // +/- degrees around Z-axis
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
