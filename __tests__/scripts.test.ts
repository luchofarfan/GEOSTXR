// Test Development Scripts
import { describe, it, expect } from '@jest/globals'
import { execSync } from 'child_process'
import fs from 'fs'
import path from 'path'

describe('Development Scripts', () => {
  it('should have package.json with correct scripts', () => {
    const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'))
    
    expect(packageJson.scripts).toHaveProperty('dev')
    expect(packageJson.scripts).toHaveProperty('build')
    expect(packageJson.scripts).toHaveProperty('start')
    expect(packageJson.scripts).toHaveProperty('lint')
    expect(packageJson.scripts).toHaveProperty('geostxr:dev')
    expect(packageJson.scripts).toHaveProperty('geostxr:build')
    expect(packageJson.scripts).toHaveProperty('geostxr:lint')
  })

  it('should have correct project name and version', () => {
    const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'))
    
    expect(packageJson.name).toBe('geostxr')
    expect(packageJson.version).toBe('1.0.0')
    expect(packageJson.description).toBe('GEOSTXR - Virtual Geometry Measurement System')
  })

  it('should have required dependencies', () => {
    const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'))
    
    expect(packageJson.dependencies).toHaveProperty('next')
    expect(packageJson.dependencies).toHaveProperty('react')
    expect(packageJson.dependencies).toHaveProperty('react-dom')
    expect(packageJson.devDependencies).toHaveProperty('tailwindcss')
  })

  it('should have required dev dependencies', () => {
    const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'))
    
    expect(packageJson.devDependencies).toHaveProperty('typescript')
    expect(packageJson.devDependencies).toHaveProperty('jest')
    expect(packageJson.devDependencies).toHaveProperty('@types/node')
    expect(packageJson.devDependencies).toHaveProperty('@types/react')
  })
})
