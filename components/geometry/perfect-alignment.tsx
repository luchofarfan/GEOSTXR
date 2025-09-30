'use client'

import React, { useRef, useEffect, useState } from 'react'
import * as THREE from 'three'
import { GEOSTXR_CONFIG } from '@/lib/config'

interface PerfectAlignmentProps {
  className?: string
}

export default function PerfectAlignment({ className = '' }: PerfectAlignmentProps) {
  const mountRef = useRef<HTMLDivElement>(null)
  const videoRef = useRef<HTMLVideoElement>(null)
  const [dimensions, setDimensions] = useState({ width: 800, height: 600 })

  useEffect(() => {
    // Get camera stream
    const getCameraStream = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: {
            width: { ideal: 1920 },
            height: { ideal: 1080 },
            facingMode: 'environment'
          }
        })
        
        if (videoRef.current) {
          videoRef.current.srcObject = stream
        }
      } catch (err) {
        console.error('Error accessing camera:', err)
      }
    }

    getCameraStream()

    // Cleanup
    return () => {
      if (videoRef.current && videoRef.current.srcObject) {
        const stream = videoRef.current.srcObject as MediaStream
        stream.getTracks().forEach(track => track.stop())
      }
    }
  }, [])

  useEffect(() => {
    // Update dimensions when container size changes
    const updateDimensions = () => {
      if (mountRef.current) {
        const rect = mountRef.current.getBoundingClientRect()
        setDimensions({
          width: rect.width,
          height: rect.height
        })
      }
    }

    updateDimensions()
    window.addEventListener('resize', updateDimensions)
    
    return () => window.removeEventListener('resize', updateDimensions)
  }, [])

  useEffect(() => {
    if (!mountRef.current) return

    const container = mountRef.current
    const width = dimensions.width
    const height = dimensions.height

    // Scene
    const scene = new THREE.Scene()
    scene.background = new THREE.Color(0x000000)

    // Camera - positioned to view cylinder from Y axis (lateral view)
    const camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000)
    
    // Calculate exact camera position to center the cylinder
    const radius = GEOSTXR_CONFIG.CYLINDER.RADIUS
    const cylinderHeight = GEOSTXR_CONFIG.CYLINDER.HEIGHT
    
    // Camera positioned to see the cylinder from the side (Y-axis view)
    // Distance calculated to fit cylinder in view
    const distance = Math.max(radius * 2, cylinderHeight * 0.6)
    camera.position.set(0, distance, 0) // Y-axis view
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

    // Create cylinder
    const cylinderGeometry = new THREE.CylinderGeometry(radius, radius, cylinderHeight, 32)
    // Rotate to align with Z-axis (cylinder axis = Z-axis)
    cylinderGeometry.rotateX(Math.PI / 2)

    const cylinderMaterial = new THREE.MeshBasicMaterial({
      color: 0x0066CC,
      transparent: true,
      opacity: 0.7,
      side: THREE.DoubleSide,
      wireframe: false
    })

    const cylinder = new THREE.Mesh(cylinderGeometry, cylinderMaterial)
    cylinder.position.set(0, 0, 0) // Center at origin
    scene.add(cylinder)

    // Add borders
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
    scene.add(frontLine)

    // Back border (180°)
    const backGeometry = new THREE.BufferGeometry()
    const backPoints = [
      new THREE.Vector3(-radius, 0, cylinderHeight / 2),
      new THREE.Vector3(-radius, 0, -cylinderHeight / 2)
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

    // Animation loop
    let animationId: number
    const animate = () => {
      animationId = requestAnimationFrame(animate)
      renderer.render(scene, camera)
    }
    animate()

    // Cleanup function
    return () => {
      if (animationId) {
        cancelAnimationFrame(animationId)
      }
      if (container && renderer.domElement && container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement)
      }
      renderer.dispose()
      scene.clear()
    }
  }, [dimensions])

  // Calculate mask dimensions to match cylinder
  // Cylinder: 6.35cm wide (X-axis) × 30cm tall (Z-axis)
  const cylinderWidth = 6.35 // cm
  const cylinderHeight = 30 // cm
  const aspectRatio = cylinderWidth / cylinderHeight // 0.2117
  
  // The mask should be:
  // - Vertical (matching cylinder height in Z-axis)
  // - Narrow (matching cylinder width in X-axis)
  // - Centered on screen
  
  // Calculate percentage of screen the cylinder should occupy
  // Cylinder should occupy 70% of screen height
  const screenHeightPercent = 70 // 70% of screen height
  const screenWidthPercent = screenHeightPercent * aspectRatio // Calculate width to maintain aspect ratio
  
  // Calculate inset values to center the mask
  const leftRightInset = (100 - screenWidthPercent) / 2
  const topBottomInset = (100 - screenHeightPercent) / 2

  return (
    <div className={`perfect-alignment ${className}`}>
      <div className="w-full h-full relative">
        {/* Camera Video with CSS Mask */}
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          className="w-full h-full object-cover"
          style={{
            clipPath: `inset(${topBottomInset}% ${leftRightInset}% ${topBottomInset}% ${leftRightInset}%)`,
            WebkitClipPath: `inset(${topBottomInset}% ${leftRightInset}% ${topBottomInset}% ${leftRightInset}%)`
          }}
        />
        
        {/* Virtual Cylinder Overlay */}
        <div className="absolute inset-0">
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
      </div>
    </div>
  )
}
