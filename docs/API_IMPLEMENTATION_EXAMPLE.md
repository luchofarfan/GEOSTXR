# Ejemplo de Implementación de API - GeoStXR Hub

## Backend API con Express + TypeScript

### 1. Estructura de Proyecto

```
backend/
├── src/
│   ├── controllers/
│   │   ├── auth.controller.ts
│   │   ├── projects.controller.ts
│   │   ├── drillholes.controller.ts
│   │   ├── sessions.controller.ts
│   │   └── sync.controller.ts
│   ├── middleware/
│   │   ├── auth.middleware.ts
│   │   └── permissions.middleware.ts
│   ├── models/
│   │   ├── User.ts
│   │   ├── Project.ts
│   │   ├── DrillHole.ts
│   │   ├── Session.ts
│   │   └── Structure.ts
│   ├── routes/
│   │   ├── auth.routes.ts
│   │   ├── projects.routes.ts
│   │   ├── drillholes.routes.ts
│   │   └── sync.routes.ts
│   ├── services/
│   │   ├── auth.service.ts
│   │   ├── sync.service.ts
│   │   └── storage.service.ts
│   ├── utils/
│   │   ├── jwt.ts
│   │   └── permissions.ts
│   └── index.ts
├── prisma/
│   └── schema.prisma
└── package.json
```

### 2. Schema de Base de Datos (Prisma)

```prisma
// prisma/schema.prisma

generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

model User {
  id            String    @id @default(uuid())
  email         String    @unique
  password      String
  name          String
  organization  String
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt
  lastSync      DateTime?
  
  projectUsers  ProjectUser[]
  sessions      Session[]
}

model Project {
  id             String    @id @default(uuid())
  name           String
  client         String?
  location       String?
  organizationId String
  createdBy      String
  createdAt      DateTime  @default(now())
  updatedAt      DateTime  @updatedAt
  
  config         Json      // Configuración del proyecto
  
  users          ProjectUser[]
  drillHoles     DrillHole[]
}

model ProjectUser {
  id        String   @id @default(uuid())
  userId    String
  projectId String
  role      String   // 'admin' | 'geologist' | 'viewer'
  addedAt   DateTime @default(now())
  addedBy   String
  
  user      User     @relation(fields: [userId], references: [id])
  project   Project  @relation(fields: [projectId], references: [id])
  
  @@unique([userId, projectId])
}

model DrillHole {
  id          String   @id @default(uuid())
  projectId   String
  name        String
  collar      Json     // { utmEast, utmNorth, elevation, zone }
  orientation Json     // { azimuth, dip }
  totalDepth  Float
  diameter    Float?
  drilledDate DateTime?
  createdBy   String
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  
  project     Project  @relation(fields: [projectId], references: [id])
  sessions    Session[]
}

model Session {
  id           String   @id @default(uuid())
  drillHoleId  String
  capturedBy   String
  capturedAt   DateTime
  deviceInfo   Json     // { model, osVersion, appVersion }
  depthRange   Json     // { start, end }
  bohAngles    Json     // { boh1, boh2 }
  syncStatus   String   @default("synced") // 'pending' | 'synced' | 'conflict'
  syncedAt     DateTime?
  
  drillHole    DrillHole  @relation(fields: [drillHoleId], references: [id])
  user         User       @relation(fields: [capturedBy], references: [id])
  structures   Structure[]
  photos       Photo[]
}

model Structure {
  id              String   @id @default(uuid())
  sessionId       String
  sequenceNumber  Int
  structureType   String
  depth           Float
  alpha           Float
  beta            Float
  azimuth         Float
  dipReal         Float
  dipDirection    Float
  utmEast         Float
  utmNorth        Float
  elevation       Float
  points          Json     // { p1: {x,y,z}, p2: {x,y,z}, p3: {x,y,z} }
  bohReference    String
  capturedAt      DateTime
  photoId         String?
  customData      Json?
  
  session         Session  @relation(fields: [sessionId], references: [id])
  photo           Photo?   @relation(fields: [photoId], references: [id])
}

model Photo {
  id            String   @id @default(uuid())
  sessionId     String
  url           String
  thumbnailUrl  String?
  capturedAt    DateTime
  depthRange    Json     // { start, end }
  isComposite   Boolean  @default(false)
  sourcePhotos  Json?    // Array of photo IDs
  
  session       Session     @relation(fields: [sessionId], references: [id])
  structures    Structure[]
}
```

### 3. Middleware de Autenticación

```typescript
// src/middleware/auth.middleware.ts

import { Request, Response, NextFunction } from 'express'
import jwt from 'jsonwebtoken'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key'

export interface AuthRequest extends Request {
  user?: {
    id: string
    email: string
    organizationId: string
  }
}

export async function authenticate(
  req: AuthRequest,
  res: Response,
  next: NextFunction
) {
  try {
    const authHeader = req.headers.authorization
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'No token provided' })
    }
    
    const token = authHeader.substring(7)
    
    const decoded = jwt.verify(token, JWT_SECRET) as {
      userId: string
      email: string
      organizationId: string
    }
    
    // Verificar que el usuario existe
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId }
    })
    
    if (!user) {
      return res.status(401).json({ error: 'User not found' })
    }
    
    req.user = {
      id: user.id,
      email: user.email,
      organizationId: user.organization
    }
    
    next()
  } catch (error) {
    return res.status(401).json({ error: 'Invalid token' })
  }
}
```

### 4. Middleware de Permisos

```typescript
// src/middleware/permissions.middleware.ts

import { Response, NextFunction } from 'express'
import { AuthRequest } from './auth.middleware'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export function requireRole(...allowedRoles: string[]) {
  return async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const projectId = req.params.projectId || req.params.id
      const userId = req.user!.id
      
      // Obtener rol del usuario en el proyecto
      const projectUser = await prisma.projectUser.findUnique({
        where: {
          userId_projectId: {
            userId,
            projectId
          }
        }
      })
      
      if (!projectUser) {
        return res.status(403).json({ error: 'User not in project' })
      }
      
      if (!allowedRoles.includes(projectUser.role)) {
        return res.status(403).json({ 
          error: 'Insufficient permissions',
          required: allowedRoles,
          current: projectUser.role
        })
      }
      
      // Agregar rol al request para uso posterior
      req.user!.role = projectUser.role
      
      next()
    } catch (error) {
      return res.status(500).json({ error: 'Permission check failed' })
    }
  }
}

// Helper para verificar si el usuario es owner de una sesión
export async function isSessionOwner(
  req: AuthRequest,
  res: Response,
  next: NextFunction
) {
  const sessionId = req.params.id
  const userId = req.user!.id
  
  const session = await prisma.session.findUnique({
    where: { id: sessionId }
  })
  
  if (!session) {
    return res.status(404).json({ error: 'Session not found' })
  }
  
  // Admin o owner pueden editar
  if (session.capturedBy === userId || req.user!.role === 'admin') {
    next()
  } else {
    return res.status(403).json({ error: 'Not session owner' })
  }
}
```

### 5. Controller de Sincronización

```typescript
// src/controllers/sync.controller.ts

import { Response } from 'express'
import { AuthRequest } from '../middleware/auth.middleware'
import { PrismaClient } from '@prisma/client'
import { uploadPhoto } from '../services/storage.service'

const prisma = new PrismaClient()

export async function syncSession(req: AuthRequest, res: Response) {
  try {
    const {
      sessionId,
      drillHoleId,
      projectId,
      capturedAt,
      deviceInfo,
      depthRange,
      bohAngles,
      structures,
      photos
    } = req.body
    
    // Verificar permisos en el proyecto
    const projectUser = await prisma.projectUser.findUnique({
      where: {
        userId_projectId: {
          userId: req.user!.id,
          projectId
        }
      }
    })
    
    if (!projectUser || !['admin', 'geologist'].includes(projectUser.role)) {
      return res.status(403).json({ error: 'Insufficient permissions' })
    }
    
    // Verificar si la sesión ya existe
    let session = await prisma.session.findUnique({
      where: { id: sessionId }
    })
    
    if (session) {
      // Actualizar sesión existente
      session = await prisma.session.update({
        where: { id: sessionId },
        data: {
          deviceInfo,
          depthRange,
          bohAngles,
          syncStatus: 'synced',
          syncedAt: new Date()
        }
      })
    } else {
      // Crear nueva sesión
      session = await prisma.session.create({
        data: {
          id: sessionId,
          drillHoleId,
          capturedBy: req.user!.id,
          capturedAt: new Date(capturedAt),
          deviceInfo,
          depthRange,
          bohAngles,
          syncStatus: 'synced',
          syncedAt: new Date()
        }
      })
    }
    
    // Subir fotos
    const photoIds: Record<string, string> = {}
    if (photos && photos.length > 0) {
      for (const photo of photos) {
        // Subir a S3 o almacenamiento
        const photoUrl = await uploadPhoto(photo.base64, sessionId)
        
        const savedPhoto = await prisma.photo.create({
          data: {
            id: photo.id,
            sessionId,
            url: photoUrl,
            capturedAt: new Date(photo.capturedAt),
            depthRange: photo.depthRange,
            isComposite: photo.isComposite || false
          }
        })
        
        photoIds[photo.id] = savedPhoto.id
      }
    }
    
    // Crear estructuras
    let structureCount = 0
    if (structures && structures.length > 0) {
      for (const structure of structures) {
        await prisma.structure.create({
          data: {
            id: structure.id,
            sessionId,
            sequenceNumber: structureCount++,
            structureType: structure.structureType,
            depth: structure.depth,
            alpha: structure.alpha,
            beta: structure.beta,
            azimuth: structure.azimuth,
            dipReal: structure.dipReal,
            dipDirection: structure.dipDirection,
            utmEast: structure.utmEast,
            utmNorth: structure.utmNorth,
            elevation: structure.elevation,
            points: structure.points,
            bohReference: structure.bohReference,
            capturedAt: new Date(structure.capturedAt),
            photoId: structure.photoId ? photoIds[structure.photoId] : null,
            customData: structure.customData || null
          }
        })
      }
    }
    
    return res.json({
      success: true,
      sessionId: session.id,
      syncedAt: session.syncedAt,
      structuresSynced: structureCount,
      photosSynced: photos?.length || 0
    })
    
  } catch (error) {
    console.error('Sync error:', error)
    return res.status(500).json({ 
      error: 'Sync failed',
      message: error instanceof Error ? error.message : 'Unknown error'
    })
  }
}

export async function checkSyncStatus(req: AuthRequest, res: Response) {
  try {
    const userId = req.user!.id
    
    // Obtener sesiones del usuario que no están sincronizadas
    const pendingSessions = await prisma.session.findMany({
      where: {
        capturedBy: userId,
        syncStatus: 'pending'
      },
      select: {
        id: true,
        capturedAt: true,
        drillHole: {
          select: {
            name: true,
            project: {
              select: {
                name: true
              }
            }
          }
        }
      }
    })
    
    return res.json({
      pendingSessions: pendingSessions.length,
      sessions: pendingSessions
    })
    
  } catch (error) {
    return res.status(500).json({ error: 'Failed to check sync status' })
  }
}
```

### 6. Rutas de Sincronización

```typescript
// src/routes/sync.routes.ts

import express from 'express'
import { authenticate } from '../middleware/auth.middleware'
import { syncSession, checkSyncStatus } from '../controllers/sync.controller'

const router = express.Router()

// Todas las rutas requieren autenticación
router.use(authenticate)

// Sincronizar sesión completa
router.post('/session', syncSession)

// Verificar estado de sincronización
router.get('/status', checkSyncStatus)

export default router
```

### 7. Ejemplo de Cliente (App Android - Kotlin)

```kotlin
// SyncService.kt

class SyncService(
    private val apiClient: ApiClient,
    private val database: AppDatabase,
    private val authManager: AuthManager
) {
    suspend fun syncPendingSessions() {
        // Obtener sesiones pendientes
        val sessions = database.sessionDao().getPendingSessions()
        
        for (session in sessions) {
            try {
                // Preparar datos para enviar
                val structures = database.structureDao().getBySessionId(session.id)
                val photos = database.photoDao().getBySessionId(session.id)
                
                val syncRequest = SyncSessionRequest(
                    sessionId = session.id,
                    drillHoleId = session.drillHoleId,
                    projectId = session.projectId,
                    capturedAt = session.capturedAt,
                    deviceInfo = DeviceInfo(
                        model = Build.MODEL,
                        osVersion = Build.VERSION.RELEASE,
                        appVersion = BuildConfig.VERSION_NAME
                    ),
                    depthRange = session.depthRange,
                    bohAngles = session.bohAngles,
                    structures = structures.map { it.toSyncStructure() },
                    photos = photos.map { it.toSyncPhoto() }
                )
                
                // Enviar al servidor
                val response = apiClient.syncSession(
                    token = authManager.getToken(),
                    request = syncRequest
                )
                
                if (response.success) {
                    // Marcar como sincronizado
                    database.sessionDao().updateSyncStatus(
                        sessionId = session.id,
                        status = SyncStatus.SYNCED,
                        syncedAt = Date()
                    )
                    
                    // Opcional: eliminar fotos locales para liberar espacio
                    // deleteLocalPhotos(session.id)
                }
                
            } catch (e: Exception) {
                Log.e("SyncService", "Failed to sync session ${session.id}", e)
                // Registrar error para reintento
                database.syncErrorDao().insert(
                    SyncError(
                        sessionId = session.id,
                        error = e.message ?: "Unknown error",
                        timestamp = Date(),
                        retryCount = 0
                    )
                )
            }
        }
    }
    
    suspend fun autoSync() {
        if (NetworkUtils.isConnected() && authManager.isLoggedIn()) {
            syncPendingSessions()
        }
    }
}

// WorkManager para sincronización en background
class SyncWorker(
    context: Context,
    params: WorkerParameters
) : CoroutineWorker(context, params) {
    
    override suspend fun doWork(): Result {
        val syncService = (applicationContext as App).syncService
        
        return try {
            syncService.autoSync()
            Result.success()
        } catch (e: Exception) {
            Result.retry()
        }
    }
}

// Programar sincronización periódica
fun scheduleSyncWork(context: Context) {
    val constraints = Constraints.Builder()
        .setRequiredNetworkType(NetworkType.CONNECTED)
        .build()
    
    val syncRequest = PeriodicWorkRequestBuilder<SyncWorker>(
        repeatInterval = 1,
        repeatIntervalTimeUnit = TimeUnit.HOURS
    )
        .setConstraints(constraints)
        .build()
    
    WorkManager.getInstance(context)
        .enqueueUniquePeriodicWork(
            "sync_work",
            ExistingPeriodicWorkPolicy.KEEP,
            syncRequest
        )
}
```

### 8. Variables de Entorno

```env
# .env

# Database
DATABASE_URL="postgresql://user:password@localhost:5432/geostxr"

# JWT
JWT_SECRET="your-super-secret-jwt-key-change-in-production"
JWT_EXPIRATION="24h"

# AWS S3 (para almacenamiento de fotos)
AWS_ACCESS_KEY_ID="your-access-key"
AWS_SECRET_ACCESS_KEY="your-secret-key"
AWS_REGION="us-east-1"
AWS_S3_BUCKET="geostxr-photos"

# Server
PORT=3001
NODE_ENV="development"

# CORS
ALLOWED_ORIGINS="http://localhost:3000,https://geostxr-hub.com"
```

### 9. Iniciar el Servidor

```typescript
// src/index.ts

import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import dotenv from 'dotenv'

import authRoutes from './routes/auth.routes'
import projectRoutes from './routes/projects.routes'
import drillHoleRoutes from './routes/drillholes.routes'
import syncRoutes from './routes/sync.routes'

dotenv.config()

const app = express()
const PORT = process.env.PORT || 3001

// Middleware
app.use(helmet())
app.use(cors({
  origin: process.env.ALLOWED_ORIGINS?.split(',') || 'http://localhost:3000',
  credentials: true
}))
app.use(express.json({ limit: '50mb' })) // Para fotos base64
app.use(express.urlencoded({ extended: true, limit: '50mb' }))

// Routes
app.use('/api/v1/auth', authRoutes)
app.use('/api/v1/projects', projectRoutes)
app.use('/api/v1/drillholes', drillHoleRoutes)
app.use('/api/v1/sync', syncRoutes)

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date() })
})

// Error handler
app.use((err: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error(err.stack)
  res.status(500).json({ error: 'Internal server error' })
})

app.listen(PORT, () => {
  console.log(`🚀 GeoStXR API running on http://localhost:${PORT}`)
})
```

---

## Comandos para Iniciar

```bash
# Instalar dependencias
npm install express prisma @prisma/client jsonwebtoken bcrypt cors helmet dotenv

npm install -D @types/express @types/jsonwebtoken @types/bcrypt @types/cors typescript ts-node

# Inicializar Prisma
npx prisma init

# Crear base de datos y tablas
npx prisma migrate dev --name init

# Generar cliente Prisma
npx prisma generate

# Iniciar servidor en desarrollo
npm run dev
```

Este es un ejemplo completo de implementación. ¿Quieres que continúe con alguna parte específica o que agregue más funcionalidad?

