'use client'

import { useMemo } from 'react'

export interface BOHPositionData {
  angle: number // Angular position (70-110°)
  position: string // Descriptive position (Izquierda/Centro/Derecha)
  displacement: number // Displacement from center in degrees (±20°)
  radialX: number // X coordinate on cylinder surface
  radialY: number // Y coordinate on cylinder surface
  side: 'left' | 'center' | 'right' // Simplified side indicator
}

export interface ACAngleData {
  ac: number // Angle de Calce (degrees)
  boh1: BOHPositionData
  boh2: BOHPositionData
  relativePosition: string // Relative position description
  convergence: number // How much BOHs are converging/diverging
}

/**
 * Calculate detailed BOH position data
 */
function calculateBOHPosition(angle: number, cylinderRadius: number = 3.175): BOHPositionData {
  const angleRad = (angle * Math.PI) / 180
  const displacement = angle - 90 // Displacement from center (±20°)
  
  // Position on cylinder surface
  const radialX = cylinderRadius * Math.cos(angleRad)
  const radialY = cylinderRadius * Math.sin(angleRad)
  
  // Descriptive position
  let position: string
  let side: 'left' | 'center' | 'right'
  
  if (angle < 85) {
    position = 'Izquierda'
    side = 'left'
  } else if (angle > 95) {
    position = 'Derecha'
    side = 'right'
  } else {
    position = 'Centro'
    side = 'center'
  }
  
  return {
    angle,
    position,
    displacement,
    radialX,
    radialY,
    side
  }
}

/**
 * Calculate AC (Ángulo de Calce) - angle between BOH lines
 * 
 * AC represents the angular difference between the two BOH lines
 * on the cylinder surface. Both BOH lines are vertical (parallel to Z-axis)
 * but at different angular positions around the cylinder.
 * 
 * @param line1Angle - BOH Line 1 angle (70-110°)
 * @param line2Angle - BOH Line 2 angle (70-110°)
 * @param cylinderRadius - Cylinder radius in cm (default: 3.175)
 * @returns AC angle data with BOH positions
 */
export function useACAngle(
  line1Angle: number, 
  line2Angle: number,
  cylinderRadius: number = 3.175
): ACAngleData {
  const acData = useMemo(() => {
    // Calculate AC as absolute difference
    const ac = Math.abs(line2Angle - line1Angle)
    
    // Get detailed position data for each BOH
    const boh1 = calculateBOHPosition(line1Angle, cylinderRadius)
    const boh2 = calculateBOHPosition(line2Angle, cylinderRadius)
    
    // Describe relative positions
    let relativePosition: string
    if (boh1.side === boh2.side) {
      relativePosition = `Ambas BOHs en ${boh1.position.toLowerCase()}`
    } else if (boh1.side === 'center' || boh2.side === 'center') {
      relativePosition = `Una BOH centrada, otra en ${boh1.side === 'center' ? boh2.position.toLowerCase() : boh1.position.toLowerCase()}`
    } else {
      relativePosition = `BOH1 a la ${boh1.position.toLowerCase()}, BOH2 a la ${boh2.position.toLowerCase()}`
    }
    
    // Calculate convergence (how much they're coming together)
    // Positive = diverging, Negative = converging
    const convergence = line2Angle - line1Angle
    
    console.log(`AC (Ángulo de Calce): ${ac.toFixed(2)}°`)
    console.log(`  BOH1: ${line1Angle}° [${boh1.position}] @ (${boh1.radialX.toFixed(2)}, ${boh1.radialY.toFixed(2)})cm, Δ=${boh1.displacement.toFixed(1)}°`)
    console.log(`  BOH2: ${line2Angle}° [${boh2.position}] @ (${boh2.radialX.toFixed(2)}, ${boh2.radialY.toFixed(2)})cm, Δ=${boh2.displacement.toFixed(1)}°`)
    console.log(`  Relative: ${relativePosition}, Convergence: ${convergence.toFixed(1)}°`)
    
    return {
      ac,
      boh1,
      boh2,
      relativePosition,
      convergence
    }
  }, [line1Angle, line2Angle, cylinderRadius])
  
  return acData
}

/**
 * Validate if AC angle is within acceptable range
 */
export function validateACAngle(ac: number, minAC: number = 0, maxAC: number = 40): {
  valid: boolean
  warning: string | null
} {
  if (ac < minAC) {
    return {
      valid: false,
      warning: `AC muy pequeño (${ac.toFixed(2)}°). Mínimo recomendado: ${minAC}°`
    }
  }
  
  if (ac > maxAC) {
    return {
      valid: false,
      warning: `AC muy grande (${ac.toFixed(2)}°). Máximo recomendado: ${maxAC}°`
    }
  }
  
  return { valid: true, warning: null }
}

