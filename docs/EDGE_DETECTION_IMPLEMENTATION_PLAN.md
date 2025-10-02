# Plan de Implementación - Detección de Bordes del Cilindro

## 🎯 Objetivo Práctico

Dado que estamos en un entorno **web/móvil** sin OpenCV nativo, vamos a implementar una solución práctica y efectiva usando **Canvas API y algoritmos JavaScript**.

## 📋 Estrategia de Implementación

### **Opción 1: Detección Avanzada en el Navegador** ⭐ RECOMENDADA

**Ventajas:**
- ✅ No requiere librerías externas pesadas
- ✅ Funciona en cualquier navegador moderno
- ✅ Rápido (procesamiento en cliente)
- ✅ Compatible con PWA

**Técnicas:**

1. **Detección de Bordes Mejorada:**
   ```javascript
   - Sobel mejorado con múltiples escalas
   - Filtro de Canny simplificado (en Canvas)
   - Detección de gradientes direccionales
   ```

2. **Detección de Líneas Verticales:**
   ```javascript
   - Análisis de columnas de píxeles
   - Voting scheme para identificar bordes verticales consistentes
   - Filtrado por longitud y verticalidad
   ```

3. **Validación de Forma Cilíndrica:**
   ```javascript
   - Verificar paralelismo de bordes laterales
   - Detectar curvatura en extremos
   - Ratio ancho/alto consistente con cilindro
   ```

4. **Scoring de Alineamiento:**
   ```javascript
   - Diferencia de posición horizontal (40%)
   - Diferencia de ancho (30%)
   - Centrado vertical (20%)
   - Ratio de aspecto (10%)
   ```

### **Opción 2: OpenCV.js (Más Pesada)**

**Ventajas:**
- ✅ Algoritmos probados y robustos
- ✅ Hough Transform nativo
- ✅ Canny avanzado

**Desventajas:**
- ❌ Librería pesada (~8MB)
- ❌ Inicialización lenta
- ❌ Consumo de memoria en móviles
- ❌ Puede afectar performance

## 🚀 Plan de Desarrollo (Opción 1)

### **Fase 1: Mejorar Detección Básica** (1-2 horas)

```typescript
// Archivo: lib/cylinder-detection-advanced.ts

class AdvancedCylinderDetector {
  
  // Mejorar edge detection con multi-escala
  detectEdgesMultiScale(imageData) {
    const edges1 = this.sobelEdgeDetection(imageData, threshold: 30)
    const edges2 = this.sobelEdgeDetection(imageData, threshold: 60)
    const edges3 = this.sobelEdgeDetection(imageData, threshold: 90)
    return this.mergeEdgeMaps([edges1, edges2, edges3])
  }
  
  // Detectar líneas verticales con votación
  detectVerticalEdges(edgeMap) {
    const votes = new Array(width).fill(0)
    
    // Votar por cada columna que tenga bordes consistentes
    for (let x = 0; x < width; x++) {
      let edgeCount = 0
      for (let y = 0; y < height; y++) {
        if (edgeMap[y][x]) edgeCount++
      }
      votes[x] = edgeCount / height // Normalizado 0-1
    }
    
    // Encontrar picos de votación (bordes verticales)
    const peaks = this.findPeaks(votes, minProminence: 0.3)
    return this.selectOutermost(peaks) // [leftEdge, rightEdge]
  }
  
  // Validar forma cilíndrica
  validateCylinderShape(leftX, rightX, topY, bottomY) {
    const width = rightX - leftX
    const height = bottomY - topY
    const ratio = height / width
    
    // Cilindro típico: ratio ~5-10 (30cm alto, 6cm diámetro)
    const isValidRatio = ratio > 3 && ratio < 15
    
    // Verificar que bordes sean paralelos
    const parallelism = this.checkParallelism(leftEdge, rightEdge)
    const isParallel = parallelism > 0.9
    
    return isValidRatio && isParallel
  }
  
  // Calcular score de alineamiento
  calculateAlignmentScore(detected, virtual) {
    const leftScore = 1 - Math.abs(detected.leftX - virtual.leftX) / canvasWidth
    const rightScore = 1 - Math.abs(detected.rightX - virtual.rightX) / canvasWidth
    const topScore = 1 - Math.abs(detected.topY - virtual.topY) / canvasHeight
    const bottomScore = 1 - Math.abs(detected.bottomY - virtual.bottomY) / canvasHeight
    
    return {
      total: (leftScore * 0.3 + rightScore * 0.3 + topScore * 0.2 + bottomScore * 0.2),
      details: { leftScore, rightScore, topScore, bottomScore }
    }
  }
}
```

### **Fase 2: Auto-Calibración del Cilindro Virtual** (2-3 horas)

```typescript
// Ajustar cilindro virtual según detección

interface CylinderCalibration {
  scale: number      // Escalar cilindro virtual para coincidir con tamaño detectado
  offsetX: number    // Desplazamiento horizontal
  offsetY: number    // Desplazamiento vertical
  rotation: number   // Rotación si el cilindro está inclinado
}

function calibrateVirtualCylinder(detected, virtual): CylinderCalibration {
  const scaleX = detected.width / virtual.width
  const scaleY = detected.height / virtual.height
  const scale = (scaleX + scaleY) / 2 // Promedio
  
  const offsetX = detected.centerX - virtual.centerX
  const offsetY = detected.centerY - virtual.centerY
  
  // Detectar inclinación comparando bordes
  const rotation = calculateRotation(detected.leftEdge, detected.rightEdge)
  
  return { scale, offsetX, offsetY, rotation }
}
```

### **Fase 3: Feedback Visual Mejorado** (1 hora)

```typescript
// Indicadores visuales:
- Líneas de bordes detectados (verde si alineado, rojo si no)
- Overlay semitransparente del área detectada
- Countdown animado cuando esté listo para capturar (3, 2, 1...)
- Score de alineamiento en tiempo real (0-100%)
- Guías de ajuste ("Mover izquierda", "Acercar", etc.)
```

## 🧪 Validación

### **Casos de Prueba:**

1. **Cilindro centrado, iluminación buena:** Score > 95%
2. **Cilindro ligeramente descentrado:** Score 80-95%, auto-ajuste
3. **Iluminación baja:** Detecta con Score > 70%
4. **Cilindro parcialmente visible:** Rechaza (Score < 50%)
5. **Objeto no cilíndrico:** Rechaza (validación falla)

## 📅 Cronograma

- **Fase 1:** Detección mejorada (inmediato)
- **Fase 2:** Auto-calibración (siguiente sesión)
- **Fase 3:** Feedback visual (siguiente sesión)
- **Testing:** Integración con flujo completo

## 🎯 Criterio de Éxito

- ✅ Detección exitosa en > 90% de casos típicos
- ✅ Captura automática sin intervención manual
- ✅ Procesamiento < 200ms por frame (5 FPS mínimo)
- ✅ Funciona en Android Chrome sin lag

---

**¿Procedemos con la Fase 1 (Detección Mejorada)?**

