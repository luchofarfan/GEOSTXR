'use client'

import React, { useRef, useEffect, useState } from 'react'
import * as THREE from 'three'
import { GEOSTXR_CONFIG } from '@/lib/config'

interface DirectCylinderProps {
  className?: string
}

export default function DirectCylinder({ className = '' }: DirectCylinderProps) {
  const mountRef = useRef<HTMLDivElement>(null)
  const sceneRef = useRef<THREE.Scene | null>(null)
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null)
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null)

  useEffect(() => {
    if (!mountRef.current || sceneRef.current) return

    const container = mountRef.current
    const width = container.clientWidth || 800
    const height = container.clientHeight || 600

    console.log('Creating direct cylinder scene...', { width, height })

    // Scene
    const scene = new THREE.Scene()

    // Camera - positioned to view cylinder from Y axis (lateral view)
    const camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000)
    // Position camera to center the cylinder in the screen
    camera.position.set(0, 4, 0) // Adjusted to center the cylinder perfectly
    camera.lookAt(0, 0, 0) // Look at center

    // Renderer
    const renderer = new THREE.WebGLRenderer({ 
      alpha: true, 
      antialias: true 
    })
    renderer.setSize(width, height)
    renderer.setClearColor(0x000000, 0)
    container.appendChild(renderer.domElement)

    // Lighting
    const ambientLight = new THREE.AmbientLight(0x404040, 0.6)
    scene.add(ambientLight)

    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8)
    directionalLight.position.set(1, 1, 1)
    scene.add(directionalLight)

    // Remove axes helper for cleaner visualization

    // Grid removed as requested

    // Create cylinder aligned with Z-axis
    const radius = GEOSTXR_CONFIG.CYLINDER.RADIUS
    const cylinderHeight = GEOSTXR_CONFIG.CYLINDER.HEIGHT

    // Add precise boundary markers to verify alignment
    const debugMaterial = new THREE.LineBasicMaterial({ color: 0x00ff00, linewidth: 3 })
    const cornerMaterial = new THREE.LineBasicMaterial({ color: 0xff0000, linewidth: 5 })
    const centerMaterial = new THREE.LineBasicMaterial({ color: 0xffff00, linewidth: 4 })
    
    // Center cross marker (yellow)
    const centerGeometry = new THREE.BufferGeometry()
    const centerPoints = [
      new THREE.Vector3(-radius, 0, 0),
      new THREE.Vector3(radius, 0, 0),
      new THREE.Vector3(0, 0, -cylinderHeight / 2),
      new THREE.Vector3(0, 0, cylinderHeight / 2)
    ]
    centerGeometry.setFromPoints(centerPoints)
    const centerMarker = new THREE.Line(centerGeometry, centerMaterial)
    scene.add(centerMarker)
    
    // Corner markers (red dots at the four corners)
    const cornerGeometry = new THREE.BufferGeometry()
    const cornerPoints = [
      new THREE.Vector3(-radius, 0, -cylinderHeight / 2), // Bottom left
      new THREE.Vector3(radius, 0, -cylinderHeight / 2),  // Bottom right
      new THREE.Vector3(-radius, 0, cylinderHeight / 2),  // Top left
      new THREE.Vector3(radius, 0, cylinderHeight / 2)     // Top right
    ]
    cornerGeometry.setFromPoints(cornerPoints)
    const cornerMarker = new THREE.Line(cornerGeometry, cornerMaterial)
    scene.add(cornerMarker)
    
    // Cylinder boundaries (green lines)
    const leftBoundaryGeometry = new THREE.BufferGeometry()
    const leftPoints = [
      new THREE.Vector3(-radius, 0, -cylinderHeight / 2),
      new THREE.Vector3(-radius, 0, cylinderHeight / 2)
    ]
    leftBoundaryGeometry.setFromPoints(leftPoints)
    const leftBoundary = new THREE.Line(leftBoundaryGeometry, debugMaterial)
    scene.add(leftBoundary)
    
    const rightBoundaryGeometry = new THREE.BufferGeometry()
    const rightPoints = [
      new THREE.Vector3(radius, 0, -cylinderHeight / 2),
      new THREE.Vector3(radius, 0, cylinderHeight / 2)
    ]
    rightBoundaryGeometry.setFromPoints(rightPoints)
    const rightBoundary = new THREE.Line(rightBoundaryGeometry, debugMaterial)
    scene.add(rightBoundary)
    
    // Top and bottom boundaries
    const topBoundaryGeometry = new THREE.BufferGeometry()
    const topPoints = [
      new THREE.Vector3(-radius, 0, cylinderHeight / 2),
      new THREE.Vector3(radius, 0, cylinderHeight / 2)
    ]
    topBoundaryGeometry.setFromPoints(topPoints)
    const topBoundary = new THREE.Line(topBoundaryGeometry, debugMaterial)
    scene.add(topBoundary)
    
    const bottomBoundaryGeometry = new THREE.BufferGeometry()
    const bottomPoints = [
      new THREE.Vector3(-radius, 0, -cylinderHeight / 2),
      new THREE.Vector3(radius, 0, -cylinderHeight / 2)
    ]
    bottomBoundaryGeometry.setFromPoints(bottomPoints)
    const bottomBoundary = new THREE.Line(bottomBoundaryGeometry, debugMaterial)
    scene.add(bottomBoundary)

    // Create cylinder geometry - aligned with Z-axis
    const cylinderGeometry = new THREE.CylinderGeometry(radius, radius, cylinderHeight, 32)
    // No rotation needed - cylinder is already aligned with Y-axis by default
    // We want it aligned with Z-axis, so we rotate around X
    cylinderGeometry.rotateX(Math.PI / 2)

    const cylinderMaterial = new THREE.MeshBasicMaterial({
      color: 0x0066CC,
      transparent: true,
      opacity: 0.7,
      side: THREE.DoubleSide,
      wireframe: false
    })

    const cylinder = new THREE.Mesh(cylinderGeometry, cylinderMaterial)
    // Position cylinder to align with the mask (centered in the visible area)
    cylinder.position.set(0, 0, 0) // Keep centered in 3D space
    // Remove scaling to use real dimensions
    // cylinder.scale.set(2, 2, 2) // Commented out to use real proportions
    scene.add(cylinder)
    
    console.log('Cylinder position:', cylinder.position)
    console.log('Cylinder scale:', cylinder.scale)
    console.log('Cylinder bounds:', cylinder.geometry.boundingBox)
    
    console.log('Cylinder added to scene:', cylinder)
    console.log('Cylinder position:', cylinder.position)
    console.log('Cylinder scale:', cylinder.scale)

    // Add borders
    const borderMaterial = new THREE.LineBasicMaterial({
      color: 0x000000,
      linewidth: 3
    })

    // Front border (0°)
    const frontGeometry = new THREE.BufferGeometry()
    const frontPoints = [
      new THREE.Vector3(radius * 2, 0, cylinderHeight * 2 / 2),
      new THREE.Vector3(radius * 2, 0, -cylinderHeight * 2 / 2)
    ]
    frontGeometry.setFromPoints(frontPoints)
    const frontLine = new THREE.Line(frontGeometry, borderMaterial)
    scene.add(frontLine)

    // Back border (180°)
    const backGeometry = new THREE.BufferGeometry()
    const backPoints = [
      new THREE.Vector3(-radius * 2, 0, cylinderHeight * 2 / 2),
      new THREE.Vector3(-radius * 2, 0, -cylinderHeight * 2 / 2)
    ]
    backGeometry.setFromPoints(backPoints)
    const backLine = new THREE.Line(backGeometry, borderMaterial)
    scene.add(backLine)

    // BOH Lines
    const bohMaterial = new THREE.LineBasicMaterial({
      color: 0xFF0000,
      linewidth: 3
    })

    // BOH Line 1: z=0 to z=15 (bottom to center)
    const line1Geometry = new THREE.BufferGeometry()
    const line1Points = [
      new THREE.Vector3(0, radius, -cylinderHeight / 2), // Bottom
      new THREE.Vector3(0, radius, 0) // Center
    ]
    line1Geometry.setFromPoints(line1Points)
    const bohLine1 = new THREE.Line(line1Geometry, bohMaterial)
    scene.add(bohLine1)

    // BOH Line 2: z=15 to z=30 (center to top)
    const line2Geometry = new THREE.BufferGeometry()
    const line2Points = [
      new THREE.Vector3(0, radius, 0), // Center
      new THREE.Vector3(0, radius, cylinderHeight / 2) // Top
    ]
    line2Geometry.setFromPoints(line2Points)
    const bohLine2 = new THREE.Line(line2Geometry, bohMaterial)
    scene.add(bohLine2)

    console.log('Direct cylinder scene created successfully')
    console.log('Cylinder dimensions:', { radius, cylinderHeight })
    console.log('Camera position:', camera.position)
    console.log('Scene children count:', scene.children.length)

    // Animation loop
    let animationId: number
    const animate = () => {
      animationId = requestAnimationFrame(animate)
      renderer.render(scene, camera)
    }
    animate()

    // Cleanup function
    return () => {
      console.log('Cleaning up direct cylinder scene...')
      if (animationId) {
        cancelAnimationFrame(animationId)
      }
      if (container && renderer.domElement && container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement)
      }
      renderer.dispose()
      scene.clear()
    }
  }, [])

  return (
    <div className={`direct-cylinder ${className}`}>
      <div 
        ref={mountRef} 
        className="w-full h-full"
        style={{ 
          width: '100%', 
          height: '100%', 
          minHeight: '400px'
        }}
      />
    </div>
  )
}
