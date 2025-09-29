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
  POINT_TRIOS: {
    MAX_TRIOS: 100,
    SELECTION_COLOR: 0x00FF00, // Green for selection
    SELECTION_SIZE: 0.2, // cm
  },

  // Planes
  PLANES: {
    MAX_PLANES: 100,
    MATERIAL_OPACITY: 0.5,
    MATERIAL_COLOR: 0xFFFF00, // Yellow
  },

  // Ellipses
  ELLIPSES: {
    MAX_ELLIPSES: 100,
    LINE_WIDTH: 2,
    LINE_COLOR: 0xFF00FF, // Magenta
  },

  // Measurements
  MEASUREMENTS: {
    ALPHA_ANGLE_COLOR: 0x8B5CF6, // Purple
    BETA_ANGLE_COLOR: 0xEF4444, // Red
    AC_ANGLE_COLOR: 0xF59E0B, // Orange
  },

  // Performance
  PERFORMANCE: {
    TARGET_FPS: 30,
    MAX_ELEMENTS_PER_SCENE: 100,
  },
} as const
