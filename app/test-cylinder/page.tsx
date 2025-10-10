'use client'

import React, { useEffect, useRef } from 'react'
import * as THREE from 'three'
import { GEOSTXR_CONFIG } from '@/lib/config'

export default function TestCylinderPage() {
  const containerRef = useRef<HTMLDivElement>(null)
  const sceneRef = useRef<THREE.Scene | null>(null)
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null)
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null)

  useEffect(() => {
    if (!containerRef.current) return

    const container = containerRef.current
    const width = container.clientWidth
    const height = container.clientHeight

    console.log('🧪 TEST CYLINDER: Starting minimal test')
    console.log(`Container size: ${width}x${height}`)

    // Scene
    const scene = new THREE.Scene()
    scene.background = new THREE.Color(0x222222)
    sceneRef.current = scene

    // Camera
    const camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000)
    camera.position.set(0, 30, 15)
    camera.lookAt(0, 0, 15)
    cameraRef.current = camera

    // Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true })
    renderer.setSize(width, height)
    renderer.domElement.style.display = 'block'
    container.appendChild(renderer.domElement)
    rendererRef.current = renderer

    // Get cylinder dimensions from config
    const cylinderRadius = GEOSTXR_CONFIG.CYLINDER.RADIUS // 3.175 cm
    const cylinderHeight = GEOSTXR_CONFIG.CYLINDER.HEIGHT // 30 cm

    console.log(`🧪 CYLINDER CONFIG:`)
    console.log(`   Radius: ${cylinderRadius} cm`)
    console.log(`   Height: ${cylinderHeight} cm`)

    // Create cylinder wireframe
    const cylinderGeometry = new THREE.CylinderGeometry(cylinderRadius, cylinderRadius, cylinderHeight, 32)
    const cylinderMaterial = new THREE.MeshBasicMaterial({ 
      color: 0x0066CC, 
      wireframe: true,
      transparent: true,
      opacity: 0.5
    })
    const cylinder = new THREE.Mesh(cylinderGeometry, cylinderMaterial)
    cylinder.position.set(0, 0, cylinderHeight / 2)
    cylinder.rotateX(Math.PI / 2)
    scene.add(cylinder)

    console.log('🧪 Cylinder created with radius:', cylinderRadius, 'cm')

    // Create test points - guaranteed to be on cylinder surface
    const testPoints = [
      { x: cylinderRadius, y: 0, z: 15 }, // Front center
      { x: 0, y: cylinderRadius, z: 15 }, // Right side
      { x: -cylinderRadius, y: 0, z: 15 } // Back center
    ]

    testPoints.forEach((point, index) => {
      const geometry = new THREE.SphereGeometry(0.2, 16, 16)
      const material = new THREE.MeshBasicMaterial({ color: 0xFF0000 })
      const sphere = new THREE.Mesh(geometry, material)
      sphere.position.set(point.x, point.y, point.z)
      scene.add(sphere)

      // Verify radius
      const actualRadius = Math.sqrt(point.x * point.x + point.y * point.y)
      console.log(`🧪 Point ${index + 1}: (${point.x}, ${point.y}, ${point.z}) - Radius: ${actualRadius} cm`)
    })

    // Create test ellipse - circle at z=15 with correct radius
    const ellipsePoints = []
    const numPoints = 64
    for (let i = 0; i < numPoints; i++) {
      const theta = (i / numPoints) * 2 * Math.PI
      const x = cylinderRadius * Math.cos(theta)
      const y = cylinderRadius * Math.sin(theta)
      const z = 15
      ellipsePoints.push(new THREE.Vector3(x, y, z))
    }

    const ellipseGeometry = new THREE.BufferGeometry().setFromPoints(ellipsePoints)
    const ellipseMaterial = new THREE.LineBasicMaterial({ color: 0x00FF00, linewidth: 2 })
    const ellipse = new THREE.Line(ellipseGeometry, ellipseMaterial)
    scene.add(ellipse)

    console.log('🧪 Ellipse created with radius:', cylinderRadius, 'cm')

    // Animation loop
    const animate = () => {
      requestAnimationFrame(animate)
      renderer.render(scene, camera)
    }
    animate()

    // Cleanup
    return () => {
      if (renderer.domElement && container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement)
      }
      renderer.dispose()
      scene.clear()
    }
  }, [])

  return (
    <div className="flex h-screen bg-black">
      {/* Main test area */}
      <div className="flex-1 relative">
        <div 
          ref={containerRef} 
          className="w-full h-full"
          style={{ border: '2px solid red' }}
        />
        
        {/* Status overlay */}
        <div className="absolute top-4 left-4 bg-black bg-opacity-75 text-white p-4 rounded">
          <h2 className="text-lg font-bold mb-2">🧪 Test Cylinder</h2>
          <p>Cilindro: Radio {GEOSTXR_CONFIG.CYLINDER.RADIUS} cm</p>
          <p>Altura: {GEOSTXR_CONFIG.CYLINDER.HEIGHT} cm</p>
          <p>Puntos rojos: En superficie</p>
          <p>Elipse verde: Radio correcto</p>
          <p className="mt-2 text-yellow-300">
            Verifica en consola los logs
          </p>
        </div>
      </div>

      {/* Instructions */}
      <div className="w-80 bg-gray-800 text-white p-4">
        <h3 className="text-lg font-bold mb-4">🧪 Test Instructions</h3>
        <div className="space-y-2 text-sm">
          <p><strong>Cilindro azul:</strong> Wireframe del cilindro</p>
          <p><strong>Puntos rojos:</strong> En la superficie exacta</p>
          <p><strong>Elipse verde:</strong> Círculo en z=15</p>
          <p><strong>Verifica:</strong></p>
          <ul className="ml-4 list-disc">
            <li>¿Los puntos rojos están en la superficie?</li>
            <li>¿La elipse verde está en la superficie?</li>
            <li>¿El radio se ve correcto?</li>
          </ul>
          <p className="mt-4 text-yellow-300">
            Abre la consola para ver los logs detallados
          </p>
        </div>
      </div>
    </div>
  )
}
