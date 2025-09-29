"use client"

import { useState, useEffect, useCallback } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Target, Ruler, Download, Settings, Play, Pause, Crosshair, Layers, FileText, Menu, X } from "lucide-react"
import { CameraView } from "@/components/camera-view"
import { ControlPanel } from "@/components/control-panel"
import { MeasurementReport } from "@/components/measurement-report"
import { PointManager } from "@/components/point-manager"
import { CameraWithCylinder } from "@/components/camera/camera-with-cylinder"

export default function GeoStVRApp() {
  const [isRecording, setIsRecording] = useState(false)
  const [cameraStarted, setCameraStarted] = useState(false)
  const [cameraStartRequested, setCameraStartRequested] = useState(false)
  const [measurementPoints, setMeasurementPoints] = useState<
    Array<{
      id: string
      x: number
      y: number
      depth: number
      label: string
      timestamp: number
      isCylinder?: boolean
      trioId?: string
    }>
  >([])
  const [currentTrio, setCurrentTrio] = useState(1)
  const [currentAngle, setCurrentAngle] = useState<number | null>(null)
  const [activeMode, setActiveMode] = useState<"measure" | "track" | "calculate">("measure")
  const [cylinderDetected, setCylinderDetected] = useState(false)
  const [alignmentScore, setAlignmentScore] = useState(0)
  const [capturedImages, setCapturedImages] = useState<string[]>([])
  const [requestingPermission, setRequestingPermission] = useState(false)
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const [showVirtualCylinder, setShowVirtualCylinder] = useState(false)

  const handleAddPoint = (x: number, y: number) => {
    // Get current trio points
    const currentTrioPoints = measurementPoints.filter(p => p.trioId === `trio-${currentTrio}`)
    
    // If trio is complete (3 points), start a new trio
    if (currentTrioPoints.length >= 3) {
      setCurrentTrio(prev => prev + 1)
    }
    
    const newTrioId = `trio-${currentTrio}`
    const newPoint = {
      id: `point-${Date.now()}`,
      x,
      y,
      depth: Math.random() * 10 + 1, // Simulated depth
      label: `T${currentTrio}P${currentTrioPoints.length + 1}`,
      timestamp: Date.now(),
      isCylinder: false,
      trioId: newTrioId,
    }
    setMeasurementPoints((prev) => [...prev, newPoint])
  }

  const handleCylinderDetection = (isDetected: boolean, score: number) => {
    setCylinderDetected(isDetected)
    setAlignmentScore(score)
    
    // Auto-capture when cylinder is well-aligned (score > 80%)
    if (isDetected && score > 80) {
      captureImage()
    }
  }

  const handlePermissionRequest = useCallback((isRequesting: boolean) => {
    setRequestingPermission(isRequesting)
  }, [])

  const handleCameraStarted = useCallback((started: boolean) => {
    setCameraStarted(started)
    if (started) {
      setCameraStartRequested(false) // Reset the request flag
    }
  }, [])

  const captureImage = () => {
    const canvas = document.createElement('canvas')
    const video = document.querySelector('video')
    if (!video) return

    canvas.width = video.videoWidth
    canvas.height = video.videoHeight
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    ctx.drawImage(video, 0, 0)
    const imageData = canvas.toDataURL('image/jpeg', 0.8)
    
    setCapturedImages(prev => [...prev, imageData])
    
    // Add cylinder point automatically
    const cylinderPoint = {
      id: `cylinder-${Date.now()}`,
      x: 50, // Center of screen
      y: 50,
      depth: Math.random() * 10 + 1,
      label: `C${Math.floor(capturedImages.length / 3) + 1}`,
      timestamp: Date.now(),
      isCylinder: true,
    }
    setMeasurementPoints(prev => [...prev, cylinderPoint])
  }

  const calculateAngle = () => {
    if (measurementPoints.length >= 3) {
      // Simplified angle calculation for demo
      const angle = Math.random() * 180
      setCurrentAngle(angle)
    }
  }

  useEffect(() => {
    if (measurementPoints.length >= 3) {
      calculateAngle()
    }
  }, [measurementPoints])

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm">
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <Target className="h-6 w-6 text-primary" />
              <h1 className="text-xl font-bold text-balance">GeoStVR</h1>
            </div>
            <Badge variant="secondary" className="text-xs">
              v31
            </Badge>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant={cameraStarted ? "destructive" : "default"}
              size="sm"
              onClick={() => {
                if (cameraStarted) {
                  setCameraStarted(false)
                  setCameraStartRequested(false)
                  setIsRecording(false)
                } else {
                  setCameraStartRequested(true)
                  setIsRecording(true)
                }
              }}
              className="gap-2"
            >
              {cameraStarted ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
              {cameraStarted ? "Stop" : "Start"}
            </Button>
            <Button variant="outline" size="sm">
              <Settings className="h-4 w-4" />
            </Button>
            
            {/* Mobile Burger Menu Button */}
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="gap-2"
              style={{ 
                display: 'block',
                backgroundColor: '#374151',
                border: '1px solid #6b7280',
                color: '#ffffff',
                padding: '0.5rem',
                borderRadius: '0.375rem',
                cursor: 'pointer',
                minWidth: '40px',
                minHeight: '40px'
              }}
            >
              {isSidebarOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
            </Button>
          </div>
        </div>
      </header>

      <div className="flex h-[calc(100vh-73px)] relative">
        {/* Mobile Backdrop Overlay */}
        {isSidebarOpen && (
          <div 
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: 'rgba(0, 0, 0, 0.5)',
              zIndex: 40
            }}
            onClick={() => setIsSidebarOpen(false)}
          />
        )}
        
        {/* Main Camera View */}
        <div 
          className="flex-1 relative"
          style={{
            width: isSidebarOpen ? 'calc(100% - 320px)' : '100%',
            transition: 'width 0.3s ease-in-out'
          }}
        >
          {showVirtualCylinder ? (
            <CameraWithCylinder />
          ) : (
            <CameraView
              onAddPoint={handleAddPoint}
              measurementPoints={measurementPoints}
              isRecording={isRecording}
              activeMode={activeMode}
              onCylinderDetection={handleCylinderDetection}
              shouldStartCamera={cameraStartRequested}
              onPermissionRequest={handlePermissionRequest}
              onCaptureImage={captureImage}
              onCameraStarted={handleCameraStarted}
            />
          )}

          {/* Vertical Alignment Guide */}
          <div className={`cylinder-alignment-guide ${cylinderDetected ? 'active' : ''}`} />

          {/* Cylinder Detection Overlay */}
          <div className={`cylinder-detection-overlay ${cylinderDetected ? 'detected' : ''}`} />

          {/* Mode Selector */}
          <div className="absolute top-4 left-4 flex gap-2">
            <Button
              variant={activeMode === "measure" ? "default" : "outline"}
              size="sm"
              onClick={() => setActiveMode("measure")}
              className="gap-2"
            >
              <Ruler className="h-4 w-4" />
              Measure
            </Button>
            <Button
              variant={activeMode === "track" ? "default" : "outline"}
              size="sm"
              onClick={() => setActiveMode("track")}
              className="gap-2"
            >
              <Crosshair className="h-4 w-4" />
              Track
            </Button>
            <Button
              variant={activeMode === "calculate" ? "default" : "outline"}
              size="sm"
              onClick={() => setActiveMode("calculate")}
              className="gap-2"
            >
              <Layers className="h-4 w-4" />
              Calculate
            </Button>
            <Button
              variant={showVirtualCylinder ? "default" : "outline"}
              size="sm"
              onClick={() => setShowVirtualCylinder(!showVirtualCylinder)}
              className="gap-2"
            >
              <Target className="h-4 w-4" />
              {showVirtualCylinder ? "Hide Cylinder" : "Show Cylinder"}
            </Button>
          </div>

          {/* Status Indicator */}
          <div className="absolute top-4 right-4 space-y-2">
            <Card className="p-3">
              <div className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${
                  requestingPermission ? "bg-warning animate-pulse" : 
                  cameraStarted ? "bg-destructive animate-pulse" : "bg-muted"
                }`} />
                <span className="text-sm font-mono">
                  {requestingPermission ? "REQUESTING..." : 
                   cameraStarted ? "CAMERA ON" : "CAMERA OFF"}
                </span>
              </div>
            </Card>
            
            {/* Cylinder Detection Status */}
            {cameraStarted && (
              <Card className="p-3">
                <div className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${cylinderDetected ? "bg-accent animate-pulse" : "bg-muted"}`} />
                  <span className="text-sm font-mono">
                    {cylinderDetected ? `CYLINDER ${alignmentScore}%` : "SCANNING"}
                  </span>
                </div>
              </Card>
            )}
          </div>
        </div>

        {/* Right Sidebar */}
        <div 
          className="w-80 border-l border-border bg-card/30 backdrop-blur-sm flex flex-col"
          style={{
            position: 'fixed',
            right: 0,
            top: '73px',
            height: 'calc(100vh - 73px)',
            zIndex: 50,
            transform: isSidebarOpen ? 'translateX(0)' : 'translateX(100%)',
            opacity: isSidebarOpen ? 1 : 0,
            pointerEvents: isSidebarOpen ? 'auto' : 'none',
            transition: 'all 0.3s ease-in-out',
            backgroundColor: 'rgba(0, 0, 0, 0.8)',
            backdropFilter: 'blur(4px)',
            borderLeft: '1px solid #333'
          }}
        >
          {/* Control Panel */}
          <div className="p-4 border-b border-border">
            <ControlPanel
              onReset={() => setMeasurementPoints([])}
              onCalculate={calculateAngle}
              activeMode={activeMode}
              isRecording={cameraStarted}
            />
          </div>

          {/* Point Manager */}
          <div className="p-4 border-b border-border">
            <PointManager
              points={measurementPoints}
              onRemovePoint={(id) => setMeasurementPoints((prev) => prev.filter((p) => p.id !== id))}
            />
          </div>

          {/* Measurement Report */}
          <div className="flex-1 p-4">
            <MeasurementReport points={measurementPoints} currentAngle={currentAngle} />
          </div>

          {/* Export Actions */}
          <div className="p-4 border-t border-border">
            <div className="space-y-2">
              <Button className="w-full gap-2" disabled={measurementPoints.length === 0}>
                <Download className="h-4 w-4" />
                Export Report
              </Button>
              <Button variant="outline" className="w-full gap-2 bg-transparent">
                <FileText className="h-4 w-4" />
                Save Session
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
