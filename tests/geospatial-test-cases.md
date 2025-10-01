# Test Cases - Geospatial Calculations

## Caso 1: Sondaje Vertical (-90°)

### Input
```
Mediciones en cilindro:
- α (alpha): 30°
- β (beta): 45°
- BOH angle: 90° (frontal)

Sondaje:
- Azimut: 0° (Norte)
- Inclinación: -90° (vertical hacia abajo)
```

### Cálculo Manual

#### 1. Vector Normal (Local)
```
azimuthLocal = 90° + 45° = 135°

nx = sin(30°) * cos(135°) = 0.5 * (-0.707) = -0.354
ny = sin(30°) * sin(135°) = 0.5 * 0.707 = 0.354
nz = cos(30°) = 0.866

normalLocal = [-0.354, 0.354, 0.866]
```

#### 2. Matriz de Rotación (Az=0°, Dip=-90°)
```
Para sondaje vertical:
R = [
  [0,  0, -1],
  [0,  1,  0],
  [1,  0,  0]
]
```

#### 3. Normal Global
```
normalGlobal = R * normalLocal
             = [0*(-0.354) + 0*0.354 + (-1)*0.866]
               [0*(-0.354) + 1*0.354 + 0*0.866]
               [1*(-0.354) + 0*0.354 + 0*0.866]
             = [-0.866, 0.354, -0.354]
```

#### 4. Orientación Real
```
dip = arcsin(|-0.354|) = arcsin(0.354) = 20.7°

dipDirection = atan2(-0.866, 0.354) 
             = atan2(-0.866, 0.354) * 180/π
             = -67.8° + 360° = 292.2° (WNW)
```

**Resultado: 20.7° / 292°**

---

## Caso 2: Sondaje Horizontal Este (0°, Az=90°)

### Input
```
Mediciones en cilindro:
- α (alpha): 45°
- β (beta): 0°
- BOH angle: 90° (frontal)

Sondaje:
- Azimut: 90° (Este)
- Inclinación: 0° (horizontal)
```

### Cálculo Manual

#### 1. Vector Normal (Local)
```
azimuthLocal = 90° + 0° = 90°

nx = sin(45°) * cos(90°) = 0.707 * 0 = 0
ny = sin(45°) * sin(90°) = 0.707 * 1 = 0.707
nz = cos(45°) = 0.707

normalLocal = [0, 0.707, 0.707]
```

#### 2. Matriz de Rotación (Az=90°, Dip=0°)
```
R = [
  [0, -1,  0],
  [1,  0,  0],
  [0,  0,  1]
]
```

#### 3. Normal Global
```
normalGlobal = R * normalLocal
             = [0*0 + (-1)*0.707 + 0*0.707]
               [1*0 + 0*0.707 + 0*0.707]
               [0*0 + 0*0.707 + 1*0.707]
             = [-0.707, 0, 0.707]
```

#### 4. Orientación Real
```
dip = arcsin(|0.707|) = arcsin(0.707) = 45.0°

dipDirection = atan2(-0.707, 0) 
             = -90° + 360° = 270° (Oeste)
```

**Resultado: 45.0° / 270°**

---

## Caso 3: Sondaje Inclinado Típico (Az=45°, Dip=-60°)

### Input
```
Mediciones en cilindro:
- α (alpha): 30°
- β (beta): 45°
- BOH angle: 90° (frontal)

Sondaje:
- Azimut: 45° (NE)
- Inclinación: -60° (inclinado hacia abajo)
```

### Cálculo Manual

#### 1. Vector Normal (Local)
```
azimuthLocal = 90° + 45° = 135°

nx = sin(30°) * cos(135°) = 0.5 * (-0.707) = -0.354
ny = sin(30°) * sin(135°) = 0.5 * 0.707 = 0.354
nz = cos(30°) = 0.866

normalLocal = [-0.354, 0.354, 0.866]
```

#### 2. Matriz de Rotación (Az=45°, Dip=-60°)
```
Az = 45° → cos(45°)=0.707, sin(45°)=0.707
Dip = -60° → cos(-60°)=0.5, sin(-60°)=-0.866

R = [
  [0.707*0.5,    -0.707,  0.707*(-0.866)],
  [0.707*0.5,     0.707,  0.707*(-0.866)],
  [-(-0.866),     0,      0.5]
]
  = [
  [ 0.354,  -0.707,  -0.612],
  [ 0.354,   0.707,  -0.612],
  [ 0.866,   0,       0.5]
]
```

#### 3. Normal Global
```
normalGlobal = R * normalLocal
[nx]   [0.354*(-0.354) + (-0.707)*0.354 + (-0.612)*0.866]
[ny] = [0.354*(-0.354) + 0.707*0.354 + (-0.612)*0.866]
[nz]   [0.866*(-0.354) + 0*0.354 + 0.5*0.866]

    = [-0.125 - 0.250 - 0.530]     [-0.905]
      [-0.125 + 0.250 - 0.530]  =  [-0.405]
      [-0.307 + 0 + 0.433]         [ 0.126]
```

#### 4. Orientación Real
```
dip = arcsin(|0.126|) = arcsin(0.126) = 7.2°

dipDirection = atan2(-0.905, -0.405)
             = atan2(-0.905, -0.405) * 180/π
             = -114.1° + 360° = 245.9° (WSW)

// Como nz > 0, no rotamos
```

**Resultado: 7.2° / 246°**

---

## Validación con Software Geológico

### Dips (RocScience)
- Input: Plane trend/plunge of normal vector
- Compare with calculated dip/dip direction

### Leapfrog Geo
- Input: Drill hole orientation + local measurements
- Export structural data
- Compare coordinates and orientations

### Stereonet (Online)
- Plot normal vector
- Read dip/dip direction from great circle

---

## Casos Extremos

### Caso A: Plano Horizontal (α=90°)
```
Expected: dip ≈ 0°, dipDirection = indeterminate
```

### Caso B: Plano Vertical (α=0°)
```
Expected: dip ≈ 90°, dipDirection = from β + BOH
```

### Caso C: Sondaje Vertical Up (Dip=+90°)
```
Should handle positive dip correctly
```

---

## Notas

1. **Convención de Signos**:
   - Dip del sondaje negativo = hacia abajo (minería)
   - nz positivo → plano buza hacia arriba → rotar dipDirection 180°

2. **Coordenadas del Cilindro**:
   - Z = a lo largo del sondaje
   - X = Este en vista del cilindro
   - Y = Norte en vista del cilindro

3. **Precisión Esperada**:
   - Ángulos: ±0.5°
   - Coordenadas: ±0.01 m

4. **Limitaciones**:
   - Asume sondaje recto (sin desviación)
   - Ignora corrección magnética vs norte verdadero

