# 🔒 Configurar HTTPS para Android - GeoStXR

## ⚠️ Problema

Chrome Android requiere **HTTPS** para acceder a la cámara (excepto `localhost`).

```
❌ http://192.168.1.158:3000 → BLOQUEADO
✅ https://xxxx.ngrok.io → PERMITIDO
✅ http://localhost:3000 → PERMITIDO (solo en PC)
```

---

## 🚀 SOLUCIÓN RÁPIDA: ngrok (Recomendado)

### **Opción A: Sin instalar (ngrok estático)**

1. **Descarga ngrok:**
   - Ve a: https://ngrok.com/download
   - Descarga "Windows (64-bit)"
   - Descomprime el `.zip`
   - Copia `ngrok.exe` a: `C:\Proyectos\GEOSTXR\`

2. **Ejecuta ngrok:**
   ```powershell
   # En la carpeta del proyecto:
   .\ngrok.exe http 3000
   ```

3. **Obtendrás:**
   ```
   Forwarding: https://xxxx-yyyy-zzzz.ngrok-free.app → http://localhost:3000
   ```

4. **Usa esa URL HTTPS en Android**

### **Opción B: Instalación global (npm)**

```bash
# Instalar globalmente
npm install -g ngrok

# Usar
ngrok http 3000
```

---

## 📱 PASOS COMPLETOS

### **1. En tu PC (Terminal 1):**

```bash
npm run dev
```

Espera a que diga: `✓ Ready in...`

### **2. En tu PC (Terminal 2 - Nueva):**

```bash
# Opción A: Si descargaste ngrok.exe
.\ngrok.exe http 3000

# Opción B: Si instalaste con npm
ngrok http 3000
```

Verás algo como:

```
ngrok                                                                           

Session Status      online                                                      
Account             [tu cuenta]                                                 
Version             3.x.x                                                       
Region              United States (us)                                          
Latency             20ms                                                        
Web Interface       http://127.0.0.1:4040                                       
Forwarding          https://a1b2-c3d4-e5f6.ngrok-free.app -> http://localhost:3000

Connections         ttl     opn     rt1     rt5     p50     p90                 
                    0       0       0.00    0.00    0.00    0.00
```

### **3. Copiar la URL HTTPS:**

```
https://a1b2-c3d4-e5f6.ngrok-free.app
```

### **4. En tu Android:**

1. Abre **Chrome**
2. Navega a la **URL de ngrok** (con https://)
3. Chrome pedirá permiso de cámara
4. **¡Funciona!** ✅

---

## 🎯 Ventajas de ngrok

- ✅ **HTTPS automático** → Cámara funciona
- ✅ **Acceso desde cualquier lugar** (no solo red local)
- ✅ **Fácil de usar** (un solo comando)
- ✅ **Gratis** (con límites razonables)

---

## ⚠️ Limitaciones (Versión Gratuita)

- Túnel expira cada **2 horas** (necesitas reiniciar)
- URL cambia cada vez (no permanente)
- Límite de **40 conexiones/minuto**
- Banner de ngrok en la página (ignorable)

**Para producción:** Usar Vercel (HTTPS permanente y gratis)

---

## 🌐 ALTERNATIVA: Deploy en Vercel

Si quieres una solución permanente:

### **1. Instalar Vercel CLI:**
```bash
npm install -g vercel
```

### **2. Login y Deploy:**
```bash
vercel login
vercel
```

### **3. Resultado:**
```
✅ Deployed to: https://geostxr.vercel.app
```

**Ventajas:**
- ✅ URL permanente
- ✅ HTTPS automático
- ✅ Sin límite de tiempo
- ✅ CDN global (rápido)
- ✅ Gratis para proyectos personales

---

## 🔍 Debugging con ngrok

### **Web Interface de ngrok:**

Abre en tu PC: `http://127.0.0.1:4040`

Verás:
- Todas las peticiones HTTP
- Headers
- Tiempos de respuesta
- Errores

Muy útil para debugging!

---

## 📋 RESUMEN - QUICK START

### **Para probar AHORA en Android:**

```bash
# Paso 1: Descarga ngrok
https://ngrok.com/download

# Paso 2: Extrae a la carpeta del proyecto
# (ya debes tener npm run dev corriendo)

# Paso 3: Ejecuta en nueva terminal
ngrok http 3000

# Paso 4: Copia la URL HTTPS que aparece

# Paso 5: Abre esa URL en Chrome Android
# ¡Listo! La cámara funcionará
```

---

## 🎯 Próximos Pasos

1. ✅ Descargar ngrok
2. ✅ Ejecutar ngrok http 3000
3. ✅ Copiar URL HTTPS
4. ✅ Abrir en Chrome Android
5. ✅ Permitir cámara
6. ✅ ¡Probar GeoStXR!

---

**¿Necesitas ayuda instalando ngrok o prefieres hacer deploy en Vercel directamente?** 🚀

