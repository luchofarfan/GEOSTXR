'use client'

import React, { useRef, useEffect, useState } from 'react'
import * as THREE from 'three'
import { GEOSTXR_CONFIG } from '@/lib/config'

interface FinalAlignedCylinderProps {
  className?: string
  line1Angle?: number
  line2Angle?: number
}

export default function FinalAlignedCylinder({ 
  className = '', 
  line1Angle = 90,
  line2Angle = 90
}: FinalAlignedCylinderProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [maskStyle, setMaskStyle] = useState<React.CSSProperties>({})
  const [isReady, setIsReady] = useState(false)
  const sceneRef = useRef<THREE.Scene | null>(null)
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null)
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null)
  const bohLine1Ref = useRef<THREE.Line | null>(null)
  const bohLine2Ref = useRef<THREE.Line | null>(null)

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

    return () => {
      if (videoRef.current && videoRef.current.srcObject) {
        const stream = videoRef.current.srcObject as MediaStream
        stream.getTracks().forEach(track => track.stop())
      }
    }
  }, [])

  // Initialize scene ONCE (no angle dependencies)
  useEffect(() => {
    if (!canvasRef.current || !containerRef.current) return
    if (sceneRef.current) return // Already initialized

    // Add a small delay to ensure container is fully rendered
    const timer = setTimeout(() => {
      const canvas = canvasRef.current
      const container = containerRef.current
      if (!canvas || !container) return

      const width = container.clientWidth
      const height = container.clientHeight

      // Wait for container to have valid dimensions
      if (width === 0 || height === 0) {
        console.log('Container has no dimensions yet, waiting...')
        return
      }

      console.log('Container dimensions:', { width, height })

    canvas.width = width
    canvas.height = height

    // Scene setup - store in refs for persistence
    const scene = new THREE.Scene()
    sceneRef.current = scene
    
    const camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000)
    cameraRef.current = camera
    
    const radius = GEOSTXR_CONFIG.CYLINDER.RADIUS
    const cylinderHeight = GEOSTXR_CONFIG.CYLINDER.HEIGHT
    
    // Calculate camera distance
    const fov = 75 * (Math.PI / 180)
    // Adjust for actual aspect ratio - use height as reference since cylinder is tall
    const aspectRatio = width / height
    let distance = (cylinderHeight / 2) / Math.tan(fov / 2)
    
    // Add more margin for different aspect ratios
    if (aspectRatio > 1) {
      // Landscape - need more distance
      distance *= 1.5
    } else {
      // Portrait - need less distance
      distance *= 1.3
    }
    
    // console.log(`Camera distance: ${distance.toFixed(2)}, aspect ratio: ${aspectRatio.toFixed(2)}`)
    
    camera.position.set(0, distance, 0)
    camera.lookAt(0, 0, 0)

    // Renderer - store in ref for persistence
    const renderer = new THREE.WebGLRenderer({ 
      canvas,
      alpha: true, 
      antialias: true 
    })
    rendererRef.current = renderer
    renderer.setSize(width, height)
    renderer.setClearColor(0x000000, 0)

    // Lighting
    scene.add(new THREE.AmbientLight(0x404040, 0.6))
    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8)
    directionalLight.position.set(1, 1, 1)
    scene.add(directionalLight)

    // Cylinder
    const cylinderGeometry = new THREE.CylinderGeometry(radius, radius, cylinderHeight, 32)
    cylinderGeometry.rotateX(Math.PI / 2)
    
    const cylinderMaterial = new THREE.MeshBasicMaterial({
      color: 0x0066CC,
      transparent: true,
      opacity: 0.7,
      side: THREE.DoubleSide
    })
    
    const cylinder = new THREE.Mesh(cylinderGeometry, cylinderMaterial)
    scene.add(cylinder)

    // Borders
    const borderMaterial = new THREE.LineBasicMaterial({ color: 0x000000, linewidth: 3 })
    
    const frontBorder = new THREE.Line(
      new THREE.BufferGeometry().setFromPoints([
        new THREE.Vector3(radius, 0, cylinderHeight / 2),
        new THREE.Vector3(radius, 0, -cylinderHeight / 2)
      ]),
      borderMaterial
    )
    scene.add(frontBorder)
    
    const backBorder = new THREE.Line(
      new THREE.BufferGeometry().setFromPoints([
        new THREE.Vector3(-radius, 0, cylinderHeight / 2),
        new THREE.Vector3(-radius, 0, -cylinderHeight / 2)
      ]),
      borderMaterial
    )
    scene.add(backBorder)

    // BOH Lines - using angles from props
    const bohMaterial = new THREE.LineBasicMaterial({ color: 0xFF0000, linewidth: 3 })
    
    // Convert angles to radians
    const angle1Rad = (line1Angle * Math.PI) / 180
    const angle2Rad = (line2Angle * Math.PI) / 180
    
    // Calculate positions on cylinder surface
    const x1 = radius * Math.cos(angle1Rad)
    const y1 = radius * Math.sin(angle1Rad)
    const x2 = radius * Math.cos(angle2Rad)
    const y2 = radius * Math.sin(angle2Rad)
    
    const bohLine1 = new THREE.Line(
      new THREE.BufferGeometry().setFromPoints([
        new THREE.Vector3(x1, y1, -cylinderHeight / 2), // Bottom
        new THREE.Vector3(x1, y1, 0) // Center
      ]),
      bohMaterial
    )
    bohLine1Ref.current = bohLine1
    scene.add(bohLine1)
    
    const bohLine2 = new THREE.Line(
      new THREE.BufferGeometry().setFromPoints([
        new THREE.Vector3(x2, y2, 0), // Center
        new THREE.Vector3(x2, y2, cylinderHeight / 2) // Top
      ]),
      bohMaterial
    )
    bohLine2Ref.current = bohLine2
    scene.add(bohLine2)
    
    console.log(`BOH angles initialized: Line1=${line1Angle}°, Line2=${line2Angle}°`)

    // Calculate mask position
    const corners = [
      new THREE.Vector3(-radius, 0, -cylinderHeight / 2),
      new THREE.Vector3(radius, 0, -cylinderHeight / 2),
      new THREE.Vector3(-radius, 0, cylinderHeight / 2),
      new THREE.Vector3(radius, 0, cylinderHeight / 2)
    ]

    const screenCorners = corners.map(corner => {
      const projected = corner.clone().project(camera)
      return {
        x: (projected.x + 1) * 50,
        y: (-projected.y + 1) * 50
      }
    })

    const minX = Math.min(...screenCorners.map(c => c.x))
    const maxX = Math.max(...screenCorners.map(c => c.x))
    const minY = Math.min(...screenCorners.map(c => c.y))
    const maxY = Math.max(...screenCorners.map(c => c.y))

    // Adjust mask to cover cylinder edges perfectly
    // Add margin to account for rounding and border thickness
    const marginY = 1.0 // 1% margin on top and bottom
    const marginX = 0.3 // 0.3% margin on left and right
    
    const adjustedMinY = Math.max(0, minY - marginY)
    const adjustedMaxY = Math.min(100, maxY + marginY)
    const adjustedMinX = Math.max(0, minX - marginX)
    const adjustedMaxX = Math.min(100, maxX + marginX)

    // Mask coordinates calculated and adjusted successfully
    // console.log('Mask coords:', { 
    //   left: adjustedMinX.toFixed(2), 
    //   right: (100 - adjustedMaxX).toFixed(2), 
    //   top: adjustedMinY.toFixed(2), 
    //   bottom: (100 - adjustedMaxY).toFixed(2)
    // })

    // Apply mask to video
    setMaskStyle({
      clipPath: `inset(${adjustedMinY}% ${100 - adjustedMaxX}% ${100 - adjustedMaxY}% ${adjustedMinX}%)`,
      WebkitClipPath: `inset(${adjustedMinY}% ${100 - adjustedMaxX}% ${100 - adjustedMaxY}% ${adjustedMinX}%)`
    })

    // Start animation loop
    let animationId: number
    const animate = () => {
      animationId = requestAnimationFrame(animate)
      renderer.render(scene, camera)
    }
    animate()

    // Mark as ready
    setIsReady(true)
    console.log('Cylinder rendering complete and mask applied')

    }, 200) // 200ms delay for more reliable rendering

    return () => {
      clearTimeout(timer)
      // Don't dispose scene/renderer on unmount - they're needed for updates
    }
  }, []) // NO dependencies - initialize only once
  
  // Separate effect to update BOH lines when angles change
  useEffect(() => {
    if (!bohLine1Ref.current || !bohLine2Ref.current || !sceneRef.current || !rendererRef.current || !cameraRef.current) return
    
    const radius = GEOSTXR_CONFIG.CYLINDER.RADIUS
    const cylinderHeight = GEOSTXR_CONFIG.CYLINDER.HEIGHT
    
    // Convert angles to radians
    const angle1Rad = (line1Angle * Math.PI) / 180
    const angle2Rad = (line2Angle * Math.PI) / 180
    
    // Calculate positions
    const x1 = radius * Math.cos(angle1Rad)
    const y1 = radius * Math.sin(angle1Rad)
    const x2 = radius * Math.cos(angle2Rad)
    const y2 = radius * Math.sin(angle2Rad)
    
    // Update BOH Line 1 geometry
    const bohLine1Geometry = new THREE.BufferGeometry().setFromPoints([
      new THREE.Vector3(x1, y1, -cylinderHeight / 2),
      new THREE.Vector3(x1, y1, 0)
    ])
    bohLine1Ref.current.geometry.dispose()
    bohLine1Ref.current.geometry = bohLine1Geometry
    
    // Update BOH Line 2 geometry
    const bohLine2Geometry = new THREE.BufferGeometry().setFromPoints([
      new THREE.Vector3(x2, y2, 0),
      new THREE.Vector3(x2, y2, cylinderHeight / 2)
    ])
    bohLine2Ref.current.geometry.dispose()
    bohLine2Ref.current.geometry = bohLine2Geometry
    
    console.log(`BOH angles updated: Line1=${line1Angle}°, Line2=${line2Angle}°`)
  }, [line1Angle, line2Angle]) // Update only when angles change

  return (
    <div 
      ref={containerRef} 
      className={`final-aligned-cylinder ${className}`}
      style={{
        position: 'relative',
        width: '100%',
        height: '100%',
        minHeight: '100vh'
      }}
    >
      {/* Camera feed with mask - only show when ready */}
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted
        className="absolute inset-0 w-full h-full object-cover"
        style={{
          ...maskStyle,
          opacity: isReady ? 1 : 0,
          transition: 'opacity 0.3s ease-in-out'
        }}
      />
      
      {/* Cylinder overlay */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full pointer-events-none"
      />
    </div>
  )
}
