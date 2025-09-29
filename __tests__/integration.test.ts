// Integration Test - Verify everything works together
import { describe, it, expect } from '@jest/globals'

describe('GEOSTXR Foundation Integration', () => {
  it('should import all configuration modules without errors', async () => {
    // Test that all our modules can be imported
    const config = await import('@/lib/config')
    const envConfig = await import('@/config/environment')
    const devConfig = await import('@/config/development')
    const prodConfig = await import('@/config/production')
    
    expect(config).toBeDefined()
    expect(envConfig).toBeDefined()
    expect(devConfig).toBeDefined()
    expect(prodConfig).toBeDefined()
  })

  it('should have consistent configuration values', async () => {
    // Test that configuration values are consistent
    const { GEOSTXR_CONFIG } = await import('@/lib/config')
    
    // Cylinder dimensions should be consistent
    expect(GEOSTXR_CONFIG.CYLINDER.DIAMETER).toBe(6.35)
    expect(GEOSTXR_CONFIG.CYLINDER.HEIGHT).toBe(15)
    expect(GEOSTXR_CONFIG.CYLINDER.RADIUS).toBe(3.175)
    
    // BOH lines should be consistent
    expect(GEOSTXR_CONFIG.BOH.LINE1.END_Z).toBe(GEOSTXR_CONFIG.BOH.LINE2.START_Z)
    expect(GEOSTXR_CONFIG.BOH.LINE2.END_Z).toBe(GEOSTXR_CONFIG.CYLINDER.HEIGHT * 2)
    
    // Performance limits should be reasonable
    expect(GEOSTXR_CONFIG.PERFORMANCE.MAX_FPS).toBeGreaterThan(0)
    expect(GEOSTXR_CONFIG.PERFORMANCE.MEMORY_LIMIT).toBeGreaterThan(0)
  })

  it('should have proper TypeScript types', () => {
    // Test that our type files exist
    const fs = require('fs')
    expect(fs.existsSync('types/geometry/index.ts')).toBe(true)
    expect(fs.existsSync('types/measurement/index.ts')).toBe(true)
    expect(fs.existsSync('types/camera/index.ts')).toBe(true)
    expect(fs.existsSync('types/ar/index.ts')).toBe(true)
  })
})
