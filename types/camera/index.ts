// GEOSTXR Camera Types
export interface CameraConfig {
  width: number;
  height: number;
  aspectRatio: number;
  frameRate: number;
  quality: 'low' | 'medium' | 'high';
}

export interface CameraPermissions {
  camera: boolean;
  microphone: boolean;
  location: boolean;
}

export interface CameraControls {
  play: boolean;
  pause: boolean;
  record: boolean;
  capture: boolean;
  settings: boolean;
}

export interface CameraSettings {
  resolution: string;
  frameRate: number;
  quality: number;
  autofocus: boolean;
  flash: boolean;
  stabilization: boolean;
}

