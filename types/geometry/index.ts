// GEOSTXR Geometry Types
export interface Point3D {
  x: number;
  y: number;
  z: number;
}

export interface Vector3D {
  x: number;
  y: number;
  z: number;
}

export interface Plane {
  a: number;
  b: number;
  c: number;
  d: number;
}

export interface Cylinder {
  center: Point3D;
  radius: number;
  height: number;
  axis: Vector3D;
}

export interface BOHLine {
  start: Point3D;
  end: Point3D;
  angle: number;
  displacement: {
    minAngle: number;
    maxAngle: number;
    smoothness: number;
    sensitivity: number;
  };
  interactive: boolean;
}

export interface PointTrio {
  id: string;
  points: [Point3D, Point3D, Point3D];
  plane?: Plane;
  depth?: number;
  autoDepth?: boolean;
  depthCalculationMethod?: 'manual' | 'automatic';
  alphaAngle?: number;
  betaAngle?: number;
  dynamicBeta?: boolean;
  color: string;
  visible: boolean;
}

export interface Ellipse {
  center: Point3D;
  majorAxis: Vector3D;
  minorAxis: Vector3D;
  majorRadius: number;
  minorRadius: number;
  color: string;
  visible: boolean;
}

