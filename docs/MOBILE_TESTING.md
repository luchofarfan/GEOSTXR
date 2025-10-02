# 📱 Probar GeoStXR en Dispositivos Móviles (Android/iOS)

## 🎯 Resumen

GeoStXR es una PWA (Progressive Web App) que funciona en navegadores móviles. Esta guía explica cómo probarla en Android.

---

## 📋 OPCIÓN 1: Red Local (Recomendado para Testing)

### **Requisitos:**
- ✅ PC y Android en la **misma red WiFi**
- ✅ Servidor de desarrollo corriendo
- ✅ Firewall configurado

### **Paso 1: Obtener IP de tu PC**

Tu IP local actual: **192.168.1.158**

### **Paso 2: Reiniciar servidor para red local**

```bash
# Detener servidor actual
Ctrl + C (o matar proceso)

# Iniciar servidor en red
npm run dev:network
```

El servidor ahora escuchará en:
- `http://localhost:3000` (local)
- `http://192.168.1.158:3000` (red)

### **Paso 3: Configurar Firewall de Windows**

```powershell
# Opción A: Agregar regla para puerto 3000 (PowerShell Admin)
New-NetFirewallRule -DisplayName "Next.js Dev Server" -Direction Inbound -LocalPort 3000 -Protocol TCP -Action Allow

# Opción B: Permitir manualmente
1. Windows Security → Firewall
2. Advanced Settings
3. Inbound Rules → New Rule
4. Port → TCP → 3000
5. Allow connection
```

### **Paso 4: Conectar desde Android**

1. **Abre Chrome** en tu Android
2. **Navega a**: `http://192.168.1.158:3000`
3. **Acepta permisos** de cámara cuando se soliciten
4. **¡Listo!** Ya puedes usar GeoStXR

---

## 🌐 OPCIÓN 2: Túnel con ngrok (Acceso desde Internet)

### **Instalación:**
```bash
# Descargar ngrok
https://ngrok.com/download

# O con npm
npm install -g ngrok
```

### **Uso:**
```bash
# Iniciar servidor Next.js
npm run dev

# En otra terminal, crear túnel
ngrok http 3000
```

**Resultado:**
```
Forwarding: https://xxxx-xxxx-xxxx.ngrok.io -> http://localhost:3000
```

**Desde Android:**
- Abre Chrome
- Navega a la URL de ngrok
- ¡Funciona desde cualquier lugar con internet!

**⚠️ Nota:** La versión gratuita de ngrok expira cada 2 horas.

---

## ☁️ OPCIÓN 3: Deploy en Vercel (Producción)

### **Ventajas:**
- ✅ HTTPS automático
- ✅ Acceso desde cualquier lugar
- ✅ URL permanente
- ✅ Gratis para proyectos personales

### **Pasos:**

#### **1. Instalar Vercel CLI**
```bash
npm install -g vercel
```

#### **2. Login y Deploy**
```bash
vercel login
vercel
```

Sigue las instrucciones en pantalla.

**Resultado:**
```
✅ Deployed to: https://geostxr.vercel.app
```

#### **3. Acceder desde Android**
- URL permanente de Vercel
- HTTPS automático (necesario para cámara)
- Performance optimizado

---

## 🔒 Permisos de Cámara en Android

### **Chrome Android:**

1. **Primera vez:**
   - Chrome pedirá permiso de cámara
   - Selecciona "Permitir"

2. **Si no funciona:**
   - Settings → Site Settings → Camera
   - Buscar tu URL
   - Cambiar a "Allow"

3. **PWA Instalada:**
   - Menú (⋮) → "Add to Home Screen"
   - Se comporta como app nativa
   - Icono en el launcher

### **Requisitos HTTPS:**

⚠️ **Importante:** La API de cámara requiere HTTPS (excepto localhost)

**Soluciones:**
- ✅ ngrok: Proporciona HTTPS automático
- ✅ Vercel: HTTPS por defecto
- ⚠️ Red local (IP): Solo HTTP → Puede tener restricciones

---

## 📊 Características Móviles de GeoStXR

### **✅ Funciona en Móvil:**
- Cámara trasera/frontal
- Touch para seleccionar puntos
- Drag para mover BOH lines
- Pinch to zoom (en algunos paneles)
- Orientación portrait/landscape

### **⚠️ Optimizado para Tablet/Móvil Grande:**
- Paneles flotantes requieren espacio
- Controles táctiles optimizados
- Mejor experiencia en pantallas 7"+

---

## 🧪 Testing Recomendado

### **Test en Android:**

```
1. Acceso básico
   └─> ¿La página carga?
   └─> ¿Los paneles son visibles?

2. Permisos de cámara
   └─> ¿Se solicita permiso?
   └─> ¿El feed de cámara funciona?

3. Interacciones táctiles
   └─> ¿Los botones responden?
   └─> ¿Los paneles son arrastrables?
   └─> ¿Se pueden seleccionar puntos?

4. Detección de cilindro
   └─> ¿Detecta automáticamente?
   └─> ¿Muestra distancia estimada?

5. Captura completa
   └─> ¿Captura foto de escena?
   └─> ¿Selecciona 3 puntos?
   └─> ¿Genera elipse?
   └─> ¿Descarga reporte?
```

---

## 🚀 INSTRUCCIONES RÁPIDAS

### **Para Testing Rápido (Red Local):**

```bash
# 1. En tu PC (terminal):
npm run dev:network

# 2. Verificar que salga:
#    ▲ Next.js 14.2.16
#    - Local:    http://localhost:3000
#    - Network:  http://192.168.1.158:3000

# 3. En Android:
#    Chrome → http://192.168.1.158:3000

# 4. Si no funciona:
#    Desactivar temporalmente firewall de Windows
```

### **Para Testing Remoto (ngrok):**

```bash
# 1. En tu PC:
npm run dev

# 2. En otra terminal:
ngrok http 3000

# 3. Copiar URL:
#    https://xxxx-xxxx.ngrok.io

# 4. En Android:
#    Chrome → [URL de ngrok]
```

---

## 📁 Archivos de Configuración

He actualizado `package.json` con el nuevo script:
```json
"dev:network": "next dev -H 0.0.0.0"
```

---

## ⚠️ Problemas Comunes

### **1. Cámara no funciona:**
- Verificar que la URL sea HTTPS (ngrok/Vercel)
- O que sea `localhost` (excepción de Chrome)
- Verificar permisos en Android Settings

### **2. No se conecta desde Android:**
- Verificar que estén en la misma red WiFi
- Verificar firewall de Windows
- Probar desactivar VPN si está activa

### **3. Performance lento:**
- Three.js puede ser pesado en móviles antiguos
- Reducir calidad de video si es necesario
- Usar ngrok/Vercel para mejor performance

---

**🎯 ¿Quieres que reinicie el servidor en modo red para que pruebes ahora?** 📱
