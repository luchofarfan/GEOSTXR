'use client'

import React, { useEffect, useState, useRef } from 'react'
import * as THREE from 'three'
import { GEOSTXR_CONFIG } from '@/lib/config'

interface BOHLinesOverlayProps {
  line1Angle: number
  line2Angle: number
  containerWidth: number
  containerHeight: number
  camera?: THREE.Camera
  cylinderHeight?: number
  radius?: number
}

export function BOHLinesOverlay({ 
  line1Angle, 
  line2Angle,
  containerWidth,
  containerHeight,
  camera,
  cylinderHeight: cylHeight,
  radius: cylRadius
}: BOHLinesOverlayProps) {
  const radius = cylRadius || GEOSTXR_CONFIG.CYLINDER.RADIUS // 3.175 cm
  const cylinderHeight = cylHeight || GEOSTXR_CONFIG.CYLINDER.HEIGHT // 30 cm
  
  // Calculate 3D positions on cylinder surface
  const angle1Rad = (line1Angle * Math.PI) / 180
  const angle2Rad = (line2Angle * Math.PI) / 180
  
  // Position on cylinder surface (viewing from +Y axis)
  const x1 = radius * Math.cos(angle1Rad)
  const x2 = radius * Math.cos(angle2Rad)
  
  // Project 3D points to 2D screen using camera (if available)
  let line1Left = containerWidth / 2
  let line2Left = containerWidth / 2
  let boh1TopY = containerHeight * 0.5
  let boh1BottomY = containerHeight * 0.85
  let boh1Height = containerHeight * 0.35
  let boh2TopY = containerHeight * 0.15
  let boh2Height = containerHeight * 0.35
  
  if (camera) {
    // Project actual 3D points to screen coordinates
    // Note: We invert Z to Y mapping so higher Z = lower Y on screen
    const project3DTo2D = (x: number, y: number, z: number) => {
      const vector = new THREE.Vector3(x, y, z)
      vector.project(camera)
      
      // Standard projection, but we'll need to handle Z->screen Y mapping
      return {
        x: (vector.x * 0.5 + 0.5) * containerWidth,
        y: (-vector.y * 0.5 + 0.5) * containerHeight,
        screenZ: vector.z // Keep original for debugging
      }
    }
    
    // Project BOH positions - note camera projects Z inversely to screen Y
    // z=0 (world bottom) → top of screen (low Y value)
    // z=30 (world top) → bottom of screen (high Y value)
    const cylinderTop3D = project3DTo2D(x1, 0, cylinderHeight) // z=30
    const cylinderCenter3D = project3DTo2D(x1, 0, cylinderHeight / 2) // z=15
    const cylinderBottom3D = project3DTo2D(x1, 0, 0) // z=0
    
    const line2Top3D = project3DTo2D(x2, 0, cylinderHeight) // z=30
    const line2Center3D = project3DTo2D(x2, 0, cylinderHeight / 2) // z=15
    
    // BOH 1 (Red): z=0 to z=15 → screen top to middle
    line1Left = cylinderBottom3D.x
    boh1TopY = cylinderBottom3D.y  // z=0 is at top of screen
    boh1BottomY = cylinderCenter3D.y  // z=15 is at middle
    boh1Height = Math.abs(boh1BottomY - boh1TopY)
    
    // BOH 2 (Green): z=15 to z=30 → screen middle to bottom
    line2Left = line2Center3D.x
    boh2TopY = line2Center3D.y  // z=15 is at middle
    const boh2BottomY = line2Top3D.y  // z=30 is at bottom of screen
    boh2Height = Math.abs(boh2BottomY - boh2TopY)
    
    console.log(`BOH1 (${line1Angle}°): X=${line1Left.toFixed(0)}px, top=${boh1TopY.toFixed(0)}px (z=0), bottom=${boh1BottomY.toFixed(0)}px (z=15), height=${boh1Height.toFixed(0)}px`)
    console.log(`BOH2 (${line2Angle}°): X=${line2Left.toFixed(0)}px, top=${boh2TopY.toFixed(0)}px (z=15), bottom=${boh2BottomY.toFixed(0)}px (z=30), height=${boh2Height.toFixed(0)}px`)
  } else {
    // Fallback to approximate positioning
    const centerX = containerWidth / 2
    const cylinderPixelHeight = containerHeight * 0.7
    const pixelsPerCm = cylinderPixelHeight / cylinderHeight
    
    line1Left = centerX + (x1 * pixelsPerCm)
    line2Left = centerX + (x2 * pixelsPerCm)
  }
  
  return (
    <div style={{
      position: 'absolute',
      top: 0,
      left: 0,
      width: '100%',
      height: '100%',
      pointerEvents: 'none',
      zIndex: 1000
    }}>
      {/* BOH Line 1 - RED - From z=0 (bottom) to z=15 (center) */}
      <div style={{
        position: 'absolute',
        left: `${line1Left}px`,
        top: camera ? `${boh1TopY}px` : '50%',
        width: '5px',
        height: camera ? `${boh1Height}px` : '35%',
        backgroundColor: '#FF0000',
        transform: 'translateX(-50%)',
        boxShadow: '0 0 10px rgba(255,0,0,1)',
        zIndex: 1001
      }} />
      
      {/* BOH Line 2 - GREEN - From z=15 (center) to z=30 (top) */}
      <div style={{
        position: 'absolute',
        left: `${line2Left}px`,
        top: camera ? `${boh2TopY}px` : '15%',
        width: '5px',
        height: camera ? `${boh2Height}px` : '35%',
        backgroundColor: '#00FF00',
        transform: 'translateX(-50%)',
        boxShadow: '0 0 10px rgba(0,255,0,1)',
        zIndex: 1002
      }} />
      
      {/* Debug info */}
      <div style={{
        position: 'absolute',
        top: '10px',
        left: '10px',
        color: 'white',
        backgroundColor: 'rgba(0,0,0,0.7)',
        padding: '5px 10px',
        borderRadius: '4px',
        fontSize: '12px',
        fontFamily: 'monospace'
      }}>
        🔴 L1: {line1Angle.toFixed(1)}° | 🟢 L2: {line2Angle.toFixed(1)}°
      </div>
    </div>
  )
}

