# Sistema de Coordenadas GeoStXR

## 📐 Convenciones de Coordenadas

### Sistema Geológico/GeoStXR (mano derecha)

```
        Z+ (Arriba/Elevación)
        |
        |     Y+ (Norte)
        |    /
        |   /
        |  /
        | /
        |/__________ X+ (Este)
       O (Origen/Collar)
```

**Ejes:**
- **X**: Este (positivo) / Oeste (negativo)
- **Y**: Norte (positivo) / Sur (negativo)
- **Z**: Elevación - Arriba (positivo) / Abajo (negativo)

**Ángulos:**
- **Azimuth**: 0° = Norte, 90° = Este, 180° = Sur, 270° = Oeste
  - Medido en sentido horario desde el Norte
  - Rango: 0-360°

- **Dip (Inclinación)**: Ángulo desde la horizontal
  - 0° = horizontal
  - -90° = vertical hacia abajo
  - Rango: 0° a -90° (negativo hacia abajo)

---

## 🎮 Three.js Mapping

Three.js usa un sistema de coordenadas diferente por defecto:
- Three.js X+ = derecha
- Three.js Y+ = arriba
- Three.js Z+ = hacia ti (fuera de la pantalla)

**Mapeo GeoStXR → Three.js:**

| GeoStXR | Three.js | Descripción |
|---------|----------|-------------|
| X (Este) | X | Eje Este-Oeste |
| Y (Norte) | **-Z** | Eje Norte-Sur (invertido) |
| Z (Elevación) | **Y** | Eje vertical |

```typescript
// Conversión de coordenadas
function geoToThreeJS(geoPos) {
  return {
    x: geoPos.x,        // Este → X
    y: geoPos.z,        // Elevación → Y
    z: -geoPos.y        // Norte → -Z (invertido)
  }
}
```

---

## 🔬 Sondaje (Drill Hole)

### Orientación

Un sondaje se define por:
1. **Collar** (boca del sondaje): Posición inicial (X, Y, Z)
2. **Azimuth**: Dirección horizontal del sondaje
3. **Dip**: Inclinación del sondaje

### Trayectoria

Dado:
- `depth` = profundidad medida a lo largo del eje del sondaje (cm)
- `azimuth` = azimuth del sondaje (grados)
- `dip` = dip del sondaje (grados, negativo hacia abajo)

Calcular posición en 3D:

```typescript
const azimuthRad = azimuth * (Math.PI / 180)
const dipRad = dip * (Math.PI / 180)

// Componente horizontal (proyección en plano XY)
const horizontal = depth * Math.cos(dipRad)

// Componente vertical (eje Z)
const vertical = depth * Math.sin(dipRad)  // Negativo si dip < 0

// Componentes horizontales
const east = horizontal * Math.sin(azimuthRad)
const north = horizontal * Math.cos(azimuthRad)

// Posición final
const position = {
  x: east,
  y: north,
  z: vertical
}
```

### Ejemplos

#### Ejemplo 1: Sondaje Vertical
```
Azimuth: 0°
Dip: -90°
Profundidad: 100m

Resultado:
- Este (X): 0m
- Norte (Y): 0m
- Elevación (Z): -100m  [100m hacia abajo]
```

#### Ejemplo 2: Sondaje Horizontal al Este
```
Azimuth: 90°
Dip: 0°
Profundidad: 100m

Resultado:
- Este (X): 100m
- Norte (Y): 0m
- Elevación (Z): 0m
```

#### Ejemplo 3: Sondaje Horizontal al Norte
```
Azimuth: 0°
Dip: 0°
Profundidad: 100m

Resultado:
- Este (X): 0m
- Norte (Y): 100m
- Elevación (Z): 0m
```

#### Ejemplo 4: DDH-AOC-001 (Real)
```
Azimuth: 60° (ENE)
Dip: -60°
Profundidad: 100m

Cálculo:
- Horizontal: 100 × cos(-60°) = 100 × 0.5 = 50m
- Vertical: 100 × sin(-60°) = 100 × (-0.866) = -86.6m
- Este: 50 × sin(60°) = 50 × 0.866 = 43.3m
- Norte: 50 × cos(60°) = 50 × 0.5 = 25m

Resultado:
- Este (X): 43.3m
- Norte (Y): 25.0m
- Elevación (Z): -86.6m  [86.6m hacia abajo]
```

---

## 🪨 Estructuras Geológicas

### Cilindro del Testigo

El testigo (core) es un cilindro que sigue el eje del sondaje.

**Sistema de coordenadas local del cilindro:**
- Origen: Centro del cilindro
- Eje Z: A lo largo del eje del sondaje (profundidad)
- Eje X, Y: Perpendiculares al eje del sondaje
- Radio: 3.175 cm (HQ estándar)

### Puntos P1, P2, P3

Los puntos capturados en la app Android están en coordenadas cilíndricas locales:

```
P1 = (x₁, y₁, z₁)  // cm en sistema local del cilindro
P2 = (x₂, y₂, z₂)
P3 = (x₃, y₃, z₃)
```

Donde:
- `x, y`: Posición en la sección transversal del cilindro
- `z`: Profundidad a lo largo del eje del cilindro

**Restricciones:**
- `√(x² + y²) ≤ radio` (dentro del cilindro)
- `z` es la profundidad medida desde el collar

### Orientación del Plano Estructural

Dado los 3 puntos (P1, P2, P3), se puede calcular:

1. **Vector Normal** del plano:
   ```
   v1 = P2 - P1
   v2 = P3 - P1
   normal = v1 × v2  (producto cruz)
   ```

2. **Dip** (buzamiento):
   ```
   horizontal = √(normal.x² + normal.y²)
   dip = arctan(|normal.z| / horizontal) × (180/π)
   ```

3. **Dip Direction** (dirección del buzamiento):
   ```
   dipDirection = arctan2(normal.x, normal.y) × (180/π)
   ```

---

## 📊 Visualización en Three.js

### Configuración de la Escena

```typescript
// Camera
const camera = new THREE.PerspectiveCamera(60, width / height, 1, 100000)
camera.position.set(5000, 5000, 5000)  // Vista isométrica
camera.lookAt(0, 0, 0)  // Mirar al origen

// Controls
const controls = new OrbitControls(camera, renderer.domElement)
controls.enableDamping = true
```

### Trayectoria del Sondaje

```typescript
// Calcular puntos a lo largo de la trayectoria
const points = []
for (let depth = 0; depth <= totalDepth; depth += 1000) {
  const geoPos = calculateDrillHolePosition(depth, orientation)
  
  // Convertir a Three.js
  points.push(new THREE.Vector3(
    geoPos.x,   // Este → X
    geoPos.z,   // Elevación → Y
    -geoPos.y   // Norte → -Z
  ))
}

// Crear línea
const geometry = new THREE.BufferGeometry().setFromPoints(points)
const material = new THREE.LineBasicMaterial({ color: 0x00ff00 })
const line = new THREE.Line(geometry, material)
scene.add(line)
```

### Estructuras (Discos)

```typescript
// Posición de la estructura
const geoPos = calculateDrillHolePosition(structure.depth, orientation)

// Crear disco
const disc = new THREE.Mesh(
  new THREE.CircleGeometry(500, 32),
  new THREE.MeshPhongMaterial({
    color: structure.color,
    transparent: true,
    opacity: 0.75,
    side: THREE.DoubleSide
  })
)

// Posicionar en Three.js
disc.position.set(geoPos.x, geoPos.z, -geoPos.y)

// Orientar según dip y dip direction
const dipRad = structure.dipReal * Math.PI / 180
const dipDirRad = structure.dipDirection * Math.PI / 180

disc.rotation.order = 'YZX'
disc.rotation.y = dipDirRad   // Rotar horizontalmente
disc.rotation.x = -dipRad     // Inclinar según dip
```

### Ejes de Referencia

```typescript
// Axes Helper
// Rojo = X (Este)
// Verde = Y (Elevación)  
// Azul = Z (Sur/-Norte)
const axesHelper = new THREE.AxesHelper(2000)
scene.add(axesHelper)

// Grilla horizontal en superficie
const gridHelper = new THREE.GridHelper(10000, 20, 0x444444, 0x222222)
gridHelper.position.y = 0  // A nivel del collar
scene.add(gridHelper)

// Grillas de referencia cada 50m
for (let depth = 5000; depth <= 50000; depth += 5000) {
  const grid = new THREE.GridHelper(2000, 4, 0x333333, 0x222222)
  grid.position.y = -depth  // Hacia abajo
  scene.add(grid)
}
```

---

## 🔧 Validación

### Test Cases

```typescript
// Test 1: Vertical
calculateDrillHolePosition(10000, { azimuth: 0, dip: -90 })
// → { x: 0, y: 0, z: -10000 } ✓

// Test 2: Horizontal Este
calculateDrillHolePosition(10000, { azimuth: 90, dip: 0 })
// → { x: 10000, y: 0, z: 0 } ✓

// Test 3: Horizontal Norte
calculateDrillHolePosition(10000, { azimuth: 0, dip: 0 })
// → { x: 0, y: 10000, z: 0 } ✓

// Test 4: DDH-AOC-001
calculateDrillHolePosition(10000, { azimuth: 60, dip: -60 })
// → { x: 4330, y: 2500, z: -8660 } ✓
```

---

## 📝 Notas Importantes

1. **Signos**: El dip siempre es negativo para sondajes que van hacia abajo

2. **Unidades**: 
   - Coordenadas en centímetros (cm) internamente
   - Convertir a metros (m) para display al usuario

3. **Convención de ángulos**:
   - Azimuth: 0° = Norte (no Este)
   - Sentido horario desde el Norte
   - Dip: Negativo hacia abajo

4. **Three.js Z invertido**:
   - En geología: Y+ = Norte
   - En Three.js: Z+ = Sur (hacia ti)
   - Por eso: `threeZ = -geoY`

5. **Cilindro local**:
   - El eje Z del cilindro es paralelo al eje del sondaje
   - Los puntos P1, P2, P3 están en coordenadas locales
   - Para visualizar, deben transformarse a coordenadas globales

---

## 🎓 Referencias

- [Strike and Dip - Wikipedia](https://en.wikipedia.org/wiki/Strike_and_dip)
- [Drill Core Orientation](https://en.wikipedia.org/wiki/Core_sample#Orientation)
- [Three.js Coordinate System](https://threejs.org/manual/#en/scenegraph)
- [Right-hand Rule](https://en.wikipedia.org/wiki/Right-hand_rule)

---

**Última actualización:** 02 de Octubre, 2025  
**Versión:** 1.0

