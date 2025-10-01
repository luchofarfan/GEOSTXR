# Interpretación Correcta de α y β en Sondajes

## 📐 Convenciones Estándares en Geología Estructural

### **Sistema de Coordenadas del Sondaje (Oriented Core)**

En un testigo orientado de sondaje:

```
        ↑ Z (eje del sondaje)
        |
        |
        |__ BOH (Línea de referencia, típicamente hacia arriba del testigo)
       /
      /
    Cylinder surface
```

### **Definiciones Estándares**

#### **α (Alpha) - Core Axis Angle**
- **Definición**: Ángulo entre el plano estructural y el EJE del sondaje
- **Rango**: 0° - 90°
- **Casos Especiales**:
  - α = 0°: Plano perpendicular al sondaje (normal // eje)
  - α = 90°: Plano paralelo al sondaje (normal ⊥ eje)

#### **β (Beta) - Azimuth Angle**
- **Definición**: Ángulo azimutal de la traza del plano en el testigo, medido desde BOH
- **Rango**: 0° - 360°
- **Medición**: En sentido horario mirando hacia abajo del sondaje

### **Vector Normal del Plano**

En coordenadas del cilindro (X hacia derecha, Y hacia adelante, Z a lo largo del sondaje):

```
Opción A (Estándar Geológico):
───────────────────────────────
nx = sin(α) * sin(β)
ny = sin(α) * cos(β) 
nz = cos(α)
```

**Justificación**:
- Para α=0° (perpendicular): n = [0, 0, 1] → normal a lo largo del eje ✓
- Para α=90° (paralelo): n = [sin(β), cos(β), 0] → normal perpendicular al eje ✓

---

## 🔄 Problema Identificado

**En el código actual**, estoy usando:

```typescript
// INCORRECTO
const azimuthInCylinder = bohRad + betaRad
nx = sin(α) * cos(azimuthInCylinder)
ny = sin(α) * sin(azimuthInCylinder)
nz = cos(α)
```

Esto está asumiendo que BOH está en el eje X, pero la convención estándar es:
- BOH está en el eje Y (frente del cilindro)
- β se mide desde BOH en sentido horario

---

## ✅ Corrección Necesaria

### **Fórmula Correcta**:

```typescript
// BOH está a 90° en el cilindro (eje Y positivo)
// β se mide desde BOH en sentido horario
const betaFromY = bohAngle - 90 + beta

nx = sin(α) * sin(betaFromY * π/180)
ny = sin(α) * cos(betaFromY * π/180)
nz = cos(α)
```

### **O más simple**:

Si asumimos que BOH siempre está en el "frente" del cilindro (Y+):

```typescript
nx = sin(α) * sin(β * π/180)
ny = sin(α) * cos(β * π/180)
nz = cos(α)
```

Y luego rotar por el ángulo BOH actual.

---

## 📚 Referencias

### **Fuentes Estándares**:

1. **Priest, S.D. (1993)**
   *"Discontinuity Analysis for Rock Engineering"*
   - Section 2.3: Orientation measurement in boreholes

2. **Brady & Brown (2004)**
   *"Rock Mechanics for Underground Mining"*
   - Chapter 3: Structural data from oriented core

3. **Palmström & Stille (2007)**
   *"Ground Behaviour and Rock Engineering Tools for Underground Excavations"*
   - Appendix B: Core orientation and structural measurements

### **Software de Referencia**:

- **Dips (RocScience)**: Usa α como ángulo desde eje, β como azimut desde línea superior
- **Leapfrog Geo**: Convención similar para import de datos de sondaje
- **Datamine**: Formato estándar de collar/survey/structure

---

## 🎯 Casos de Prueba Revisados

### **Caso 1: Plano Horizontal en Sondaje Vertical**

```
Sondaje: Az=0° (N), Dip=-90° (vertical down)
Medición: α=90° (plano paralelo al eje), β=0° (hacia BOH)

Vector normal (local): [0, 1, 0] (apunta hacia BOH)
Después de rotación: [0, 1, 0] (apunta Norte)

Resultado esperado:
- Dip: 0° (horizontal)
- Dip Direction: 0° (Norte)
```

### **Caso 2: Plano Vertical en Sondaje Vertical**

```
Sondaje: Az=0° (N), Dip=-90° (vertical down)
Medición: α=0° (plano perpendicular al eje), β=45°

Vector normal (local): [0, 0, 1] (a lo largo del sondaje)
Después de rotación: [0, 0, -1] (hacia abajo)

Resultado esperado:
- Dip: 90° (vertical)
- Dip Direction: cualquiera (indeterminado para vertical)
```

---

## 🔧 Acción Requerida

1. **Revisar** función `getPlaneNormalInCylinder`
2. **Corregir** la fórmula del vector normal
3. **Validar** con casos de prueba conocidos
4. **Comparar** con Dips o Leapfrog para verificación

---

*Última actualización: Octubre 2025*

