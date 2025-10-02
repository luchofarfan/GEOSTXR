# 🌐 GeoStXR Hub

**Hub Web centralizado para análisis y visualización de datos estructurales capturados con GeoStXR PWA**

## ✨ Funcionalidades (POC)

### ✅ Implementado:
- 📤 **Importación de CSV** desde GEOSTXR
- 📊 **Dashboard** con estadísticas globales
- 🔬 **Gestión de sondajes** y proyectos
- 🎮 **Visualización 3D** de sondajes individuales
- 🪨 **Estructuras como discos** intersectando el sondaje
- 🎨 **Colores por tipo** de estructura

### 🚧 Próximamente:
- 📈 Gráficos estadísticos (histogramas, rosetas)
- 🗺️ Vista multi-sondaje con coordenadas UTM
- 📑 Exportación de reportes (PDF, CSV consolidado)
- 🔐 Autenticación y multi-usuario
- ☁️ Sincronización automática desde PWA

## 🚀 Inicio Rápido

```bash
# Instalar dependencias
npm install

# Iniciar servidor de desarrollo
npm run dev

# Abrir en navegador
http://localhost:3000
```

## 📂 Estructura del Proyecto

```
geostxr-hub/
├── app/
│   ├── page.tsx           # Dashboard principal
│   └── layout.tsx         # Layout global
├── components/
│   ├── csv-uploader.tsx   # Upload e importación de CSV
│   ├── dashboard.tsx      # Estadísticas y lista de proyectos
│   └── drill-hole-viewer-3d.tsx  # Visualización 3D
├── lib/
│   └── csv-parser.ts      # Parser de CSV de GEOSTXR
├── types/
│   └── geostxr-data.ts    # Definiciones de tipos
└── docs/
    └── HUB_WEB_DESIGN.md  # Diseño completo del sistema
```

## 📊 Formato de Datos

El hub importa archivos CSV exportados desde GEOSTXR con el siguiente formato:

```csv
# Sondaje: DDH-001
# Azimut Sondaje: 45.0°
# Profundidad Manual: 15 cm
# ...

Plano,Tipo_Estructura,Profundidad_cm,Alpha_grados,Beta_grados,...
1,Veta,15.5,45.2,12.3,...
2,Falla,18.7,60.1,8.5,...
```

## 🎮 Uso

1. **Importar Datos:**
   - Click en "📤 Importar"
   - Arrastra archivo CSV o selecciona
   - Preview automático
   - Datos agregados al proyecto

2. **Ver Dashboard:**
   - Estadísticas globales
   - Lista de sondajes
   - Click en sondaje para ver detalles

3. **Visualización 3D:**
   - Vista interactiva del sondaje completo
   - Estructuras coloreadas por tipo
   - Rotación, zoom, pan con mouse

## 🛠️ Stack Tecnológico

- **Framework:** Next.js 14 + TypeScript
- **Estilos:** TailwindCSS
- **3D:** Three.js
- **Gráficos:** Recharts (próximamente)
- **CSV:** PapaParse
- **Hosting:** Vercel

## 📝 Roadmap

### Fase 1: POC ✅
- [x] Setup del proyecto
- [x] Importación de CSV
- [x] Dashboard básico
- [x] Visualización 3D simple

### Fase 2: Analytics (Próximo)
- [ ] Gráficos estadísticos
- [ ] Stereonets (rosetas)
- [ ] Filtros avanzados
- [ ] Análisis de dominios

### Fase 3: Multi-Proyecto
- [ ] Base de datos (Supabase)
- [ ] Autenticación
- [ ] Gestión de múltiples proyectos
- [ ] Upload de fotos

### Fase 4: Avanzado
- [ ] Exportación a formatos geológicos
- [ ] Reportes PDF automatizados
- [ ] API para sincronización con PWA
- [ ] Dashboard en tiempo real

## 📖 Documentación

Ver `docs/HUB_WEB_DESIGN.md` para diseño completo y arquitectura.

## 🔗 Proyectos Relacionados

- **GeoStXR PWA:** Aplicación móvil para captura de datos en campo
- **Repository:** https://github.com/luchofarfan/GEOSTXR

---

**Desarrollado como parte del ecosistema GeoStXR** 🪨✨
