# Sistemas de Coordenadas y Datums en GeoStXR

## 📍 Sistemas de Referencia Geográficos

---

## 1. Datums Comunes

### Datums Globales

#### WGS84 (World Geodetic System 1984)
- **Uso**: GPS, sistemas globales
- **Elipsoide**: WGS84
- **Aplicación**: Sistema más usado actualmente
- **Precisión**: ±1-2 metros horizontalmente

#### ITRF (International Terrestrial Reference Frame)
- **Uso**: Geodesia de alta precisión
- **Variantes**: ITRF2000, ITRF2008, ITRF2014
- **Precisión**: Milimétrica

---

### Datums Regionales

#### América del Sur

##### SIRGAS2000 (Sistema de Referencia Geocéntrico para las Américas)
- **Países**: Brasil, Chile, Argentina, Perú, Colombia, etc.
- **Época**: 2000.4
- **Compatibilidad**: Compatible con ITRF2000
- **Uso oficial**: Datum oficial en varios países sudamericanos

##### PSAD56 (Provisional South American Datum 1956)
- **Uso**: Datum antiguo, aún en uso en datos históricos
- **Elipsoide**: International 1924
- **Status**: En desuso, reemplazado por SIRGAS

##### SAD69 (South American Datum 1969)
- **Países**: Usado anteriormente en Brasil y otros
- **Elipsoide**: GRS67
- **Status**: Reemplazado por SIRGAS2000

#### América del Norte

##### NAD83 (North American Datum 1983)
- **Países**: USA, Canadá, México
- **Elipsoide**: GRS80
- **Uso**: Datum oficial en Norteamérica

#### Oceanía

##### GDA94/GDA2020 (Geocentric Datum of Australia)
- **País**: Australia
- **GDA94**: Compatible con WGS84
- **GDA2020**: Compatible con ITRF2014

---

## 2. Sistemas de Proyección

### Proyección UTM (Universal Transverse Mercator)

#### Características
- **Zonas**: 60 zonas de 6° de longitud cada una
- **Numeración**: 1-60 de oeste a este
- **Hemisferio**: Norte (N) o Sur (S)
- **Unidades**: Metros
- **False Easting**: 500,000 m
- **False Northing**: 10,000,000 m (Hemisferio Sur)

#### Zonas UTM en Regiones Mineras

**América del Sur:**
- **Chile Norte**: Zona 19S (Chuquicamata, Escondida)
- **Chile Central**: Zona 19S
- **Perú**: Zonas 17S, 18S, 19S
- **Argentina NO**: Zona 19S, 20S
- **Brasil**: Zonas 18S-25S

**América del Norte:**
- **México**: Zonas 11N-16N
- **USA Oeste**: Zonas 10N-13N (Nevada, Arizona)
- **Canadá**: Zonas 7N-22N

**Oceanía:**
- **Australia Oeste**: Zonas 49S-51S
- **Australia Este**: Zonas 54S-56S

#### Fórmula de Zona UTM
```
Zona = floor((Longitud + 180) / 6) + 1

Ejemplos:
- Longitud -70° (Chile) → Zona 19
- Longitud -60° (Argentina) → Zona 21
- Longitud 120° (Australia) → Zona 51
```

---

### Proyecciones Locales

#### Local Tangent Plane (LTP)
- **Uso**: Operaciones mineras de alta precisión
- **Origen**: Centro de la mina
- **Ventaja**: Minimiza distorsiones
- **Unidades**: Metros desde el origen

#### Coordenadas Locales de Mina
```
X_local = X_UTM - X_origen
Y_local = Y_UTM - Y_origen
Z_local = Z - Z_origen

Ventajas:
- Números más pequeños y manejables
- Menor propagación de errores
- Facilita cálculos de distancia
```

---

## 3. Transformaciones entre Sistemas

### Transformación de Datum (7 parámetros de Helmert)

```
ΔX, ΔY, ΔZ: Traslación (metros)
Rx, Ry, Rz: Rotación (segundos de arco)
s: Factor de escala (ppm)

X_destino = X_origen + ΔX + s·X_origen - Rz·Y_origen + Ry·Z_origen
Y_destino = Y_origen + ΔY + Rz·X_origen + s·Y_origen - Rx·Z_origen
Z_destino = Z_origen + ΔZ - Ry·X_origen + Rx·Y_origen + s·Z_origen
```

### Transformaciones Comunes

#### PSAD56 → SIRGAS2000 (Chile)
```
ΔX = +270.9 m
ΔY = +115.2 m
ΔZ = -357.8 m
Rx = -1.30" 
Ry = +0.40"
Rz = +6.20"
s = +9.9 ppm
```

#### WGS84 → SIRGAS2000
```
Diferencia insignificante: < 1 metro
Para aplicaciones mineras, se pueden considerar equivalentes
```

#### SAD69 → SIRGAS2000 (Brasil)
```
ΔX = -67.35 m
ΔY = +3.88 m
ΔZ = -38.22 m
```

---

## 4. Precisión y Tolerancias

### Niveles de Precisión Requeridos

| Aplicación | Precisión Horizontal | Precisión Vertical |
|------------|---------------------|-------------------|
| Exploración Regional | ±10 m | ±5 m |
| Perforación de Exploración | ±1 m | ±0.5 m |
| Perforación de Producción | ±0.5 m | ±0.25 m |
| Control de Leyes | ±0.1 m | ±0.05 m |
| Topografía de Precisión | ±0.01 m | ±0.01 m |

### Fuentes de Error

1. **Error de GPS**: ±1-5 m (GPS estándar), ±0.01 m (RTK)
2. **Error de transformación de datum**: ±0.5-2 m
3. **Error de proyección**: < 0.01 m (en zona UTM)
4. **Error de medición en terreno**: Variable

---

## 5. Implementación en GeoStXR

### Estructura de Datos Actualizada

```typescript
export interface CoordinateSystem {
  // Sistema de proyección
  projection: 'UTM' | 'LOCAL' | 'GEOGRAPHIC'
  
  // Datum
  datum: 'WGS84' | 'SIRGAS2000' | 'PSAD56' | 'NAD83' | 'GDA2020' | 'SAD69' | string
  
  // Zona UTM (si aplica)
  utmZone?: number  // 1-60
  utmHemisphere?: 'N' | 'S'
  
  // Origen local (si aplica)
  localOrigin?: {
    utmEast: number
    utmNorth: number
    elevation: number
    description?: string
  }
  
  // Elipsoide
  ellipsoid?: {
    name: string
    semiMajorAxis: number  // metros
    flattening: number
  }
  
  // Información adicional
  description?: string
  epsgCode?: number  // Código EPSG si aplica
}

export interface Position {
  // Coordenadas
  x: number  // Este (UTM) o X local
  y: number  // Norte (UTM) o Y local
  z: number  // Elevación sobre datum
  
  // Sistema de coordenadas
  coordinateSystem: CoordinateSystem
  
  // Precisión (opcional)
  accuracy?: {
    horizontal: number  // metros
    vertical: number    // metros
  }
  
  // Metadata
  capturedAt?: Date
  source?: 'GPS' | 'TOTAL_STATION' | 'DGPS' | 'RTK' | 'SURVEY' | 'ESTIMATED'
}

export interface DrillHoleInfo {
  id: string
  name: string
  
  // Collar position
  collar: Position
  
  // Orientation
  azimuth: number  // 0-360°
  dip: number      // -90 to 0°
  
  // Depth
  totalDepth: number  // metros
  
  // Additional info
  diameter?: number  // mm
  drilledDate?: Date
  contractor?: string
  purpose?: 'EXPLORATION' | 'PRODUCTION' | 'GEOTECHNICAL' | 'HYDROLOGY'
}
```

### Configuración de Proyecto

```typescript
export interface ProjectGeoreference {
  // Sistema principal del proyecto
  mainCoordinateSystem: CoordinateSystem
  
  // Sistema local (si se usa)
  localCoordinateSystem?: CoordinateSystem
  
  // Área de cobertura
  boundingBox?: {
    minX: number
    maxX: number
    minY: number
    maxY: number
    minZ?: number
    maxZ?: number
  }
  
  // Información de país/región
  country: string
  region?: string
  
  // Parámetros de transformación (si se necesitan)
  transformations?: CoordinateTransformation[]
}

export interface CoordinateTransformation {
  from: CoordinateSystem
  to: CoordinateSystem
  
  // Parámetros de Helmert (7 parámetros)
  helmertParameters?: {
    tx: number  // traslación X (metros)
    ty: number  // traslación Y (metros)
    tz: number  // traslación Z (metros)
    rx: number  // rotación X (segundos de arco)
    ry: number  // rotación Y (segundos de arco)
    rz: number  // rotación Z (segundos de arco)
    s: number   // factor de escala (ppm)
  }
  
  // Precisión esperada de la transformación
  accuracy?: number  // metros
}
```

---

## 6. Sistemas Predefinidos

### Definiciones Comunes

```typescript
export const PREDEFINED_COORDINATE_SYSTEMS = {
  // WGS84 UTM
  WGS84_UTM_19S: {
    projection: 'UTM',
    datum: 'WGS84',
    utmZone: 19,
    utmHemisphere: 'S',
    description: 'WGS84 UTM Zona 19 Sur (Chile Norte)',
    epsgCode: 32719
  },
  
  // SIRGAS2000 UTM
  SIRGAS2000_UTM_19S: {
    projection: 'UTM',
    datum: 'SIRGAS2000',
    utmZone: 19,
    utmHemisphere: 'S',
    description: 'SIRGAS2000 UTM Zona 19 Sur (Chile)',
    epsgCode: 31983
  },
  
  // PSAD56 UTM (datos históricos)
  PSAD56_UTM_19S: {
    projection: 'UTM',
    datum: 'PSAD56',
    utmZone: 19,
    utmHemisphere: 'S',
    description: 'PSAD56 UTM Zona 19 Sur (Chile - Histórico)',
    epsgCode: 24879
  },
  
  // NAD83 (Norteamérica)
  NAD83_UTM_12N: {
    projection: 'UTM',
    datum: 'NAD83',
    utmZone: 12,
    utmHemisphere: 'N',
    description: 'NAD83 UTM Zona 12 Norte (Nevada, USA)',
    epsgCode: 26912
  },
  
  // GDA2020 (Australia)
  GDA2020_UTM_51S: {
    projection: 'UTM',
    datum: 'GDA2020',
    utmZone: 51,
    utmHemisphere: 'S',
    description: 'GDA2020 UTM Zona 51 Sur (Australia Oeste)',
    epsgCode: 7851
  }
}
```

---

## 7. Validación y Controles de Calidad

### Checks Automáticos

1. **Coherencia de Zona UTM**
   ```typescript
   // Verificar que las coordenadas están en el rango correcto para la zona
   if (coordinateSystem.projection === 'UTM') {
     if (x < 160000 || x > 840000) {
       console.warn('Coordenada X fuera de rango típico de zona UTM')
     }
     if (utmHemisphere === 'S' && (y < 1000000 || y > 10000000)) {
       console.warn('Coordenada Y fuera de rango para Hemisferio Sur')
     }
   }
   ```

2. **Coherencia de Elevación**
   ```typescript
   // Verificar elevación razonable
   if (z < -500 || z > 9000) {
     console.warn('Elevación fuera de rango típico (-500m a 9000m)')
   }
   ```

3. **Distancia entre Pozos**
   ```typescript
   // Verificar que pozos cercanos no estén a distancias imposibles
   const distance = calculateDistance(hole1.collar, hole2.collar)
   if (distance < 1) {
     console.warn('Pozos muy cercanos, posible error de coordenadas')
   }
   ```

---

## 8. Interfaz de Usuario

### Selector de Sistema de Coordenadas

```typescript
// Componente de configuración
<CoordinateSystemSelector
  value={currentSystem}
  onChange={handleSystemChange}
  options={{
    regions: ['South America', 'North America', 'Oceania'],
    datums: ['WGS84', 'SIRGAS2000', 'PSAD56', 'NAD83'],
    projections: ['UTM', 'LOCAL']
  }}
/>
```

### Display de Coordenadas

```typescript
// Mostrar en formato apropiado
function formatCoordinates(position: Position): string {
  const { x, y, z, coordinateSystem } = position
  
  if (coordinateSystem.projection === 'UTM') {
    return `${x.toFixed(2)}E ${y.toFixed(2)}N ${z.toFixed(2)}m
            ${coordinateSystem.datum} Zona ${coordinateSystem.utmZone}${coordinateSystem.utmHemisphere}`
  }
  
  if (coordinateSystem.projection === 'LOCAL') {
    return `X: ${x.toFixed(2)}m  Y: ${y.toFixed(2)}m  Z: ${z.toFixed(2)}m (Local)`
  }
  
  return `${x.toFixed(6)}° ${y.toFixed(6)}° ${z.toFixed(2)}m`
}
```

---

## 9. Recomendaciones

### Para Nuevos Proyectos

1. **Usar SIRGAS2000** (Sudamérica) o **WGS84** (Global)
2. **UTM** para proyectos regionales
3. **Sistema Local** para operaciones de alta precisión
4. **Documentar siempre** el sistema de coordenadas usado

### Para Datos Históricos

1. Identificar el datum original (PSAD56, SAD69, etc.)
2. Transformar a sistema actual si es necesario
3. Documentar la transformación realizada
4. Mantener coordenadas originales como referencia

### Para Integración con Otros Sistemas

1. Usar códigos EPSG cuando sea posible
2. Documentar parámetros de transformación
3. Validar con puntos de control conocidos
4. Estimar precisión de la integración

---

## 10. Bibliotecas Recomendadas

### JavaScript/TypeScript

#### proj4js
```bash
npm install proj4
```

```typescript
import proj4 from 'proj4'

// Definir sistemas
proj4.defs('EPSG:32719', '+proj=utm +zone=19 +south +datum=WGS84 +units=m +no_defs')
proj4.defs('EPSG:31983', '+proj=utm +zone=19 +south +ellps=GRS80 +towgs84=0,0,0,0,0,0,0 +units=m +no_defs')

// Transformar
const [x, y] = proj4('EPSG:32719', 'EPSG:31983', [350000, 6500000])
```

#### turf.js (para cálculos geoespaciales)
```bash
npm install @turf/turf
```

```typescript
import * as turf from '@turf/turf'

// Distancia entre puntos
const distance = turf.distance([lon1, lat1], [lon2, lat2], { units: 'meters' })
```

---

## 11. Referencias

- [EPSG.io - Database of coordinate systems](https://epsg.io/)
- [SIRGAS](http://www.sirgas.org/)
- [PROJ - Cartographic Projections Library](https://proj.org/)
- [OGC Standards](https://www.ogc.org/standards/)
- [IGN Chile - Datums y Sistemas de Referencia](https://www.ign.gob.cl/)

---

**Última actualización:** 02 de Octubre, 2025  
**Versión:** 1.0  
**Autor:** GeoStXR Development Team

