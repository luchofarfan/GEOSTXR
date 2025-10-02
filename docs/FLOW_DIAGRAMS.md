# Diagramas de Flujo - Sistema GeoStXR

## 📊 Diagramas Visuales del Sistema Completo

---

## 1. Arquitectura General del Sistema

```mermaid
graph TB
    subgraph "App Android - Campo"
        A1[Geólogo con Tablet]
        A2[Captura de Fotos]
        A3[Marcado de Puntos]
        A4[Base de Datos Local SQLite]
    end
    
    subgraph "Sincronización"
        S1[API REST]
        S2[JWT Auth]
        S3[Upload de Fotos]
    end
    
    subgraph "Hub Web - Oficina"
        H1[Dashboard]
        H2[Visualización 3D]
        H3[Gestión de Proyectos]
        H4[Exportación CSV]
    end
    
    subgraph "Backend"
        B1[PostgreSQL]
        B2[API Server Node.js]
        B3[AWS S3 Fotos]
    end
    
    A1 --> A2
    A2 --> A3
    A3 --> A4
    A4 -->|Sincronización| S1
    S1 --> S2
    S2 --> S3
    S3 --> B2
    B2 --> B1
    B2 --> B3
    B1 --> H1
    B1 --> H2
    H1 --> H3
    H2 --> H4
    
    style A1 fill:#4CAF50
    style H1 fill:#2196F3
    style B2 fill:#FF9800
```

---

## 2. Flujo Completo: Configuración → Captura → Visualización

```mermaid
sequenceDiagram
    participant Admin
    participant Hub as Hub Web
    participant API
    participant DB as PostgreSQL
    participant Geólogo
    participant App as App Android
    
    Note over Admin,DB: FASE 1: CONFIGURACIÓN (Hub Web)
    Admin->>Hub: 1. Login
    Hub->>API: Autenticar
    API->>DB: Verificar credenciales
    DB-->>API: Usuario válido
    API-->>Hub: JWT Token
    Hub-->>Admin: Dashboard
    
    Admin->>Hub: 2. Crear Proyecto "Mina XYZ"
    Hub->>API: POST /api/v1/projects
    API->>DB: Insertar proyecto
    DB-->>API: Proyecto creado
    API-->>Hub: ID del proyecto
    
    Admin->>Hub: 3. Crear Pozo "DDH-AOC-001"
    Hub->>API: POST /api/v1/drillholes
    API->>DB: Insertar pozo (collar, orientación)
    DB-->>API: Pozo creado
    
    Admin->>Hub: 4. Invitar Geólogo
    Hub->>API: POST /api/v1/projects/{id}/users
    API->>DB: Agregar usuario con rol "geologist"
    DB-->>API: Usuario agregado
    API-->>Geólogo: Email de invitación
    
    Note over Geólogo,DB: FASE 2: CAPTURA EN CAMPO (App Android)
    Geólogo->>App: 5. Login
    App->>API: POST /api/v1/auth/login
    API->>DB: Verificar usuario
    DB-->>API: Usuario válido
    API-->>App: JWT Token
    App-->>Geólogo: Lista de proyectos
    
    Geólogo->>App: 6. Seleccionar "Mina XYZ"
    App->>API: GET /api/v1/projects/{id}
    API->>DB: Obtener proyecto y pozos
    DB-->>API: Datos del proyecto
    API-->>App: Proyecto + Pozos
    App-->>Geólogo: Lista de pozos
    
    Geólogo->>App: 7. Seleccionar "DDH-AOC-001"
    Geólogo->>App: 8. Iniciar sesión de medición
    Note over App: Configurar profundidad, BOH
    
    loop Por cada estructura
        Geólogo->>App: 9. Tomar foto del testigo
        Geólogo->>App: 10. Marcar 3 puntos (P1, P2, P3)
        App->>App: Calcular Alpha, Beta, Azimuth
        App->>App: Calcular Dip, Dip Direction
        Geólogo->>App: 11. Seleccionar tipo de estructura
        App->>DB: Guardar en SQLite local
    end
    
    Geólogo->>App: 12. Cerrar sesión
    
    Note over App,DB: FASE 3: SINCRONIZACIÓN
    App->>API: POST /api/v1/sync/session
    Note over App: Enviar: sesión + estructuras + fotos
    API->>DB: Validar permisos del usuario
    DB-->>API: Usuario autorizado
    API->>DB: Insertar sesión
    API->>DB: Insertar estructuras (x100)
    API->>API: Upload fotos a S3
    DB-->>API: Datos guardados
    API-->>App: Sincronización exitosa
    App-->>Geólogo: ✅ Datos sincronizados
    
    Note over Admin,DB: FASE 4: VISUALIZACIÓN (Hub Web)
    Admin->>Hub: 13. Ver proyecto
    Hub->>API: GET /api/v1/projects/{id}/drillholes
    API->>DB: Obtener pozos + sesiones + estructuras
    DB-->>API: Todos los datos
    API-->>Hub: Datos del proyecto
    Hub-->>Admin: Dashboard con estadísticas
    
    Admin->>Hub: 14. Abrir Vista 3D
    Hub->>API: GET /api/v1/drillholes/{id}/structures
    API->>DB: Obtener estructuras con coordenadas
    DB-->>API: 100 estructuras con P1, P2, P3
    API-->>Hub: Datos para visualización
    Hub-->>Admin: Modelo 3D interactivo
    
    Admin->>Hub: 15. Exportar CSV
    Hub->>API: GET /api/v1/drillholes/{id}/export/csv
    API->>DB: Generar reporte completo
    DB-->>API: Datos en formato CSV
    API-->>Hub: Archivo CSV
    Hub-->>Admin: Descarga GeoStXR_DDH-AOC-001.csv
```

---

## 3. Flujo de Login y Autenticación

```mermaid
flowchart TD
    A[Usuario abre App/Hub] --> B{¿Tiene token JWT guardado?}
    B -->|Sí| C{¿Token válido?}
    B -->|No| D[Mostrar pantalla de Login]
    
    C -->|Sí| E[Ir a Dashboard]
    C -->|No| D
    
    D --> F[Usuario ingresa email + password]
    F --> G[POST /api/v1/auth/login]
    G --> H{¿Credenciales correctas?}
    
    H -->|No| I[Mostrar error]
    I --> D
    
    H -->|Sí| J[Generar JWT Token]
    J --> K[Guardar token en Secure Storage]
    K --> E
    
    E --> L[Usuario trabaja en la app]
    L --> M{¿Token expira?}
    
    M -->|No| L
    M -->|Sí| N[POST /api/v1/auth/refresh]
    N --> O{¿Refresh exitoso?}
    
    O -->|Sí| P[Nuevo token]
    P --> K
    
    O -->|No| Q[Logout automático]
    Q --> D
    
    style E fill:#4CAF50
    style I fill:#F44336
    style J fill:#2196F3
```

---

## 4. Flujo de Captura de Estructura (App Android)

```mermaid
flowchart TD
    A[Geólogo en pozo] --> B[Abrir App]
    B --> C[Seleccionar Proyecto]
    C --> D[Seleccionar Pozo DDH-AOC-001]
    D --> E[Nueva Sesión de Medición]
    
    E --> F[Configurar Sesión]
    F --> F1[Ingresar Profundidad Manual ej: 515 cm]
    F1 --> F2[Configurar BOH1: 80.4°]
    F2 --> F3[Configurar BOH2: 97.9°]
    F3 --> G[Iniciar Captura]
    
    G --> H[Tomar Foto del Testigo]
    H --> I[Foto capturada]
    I --> J[Mostrar foto en pantalla]
    
    J --> K[Activar modo de marcado]
    K --> L[Geólogo marca P1 primer punto]
    L --> M[Geólogo marca P2 segundo punto]
    M --> N[Geólogo marca P3 tercer punto]
    
    N --> O[Calcular automáticamente]
    O --> O1[Alpha: ángulo del plano con eje del testigo]
    O1 --> O2[Beta: rotación alrededor del eje]
    O2 --> O3[Azimuth: orientación absoluta]
    O3 --> O4[Dip Real: buzamiento verdadero]
    O4 --> O5[Dip Direction: dirección del buzamiento]
    O5 --> O6[Coordenadas UTM de la estructura]
    
    O6 --> P[Mostrar resultados calculados]
    P --> Q{¿Valores correctos?}
    
    Q -->|No| K
    Q -->|Sí| R[Seleccionar Tipo de Estructura]
    
    R --> S[Menú de tipos]
    S --> S1[Fractura]
    S --> S2[Veta]
    S --> S3[Falla]
    S --> S4[Contacto]
    
    S1 --> T[Llenar columnas personalizadas]
    S2 --> T
    S3 --> T
    S4 --> T
    
    T --> T1[Relleno: Calcita]
    T1 --> T2[Espesor: 2mm]
    T2 --> T3[Dureza opcional]
    
    T3 --> U[Guardar Estructura]
    U --> V[Almacenar en SQLite local]
    V --> W{¿Más estructuras?}
    
    W -->|Sí| G
    W -->|No| X[Cerrar Sesión]
    
    X --> Y[Generar Reporte CSV local]
    Y --> Z{¿Hay internet?}
    
    Z -->|Sí| AA[Sincronizar automáticamente]
    Z -->|No| AB[Marcar como pendiente]
    
    AA --> AC[Subir datos al servidor]
    AC --> AD[✅ Sincronización exitosa]
    
    AB --> AE[⏳ Sincronización pendiente]
    AE --> AF[Sincronizar cuando haya conexión]
    
    style AD fill:#4CAF50
    style AE fill:#FF9800
    style O fill:#2196F3
```

---

## 5. Flujo de Sincronización con Manejo de Errores

```mermaid
flowchart TD
    A[Usuario cierra sesión] --> B[Iniciar sincronización]
    B --> C{¿Conexión a internet?}
    
    C -->|No| D[Guardar en cola de sincronización]
    D --> E[Mostrar icono ⏳ Pendiente]
    E --> F[Esperar conexión]
    F --> G[WorkManager verifica cada hora]
    G --> C
    
    C -->|Sí| H[Verificar token JWT]
    H --> I{¿Token válido?}
    
    I -->|No| J[Renovar token]
    J --> K{¿Renovación exitosa?}
    
    K -->|No| L[Mostrar: Re-autenticación requerida]
    L --> M[Usuario hace login]
    M --> H
    
    K -->|Sí| N[Token renovado]
    N --> O[Preparar datos para subir]
    
    I -->|Sí| O
    
    O --> P[Comprimir fotos]
    P --> Q[POST /api/v1/sync/session]
    Q --> R{¿Respuesta del servidor?}
    
    R -->|Error 403 Forbidden| S[Error de permisos]
    S --> T[Verificar rol del usuario]
    T --> U[Mostrar error: Sin permisos]
    
    R -->|Error 409 Conflict| V[Conflicto de datos]
    V --> W[Mostrar opciones al usuario]
    W --> W1[Sobrescribir servidor]
    W --> W2[Mantener datos locales]
    W --> W3[Resolver manualmente]
    
    W1 --> Q
    W2 --> X[Mantener local]
    W3 --> Y[Interfaz de resolución]
    
    R -->|Error 500 Server Error| Z[Error del servidor]
    Z --> AA[Reintentar en 5 min]
    AA --> AB[Incrementar contador de reintentos]
    AB --> AC{¿Reintentos < 3?}
    
    AC -->|Sí| AD[Esperar 5 minutos]
    AD --> Q
    
    AC -->|No| AE[Marcar como error crítico]
    AE --> AF[Notificar al usuario]
    AF --> AG[Requiere acción manual]
    
    R -->|200 Success| AH[✅ Sincronización exitosa]
    AH --> AI[Actualizar estado en DB local]
    AI --> AJ[Marcar sesión como sincronizada]
    AJ --> AK[Guardar timestamp de sincronización]
    AK --> AL{¿Eliminar datos locales?}
    
    AL -->|Sí| AM[Eliminar fotos para liberar espacio]
    AM --> AN[Mantener solo metadata]
    
    AL -->|No| AO[Mantener copia local]
    
    AN --> AP[Mostrar notificación de éxito]
    AO --> AP
    AP --> AQ[Actualizar UI]
    
    style AH fill:#4CAF50
    style U fill:#F44336
    style AE fill:#F44336
    style E fill:#FF9800
```

---

## 6. Jerarquía de Datos y Relaciones

```mermaid
graph TD
    A[Organización/Empresa] --> B[Proyecto: Mina XYZ]
    A --> C[Proyecto: Mina ABC]
    
    B --> D[Usuario Admin: admin@empresa.com]
    B --> E[Usuario Geólogo: geo1@empresa.com]
    B --> F[Usuario Geólogo: geo2@empresa.com]
    B --> G[Usuario Viewer: viewer@empresa.com]
    
    B --> H[Pozo: DDH-AOC-001]
    B --> I[Pozo: DDH-AOC-002]
    
    H --> J[Collar: UTM 350000E, 6500000N, 2000m]
    H --> K[Orientación: Az 60°, Dip -60°]
    
    H --> L[Sesión 1: 02/10/2025 10:30]
    H --> M[Sesión 2: 02/10/2025 14:15]
    
    L --> N[Metadata: Dispositivo, Usuario, BOH]
    L --> O[15 Estructuras]
    L --> P[5 Fotos]
    
    O --> Q[Estructura 1: Fractura]
    O --> R[Estructura 2: Veta]
    O --> S[Estructura 3: Falla]
    
    Q --> T[Profundidad: 515 cm]
    Q --> U[Ángulos: α=85°, β=4°, Az=121°]
    Q --> V[Orientación: Dip 87°, DipDir 69°]
    Q --> W[Puntos 3D: P1, P2, P3]
    Q --> X[UTM: 350002E, 6500001N, 1996m]
    Q --> Y[Custom: Relleno=Calcita, Espesor=2mm]
    
    style A fill:#9C27B0
    style B fill:#2196F3
    style H fill:#4CAF50
    style L fill:#FF9800
    style Q fill:#F44336
```

---

## 7. Sistema de Roles y Permisos

```mermaid
flowchart TD
    A[Usuario intenta acción] --> B{¿Autenticado?}
    
    B -->|No| C[Redirigir a Login]
    B -->|Sí| D[Verificar rol en proyecto]
    
    D --> E{¿Rol del usuario?}
    
    E -->|Admin| F[Admin: Acceso Total]
    E -->|Geologist| G[Geólogo: Acceso Limitado]
    E -->|Viewer| H[Visualizador: Solo Lectura]
    
    F --> F1[✅ Crear/Editar Proyectos]
    F --> F2[✅ Gestionar Usuarios]
    F --> F3[✅ Crear/Editar Pozos]
    F --> F4[✅ Capturar Datos]
    F --> F5[✅ Editar Todas las Mediciones]
    F --> F6[✅ Eliminar Datos]
    F --> F7[✅ Exportar Todo]
    
    G --> G1[❌ Crear/Editar Proyectos]
    G --> G2[❌ Gestionar Usuarios]
    G --> G3[❌ Crear/Editar Pozos]
    G --> G4[✅ Capturar Datos]
    G --> G5[✅ Editar Sus Propias Mediciones]
    G --> G6[❌ Eliminar Datos]
    G --> G7[✅ Exportar Sus Datos]
    G --> G8[👁️ Ver Datos de Otros lectura]
    
    H --> H1[❌ Crear/Editar Proyectos]
    H --> H2[❌ Gestionar Usuarios]
    H --> H3[❌ Crear/Editar Pozos]
    H --> H4[❌ Capturar Datos]
    H --> H5[❌ Editar Mediciones]
    H --> H6[❌ Eliminar Datos]
    H --> H7[✅ Exportar Datos]
    H --> H8[👁️ Ver Todo lectura]
    H --> H9[✅ Visualización 3D]
    
    F7 --> I[Permitir acción]
    G7 --> I
    H7 --> I
    
    G1 --> J[Denegar acción: 403 Forbidden]
    H4 --> J
    
    style F fill:#4CAF50
    style G fill:#2196F3
    style H fill:#9E9E9E
    style I fill:#4CAF50
    style J fill:#F44336
```

---

## 8. Flujo de Visualización 3D en Hub

```mermaid
flowchart TD
    A[Usuario accede al Hub] --> B[Login]
    B --> C[Dashboard Principal]
    C --> D[Seleccionar Proyecto]
    
    D --> E[Vista del Proyecto]
    E --> E1[📊 Estadísticas: 2 pozos, 200 estructuras]
    E1 --> E2[📋 Lista de Pozos]
    
    E2 --> F[Seleccionar DDH-AOC-001]
    F --> G[Información del Pozo]
    
    G --> G1[📍 Ubicación: UTM, Elevación]
    G1 --> G2[📐 Orientación: Az 60°, Dip -60°]
    G2 --> G3[📏 Profundidad: 500m]
    G3 --> G4[📅 2 sesiones de medición]
    G4 --> G5[🪨 100 estructuras capturadas]
    
    G5 --> H[Click en Vista 3D]
    
    H --> I[Cargar datos desde API]
    I --> J[GET /api/v1/drillholes/id/structures]
    J --> K[Recibir 100 estructuras con coordenadas]
    
    K --> L[Inicializar Three.js]
    L --> M[Crear escena 3D]
    
    M --> N[Renderizar elementos]
    N --> N1[🟢 Línea verde: Trayectoria del pozo]
    N1 --> N2[🔴 Discos rojos: Fracturas 25]
    N2 --> N3[🟢 Discos verdes: Vetas 25]
    N3 --> N4[🟠 Discos naranjas: Fallas 25]
    N4 --> N5[🟣 Discos morados: Contactos 25]
    N5 --> N6[📏 Ejes coordenados X, Y, Z]
    N6 --> N7[📐 Grilla de referencia]
    N7 --> N8[⚫ Esferas: Ubicación estructuras]
    
    N8 --> O[Mostrar Vista 3D Interactiva]
    
    O --> P{Usuario interactúa}
    
    P -->|Rotar| Q[Click + Arrastrar]
    Q --> R[Rotar cámara alrededor del modelo]
    R --> O
    
    P -->|Zoom| S[Scroll de Mouse]
    S --> T[Acercar/Alejar cámara]
    T --> O
    
    P -->|Panear| U[Click Derecho + Arrastrar]
    U --> V[Mover posición de la cámara]
    V --> O
    
    P -->|Click en estructura| W[Seleccionar Estructura]
    W --> X[Mostrar Panel de Detalles]
    
    X --> X1[Tipo: Fractura]
    X1 --> X2[Profundidad: 515 cm]
    X2 --> X3[Ángulos: α=85°, β=4°, Az=121°]
    X3 --> X4[Orientación: Dip 87°, DipDir 69°]
    X4 --> X5[Coordenadas P1, P2, P3]
    X5 --> X6[UTM: 350002E, 6500001N]
    X6 --> X7[Fecha: 02/10/2025 10:35]
    X7 --> X8[Capturado por: geo1@empresa.com]
    X8 --> X9[Custom: Relleno=Calcita]
    
    X9 --> O
    
    P -->|Exportar| Y[Click Exportar CSV]
    Y --> Z[GET /api/v1/drillholes/id/export/csv]
    Z --> AA[Generar CSV con 100 estructuras]
    AA --> AB[Descargar: GeoStXR_DDH-AOC-001_20251002.csv]
    
    style O fill:#2196F3
    style X fill:#4CAF50
    style AB fill:#FF9800
```

---

## 9. Arquitectura de Base de Datos

```mermaid
erDiagram
    USER ||--o{ PROJECT_USER : "participa en"
    USER ||--o{ SESSION : "captura"
    
    PROJECT ||--o{ PROJECT_USER : "tiene"
    PROJECT ||--o{ DRILL_HOLE : "contiene"
    
    DRILL_HOLE ||--o{ SESSION : "tiene"
    
    SESSION ||--o{ STRUCTURE : "contiene"
    SESSION ||--o{ PHOTO : "tiene"
    
    PHOTO ||--o{ STRUCTURE : "referencia"
    
    USER {
        uuid id PK
        string email UK
        string password
        string name
        string organization
        datetime created_at
        datetime last_sync
    }
    
    PROJECT {
        uuid id PK
        string name
        string client
        string location
        string organization_id
        string created_by FK
        json config
        datetime created_at
        datetime updated_at
    }
    
    PROJECT_USER {
        uuid id PK
        uuid user_id FK
        uuid project_id FK
        string role
        datetime added_at
        string added_by FK
    }
    
    DRILL_HOLE {
        uuid id PK
        uuid project_id FK
        string name
        json collar
        json orientation
        float total_depth
        float diameter
        date drilled_date
        string created_by FK
        datetime created_at
        datetime updated_at
    }
    
    SESSION {
        uuid id PK
        uuid drill_hole_id FK
        uuid captured_by FK
        datetime captured_at
        json device_info
        json depth_range
        json boh_angles
        string sync_status
        datetime synced_at
    }
    
    STRUCTURE {
        uuid id PK
        uuid session_id FK
        int sequence_number
        string structure_type
        float depth
        float alpha
        float beta
        float azimuth
        float dip_real
        float dip_direction
        float utm_east
        float utm_north
        float elevation
        json points
        string boh_reference
        datetime captured_at
        uuid photo_id FK
        json custom_data
    }
    
    PHOTO {
        uuid id PK
        uuid session_id FK
        string url
        string thumbnail_url
        datetime captured_at
        json depth_range
        boolean is_composite
        json source_photos
    }
```

---

## 10. Timeline de Implementación

```mermaid
gantt
    title Roadmap de Implementación - GeoStXR Sistema Completo
    dateFormat YYYY-MM-DD
    section Fase 1: Backend Core
    Diseño de base de datos          :done, db1, 2025-10-01, 5d
    API de autenticación             :active, api1, 2025-10-06, 7d
    API CRUD proyectos y pozos       :api2, after api1, 10d
    Sistema de roles y permisos      :api3, after api2, 7d
    API de sincronización            :api4, after api3, 10d
    
    section Fase 2: Hub Web
    Refactorizar componentes         :web1, 2025-10-06, 5d
    Sistema de autenticación UI      :web2, after web1, 7d
    Dashboard de proyectos           :web3, after web2, 10d
    Gestión de usuarios              :web4, after web3, 7d
    Visualización 3D mejorada        :web5, after web4, 10d
    
    section Fase 3: App Android
    Diseño de UI/UX                  :and1, 2025-10-20, 10d
    Autenticación y login            :and2, after and1, 7d
    Lista de proyectos y pozos       :and3, after and2, 10d
    Captura de estructuras           :and4, after and3, 15d
    Almacenamiento local SQLite      :and5, 2025-11-10, 10d
    Sincronización básica            :and6, after and5, 10d
    
    section Fase 4: Integración
    Testing de sincronización        :test1, after and6, 7d
    Pruebas de campo                 :test2, after test1, 10d
    Correcciones y optimización      :test3, after test2, 10d
    
    section Fase 5: Producción
    Deploy backend en producción     :prod1, after test3, 3d
    Deploy Hub web                   :prod2, after prod1, 2d
    Release App Android              :prod3, after prod2, 3d
    Capacitación usuarios            :prod4, after prod3, 5d
```

---

Estos diagramas están en formato **Mermaid** y se renderizarán automáticamente en:
- ✅ GitHub
- ✅ GitLab  
- ✅ Visual Studio Code (con extensión)
- ✅ Notion
- ✅ Confluence

¿Quieres que cree más diagramas específicos o mockups de las interfaces? 🎨

