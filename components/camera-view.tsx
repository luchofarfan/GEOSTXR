"use client"

import type React from "react"

import { useRef, useEffect, useState } from "react"
import { Card } from "@/components/ui/card"

interface Point {
  id: string
  x: number
  y: number
  depth: number
  label: string
  timestamp: number
  isCylinder?: boolean
  trioId?: string
}

interface CameraViewProps {
  onAddPoint: (x: number, y: number) => void
  measurementPoints: Point[]
  isRecording: boolean
  activeMode: "measure" | "track" | "calculate"
  onCylinderDetection: (isDetected: boolean, score: number) => void
  shouldStartCamera: boolean
  onPermissionRequest?: (isRequesting: boolean) => void
  onCaptureImage?: () => void
  onCameraStarted?: (started: boolean) => void
}

export function CameraView({ onAddPoint, measurementPoints, isRecording, activeMode, onCylinderDetection, shouldStartCamera, onPermissionRequest, onCaptureImage, onCameraStarted }: CameraViewProps) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const detectionCanvasRef = useRef<HTMLCanvasElement>(null)
  const [stream, setStream] = useState<MediaStream | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [detectionInterval, setDetectionInterval] = useState<NodeJS.Timeout | null>(null)
  const [cameraStarted, setCameraStarted] = useState(false)
  const [requestingPermission, setRequestingPermission] = useState(false)
  const [isSecureContext, setIsSecureContext] = useState(true)
  const [cylinderDetected, setCylinderDetected] = useState(false)
  const [alignmentScore, setAlignmentScore] = useState(0)
  const requestingRef = useRef(false)
  const cameraInitializedRef = useRef(false)

  // Debug function to test camera access
  const testCameraAccess = async () => {
    if (typeof window === 'undefined') return
    
    try {
      console.log("Testing camera access...")
      console.log("Secure context:", window.isSecureContext)
      console.log("Hostname:", window.location.hostname)
      console.log("MediaDevices available:", !!navigator.mediaDevices)
      console.log("getUserMedia available:", !!navigator.mediaDevices?.getUserMedia)
      
      const stream = await navigator.mediaDevices.getUserMedia({ video: true })
      console.log("Camera access successful!", stream)
      stream.getTracks().forEach(track => track.stop())
    } catch (err) {
      console.error("Camera access failed:", err)
    }
  }

  // Make test function available globally for debugging
  useEffect(() => {
    if (typeof window !== 'undefined') {
      (window as any).testCameraAccess = testCameraAccess
    }
  }, [])

  // Check secure context on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      setIsSecureContext(window.isSecureContext || window.location.hostname === 'localhost')
    }
  }, [])

  // Cylinder detection function
  const detectCylinder = () => {
    const video = videoRef.current
    const canvas = detectionCanvasRef.current
    if (!video || !canvas || video.videoWidth === 0) {
      console.log("Detection skipped - video not ready:", { video: !!video, canvas: !!canvas, width: video?.videoWidth })
      return
    }

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // Set canvas size to match video
    canvas.width = video.videoWidth
    canvas.height = video.videoHeight

    // Draw current video frame
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height)

    // Get image data for analysis
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
    const data = imageData.data

    // Enhanced cylinder detection algorithm
    const centerX = Math.floor(canvas.width / 2)
    const centerY = Math.floor(canvas.height / 2)
    const detectionRadius = Math.min(canvas.width, canvas.height) * 0.2 // Increased radius

    let edgeCount = 0
    let darkPixelCount = 0
    let totalPixels = 0
    const samplePoints = 36 // Increased sample points

    // Sample points around the center to detect edges and contrast
    for (let i = 0; i < samplePoints; i++) {
      const angle = (i / samplePoints) * Math.PI * 2
      const x = Math.floor(centerX + Math.cos(angle) * detectionRadius)
      const y = Math.floor(centerY + Math.sin(angle) * detectionRadius)
      
      if (x >= 0 && x < canvas.width && y >= 0 && y < canvas.height) {
        const pixelIndex = (y * canvas.width + x) * 4
        const r = data[pixelIndex]
        const g = data[pixelIndex + 1]
        const b = data[pixelIndex + 2]
        
        // Calculate brightness
        const brightness = (r + g + b) / 3
        totalPixels++
        
        // Count dark pixels (potential edges)
        if (brightness < 100) {
          darkPixelCount++
          edgeCount++
        }
      }
    }

    // Calculate detection score based on contrast and edge density
    const edgeScore = (edgeCount / samplePoints) * 100
    const contrastScore = (darkPixelCount / totalPixels) * 100
    const combinedScore = (edgeScore + contrastScore) / 2
    
    // More sensitive detection
    const isDetected = combinedScore > 15 // Much lower threshold
    const alignmentScore = Math.min(combinedScore * 3, 100) // Boost the score

    // Only update if there's a significant change to avoid flickering
    if (Math.abs(alignmentScore - alignmentScore) > 5) {
      setCylinderDetected(isDetected)
      setAlignmentScore(alignmentScore)
      onCylinderDetection(isDetected, alignmentScore)
    }
  }

  // Camera management effect
  useEffect(() => {
    console.log("Camera effect triggered:", { 
      shouldStartCamera, 
      cameraStarted, 
      requestingPermission, 
      requestingRef: requestingRef.current, 
      cameraInitializedRef: cameraInitializedRef.current 
    })
    
    if (shouldStartCamera && !cameraStarted && !requestingPermission && !requestingRef.current && !cameraInitializedRef.current) {
      console.log("Starting camera...")
      cameraInitializedRef.current = true
      
      const startCamera = async () => {
        try {
          requestingRef.current = true
          setRequestingPermission(true)
          setError(null)
          onPermissionRequest?.(true)
          
          // Check if getUserMedia is supported
          if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
            throw new Error("Camera not supported on this device")
          }

          // Check if we're in a secure context
          if (typeof window !== 'undefined' && !window.isSecureContext && window.location.hostname !== 'localhost') {
            throw new Error("Camera access requires HTTPS or localhost")
          }

          console.log("Requesting camera access...")
          
          // Check current permission status first
          const permissionStatus = await navigator.permissions?.query({ name: 'camera' as PermissionName })
          console.log("Current camera permission status:", permissionStatus?.state)
          
          // Request camera permission - this will trigger the browser's permission dialog
          let mediaStream
          try {
            // Try with specific constraints first
            mediaStream = await navigator.mediaDevices.getUserMedia({
              video: {
                width: { ideal: 1920 },
                height: { ideal: 1080 },
                facingMode: "environment",
              },
            })
          } catch (firstError) {
            console.log("First attempt failed, trying with basic constraints:", firstError)
            // If that fails, try with basic constraints
            try {
              mediaStream = await navigator.mediaDevices.getUserMedia({
                video: true
              })
            } catch (secondError) {
              console.log("Second attempt failed, trying with user-facing camera:", secondError)
              // If that fails, try with user-facing camera
              mediaStream = await navigator.mediaDevices.getUserMedia({
                video: {
                  facingMode: "user"
                }
              })
            }
          }

          console.log("=== NEW CODE VERSION ===")
          console.log("Camera access granted!")
          console.log("MediaStream received:", mediaStream)
          console.log("About to set states...")
          
          try {
            requestingRef.current = false
            setRequestingPermission(false)
            onPermissionRequest?.(false)
            setStream(mediaStream)
            setError(null)
            setCameraStarted(true)
            onCameraStarted?.(true)
            
            console.log("All states set successfully")
            console.log("Video element exists:", !!videoRef.current)
          } catch (error) {
            console.error("Error setting states:", error)
          }
          
          if (videoRef.current) {
            console.log("Setting video srcObject...")
            videoRef.current.srcObject = mediaStream
            console.log("Video srcObject set successfully")
            
            // Try to play the video
            videoRef.current.play().then(() => {
              console.log("Video started playing successfully")
            }).catch((err) => {
              console.error("Video play failed:", err)
            })

            // Start cylinder detection when video is ready
            videoRef.current.onloadedmetadata = () => {
              console.log("Video metadata loaded, starting cylinder detection...")
              console.log("Video dimensions:", videoRef.current?.videoWidth, "x", videoRef.current?.videoHeight)
              console.log("Video ready state:", videoRef.current?.readyState)
              console.log("Video srcObject:", videoRef.current?.srcObject)
              console.log("Video currentTime:", videoRef.current?.currentTime)
              const interval = setInterval(detectCylinder, 100) // Check every 100ms
              setDetectionInterval(interval)
            }

            // Ensure video plays
            videoRef.current.oncanplay = () => {
              console.log("Video can play, attempting to play...")
              videoRef.current?.play().catch(console.error)
            }

            // Add more event listeners for debugging
            videoRef.current.onloadstart = () => console.log("Video load started")
            videoRef.current.onloadeddata = () => console.log("Video data loaded")
            videoRef.current.oncanplaythrough = () => console.log("Video can play through")
            videoRef.current.onplay = () => console.log("Video started playing")
            videoRef.current.onerror = (e) => console.error("Video error:", e)
          } else {
            console.log("ERROR: videoRef.current is null! Video element not rendered yet.")
            console.log("Stream already set, useEffect will handle connecting to video element when it's rendered")
          }
        } catch (err: any) {
          console.error("Camera access error:", err)
          requestingRef.current = false
          setRequestingPermission(false)
          onPermissionRequest?.(false)
          cameraInitializedRef.current = false
          
          // Provide specific error messages based on the error type
          if (err.name === 'NotAllowedError') {
            setError("Camera access denied. Please allow camera permissions and try again.")
          } else if (err.name === 'NotFoundError') {
            setError("No camera found on this device.")
          } else if (err.name === 'NotReadableError') {
            setError("Camera is already in use by another application.")
          } else if (err.name === 'OverconstrainedError') {
            setError("Camera constraints cannot be satisfied.")
          } else {
            setError(`Camera access error: ${err.message || "Unknown error"}`)
          }
        }
      }

      startCamera()
    } else if (!shouldStartCamera && cameraStarted) {
      // Stop camera when shouldStartCamera becomes false
      cameraInitializedRef.current = false
      if (stream) {
        stream.getTracks().forEach((track) => track.stop())
        setStream(null)
        setCameraStarted(false)
        onCameraStarted?.(false)
      }
      if (detectionInterval) {
        clearInterval(detectionInterval)
        setDetectionInterval(null)
      }
    }
  }, [shouldStartCamera])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (stream) {
        stream.getTracks().forEach((track) => track.stop())
      }
      if (detectionInterval) {
        clearInterval(detectionInterval)
      }
    }
  }, [])

  const handleCanvasClick = (event: React.MouseEvent<HTMLCanvasElement>) => {
    if (activeMode !== "measure") return

    const canvas = canvasRef.current
    if (!canvas) return

    const rect = canvas.getBoundingClientRect()
    const x = ((event.clientX - rect.left) / rect.width) * 100
    const y = ((event.clientY - rect.top) / rect.height) * 100

    onAddPoint(x, y)
  }

  // Debug effect to monitor video element
  useEffect(() => {
    if (videoRef.current) {
      console.log("Video element exists:", videoRef.current)
      console.log("Video srcObject:", videoRef.current.srcObject)
      console.log("Video readyState:", videoRef.current.readyState)
      console.log("Video videoWidth:", videoRef.current.videoWidth)
      console.log("Video videoHeight:", videoRef.current.videoHeight)
      console.log("Video currentTime:", videoRef.current.currentTime)
      console.log("Video paused:", videoRef.current.paused)
      console.log("Video ended:", videoRef.current.ended)
      
      // If we have a stream but no srcObject, set it now
      if (stream && !videoRef.current.srcObject) {
        console.log("Retrying to set video srcObject...")
        videoRef.current.srcObject = stream
        videoRef.current.play().catch(console.error)
      }
    }
  }, [cameraStarted, stream])

  // Single render function with conditional content
  return (
    <>
      {error && (
        <div className="flex-1 flex items-center justify-center bg-muted/20">
          <Card className="p-8 text-center max-w-md">
            <h3 className="text-lg font-semibold mb-2">Camera Access Required</h3>
            <p className="text-muted-foreground mb-4">{error}</p>
            <div className="space-y-3">
              <p className="text-sm text-muted-foreground">
                To fix this issue:
              </p>
              <div className="text-sm text-muted-foreground space-y-1">
                <p>• Check your browser's address bar for a camera icon</p>
                <p>• Click the camera icon and select "Allow"</p>
                <p>• Or refresh the page and try again</p>
              </div>
              <button 
                onClick={() => {
                  setError(null)
                  setCameraStarted(false)
                  setRequestingPermission(false)
                  requestingRef.current = false
                  cameraInitializedRef.current = false
                }}
                className="mt-4 px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
              >
                Try Again
              </button>
            </div>
          </Card>
        </div>
      )}

      {requestingPermission && (
        <div className="flex-1 flex items-center justify-center bg-muted/20">
          <Card className="p-8 text-center max-w-md">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <h3 className="text-lg font-semibold mb-2">Requesting Camera Access</h3>
            <p className="text-muted-foreground mb-4">Please allow camera permissions in your browser</p>
            <p className="text-sm text-muted-foreground">Check your browser's address bar for the permission prompt</p>
          </Card>
        </div>
      )}

      {!shouldStartCamera && !error && !requestingPermission && (
        <div className="flex-1 flex items-center justify-center bg-muted/20">
          <Card className="p-8 text-center max-w-md">
            <h3 className="text-lg font-semibold mb-2">Ready to Start</h3>
            <p className="text-muted-foreground mb-4">Click the Start button to begin cylinder detection</p>
            <div className="space-y-2 text-sm text-muted-foreground">
              <p>• Your browser will ask for camera permission</p>
              <p>• Allow access to enable cylinder detection</p>
              <p>• The camera will start looking for cylinders automatically</p>
            </div>
            {!isSecureContext && (
              <div className="mt-4 p-3 bg-warning/10 border border-warning/20 rounded-md">
                <p className="text-sm text-warning">
                  ⚠️ Camera access requires HTTPS or localhost
                </p>
              </div>
            )}
            <button 
              onClick={testCameraAccess}
              className="mt-4 px-4 py-2 bg-secondary text-secondary-foreground rounded-md hover:bg-secondary/90 transition-colors text-sm"
            >
              Test Camera Access
            </button>
          </Card>
        </div>
      )}

      {shouldStartCamera && !error && !requestingPermission && (
        <div className="relative w-full h-full bg-black">
          {/* Video Stream */}
          <video 
            ref={videoRef} 
            autoPlay 
            playsInline 
            muted 
            className="w-full h-full object-cover"
            onLoadStart={() => console.log("Video onLoadStart")}
            onLoadedData={() => console.log("Video onLoadedData")}
            onLoadedMetadata={() => console.log("Video onLoadedMetadata")}
            onCanPlay={() => console.log("Video onCanPlay")}
            onCanPlayThrough={() => console.log("Video onCanPlayThrough")}
            onPlay={() => console.log("Video onPlay")}
            onPlaying={() => console.log("Video onPlaying")}
            onError={(e) => console.error("Video onError:", e)}
            style={{ 
              backgroundColor: 'black',
              minHeight: '100%',
              minWidth: '100%',
              border: '2px solid red', // Temporary border to see if video element is visible
              display: 'block',
              visibility: 'visible',
              opacity: 1
            }}
          />
          
          {/* Temporary test overlay to see if video area is visible */}
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-white text-2xl font-bold bg-red-500/50 px-4 py-2 rounded">
              VIDEO AREA TEST
            </div>
          </div>
          
          {/* Video Status Indicator */}
          <div className="absolute top-4 left-4 bg-black/80 text-white px-3 py-2 rounded-md text-sm font-mono">
            <div className="flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full ${cameraStarted ? 'bg-green-500' : 'bg-red-500'}`} />
              <span>{cameraStarted ? 'Video Active' : 'Video Loading...'}</span>
            </div>
            {videoRef.current && (
              <div className="text-xs mt-1">
                Size: {videoRef.current.videoWidth}x{videoRef.current.videoHeight}
              </div>
            )}
          </div>

          {/* Hidden Detection Canvas */}
          <canvas
            ref={detectionCanvasRef}
            className="hidden"
            style={{ display: 'none' }}
          />

          {/* AR Overlay Canvas */}
          <canvas
            ref={canvasRef}
            className="absolute inset-0 w-full h-full cursor-crosshair camera-overlay"
            onClick={handleCanvasClick}
            onTouchEnd={(e) => {
              e.preventDefault()
              const rect = canvasRef.current?.getBoundingClientRect()
              if (rect) {
                const touch = e.changedTouches[0]
                const x = ((touch.clientX - rect.left) / rect.width) * 100
                const y = ((touch.clientY - rect.top) / rect.height) * 100
                handleCanvasClick({ clientX: touch.clientX, clientY: touch.clientY } as any)
              }
            }}
          />

          {/* Cylinder Detection Overlay */}
          <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
            <div className={`w-32 h-32 border-2 border-dashed rounded-full flex items-center justify-center transition-colors ${
              cylinderDetected ? 'border-accent bg-accent/10' : 'border-primary'
            }`}>
              <div className={`w-24 h-24 border rounded-full flex items-center justify-center transition-colors ${
                cylinderDetected ? 'border-accent/70 bg-accent/5' : 'border-primary/50'
              }`}>
                <div className={`w-16 h-16 border rounded-full transition-colors ${
                  cylinderDetected ? 'border-accent/50 bg-accent/5' : 'border-primary/30'
                }`}></div>
              </div>
            </div>
          </div>

          {/* Manual Capture Button */}
          <div className="absolute bottom-4 right-4">
            <button
              onClick={onCaptureImage}
              className="bg-primary/90 hover:bg-primary text-primary-foreground p-4 md:p-3 rounded-full shadow-lg transition-colors touch-manipulation"
              title="Capture Image"
              style={{ minWidth: '48px', minHeight: '48px' }}
            >
              <svg className="w-8 h-8 md:w-6 md:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </button>
          </div>

          {/* Measurement Points */}
          {measurementPoints.map((point) => {
            // Get trio color based on trioId
            const trioNumber = point.trioId ? parseInt(point.trioId.split('-')[1]) : 1
            const trioColors = ['bg-blue-500', 'bg-green-500', 'bg-yellow-500', 'bg-red-500', 'bg-purple-500', 'bg-pink-500']
            const trioColor = trioColors[(trioNumber - 1) % trioColors.length]
            
            return (
              <div
                key={point.id}
                className={`absolute w-4 h-4 rounded-full transform -translate-x-1/2 -translate-y-1/2 flex items-center justify-center ${
                  point.isCylinder ? 'cylinder-point' : 'ar-point'
                }`}
                style={{
                  left: `${point.x}%`,
                  top: `${point.y}%`,
                }}
              >
                <div className={`w-3 h-3 rounded-full border-2 border-white ${point.isCylinder ? 'bg-accent' : trioColor}`} />
                <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-black/80 text-white text-xs px-2 py-1 rounded whitespace-nowrap">
                  {point.label}
                </div>
              </div>
            )
          })}

          {/* Trio Connection Lines */}
          {measurementPoints.length > 0 && (
            <svg className="absolute inset-0 w-full h-full pointer-events-none">
              {/* Group points by trio */}
              {Object.entries(
                measurementPoints.reduce((acc, point) => {
                  const trioId = point.trioId || 'trio-1'
                  if (!acc[trioId]) acc[trioId] = []
                  acc[trioId].push(point)
                  return acc
                }, {} as Record<string, Point[]>)
              ).map(([trioId, trioPoints]) => {
                const trioNumber = parseInt(trioId.split('-')[1])
                const trioColors = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899']
                const trioColor = trioColors[(trioNumber - 1) % trioColors.length]
                
                // Draw triangle for each trio with 3 points
                if (trioPoints.length >= 3) {
                  const [p1, p2, p3] = trioPoints.slice(0, 3)
                  return (
                    <g key={trioId}>
                      {/* Triangle lines */}
                      <line
                        x1={`${p1.x}%`}
                        y1={`${p1.y}%`}
                        x2={`${p2.x}%`}
                        y2={`${p2.y}%`}
                        stroke={trioColor}
                        strokeWidth="2"
                        strokeDasharray="5,5"
                        opacity="0.7"
                      />
                      <line
                        x1={`${p2.x}%`}
                        y1={`${p2.y}%`}
                        x2={`${p3.x}%`}
                        y2={`${p3.y}%`}
                        stroke={trioColor}
                        strokeWidth="2"
                        strokeDasharray="5,5"
                        opacity="0.7"
                      />
                      <line
                        x1={`${p3.x}%`}
                        y1={`${p3.y}%`}
                        x2={`${p1.x}%`}
                        y2={`${p1.y}%`}
                        stroke={trioColor}
                        strokeWidth="2"
                        strokeDasharray="5,5"
                        opacity="0.7"
                      />
                    </g>
                  )
                }
                
                // Draw lines for incomplete trios
                return trioPoints.slice(1).map((point, index) => {
                  const prevPoint = trioPoints[index]
                  return (
                    <line
                      key={`line-${prevPoint.id}-${point.id}`}
                      x1={`${prevPoint.x}%`}
                      y1={`${prevPoint.y}%`}
                      x2={`${point.x}%`}
                      y2={`${point.y}%`}
                      stroke={trioColor}
                      strokeWidth="2"
                      strokeDasharray="3,3"
                      opacity="0.5"
                    />
                  )
                })
              })}
            </svg>
          )}

          {/* Recording Indicator */}
          {isRecording && (
            <div className="absolute bottom-4 left-4 bg-destructive/90 text-destructive-foreground px-3 py-1 rounded-full text-sm font-mono flex items-center gap-2">
              <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
              REC
            </div>
          )}

          {/* Status Indicators */}
          <div className="absolute top-4 right-4 space-y-2">
            {/* Cylinder Detection Status */}
            <div className="bg-black/80 text-white px-3 py-2 rounded-md text-sm font-mono">
              <div className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full animate-pulse ${
                  cylinderDetected ? 'bg-accent' : 'bg-primary'
                }`} />
                <span>{cylinderDetected ? `Cylinder ${alignmentScore.toFixed(0)}%` : 'Camera Active'}</span>
              </div>
            </div>
            
            {/* Trio Progress Status */}
            {(() => {
              const currentTrioPoints = measurementPoints.filter(p => p.trioId === `trio-${Math.ceil(measurementPoints.length / 3)}`)
              const currentTrio = Math.ceil(measurementPoints.length / 3)
              const pointsInCurrentTrio = currentTrioPoints.length
              
              return (
                <div className="bg-black/80 text-white px-3 py-2 rounded-md text-sm font-mono">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-blue-500" />
                    <span>Trio {currentTrio}: {pointsInCurrentTrio}/3</span>
                  </div>
                  <div className="w-full bg-gray-600 rounded-full h-1 mt-1">
                    <div 
                      className="bg-blue-500 h-1 rounded-full transition-all duration-300" 
                      style={{ width: `${(pointsInCurrentTrio / 3) * 100}%` }}
                    />
                  </div>
                </div>
              )
            })()}
          </div>
        </div>
      )}
    </>
  )
}
