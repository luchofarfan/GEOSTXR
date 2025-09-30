'use client'

import React, { useRef, useEffect, useState, useCallback } from 'react'
import * as THREE from 'three'
import { GEOSTXR_CONFIG } from '@/lib/config'
import { BOHLinesOverlay } from './boh-lines-overlay'
import { PointMarkersOverlay } from './point-markers-overlay'

interface WebGLUnifiedCylinderProps {
  className?: string
  line1Angle?: number
  line2Angle?: number
  trioManager?: any // From usePointTrios hook
}

export default function WebGLUnifiedCylinder({ 
  className = '', 
  line1Angle = 90,
  line2Angle = 90,
  trioManager
}: WebGLUnifiedCylinderProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const videoRef = useRef<HTMLVideoElement>(null)
  const sceneRef = useRef<THREE.Scene | null>(null)
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null)
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null)
  const videoTextureRef = useRef<THREE.VideoTexture | null>(null)
  const [isReady, setIsReady] = useState(false)
  const [containerSize, setContainerSize] = useState({ width: 0, height: 0 })

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
    if (sceneRef.current) {
      console.log('Scene already initialized, skipping')
      return // Already initialized
    }

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
    cameraRef.current = camera
    console.log(`Camera at (0, ${distance.toFixed(1)}, ${cylinderCenter}), looking at (0, 0, ${cylinderCenter})`)

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
    scene.add(videoPlane)
    console.log(`Video plane positioned at (0, -0.1, ${cylinderHeight / 2})`)

    // Create cylinder (radius and cylinderHeight already defined above)
    // Cylinder from z=0 to z=30, centered at z=15
    const cylinderGeometry = new THREE.CylinderGeometry(radius, radius, cylinderHeight, 32)
    cylinderGeometry.rotateX(Math.PI / 2) // Align with Z-axis (vertical)

    const cylinderMaterial = new THREE.MeshBasicMaterial({
      color: 0x0066CC,
      transparent: true,
      opacity: 0.2, // More transparent to see video better
      side: THREE.DoubleSide,
      depthWrite: false
    })

    const cylinder = new THREE.Mesh(cylinderGeometry, cylinderMaterial)
    cylinder.position.set(0, 0, cylinderHeight / 2) // Move to z=0 to z=30 range
    scene.add(cylinder)

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
    
    console.log(`Cylinder positioned: z=0 to z=${cylinderHeight}cm, centered at z=${cylinderHeight/2}cm`)
    console.log(`Borders at x=±${radius}cm, from z=0 to z=${cylinderHeight}cm`)

    // BOH Lines now rendered via HTML overlay (no 3D geometry)

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

  // Handle clicks on cylinder to add points
  const handleCanvasClick = useCallback((event: React.MouseEvent<HTMLDivElement>) => {
    if (!trioManager || !cameraRef.current || !containerRef.current) return

    // Block interaction if first trio exists but has no depth
    if (trioManager.trios.length > 0 && !trioManager.trios[0].depth) {
      console.log('⚠️ Please enter depth for first trio before continuing')
      // Visual feedback
      const panel = document.querySelector('.boh-controls')
      if (panel) {
        panel.scrollTop = panel.scrollHeight
        // Flash effect
        const depthInput = panel.querySelector('[style*="border: 2px solid #3B82F6"]')
        if (depthInput) {
          (depthInput as HTMLElement).style.animation = 'pulse 0.5s ease-in-out 2'
        }
      }
      return
    }

    const rect = containerRef.current.getBoundingClientRect()
    const x = event.clientX - rect.left
    const y = event.clientY - rect.top

    // Convert screen coordinates to normalized device coordinates (-1 to +1)
    const ndcX = (x / rect.width) * 2 - 1
    const ndcY = -(y / rect.height) * 2 + 1

    // Create raycaster
    const raycaster = new THREE.Raycaster()
    raycaster.setFromCamera(new THREE.Vector2(ndcX, ndcY), cameraRef.current)

    // Check intersection with cylinder
    if (!sceneRef.current) return
    
    const intersects = raycaster.intersectObjects(sceneRef.current.children, true)
    
    if (intersects.length > 0) {
      const point = intersects[0].point
      console.log(`Click at 3D point: (${point.x.toFixed(2)}, ${point.y.toFixed(2)}, ${point.z.toFixed(2)})`)
      
      // Add point to trio manager (auto-completes internally at 3 points)
      trioManager.addPoint({ x: point.x, y: point.y, z: point.z })
    }
  }, [trioManager])

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
        cursor: trioManager && trioManager.canAddMoreTrios && !(trioManager.trios.length > 0 && !trioManager.trios[0].depth) ? 'crosshair' : 'not-allowed'
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
      
            {/* HTML Overlay for BOH lines */}
            {containerSize.width > 0 && isReady && (
              <BOHLinesOverlay 
                line1Angle={line1Angle}
                line2Angle={line2Angle}
                containerWidth={containerSize.width}
                containerHeight={containerSize.height}
                camera={cameraRef.current || undefined}
                cylinderHeight={GEOSTXR_CONFIG.CYLINDER.HEIGHT}
                radius={GEOSTXR_CONFIG.CYLINDER.RADIUS}
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
                camera={cameraRef.current || undefined}
                onPointClick={(trioId, pointId) => {
                  console.log(`Point clicked: trio=${trioId}, point=${pointId}`)
                  trioManager.selectTrio(trioId)
                }}
              />
            )}
    </div>
  )
}
