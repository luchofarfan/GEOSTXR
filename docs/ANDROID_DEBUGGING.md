# 🔍 Debugging en Android - GeoStXR

## 📱 Problemas Comunes y Soluciones

### **Problema: No se ve el feed de cámara ni el cilindro**

---

## 🛠️ SOLUCIÓN 1: Ver Consola en Android

### **Método A: Chrome DevTools Remoto (RECOMENDADO)**

#### **En tu PC:**
1. Abre Chrome
2. Ve a: `chrome://inspect/#devices`
3. Asegúrate de que "Discover USB devices" esté activado

#### **En tu Android:**
1. Conecta el dispositivo por USB a la PC
2. Habilita "Opciones de Desarrollador":
   - Settings → About Phone
   - Toca "Build Number" 7 veces
3. Habilita "USB Debugging":
   - Settings → Developer Options
   - Activa "USB Debugging"
4. Abre Chrome en Android
5. Navega a: `http://192.168.1.158:3000`

#### **De vuelta en PC:**
1. En `chrome://inspect`, verás tu dispositivo
2. Click "inspect" en la página de GeoStXR
3. **¡Verás la consola del dispositivo móvil!**
4. Revisa errores en rojo

### **Método B: Eruda Console (No requiere USB)**

Agrega esto temporalmente al código:

```html
<!-- En app/layout.tsx, dentro de <body> -->
<script src="https://cdn.jsdelivr.net/npm/eruda"></script>
<script>eruda.init();</script>
```

Aparecerá un botón flotante en la esquina → Click para ver consola.

---

## 🔍 DIAGNÓSTICO PASO A PASO

### **1. Verificar Acceso a la Página**

¿La página carga? ¿Ves los paneles de control?
- ✅ SÍ → Continúa
- ❌ NO → Problema de red/firewall

### **2. Verificar Permisos de Cámara**

#### **Chrome Android debe mostrar:**
```
http://192.168.1.158:3000 quiere:
□ Usar tu cámara

[Bloquear] [Permitir]
```

#### **Si NO aparece:**
- Chrome → Settings → Site Settings → Camera
- Busca `192.168.1.158:3000`
- Cambiar a "Ask" o "Allow"
- Recargar página

#### **Si aparece "NotAllowedError":**
- Usuario negó permisos
- Chrome → Settings → Site Settings → Camera
- Resetear permisos y recargar

### **3. Verificar WebGL**

Navega a: `chrome://gpu` en Chrome Android

Busca:
```
WebGL: Hardware accelerated
WebGL2: Hardware accelerated
```

Si dice "Software only" o "Disabled":
- Settings → Chrome → Flags
- Busca `#enable-webgl`
- Activar
- Reiniciar Chrome

### **4. Verificar Errores Específicos**

Conecta Chrome DevTools remoto y busca estos errores:

#### **Error: "getUserMedia is not a function"**
- Navegador no soporta API de cámara
- Actualizar Chrome a última versión

#### **Error: "NotFoundError"**
- No hay cámara disponible
- Probar con otro dispositivo

#### **Error: "NotReadableError"**
- Cámara en uso por otra app
- Cerrar otras apps y recargar

#### **Error: "OverconstrainedError"**
- Restricciones de video muy altas
- Ya tiene fallback en el código

#### **Pantalla negra pero sin error**
- Problema de Three.js/WebGL
- Verificar aceleración de hardware

---

## 🧪 TESTS DIAGNÓSTICOS

### **Test 1: Cámara Básica**

Crea archivo `test-camera.html` y ábrelo en Android:

```html
<!DOCTYPE html>
<html>
<body>
  <video id="video" autoplay playsinline style="width:100%"></video>
  <script>
    navigator.mediaDevices.getUserMedia({ video: true })
      .then(stream => {
        document.getElementById('video').srcObject = stream
        alert('✅ Cámara funciona!')
      })
      .catch(err => alert('❌ Error: ' + err.message))
  </script>
</body>
</html>
```

### **Test 2: WebGL Básico**

Abre en Chrome Android: `https://get.webgl.org/`

Deberías ver un cubo giratorio.

---

## 🔧 SOLUCIONES ESPECÍFICAS

### **Solución 1: Permisos Bloqueados**

```
Chrome → ⋮ (menú)
→ Settings
→ Site Settings
→ Camera
→ Buscar: 192.168.1.158:3000
→ Cambiar a "Allow"
→ Recargar página
```

### **Solución 2: HTTPS Requerido**

Si Chrome bloquea HTTP, usa **ngrok**:

```bash
# En PC:
ngrok http 3000

# Copiar URL HTTPS:
https://xxxx-xxxx.ngrok.io

# En Android:
Navegar a esa URL HTTPS
```

### **Solución 3: WebGL Deshabilitado**

```
Chrome → chrome://flags
→ Buscar: "webgl"
→ Activar todos los flags de WebGL
→ Reiniciar Chrome
```

### **Solución 4: Performance Bajo**

Reduce calidad de video en el código:

```typescript
// Cambiar:
width: { ideal: 1920 }
height: { ideal: 1080 }

// A:
width: { ideal: 1280 }
height: { ideal: 720 }
```

---

## 📊 Checklist de Debugging

```
□ Página carga (paneles visibles)
□ Chrome DevTools conectado (PC)
□ Consola sin errores rojos
□ Permiso de cámara solicitado
□ Permiso de cámara aceptado
□ Video feed aparece
□ WebGL soportado (chrome://gpu)
□ Cilindro Three.js renderiza
□ Interacciones táctiles funcionan
```

---

## 💡 Mensajes de Error Mejorados

El código ahora incluye:
- ✅ Fallback de cámara trasera → cualquier cámara
- ✅ Alertas descriptivas de errores
- ✅ Logs detallados en consola
- ✅ Verificación de WebGL

---

## 🚀 Siguiente Paso

1. **Recarga** la página en Android
2. **Observa** si aparece alguna alerta de error
3. **Conecta** Chrome DevTools remoto
4. **Revisa** la consola para ver exactamente qué está fallando
5. **Reporta** el error específico

---

**Los logs mejorados te dirán exactamente dónde está el problema.** 🎯

