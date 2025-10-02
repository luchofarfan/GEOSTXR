'use client'

import React, { useRef, useEffect, useState, useCallback } from 'react'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import { GEOSTXR_CONFIG } from '@/lib/config'
import { BOHLinesOverlay } from './boh-lines-overlay'
import { PointMarkersOverlay } from './point-markers-overlay'
import { RulerOverlay } from './ruler-overlay'

interface WebGLUnifiedCylinderProps {
  className?: string
  line1Angle?: number
  line2Angle?: number
  trioManager?: any // From usePointTrios hook
  planeManager?: any // From usePlanes hook
  onLine1AngleChange?: (angle: number) => void
  onLine2AngleChange?: (angle: number) => void
  isInteractive?: boolean
  enableSnapping?: boolean
  cameraRef?: React.MutableRefObject<any>
  scenePhotoId?: string | null
  isFrozen?: boolean
  frozenImageDataUrl?: string | null
  onScenePhotoCaptured?: (imageDataUrl: string) => void
}

export default function WebGLUnifiedCylinder({ 
  className = '', 
  line1Angle = 90,
  line2Angle = 90,
  trioManager,
  planeManager,
  onLine1AngleChange,
  onLine2AngleChange,
  isInteractive = true,
  enableSnapping = false,
  cameraRef,
  scenePhotoId,
  isFrozen = false,
  frozenImageDataUrl = null,
  onScenePhotoCaptured
}: WebGLUnifiedCylinderProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const videoRef = useRef<HTMLVideoElement>(null)
  const sceneRef = useRef<THREE.Scene | null>(null)
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null)
  const localCameraRef = useRef<THREE.PerspectiveCamera | null>(null)
  const orbitControlsRef = useRef<OrbitControls | null>(null)
  const videoTextureRef = useRef<THREE.VideoTexture | null>(null)
  const planesRef = useRef<Map<string, THREE.Mesh>>(new Map()) // Map of planeId -> Three.js Mesh
  const ellipsesRef = useRef<Map<string, THREE.Line>>(new Map()) // Map of planeId -> Three.js Line (ellipse)
  const [isReady, setIsReady] = useState(false)
  const [containerSize, setContainerSize] = useState({ width: 0, height: 0 })
  const [draggingPoint, setDraggingPoint] = useState<{ trioId: string; pointId: string } | null>(null)
  const [controlsEnabled, setControlsEnabled] = useState(false)

  // Camera stream setup
  useEffect(() => {
    const getCameraStream = async () => {
      try {
        console.log('📱 Requesting camera access...')
        
        // Try with environment camera first (rear camera)
        let stream: MediaStream | null = null
        
        try {
          stream = await navigator.mediaDevices.getUserMedia({
            video: {
              width: { ideal: 1920 },
              height: { ideal: 1080 },
              facingMode: 'environment'
            }
          })
          console.log('✅ Environment camera (rear) accessed successfully')
        } catch (envErr) {
          console.warn('⚠️ Environment camera failed, trying any camera...', envErr)
          
          // Fallback: Try without facingMode constraint
          try {
            stream = await navigator.mediaDevices.getUserMedia({
              video: {
                width: { ideal: 1920 },
                height: { ideal: 1080 }
              }
            })
            console.log('✅ Any camera accessed successfully')
          } catch (anyErr) {
            console.error('❌ No camera available:', anyErr)
            alert('❌ Error de Cámara\n\nNo se pudo acceder a la cámara.\n\nVerifica:\n1. Permisos de Chrome para cámara\n2. Que no esté siendo usada por otra app\n3. Configuración del dispositivo')
            return
          }
        }
        
        if (stream && videoRef.current) {
          console.log('📹 Setting video stream...')
          videoRef.current.srcObject = stream
          
          // Wait for video to be ready
          videoRef.current.onloadedmetadata = () => {
            console.log('✅ Video metadata loaded')
            videoRef.current?.play()
              .then(() => console.log('✅ Video playing'))
              .catch(err => console.error('❌ Video play error:', err))
          }
          
          videoRef.current.onerror = (e) => {
            console.error('❌ Video element error:', e)
          }
        }
      } catch (err) {
        console.error('❌ Critical camera error:', err)
        alert(`❌ Error Crítico de Cámara\n\n${err}\n\nIntenta recargar la página o usar Chrome.`)
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
    if (!containerRef.current || !videoRef.current) {
      console.log('⚠️ Container or video ref not ready yet')
      return
    }
    if (sceneRef.current) {
      console.log('Scene already initialized, skipping')
      return // Already initialized
    }

    // Check WebGL support
    const canvas = document.createElement('canvas')
    const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl')
    if (!gl) {
      console.error('❌ WebGL not supported on this device')
      alert('❌ WebGL No Soportado\n\nTu dispositivo no soporta WebGL.\n\nPrueba con:\n1. Actualizar Chrome\n2. Activar aceleración de hardware\n3. Usar un dispositivo más reciente')
      return
    }
    console.log('✅ WebGL is supported')

    const container = containerRef.current
    const video = videoRef.current
    
    const width = container.clientWidth
    const height = container.clientHeight

    if (width === 0 || height === 0) return

    setContainerSize({ width, height })

    // Wait for video to be ready
    const initScene = () => {
      if (video.readyState < video.HAVE_ENOUGH_DATA) {
        console.log('Waiting for video...')
        setTimeout(initScene, 100)
        return
      }
      
      // Double-check scene hasn't been created
      if (sceneRef.current) {
        console.log('Scene created by another instance, aborting')
        return
      }

      console.log('=== WEBGL UNIFIED INITIALIZATION ===')
      console.log(`Container: ${width}×${height}`)
      console.log(`Video: ${video.videoWidth}×${video.videoHeight}`)

    // Scene
    const scene = new THREE.Scene()
    scene.background = new THREE.Color(0x000000)
    sceneRef.current = scene

    // Camera - looking at cylinder from the side (along Y axis)
    // Cylinder is vertical along Z axis (z=0 at bottom, z=30 at top)
    const camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000)
    const aspectRatio = width / height
    let distance = (GEOSTXR_CONFIG.CYLINDER.HEIGHT / 2) / Math.tan((75 * Math.PI / 180) / 2)
    distance *= aspectRatio > 1 ? 1.5 : 1.3
    const cylinderCenter = GEOSTXR_CONFIG.CYLINDER.HEIGHT / 2 // z=15cm (center)
    
    // Position camera along +Y axis, looking at center of cylinder
    camera.position.set(0, distance, cylinderCenter)
    camera.lookAt(0, 0, cylinderCenter)
    // Use default up vector (0,1,0)
    localCameraRef.current = camera
    // Pass camera reference to parent component for composite image generation
    if (cameraRef) {
      cameraRef.current = camera
    }
    console.log(`Camera at (0, ${distance.toFixed(1)}, ${cylinderCenter}), looking at (0, 0, ${cylinderCenter})`)

    // Renderer with preserveDrawingBuffer for screenshot capability
    const renderer = new THREE.WebGLRenderer({ antialias: true, preserveDrawingBuffer: true })
    renderer.setSize(width, height)
    renderer.setClearColor(0x000000) // Black background
    container.appendChild(renderer.domElement)
    rendererRef.current = renderer
    
    // OrbitControls for rotation and zoom
    const controls = new OrbitControls(camera, renderer.domElement)
    controls.enableDamping = true // Smooth movement
    controls.dampingFactor = 0.05
    controls.target.set(0, 0, cylinderCenter) // Rotate around cylinder center
    controls.enablePan = false // Disable panning (only rotate and zoom)
    controls.minDistance = distance * 0.5 // Min zoom (50% closer)
    controls.maxDistance = distance * 2.0 // Max zoom (2x farther)
    controls.minPolarAngle = Math.PI / 4 // Limit rotation (45°)
    controls.maxPolarAngle = (3 * Math.PI) / 4 // Limit rotation (135°)
    controls.enabled = false // Disabled by default, enable with UI toggle
    orbitControlsRef.current = controls
    console.log('✅ OrbitControls created (disabled by default)')

    // Lighting
    scene.add(new THREE.AmbientLight(0x404040, 0.8))
    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.6)
    directionalLight.position.set(1, 1, 1)
    scene.add(directionalLight)

    // Create video texture
    const videoTexture = new THREE.VideoTexture(video)
    videoTexture.minFilter = THREE.LinearFilter
    videoTexture.magFilter = THREE.LinearFilter
    videoTexture.flipY = false
    videoTextureRef.current = videoTexture

    const radius = GEOSTXR_CONFIG.CYLINDER.RADIUS
    const cylinderHeight = GEOSTXR_CONFIG.CYLINDER.HEIGHT
    
    // Video plane setup with correct aspect ratio and mask
    const videoAspect = video.videoWidth / video.videoHeight
    const planeHeight = cylinderHeight * 1.15
    const planeWidth = planeHeight * videoAspect
    
    const planeGeometry = new THREE.PlaneGeometry(planeWidth, planeHeight)
    
    // UV mapping
    const uvs = planeGeometry.attributes.uv
    const uvArray = uvs.array as Float32Array
    for (let i = 0; i < uvArray.length; i += 2) {
      uvArray[i] = uvArray[i]
      uvArray[i + 1] = 1 - uvArray[i + 1]
    }
    uvs.needsUpdate = true
    
    // Shader with cylindrical mask
    const planeMaterial = new THREE.ShaderMaterial({
      uniforms: {
        videoTexture: { value: videoTexture },
        cylinderRadius: { value: radius }
      },
      vertexShader: `
        varying vec2 vUv;
        varying vec3 vWorldPosition;
        
        void main() {
          vUv = uv;
          vec4 worldPos = modelMatrix * vec4(position, 1.0);
          vWorldPosition = worldPos.xyz;
          gl_Position = projectionMatrix * viewMatrix * worldPos;
        }
      `,
      fragmentShader: `
        uniform sampler2D videoTexture;
        uniform float cylinderRadius;
        varying vec2 vUv;
        varying vec3 vWorldPosition;
        
        void main() {
          float dist = sqrt(vWorldPosition.x * vWorldPosition.x + vWorldPosition.y * vWorldPosition.y);
          if (dist > cylinderRadius * 1.05) {
            discard;
          }
          gl_FragColor = texture2D(videoTexture, vUv);
        }
      `,
      transparent: true,
      depthWrite: false
    })
    
    const videoPlane = new THREE.Mesh(planeGeometry, planeMaterial)
    videoPlane.position.set(0, -0.1, cylinderHeight / 2) // Center at z=15
    videoPlane.rotateX(-Math.PI / 2)
    videoPlane.renderOrder = 1
    videoPlane.visible = false // Hide background plane since video is now on cylinder
    scene.add(videoPlane)
    console.log(`Video plane created (hidden - video is mapped on cylinder)`)

    // Create cylinder (radius and cylinderHeight already defined above)
    // Cylinder from z=0 to z=30, centered at z=15
    const cylinderGeometry = new THREE.CylinderGeometry(radius, radius, cylinderHeight, 64, 1, true) // 64 segments, open-ended
    cylinderGeometry.rotateX(Math.PI / 2) // Align with Z-axis (vertical)
    
    // Custom UV mapping for proper video projection onto cylinder
    // Standard CylinderGeometry UV wraps around, but we need to adjust for front-facing view
    const cylinderUVs = cylinderGeometry.attributes.uv
    const positions = cylinderGeometry.attributes.position
    
    for (let i = 0; i < positions.count; i++) {
      const x = positions.getX(i)
      const y = positions.getY(i)
      const z = positions.getZ(i)
      
      // Calculate angle around cylinder (0° = right, 90° = front, 180° = left)
      const angle = Math.atan2(y, x)
      
      // Map only the front 180° (visible portion) to full texture width
      // This prevents distortion on the back
      let u = (angle + Math.PI / 2) / Math.PI // 0 to 1 for front 180°
      u = Math.max(0, Math.min(1, u)) // Clamp to 0-1
      
      // V maps along cylinder height (Z-axis)
      const v = z / cylinderHeight // 0 at bottom, 1 at top
      
      cylinderUVs.setXY(i, u, v)
    }
    
    cylinderUVs.needsUpdate = true

    // Apply video texture to cylinder surface with corrected UV mapping
    const cylinderMaterial = new THREE.MeshBasicMaterial({
      map: videoTexture, // Map video onto cylinder
      side: THREE.FrontSide, // Only render outside (visible surface)
      depthWrite: true,
      transparent: false
    })

    const cylinder = new THREE.Mesh(cylinderGeometry, cylinderMaterial)
    cylinder.position.set(0, 0, cylinderHeight / 2) // Move to z=0 to z=30 range
    scene.add(cylinder)
    
    console.log('✅ Cylinder created with custom UV-mapped video texture')

    // Borders - Black lines at the edges of the cylinder
    // From z=0 (bottom) to z=30 (top), at x=±radius
    const borderMaterial = new THREE.LineBasicMaterial({ color: 0x000000, linewidth: 3 })
    
    const frontBorder = new THREE.Line(
      new THREE.BufferGeometry().setFromPoints([
        new THREE.Vector3(radius, 0, 0),      // Bottom at z=0
        new THREE.Vector3(radius, 0, cylinderHeight)  // Top at z=30
      ]),
      borderMaterial
    )
    scene.add(frontBorder)
    
    const backBorder = new THREE.Line(
      new THREE.BufferGeometry().setFromPoints([
        new THREE.Vector3(-radius, 0, 0),     // Bottom at z=0
        new THREE.Vector3(-radius, 0, cylinderHeight) // Top at z=30
      ]),
      borderMaterial
    )
    scene.add(backBorder)

    // Semicircles at top and bottom to mark cylinder extremes
    // Connect the two vertical border lines with arcs
    // Front borders are at (±radius, 0), so arc should go from right to left through front
    const bottomArcPoints = []
    const topArcPoints = []
    const arcSegments = 48 // More segments for smoother arc
    
    // Arc from right border (0°) through front (90°) to left border (180°)
    // This creates a semicircle on the visible front side
    for (let i = 0; i <= arcSegments; i++) {
      const angle = (Math.PI * i) / arcSegments // 0° to 180°
      const x = radius * Math.cos(angle)      // Goes from +radius to -radius
      const y = radius * Math.sin(angle)      // Goes from 0 through +radius back to 0
      bottomArcPoints.push(new THREE.Vector3(x, y, 0)) // z=0 (bottom)
      topArcPoints.push(new THREE.Vector3(x, y, cylinderHeight)) // z=30 (top)
    }
    
    const bottomArc = new THREE.Line(
      new THREE.BufferGeometry().setFromPoints(bottomArcPoints),
      borderMaterial
    )
    scene.add(bottomArc)
    
    const topArc = new THREE.Line(
      new THREE.BufferGeometry().setFromPoints(topArcPoints),
      borderMaterial
    )
    scene.add(topArc)

    console.log(`Cylinder positioned: z=0 to z=${cylinderHeight}cm, centered at z=${cylinderHeight/2}cm`)
    console.log(`Borders at x=±${radius}cm, from z=0 to z=${cylinderHeight}cm`)
    console.log(`Semicircles added at z=0 (bottom) and z=${cylinderHeight}cm (top)`)

    // BOH Lines now rendered via HTML overlay (no 3D geometry)

    console.log('WebGL unified scene initialized')
    
    // Animation loop
    let animationId: number
    const animate = () => {
      animationId = requestAnimationFrame(animate)
      
      // Update OrbitControls (if enabled)
      if (orbitControlsRef.current) {
        orbitControlsRef.current.update()
      }
      
      // Update video texture
      if (videoTextureRef.current) {
        videoTextureRef.current.needsUpdate = true
      }
      
      renderer.render(scene, camera)
    }
    animate()
    
    // Store references for external control
    ;(renderer as any)._sceneRef = scene
    ;(renderer as any)._cameraRef = camera

    setIsReady(true)

    // Cleanup
    return () => {
      console.log('Cleaning up scene...')
      if (animationId) {
        cancelAnimationFrame(animationId)
      }
      if (renderer.domElement && container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement)
      }
      renderer.dispose()
      scene.clear()
      sceneRef.current = null
    }
    } // End initScene
    
    // Start initialization
    initScene()

    // Cleanup for useEffect
    return () => {
      // Cleanup is handled in initScene's return function
      console.log('useEffect cleanup called')
    }
  }, [])

  // BOH lines are now rendered via HTML overlay - no 3D geometry needed

  // Planes are calculated but NOT rendered (only ellipses are visible)
  // This useEffect handles cleanup of any existing plane meshes
  useEffect(() => {
    if (!sceneRef.current) return
    
    const scene = sceneRef.current
    const currentPlanes = planesRef.current

    // Remove all plane meshes from scene
    currentPlanes.forEach((mesh, planeId) => {
      scene.remove(mesh)
      mesh.geometry.dispose()
      if (Array.isArray(mesh.material)) {
        mesh.material.forEach(m => m.dispose())
      } else {
        mesh.material.dispose()
      }
      console.log(`Plane ${planeId} removed from scene`)
    })
    
    currentPlanes.clear()
  }, [isReady, planeManager?.planes])

  // Log frozen state changes for debugging
  useEffect(() => {
    console.log('🔄 Frozen state changed:', { isFrozen })
    if (isFrozen) {
      console.log('🧊 Scene is now FROZEN - video paused, overlays active')
    } else {
      console.log('📹 Scene is now LIVE - video playing normally')
    }
  }, [isFrozen])

  // Listen for capture scene photo event
  useEffect(() => {
    const handleCaptureEvent = () => {
      if (!rendererRef.current || !videoRef.current || !sceneRef.current || !localCameraRef.current) {
        console.error('Cannot capture: components not ready')
        return
      }

      console.log('📸 Capturing scene from Three.js canvas with cylinder mask...')
      
      // Pause video first
      const video = videoRef.current
      video.pause()
      
      // Force renders to ensure the paused frame is captured with mask
      setTimeout(() => {
        if (!rendererRef.current || !sceneRef.current || !localCameraRef.current) return
        
        try {
          // Force multiple renders to ensure video texture is updated with paused frame
          for (let i = 0; i < 3; i++) {
            if (videoTextureRef.current) {
              videoTextureRef.current.needsUpdate = true
            }
            rendererRef.current.render(sceneRef.current, localCameraRef.current)
          }
          
          // Now capture from the canvas - this includes the cylindrical mask (shader discard)
          const canvas = rendererRef.current.domElement
          
          // The captured image will show:
          // - Video inside cylinder (shader allows)
          // - Black outside cylinder (shader discards → shows clearColor)
          const imageDataUrl = canvas.toDataURL('image/jpeg', 0.95)
          
          console.log('✅ Scene captured from renderer canvas')
          console.log(`   Canvas size: ${canvas.width}x${canvas.height}`)
          console.log(`   Mask applied: pixels outside ${GEOSTXR_CONFIG.CYLINDER.RADIUS}cm radius are discarded`)
          
          // Send captured image to parent
          if (onScenePhotoCaptured) {
            onScenePhotoCaptured(imageDataUrl)
          }
        } catch (error) {
          console.error('Error capturing scene:', error)
        }
      }, 200) // Wait for video pause + multiple render cycles
    }

    window.addEventListener('captureScenePhoto', handleCaptureEvent)

    return () => {
      window.removeEventListener('captureScenePhoto', handleCaptureEvent)
    }
  }, [onScenePhotoCaptured])

  // Sync controls enabled state
  useEffect(() => {
    if (orbitControlsRef.current) {
      orbitControlsRef.current.enabled = controlsEnabled
      console.log(`🎮 OrbitControls ${controlsEnabled ? 'ENABLED' : 'DISABLED'}`)
    }
  }, [controlsEnabled])

  // Render ellipses (cylinder-plane intersections) in 3D
  useEffect(() => {
    if (!isReady || !sceneRef.current || !planeManager) return

    console.log(`🎨 Ellipses useEffect triggered - Updating ${planeManager.planes.length} ellipse(s)`)

    const scene = sceneRef.current
    const currentEllipses = ellipsesRef.current

    // Remove ellipses that no longer exist
    currentEllipses.forEach((line, planeId) => {
      const planeExists = planeManager.planes.some((p: any) => p.id === planeId)
      if (!planeExists) {
        scene.remove(line)
        line.geometry.dispose()
        if (Array.isArray(line.material)) {
          line.material.forEach(m => m.dispose())
        } else {
          line.material.dispose()
        }
        currentEllipses.delete(planeId)
        console.log(`Ellipse ${planeId} removed from scene`)
      }
    })

    // Add or update ellipses
    planeManager.planes.forEach((plane: any) => {
      if (!plane.ellipsePoints || plane.ellipsePoints.length === 0) return

      let ellipseLine = currentEllipses.get(plane.id)

      // Convert ellipse points to THREE.Vector3
      const points = plane.ellipsePoints.map((p: any) => 
        new THREE.Vector3(p.x, p.y, p.z)
      )
      
      // Close the ellipse by adding first point at the end
      points.push(points[0].clone())

      // Create new ellipse line if it doesn't exist
      if (!ellipseLine) {
        // Create line geometry
        const geometry = new THREE.BufferGeometry().setFromPoints(points)
        
        // Create line material with plane color (brighter/more opaque)
        const material = new THREE.LineBasicMaterial({
          color: plane.color,
          linewidth: 3, // Note: linewidth > 1 may not work on all platforms
          transparent: true,
          opacity: 0.9
        })
        
        ellipseLine = new THREE.Line(geometry, material)
        ellipseLine.renderOrder = 3 // Render on top of planes
        
        scene.add(ellipseLine)
        currentEllipses.set(plane.id, ellipseLine)
        console.log(`Ellipse ${plane.id} added to scene with ${plane.ellipsePoints.length} points`)
      } else {
        // UPDATE existing ellipse geometry AND color
        const newGeometry = new THREE.BufferGeometry().setFromPoints(points)
        
        // Dispose old geometry
        ellipseLine.geometry.dispose()
        
        // Assign new geometry
        ellipseLine.geometry = newGeometry
        
        // UPDATE color if it changed (when structure type is assigned/changed)
        if (ellipseLine.material instanceof THREE.LineBasicMaterial) {
          const currentColor = ellipseLine.material.color.getHexString()
          const newColor = plane.color.replace('#', '')
          
          if (currentColor.toUpperCase() !== newColor.toUpperCase()) {
            ellipseLine.material.color.set(plane.color)
            console.log(`Ellipse ${plane.id} COLOR UPDATED: #${currentColor} → ${plane.color}`)
          }
        }
        
        console.log(`Ellipse ${plane.id} UPDATED with ${plane.ellipsePoints.length} points and color ${plane.color}`)
      }

      // Update visibility
      ellipseLine.visible = plane.visible
    })
  }, [isReady, planeManager?.planes])

  // Handle clicks/drags on cylinder to add or reposition points
  const handleCanvasClick = useCallback((event: React.MouseEvent<HTMLDivElement>) => {
    if (!trioManager || !localCameraRef.current || !containerRef.current || !rendererRef.current) return

    // If dragging a point, update its position
    if (draggingPoint) {
      const canvas = rendererRef.current.domElement
      const rect = canvas.getBoundingClientRect()
      
      const x = event.clientX - rect.left
      const y = event.clientY - rect.top
      const ndcX = (x / rect.width) * 2 - 1
      const ndcY = -(y / rect.height) * 2 + 1

      const raycaster = new THREE.Raycaster()
      raycaster.setFromCamera(new THREE.Vector2(ndcX, ndcY), localCameraRef.current)

      if (!sceneRef.current) return
      
      const meshes = sceneRef.current.children.filter(obj => 
        obj instanceof THREE.Mesh && obj.geometry instanceof THREE.CylinderGeometry
      )
      
      const intersects = raycaster.intersectObjects(meshes, false)
      
      if (intersects.length > 0) {
        const point = intersects[0].point
        trioManager.updatePointPosition(draggingPoint.trioId, draggingPoint.pointId, { 
          x: point.x, 
          y: point.y, 
          z: point.z 
        })
        console.log(`✓ Point repositioned to (${point.x.toFixed(2)}, ${point.y.toFixed(2)}, ${point.z.toFixed(2)})`)
      }
      
      setDraggingPoint(null)
      return
    }

    // Block interaction if first trio exists but has no depth
    if (trioManager.normalTrios.length > 0 && trioManager.normalTrios[0] && !trioManager.normalTrios[0].depth) {
      console.log('⚠️ Please enter depth for first trio before continuing')
      const panel = document.querySelector('.boh-controls')
      if (panel) {
        panel.scrollTop = panel.scrollHeight
      }
      return
    }

    // BLOCK point selection if no scene photo has been captured
    if (!scenePhotoId) {
      alert('⚠️ Primero debes capturar la foto de la escena.\n\nHaz clic en el botón 📸 "Capturar Escena" en la esquina superior derecha.')
      console.warn('❌ Cannot add points: No scene photo captured yet')
      return
    }

    // Get click position relative to the canvas element
    const canvas = rendererRef.current.domElement
    const rect = canvas.getBoundingClientRect()
    
    const x = event.clientX - rect.left
    const y = event.clientY - rect.top
    const ndcX = (x / rect.width) * 2 - 1
    const ndcY = -(y / rect.height) * 2 + 1

    console.log(`Click at screen: (${x.toFixed(0)}, ${y.toFixed(0)}) → NDC: (${ndcX.toFixed(3)}, ${ndcY.toFixed(3)})`)

    const raycaster = new THREE.Raycaster()
    raycaster.setFromCamera(new THREE.Vector2(ndcX, ndcY), localCameraRef.current)

    if (!sceneRef.current) return
    
    const meshes = sceneRef.current.children.filter(obj => 
      obj instanceof THREE.Mesh && obj.geometry instanceof THREE.CylinderGeometry
    )
    
    const intersects = raycaster.intersectObjects(meshes, false)
    
    if (intersects.length > 0) {
      const point = intersects[0].point
      console.log(`✓ Intersected at 3D: (${point.x.toFixed(2)}, ${point.y.toFixed(2)}, ${point.z.toFixed(2)})`)
      
      trioManager.addPoint({ x: point.x, y: point.y, z: point.z })
    } else {
      console.log('✗ No intersection with cylinder')
    }
  }, [trioManager, draggingPoint, scenePhotoId])

  return (
    <div 
      ref={containerRef} 
      className={`webgl-unified-cylinder ${className}`}
      onClick={handleCanvasClick}
      style={{
        position: 'relative',
        width: '100%',
        height: '100%',
        minHeight: '100vh',
        cursor: draggingPoint 
          ? 'grabbing' 
          : (trioManager && trioManager.canAddMoreTrios && !(trioManager.normalTrios.length > 0 && trioManager.normalTrios[0] && !trioManager.normalTrios[0].depth) 
            ? 'crosshair' 
            : 'not-allowed')
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
      
      {/* Debug indicator when frozen */}
      {isFrozen && (
        <div style={{
          position: 'absolute',
          top: '10px',
          left: '10px',
          background: 'rgba(0,255,0,0.8)',
          color: 'white',
          padding: '4px 8px',
          fontSize: '10px',
          fontWeight: 'bold',
          zIndex: 9999,
          pointerEvents: 'none'
        }}>
          🧊 VIDEO PAUSADO
        </div>
      )}
      
      {/* Controls Toggle Button */}
      <button
        onClick={() => setControlsEnabled(!controlsEnabled)}
        style={{
          position: 'absolute',
          bottom: '20px',
          right: '20px',
          zIndex: 2010,
          padding: '12px 20px',
          background: controlsEnabled 
            ? 'linear-gradient(135deg, #10b981, #059669)' 
            : 'linear-gradient(135deg, #6b7280, #4b5563)',
          border: controlsEnabled ? '2px solid #34d399' : '2px solid #9ca3af',
          borderRadius: '12px',
          color: 'white',
          fontSize: '14px',
          fontWeight: 'bold',
          cursor: 'pointer',
          boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          transition: 'all 0.3s ease'
        }}
      >
        <span style={{ fontSize: '18px' }}>{controlsEnabled ? '🎮' : '🔒'}</span>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', lineHeight: '1.2' }}>
          <span style={{ fontSize: '12px' }}>
            {controlsEnabled ? 'Controles Activos' : 'Controles Bloqueados'}
          </span>
          <span style={{ fontSize: '10px', opacity: 0.8 }}>
            {controlsEnabled ? 'Arrastra para rotar, scroll para zoom' : 'Click para habilitar rotación/zoom'}
          </span>
        </div>
      </button>
      
      {/* Three.js will render here */}
      
            {/* HTML Overlay for Ruler */}
            {containerSize.width > 0 && isReady && (
              <RulerOverlay
                containerWidth={containerSize.width}
                containerHeight={containerSize.height}
                camera={localCameraRef.current || undefined}
                cylinderHeight={GEOSTXR_CONFIG.CYLINDER.HEIGHT}
                radius={GEOSTXR_CONFIG.CYLINDER.RADIUS}
              />
            )}

            {/* HTML Overlay for BOH lines */}
            {containerSize.width > 0 && isReady && (
              <BOHLinesOverlay 
                line1Angle={line1Angle}
                line2Angle={line2Angle}
                containerWidth={containerSize.width}
                containerHeight={containerSize.height}
                camera={localCameraRef.current || undefined}
                cylinderHeight={GEOSTXR_CONFIG.CYLINDER.HEIGHT}
                radius={GEOSTXR_CONFIG.CYLINDER.RADIUS}
                onLine1AngleChange={onLine1AngleChange}
                onLine2AngleChange={onLine2AngleChange}
                isInteractive={isInteractive}
                enableSnapping={enableSnapping}
              />
            )}

            {/* HTML Overlay for Point Trios */}
            {containerSize.width > 0 && isReady && trioManager && (
              <PointMarkersOverlay
                trios={trioManager.trios}
                currentTrio={trioManager.currentTrio}
                selectedTrioId={trioManager.selectedTrioId}
                containerWidth={containerSize.width}
                containerHeight={containerSize.height}
                camera={localCameraRef.current || undefined}
                draggingPoint={draggingPoint}
                onPointClick={(trioId, pointId) => {
                  console.log(`Point clicked: trio=${trioId}, point=${pointId}`)
                  trioManager.selectTrio(trioId)
                }}
                onPointDragStart={(trioId, pointId) => {
                  console.log(`Point drag started: trio=${trioId}, point=${pointId}`)
                  setDraggingPoint({ trioId, pointId })
                }}
              />
            )}
    </div>
  )
}
