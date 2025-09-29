// Test Configuration Files
import { describe, it, expect } from '@jest/globals'
import { GEOSTXR_CONFIG } from '@/lib/config'
import { ENV_CONFIG } from '@/config/environment'
import { DEV_CONFIG } from '@/config/development'
import { PROD_CONFIG } from '@/config/production'

describe('Configuration Files', () => {
  describe('GEOSTXR_CONFIG', () => {
    it('should have cylinder configuration', () => {
      expect(GEOSTXR_CONFIG.CYLINDER).toBeDefined()
      expect(GEOSTXR_CONFIG.CYLINDER.DIAMETER).toBe(6.35)
      expect(GEOSTXR_CONFIG.CYLINDER.HEIGHT).toBe(15)
      expect(GEOSTXR_CONFIG.CYLINDER.RADIUS).toBe(3.175)
      expect(GEOSTXR_CONFIG.CYLINDER.AXIS_ALIGNMENT).toBe('z')
    })

    it('should have BOH configuration', () => {
      expect(GEOSTXR_CONFIG.BOH).toBeDefined()
      expect(GEOSTXR_CONFIG.BOH.LINE1.START_Z).toBe(0)
      expect(GEOSTXR_CONFIG.BOH.LINE1.END_Z).toBe(15)
      expect(GEOSTXR_CONFIG.BOH.LINE2.START_Z).toBe(15)
      expect(GEOSTXR_CONFIG.BOH.LINE2.END_Z).toBe(30)
      expect(GEOSTXR_CONFIG.BOH.DISPLACEMENT_RANGE.MIN).toBe(-20)
      expect(GEOSTXR_CONFIG.BOH.DISPLACEMENT_RANGE.MAX).toBe(20)
    })

    it('should have trios configuration', () => {
      expect(GEOSTXR_CONFIG.TRIOS).toBeDefined()
      expect(GEOSTXR_CONFIG.TRIOS.MAX_COUNT).toBe(100)
      expect(GEOSTXR_CONFIG.TRIOS.COLORS).toBeDefined()
    })

    it('should have depth configuration', () => {
      expect(GEOSTXR_CONFIG.DEPTH).toBeDefined()
      expect(GEOSTXR_CONFIG.DEPTH.MANUAL_RANGE.MIN).toBe(0.1)
      expect(GEOSTXR_CONFIG.DEPTH.MANUAL_RANGE.MAX).toBe(100)
      expect(GEOSTXR_CONFIG.DEPTH.AUTO_CALCULATION).toBe(true)
    })

    it('should have performance configuration', () => {
      expect(GEOSTXR_CONFIG.PERFORMANCE).toBeDefined()
      expect(GEOSTXR_CONFIG.PERFORMANCE.MAX_FPS).toBe(30)
      expect(GEOSTXR_CONFIG.PERFORMANCE.MEMORY_LIMIT).toBe(100)
      expect(GEOSTXR_CONFIG.PERFORMANCE.OPTIMIZATION).toBe(true)
    })
  })

  describe('Environment Configuration', () => {
    it('should have ENV_CONFIG defined', () => {
      expect(ENV_CONFIG).toBeDefined()
      expect(ENV_CONFIG.APP_NAME).toBeDefined()
      expect(ENV_CONFIG.APP_VERSION).toBeDefined()
    })

    it('should have DEV_CONFIG defined', () => {
      expect(DEV_CONFIG).toBeDefined()
      expect(DEV_CONFIG.DEBUG).toBe(true)
    })

    it('should have PROD_CONFIG defined', () => {
      expect(PROD_CONFIG).toBeDefined()
      expect(PROD_CONFIG.DEBUG).toBe(false)
    })
  })
})
