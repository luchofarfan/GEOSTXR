'use client'

import React, { useRef, useEffect } from 'react'
import * as THREE from 'three'
import { GEOSTXR_CONFIG } from '@/lib/config'

interface SimpleCylinderTestProps {
  className?: string
}

export default function SimpleCylinderTest({ className = '' }: SimpleCylinderTestProps) {
  const mountRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!mountRef.current) return

    const container = mountRef.current
    const width = container.clientWidth
    const height = container.clientHeight

    // Scene setup
    const scene = new THREE.Scene()

    // Camera setup - positioned at (0, 50, 15) looking at center of cylinder
    const camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000)
    camera.position.set(0, 50, 15)
    camera.lookAt(0, 0, 15)

    // Renderer setup
    const renderer = new THREE.WebGLRenderer({ 
      alpha: true, 
      antialias: true 
    })
    renderer.setSize(width, height)
    renderer.setClearColor(0x000000, 0) // Transparent background
    container.appendChild(renderer.domElement)

    // Lighting
    const ambientLight = new THREE.AmbientLight(0x404040, 0.6)
    scene.add(ambientLight)

    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8)
    directionalLight.position.set(1, 1, 1)
    scene.add(directionalLight)

    // Create cylinder with BOH lines
    const radius = GEOSTXR_CONFIG.CYLINDER.RADIUS
    const cylinderHeight = GEOSTXR_CONFIG.CYLINDER.HEIGHT

    // Cylinder geometry
    const cylinderGeometry = new THREE.CylinderGeometry(radius, radius, cylinderHeight, 32)
    cylinderGeometry.rotateX(Math.PI / 2) // Align with Z-axis

    // Cylinder material
    const cylinderMaterial = new THREE.MeshPhongMaterial({
      color: 0x0066CC,
      transparent: true,
      opacity: 0.3,
      side: THREE.DoubleSide,
      wireframe: false
    })

    // Create cylinder group
    const cylinderGroup = new THREE.Group()
    cylinderGroup.position.set(0, 0, 15) // Centered at z=15
    cylinderGroup.scale.set(3, 3, 3) // Scale to 3/4 of scene

    // Create cylinder mesh
    const cylinder = new THREE.Mesh(cylinderGeometry, cylinderMaterial)
    cylinder.position.set(0, 0, 0)
    cylinderGroup.add(cylinder)

    // Add borders
    const borderMaterial = new THREE.LineBasicMaterial({
      color: 0x000000,
      linewidth: 3
    })

    // Vertical line at 0° (front)
    const frontVerticalGeometry = new THREE.BufferGeometry()
    const frontVerticalPoints = [
      new THREE.Vector3(radius, 0, cylinderHeight / 2),
      new THREE.Vector3(radius, 0, -cylinderHeight / 2)
    ]
    frontVerticalGeometry.setFromPoints(frontVerticalPoints)
    const frontVertical = new THREE.Line(frontVerticalGeometry, borderMaterial)
    cylinderGroup.add(frontVertical)

    // Vertical line at 180° (back)
    const backVerticalGeometry = new THREE.BufferGeometry()
    const backVerticalPoints = [
      new THREE.Vector3(-radius, 0, cylinderHeight / 2),
      new THREE.Vector3(-radius, 0, -cylinderHeight / 2)
    ]
    backVerticalGeometry.setFromPoints(backVerticalPoints)
    const backVertical = new THREE.Line(backVerticalGeometry, borderMaterial)
    cylinderGroup.add(backVertical)

    // Add BOH lines to the same group
    const bohMaterial = new THREE.LineBasicMaterial({
      color: 0xFF0000,
      linewidth: 3
    })

    // BOH Line 1: z=0 to z=15 (bottom to center) at 90°
    const line1Geometry = new THREE.BufferGeometry()
    const line1Points = [
      new THREE.Vector3(0, radius, 0),   // Bottom at 90°
      new THREE.Vector3(0, radius, cylinderHeight / 2) // Center at 90°
    ]
    line1Geometry.setFromPoints(line1Points)
    const bohLine1 = new THREE.Line(line1Geometry, bohMaterial)
    cylinderGroup.add(bohLine1)

    // BOH Line 2: z=15 to z=30 (center to top) at 90°
    const line2Geometry = new THREE.BufferGeometry()
    const line2Points = [
      new THREE.Vector3(0, radius, cylinderHeight / 2), // Center at 90°
      new THREE.Vector3(0, radius, cylinderHeight) // Top at 90°
    ]
    line2Geometry.setFromPoints(line2Points)
    const bohLine2 = new THREE.Line(line2Geometry, bohMaterial)
    cylinderGroup.add(bohLine2)

    // Add the group to the scene
    scene.add(cylinderGroup)

    // Animation loop
    const animate = () => {
      requestAnimationFrame(animate)
      renderer.render(scene, camera)
    }
    animate()

    // Cleanup
    return () => {
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement)
      }
      renderer.dispose()
    }
  }, [])

  return (
    <div className={`simple-cylinder-test ${className}`}>
      <div 
        ref={mountRef} 
        className="w-full h-full"
        style={{ width: '100%', height: '100%' }}
      />
    </div>
  )
}
