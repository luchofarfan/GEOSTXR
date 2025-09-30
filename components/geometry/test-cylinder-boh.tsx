'use client'

import React, { useRef, useEffect, useState } from 'react'
import * as THREE from 'three'
import { GEOSTXR_CONFIG } from '@/lib/config'

interface TestCylinderBOHProps {
  className?: string
}

export default function TestCylinderBOH({ className = '' }: TestCylinderBOHProps) {
  const mountRef = useRef<HTMLDivElement>(null)
  const sceneRef = useRef<THREE.Scene | null>(null)
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null)
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null)
  const [line1Angle, setLine1Angle] = useState(90)
  const [line2Angle, setLine2Angle] = useState(90)

  useEffect(() => {
    if (!mountRef.current) return

    const container = mountRef.current
    const width = container.clientWidth
    const height = container.clientHeight

    // Scene setup
    const scene = new THREE.Scene()
    sceneRef.current = scene

    // Camera setup - positioned at (0, 50, 15) looking at center of cylinder
    const camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000)
    camera.position.set(0, 50, 15)
    camera.lookAt(0, 0, 15)
    cameraRef.current = camera

    // Renderer setup
    const renderer = new THREE.WebGLRenderer({ 
      alpha: true, 
      antialias: true 
    })
    renderer.setSize(width, height)
    renderer.setClearColor(0x000000, 0) // Transparent background
    rendererRef.current = renderer
    container.appendChild(renderer.domElement)

    // Create cylinder and BOH lines together
    const cylinderGroup = createCylinderWithBOH(scene)

    // Lighting
    const ambientLight = new THREE.AmbientLight(0x404040, 0.6)
    scene.add(ambientLight)

    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8)
    directionalLight.position.set(1, 1, 1)
    scene.add(directionalLight)

    // Animation loop
    const animate = () => {
      requestAnimationFrame(animate)
      renderer.render(scene, camera)
    }
    animate()

    // Cleanup
    return () => {
      container.removeChild(renderer.domElement)
      renderer.dispose()
    }
  }, [])

  // Function to create cylinder with BOH lines
  const createCylinderWithBOH = (scene: THREE.Scene) => {
    const radius = GEOSTXR_CONFIG.CYLINDER.RADIUS
    const height = GEOSTXR_CONFIG.CYLINDER.HEIGHT

    // Cylinder geometry
    const cylinderGeometry = new THREE.CylinderGeometry(radius, radius, height, 32)
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
    addBorders(cylinderGroup)

    // Add BOH lines to the same group
    addBOHLines(cylinderGroup)

    // Add the group to the scene
    scene.add(cylinderGroup)
    
    return cylinderGroup
  }

  // Function to add borders
  const addBorders = (group: THREE.Group) => {
    const radius = GEOSTXR_CONFIG.CYLINDER.RADIUS
    const height = GEOSTXR_CONFIG.CYLINDER.HEIGHT

    const borderMaterial = new THREE.LineBasicMaterial({
      color: 0x000000,
      linewidth: 3
    })

    // Vertical line at 0° (front)
    const frontVerticalGeometry = new THREE.BufferGeometry()
    const frontVerticalPoints = [
      new THREE.Vector3(radius, 0, height / 2),
      new THREE.Vector3(radius, 0, -height / 2)
    ]
    frontVerticalGeometry.setFromPoints(frontVerticalPoints)
    const frontVertical = new THREE.Line(frontVerticalGeometry, borderMaterial)
    group.add(frontVertical)

    // Vertical line at 180° (back)
    const backVerticalGeometry = new THREE.BufferGeometry()
    const backVerticalPoints = [
      new THREE.Vector3(-radius, 0, height / 2),
      new THREE.Vector3(-radius, 0, -height / 2)
    ]
    backVerticalGeometry.setFromPoints(backVerticalPoints)
    const backVertical = new THREE.Line(backVerticalGeometry, borderMaterial)
    group.add(backVertical)
  }

  // Function to add BOH lines to group
  const addBOHLines = (group: THREE.Group) => {
    const radius = GEOSTXR_CONFIG.CYLINDER.RADIUS
    const height = GEOSTXR_CONFIG.CYLINDER.HEIGHT

    // BOH Line material
    const bohMaterial = new THREE.LineBasicMaterial({
      color: 0xFF0000,
      linewidth: 3
    })

    // BOH Line 1: z=0 to z=15 (bottom to center) at 90°
    const line1Geometry = new THREE.BufferGeometry()
    const line1Points = [
      new THREE.Vector3(0, radius, 0),   // Bottom at 90°
      new THREE.Vector3(0, radius, height / 2) // Center at 90°
    ]
    line1Geometry.setFromPoints(line1Points)
    const bohLine1 = new THREE.Line(line1Geometry, bohMaterial)
    group.add(bohLine1)

    // BOH Line 2: z=15 to z=30 (center to top) at 90°
    const line2Geometry = new THREE.BufferGeometry()
    const line2Points = [
      new THREE.Vector3(0, radius, height / 2), // Center at 90°
      new THREE.Vector3(0, radius, height) // Top at 90°
    ]
    line2Geometry.setFromPoints(line2Points)
    const bohLine2 = new THREE.Line(line2Geometry, bohMaterial)
    group.add(bohLine2)
  }

  return (
    <div className={`test-cylinder-boh ${className}`}>
      <div 
        ref={mountRef} 
        className="w-full h-full"
        style={{ width: '100%', height: '100%' }}
      />
    </div>
  )
}
