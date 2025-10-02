# Detección Automática de Bordes del Cilindro

## 🎯 Objetivo

Detectar automáticamente los bordes del testigo real (cilindro de roca) en el feed de video y hacer coincidir el cilindro virtual con él, considerando la deformación por perspectiva.

## 📋 Requerimientos

1. **Detección de Bordes del Testigo:**
   - Bordes verticales laterales (izquierdo y derecho)
   - Semicírculos superior e inferior
   - Considerar deformación por perspectiva (trapecio, no rectángulo)

2. **Comparación con Cilindro Virtual:**
   - Proyectar bordes del cilindro 3D virtual a coordenadas 2D
   - Calcular diferencia entre bordes detectados y virtuales
   - Umbral de tolerancia para "bien alineado"

3. **Captura Automática:**
   - Cuando bordes coincidan (< 5% de diferencia)
   - Mantener alineamiento estable por 2 segundos
   - Gatillar captura de foto automáticamente
   - Iniciar flujo de medición

## 🔧 Implementación Actual

### ✅ **Ya Implementado:**

- `lib/cylinder-detection.ts`: Detector básico con Sobel operator
- `components/geometry/edge-alignment-overlay.tsx`: Overlay visual
- Detección de ancho aparente y distancia
- Callback de captura automática

### ⚠️ **Problemas Detectados:**

1. **Precisión limitada:** Sobel básico puede no detectar bien los bordes curvos
2. **Sin considerar perspectiva:** No ajusta por deformación trapezoidal
3. **Umbrales fijos:** No se adapta a diferentes condiciones de iluminación
4. **Sin validación de forma:** No verifica que sea realmente un cilindro

## 🚀 Plan de Mejora

### **Fase 1: Mejorar Detección de Bordes**

```typescript
// Técnicas a implementar:
1. Canny Edge Detection (mejor que Sobel para bordes curvos)
2. Hough Transform para líneas rectas (bordes laterales)
3. Hough Circle/Ellipse para semicírculos
4. Filtrado adaptativo según iluminación
```

### **Fase 2: Modelo de Perspectiva**

```typescript
// Ajustar por perspectiva:
1. Detectar trapecio (no rectángulo) para bordes laterales
2. Detectar elipses (no círculos) para semicírculos superior/inferior
3. Calcular matriz de transformación perspectiva
4. Comparar con proyección 3D→2D del cilindro virtual
```

### **Fase 3: Algoritmo de Matching**

```typescript
// Comparación robusta:
1. Calcular distancia Hausdorff entre contornos
2. Scoring multi-criterio:
   - Alineamiento bordes laterales (40%)
   - Coincidencia semicírculos (30%)
   - Centrado en pantalla (20%)
   - Tamaño relativo (10%)
3. Umbral adaptativo según confianza
```

### **Fase 4: Auto-calibración**

```typescript
// Ajuste dinámico:
1. Escalar cilindro virtual según tamaño detectado
2. Posicionar cilindro virtual en centro detectado
3. Rotar según inclinación detectada
4. Feedback visual en tiempo real
```

## 📊 Algoritmo Propuesto

### **Detección de Bordes del Cilindro Real:**

```javascript
function detectCylinderEdges(videoFrame) {
  // 1. Preprocesamiento
  const gray = convertToGrayscale(videoFrame)
  const blurred = gaussianBlur(gray, 5)
  
  // 2. Detección de bordes (Canny)
  const edges = cannyEdgeDetection(blurred, 50, 150)
  
  // 3. Detectar líneas verticales (Hough)
  const lines = houghLines(edges)
  const verticalLines = filterVerticalLines(lines, angleThreshold=10°)
  const [leftEdge, rightEdge] = findOutermostLines(verticalLines)
  
  // 4. Detectar semicírculos (Hough Circles/Ellipses)
  const circles = houghCircles(edges)
  const [topSemicircle, bottomSemicircle] = findSemicircles(circles)
  
  // 5. Validar que sea un cilindro
  if (!validateCylinderShape(leftEdge, rightEdge, topSemicircle, bottomSemicircle)) {
    return null
  }
  
  return {
    leftEdge,
    rightEdge,
    topSemicircle,
    bottomSemicircle,
    centerX: (leftEdge.x + rightEdge.x) / 2,
    centerY: (topSemicircle.y + bottomSemicircle.y) / 2,
    width: rightEdge.x - leftEdge.x,
    height: bottomSemicircle.y - topSemicircle.y
  }
}
```

### **Comparación con Cilindro Virtual:**

```javascript
function compareEdges(detectedEdges, virtualEdges) {
  // Calcular diferencias normalizadas
  const leftDiff = Math.abs(detected.leftEdge.x - virtual.leftEdge.x) / canvasWidth
  const rightDiff = Math.abs(detected.rightEdge.x - virtual.rightEdge.x) / canvasWidth
  const topDiff = Math.abs(detected.topSemicircle.y - virtual.topSemicircle.y) / canvasHeight
  const bottomDiff = Math.abs(detected.bottomSemicircle.y - virtual.bottomSemicircle.y) / canvasHeight
  
  // Scoring ponderado
  const score = 1.0 - (
    leftDiff * 0.25 +
    rightDiff * 0.25 +
    topDiff * 0.25 +
    bottomDiff * 0.25
  )
  
  return {
    score, // 0-1
    isAligned: score > 0.90, // 90% o mejor
    metrics: { leftDiff, rightDiff, topDiff, bottomDiff }
  }
}
```

## 🧪 Estrategia de Pruebas

1. **Condiciones controladas:**
   - Iluminación uniforme
   - Fondo contrastante
   - Cilindro centrado

2. **Condiciones reales:**
   - Iluminación variable
   - Fondos complejos
   - Cilindro parcialmente visible

3. **Métricas de éxito:**
   - Tasa de detección correcta > 95%
   - Falsos positivos < 2%
   - Tiempo de procesamiento < 100ms por frame

## 📚 Referencias Técnicas

- **Canny Edge Detection:** Mejor para bordes curvos y con ruido
- **Hough Transform:** Ideal para líneas rectas y círculos
- **Perspective Transform:** Corrección de distorsión trapezoidal
- **RANSAC:** Robusto para eliminar outliers en detección

## 🎯 Siguiente Paso

Implementar una versión mejorada del `CylinderDetector` con:
1. Canny edge detection (más robusto)
2. Hough lines para bordes verticales
3. Validación de forma cilíndrica
4. Scoring multi-criterio para matching
5. Auto-calibración del cilindro virtual

---

**Fecha:** 2025-10-02  
**Branch:** `feature/edge-detection`  
**Estado:** En desarrollo

