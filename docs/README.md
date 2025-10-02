# 📚 Documentación del Sistema GeoStXR

## Índice de Documentación Completa

---

## 🎯 Vista General

**GeoStXR** es un sistema integral para captura, sincronización y análisis de datos estructurales geológicos, compuesto por:

1. **App Android** - Captura de datos en campo con dispositivos móviles
2. **Hub Web** - Plataforma de gestión, visualización 3D y análisis
3. **API Backend** - Sincronización, almacenamiento y control de acceso

---

## 📖 Documentos Disponibles

### 1. [**SYSTEM_ARCHITECTURE.md**](./SYSTEM_ARCHITECTURE.md) - Arquitectura Completa
**Tamaño:** ~30 KB | **Lectura:** 20 minutos

**Contenido:**
- 🗂️ Estructura de datos completa (modelos TypeScript)
- 👥 Sistema de roles y permisos (Admin, Geólogo, Viewer)
- 🔄 Flujo de trabajo detallado (4 fases)
- 🔌 API Endpoints completos (REST API)
- 🔄 Estrategia de sincronización (offline-first)
- 🔒 Seguridad (JWT, encriptación, autorización)
- 📱 Consideraciones de implementación
- 🚀 Roadmap por fases

**Para quién:**
- Arquitectos de software
- Product managers
- Desarrolladores backend/frontend
- Stakeholders técnicos

---

### 2. [**API_IMPLEMENTATION_EXAMPLE.md**](./API_IMPLEMENTATION_EXAMPLE.md) - Código de Implementación
**Tamaño:** ~15 KB | **Lectura:** 15 minutos

**Contenido:**
- 📁 Estructura de proyecto backend
- 🗄️ Schema Prisma (PostgreSQL)
- 🔐 Middleware de autenticación y permisos
- 🎮 Controllers de sincronización
- 📱 Ejemplo de código Android (Kotlin)
- ⚙️ Variables de entorno
- 🚀 Comandos de inicio

**Para quién:**
- Desarrolladores backend (Node.js/Express)
- Desarrolladores Android (Kotlin)
- DevOps engineers
- Equipo de implementación

---

### 3. [**FLOW_DIAGRAMS.md**](./FLOW_DIAGRAMS.md) - Diagramas Visuales ⭐ NUEVO
**Tamaño:** ~25 KB | **Lectura:** 30 minutos (interactivo)

**Contenido:**
✅ **10 Diagramas Mermaid:**

1. **Arquitectura General** - Vista de sistema completo
2. **Flujo Completo** - Secuencia desde configuración hasta visualización
3. **Login y Autenticación** - Flujo de seguridad
4. **Captura de Estructura** - Paso a paso en campo
5. **Sincronización con Errores** - Manejo de conflictos
6. **Jerarquía de Datos** - Relaciones entre entidades
7. **Roles y Permisos** - Matriz de autorizaciones
8. **Visualización 3D** - Flujo de renderizado
9. **Base de Datos ER** - Diagrama entidad-relación
10. **Timeline de Implementación** - Gantt chart

**Para quién:**
- Todo el equipo (visual y fácil de entender)
- Presentaciones a stakeholders
- Onboarding de nuevos miembros
- Documentación de referencia rápida

---

## 🚀 Guías de Inicio Rápido

### Para Desarrolladores Backend

```bash
# 1. Clonar repositorio
git clone <repo-url>
cd GEOSTXR

# 2. Leer arquitectura
docs/SYSTEM_ARCHITECTURE.md

# 3. Revisar implementación
docs/API_IMPLEMENTATION_EXAMPLE.md

# 4. Ver diagramas de flujo
docs/FLOW_DIAGRAMS.md
```

### Para Product Managers

```
1. Leer: SYSTEM_ARCHITECTURE.md (secciones: Estructura de Datos, Roles, Flujo)
2. Ver: FLOW_DIAGRAMS.md (Diagrama #1, #2, #7)
3. Revisar: Timeline de implementación (Diagrama #10)
```

### Para Stakeholders

```
1. Ver: FLOW_DIAGRAMS.md (Diagrama #1 - Arquitectura General)
2. Ver: FLOW_DIAGRAMS.md (Diagrama #2 - Flujo Completo)
3. Ver: FLOW_DIAGRAMS.md (Diagrama #10 - Timeline)
```

---

## 🎨 Convenciones de Diagramas

### Colores en Diagramas Mermaid

- 🟢 **Verde** (#4CAF50) - Acciones exitosas, permisos concedidos
- 🔵 **Azul** (#2196F3) - Procesos normales, flujo principal
- 🟠 **Naranja** (#FF9800) - Advertencias, pendientes
- 🔴 **Rojo** (#F44336) - Errores, permisos denegados
- 🟣 **Morado** (#9C27B0) - Entidades principales

### Íconos Utilizados

- ✅ Permitido/Completado
- ❌ Denegado/No disponible
- 👁️ Solo lectura
- 🔒 Protegido/Seguro
- 🔄 Sincronización
- 📱 App móvil
- 🌐 Web
- 🗄️ Base de datos
- ⚙️ Configuración
- 🎮 Interactivo

---

## 🔑 Conceptos Clave del Sistema

### 1. Jerarquía de Datos

```
Organización
  └── Proyecto (ej: "Mina XYZ")
       ├── Usuarios (con roles)
       ├── Configuración (tipos de estructuras, columnas)
       └── Pozos/Sondajes (DDH)
            ├── Información del Collar (UTM, elevación)
            ├── Orientación (Azimut, Dip)
            └── Sesiones de Medición
                 ├── Metadata (fecha, usuario, dispositivo)
                 ├── Configuración (profundidad, BOH)
                 └── Estructuras Capturadas
                      ├── Ángulos (Alpha, Beta, Azimuth)
                      ├── Orientación (Dip, Dip Direction)
                      ├── Puntos 3D (P1, P2, P3)
                      └── Datos Personalizados
```

### 2. Roles del Sistema

| Rol | Descripción | Permisos Clave |
|-----|-------------|----------------|
| 👑 **Admin** | Administrador del proyecto | Todo: crear, editar, eliminar, gestionar usuarios |
| 🔬 **Geologist** | Geólogo de campo | Capturar datos, editar propias mediciones |
| 👁️ **Viewer** | Visualizador | Solo lectura y exportación |

### 3. Flujo de Trabajo

```
🏢 Oficina (Hub Web)          🏔️ Campo (App Android)         🏢 Oficina (Hub Web)
     ↓                                ↓                            ↓
1. Configurar Proyecto    →    2. Capturar Datos    →    3. Visualizar y Analizar
   - Crear proyecto              - Login                    - Ver dashboard
   - Definir pozos               - Seleccionar pozo         - Vista 3D
   - Invitar usuarios            - Tomar fotos              - Exportar CSV
   - Configurar tipos            - Marcar puntos            - Análisis
                                 - Guardar localmente
                                      ↓
                                 🔄 Sincronización
                                      ↓
                                 - Subir al servidor
                                 - Validar permisos
                                 - Almacenar datos
```

### 4. Sincronización Offline-First

**Principios:**
- ✅ App funciona completamente sin internet
- ✅ Datos se guardan localmente primero
- ✅ Sincronización automática cuando hay conexión
- ✅ Resolución de conflictos automática o manual
- ✅ Reintentos automáticos en caso de error

**Estados de Sincronización:**
- 🟢 **Synced** - Datos sincronizados con el servidor
- 🟡 **Pending** - Esperando conexión para sincronizar
- 🔴 **Error** - Error de sincronización (requiere acción)
- 🔵 **Syncing** - Sincronización en progreso

---

## 📊 Especificaciones Técnicas

### Stack Tecnológico Recomendado

#### Backend
- **Runtime:** Node.js 17+
- **Framework:** Express.js
- **Base de Datos:** PostgreSQL 14+
- **ORM:** Prisma
- **Autenticación:** JWT (jsonwebtoken)
- **Storage:** AWS S3 (fotos)
- **Cache:** Redis (opcional)

#### Hub Web
- **Framework:** Next.js 14
- **UI:** React 18 + TypeScript
- **Styling:** Tailwind CSS
- **3D:** Three.js
- **State:** React Context/Zustand
- **API Client:** Fetch/Axios

#### App Android
- **Lenguaje:** Kotlin
- **UI:** Jetpack Compose
- **Base de Datos:** Room (SQLite)
- **Networking:** Retrofit
- **Imágenes:** Coil
- **Camera:** CameraX
- **Background Sync:** WorkManager
- **DI:** Hilt

---

## 🔒 Consideraciones de Seguridad

### Autenticación
- ✅ JWT con expiración de 24 horas
- ✅ Refresh tokens para renovación automática
- ✅ Passwords hasheados con bcrypt
- ✅ HTTPS/TLS obligatorio en producción

### Autorización
- ✅ Verificación de permisos en cada endpoint
- ✅ Roles granulares por proyecto
- ✅ Middleware de autorización centralizado
- ✅ Auditoría de acciones (quién, qué, cuándo)

### Datos
- ✅ Encriptación en tránsito (HTTPS)
- ✅ Encriptación en reposo (base de datos)
- ✅ Secure Storage en dispositivos móviles
- ✅ Validación de entrada en API

---

## 📈 Métricas y KPIs

### Métricas Operacionales
- **Proyectos activos** - Total de proyectos en uso
- **Usuarios activos** - Usuarios que han usado el sistema en los últimos 30 días
- **Sesiones de captura** - Total de sesiones de medición
- **Estructuras capturadas** - Total de estructuras medidas
- **Tasa de sincronización** - % de sesiones sincronizadas exitosamente
- **Tiempo promedio de captura** - Tiempo por estructura

### Métricas Técnicas
- **Uptime del servidor** - Disponibilidad del backend
- **Latencia de API** - Tiempo de respuesta promedio
- **Tasa de errores** - % de requests fallidos
- **Tamaño de storage** - Espacio usado en S3
- **Velocidad de sincronización** - Tiempo promedio de sync

---

## 🐛 Resolución de Problemas Comunes

### App Android

**Problema:** "No se puede sincronizar"
- ✅ Verificar conexión a internet
- ✅ Verificar que el token no haya expirado
- ✅ Revisar logs en la app
- ✅ Verificar permisos del usuario en el proyecto

**Problema:** "Error al capturar foto"
- ✅ Verificar permisos de cámara
- ✅ Verificar espacio de almacenamiento
- ✅ Reiniciar la app

### Hub Web

**Problema:** "Vista 3D no carga"
- ✅ Verificar que hay estructuras en el pozo
- ✅ Verificar consola del navegador
- ✅ Actualizar la página
- ✅ Probar en otro navegador

**Problema:** "No puedo ver el proyecto"
- ✅ Verificar que el usuario tiene acceso al proyecto
- ✅ Verificar rol del usuario
- ✅ Contactar al administrador del proyecto

---

## 📞 Soporte y Contacto

### Para Desarrolladores
- **Issues:** GitHub Issues
- **Documentación:** Este directorio (`docs/`)
- **Código de ejemplo:** `docs/API_IMPLEMENTATION_EXAMPLE.md`

### Para Usuarios
- **Manual de usuario:** (Pendiente)
- **Video tutoriales:** (Pendiente)
- **Soporte técnico:** support@geostxr.com

---

## 📝 Changelog

### v1.0 (Actual)
- ✅ Arquitectura del sistema completa
- ✅ Documentación de API
- ✅ 10 diagramas visuales
- ✅ Ejemplo de implementación backend
- ✅ Roadmap de implementación

### v1.1 (Próximo)
- ⏳ Manual de usuario
- ⏳ Video tutoriales
- ⏳ Guía de despliegue
- ⏳ Tests automatizados

---

## 🤝 Contribución

Para contribuir a la documentación:

1. Leer la documentación existente
2. Identificar áreas de mejora
3. Crear issue describiendo la mejora
4. Hacer fork y crear branch
5. Actualizar documentación
6. Crear pull request

---

## 📜 Licencia

[Definir licencia del proyecto]

---

## 🎓 Recursos Adicionales

### Tecnologías Utilizadas
- [Next.js Documentation](https://nextjs.org/docs)
- [Three.js Documentation](https://threejs.org/docs/)
- [Prisma Documentation](https://www.prisma.io/docs)
- [Android Jetpack](https://developer.android.com/jetpack)
- [JWT.io](https://jwt.io/)

### Conceptos Geológicos
- [Orientación de Estructuras Geológicas](https://en.wikipedia.org/wiki/Strike_and_dip)
- [Dip y Dip Direction](https://en.wikipedia.org/wiki/Structural_geology)
- [Core Logging](https://en.wikipedia.org/wiki/Core_sample)

---

**Última actualización:** 02 de Octubre, 2025

**Versión de documentación:** 1.0

**Estado del proyecto:** 🚧 En desarrollo

