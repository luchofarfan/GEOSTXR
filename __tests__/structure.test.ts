// Test Project Structure and Imports
import { describe, it, expect } from '@jest/globals'
import fs from 'fs'

// Test that all our type definition files exist
describe('Project Structure', () => {
  it('should have geometry types file', () => {
    expect(fs.existsSync('types/geometry/index.ts')).toBe(true)
  })

  it('should have measurement types file', () => {
    expect(fs.existsSync('types/measurement/index.ts')).toBe(true)
  })

  it('should have camera types file', () => {
    expect(fs.existsSync('types/camera/index.ts')).toBe(true)
  })

  it('should have AR types file', () => {
    expect(fs.existsSync('types/ar/index.ts')).toBe(true)
  })

  it('should have lib config file', () => {
    expect(fs.existsSync('lib/config.ts')).toBe(true)
  })

  it('should have environment config files', () => {
    expect(fs.existsSync('config/environment.ts')).toBe(true)
    expect(fs.existsSync('config/development.ts')).toBe(true)
    expect(fs.existsSync('config/production.ts')).toBe(true)
  })
})
