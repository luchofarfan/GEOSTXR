/**
 * Cylinder Detection Module
 * Analyzes video frames to detect cylinder edges and determine if ready for capture
 */

interface DetectionResult {
  isReady: boolean
  confidence: number
  hasVerticalEdges: boolean
  hasCurvedEdges: boolean
  centeredness: number
  estimatedDistance: number // Estimated distance in cm
  apparentWidth: number // Width in pixels
  leftEdgeX: number // Left edge X position in pixels
  rightEdgeX: number // Right edge X position in pixels
  edgeAlignmentQuality: number // 0-1, how well aligned with virtual cylinder
}

export class CylinderDetector {
  private canvas: HTMLCanvasElement
  private ctx: CanvasRenderingContext2D
  private detectionInterval: number | null = null
  private onReadyCallback: (() => void) | null = null
  private onDistanceUpdateCallback: ((distance: number) => void) | null = null
  private onEdgeDetectionCallback: ((leftX: number, rightX: number, quality: number) => void) | null = null
  private hasAutoCaptured = false
  
  // Known cylinder dimensions
  private readonly CYLINDER_REAL_DIAMETER = 6.35 // cm
  private readonly TARGET_DISTANCE = 26 // cm
  private readonly DISTANCE_TOLERANCE = 3 // ±3 cm

  constructor() {
    this.canvas = document.createElement('canvas')
    const ctx = this.canvas.getContext('2d', { willReadFrequently: true })
    if (!ctx) throw new Error('Could not create canvas context')
    this.ctx = ctx
  }

  /**
   * Start analyzing video frames for cylinder detection
   */
  startDetection(
    video: HTMLVideoElement, 
    onReady: () => void,
    onDistanceUpdate?: (distance: number) => void,
    onEdgeDetection?: (leftX: number, rightX: number, quality: number) => void
  ) {
    this.onReadyCallback = onReady
    this.onDistanceUpdateCallback = onDistanceUpdate || null
    this.onEdgeDetectionCallback = onEdgeDetection || null
    this.hasAutoCaptured = false
    
    // Set canvas size to match video
    this.canvas.width = video.videoWidth || 640
    this.canvas.height = video.videoHeight || 480

    console.log('🔍 Starting cylinder detection...')

    // Analyze frames every 300ms
    this.detectionInterval = window.setInterval(() => {
      if (this.hasAutoCaptured) return
      
      const result = this.analyzeFrame(video)
      
      // Update distance to parent component
      if (this.onDistanceUpdateCallback) {
        this.onDistanceUpdateCallback(result.estimatedDistance)
      }
      
      // Update edge detection to parent component
      if (this.onEdgeDetectionCallback) {
        this.onEdgeDetectionCallback(result.leftEdgeX, result.rightEdgeX, result.edgeAlignmentQuality)
      }
      
      // Check if distance is within target range (26cm ± 3cm)
      const isInRange = Math.abs(result.estimatedDistance - this.TARGET_DISTANCE) <= this.DISTANCE_TOLERANCE
      
      console.log(`📏 Distance: ${result.estimatedDistance.toFixed(1)}cm | Width: ${result.apparentWidth.toFixed(0)}px | Confidence: ${result.confidence.toFixed(2)}`)
      
      if (result.isReady && result.confidence > 0.6 && isInRange) {
        console.log(`✅ Cylinder detected at optimal distance! (${result.estimatedDistance.toFixed(1)}cm ≈ 26cm)`)
        this.triggerAutoCapture()
      }
    }, 300)
  }

  /**
   * Stop detection
   */
  stopDetection() {
    if (this.detectionInterval) {
      clearInterval(this.detectionInterval)
      this.detectionInterval = null
    }
    console.log('⏹️ Cylinder detection stopped')
  }

  /**
   * Analyze a single video frame
   */
  private analyzeFrame(video: HTMLVideoElement): DetectionResult {
    try {
      // Draw video frame to canvas
      this.ctx.drawImage(video, 0, 0, this.canvas.width, this.canvas.height)
      
      // Get image data
      const imageData = this.ctx.getImageData(0, 0, this.canvas.width, this.canvas.height)
      
      // Detect edges
      const edgeMap = this.detectEdges(imageData)
      
      // Analyze edge patterns
      const hasVerticalEdges = this.detectVerticalEdges(edgeMap)
      const hasCurvedEdges = this.detectCurvedEdges(edgeMap)
      const centeredness = this.calculateCenteredness(edgeMap)
      const widthData = this.measureApparentWidth(edgeMap)
      
      // Estimate distance based on apparent size
      // Using pinhole camera model: distance = (real_size × focal_length) / apparent_size
      // Simplified: distance ∝ 1 / apparent_width
      // Calibration: at 26cm, cylinder should occupy ~40% of frame width
      const frameWidth = this.canvas.width
      const referenceWidth = frameWidth * 0.4 // Expected width at 26cm
      const estimatedDistance = referenceWidth > 0 
        ? (this.TARGET_DISTANCE * referenceWidth) / Math.max(widthData.width, 1)
        : 999
      
      // Calculate edge alignment quality (will be compared with virtual cylinder borders)
      // For now, use centeredness as a proxy
      const edgeAlignmentQuality = centeredness
      
      // Calculate confidence
      let confidence = 0
      if (hasVerticalEdges) confidence += 0.4
      if (hasCurvedEdges) confidence += 0.3
      confidence += centeredness * 0.3
      
      const isReady = confidence > 0.6 && widthData.width > frameWidth * 0.2
      
      return {
        isReady,
        confidence,
        hasVerticalEdges,
        hasCurvedEdges,
        centeredness,
        estimatedDistance,
        apparentWidth: widthData.width,
        leftEdgeX: widthData.leftX,
        rightEdgeX: widthData.rightX,
        edgeAlignmentQuality
      }
    } catch (error) {
      console.error('Error analyzing frame:', error)
      return {
        isReady: false,
        confidence: 0,
        hasVerticalEdges: false,
        hasCurvedEdges: false,
        centeredness: 0,
        estimatedDistance: 999,
        apparentWidth: 0,
        leftEdgeX: 0,
        rightEdgeX: 0,
        edgeAlignmentQuality: 0
      }
    }
  }

  /**
   * Measure apparent width of cylinder in pixels and return edge positions
   */
  private measureApparentWidth(edgeMap: boolean[][]): { width: number; leftX: number; rightX: number } {
    const height = edgeMap.length
    const width = edgeMap[0]?.length || 0
    
    // Sample middle section of frame
    const middleY = Math.floor(height / 2)
    
    // Find leftmost and rightmost edges in middle row
    let leftEdge = width
    let rightEdge = 0
    
    // Scan a few rows around the middle
    for (let y = middleY - 20; y < middleY + 20; y++) {
      if (y < 0 || y >= height) continue
      
      for (let x = 0; x < width; x++) {
        if (edgeMap[y][x]) {
          if (x < leftEdge) leftEdge = x
          if (x > rightEdge) rightEdge = x
        }
      }
    }
    
    const apparentWidth = rightEdge - leftEdge
    return { 
      width: apparentWidth > 0 ? apparentWidth : 0,
      leftX: leftEdge < width ? leftEdge : 0,
      rightX: rightEdge > 0 ? rightEdge : 0
    }
  }

  /**
   * Simple edge detection using Sobel operator
   */
  private detectEdges(imageData: ImageData): boolean[][] {
    const width = imageData.width
    const height = imageData.height
    const data = imageData.data
    const edges: boolean[][] = []
    
    // Initialize edge map
    for (let y = 0; y < height; y++) {
      edges[y] = []
      for (let x = 0; x < width; x++) {
        edges[y][x] = false
      }
    }
    
    // Simple edge detection - check intensity gradients
    const threshold = 50
    
    for (let y = 1; y < height - 1; y++) {
      for (let x = 1; x < width - 1; x++) {
        const idx = (y * width + x) * 4
        
        // Convert to grayscale
        const gray = (data[idx] + data[idx + 1] + data[idx + 2]) / 3
        
        // Check neighbors
        const idxRight = (y * width + (x + 1)) * 4
        const idxDown = ((y + 1) * width + x) * 4
        
        const grayRight = (data[idxRight] + data[idxRight + 1] + data[idxRight + 2]) / 3
        const grayDown = (data[idxDown] + data[idxDown + 1] + data[idxDown + 2]) / 3
        
        const gradX = Math.abs(gray - grayRight)
        const gradY = Math.abs(gray - grayDown)
        const gradient = Math.sqrt(gradX * gradX + gradY * gradY)
        
        if (gradient > threshold) {
          edges[y][x] = true
        }
      }
    }
    
    return edges
  }

  /**
   * Detect vertical edges (cylinder sides)
   */
  private detectVerticalEdges(edgeMap: boolean[][]): boolean {
    const height = edgeMap.length
    const width = edgeMap[0]?.length || 0
    
    let verticalEdgeCount = 0
    const sampleColumns = [
      Math.floor(width * 0.25),
      Math.floor(width * 0.75)
    ]
    
    for (const col of sampleColumns) {
      let columnEdges = 0
      for (let y = 0; y < height; y++) {
        if (edgeMap[y][col]) columnEdges++
      }
      if (columnEdges > height * 0.3) verticalEdgeCount++
    }
    
    return verticalEdgeCount >= 1
  }

  /**
   * Detect curved edges (cylinder top/bottom semicircles)
   */
  private detectCurvedEdges(edgeMap: boolean[][]): boolean {
    const height = edgeMap.length
    const width = edgeMap[0]?.length || 0
    
    // Check top and bottom regions for curved patterns
    const topRegion = Math.floor(height * 0.2)
    const bottomRegion = Math.floor(height * 0.8)
    
    let topCurveScore = 0
    let bottomCurveScore = 0
    
    // Sample horizontal lines in top and bottom regions
    for (let x = 0; x < width; x++) {
      if (edgeMap[topRegion]?.[x]) topCurveScore++
      if (edgeMap[bottomRegion]?.[x]) bottomCurveScore++
    }
    
    // Curves should span at least 30% of width
    const threshold = width * 0.3
    return (topCurveScore > threshold || bottomCurveScore > threshold)
  }

  /**
   * Calculate how centered the detected object is
   */
  private calculateCenteredness(edgeMap: boolean[][]): number {
    const height = edgeMap.length
    const width = edgeMap[0]?.length || 0
    
    let totalEdges = 0
    let centeredEdges = 0
    
    const centerX = width / 2
    const centerRadius = width * 0.3
    
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        if (edgeMap[y][x]) {
          totalEdges++
          const distanceFromCenter = Math.abs(x - centerX)
          if (distanceFromCenter < centerRadius) {
            centeredEdges++
          }
        }
      }
    }
    
    return totalEdges > 0 ? centeredEdges / totalEdges : 0
  }

  /**
   * Trigger auto-capture
   */
  private triggerAutoCapture() {
    if (this.hasAutoCaptured) return
    
    this.hasAutoCaptured = true
    this.stopDetection()
    
    if (this.onReadyCallback) {
      this.onReadyCallback()
    }
  }

  /**
   * Reset auto-capture flag
   */
  reset() {
    this.hasAutoCaptured = false
  }
}

