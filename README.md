# UrbanInspect · Inspección de Infraestructura Urbana

Aplicación móvil desarrollada para el **Municipio del Distrito Metropolitano de Quito** orientada al registro, consulta y seguimiento en campo de problemas de infraestructura urbana (luminarias dañadas, baches, señalización deteriorada, alcantarillas obstruidas y daños en parques).

---

## 🚀 Cómo Ejecutar la Aplicación

### 1. Requisitos Previos
- Node.js instalado (versión 18 o superior).
- Conexión a Internet para la consulta del clima y dependencias.

### 2. Instalación y Ejecución
1. Clona este repositorio o entra a la carpeta del proyecto.
2. Instala las dependencias:
   ```bash
   npm install
   ```
3. Inicia la aplicación en modo desarrollo:
   ```bash
   npm start
   ```
   Se abrirá en tu navegador en `http://localhost:4200` (o usa la consola para ver el enlace).

---

## 🌐 Servicio de Oficina (MockAPI)

La aplicación está conectada directamente al recurso remoto de MockAPI:
- **Endpoint:** `https://6ae17514be3bc8fead9884df.mockapi.io/api/v1/incidencias`
- Configurado en `src/environments/environment.ts` y `src/environments/environment.prod.ts`.
- Todas las consultas, paginación remota incremental, registros y actualizaciones de estado operan 100% en vivo contra este servicio REST.

---

## 📱 Generación del APK para Android

Para generar la aplicación instalable en Android con Capacitor:

1. Agrega la plataforma Android (si no está agregada):
   ```bash
   npm install @capacitor/android
   npx cap add android
   ```
2. Compila el proyecto web y sincroniza:
   ```bash
   npm run build
   npx cap sync android
   ```
3. Abre el proyecto en Android Studio:
   ```bash
   npx cap open android
   ```
4. En Android Studio, ve a **Build > Build Bundle(s) / APK(s) > Build APK(s)** para generar el archivo `.apk` instalable.

---

## 📦 Dependencias Utilizadas y su Justificación

Cada dependencia fue seleccionada estrictamente para responder a un requisito de la rúbrica:

- **`@ionic/angular` & `ionicons`**: Proporciona los componentes de interfaz móvil (tarjetas, botones táctiles, scroll infinito, badges y diálogos) diseñados para trabajo rápido en campo.
- **`@capacitor/core` & `@capacitor/cli`**: Núcleo para ejecutar la aplicación de forma nativa en teléfonos Android.
- **`@capacitor/preferences`** *(R1 y R8)*: Guarda información persistente dentro del teléfono. Se usa para mantener las incidencias marcadas para seguimiento local (sin enviarlas al servidor de oficina) y para recuperar borradores de registros incompletos tras un reinicio.
- **`@capacitor/camera`** *(R6)*: Permite capturar fotos de evidencia directamente desde la cámara del teléfono o seleccionarlas de la galería, previsualizarlas y guardarlas en formato accesible desde cualquier equipo.
- **`@capacitor/geolocation`** *(R7)*: Obtiene las coordenadas GPS (latitud y longitud) en tiempo real para georreferenciar las incidencias y alimentar la consulta meteorológica.
- **`Open-Meteo API`** *(R4)*: Servicio meteorológico en tiempo real, independiente y gratuito. Permite consultar temperatura, precipitación acumulada de la última hora (mm) y condición climática según las coordenadas, sin necesidad de guardar claves secretas en el código.

---

## 💡 Breve Justificación de Decisiones Técnicas

- **Paginación Remota Incremental (R3):** Se utilizó `ion-infinite-scroll` solicitando páginas pequeñas (`?page=X&limit=5`) al servicio remoto MockAPI. Cuando el servidor ya no tiene más registros, el scroll se desactiva de inmediato para no saturar la red.
- **Persistencia de Fotos (R6):** Las fotos se procesan en formato Base64 Data URL, lo que permite que queden guardadas en el registro y se puedan visualizar en el detalle desde cualquier otro teléfono o computadora, sin depender de rutas temporales del archivo local.
- **Ubicación en Baches (R7):** Dado que los baches representan un peligro vial directo, se exige de forma obligatoria registrar sus coordenadas. Si el usuario no tiene GPS o deniega el permiso, la app le permite ingresar las coordenadas numéricas válidas manualmente.
- **Reglas de Estado (R9):** Se implementó una máquina de estados estricta: `Pendiente -> En Proceso -> Resuelta`. Una incidencia en estado *Resuelta* queda blindada y no puede regresar a estados anteriores, exigiendo una observación de trabajo antes de cerrarse.
- **Diseño Orientado al Inspector (R10):** Interfaz limpia mediante navegación por pestañas (*Inicio / Indicadores*, *Incidencias*, *Registrar*, *Seguimiento*), con colores de contraste alto para visibilidad bajo la luz del día y botones amplios para uso con una sola mano.

---

## 🧪 Guía Rápida para la Defensa Oral

1. **Seguimiento Local (R1):** Abre una incidencia, toca el ícono de marcador. Cierra la app o recárgala: ve a la pestaña "Seguimiento" y comprueba que sigue ahí. Al desmarcarla, desaparece de la sección sin cambiar la API remota.
2. **Consulta Meteorológica y Lluvia > 5 mm (R4):** En el formulario, haz clic en "Consultar Clima". Se conectará en tiempo real con Open-Meteo. Si la lluvia supera los 5 mm, saldrá una advertencia destacada en amarillo/rojo sin bloquear el registro. Si se simula un fallo de red, muestra el mensaje y permite continuar.
3. **Prioridad Alta sin Foto (R5/R6):** Selecciona prioridad "Alta" en el formulario e intenta guardar sin foto. La aplicación te impedirá guardar y te mostrará el aviso explicativo.
4. **Bache con Coordenadas Manuales (R7):** Selecciona tipo "Bache". Intenta guardar sin coordenadas (no lo permitirá). Ingresa coordenadas válidas manualmente (ej: Lat: `-0.1807`, Lng: `-78.4678`), pulsa "Consultar Clima" y guarda con éxito.
5. **Recuperación de Borrador (R8):** Escribe algunos campos en el formulario, sal o recarga la página. Al volver a abrir, te saldrá el diálogo "¿Deseas continuar o descartar el registro incompleto?". Al elegir Continuar, tus datos volverán intactos.
6. **Restricción de Estado Resuelta (R9):** Abre una incidencia en el detalle. Pásala a "En Proceso" o "Resuelta". Al resolverla te exigirá una observación obligatoria. Una vez resuelta, intenta devolverla a pendiente: el botón estará bloqueado y explicará la restricción.
