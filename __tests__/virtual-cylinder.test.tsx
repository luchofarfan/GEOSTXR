import { describe, it, expect } from '@jest/globals'
import { render, screen } from '@testing-library/react'
import { CylinderControls } from '@/components/geometry/cylinder-controls'

// Mock Three.js completely
jest.mock('three', () => ({
  Scene: jest.fn(() => ({
    add: jest.fn()
  })),
  PerspectiveCamera: jest.fn(() => ({
    position: { set: jest.fn() },
    lookAt: jest.fn()
  })),
  WebGLRenderer: jest.fn(() => ({
    setSize: jest.fn(),
    setClearColor: jest.fn(),
    render: jest.fn(),
    domElement: document.createElement('canvas'),
    dispose: jest.fn()
  })),
  CylinderGeometry: jest.fn(() => ({
    rotateX: jest.fn()
  })),
  MeshPhongMaterial: jest.fn(),
  Mesh: jest.fn(() => ({
    position: { set: jest.fn() }
  })),
  AmbientLight: jest.fn(),
  DirectionalLight: jest.fn(() => ({
    position: { set: jest.fn() }
  })),
  LineBasicMaterial: jest.fn(),
  Line: jest.fn(),
  BufferGeometry: jest.fn(() => ({
    setFromPoints: jest.fn()
  })),
  Vector3: jest.fn(),
  DoubleSide: 2,
  Math: {
    PI: Math.PI
  }
}))

// Mock camera access
Object.defineProperty(navigator, 'mediaDevices', {
  writable: true,
  value: {
    getUserMedia: jest.fn(() => Promise.reject(new Error('Camera not available in test')))
  }
})

describe('Virtual Cylinder Components', () => {
  it('should render CylinderControls component', () => {
    render(<CylinderControls />)
    expect(screen.getByText('Cilindro Virtual')).toBeInTheDocument()
    expect(screen.getByText('Visibilidad')).toBeInTheDocument()
    expect(screen.getByText('Opacidad: 30%')).toBeInTheDocument()
    expect(screen.getByText('Posición X: 0.00')).toBeInTheDocument()
    expect(screen.getByText('Posición Y: 0.00')).toBeInTheDocument()
    expect(screen.getByText('Posición Z: 0.00')).toBeInTheDocument()
    expect(screen.getByText('Rotación X: 0°')).toBeInTheDocument()
    expect(screen.getByText('Rotación Y: 0°')).toBeInTheDocument()
    expect(screen.getByText('Rotación Z: 0°')).toBeInTheDocument()
    expect(screen.getByText('Escala: 1.00')).toBeInTheDocument()
    expect(screen.getByText('Resetear a Valores por Defecto')).toBeInTheDocument()
  })

  it('should have correct cylinder dimensions', () => {
    const { GEOSTXR_CONFIG } = require('@/lib/config')
    
    expect(GEOSTXR_CONFIG.CYLINDER.DIAMETER).toBe(6.35)
    expect(GEOSTXR_CONFIG.CYLINDER.HEIGHT).toBe(15)
    expect(GEOSTXR_CONFIG.CYLINDER.RADIUS).toBe(3.175)
    expect(GEOSTXR_CONFIG.CYLINDER.COLOR).toBe(0x00BFFF)
    expect(GEOSTXR_CONFIG.CYLINDER.OPACITY).toBe(0.3)
    expect(GEOSTXR_CONFIG.CYLINDER.BORDER_COLOR).toBe(0x000000)
    expect(GEOSTXR_CONFIG.CYLINDER.BORDER_WIDTH).toBe(2)
  })
})
