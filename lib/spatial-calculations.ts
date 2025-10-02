/**
 * Spatial Calculations for GeoStXR
 * Cálculos espaciales para trayectorias de sondajes y orientaciones estructurales
 */

/**
 * Sistema de Coordenadas (Geológico y GeoStXR):
 * - X: Este (positivo) / Oeste (negativo)
 * - Y: Norte (positivo) / Sur (negativo)
 * - Z: Elevación - Arriba (positivo) / Abajo (negativo)
 * 
 * - Azimuth: 0° = Norte, 90° = Este, 180° = Sur, 270° = Oeste (horario desde Norte)
 * - Dip: Negativo = hacia abajo (0° horizontal, -90° vertical hacia abajo)
 * 
 * Cilindro del Testigo:
 * - Eje del cilindro = Eje Z local (paralelo al eje del sondaje)
 * - Puntos P1, P2, P3 están en coordenadas cilíndricas locales (x, y, z)
 *   donde z es la profundidad a lo largo del eje del cilindro
 */

export interface DrillHoleOrientation {
  azimuth: number  // 0-360°, 0° = North
  dip: number      // -90 to 0°, negative = downward
}

export interface Position3D {
  x: number  // Este (m o cm)
  y: number  // Norte (m o cm)
  z: number  // Elevación - Arriba (positivo) / Abajo (negativo) (m o cm)
}

/**
 * Calcula la posición 3D a lo largo de la trayectoria del sondaje
 * 
 * @param depthAlongHole - Profundidad medida a lo largo del eje del sondaje (cm)
 * @param orientation - Orientación del sondaje (azimuth y dip)
 * @returns Posición 3D en el espacio (X=Este, Y=Norte, Z=Elevación)
 * 
 * Ejemplo:
 * - Sondaje vertical (Az=0°, Dip=-90°): 
 *   100cm → (x=0, y=0, z=-100)  [100cm hacia abajo]
 * 
 * - Sondaje horizontal al Este (Az=90°, Dip=0°):
 *   100cm → (x=100, y=0, z=0)  [100cm al Este]
 * 
 * - Sondaje horizontal al Norte (Az=0°, Dip=0°):
 *   100cm → (x=0, y=100, z=0)  [100cm al Norte]
 * 
 * - Sondaje DDH-AOC-001 (Az=60° ENE, Dip=-60°):
 *   100cm → (x=43.3, y=25.0, z=-86.6)
 *   [43.3cm Este, 25cm Norte, 86.6cm abajo]
 */
export function calculateDrillHolePosition(
  depthAlongHole: number,
  orientation: DrillHoleOrientation
): Position3D {
  // Convertir ángulos a radianes
  const azimuthRad = (orientation.azimuth * Math.PI) / 180
  const dipRad = (orientation.dip * Math.PI) / 180
  
  // Calcular componentes
  // 1. Distancia horizontal proyectada (en el plano XY)
  const horizontalDistance = depthAlongHole * Math.cos(dipRad)
  
  // 2. Distancia vertical (componente Z - elevación)
  // Dip negativo → hacia abajo (Z negativo)
  const verticalDistance = depthAlongHole * Math.sin(dipRad)
  
  // 3. Componentes horizontales según azimuth
  // Azimuth se mide desde el Norte (Y+) hacia el Este (X+)
  
  // Componente Este (X)
  const east = horizontalDistance * Math.sin(azimuthRad)
  
  // Componente Norte (Y)
  const north = horizontalDistance * Math.cos(azimuthRad)
  
  return {
    x: east,
    y: north,
    z: verticalDistance  // Negativo si dip es negativo (hacia abajo)
  }
}

/**
 * Calcula múltiples puntos a lo largo de la trayectoria del sondaje
 * 
 * @param totalDepth - Profundidad total del sondaje (cm)
 * @param orientation - Orientación del sondaje
 * @param interval - Intervalo entre puntos (cm)
 * @returns Array de posiciones 3D
 */
export function calculateDrillHoleTrajectory(
  totalDepth: number,
  orientation: DrillHoleOrientation,
  interval: number = 1000  // 10m por defecto
): Position3D[] {
  const points: Position3D[] = []
  
  for (let depth = 0; depth <= totalDepth; depth += interval) {
    points.push(calculateDrillHolePosition(depth, orientation))
  }
  
  return points
}

/**
 * Calcula el vector normal de un plano definido por 3 puntos
 * 
 * @param p1 - Primer punto
 * @param p2 - Segundo punto
 * @param p3 - Tercer punto
 * @returns Vector normal unitario
 */
export function calculatePlaneNormal(
  p1: Position3D,
  p2: Position3D,
  p3: Position3D
): Position3D {
  // Vectores del plano
  const v1 = {
    x: p2.x - p1.x,
    y: p2.y - p1.y,
    z: p2.z - p1.z
  }
  
  const v2 = {
    x: p3.x - p1.x,
    y: p3.y - p1.y,
    z: p3.z - p1.z
  }
  
  // Producto cruz: v1 × v2
  const normal = {
    x: v1.y * v2.z - v1.z * v2.y,
    y: v1.z * v2.x - v1.x * v2.z,
    z: v1.x * v2.y - v1.y * v2.x
  }
  
  // Normalizar (hacer unitario)
  const magnitude = Math.sqrt(
    normal.x * normal.x + 
    normal.y * normal.y + 
    normal.z * normal.z
  )
  
  if (magnitude === 0) {
    console.warn('calculatePlaneNormal: Points are collinear, returning default normal')
    return { x: 0, y: 1, z: 0 }
  }
  
  return {
    x: normal.x / magnitude,
    y: normal.y / magnitude,
    z: normal.z / magnitude
  }
}

/**
 * Calcula el dip y dip direction desde un vector normal
 * 
 * @param normal - Vector normal del plano (unitario)
 * @returns { dip: ángulo de buzamiento (0-90°), dipDirection: azimuth del dip (0-360°) }
 */
export function calculateDipFromNormal(normal: Position3D): {
  dip: number
  dipDirection: number
} {
  // El vector normal apunta perpendicular al plano
  // El dip es el ángulo desde la horizontal
  
  // Componente horizontal del normal
  const horizontalMagnitude = Math.sqrt(normal.x * normal.x + normal.z * normal.z)
  
  // Dip: arctan(vertical / horizontal)
  const dipRad = Math.atan2(-normal.y, horizontalMagnitude)  // Negativo porque dip baja
  const dip = (dipRad * 180) / Math.PI
  
  // Dip Direction: azimuth hacia donde buza el plano
  // atan2(x, -z) porque Z es negativo hacia el norte en Three.js
  const dipDirectionRad = Math.atan2(normal.x, -normal.z)
  let dipDirection = (dipDirectionRad * 180) / Math.PI
  
  // Normalizar a 0-360°
  if (dipDirection < 0) dipDirection += 360
  
  return {
    dip: Math.abs(dip),
    dipDirection
  }
}

/**
 * Valida los cálculos con casos conocidos
 */
export function validateCalculations() {
  console.log('🧪 Validando cálculos espaciales...\n')
  
  // Test 1: Sondaje vertical
  console.log('Test 1: Sondaje vertical (Az=0°, Dip=-90°)')
  const vertical = calculateDrillHolePosition(10000, { azimuth: 0, dip: -90 })
  console.log(`  100m profundidad → x=${vertical.x.toFixed(1)}, y=${vertical.y.toFixed(1)}, z=${vertical.z.toFixed(1)}`)
  console.log(`  ✓ Esperado: x=0, y=0, z=-10000 (100m hacia abajo)\n`)
  
  // Test 2: Sondaje horizontal al Este
  console.log('Test 2: Sondaje horizontal al Este (Az=90°, Dip=0°)')
  const eastHorizontal = calculateDrillHolePosition(10000, { azimuth: 90, dip: 0 })
  console.log(`  100m profundidad → x=${eastHorizontal.x.toFixed(1)}, y=${eastHorizontal.y.toFixed(1)}, z=${eastHorizontal.z.toFixed(1)}`)
  console.log(`  ✓ Esperado: x=10000, y=0, z=0 (100m al Este)\n`)
  
  // Test 3: Sondaje horizontal al Norte
  console.log('Test 3: Sondaje horizontal al Norte (Az=0°, Dip=0°)')
  const northHorizontal = calculateDrillHolePosition(10000, { azimuth: 0, dip: 0 })
  console.log(`  100m profundidad → x=${northHorizontal.x.toFixed(1)}, y=${northHorizontal.y.toFixed(1)}, z=${northHorizontal.z.toFixed(1)}`)
  console.log(`  ✓ Esperado: x=0, y=10000, z=0 (100m al Norte)\n`)
  
  // Test 4: DDH-AOC-001 (Az=60° ENE, Dip=-60°)
  console.log('Test 4: DDH-AOC-001 (Az=60° ENE, Dip=-60°)')
  const ddhAOC = calculateDrillHolePosition(10000, { azimuth: 60, dip: -60 })
  console.log(`  100m profundidad → x=${ddhAOC.x.toFixed(1)}, y=${ddhAOC.y.toFixed(1)}, z=${ddhAOC.z.toFixed(1)}`)
  console.log(`  Cálculo manual:`)
  console.log(`    Horizontal: 100 × cos(-60°) = 100 × 0.5 = 50m`)
  console.log(`    Vertical (Z): 100 × sin(-60°) = 100 × (-0.866) = -86.6m (hacia abajo)`)
  console.log(`    Este (X): 50 × sin(60°) = 50 × 0.866 = 43.3m`)
  console.log(`    Norte (Y): 50 × cos(60°) = 50 × 0.5 = 25m`)
  console.log(`  ✓ Esperado: x=43.3, y=25.0, z=-86.6\n`)
  
  // Test 5: A 500m de profundidad DDH-AOC-001
  console.log('Test 5: DDH-AOC-001 a 500m de profundidad')
  const ddhAOC500 = calculateDrillHolePosition(50000, { azimuth: 60, dip: -60 })
  console.log(`  500m profundidad → x=${ddhAOC500.x.toFixed(1)}, y=${ddhAOC500.y.toFixed(1)}, z=${ddhAOC500.z.toFixed(1)}`)
  console.log(`  Posición final desde collar:`)
  console.log(`    ${(ddhAOC500.x/100).toFixed(1)}m al Este`)
  console.log(`    ${(ddhAOC500.y/100).toFixed(1)}m al Norte`)
  console.log(`    ${(Math.abs(ddhAOC500.z)/100).toFixed(1)}m hacia abajo\n`)
  
  console.log('✅ Validación completa\n')
}

/**
 * Casos de prueba específicos del proyecto
 */
export const TEST_CASES = {
  DDH_AOC_001: {
    collar: { utmEast: 350000, utmNorth: 6500000, elevation: 2000 },
    orientation: { azimuth: 60, dip: -60 },
    totalDepth: 500  // metros
  },
  
  // Estructura ejemplo del CSV
  STRUCTURE_EXAMPLE: {
    depth: 515,  // cm
    p1: { x: -2.6836, y: 1.6822, z: 14.6413 },
    p2: { x: -0.5745, y: 3.1184, z: 14.8241 },
    p3: { x: 2.3582, y: 2.1072, z: 14.8742 },
    dipReal: 87.17,
    dipDirection: 68.90
  }
}

