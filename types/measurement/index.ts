// GEOSTXR Measurement Types
export interface Measurement {
  id: string;
  timestamp: Date;
  trioId: string;
  depth: number;
  alphaAngle: number;
  betaAngle: number;
  acAngle?: number;
  bohPosition: {
    line1: number;
    line2: number;
  };
  accuracy: number;
  status: 'active' | 'inactive' | 'error' | 'warning';
}

export interface MeasurementReport {
  id: string;
  timestamp: Date;
  measurements: Measurement[];
  acAngle: number;
  bohRelativePosition: {
    line1: number;
    line2: number;
  };
  summary: {
    totalTrios: number;
    averageDepth: number;
    averageAlpha: number;
    averageBeta: number;
  };
}

export interface DepthCalculation {
  method: 'manual' | 'automatic';
  cylinderDiameter: number;
  planeIntersection: {
    x: number;
    y: number;
    z: number;
  };
  relativePosition: number;
  accuracy: number;
}

