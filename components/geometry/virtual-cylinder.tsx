'use client'

import React, { useRef, useEffect } from 'react'
import * as THREE from 'three'
import { GEOSTXR_CONFIG } from '@/lib/config'

interface VirtualCylinderProps {
  width: number
  height: number
  className?: string
}

export const VirtualCylinder: React.FC<VirtualCylinderProps> = ({ 
  width, 
  height, 
  className = '' 
}) => {
  const mountRef = useRef<HTMLDivElement>(null)
  const sceneRef = useRef<THREE.Scene>()
  const rendererRef = useRef<THREE.WebGLRenderer>()
  const cameraRef = useRef<THREE.PerspectiveCamera>()
  const cylinderRef = useRef<THREE.Mesh>()

  useEffect(() => {
    if (!mountRef.current) return

    // Scene setup
    const scene = new THREE.Scene()
    sceneRef.current = scene

    // Camera setup - positioned at (0, 50, 15) looking at center of cylinder
    const camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000)
    camera.position.set(0, 50, 15) // Position at (0, 50, 15) for better view
    camera.lookAt(0, 0, 15) // Look at center of cylinder (z=15)
    cameraRef.current = camera

    // Renderer setup
    const renderer = new THREE.WebGLRenderer({ 
      alpha: true, 
      antialias: true 
    })
    renderer.setSize(width, height)
    renderer.setClearColor(0x000000, 0) // Transparent background
    rendererRef.current = renderer
    mountRef.current.appendChild(renderer.domElement)

    // Cylinder geometry with exact dimensions
    const cylinderGeometry = new THREE.CylinderGeometry(
      GEOSTXR_CONFIG.CYLINDER.RADIUS, // radiusTop
      GEOSTXR_CONFIG.CYLINDER.RADIUS, // radiusBottom  
      GEOSTXR_CONFIG.CYLINDER.HEIGHT, // height
      32, // radialSegments
      1,  // heightSegments
      true // openEnded
    )

    // Rotate cylinder to align with Z-axis (default is Y-axis)
    cylinderGeometry.rotateX(Math.PI / 2)

    // Cylinder material - translucent with better contrast
    const cylinderMaterial = new THREE.MeshPhongMaterial({
      color: 0x0066CC, // Darker blue for better contrast
      transparent: true,
      opacity: 0.3, // 30% opacity for better visibility over camera feed
      side: THREE.DoubleSide,
      wireframe: false
    })

    // Create cylinder group to keep cylinder and borders together
    const cylinderGroup = new THREE.Group()
    cylinderGroup.position.set(0, 0, 15) // Centered at z=15
    cylinderGroup.scale.set(3, 3, 3) // Scale to 3/4 of scene
    
    // Create cylinder mesh
    const cylinder = new THREE.Mesh(cylinderGeometry, cylinderMaterial)
    cylinder.position.set(0, 0, 0) // Centered
    cylinderRef.current = cylinder
    cylinderGroup.add(cylinder)

    // Add highlighted borders to the same group
    addHighlightedBorders(cylinderGroup)
    
    // Add the group to the scene
    scene.add(cylinderGroup)

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
      if (mountRef.current && renderer.domElement) {
        mountRef.current.removeChild(renderer.domElement)
      }
      renderer.dispose()
      cylinderGeometry.dispose()
      cylinderMaterial.dispose()
    }
  }, [width, height])

  // Function to add highlighted borders at 0° and 180°
  const addHighlightedBorders = (group: THREE.Group) => {
    const radius = GEOSTXR_CONFIG.CYLINDER.RADIUS
    const height = GEOSTXR_CONFIG.CYLINDER.HEIGHT

    // Border material - thick black lines for better contrast
    const borderMaterial = new THREE.LineBasicMaterial({
      color: 0x000000,
      linewidth: 3
    })

    // 0° border (front)
    const frontBorderGeometry = new THREE.BufferGeometry()
    const frontBorderPoints = []
    for (let i = 0; i <= 32; i++) {
      const angle = (i / 32) * Math.PI * 2
      const x = Math.cos(angle) * radius
      const y = Math.sin(angle) * radius
      frontBorderPoints.push(new THREE.Vector3(x, y, height / 2))
    }
    frontBorderGeometry.setFromPoints(frontBorderPoints)
    const frontBorder = new THREE.Line(frontBorderGeometry, borderMaterial)
    group.add(frontBorder)

    // 180° border (back)
    const backBorderGeometry = new THREE.BufferGeometry()
    const backBorderPoints = []
    for (let i = 0; i <= 32; i++) {
      const angle = (i / 32) * Math.PI * 2
      const x = Math.cos(angle) * radius
      const y = Math.sin(angle) * radius
      backBorderPoints.push(new THREE.Vector3(x, y, -height / 2))
    }
    backBorderGeometry.setFromPoints(backBorderPoints)
    const backBorder = new THREE.Line(backBorderGeometry, borderMaterial)
    group.add(backBorder)

    // Vertical lines at 0° and 180° for better visibility
    const verticalLineGeometry = new THREE.BufferGeometry()
    const verticalLinePoints = [
      new THREE.Vector3(radius, 0, height / 2),   // Top front
      new THREE.Vector3(radius, 0, -height / 2),   // Bottom front
      new THREE.Vector3(-radius, 0, height / 2),  // Top back
      new THREE.Vector3(-radius, 0, -height / 2)   // Bottom back
    ]
    verticalLineGeometry.setFromPoints(verticalLinePoints)
    const verticalLines = new THREE.Line(verticalLineGeometry, borderMaterial)
    group.add(verticalLines)
  }

  return (
    <div 
      ref={mountRef} 
      className={`virtual-cylinder ${className}`}
      style={{ 
        width: width, 
        height: height,
        position: 'relative',
        zIndex: 10
      }}
    />
  )
}

export default VirtualCylinder
