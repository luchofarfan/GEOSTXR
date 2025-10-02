'use client'

import { useEffect, useRef } from 'react'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import type { DrillHole } from '@/types/geostxr-data'

interface DrillHoleViewer3DProps {
  drillHole: DrillHole
}

export function DrillHoleViewer3D({ drillHole }: DrillHoleViewer3DProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const sceneRef = useRef<THREE.Scene | null>(null)

  useEffect(() => {
    if (!containerRef.current || sceneRef.current) return

    const container = containerRef.current
    const width = container.clientWidth
    const height = container.clientHeight

    // Scene
    const scene = new THREE.Scene()
    scene.background = new THREE.Color(0x0a0f1e)
    sceneRef.current = scene

    // Camera - adjusted for scale
    const camera = new THREE.PerspectiveCamera(60, width / height, 1, 100000)
    camera.position.set(5000, 5000, 5000)
    camera.lookAt(0, 0, 0)

    // Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true })
    renderer.setSize(width, height)
    container.appendChild(renderer.domElement)

    // Controls
    const controls = new OrbitControls(camera, renderer.domElement)
    controls.enableDamping = true
    controls.dampingFactor = 0.05

    // Lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.7)
    scene.add(ambientLight)
    
    const directionalLight = new THREE.DirectionalLight(0xffffff, 1.0)
    directionalLight.position.set(1000, 1000, 1000)
    scene.add(directionalLight)
    
    const directionalLight2 = new THREE.DirectionalLight(0xffffff, 0.5)
    directionalLight2.position.set(-1000, -1000, -1000)
    scene.add(directionalLight2)

    // Drill hole orientation
    const holeAzimuthRad = (drillHole.info.azimuth * Math.PI) / 180
    const holeDipRad = (drillHole.info.dip * Math.PI) / 180
    
    // Function to calculate position along drill hole trajectory
    // Sistema de coordenadas:
    // Geológico: X=Este, Y=Norte, Z=Elevación
    // Three.js: X=Este, Y=Elevación, Z=-Norte (Z+ hacia el sur)
    function calculatePositionAlongHole(depthAlongHole: number) {
      // Calculate 3D position from collar following azimuth and dip
      // Azimuth: 0° = Norte, 90° = Este
      // Dip: negativo = hacia abajo
      
      const horizontalDistance = depthAlongHole * Math.cos(holeDipRad)
      const verticalDistance = depthAlongHole * Math.sin(holeDipRad) // Negativo para dip negativo
      
      // Componentes geológicas
      const east = horizontalDistance * Math.sin(holeAzimuthRad)
      const north = horizontalDistance * Math.cos(holeAzimuthRad)
      const elevation = verticalDistance
      
      // Mapear a Three.js
      return {
        x: east,
        y: elevation,  // Z geológico → Y en Three.js
        z: -north  // Y geológico → -Z en Three.js (invertido)
      }
    }
    
    // Draw drill hole trajectory
    const trajectoryPoints = []
    const totalDepthCm = drillHole.totalDepth * 100
    for (let d = 0; d <= totalDepthCm; d += 1000) {
      const pos = calculatePositionAlongHole(d)
      trajectoryPoints.push(new THREE.Vector3(pos.x, pos.y, pos.z))
    }
    const trajectoryGeometry = new THREE.BufferGeometry().setFromPoints(trajectoryPoints)
    const trajectoryMaterial = new THREE.LineBasicMaterial({ 
      color: 0x00ff00, 
      linewidth: 3 
    })
    const trajectoryLine = new THREE.Line(trajectoryGeometry, trajectoryMaterial)
    scene.add(trajectoryLine)
    
    // Add structures using their geological orientation (Dip/Dip Direction)
    const planeSize = 500 // Size of each plane disc in cm
    
    drillHole.scenes.forEach(sceneData => {
      sceneData.structures.forEach(structure => {
        const depthCm = structure.depth
        
        // Calculate position along drill hole trajectory
        const position = calculatePositionAlongHole(depthCm)
        
        // Create circular disc to represent the structural plane
        const discGeometry = new THREE.CircleGeometry(planeSize, 32)
        const discMaterial = new THREE.MeshPhongMaterial({
          color: structure.color || '#888888',
          transparent: true,
          opacity: 0.75,
          side: THREE.DoubleSide,
          emissive: structure.color || '#888888',
          emissiveIntensity: 0.2
        })
        const disc = new THREE.Mesh(discGeometry, discMaterial)
        
        // Position along drill hole trajectory
        disc.position.set(position.x, position.y, position.z)
        
        // Apply geological orientation
        // Dip: ángulo de buzamiento (0° = horizontal, 90° = vertical)
        // Dip Direction: azimuth de la dirección de buzamiento máximo
        
        // En Three.js: Y es vertical (elevación), necesitamos rotar el disco
        // El disco inicia en el plano XY (horizontal en Three.js)
        const dipRad = (structure.dipReal * Math.PI) / 180
        const dipDirectionRad = (structure.dipDirection * Math.PI) / 180
        
        // Rotación del disco:
        // 1. Rotar alrededor de Y (vertical) para apuntar en la dip direction
        // 2. Inclinar desde la horizontal según el dip
        disc.rotation.order = 'YZX'
        disc.rotation.y = dipDirectionRad  // Apuntar en la dirección de buzamiento
        disc.rotation.x = -dipRad  // Inclinar según el dip (negativo para inclinar hacia abajo)
        
        scene.add(disc)
        
        // Add outline for better visibility
        const edgesGeometry = new THREE.EdgesGeometry(discGeometry)
        const edgesMaterial = new THREE.LineBasicMaterial({ 
          color: 0xffffff,
          linewidth: 2
        })
        const edges = new THREE.LineSegments(edgesGeometry, edgesMaterial)
        edges.position.copy(disc.position)
        edges.rotation.copy(disc.rotation)
        scene.add(edges)
        
        // Add a small sphere at the center for reference
        const centerGeometry = new THREE.SphereGeometry(30, 16, 16)
        const centerMaterial = new THREE.MeshPhongMaterial({
          color: structure.color || '#888888',
          emissive: structure.color || '#888888',
          emissiveIntensity: 0.5
        })
        const centerSphere = new THREE.Mesh(centerGeometry, centerMaterial)
        centerSphere.position.copy(disc.position)
        scene.add(centerSphere)
      })
    })

    // Axes helper (larger scale)
    // X = Este (rojo), Y = Elevación/Arriba (verde), Z = Sur/-Norte (azul)
    const axesHelper = new THREE.AxesHelper(2000)
    scene.add(axesHelper)

    // Grid horizontal en superficie (Y = 0)
    // GridHelper crea una grilla en el plano XZ (horizontal en Three.js)
    const gridHelper = new THREE.GridHelper(10000, 20, 0x444444, 0x222222)
    gridHelper.position.y = 0  // A nivel del collar
    scene.add(gridHelper)
    
    // Add horizontal reference planes every 50m down
    for (let depth = 5000; depth <= 50000; depth += 5000) {
      const gridRef = new THREE.GridHelper(2000, 4, 0x333333, 0x222222)
      gridRef.position.y = -depth  // Cada 50m hacia abajo
      scene.add(gridRef)
    }

    // Animation loop
    const animate = () => {
      requestAnimationFrame(animate)
      controls.update()
      renderer.render(scene, camera)
    }
    animate()

    // Cleanup
    return () => {
      renderer.dispose()
      container.removeChild(renderer.domElement)
      sceneRef.current = null
    }
  }, [drillHole])

  // Calculate total structures
  const totalStructures = drillHole.scenes.reduce((sum, scene) => sum + scene.structures.length, 0)

  return (
    <div className="space-y-4">
      {/* Main 3D Viewer */}
      <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20">
        <div className="mb-4">
          <h2 className="text-2xl font-bold text-white flex items-center gap-2">
            <span>🎮</span>
            {drillHole.name}
          </h2>
          <p className="text-sm text-gray-400 mt-1">
            {drillHole.totalDepth.toFixed(1)}m • Az {drillHole.info.azimuth.toFixed(0)}° • Dip {drillHole.info.dip.toFixed(0)}° • {totalStructures} estructuras
          </p>
        </div>
        
        <div
          ref={containerRef}
          className="w-full h-[600px] bg-slate-950 rounded-xl overflow-hidden border border-white/10"
        />
        
        <div className="mt-4 text-xs text-gray-400 text-center">
          🖱️ Click + arrastrar: rotar | Scroll: zoom | Click derecho: panear
        </div>
      </div>

      {/* Structures List */}
      <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20">
        <h3 className="text-xl font-bold text-white mb-4">📊 Estructuras Capturadas</h3>
        
        <div className="space-y-3">
          {drillHole.scenes.map(scene => 
            scene.structures.map(structure => (
              <div 
                key={structure.id}
                className="bg-white/5 rounded-lg p-4 border border-white/10"
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <div 
                      className="w-4 h-4 rounded-full border-2 border-white"
                      style={{ backgroundColor: structure.color }}
                    />
                    <span className="font-semibold text-white capitalize">
                      {structure.structureType}
                    </span>
                  </div>
                  <span className="text-sm text-gray-400">
                    {structure.depth.toFixed(1)} cm
                  </span>
                </div>
                
                <div className="grid grid-cols-3 gap-3 text-xs">
                  <div>
                    <p className="text-gray-400">Alpha</p>
                    <p className="text-white font-semibold">{structure.alpha.toFixed(1)}°</p>
                  </div>
                  <div>
                    <p className="text-gray-400">Beta</p>
                    <p className="text-white font-semibold">{structure.beta.toFixed(1)}°</p>
                  </div>
                  <div>
                    <p className="text-gray-400">Azimuth</p>
                    <p className="text-white font-semibold">{structure.ac.toFixed(1)}°</p>
                  </div>
                </div>
                
                {structure.p1 && structure.p2 && structure.p3 && (
                  <div className="mt-3 pt-3 border-t border-white/10">
                    <p className="text-xs text-gray-400 mb-2">Puntos 3D capturados:</p>
                    <div className="grid grid-cols-3 gap-2 text-xs font-mono">
                      <div className="bg-yellow-500/20 rounded p-2">
                        <p className="text-yellow-300 font-semibold mb-1">P1</p>
                        <p className="text-gray-300">X: {structure.p1.x.toFixed(2)}</p>
                        <p className="text-gray-300">Y: {structure.p1.y.toFixed(2)}</p>
                        <p className="text-gray-300">Z: {structure.p1.z.toFixed(2)}</p>
                      </div>
                      <div className="bg-yellow-500/20 rounded p-2">
                        <p className="text-yellow-300 font-semibold mb-1">P2</p>
                        <p className="text-gray-300">X: {structure.p2.x.toFixed(2)}</p>
                        <p className="text-gray-300">Y: {structure.p2.y.toFixed(2)}</p>
                        <p className="text-gray-300">Z: {structure.p2.z.toFixed(2)}</p>
                      </div>
                      <div className="bg-yellow-500/20 rounded p-2">
                        <p className="text-yellow-300 font-semibold mb-1">P3</p>
                        <p className="text-gray-300">X: {structure.p3.x.toFixed(2)}</p>
                        <p className="text-gray-300">Y: {structure.p3.y.toFixed(2)}</p>
                        <p className="text-gray-300">Z: {structure.p3.z.toFixed(2)}</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}


