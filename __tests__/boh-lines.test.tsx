import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import '@testing-library/jest-dom'
import BOHLines from '@/components/geometry/boh-lines'
import BOHControls from '@/components/geometry/boh-controls'
import { useBOHLines } from '@/hooks/geometry/use-boh-lines'
import { GEOSTXR_CONFIG } from '@/lib/config'

// Mock Three.js
jest.mock('three', () => ({
  Scene: jest.fn(() => ({ add: jest.fn() })),
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
  BufferGeometry: jest.fn(() => ({
    setFromPoints: jest.fn()
  })),
  LineBasicMaterial: jest.fn(),
  Line: jest.fn(),
  Vector3: jest.fn((x, y, z) => ({ x, y, z })),
  AmbientLight: jest.fn(),
  DirectionalLight: jest.fn(),
  Math: {
    PI: Math.PI,
    cos: Math.cos,
    sin: Math.sin
  }
}))

// Mock the hook
jest.mock('@/hooks/geometry/use-boh-lines', () => ({
  useBOHLines: jest.fn()
}))

describe('BOH Lines Components', () => {
  const mockActions = {
    setLine1Angle: jest.fn(),
    setLine2Angle: jest.fn(),
    setVisibility: jest.fn(),
    setInteractive: jest.fn(),
    resetAngles: jest.fn(),
    updateBOHLines: jest.fn()
  }

  const mockState = {
    line1Angle: 0,
    line2Angle: 90,
    isVisible: true,
    isInteractive: true
  }

  beforeEach(() => {
    (useBOHLines as jest.Mock).mockReturnValue({
      state: mockState,
      actions: mockActions
    })
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  describe('BOHLines Component', () => {
    it('renders without crashing', () => {
      render(<BOHLines />)
      expect(screen.getByRole('generic')).toBeInTheDocument()
    })

    it('calls onBOHChange when angles change', () => {
      const mockOnBOHChange = jest.fn()
      render(<BOHLines onBOHChange={mockOnBOHChange} />)
      
      // The component should call onBOHChange with initial values
      expect(mockOnBOHChange).toHaveBeenCalledWith(0, 90)
    })
  })

  describe('BOHControls Component', () => {
    it('renders all control elements', () => {
      render(<BOHControls state={mockState} actions={mockActions} />)
      
      expect(screen.getByText('Controles BOH')).toBeInTheDocument()
      expect(screen.getByText('Mostrar líneas BOH')).toBeInTheDocument()
      expect(screen.getByText('Modo interactivo')).toBeInTheDocument()
      expect(screen.getByText('Línea BOH 1: 0.0°')).toBeInTheDocument()
      expect(screen.getByText('Línea BOH 2: 90.0°')).toBeInTheDocument()
      expect(screen.getByText('Resetear a Valores por Defecto')).toBeInTheDocument()
    })

    it('updates line 1 angle when slider changes', () => {
      render(<BOHControls state={mockState} actions={mockActions} />)
      
      const line1Slider = screen.getByDisplayValue('0')
      fireEvent.change(line1Slider, { target: { value: '15' } })
      
      expect(mockActions.setLine1Angle).toHaveBeenCalledWith(15)
    })

    it('updates line 2 angle when slider changes', () => {
      render(<BOHControls state={mockState} actions={mockActions} />)
      
      const line2Slider = screen.getByDisplayValue('90')
      fireEvent.change(line2Slider, { target: { value: '75' } })
      
      expect(mockActions.setLine2Angle).toHaveBeenCalledWith(75)
    })

    it('toggles visibility when checkbox changes', () => {
      render(<BOHControls state={mockState} actions={mockActions} />)
      
      const visibilityCheckbox = screen.getByRole('checkbox', { name: /mostrar líneas boh/i })
      fireEvent.click(visibilityCheckbox)
      
      expect(mockActions.setVisibility).toHaveBeenCalledWith(false)
    })

    it('toggles interactive mode when checkbox changes', () => {
      render(<BOHControls state={mockState} actions={mockActions} />)
      
      const interactiveCheckbox = screen.getByRole('checkbox', { name: /modo interactivo/i })
      fireEvent.click(interactiveCheckbox)
      
      expect(mockActions.setInteractive).toHaveBeenCalledWith(false)
    })

    it('resets angles when reset button is clicked', () => {
      render(<BOHControls state={mockState} actions={mockActions} />)
      
      const resetButton = screen.getByText('Resetear a Valores por Defecto')
      fireEvent.click(resetButton)
      
      expect(mockActions.resetAngles).toHaveBeenCalled()
    })

    it('disables controls when not interactive', () => {
      const nonInteractiveState = { ...mockState, isInteractive: false }
      render(<BOHControls state={nonInteractiveState} actions={mockActions} />)
      
      const sliders = screen.getAllByRole('slider')
      const resetButton = screen.getByText('Resetear a Valores por Defecto')
      
      sliders.forEach(slider => {
        expect(slider).toBeDisabled()
      })
      expect(resetButton).toBeDisabled()
    })
  })

  describe('Configuration', () => {
    it('has correct BOH configuration values', () => {
      expect(GEOSTXR_CONFIG.BOH.LINE1.START_Z).toBe(0)
      expect(GEOSTXR_CONFIG.BOH.LINE1.END_Z).toBe(15)
      expect(GEOSTXR_CONFIG.BOH.LINE2.START_Z).toBe(15)
      expect(GEOSTXR_CONFIG.BOH.LINE2.END_Z).toBe(30)
      expect(GEOSTXR_CONFIG.BOH.DISPLACEMENT_RANGE).toBe(20)
    })
  })
})
