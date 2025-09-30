'use client'

import React, { useRef, useEffect, useState } from 'react'
import * as THREE from 'three'
import { GEOSTXR_CONFIG } from '@/lib/config'

interface SynchronizedCylinderProps {
  className?: string
}

export default function SynchronizedCylinder({ className = '' }: SynchronizedCylinderProps) {
  const mountRef = useRef<HTMLDivElement>(null)
  const videoRef = useRef<HTMLVideoElement>(null)
  const [maskCoords, setMaskCoords] = useState({ top: 15, right: 45, bottom: 15, left: 45 })
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
    // Calculate distance to fit cylinder in view (use cylinder height as reference)
    const fov = 75 * (Math.PI / 180) // Convert to radians
    const distance = (cylinderHeight / 2) / Math.tan(fov / 2) * 1.2 // 1.2 = 20% margin
    
    console.log(`Calculated camera distance: ${distance.toFixed(2)}`)
    
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

    // Calculate cylinder corners in screen space
    const calculateMaskCoords = () => {
      console.log('=== CALCULATING MASK COORDS ===')
      console.log(`Camera position: x=${camera.position.x}, y=${camera.position.y}, z=${camera.position.z}`)
      console.log(`Cylinder radius: ${radius}`)
      console.log(`Cylinder height: ${cylinderHeight}`)
      
      // Define the 4 corners of the cylinder in 3D space (viewed from Y-axis)
      const corners = [
        new THREE.Vector3(-radius, 0, -cylinderHeight / 2), // Bottom left
        new THREE.Vector3(radius, 0, -cylinderHeight / 2),  // Bottom right
        new THREE.Vector3(-radius, 0, cylinderHeight / 2),  // Top left
        new THREE.Vector3(radius, 0, cylinderHeight / 2)     // Top right
      ]

      console.log('3D corners:')
      corners.forEach((c, i) => {
        console.log(`  Corner ${i}: x=${c.x.toFixed(3)}, y=${c.y.toFixed(3)}, z=${c.z.toFixed(3)}`)
      })

      // Project corners to screen space
      const screenCorners = corners.map((corner, index) => {
        const projected = corner.clone().project(camera)
        console.log(`  Corner ${index} projected (NDC): x=${projected.x.toFixed(4)}, y=${projected.y.toFixed(4)}, z=${projected.z.toFixed(4)}`)
        
        // Convert from normalized device coordinates (-1 to 1) to screen percentages (0 to 100)
        const x = (projected.x + 1) * 50 // 0 to 100
        const y = (-projected.y + 1) * 50 // 0 to 100 (inverted Y)
        console.log(`  Corner ${index} screen: x=${x.toFixed(2)}%, y=${y.toFixed(2)}%`)
        return { x, y }
      })

      // Find bounding box
      const minX = Math.min(...screenCorners.map(c => c.x))
      const maxX = Math.max(...screenCorners.map(c => c.x))
      const minY = Math.min(...screenCorners.map(c => c.y))
      const maxY = Math.max(...screenCorners.map(c => c.y))

      console.log(`Bounding box: minX=${minX.toFixed(2)}%, maxX=${maxX.toFixed(2)}%, minY=${minY.toFixed(2)}%, maxY=${maxY.toFixed(2)}%`)

      const left = minX
      const right = 100 - maxX
      const top = minY
      const bottom = 100 - maxY

      console.log(`Final mask coords: top=${top.toFixed(2)}%, right=${right.toFixed(2)}%, bottom=${bottom.toFixed(2)}%, left=${left.toFixed(2)}%`)
      console.log('=================================')

      setMaskCoords({ top, right, bottom, left })
    }

    // Calculate mask coords after a short delay to ensure everything is set up
    setTimeout(() => {
      calculateMaskCoords()
    }, 100)

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

  console.log(`Rendering with mask coords: top=${maskCoords.top.toFixed(2)}%, right=${maskCoords.right.toFixed(2)}%, bottom=${maskCoords.bottom.toFixed(2)}%, left=${maskCoords.left.toFixed(2)}%`)

  return (
    <div className={`synchronized-cylinder ${className}`}>
      <div className="w-full h-full relative">
        {/* Camera Video Container with CSS Mask - dynamically calculated */}
        <div 
          className="absolute inset-0"
          style={{
            clipPath: `inset(${maskCoords.top}% ${maskCoords.right}% ${maskCoords.bottom}% ${maskCoords.left}%)`,
            WebkitClipPath: `inset(${maskCoords.top}% ${maskCoords.right}% ${maskCoords.bottom}% ${maskCoords.left}%)`
          }}
        >
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className="w-full h-full"
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              objectFit: 'cover'
            }}
          />
        </div>
        
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

        {/* Debug overlay to show mask boundaries */}
        <div 
          className="absolute pointer-events-none border-4 border-red-500 bg-red-500/20"
          style={{
            top: `${maskCoords.top}%`,
            right: `${maskCoords.right}%`,
            bottom: `${maskCoords.bottom}%`,
            left: `${maskCoords.left}%`
          }}
        >
          <div className="absolute top-0 left-0 bg-red-500 text-white text-xs p-1">
            Mask: {maskCoords.left.toFixed(1)}%, {maskCoords.top.toFixed(1)}%
          </div>
        </div>
      </div>
    </div>
  )
}
