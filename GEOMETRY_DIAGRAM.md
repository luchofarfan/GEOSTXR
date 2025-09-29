# 🎯 GEOSTXR Virtual Geometry Diagram

## Cilindro Virtual y Líneas BOH

```
                    Z=30 (Top)
                        │
                        │
                        │ ← BOH Line 2 (z=15→30)
                        │
                    Z=15 (Center) ←─── 90° ± 20° (adjustable)
                        │
                        │ ← BOH Line 1 (z=0→15)
                        │
                    Z=0  (Bottom)
                        │
                        │
                    ─────┼─────
                        │
                   HQ=6.35cm
```

## Especificaciones Técnicas

### Cilindro Virtual
- **Diámetro (HQ)**: 6.35 cm
- **Altura**: 15 cm (z=0 a z=15)
- **Radio**: 3.175 cm
- **Eje**: Z-axis (vertical)
- **Posición**: Centrado en el feed de cámara

### Líneas BOH (Bottom Of Hole)
- **Línea 1**: z=0 → z=15 (inferior → centro)
- **Línea 2**: z=15 → z=30 (centro → superior)
- **Posición inicial**: 90° en la superficie del cilindro
- **Rango de desplazamiento**: ±20° alrededor del eje Z
- **Interacción**: Desplazamiento suave y manual
- **Color**: Rojo (#FF0000)
- **Grosor**: 0.1 cm

## Sistema de Coordenadas

### Eje Z (Vertical)
```
Z=30 ────────────────── (Top - BOH Line 2 end)
Z=15 ────────────────── (Center - BOH Lines junction)
Z=0  ────────────────── (Bottom - BOH Line 1 start)
```

### Eje X-Y (Horizontal)
```
        Y
        │
        │
    ────┼──── X
        │
        │
```

### Posicionamiento de las Líneas BOH
```
Vista Superior (desde arriba):

        90° (posición inicial)
            │
            │
    ────────┼────────
            │
            │
        70° ←─── 110° (rango ±20°)
```

## Interacción del Usuario

### Touch/Drag Controls
1. **Selección**: Tocar una línea BOH para seleccionarla
2. **Desplazamiento**: Arrastrar para mover la línea
3. **Rango**: Limitado a ±20° alrededor del eje Z
4. **Suavidad**: Movimiento interpolado para sensación natural

### Feedback Visual
- **Línea seleccionada**: Cambio de color o grosor
- **Límites**: Indicadores visuales en 70° y 110°
- **Posición actual**: Ángulo mostrado en tiempo real

## Integración con Sistema de Medición

### Puntos de Referencia
- **BOH Bottom**: z=0, ángulo ajustable
- **BOH Center**: z=15, ángulo ajustable  
- **BOH Top**: z=30, ángulo ajustable

### Sistema de Tríos de Puntos
- **Selección**: Puntos en la superficie visible del cilindro
- **Organización**: 3 puntos por trío
- **Colores**: Trio 1 (Azul), Trio 2 (Verde), Trio 3 (Amarillo)
- **Interacción**: Touch/click para seleccionar puntos
- **Validación**: Puntos forman triángulo válido en la superficie

### Sistema de Entrada Manual de Profundidad
- **Primer Trío**: Requiere entrada manual de profundidad para calibración
- **Interfaz**: Campo de entrada numérica para valor de profundidad
- **Rango**: 0.1cm a 100cm (configurable)
- **Validación**: Asegurar valor de profundidad está en rango válido
- **Propósito**: Establecer escala de medición y referencia
- **Unidades**: Centímetros (cm) como unidad primaria

### Sistema de Cálculo Automático de Profundidad
- **Tríos Posteriores**: Cálculo automático usando diámetro del cilindro
- **Diámetro del Cilindro**: 6.35 cm (HQ) como referencia conocida
- **Intersección con Eje Z**: Posición del plano asignada al punto de intersección con el eje Z
- **Fórmula Matemática**: profundidad = f(diámetro_cilindro, punto_intersección_z, ángulo_relativo)
- **Precisión**: Alta precisión usando cálculos geométricos
- **Propósito**: Eliminar entrada manual para mediciones posteriores

### Generación de Planos
- **Por Trío**: Cada trío genera un plano único
- **Definición**: Plano definido por los 3 puntos del trío
- **Visualización**: Planos semi-transparentes con colores diferentes
- **Ecuación**: ax + by + cz + d = 0
- **Propósito**: Base para cálculos geométricos y mediciones

### Cálculos de Medición
- **Ángulos**: Relativos a las líneas BOH posicionadas
- **Profundidad**: A lo largo del eje Z dentro del cilindro
- **Distancias**: Desde la superficie del cilindro a puntos detectados
- **Intersecciones**: Entre planos generados y el cilindro
- **Ángulos entre Planos**: Calculados desde planos de tríos
- **Validación de Tríos**: Asegurar puntos forman triángulos geométricos válidos

### Sistema de Medición de Ángulos Alfa y Beta
- **Ángulo Alfa**: Medición con respecto al eje Z para cada plano
- **Ángulo Beta**: Medición con respecto a la línea BOH correspondiente
- **Medición Dinámica**: Beta responde al desplazamiento de las líneas BOH
- **Posición Relativa**: Beta calculado según posición relativa del plano
- **Actualización en Tiempo Real**: Mediciones se actualizan dinámicamente
- **Precisión**: Alta precisión para todos los 100 planos

### Sistema de Reporte AC (Ángulo de Calce)
- **Cálculo AC**: Ángulo entre ambas líneas BOH
- **Posición Relativa BOH**: Posición de cada línea BOH en el reporte
- **Ángulo entre BOHs**: Cálculo dinámico del ángulo entre líneas BOH
- **Integración en Reporte**: AC incluido en el reporte de medición
- **Actualizaciones en Tiempo Real**: AC se actualiza con desplazamiento BOH
- **Visualización**: AC mostrado en el panel de reporte de medición

## Implementación Técnica

### Parámetros 3D
```typescript
interface BOHLine {
  start: Vector3;      // Punto inicial
  end: Vector3;        // Punto final
  angle: number;       // Ángulo actual (70°-110°)
  color: string;        // "#FF0000"
  thickness: number;    // 0.1 cm
  interactive: boolean; // true
}

interface PointTrio {
  id: string;          // Identificador único del trío
  points: Vector3[];    // [p1, p2, p3] - 3 puntos del trío
  color: string;        // Color del trío (Blue, Green, Yellow)
  plane: Plane;        // Plano generado por el trío
  valid: boolean;       // Triángulo válido en superficie
  manualDepth?: number; // Profundidad manual (solo primer trío)
  autoDepth?: number;   // Profundidad calculada automáticamente
  isFirstTrio: boolean; // true si es el primer trío
  depthCalculationMethod: 'manual' | 'automatic'; // Método de cálculo
  alphaAngle: number;   // Ángulo alfa con respecto al eje Z
  betaAngle: number;     // Ángulo beta con respecto a línea BOH
  dynamicBeta: boolean;  // true si beta es dinámico
}

interface Plane {
  equation: Vector4;   // [a, b, c, d] - ax + by + cz + d = 0
  normal: Vector3;      // Vector normal del plano
  color: string;        // Color del plano
  opacity: number;      // 0.3 - transparencia
  intersection: Line3D; // Intersección con cilindro
}
```

### Controles de Interacción
```typescript
interface BOHInteraction {
  minAngle: number;    // 70°
  maxAngle: number;    // 110°
  smoothness: number;  // 0.1
  sensitivity: number; // 1.0
  touchEnabled: boolean; // true
}

interface PointTrioInteraction {
  maxTrios: number;    // 3 - máximo de tríos
  minPointsPerTrio: number; // 3
  maxPointsPerTrio: number; // 3
  surfaceConstraint: boolean; // true - puntos en superficie
  validationEnabled: boolean; // true
  manualDepthRequired: boolean; // true para primer trío
  depthRange: { min: number; max: number; }; // { min: 0.1, max: 100 }
  depthUnit: string; // "cm"
}
```

## Flujo de Desarrollo

### Phase 1: Geometría Básica
- [ ] Crear cilindro 3D
- [ ] Implementar líneas BOH estáticas
- [ ] Alineación con eje Z

### Phase 2: Interacción
- [ ] Touch/drag para desplazamiento
- [ ] Límites de rango (±20°)
- [ ] Movimiento suave
- [ ] Feedback visual

### Phase 3: Tríos de Puntos
- [ ] Selección de puntos en superficie
- [ ] Organización en tríos (3 puntos)
- [ ] Feedback visual con colores
- [ ] Validación de triángulos
- [ ] Entrada manual de profundidad para primer trío
- [ ] Validación de rango de profundidad

### Phase 4: Generación de Planos
- [ ] Cálculo de planos por trío
- [ ] Visualización semi-transparente
- [ ] Intersección con cilindro
- [ ] Cálculos de ángulos entre planos

### Phase 5: Integración
- [ ] Conexión con sistema de medición
- [ ] Cálculos de ángulo en tiempo real
- [ ] Persistencia de posiciones
- [ ] Exportación de datos

### Phase 6: Medición de Ángulos Alfa y Beta
- [ ] Implementar medición de ángulo alfa con respecto al eje Z
- [ ] Implementar medición de ángulo beta con respecto a líneas BOH
- [ ] Agregar cálculo dinámico de beta respondiendo a desplazamiento BOH
- [ ] Crear actualizaciones en tiempo real para todos los 100 planos
- [ ] Agregar precisión y validación de mediciones de ángulos
- [ ] Implementar sistema de visualización y reporte de ángulos

### Phase 7: Sistema de Reporte AC (Ángulo de Calce)
- [ ] Implementar cálculo AC entre ambas líneas BOH
- [ ] Agregar seguimiento de posición relativa BOH en reporte
- [ ] Crear cálculo de ángulo entre BOHs
- [ ] Integrar AC en reporte de medición
- [ ] Agregar actualizaciones AC en tiempo real con desplazamiento BOH
- [ ] Implementar visualización AC en panel de reporte
