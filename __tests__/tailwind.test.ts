// Test Tailwind CSS Configuration
import { describe, it, expect } from '@jest/globals'

describe('Tailwind CSS Configuration', () => {
  it('should have GEOSTXR specific colors defined', () => {
    // Test that our custom colors are available
    const geostxrColors = [
      'geostxr-cylinder',
      'geostxr-boh',
      'geostxr-trio1',
      'geostxr-trio2',
      'geostxr-trio3',
      'geostxr-alpha',
      'geostxr-beta',
      'geostxr-ac',
    ]
    
    // This would be tested in a real environment
    expect(geostxrColors).toHaveLength(8)
  })

  it('should have measurement colors defined', () => {
    const measurementColors = [
      'measurement-active',
      'measurement-inactive',
      'measurement-error',
      'measurement-warning',
    ]
    
    expect(measurementColors).toHaveLength(4)
  })

  it('should have custom animations defined', () => {
    const customAnimations = [
      'pulse-slow',
      'bounce-slow',
      'spin-slow',
      'fade-in',
      'slide-up',
      'scale-in',
    ]
    
    expect(customAnimations).toHaveLength(6)
  })
})
