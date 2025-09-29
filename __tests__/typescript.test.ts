// Test TypeScript Configuration
import { describe, it, expect } from '@jest/globals'
import fs from 'fs'

describe('TypeScript Configuration', () => {
  it('should have tsconfig.json with correct paths', () => {
    const tsconfig = JSON.parse(fs.readFileSync('tsconfig.json', 'utf8'))
    
    expect(tsconfig.compilerOptions.paths).toHaveProperty('@/*')
    expect(tsconfig.compilerOptions.paths).toHaveProperty('@/components/*')
    expect(tsconfig.compilerOptions.paths).toHaveProperty('@/lib/*')
    expect(tsconfig.compilerOptions.paths).toHaveProperty('@/hooks/*')
    expect(tsconfig.compilerOptions.paths).toHaveProperty('@/types/*')
    expect(tsconfig.compilerOptions.paths).toHaveProperty('@/config/*')
    expect(tsconfig.compilerOptions.paths).toHaveProperty('@/app/*')
  })

  it('should have correct TypeScript compiler options', () => {
    const tsconfig = JSON.parse(fs.readFileSync('tsconfig.json', 'utf8'))
    
    expect(tsconfig.compilerOptions.strict).toBe(true)
    expect(tsconfig.compilerOptions.noEmit).toBe(true)
    expect(tsconfig.compilerOptions.jsx).toBe('preserve')
    expect(tsconfig.compilerOptions.target).toBe('ES6')
  })

  it('should include correct files', () => {
    const tsconfig = JSON.parse(fs.readFileSync('tsconfig.json', 'utf8'))
    
    expect(tsconfig.include).toContain('next-env.d.ts')
    expect(tsconfig.include).toContain('**/*.ts')
    expect(tsconfig.include).toContain('**/*.tsx')
    expect(tsconfig.exclude).toContain('node_modules')
  })
})
