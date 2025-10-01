# Cálculos Geoespaciales - GeoStXR

## 📐 Resumen

Este módulo transforma las mediciones locales realizadas sobre el cilindro (en el marco de referencia del sondaje) a orientaciones y coordenadas reales en el espacio (marco de referencia global UTM).

---

## 🌍 Sistemas de Coordenadas

### **1. Marco Local (Cilindro)**
- **Origen**: Centro del cilindro
- **Eje Z**: A lo largo del sondaje (dirección de perforación)
- **Eje X**: Horizontal en la vista del cilindro (Este local)
- **Eje Y**: Horizontal en la vista del cilindro (Norte local)
- **BOH**: Línea de referencia en la superficie del cilindro

### **2. Marco Global (Real)**
- **Sistema**: UTM (Universal Transverse Mercator)
- **Norte**: Norte geográfico
- **Este**: Este UTM
- **Elevación**: Metros sobre el nivel del mar (m.s.n.m.)

---

## 📊 Ángulos Medidos (Local)

| Ángulo | Símbolo | Descripción |
|--------|---------|-------------|
| **Alpha (α)** | 0-90° | Inclinación del plano respecto al eje del cilindro (eje Z) |
| **Beta (β)** | 0-180° | Ángulo entre el plano y la línea BOH de referencia |
| **Azimuth Local** | 0-360° | Dirección en el marco del cilindro |

---

## 🎯 Transformación a Orientación Real

### **Cálculo de Dip y Dip Direction**

#### **Paso 1: Vector Normal del Plano (Marco Local)**

```typescript
// Azimut en el cilindro = BOH angle + β
azimuthLocal = bohAngle + β

// Componentes del vector normal
nx = sin(α) * cos(azimuthLocal)
ny = sin(α) * sin(azimuthLocal)
nz = cos(α)

normalLocal = [nx, ny, nz]
```

#### **Paso 2: Matriz de Rotación del Sondaje**

La matriz transforma vectores del marco local al marco global considerando:
- **Azimut del sondaje** (0-360°, desde Norte)
- **Inclinación del sondaje** (-90° a 90°, negativo = hacia abajo)

```typescript
// Rotación combinada (Rz * Ry)
R = [
  [cos(Az)*cos(Dip),  -sin(Az),  cos(Az)*sin(Dip)],
  [sin(Az)*cos(Dip),   cos(Az),  sin(Az)*sin(Dip)],
  [-sin(Dip),          0,        cos(Dip)]
]
```

#### **Paso 3: Transformar Normal a Marco Global**

```typescript
normalGlobal = R * normalLocal
[nx_global, ny_global, nz_global] = normalGlobal
```

#### **Paso 4: Calcular Dip y Dip Direction**

```typescript
// Dip: Inclinación del plano desde la horizontal
dip = arcsin(|nz_global|) * 180/π

// Dip Direction: Dirección de máxima pendiente
dipDirection = atan2(nx_global, ny_global) * 180/π

// Normalizar a 0-360°
if (dipDirection < 0) dipDirection += 360

// Asegurar que apunta hacia abajo
if (nz_global > 0) dipDirection = (dipDirection + 180) % 360
```

---

## 📍 Cálculo de Coordenadas Espaciales

### **Posición de la Estructura en el Espacio**

Dada la posición del collar y la profundidad a lo largo del sondaje:

```typescript
// Componentes de desplazamiento
horizontalDistance = depth * cos(drillDip)
verticalDistance = depth * sin(drillDip)

dEast = horizontalDistance * sin(drillAzimuth)
dNorth = horizontalDistance * cos(drillAzimuth)
dElevation = verticalDistance

// Coordenadas finales
East = collarEast + dEast
North = collarNorth + dNorth
Elevation = collarElevation + dElevation
```

### **Casos Especiales**

| Orientación | Azimut | Dip | Resultado |
|-------------|--------|-----|-----------|
| **Vertical hacia abajo** | - | -90° | dE=0, dN=0, dZ=-depth |
| **Horizontal Norte** | 0° | 0° | dE=0, dN=depth, dZ=0 |
| **Horizontal Este** | 90° | 0° | dE=depth, dN=0, dZ=0 |
| **Inclinado 45° al NE** | 45° | -45° | dE>0, dN>0, dZ<0 |

---

## 🧮 Ejemplo de Cálculo Completo

### **Datos de Entrada**

**Mediciones en el Cilindro:**
- α (alpha) = 30°
- β (beta) = 45°
- BOH angle = 90° (frontal)
- Profundidad = 15 cm = 0.15 m

**Información del Sondaje:**
- Nombre: DDH-001
- Azimut: 45° (NE)
- Inclinación: -60° (hacia abajo)
- Collar: E=345,678.50m, N=8,765,432.10m, Z=2,450.75m

### **Cálculo Paso a Paso**

#### **1. Vector Normal (Local)**
```
azimuthLocal = 90° + 45° = 135°

nx = sin(30°) * cos(135°) = 0.5 * (-0.707) = -0.354
ny = sin(30°) * sin(135°) = 0.5 * 0.707 = 0.354
nz = cos(30°) = 0.866

normalLocal = [-0.354, 0.354, 0.866]
```

#### **2. Matriz de Rotación**
```
Az = 45°, Dip = -60°

R = [
  [ 0.354, -0.707,  0.612],
  [ 0.354,  0.707,  0.612],
  [ 0.866,  0.000,  0.500]
]
```

#### **3. Normal Global**
```
normalGlobal = R * normalLocal
             = [ 0.354*(-0.354) + (-0.707)*0.354 + 0.612*0.866 ]
               [ 0.354*(-0.354) + 0.707*0.354 + 0.612*0.866 ]
               [ 0.866*(-0.354) + 0.000*0.354 + 0.500*0.866 ]
             = [ 0.280 ]
               [ 0.655 ]
               [ 0.127 ]
```

#### **4. Orientación Real**
```
dip = arcsin(|0.127|) * 180/π = 7.3°

dipDirection = atan2(0.280, 0.655) * 180/π = 23.2°
```

**Resultado: Dip = 7.3° / 23°** (notación geológica)

#### **5. Coordenadas Espaciales**
```
depth = 0.15 m
horizontalDist = 0.15 * cos(-60°) = 0.15 * 0.5 = 0.075 m
verticalDist = 0.15 * sin(-60°) = 0.15 * (-0.866) = -0.130 m

dEast = 0.075 * sin(45°) = 0.053 m
dNorth = 0.075 * cos(45°) = 0.053 m
dElevation = -0.130 m

East = 345,678.50 + 0.05 = 345,678.55 m
North = 8,765,432.10 + 0.05 = 8,765,432.15 m
Elevation = 2,450.75 - 0.13 = 2,450.62 m
```

**Resultado:**
- **UTM Este**: 345,678.55 m
- **UTM Norte**: 8,765,432.15 m
- **Cota**: 2,450.62 m.s.n.m.

---

## 📋 Salida en el Reporte CSV

```csv
Plano,Tipo_Estructura,Prof_cm,Prof_m,Alpha_grados,Beta_grados,Azimuth_grados,BOH_Ref,Dip_Real_grados,Dip_Direction_grados,UTM_Este_m,UTM_Norte_m,Elevacion_m
1,Veta,15.00,0.15,30.00,45.00,135.00,BOH1,7.30,23.20,345678.55,8765432.15,2450.62
```

---

## ⚠️ Validación y Rangos

### **Parámetros de Entrada**
- **Azimut del sondaje**: 0-360°
- **Inclinación del sondaje**: -90° (vertical abajo) a +90° (vertical arriba)
- **Alpha (α)**: 0-90°
- **Beta (β)**: 0-180°
- **Profundidad**: > 0

### **Salidas Esperadas**
- **Dip real**: 0-90°
- **Dip direction**: 0-360°
- **Coordenadas UTM**: Válidas en el sistema de referencia

---

## 🔬 Verificación y Testing

### **Casos de Prueba Recomendados**

1. **Sondaje Vertical (-90°)**
   - Verificar que las orientaciones se preservan correctamente
   - Verificar coordenadas X,Y = collar, Z = collar - depth

2. **Sondaje Horizontal (0°)**
   - Verificar transformaciones de orientación
   - Verificar desplazamiento horizontal

3. **Mediciones Conocidas**
   - Comparar con mediciones de terreno
   - Validar contra software geológico (Leapfrog, Dips, etc.)

### **Software de Referencia**
- **Dips** (RocScience): Análisis estereográfico
- **Leapfrog Geo**: Modelado geológico 3D
- **Datamine**: Software minero
- **Target for ArcGIS**: Gestión de datos de perforación

---

## 📚 Referencias

- Priest, S.D. (1993). *Discontinuity Analysis for Rock Engineering*
- Goodman, R.E. (1989). *Introduction to Rock Mechanics*
- RocScience Dips Documentation
- ISRM (2007). *The Complete ISRM Suggested Methods*

---

## 💡 Notas Importantes

1. **Convención de Signos**:
   - Dip negativo = hacia abajo (convención minera)
   - Dip positivo = hacia arriba (raro, pero posible)

2. **Sistema de Referencia**:
   - Todas las coordenadas UTM deben estar en el mismo datum (ej: WGS84, PSAD56)
   - Verificar zona UTM del proyecto

3. **Precisión**:
   - Coordenadas: ±0.01 m (1 cm)
   - Ángulos: ±0.1°
   - Depende de la precisión del collar y mediciones

4. **Limitaciones**:
   - Asume sondaje recto (no considera desviación del pozo)
   - Para pozos con desviación, se requiere survey data

---

*Última actualización: Octubre 2025*
*GeoStXR - Advanced Structural Geology Analysis*

