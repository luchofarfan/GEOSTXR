'use client'

import React, { useRef, useEffect, useState } from 'react'
import * as THREE from 'three'
import { GEOSTXR_CONFIG } from '@/lib/config'

interface StableCylinderProps {
  className?: string
}

export default function StableCylinder({ className = '' }: StableCylinderProps) {
  const mountRef = useRef<HTMLDivElement>(null)
  const [isInitialized, setIsInitialized] = useState(false)

  useEffect(() => {
    if (!mountRef.current || isInitialized) return

    const container = mountRef.current
    const width = container.clientWidth || 800
    const height = container.clientHeight || 600

    console.log('Creating stable Three.js scene...', { width, height })

    // Scene
    const scene = new THREE.Scene()

    // Camera
    const camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000)
    camera.position.set(0, 50, 15)
    camera.lookAt(0, 0, 15)

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

    // Create cylinder group
    const cylinderGroup = new THREE.Group()
    cylinderGroup.position.set(0, 0, 15)
    cylinderGroup.scale.set(3, 3, 3)

    // Create cylinder mask for camera feed
    const radius = GEOSTXR_CONFIG.CYLINDER.RADIUS
    const cylinderHeight = GEOSTXR_CONFIG.CYLINDER.HEIGHT

    // Create a hollow cylinder that will act as a mask
    const outerGeometry = new THREE.CylinderGeometry(radius, radius, cylinderHeight, 32)
    outerGeometry.rotateX(Math.PI / 2)
    
    const innerGeometry = new THREE.CylinderGeometry(radius * 0.95, radius * 0.95, cylinderHeight + 0.1, 32)
    innerGeometry.rotateX(Math.PI / 2)

    // Create hollow cylinder using CSG approach
    const hollowGeometry = new THREE.CylinderGeometry(radius, radius, cylinderHeight, 32)
    hollowGeometry.rotateX(Math.PI / 2)

    // Cylinder wall material (translucent)
    const cylinderMaterial = new THREE.MeshPhongMaterial({
      color: 0x0066CC,
      transparent: true,
      opacity: 0.3,
      side: THREE.DoubleSide,
      wireframe: false
    })

    // Create the cylinder wall
    const cylinder = new THREE.Mesh(hollowGeometry, cylinderMaterial)
    cylinderGroup.add(cylinder)

    // Create a circular mask for the camera feed
    const maskGeometry = new THREE.CircleGeometry(radius * 0.9, 32)
    const maskMaterial = new THREE.MeshBasicMaterial({
      color: 0x000000,
      transparent: true,
      opacity: 0.8,
      side: THREE.DoubleSide
    })
    
    const mask = new THREE.Mesh(maskGeometry, maskMaterial)
    mask.position.set(0, 0, 0)
    mask.rotation.x = Math.PI / 2
    cylinderGroup.add(mask)

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

    console.log('Scene created successfully')

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
      console.log('Cleaning up stable scene...')
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
    <div className={`stable-cylinder ${className}`}>
      <div 
        ref={mountRef} 
        className="w-full h-full"
        style={{ 
          width: '100%', 
          height: '100%', 
          minHeight: '400px',
          backgroundColor: 'rgba(0,0,0,0.1)' // Temporary background to see the container
        }}
      />
    </div>
  )
}
