/**
 * Device Detection Utilities
 */

export function isMobileDevice(): boolean {
  if (typeof window === 'undefined') return false
  
  const userAgent = navigator.userAgent || navigator.vendor || (window as any).opera
  
  // Check for mobile devices
  return /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(userAgent.toLowerCase())
}

export function isTablet(): boolean {
  if (typeof window === 'undefined') return false
  
  const userAgent = navigator.userAgent.toLowerCase()
  return /ipad|tablet|playbook|silk/i.test(userAgent) || 
         (userAgent.includes('android') && !userAgent.includes('mobile'))
}

export function getDeviceType(): 'mobile' | 'tablet' | 'desktop' {
  if (isTablet()) return 'tablet'
  if (isMobileDevice()) return 'mobile'
  return 'desktop'
}

export function getOptimalPanelPosition(deviceType: 'mobile' | 'tablet' | 'desktop') {
  const width = typeof window !== 'undefined' ? window.innerWidth : 1920
  const height = typeof window !== 'undefined' ? window.innerHeight : 1080
  
  switch (deviceType) {
    case 'mobile':
      return {
        controls: { x: 10, y: 10 },
        results: { x: 10, y: height - 300 },
        depth: { x: width / 2 - 160, y: height / 2 - 100 },
        validation: { x: 20, y: 80 },
        autoMinimize: true
      }
    
    case 'tablet':
      return {
        controls: { x: 20, y: 20 },
        results: { x: 20, y: 120 },
        depth: { x: width / 2 - 160, y: 150 },
        validation: { x: 50, y: 100 },
        autoMinimize: false
      }
    
    case 'desktop':
    default:
      return {
        controls: { x: 20, y: 20 },
        results: { x: 20, y: 100 },
        depth: { x: width / 2 - 160, y: 150 },
        validation: { x: 100, y: 150 },
        autoMinimize: false
      }
  }
}

export function getOptimalVideoResolution(deviceType: 'mobile' | 'tablet' | 'desktop') {
  switch (deviceType) {
    case 'mobile':
      return { width: 1280, height: 720, frameRate: 24 }
    
    case 'tablet':
      return { width: 1920, height: 1080, frameRate: 30 }
    
    case 'desktop':
    default:
      return { width: 1920, height: 1080, frameRate: 30 }
  }
}

