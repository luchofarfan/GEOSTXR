'use client'

import React, { useRef, useEffect, useState } from 'react'
import * as THREE from 'three'
import { GEOSTXR_CONFIG } from '@/lib/config'

interface CSSMaskedCylinderProps {
  className?: string
}

export default function CSSMaskedCylinder({ className = '' }: CSSMaskedCylinderProps) {
  const mountRef = useRef<HTMLDivElement>(null)
  const [isInitialized, setIsInitialized] = useState(false)

  useEffect(() => {
    if (!mountRef.current || isInitialized) return

    const container = mountRef.current
    const width = container.clientWidth || 800
    const height = container.clientHeight || 600

    console.log('Creating CSS masked cylinder scene...', { width, height })

    // Scene
    const scene = new THREE.Scene()

    // Camera - positioned to view cylinder from Y axis (lateral view of Z-aligned cylinder)
    const camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000)
    camera.position.set(0, 30, 0) // View from Y axis to see Z-aligned cylinder laterally
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

    // Add coordinate axes for debugging
    const axesHelper = new THREE.AxesHelper(10)
    scene.add(axesHelper)

    // Add scale reference (grid)
    const gridHelper = new THREE.GridHelper(20, 20, 0x444444, 0x444444)
    scene.add(gridHelper)

    // Add scale markers
    const scaleGeometry = new THREE.BufferGeometry()
    const scalePoints = []
    
    // Create scale markers every 5 units
    for (let i = -10; i <= 10; i += 5) {
      // X-axis markers
      scalePoints.push(new THREE.Vector3(i, 0, -10))
      scalePoints.push(new THREE.Vector3(i, 0, 10))
      // Z-axis markers  
      scalePoints.push(new THREE.Vector3(-10, 0, i))
      scalePoints.push(new THREE.Vector3(10, 0, i))
    }
    
    scaleGeometry.setFromPoints(scalePoints)
    const scaleMaterial = new THREE.LineBasicMaterial({ color: 0x666666, linewidth: 1 })
    const scaleLines = new THREE.LineSegments(scaleGeometry, scaleMaterial)
    scene.add(scaleLines)

    // Create cylinder group - positioned to fit within circular mask
    const cylinderGroup = new THREE.Group()
    cylinderGroup.position.set(0, 0, 0) // Centered in scene
    cylinderGroup.scale.set(2, 2, 2) // Smaller scale to fit within circular mask

    // Create cylinder
    const radius = GEOSTXR_CONFIG.CYLINDER.RADIUS
    const cylinderHeight = GEOSTXR_CONFIG.CYLINDER.HEIGHT

    const cylinderGeometry = new THREE.CylinderGeometry(radius, radius, cylinderHeight, 32)
    // Cylinder is already aligned with Y-axis by default, rotate to align with Z-axis
    cylinderGeometry.rotateX(Math.PI / 2) // This aligns it with Z-axis

    const cylinderMaterial = new THREE.MeshPhongMaterial({
      color: 0x0066CC,
      transparent: true,
      opacity: 0.3,
      side: THREE.DoubleSide,
      wireframe: false
    })

    const cylinder = new THREE.Mesh(cylinderGeometry, cylinderMaterial)
    cylinderGroup.add(cylinder)

    // Borders
    const borderMaterial = new THREE.LineBasicMaterial({
      color: 0x000000,
      linewidth: 3
    })

    // Front border (0°)
    const frontGeometry = new THREE.BufferGeometry()
    const frontPoints = [
      new THREE.Vector3(radius, 0, cylinderHeight / 2),
      new THREE.Vector3(radius, 0, -cylinderHeight / 2)
    ]
    frontGeometry.setFromPoints(frontPoints)
    const frontLine = new THREE.Line(frontGeometry, borderMaterial)
    cylinderGroup.add(frontLine)

    // Back border (180°)
    const backGeometry = new THREE.BufferGeometry()
    const backPoints = [
      new THREE.Vector3(-radius, 0, cylinderHeight / 2),
      new THREE.Vector3(-radius, 0, -cylinderHeight / 2)
    ]
    backGeometry.setFromPoints(backPoints)
    const backLine = new THREE.Line(backGeometry, borderMaterial)
    cylinderGroup.add(backLine)

    // BOH Lines
    const bohMaterial = new THREE.LineBasicMaterial({
      color: 0xFF0000,
      linewidth: 3
    })

    // BOH Line 1: z=0 to z=15
    const line1Geometry = new THREE.BufferGeometry()
    const line1Points = [
      new THREE.Vector3(0, radius, 0),
      new THREE.Vector3(0, radius, cylinderHeight / 2)
    ]
    line1Geometry.setFromPoints(line1Points)
    const bohLine1 = new THREE.Line(line1Geometry, bohMaterial)
    cylinderGroup.add(bohLine1)

    // BOH Line 2: z=15 to z=30
    const line2Geometry = new THREE.BufferGeometry()
    const line2Points = [
      new THREE.Vector3(0, radius, cylinderHeight / 2),
      new THREE.Vector3(0, radius, cylinderHeight)
    ]
    line2Geometry.setFromPoints(line2Points)
    const bohLine2 = new THREE.Line(line2Geometry, bohMaterial)
    cylinderGroup.add(bohLine2)

    // Add to scene
    scene.add(cylinderGroup)

    console.log('CSS masked cylinder scene created successfully')

    // Animation loop
    let animationId: number
    const animate = () => {
      animationId = requestAnimationFrame(animate)
      renderer.render(scene, camera)
    }
    animate()

    // Mark as initialized
    setIsInitialized(true)

    // Cleanup function
    return () => {
      console.log('Cleaning up CSS masked cylinder scene...')
      if (animationId) {
        cancelAnimationFrame(animationId)
      }
      if (container && renderer.domElement && container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement)
      }
      renderer.dispose()
      scene.clear()
    }
  }, [isInitialized])

  return (
    <div className={`css-masked-cylinder ${className}`}>
      <div 
        ref={mountRef} 
        className="w-full h-full"
        style={{ 
          width: '100%', 
          height: '100%', 
          minHeight: '400px',
          // CSS mask to create circular hole effect
          mask: 'radial-gradient(circle, transparent 0%, transparent 45%, black 45%, black 100%)',
          WebkitMask: 'radial-gradient(circle, transparent 0%, transparent 45%, black 45%, black 100%)'
        }}
      />
    </div>
  )
}
