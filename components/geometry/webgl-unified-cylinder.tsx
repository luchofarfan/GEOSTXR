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
  onVirtualBorderPositionsUpdate?: (leftX: number, rightX: number, canvasWidth: number, canvasHeight: number) => void
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
  onScenePhotoCaptured,
  onVirtualBorderPositionsUpdate
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

    // Camera - PerspectiveCamera to MATCH real camera perspective/distortion
    // This ensures cylinder 3D and mapped video have SAME perspective (coherent view)
    const aspectRatio = width / height
    const isPortrait = aspectRatio < 1
    const isMobile = /Android|iPhone|iPad/i.test(navigator.userAgent)
    
    const cylHeight = GEOSTXR_CONFIG.CYLINDER.HEIGHT // 30cm
    const cylRadius = GEOSTXR_CONFIG.CYLINDER.RADIUS // 3cm
    const cylinderCenter = cylHeight / 2 // z=15cm (center)
    
    // FOV optimized for mobile portrait: needs VERY wide FOV to show full 30cm cylinder
    // Portrait mobile: 85° to ensure full cylinder height (30cm) visible at 26cm distance
    // This gives enough vertical field of view to see from z=0 to z=30 with margins
    // Landscape/desktop: 50° works fine
    const fov = (isPortrait && isMobile) ? 85 : 50
    
    const camera = new THREE.PerspectiveCamera(fov, aspectRatio, 0.1, 1000)
    
    // Distance: increase to reduce perspective distortion in mobile view
    // Further away = less perspective = more orthogonal view
    const distance = 35 // Increased from 26 to reduce oblique view
    
    // Position camera along +Y axis, looking at center of cylinder
    // Camera at cylinder center (z=15) for balanced view with minimal perspective
    camera.position.set(0, distance, cylinderCenter)
    camera.lookAt(0, 0, cylinderCenter) // Look at center for balanced view
    camera.up.set(0, 0, 1) // Z-axis points up (cylinder is vertical)
    
    console.log(`📐 Perspective camera: FOV=${fov}°, Distance=${distance}cm, AspectRatio=${aspectRatio.toFixed(2)}, Portrait=${isPortrait}, Mobile=${isMobile}`)
    console.log(`   → Matches real camera perspective for coherent video mapping`)
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
    controls.target.set(0, 0, cylinderCenter) // Look at cylinder center for balanced view
    
    // Enable panning with generous limits
    controls.enablePan = true
    controls.screenSpacePanning = true // Pan in screen space (more intuitive)
    controls.panSpeed = 1.0 // Fast panning for easy repositioning
    
    // Zoom limits
    controls.minDistance = distance * 0.3 // Min zoom (70% closer for detailed inspection)
    controls.maxDistance = distance * 3.0 // Max zoom (3x farther for overview)
    
    // Rotation limits (prevent flipping upside down)
    controls.minPolarAngle = Math.PI / 6 // 30° (can see from above)
    controls.maxPolarAngle = (5 * Math.PI) / 6 // 150° (can see from below)
    
    // Allow full 360° horizontal rotation
    controls.minAzimuthAngle = -Infinity
    controls.maxAzimuthAngle = Infinity
    
    // Touch controls optimized for mobile
    controls.touches = {
      ONE: THREE.TOUCH.ROTATE,    // 1 finger = rotate
      TWO: THREE.TOUCH.DOLLY_PAN  // 2 fingers = zoom + pan simultaneously
    }
    
    // Mouse controls for desktop
    controls.mouseButtons = {
      LEFT: THREE.MOUSE.ROTATE,   // Left click + drag = rotate
      MIDDLE: THREE.MOUSE.DOLLY,  // Middle mouse = zoom
      RIGHT: THREE.MOUSE.PAN      // Right click + drag = pan
    }
    
    controls.enabled = false // Disabled by default, enable with UI toggle
    orbitControlsRef.current = controls
    console.log('✅ OrbitControls created (full 3D navigation: rotate + zoom + pan in all directions)')

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
      uvArray[i] = 1 - uvArray[i] // Flip horizontally (mirror correction)
      uvArray[i + 1] = uvArray[i + 1] // Keep vertical orientation
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
          // Show full video feed in live view (no masking)
          // Mask will be applied only when capturing the photo
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
    videoPlane.visible = true // Show background video - displays real camera feed
    scene.add(videoPlane)
    console.log(`Video plane visible - shows real camera feed as background`)

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

    // Cylinder material: Transparent, only for raycasting (point selection)
    // Video is shown as flat background, not mapped on cylinder
    const cylinderMaterial = new THREE.MeshBasicMaterial({
      color: 0x0066CC,
      transparent: true,
      opacity: 0.15, // Very transparent - just for reference
      side: THREE.DoubleSide,
      depthWrite: false
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
          
          // Capture from canvas and apply cylindrical mask manually
          const canvas = rendererRef.current.domElement
          
          // Create temporary canvas for masking
          const tempCanvas = document.createElement('canvas')
          tempCanvas.width = canvas.width
          tempCanvas.height = canvas.height
          const tempCtx = tempCanvas.getContext('2d')
          
          if (tempCtx) {
            // Draw the full video frame
            tempCtx.drawImage(canvas, 0, 0)
            
            // Apply cylindrical mask
            // Calculate cylinder screen bounds (approximate - based on visible area)
            const centerX = tempCanvas.width / 2
            const centerY = tempCanvas.height / 2
            const cylinderWidth = tempCanvas.width * 0.3 // Cylinder ~30% of screen width
            const cylinderHeight = tempCanvas.height * 0.85 // Cylinder ~85% of screen height
            
            // Create mask: keep only cylinder area
            tempCtx.globalCompositeOperation = 'destination-in'
            
            // Draw elliptical mask (cylinder viewed from front)
            tempCtx.beginPath()
            const radiusX = cylinderWidth / 2
            const radiusY = cylinderHeight / 2
            tempCtx.ellipse(centerX, centerY, radiusX, radiusY, 0, 0, Math.PI * 2)
            tempCtx.fillStyle = 'white'
            tempCtx.fill()
          }
          
          const imageDataUrl = tempCanvas.toDataURL('image/jpeg', 0.95)
          
          console.log('✅ Scene captured with cylindrical mask applied')
          console.log(`   Canvas size: ${canvas.width}x${canvas.height}`)
          console.log(`   Mask: Elliptical area centered, keeping only cylinder region`)
          
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

  // Handle point dragging (mousemove and touchmove)
  useEffect(() => {
    if (!draggingPoint || !rendererRef.current || !localCameraRef.current || !sceneRef.current) return

    console.log(`🖐️ Point dragging active: ${draggingPoint.trioId} / ${draggingPoint.pointId}`)

    const handleMove = (clientX: number, clientY: number) => {
      const canvas = rendererRef.current!.domElement
      const rect = canvas.getBoundingClientRect()
      
      const x = clientX - rect.left
      const y = clientY - rect.top
      const ndcX = (x / rect.width) * 2 - 1
      const ndcY = -(y / rect.height) * 2 + 1

      const raycaster = new THREE.Raycaster()
      raycaster.setFromCamera(new THREE.Vector2(ndcX, ndcY), localCameraRef.current!)

      const meshes = sceneRef.current!.children.filter(obj => 
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
      }
    }

    const handleMouseMove = (e: MouseEvent) => {
      e.preventDefault()
      handleMove(e.clientX, e.clientY)
    }

    const handleTouchMove = (e: TouchEvent) => {
      e.preventDefault()
      if (e.touches.length > 0) {
        handleMove(e.touches[0].clientX, e.touches[0].clientY)
      }
    }

    const handleEnd = () => {
      console.log('✅ Point drag ended')
      setDraggingPoint(null)
    }

    // Add global listeners
    window.addEventListener('mousemove', handleMouseMove)
    window.addEventListener('mouseup', handleEnd)
    window.addEventListener('touchmove', handleTouchMove, { passive: false })
    window.addEventListener('touchend', handleEnd)

    return () => {
      window.removeEventListener('mousemove', handleMouseMove)
      window.removeEventListener('mouseup', handleEnd)
      window.removeEventListener('touchmove', handleTouchMove)
      window.removeEventListener('touchend', handleEnd)
    }
  }, [draggingPoint, trioManager])

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

  // Calculate and emit virtual cylinder border positions (for edge alignment overlay)
  useEffect(() => {
    if (!isReady || !localCameraRef.current || !containerSize.width || !onVirtualBorderPositionsUpdate) {
      return
    }

    const project3DTo2D = (x: number, y: number, z: number) => {
      const vector = new THREE.Vector3(x, y, z)
      vector.project(localCameraRef.current!)
      
      return {
        x: (vector.x * 0.5 + 0.5) * containerSize.width,
        y: (-vector.y * 0.5 + 0.5) * containerSize.height
      }
    }

    // Virtual cylinder borders are at x = ±radius, y = 0, z = middle height
    const radius = GEOSTXR_CONFIG.CYLINDER.RADIUS
    const midHeight = GEOSTXR_CONFIG.CYLINDER.HEIGHT / 2

    // Project left border (x = -radius) and right border (x = +radius)
    const leftBorderPos = project3DTo2D(-radius, 0, midHeight)
    const rightBorderPos = project3DTo2D(radius, 0, midHeight)

    // Emit positions to parent component
    onVirtualBorderPositionsUpdate(
      leftBorderPos.x,
      rightBorderPos.x,
      containerSize.width,
      containerSize.height
    )
  }, [isReady, containerSize, onVirtualBorderPositionsUpdate])

  // Handle clicks/drags on cylinder to add or reposition points
  const handleCanvasClick = useCallback((event: React.MouseEvent<HTMLDivElement>) => {
    if (!trioManager || !localCameraRef.current || !containerRef.current || !rendererRef.current) return

    // If currently dragging a point, ignore clicks (drag is handled by global listeners)
    if (draggingPoint) {
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
            {controlsEnabled ? '1 dedo: rotar | 2 dedos: panear | pinch: zoom' : 'Click para habilitar rotación/zoom/pan'}
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
