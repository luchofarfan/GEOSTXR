'use client'

import { useEffect, useRef } from 'react'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import type { DrillHole } from '@/types/geostxr-data'

interface ThreeViewerProps {
  allDrillHoles: DrillHole[]
  visibility: { [drillHoleId: string]: boolean }
  showStructures: boolean
  showTrajectories: boolean
  structureOpacity: number
}

export default function ThreeViewer({
  allDrillHoles,
  visibility,
  showStructures,
  showTrajectories,
  structureOpacity
}: ThreeViewerProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const sceneRef = useRef<THREE.Scene | null>(null)
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null)
  const controlsRef = useRef<OrbitControls | null>(null)
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null)

  useEffect(() => {
    if (!containerRef.current || sceneRef.current) return

    const container = containerRef.current
    const width = container.clientWidth
    const height = container.clientHeight

    // Scene
    const scene = new THREE.Scene()
    scene.background = new THREE.Color(0x0a0f1e)
    sceneRef.current = scene

    // Calculate bounding box of all drill holes
    const calculateBounds = () => {
      if (allDrillHoles.length === 0) {
        return { centerX: 0, centerY: 0, centerZ: 0, size: 10000 }
      }

      let minX = Infinity, maxX = -Infinity
      let minY = Infinity, maxY = -Infinity
      let minZ = Infinity, maxZ = -Infinity

      allDrillHoles.forEach(drillHole => {
        const collarEast = drillHole.info.utmEast || 0
        const collarNorth = drillHole.info.utmNorth || 0
        const collarElevation = drillHole.info.elevation || 0
        
        minX = Math.min(minX, collarEast)
        maxX = Math.max(maxX, collarEast)
        minY = Math.min(minY, collarElevation)
        maxY = Math.max(maxY, collarElevation)
        minZ = Math.min(minZ, -collarNorth)
        maxZ = Math.max(maxZ, -collarNorth)
      })

      const centerX = (minX + maxX) / 2
      const centerY = (minY + maxY) / 2
      const centerZ = (minZ + maxZ) / 2
      
      const size = Math.max(maxX - minX, maxY - minY, maxZ - minZ) || 10000
      
      return { centerX, centerY, centerZ, size }
    }

    const { centerX, centerY, centerZ, size } = calculateBounds()

    // Camera - positioned to view all drill holes
    const camera = new THREE.PerspectiveCamera(60, width / height, 1, size * 10)
    camera.position.set(centerX + size, centerY + size, centerZ + size)
    camera.lookAt(centerX, centerY, centerZ)
    cameraRef.current = camera

    // Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true })
    renderer.setSize(width, height)
    container.appendChild(renderer.domElement)
    rendererRef.current = renderer

    // Controls
    const controls = new OrbitControls(camera, renderer.domElement)
    controls.enableDamping = true
    controls.dampingFactor = 0.05
    controlsRef.current = controls

    // Lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6)
    scene.add(ambientLight)
    
    const directionalLight = new THREE.DirectionalLight(0xffffff, 1.0)
    directionalLight.position.set(10000, 10000, 10000)
    scene.add(directionalLight)
    
    const directionalLight2 = new THREE.DirectionalLight(0xffffff, 0.4)
    directionalLight2.position.set(-10000, -10000, -10000)
    scene.add(directionalLight2)

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
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement)
      }
      sceneRef.current = null
      rendererRef.current = null
      controlsRef.current = null
      cameraRef.current = null
    }
  }, [])

  // Update scene when visibility or settings change
  useEffect(() => {
    if (!sceneRef.current) return

    const scene = sceneRef.current
    
    // Clear existing drill hole objects
    const objectsToRemove = scene.children.filter(obj => 
      obj.userData.type === 'drillHole' || 
      obj.userData.type === 'structure' || 
      obj.userData.type === 'trajectory'
    )
    objectsToRemove.forEach(obj => scene.remove(obj))

    // Calculate bounds for current drill holes
    const calculateBounds = () => {
      if (allDrillHoles.length === 0) {
        return { centerX: 0, centerY: 0, centerZ: 0, size: 10000 }
      }

      let minX = Infinity, maxX = -Infinity
      let minY = Infinity, maxY = -Infinity
      let minZ = Infinity, maxZ = -Infinity

      allDrillHoles.forEach(drillHole => {
        const collarEast = drillHole.info.utmEast || 0
        const collarNorth = drillHole.info.utmNorth || 0
        const collarElevation = drillHole.info.elevation || 0
        
        minX = Math.min(minX, collarEast)
        maxX = Math.max(maxX, collarEast)
        minY = Math.min(minY, collarElevation)
        maxY = Math.max(maxY, collarElevation)
        minZ = Math.min(minZ, -collarNorth)
        maxZ = Math.max(maxZ, -collarNorth)
      })

      const centerX = (minX + maxX) / 2
      const centerY = (minY + maxY) / 2
      const centerZ = (minZ + maxZ) / 2
      
      const size = Math.max(maxX - minX, maxY - minY, maxZ - minZ) || 10000
      
      return { centerX, centerY, centerZ, size }
    }

    const { centerX, centerY, centerZ, size } = calculateBounds()

    // Colors for different drill holes
    const drillHoleColors = [
      0x00ff00, // green
      0xff0000, // red
      0x0000ff, // blue
      0xffff00, // yellow
      0xff00ff, // magenta
      0x00ffff, // cyan
      0xffa500, // orange
      0x800080, // purple
      0x008000, // dark green
      0x800000, // maroon
    ]

    allDrillHoles.forEach((drillHole, index) => {
      if (!visibility[drillHole.id]) return

      const color = drillHoleColors[index % drillHoleColors.length]
      
      // Drill hole orientation
      const holeAzimuthRad = (drillHole.info.azimuth * Math.PI) / 180
      const holeDipRad = (drillHole.info.dip * Math.PI) / 180
      
      // Function to calculate position along drill hole trajectory
      function calculatePositionAlongHole(depthAlongHole: number) {
        const horizontalDistance = depthAlongHole * Math.cos(holeDipRad)
        const verticalDistance = depthAlongHole * Math.sin(holeDipRad)
        
        const east = horizontalDistance * Math.sin(holeAzimuthRad)
        const north = horizontalDistance * Math.cos(holeAzimuthRad)
        const elevation = verticalDistance
        
        // Add collar position (UTM coordinates)
        const collarEast = drillHole.info.utmEast || 0
        const collarNorth = drillHole.info.utmNorth || 0
        const collarElevation = drillHole.info.elevation || 0
        
        return {
          x: collarEast + east,
          y: collarElevation + elevation,
          z: -(collarNorth + north) // Negative Z for north direction
        }
      }

      // Draw drill hole trajectory
      if (showTrajectories) {
        const trajectoryPoints = []
        const totalDepthCm = drillHole.totalDepth * 100
        for (let d = 0; d <= totalDepthCm; d += 1000) {
          const pos = calculatePositionAlongHole(d)
          trajectoryPoints.push(new THREE.Vector3(pos.x, pos.y, pos.z))
        }
        const trajectoryGeometry = new THREE.BufferGeometry().setFromPoints(trajectoryPoints)
        const trajectoryMaterial = new THREE.LineBasicMaterial({ 
          color: color, 
          linewidth: 4 
        })
        const trajectoryLine = new THREE.Line(trajectoryGeometry, trajectoryMaterial)
        trajectoryLine.userData.type = 'trajectory'
        trajectoryLine.userData.drillHoleId = drillHole.id
        scene.add(trajectoryLine)
      }

      // Add structures
      if (showStructures) {
        const planeSize = 800 // Larger size for better visibility in multi-drillhole view
        
        drillHole.scenes.forEach(sceneData => {
          sceneData.structures.forEach(structure => {
            const depthCm = structure.depth
            
            const position = calculatePositionAlongHole(depthCm)
            
            // Create circular disc to represent the structural plane
            const discGeometry = new THREE.CircleGeometry(planeSize, 32)
            const discMaterial = new THREE.MeshPhongMaterial({
              color: structure.color || '#888888',
              transparent: true,
              opacity: structureOpacity,
              side: THREE.DoubleSide,
              emissive: structure.color || '#888888',
              emissiveIntensity: 0.2
            })
            const disc = new THREE.Mesh(discGeometry, discMaterial)
            
            disc.position.set(position.x, position.y, position.z)
            
            const dipRad = (structure.dipReal * Math.PI) / 180
            const dipDirectionRad = (structure.dipDirection * Math.PI) / 180
            
            disc.rotation.order = 'YZX'
            disc.rotation.y = dipDirectionRad
            disc.rotation.x = -dipRad
            
            disc.userData.type = 'structure'
            disc.userData.drillHoleId = drillHole.id
            disc.userData.structureId = structure.id
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
            edges.userData.type = 'structure'
            edges.userData.drillHoleId = drillHole.id
            scene.add(edges)
            
            // Add a small sphere at the center for reference
            const centerGeometry = new THREE.SphereGeometry(50, 16, 16)
            const centerMaterial = new THREE.MeshPhongMaterial({
              color: structure.color || '#888888',
              emissive: structure.color || '#888888',
              emissiveIntensity: 0.5
            })
            const centerSphere = new THREE.Mesh(centerGeometry, centerMaterial)
            centerSphere.position.copy(disc.position)
            centerSphere.userData.type = 'structure'
            centerSphere.userData.drillHoleId = drillHole.id
            scene.add(centerSphere)
          })
        })
      }

      // Add collar marker at actual UTM position
      const collarGeometry = new THREE.SphereGeometry(200, 16, 16)
      const collarMaterial = new THREE.MeshPhongMaterial({
        color: color,
        emissive: color,
        emissiveIntensity: 0.3
      })
      const collarMarker = new THREE.Mesh(collarGeometry, collarMaterial)
      
      // Position at collar coordinates
      const collarPosition = calculatePositionAlongHole(0)
      collarMarker.position.set(collarPosition.x, collarPosition.y, collarPosition.z)
      collarMarker.userData.type = 'drillHole'
      collarMarker.userData.drillHoleId = drillHole.id
      scene.add(collarMarker)
    })

    // Axes helper (scaled to drill hole area)
    const axesHelper = new THREE.AxesHelper(size / 4)
    axesHelper.position.set(centerX, centerY, centerZ)
    scene.add(axesHelper)

    // Grid horizontal at average elevation
    const gridHelper = new THREE.GridHelper(size, Math.ceil(size / 1000), 0x444444, 0x222222)
    gridHelper.position.y = centerY
    scene.add(gridHelper)

  }, [allDrillHoles, visibility, showStructures, showTrajectories, structureOpacity])

  return <div ref={containerRef} className="w-full h-full" />
}
