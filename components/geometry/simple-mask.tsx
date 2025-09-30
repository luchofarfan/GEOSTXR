'use client'

import React, { useRef, useEffect } from 'react'

interface SimpleMaskProps {
  className?: string
}

export default function SimpleMask({ className = '' }: SimpleMaskProps) {
  const videoRef = useRef<HTMLVideoElement>(null)

  useEffect(() => {
    // Get camera stream
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
        }
      } catch (err) {
        console.error('Error accessing camera:', err)
      }
    }

    getCameraStream()

    // Cleanup
    return () => {
      if (videoRef.current && videoRef.current.srcObject) {
        const stream = videoRef.current.srcObject as MediaStream
        stream.getTracks().forEach(track => track.stop())
      }
    }
  }, [])

  return (
    <div className={`simple-mask ${className}`}>
      <div className="w-full h-full relative">
        {/* Camera Video with CSS Mask */}
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          className="w-full h-full object-cover"
          style={{
            clipPath: 'inset(25% 47% 25% 47%)',
            WebkitClipPath: 'inset(25% 47% 25% 47%)',
            mask: 'linear-gradient(90deg, transparent 0%, transparent 47%, black 47%, black 53%, transparent 53%, transparent 100%)',
            WebkitMask: 'linear-gradient(90deg, transparent 0%, transparent 47%, black 47%, black 53%, transparent 53%, transparent 100%)'
          }}
        />
        
        {/* Debug overlay to show mask boundaries */}
        <div 
          className="absolute inset-0 pointer-events-none"
          style={{
            background: 'linear-gradient(90deg, transparent 0%, transparent 47%, rgba(255,0,0,0.3) 47%, rgba(255,0,0,0.3) 53%, transparent 53%, transparent 100%)',
            clipPath: 'inset(25% 47% 25% 47%)',
            WebkitClipPath: 'inset(25% 47% 25% 47%)'
          }}
        />
      </div>
    </div>
  )
}
