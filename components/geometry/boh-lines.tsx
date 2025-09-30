'use client'

import React, { useRef, useEffect, useState } from 'react'
import * as THREE from 'three'
import { GEOSTXR_CONFIG } from '@/lib/config'

interface BOHLinesProps {
  className?: string
  onBOHChange?: (line1Angle: number, line2Angle: number) => void
}

export default function BOHLines({ className = '', onBOHChange }: BOHLinesProps) {
  const mountRef = useRef<HTMLDivElement>(null)
  const sceneRef = useRef<THREE.Scene | null>(null)
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null)
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null)
  const bohLine1Ref = useRef<THREE.Line | null>(null)
  const bohLine2Ref = useRef<THREE.Line | null>(null)
  const [line1Angle, setLine1Angle] = useState(90) // Default 90°
  const [line2Angle, setLine2Angle] = useState(90) // Default 90°

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
    container.appendChild(renderer.domElement)

    // Create BOH lines
    createBOHLines(scene)

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

  // Function to create BOH lines
  const createBOHLines = (scene: THREE.Scene) => {
    const radius = GEOSTXR_CONFIG.CYLINDER.RADIUS
    const height = GEOSTXR_CONFIG.CYLINDER.HEIGHT

    // BOH Line material - red color
    const bohMaterial = new THREE.LineBasicMaterial({
      color: GEOSTXR_CONFIG.BOH.LINE1.COLOR,
      linewidth: GEOSTXR_CONFIG.BOH.LINE1.WIDTH
    })

    // BOH Line 1: z=0 to z=15 (bottom to center) at 90°
    const line1Geometry = new THREE.BufferGeometry()
    const line1Points = [
      new THREE.Vector3(0, radius, 0),   // Bottom at 90°
      new THREE.Vector3(0, radius, height / 2) // Center at 90°
    ]
    line1Geometry.setFromPoints(line1Points)
    const bohLine1 = new THREE.Line(line1Geometry, bohMaterial)
    bohLine1Ref.current = bohLine1
    scene.add(bohLine1)

    // BOH Line 2: z=15 to z=30 (center to top) at 90°
    const line2Geometry = new THREE.BufferGeometry()
    const line2Points = [
      new THREE.Vector3(0, radius, height / 2), // Center at 90°
      new THREE.Vector3(0, radius, height) // Top at 90°
    ]
    line2Geometry.setFromPoints(line2Points)
    const bohLine2 = new THREE.Line(line2Geometry, bohMaterial)
    bohLine2Ref.current = bohLine2
    scene.add(bohLine2)
  }

  // Function to update BOH line positions based on angles
  const updateBOHLines = (angle1: number, angle2: number) => {
    if (!bohLine1Ref.current || !bohLine2Ref.current) return

    const radius = GEOSTXR_CONFIG.CYLINDER.RADIUS
    const height = GEOSTXR_CONFIG.CYLINDER.HEIGHT

    // Convert angles to radians
    const angle1Rad = (angle1 * Math.PI) / 180
    const angle2Rad = (angle2 * Math.PI) / 180

    // Update Line 1 (z=0 to z=15)
    const line1Points = [
      new THREE.Vector3(
        Math.cos(angle1Rad) * radius,
        Math.sin(angle1Rad) * radius,
        0
      ),
      new THREE.Vector3(
        Math.cos(angle1Rad) * radius,
        Math.sin(angle1Rad) * radius,
        height / 2
      )
    ]
    bohLine1Ref.current.geometry.setFromPoints(line1Points)

    // Update Line 2 (z=15 to z=30)
    const line2Points = [
      new THREE.Vector3(
        Math.cos(angle2Rad) * radius,
        Math.sin(angle2Rad) * radius,
        height / 2
      ),
      new THREE.Vector3(
        Math.cos(angle2Rad) * radius,
        Math.sin(angle2Rad) * radius,
        height
      )
    ]
    bohLine2Ref.current.geometry.setFromPoints(line2Points)
  }

  // Update lines when angles change
  useEffect(() => {
    updateBOHLines(line1Angle, line2Angle)
    onBOHChange?.(line1Angle, line2Angle)
  }, [line1Angle, line2Angle, onBOHChange])

  return (
    <div 
      ref={mountRef} 
      className={`boh-lines ${className}`}
      style={{ width: '100%', height: '100%' }}
    />
  )
}
