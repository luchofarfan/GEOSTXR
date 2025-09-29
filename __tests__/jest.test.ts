// Test Jest Configuration
import { describe, it, expect } from '@jest/globals'
import fs from 'fs'

describe('Jest Configuration', () => {
  it('should have jest.config.js', () => {
    expect(fs.existsSync('jest.config.js')).toBe(true)
  })

  it('should have jest.setup.js', () => {
    expect(fs.existsSync('jest.setup.js')).toBe(true)
  })

  it('should have correct Jest configuration', () => {
    const jestConfig = require('../jest.config.js')
    
    expect(jestConfig).toBeDefined()
    // The configuration is returned by createJestConfig, so we need to check the actual config
    expect(jestConfig.testEnvironment).toBe('jest-environment-jsdom')
  })

  it('should have correct module name mapping', () => {
    const jestConfig = require('../jest.config.js')
    
    expect(jestConfig).toBeDefined()
    expect(jestConfig.moduleNameMapper).toBeDefined()
    expect(jestConfig.moduleNameMapper['^@/(.*)$']).toBeDefined()
    expect(jestConfig.moduleNameMapper['^@/components/(.*)$']).toBeDefined()
    expect(jestConfig.moduleNameMapper['^@/lib/(.*)$']).toBeDefined()
    expect(jestConfig.moduleNameMapper['^@/hooks/(.*)$']).toBeDefined()
    expect(jestConfig.moduleNameMapper['^@/types/(.*)$']).toBeDefined()
    expect(jestConfig.moduleNameMapper['^@/config/(.*)$']).toBeDefined()
  })
})
