'use client'

import React, { useRef, useEffect, useState } from 'react'
import * as THREE from 'three'
import { GEOSTXR_CONFIG } from '@/lib/config'

interface CameraTextureCylinderProps {
  className?: string
  videoElement?: HTMLVideoElement | null
}

export default function CameraTextureCylinder({ className = '', videoElement }: CameraTextureCylinderProps) {
  const mountRef = useRef<HTMLDivElement>(null)
  const [isInitialized, setIsInitialized] = useState(false)

  useEffect(() => {
    if (!mountRef.current || isInitialized) return

    const container = mountRef.current
    const width = container.clientWidth || 800
    const height = container.clientHeight || 600

    console.log('Creating camera texture cylinder scene...', { width, height })

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

    // Create hollow cylinder
    const radius = GEOSTXR_CONFIG.CYLINDER.RADIUS
    const cylinderHeight = GEOSTXR_CONFIG.CYLINDER.HEIGHT

    // Create cylinder wall
    const cylinderGeometry = new THREE.CylinderGeometry(radius, radius, cylinderHeight, 32)
    cylinderGeometry.rotateX(Math.PI / 2)

    const cylinderMaterial = new THREE.MeshPhongMaterial({
      color: 0x0066CC,
      transparent: true,
      opacity: 0.3,
      side: THREE.DoubleSide,
      wireframe: false
    })

    const cylinder = new THREE.Mesh(cylinderGeometry, cylinderMaterial)
    cylinderGroup.add(cylinder)

    // Create camera feed texture
    let cameraTexture: THREE.VideoTexture | null = null
    if (videoElement) {
      cameraTexture = new THREE.VideoTexture(videoElement)
      cameraTexture.minFilter = THREE.LinearFilter
      cameraTexture.magFilter = THREE.LinearFilter
    }

    // Create circular plane for camera feed
    const cameraFeedGeometry = new THREE.CircleGeometry(radius * 0.9, 32)
    const cameraFeedMaterial = new THREE.MeshBasicMaterial({
      map: cameraTexture,
      transparent: true,
      opacity: 0.9,
      side: THREE.DoubleSide
    })
    
    const cameraFeed = new THREE.Mesh(cameraFeedGeometry, cameraFeedMaterial)
    cameraFeed.position.set(0, 0, 0)
    cameraFeed.rotation.x = Math.PI / 2
    cylinderGroup.add(cameraFeed)

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

    console.log('Camera texture cylinder scene created successfully')

    // Animation loop
    let animationId: number
    const animate = () => {
      animationId = requestAnimationFrame(animate)
      if (cameraTexture) {
        cameraTexture.needsUpdate = true
      }
      renderer.render(scene, camera)
    }
    animate()

    // Mark as initialized
    setIsInitialized(true)

    // Cleanup function
    return () => {
      console.log('Cleaning up camera texture cylinder scene...')
      if (animationId) {
        cancelAnimationFrame(animationId)
      }
      if (container && renderer.domElement && container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement)
      }
      renderer.dispose()
      scene.clear()
    }
  }, [isInitialized, videoElement])

  return (
    <div className={`camera-texture-cylinder ${className}`}>
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
