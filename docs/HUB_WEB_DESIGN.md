# GeoStXR Hub Web - Diseño y Arquitectura

## 🎯 Objetivo

Crear un hub web centralizado que permita:
1. **Sincronización** de datos capturados desde la PWA móvil
2. **Estadísticas** y análisis de estructuras geológicas
3. **Visualización 3D** de sondajes y estructuras
4. **Gestión de proyectos** y exportación de datos

## 📊 Funcionalidades Principales

### 1. **Dashboard Principal**
- Resumen de proyectos activos
- Estadísticas globales (total de sondajes, estructuras, metros perforados)
- Mapa de ubicaciones (si hay coordenadas UTM)
- Timeline de actividad reciente

### 2. **Sincronización de Datos**
- Upload manual de archivos CSV desde GEOSTXR
- Sincronización automática desde PWA (vía API)
- Importación de fotos compuestas (PNG con overlays)
- Validación de datos al importar
- Detección automática de duplicados

### 3. **Gestión de Proyectos**
```
Proyecto
├── Nombre, Cliente, Fecha
├── Sondajes (Drill Holes)
│   ├── Nombre (ej: "DDH-001")
│   ├── Coordenadas collar (UTM Este, Norte, Elevación)
│   ├── Azimut, Dip
│   ├── Profundidad total
│   └── Escenas (30cm segments)
│       ├── Profundidad inicio
│       ├── Foto capturada
│       └── Estructuras (Planos)
│           ├── Tipo de estructura (Veta, Falla, etc.)
│           ├── Alpha, Beta, AC
│           ├── Dip, Dip Direction (real)
│           ├── Coordenadas UTM del plano
│           └── Columnas personalizadas
```

### 4. **Visualización 3D Interactiva**

#### **Vista de Sondaje Individual:**
- Cilindro 3D del sondaje completo
- Planos/estructuras como discos intersectando
- Colores según tipo de estructura
- Rotación, zoom, pan
- Filtros por tipo, profundidad, ángulo

#### **Vista Multi-Sondaje:**
- Múltiples sondajes en espacio 3D
- Origen en coordenadas reales (UTM)
- Visualización de dominios estructurales
- Rosetas (stereonets) de orientaciones
- Análisis de familias de estructuras

### 5. **Análisis Estadístico**

- **Por Tipo de Estructura:**
  - Conteo, frecuencia
  - Distribución por profundidad
  - Orientación promedio (dip, dip direction)
  - Gráficos de densidad

- **Por Sondaje:**
  - RQD (Rock Quality Designation)
  - Frecuencia de fracturas
  - Intensidad de fracturamiento

- **Global:**
  - Rosetas de orientaciones (stereonet)
  - Histogramas de alpha, beta, AC
  - Análisis de dominios estructurales

### 6. **Exportación y Reportes**

- CSV consolidado (todos los proyectos)
- PDF con visualizaciones y estadísticas
- Imágenes 3D (capturas de pantalla)
- Formato para software geológico (Leapfrog, Vulcan, etc.)

## 🏗️ Arquitectura Técnica

### **Stack Recomendado:**

```
Frontend:
├── Next.js 14 (App Router) ✅ Ya lo usas
├── React + TypeScript
├── Three.js para visualización 3D ✅ Ya lo usas
├── Recharts / D3.js para gráficos estadísticos
└── TailwindCSS para estilos

Backend:
├── Next.js API Routes (serverless)
├── Supabase o Firebase (BaaS)
│   ├── Database (PostgreSQL)
│   ├── Storage (fotos/archivos)
│   └── Auth (usuarios/proyectos)
└── Vercel para hosting

Alternativa Self-Hosted:
├── Node.js + Express
├── PostgreSQL + PostGIS (para datos espaciales)
├── MinIO o S3 (almacenamiento de archivos)
└── Docker para deployment
```

### **Base de Datos (Schema Propuesto):**

```sql
-- Proyectos
CREATE TABLE projects (
  id UUID PRIMARY KEY,
  name VARCHAR(255),
  client VARCHAR(255),
  location VARCHAR(255),
  created_at TIMESTAMP,
  updated_at TIMESTAMP
);

-- Sondajes
CREATE TABLE drill_holes (
  id UUID PRIMARY KEY,
  project_id UUID REFERENCES projects(id),
  name VARCHAR(100), -- DDH-001, etc.
  collar_utm_east DECIMAL(12,2),
  collar_utm_north DECIMAL(12,2),
  collar_elevation DECIMAL(8,2),
  azimuth DECIMAL(5,2), -- 0-360°
  dip DECIMAL(5,2), -- -90 to 90°
  total_depth DECIMAL(8,2),
  created_at TIMESTAMP
);

-- Escenas (segmentos de 30cm)
CREATE TABLE scenes (
  id UUID PRIMARY KEY,
  drill_hole_id UUID REFERENCES drill_holes(id),
  depth_start DECIMAL(8,2), -- ej: 15.00 cm
  depth_end DECIMAL(8,2), -- ej: 45.00 cm (15 + 30)
  photo_url TEXT, -- URL de la foto compuesta
  captured_at TIMESTAMP,
  boh1_angle DECIMAL(5,2),
  boh2_angle DECIMAL(5,2),
  ac_angle DECIMAL(5,2)
);

-- Estructuras (planos)
CREATE TABLE structures (
  id UUID PRIMARY KEY,
  scene_id UUID REFERENCES scenes(id),
  structure_type VARCHAR(100), -- Veta, Falla, Diaclasa, etc.
  depth_in_scene DECIMAL(8,2), -- Profundidad dentro de la escena
  alpha DECIMAL(5,2), -- Ángulo alpha (local)
  beta DECIMAL(5,2), -- Ángulo beta (local)
  dip_real DECIMAL(5,2), -- Dip real (geoespacial)
  dip_direction DECIMAL(5,2), -- Dip direction (geoespacial)
  utm_east DECIMAL(12,2),
  utm_north DECIMAL(12,2),
  elevation DECIMAL(8,2),
  color VARCHAR(7), -- #RRGGBB
  custom_data JSONB -- Columnas personalizadas
);

-- Índices para búsquedas rápidas
CREATE INDEX idx_structures_type ON structures(structure_type);
CREATE INDEX idx_structures_scene ON structures(scene_id);
CREATE INDEX idx_scenes_drillhole ON scenes(drill_hole_id);
```

## 🚀 Plan de Implementación

### **Fase 1: Setup Básico** (1-2 días)

1. Crear proyecto Next.js separado: `geostxr-hub`
2. Configurar base de datos (Supabase recomendado)
3. Crear esquema de tablas
4. Implementar autenticación básica

### **Fase 2: Importación de Datos** (2-3 días)

1. Parser de CSV de GEOSTXR
2. UI para upload de archivos
3. Validación y preview antes de importar
4. Asociación con proyectos/sondajes
5. Upload de fotos a storage

### **Fase 3: Dashboard y Estadísticas** (3-4 días)

1. Vista de proyectos
2. Lista de sondajes por proyecto
3. Gráficos estadísticos:
   - Histogramas de orientaciones
   - Frecuencia por tipo de estructura
   - Distribución por profundidad
4. Tablas de datos con filtros

### **Fase 4: Visualización 3D** (4-5 días)

1. Viewer 3D de sondaje individual:
   - Cilindro completo con todas las escenas
   - Planos como discos intersectando
   - Colores por tipo de estructura
   
2. Viewer multi-sondaje:
   - Varios sondajes en espacio 3D real
   - Coordenadas UTM
   - Análisis de dominios estructurales

3. Controles interactivos:
   - Rotación, zoom, pan
   - Filtros por tipo, profundidad, orientación
   - Stereonets (rosetas)

### **Fase 5: Exportación y Reportes** (2-3 días)

1. Generación de reportes PDF
2. Exportación CSV consolidada
3. Exportación para software geológico
4. Capturas de pantalla de visualizaciones 3D

## 💰 Opciones de Hosting

### **Opción 1: Supabase + Vercel** (Recomendada para empezar)
- **Costo:** Gratis hasta 500MB DB, luego ~$25/mes
- **Ventajas:** Setup rápido, escalable, auth incluida
- **Limitaciones:** 500MB gratis, luego costos por uso

### **Opción 2: Self-Hosted** (Control total)
- **Costo:** VPS ~$10-20/mes
- **Ventajas:** Control total, sin límites de datos
- **Desventajas:** Requiere configuración y mantenimiento

### **Opción 3: Hybrid** (Inicio gratuito)
- **Vercel** para frontend (gratis)
- **Supabase** free tier para DB (500MB)
- **Cloudinary/ImgBB** para fotos (gratis hasta 25GB)
- **Migrar** a self-hosted cuando crezca

## 📋 Siguiente Paso

**¿Qué prefieres hacer?**

1. **🚀 Empezar YA** - Crear el proyecto base del hub
2. **📝 Más planificación** - Definir prioridades y mockups
3. **🧪 Proof of Concept** - Crear versión mínima primero
4. **💭 Discutir** - Ajustar requerimientos

**Yo recomiendo empezar con un POC (Proof of Concept) simple:**
- Upload de CSV
- Tabla de datos
- Visualización 3D básica de 1 sondaje

**¿Procedemos con el POC?** 🚀

