// GEOSTXR AR Types
export interface ARConfig {
  enabled: boolean;
  tracking: boolean;
  overlay: boolean;
  performance: 'low' | 'medium' | 'high';
}

export interface ARPoint {
  id: string;
  position: {
    x: number;
    y: number;
    z: number;
  };
  color: string;
  size: number;
  visible: boolean;
  interactive: boolean;
}

export interface AROverlay {
  cylinder: boolean;
  bohLines: boolean;
  trios: boolean;
  planes: boolean;
  ellipses: boolean;
  measurements: boolean;
}

export interface ARPerformance {
  fps: number;
  memoryUsage: number;
  renderTime: number;
  optimization: boolean;
}

