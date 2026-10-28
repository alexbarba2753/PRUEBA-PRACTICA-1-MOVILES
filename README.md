# UrbanInspect · Inspección de Infraestructura Urbana

Aplicación móvil desarrollada con **Ionic, Angular standalone y Capacitor** para el **Municipio del Distrito Metropolitano de Quito (DMQ)**. Permite a los inspectores registrar, consultar y gestionar en campo incidencias de infraestructura urbana (luminarias dañadas, baches, señalización deteriorada, alcantarillas obstruidas y daños en parques).

---

## 🚀 Instalación y Ejecución

### 1. Requisitos
- Node.js (versión 18 o superior).
- Conexión a Internet (MockAPI y API meteorológica en vivo).

### 2. Ejecutar en Navegador
```bash
# 1. Instalar dependencias
npm install

# 2. Iniciar servidor de desarrollo
npm start
```
La aplicación se abrirá en `http://localhost:4200`.

---

## 📱 Compilación para Android (APK)

```bash
# 1. Compilar aplicación Angular
npm run build

# 2. Sincronizar con el proyecto Android nativo
npx cap sync android

# 3. Abrir en Android Studio
npx cap open android
```
En Android Studio: **Build > Build Bundle(s) / APK(s) > Build APK(s)** para generar el `.apk`.

---

## 🌐 Servicios Externos

1. **Servicio de Oficina (MockAPI):**
   - Recurso REST: `https://6ae17514be3bc8fead9884df.mockapi.io/api/v1/incidencias`
   - Configurado en `src/environments/environment.ts`.
   - Maneja consulta paginada remota (`?page=X&limit=5`), altas (`POST`) y actualizaciones de estado (`PUT`).

2. **Servicio Meteorológico (Open-Meteo):**
   - Endpoint: `https://api.open-meteo.com/v1/forecast`
   - Servicio meteorológico real, público e independiente. Consulta temperatura, precipitación acumulada de la última hora (mm) y condición atmosférica a partir de las coordenadas del lugar.

---

## 📦 Dependencias y Justificación Técnica

- **`@ionic/angular` & `ionicons`:** Componentes de interfaz móvil (tarjetas, botones táctiles, scroll infinito, badges y modales) adaptados para trabajo ágil en campo.
- **`@capacitor/core` & `@capacitor/android`:** Runtimes para empaquetado nativo en Android.
- **`@capacitor/preferences`:** Almacenamiento local persistente en el dispositivo para el seguimiento de incidencias (R1) y recuperación de borradores incompletos (R8).
- **`@capacitor/camera`:** Captura y selección de fotos de evidencia en campo (R6).
- **`@capacitor/geolocation`:** Georreferenciación por GPS en tiempo real para coordenadas y consulta del clima (R7).
- **`Angular Standalone & Signals`:** Arquitectura reactiva sin zonas (`zoneless`) para un rendimiento ligero y detección de cambios limpia.
