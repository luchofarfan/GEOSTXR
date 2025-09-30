'use client'

import React, { useRef, useEffect, useState } from 'react'
import * as THREE from 'three'
import { GEOSTXR_CONFIG } from '@/lib/config'

interface FinalAlignedCylinderProps {
  className?: string
}

export default function FinalAlignedCylinder({ className = '' }: FinalAlignedCylinderProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [maskStyle, setMaskStyle] = useState<React.CSSProperties>({})

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

  useEffect(() => {
    if (!canvasRef.current || !containerRef.current) return

    const canvas = canvasRef.current
    const container = containerRef.current
    const width = container.clientWidth
    const height = container.clientHeight

    // Wait for container to have valid dimensions
    if (width === 0 || height === 0) {
      console.log('Container has no dimensions yet, waiting...')
      return
    }

    // console.log('Container dimensions:', { width, height })

    canvas.width = width
    canvas.height = height

    // Scene setup
    const scene = new THREE.Scene()
    const camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000)
    
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

    // Renderer
    const renderer = new THREE.WebGLRenderer({ 
      canvas,
      alpha: true, 
      antialias: true 
    })
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

    // BOH Lines
    const bohMaterial = new THREE.LineBasicMaterial({ color: 0xFF0000, linewidth: 3 })
    
    const bohLine1 = new THREE.Line(
      new THREE.BufferGeometry().setFromPoints([
        new THREE.Vector3(0, radius, -cylinderHeight / 2),
        new THREE.Vector3(0, radius, 0)
      ]),
      bohMaterial
    )
    scene.add(bohLine1)
    
    const bohLine2 = new THREE.Line(
      new THREE.BufferGeometry().setFromPoints([
        new THREE.Vector3(0, radius, 0),
        new THREE.Vector3(0, radius, cylinderHeight / 2)
      ]),
      bohMaterial
    )
    scene.add(bohLine2)

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

    // Render
    renderer.render(scene, camera)

    // Cleanup
    return () => {
      renderer.dispose()
      scene.clear()
    }
  }, [])

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
      {/* Camera feed with mask */}
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted
        className="absolute inset-0 w-full h-full object-cover"
        style={maskStyle}
      />
      
      {/* Cylinder overlay */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full pointer-events-none"
      />
    </div>
  )
}
