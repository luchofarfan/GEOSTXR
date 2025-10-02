# Reporte CSV Completo - GeoStXR

## 📋 METADATA DEL REPORTE

```
REPORTE DE MEDICIÓN ESTRUCTURAL - GeoStXR
Fecha: 02/10/2025, 18:45:30
```

---

## 🎯 INFORMACIÓN DEL SONDAJE

| Parámetro | Valor | Unidad |
|-----------|-------|--------|
| **Nombre** | DDH-001 | - |
| **Azimut** | 45.00 | grados (desde Norte) |
| **Inclinación** | -65.00 | grados (hacia abajo) |
| **UTM Este** | 345,678.50 | metros |
| **UTM Norte** | 8,765,432.10 | metros |
| **Cota/Elevación** | 2,450.75 | m.s.n.m. |

---

## 📏 RESUMEN DE MEDICIÓN

| Parámetro | Valor |
|-----------|-------|
| **Profundidad Manual** | 16.00 cm (0.16 m) |
| **AC (Ángulo de Calce)** | 7.50° |
| **BOH1** | 90.0° |
| **BOH2** | 90.0° |
| **Total de Planos** | 2 |

---

## 📊 DATOS DE PLANOS ESTRUCTURALES

### PLANO 1 - Veta

| Categoría | Parámetro | Valor | Unidad |
|-----------|-----------|-------|--------|
| **BÁSICO** | Número de Plano | 1 | - |
| | Tipo de Estructura | Veta | - |
| | Profundidad | 16.00 cm / 0.16 m | cm / m |
| | Tipo de Profundidad | Manual | - |
| | BOH Referencia | BOH1 | - |
| **ÁNGULOS LOCALES** | Alpha (α) | 30.00 | grados |
| (Cilindro) | Beta (β) | 15.00 | grados |
| | Azimuth Local | 105.00 | grados |
| **ORIENTACIÓN REAL** | **Dip Real** | **75.60** | **grados** |
| (Global) | **Dip Direction** | **195.09** | **grados (SSW)** |
| | Notación Geológica | 75.6° / 195° | - |
| **COORDENADAS UTM** | **Este (E)** | **345,678.55** | **metros** |
| (Global) | **Norte (N)** | **8,765,432.15** | **metros** |
| | **Elevación (Z)** | **2,450.60** | **m.s.n.m.** |
| **PUNTOS 3D** | P1 (X, Y, Z) | -2.6836, 1.6822, 14.6413 | cm |
| (Cilindro) | P2 (X, Y, Z) | -0.5745, 3.1184, 14.8241 | cm |
| | P3 (X, Y, Z) | 2.3582, 2.1072, 14.8742 | cm |

### PLANO 2 - Diaclasa

| Categoría | Parámetro | Valor | Unidad |
|-----------|-----------|-------|--------|
| **BÁSICO** | Número de Plano | 2 | - |
| | Tipo de Estructura | Diaclasa | - |
| | Profundidad | 20.00 cm / 0.20 m | cm / m |
| | Tipo de Profundidad | Automático | - |
| | BOH Referencia | BOH2 | - |
| **ÁNGULOS LOCALES** | Alpha (α) | 90.00 | grados |
| (Cilindro) | Beta (β) | 40.00 | grados |
| | Azimuth Local | 130.00 | grados |
| **ORIENTACIÓN REAL** | **Dip Real** | **54.37** | **grados** |
| (Global) | **Dip Direction** | **334.53** | **grados (NNW)** |
| | Notación Geológica | 54.4° / 335° | - |
| **COORDENADAS UTM** | **Este (E)** | **345,678.56** | **metros** |
| (Global) | **Norte (N)** | **8,765,432.16** | **metros** |
| | **Elevación (Z)** | **2,450.57** | **m.s.n.m.** |
| **PUNTOS 3D** | P1 (X, Y, Z) | -1.9284, 2.2981, 18.3421 | cm |
| (Cilindro) | P2 (X, Y, Z) | 0.8746, 2.9876, 20.1234 | cm |
| | P3 (X, Y, Z) | 2.7891, 1.5432, 21.9876 | cm |

---

## 📄 CSV COMPLETO (Headers + 2 Filas de Datos)

### Headers:
```
Plano,Tipo_Estructura,Profundidad_cm,Profundidad_m,Tipo_Prof,Alpha_grados,Beta_grados,Azimuth_grados,BOH_Referencia,Dip_Real_grados,Dip_Direction_grados,UTM_Este_m,UTM_Norte_m,Elevacion_m,P1_X,P1_Y,P1_Z,P2_X,P2_Y,P2_Z,P3_X,P3_Y,P3_Z
```

### Fila 1 (Plano 1 - Veta):
```
1,Veta,16.00,0.16,manual,30.00,15.00,105.00,BOH1,75.60,195.09,345678.55,8765432.15,2450.60,-2.6836,1.6822,14.6413,-0.5745,3.1184,14.8241,2.3582,2.1072,14.8742
```

### Fila 2 (Plano 2 - Diaclasa):
```
2,Diaclasa,20.00,0.20,automático,90.00,40.00,130.00,BOH2,54.37,334.53,345678.56,8765432.16,2450.57,-1.9284,2.2981,18.3421,0.8746,2.9876,20.1234,2.7891,1.5432,21.9876
```

---

## ✨ **Nuevas Columnas Añadidas:**

### **Información del Collar (Header del CSV):**
- ✅ `# Sondaje: DDH-001`
- ✅ `# Azimut: 45.00°`
- ✅ `# Inclinación: -65.00°`
- ✅ `# UTM Este: 345678.50 m`
- ✅ `# UTM Norte: 8765432.10 m`
- ✅ `# Cota: 2450.75 m.s.n.m.`

### **Orientación Real (por cada plano):**
- ✅ `Dip_Real_grados` - Buzamiento real del plano
- ✅ `Dip_Direction_grados` - Dirección de buzamiento

### **Coordenadas Espaciales (por cada plano):**
- ✅ `UTM_Este_m` - Coordenada Este en metros
- ✅ `UTM_Norte_m` - Coordenada Norte en metros
- ✅ `Elevacion_m` - Cota en m.s.n.m.

---

## 🎯 **Comparación: Antes vs Ahora**

### **CSV ANTERIOR** (el que tienes abierto):
```csv
# Sin info del collar
# Sin coordenadas del sondaje

Plano,Profundidad_cm,Profundidad_m,Tipo,Alpha_grados,Beta_grados,Azimuth_grados,BOH_Referencia,P1_X,P1_Y,P1_Z,...
1,15.00,0.15,manual,85.48,4.21,120.81,BOH2,...
```

❌ Falta: Collar, Dip Real, Dip Direction, Coordenadas UTM

### **CSV NUEVO** (branch actual):
```csv
# === INFORMACIÓN DEL SONDAJE ===
# Sondaje: DDH-001
# Azimut: 45.00°
# Inclinación: -65.00°
# UTM Este: 345678.50 m
# UTM Norte: 8765432.10 m
# Cota: 2450.75 m.s.n.m.

Plano,Tipo_Estructura,Prof_cm,Prof_m,Tipo_Prof,Alpha,Beta,Azimuth,BOH,Dip_Real,Dip_Direction,UTM_Este,UTM_Norte,Elevacion,P1_X,...
1,Veta,16.00,0.16,manual,30.00,15.00,105.00,BOH1,75.60,195.09,345678.55,8765432.15,2450.60,...
2,Diaclasa,20.00,0.20,auto,90.00,40.00,130.00,BOH2,54.37,334.53,345678.56,8765432.16,2450.57,...
```

✅ Incluye: TODO - Collar, Dip Real, Dip Direction, Coordenadas UTM completas

---

## 🚀 **Cómo Generar el CSV Completo**

### **Método 1: Desde la Aplicación (cuando hagas merge)**
1. Abre `http://localhost:3000`
2. Configura "🎯 Info del Sondaje" (collar, azimut, inclinación)
3. Captura escena y selecciona puntos
4. Finaliza captura
5. El CSV descargado tendrá TODAS las columnas

### **Método 2: Ver Ejemplo Ahora**
El archivo `examples/reporte-completo-ejemplo.csv` tiene el formato completo.

---

**📊 El CSV completo ahora incluye 22 columnas (antes tenía solo 17):**
- Información del collar (en headers)
- Dip Real y Dip Direction por cada plano
- Coordenadas UTM espaciales por cada plano

🎯 **¿Quieres que te muestre el CSV en Excel o que abramos la página de validación para verlo visualmente?**
