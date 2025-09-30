'use client'

import React, { useRef, useEffect, useState } from 'react'
import * as THREE from 'three'
import { GEOSTXR_CONFIG } from '@/lib/config'

interface WebGLUnifiedCylinderProps {
  className?: string
  line1Angle?: number
  line2Angle?: number
}

export default function WebGLUnifiedCylinder({ 
  className = '', 
  line1Angle = 90,
  line2Angle = 90
}: WebGLUnifiedCylinderProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const videoRef = useRef<HTMLVideoElement>(null)
  const sceneRef = useRef<THREE.Scene | null>(null)
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null)
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null)
  const videoTextureRef = useRef<THREE.VideoTexture | null>(null)
  const bohLine1Ref = useRef<THREE.Line | null>(null)
  const bohLine2Ref = useRef<THREE.Line | null>(null)
  const [isReady, setIsReady] = useState(false)

  // Camera stream setup
  useEffect(() => {
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
          // Wait for video to be ready
          videoRef.current.onloadedmetadata = () => {
            videoRef.current?.play()
          }
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

  // Initialize Three.js scene ONCE
  useEffect(() => {
    if (!containerRef.current || !videoRef.current) return
    if (sceneRef.current) return // Already initialized

    const container = containerRef.current
    const video = videoRef.current
    
    const width = container.clientWidth
    const height = container.clientHeight

    if (width === 0 || height === 0) return

    console.log('=== WEBGL UNIFIED INITIALIZATION ===')
    console.log(`Container: ${width}×${height}`)

    // Scene
    const scene = new THREE.Scene()
    scene.background = new THREE.Color(0x000000)
    sceneRef.current = scene

    // Camera
    const camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000)
    const aspectRatio = width / height
    let distance = (GEOSTXR_CONFIG.CYLINDER.HEIGHT / 2) / Math.tan((75 * Math.PI / 180) / 2)
    distance *= aspectRatio > 1 ? 1.5 : 1.3
    camera.position.set(0, distance, 0)
    camera.lookAt(0, 0, 0)
    cameraRef.current = camera

    // Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true })
    renderer.setSize(width, height)
    renderer.setClearColor(0x000000)
    container.appendChild(renderer.domElement)
    rendererRef.current = renderer

    // Lighting
    scene.add(new THREE.AmbientLight(0x404040, 0.8))
    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.6)
    directionalLight.position.set(1, 1, 1)
    scene.add(directionalLight)

    // Create video texture
    const videoTexture = new THREE.VideoTexture(video)
    videoTexture.minFilter = THREE.LinearFilter
    videoTexture.magFilter = THREE.LinearFilter
    videoTextureRef.current = videoTexture

    // Create background plane with video texture
    const planeGeometry = new THREE.PlaneGeometry(100, 100)
    const planeMaterial = new THREE.MeshBasicMaterial({ 
      map: videoTexture,
      side: THREE.DoubleSide
    })
    const videoPlane = new THREE.Mesh(planeGeometry, planeMaterial)
    videoPlane.position.set(0, 0, -20) // Behind cylinder
    scene.add(videoPlane)

    // Create cylinder
    const radius = GEOSTXR_CONFIG.CYLINDER.RADIUS
    const cylinderHeight = GEOSTXR_CONFIG.CYLINDER.HEIGHT

    const cylinderGeometry = new THREE.CylinderGeometry(radius, radius, cylinderHeight, 32)
    cylinderGeometry.rotateX(Math.PI / 2) // Align with Z-axis

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
    
    const angle1Rad = (line1Angle * Math.PI) / 180
    const angle2Rad = (line2Angle * Math.PI) / 180
    
    const x1 = radius * Math.cos(angle1Rad)
    const y1 = radius * Math.sin(angle1Rad)
    const x2 = radius * Math.cos(angle2Rad)
    const y2 = radius * Math.sin(angle2Rad)
    
    const bohLine1 = new THREE.Line(
      new THREE.BufferGeometry().setFromPoints([
        new THREE.Vector3(x1, y1, -cylinderHeight / 2),
        new THREE.Vector3(x1, y1, 0)
      ]),
      bohMaterial
    )
    bohLine1Ref.current = bohLine1
    scene.add(bohLine1)
    
    const bohLine2 = new THREE.Line(
      new THREE.BufferGeometry().setFromPoints([
        new THREE.Vector3(x2, y2, 0),
        new THREE.Vector3(x2, y2, cylinderHeight / 2)
      ]),
      bohMaterial
    )
    bohLine2Ref.current = bohLine2
    scene.add(bohLine2)

    console.log('WebGL unified scene initialized')
    
    // Animation loop
    let animationId: number
    const animate = () => {
      animationId = requestAnimationFrame(animate)
      
      // Update video texture
      if (videoTextureRef.current) {
        videoTextureRef.current.needsUpdate = true
      }
      
      renderer.render(scene, camera)
    }
    animate()

    setIsReady(true)

    // Cleanup
    return () => {
      if (animationId) {
        cancelAnimationFrame(animationId)
      }
      if (renderer.domElement && container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement)
      }
      renderer.dispose()
      scene.clear()
    }
  }, [])

  // Update BOH lines when angles change
  useEffect(() => {
    if (!bohLine1Ref.current || !bohLine2Ref.current) return
    
    const radius = GEOSTXR_CONFIG.CYLINDER.RADIUS
    const cylinderHeight = GEOSTXR_CONFIG.CYLINDER.HEIGHT
    
    const angle1Rad = (line1Angle * Math.PI) / 180
    const angle2Rad = (line2Angle * Math.PI) / 180
    
    const x1 = radius * Math.cos(angle1Rad)
    const y1 = radius * Math.sin(angle1Rad)
    const x2 = radius * Math.cos(angle2Rad)
    const y2 = radius * Math.sin(angle2Rad)
    
    // Update BOH Line 1
    const bohLine1Geometry = new THREE.BufferGeometry().setFromPoints([
      new THREE.Vector3(x1, y1, -cylinderHeight / 2),
      new THREE.Vector3(x1, y1, 0)
    ])
    bohLine1Ref.current.geometry.dispose()
    bohLine1Ref.current.geometry = bohLine1Geometry
    
    // Update BOH Line 2
    const bohLine2Geometry = new THREE.BufferGeometry().setFromPoints([
      new THREE.Vector3(x2, y2, 0),
      new THREE.Vector3(x2, y2, cylinderHeight / 2)
    ])
    bohLine2Ref.current.geometry.dispose()
    bohLine2Ref.current.geometry = bohLine2Geometry
    
    console.log(`BOH angles updated: Line1=${line1Angle}°, Line2=${line2Angle}°`)
  }, [line1Angle, line2Angle])

  return (
    <div 
      ref={containerRef} 
      className={`webgl-unified-cylinder ${className}`}
      style={{
        position: 'relative',
        width: '100%',
        height: '100%',
        minHeight: '100vh'
      }}
    >
      {/* Hidden video element (used as texture) */}
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted
        style={{ display: 'none' }}
      />
      
      {/* Three.js will render here */}
    </div>
  )
}
