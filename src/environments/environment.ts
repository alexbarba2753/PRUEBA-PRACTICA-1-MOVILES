// Configuración de entorno para desarrollo
export const environment = {
  production: false,
  // =========================================================================
  // PEGA AQUÍ TU URL DE MOCKAPI (recurso 'incidencias'):
  // Ejemplo: 'https://67xxxxxxxxx.mockapi.io/api/v1/incidencias'
  // Si está vacío (''), la app usará automáticamente los datos de prueba locales
  // con paginación simulada para que puedas probar todo inmediatamente.
  // =========================================================================
  mockApiUrl: '',

  // API Meteorológica abierta y gratuita en tiempo real (Open-Meteo)
  weatherApiUrl: 'https://api.open-meteo.com/v1/forecast'
};
