/**
 * Script para cargar automáticamente los datos de prueba en MockAPI
 * Uso: node scripts/seed-mockapi.mjs <URL_DE_TU_MOCKAPI>
 * Ejemplo: node scripts/seed-mockapi.mjs https://67xxxxxxxxx.mockapi.io/api/v1/incidencias
 */

const SEED_DATA = [
  {
    codigo: 'INC-2026-001',
    tipo: 'Bache',
    descripcion: 'Bache profundo en carril derecho frente a la parada de bus. Riesgo vehicular alto.',
    direccion: 'Av. Amazonas y Av. Naciones Unidas',
    sector: 'Iñaquito',
    fecha: '2026-10-24 08:30',
    estado: 'pendiente',
    prioridad: 'alta',
    coordenadas: { lat: -0.1786, lng: -78.4854 },
    fotografia: 'https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?w=600&auto=format&fit=crop&q=80',
    clima: { temperatura: 16.5, precipitacion: 0.0, condicion: 'Parcialmente nublado' }
  },
  {
    codigo: 'INC-2026-002',
    tipo: 'Luminaria dañada',
    descripcion: 'Poste con luminaria intermitente y cable expuesto en acera peatonal.',
    direccion: 'Calle Guayaquil y Chile',
    sector: 'Centro Histórico',
    fecha: '2026-10-24 10:15',
    estado: 'en_proceso',
    prioridad: 'media',
    coordenadas: { lat: -0.2201, lng: -78.5122 },
    fotografia: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?w=600&auto=format&fit=crop&q=80',
    clima: { temperatura: 18.0, precipitacion: 1.2, condicion: 'Lluvia ligera' }
  },
  {
    codigo: 'INC-2026-003',
    tipo: 'Alcantarilla obstruida',
    descripcion: 'Rejilla colapsada con acumulación de basura y lodo, estancamiento de agua.',
    direccion: 'Av. Rodrigo de Chávez y 5 de Junio',
    sector: 'Villa Flora',
    fecha: '2026-10-24 11:45',
    estado: 'resuelta',
    prioridad: 'alta',
    coordenadas: { lat: -0.2435, lng: -78.5218 },
    fotografia: 'https://images.unsplash.com/photo-1584467735871-8e85353a8413?w=600&auto=format&fit=crop&q=80',
    observacion: 'Cuadrilla de Epmaps realizó desazolve completo y reposición de rejilla.',
    clima: { temperatura: 15.2, precipitacion: 6.8, condicion: 'Lluvia fuerte', advertenciaLluvia: true }
  },
  {
    codigo: 'INC-2026-004',
    tipo: 'Señalización deteriorada',
    descripcion: 'Señal de Pare derribada por colisión en intersección sin semáforo.',
    direccion: 'Calle Foch y Reina Victoria',
    sector: 'La Mariscal',
    fecha: '2026-10-24 14:00',
    estado: 'pendiente',
    prioridad: 'media',
    coordenadas: { lat: -0.2032, lng: -78.4925 },
    fotografia: 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=600&auto=format&fit=crop&q=80',
    clima: { temperatura: 19.1, precipitacion: 0.0, condicion: 'Despejado' }
  },
  {
    codigo: 'INC-2026-005',
    tipo: 'Daño en parque',
    descripcion: 'Juegos infantiles metálicos con óxido y columpios rotos en zona recreativa.',
    direccion: 'Parque La Carolina, acceso Av. Eloy Alfaro',
    sector: 'La Carolina',
    fecha: '2026-10-24 16:30',
    estado: 'en_proceso',
    prioridad: 'baja',
    coordenadas: { lat: -0.1834, lng: -78.4841 },
    fotografia: 'https://images.unsplash.com/photo-1579783902614-a3fb3927b675?w=600&auto=format&fit=crop&q=80',
    clima: { temperatura: 17.0, precipitacion: 0.4, condicion: 'Nublado' }
  },
  {
    codigo: 'INC-2026-006',
    tipo: 'Bache',
    descripcion: 'Hundimiento en calzada asfáltica por fuga previa de agua potable.',
    direccion: 'Av. Ilaló y San Juan de Dios',
    sector: 'Cumbayá',
    fecha: '2026-10-25 09:10',
    estado: 'pendiente',
    prioridad: 'alta',
    coordenadas: { lat: -0.2014, lng: -78.4356 },
    fotografia: 'https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?w=600&auto=format&fit=crop&q=80',
    clima: { temperatura: 20.4, precipitacion: 0.0, condicion: 'Soleado' }
  },
  {
    codigo: 'INC-2026-007',
    tipo: 'Luminaria dañada',
    descripcion: 'Tramo de 3 luminarias apagadas en paso peatonal elevado.',
    direccion: 'Av. Galo Plaza Lasso y Av. del Maestro',
    sector: 'Cotocollao',
    fecha: '2026-10-25 11:20',
    estado: 'pendiente',
    prioridad: 'media',
    coordenadas: { lat: -0.1254, lng: -78.4981 },
    fotografia: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?w=600&auto=format&fit=crop&q=80',
    clima: { temperatura: 16.8, precipitacion: 2.1, condicion: 'Llovizna' }
  },
  {
    codigo: 'INC-2026-008',
    tipo: 'Alcantarilla obstruida',
    descripcion: 'Sumidero tapado ocasiona desbordamiento hacia la vereda en días de lluvia.',
    direccion: 'Av. América y Mercadillo',
    sector: 'La Gasca',
    fecha: '2026-10-25 13:00',
    estado: 'en_proceso',
    prioridad: 'alta',
    coordenadas: { lat: -0.1985, lng: -78.5029 },
    fotografia: 'https://images.unsplash.com/photo-1584467735871-8e85353a8413?w=600&auto=format&fit=crop&q=80',
    clima: { temperatura: 14.5, precipitacion: 5.5, condicion: 'Lluvia moderada', advertenciaLluvia: true }
  },
  {
    codigo: 'INC-2026-009',
    tipo: 'Señalización deteriorada',
    descripcion: 'Paso cebra y delimitadores de carril bici completamente borrados.',
    direccion: 'Av. 6 de Diciembre y Orellana',
    sector: 'La Pradera',
    fecha: '2026-10-25 15:40',
    estado: 'resuelta',
    prioridad: 'baja',
    coordenadas: { lat: -0.1923, lng: -78.4872 },
    fotografia: 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=600&auto=format&fit=crop&q=80',
    observacion: 'Repintado termoplástico completado por cuadrilla nocturna de EPMMOP.',
    clima: { temperatura: 17.5, precipitacion: 0.0, condicion: 'Despejado' }
  },
  {
    codigo: 'INC-2026-010',
    tipo: 'Daño en parque',
    descripcion: 'Árbol con ramas caídas sobre caminería interna tras vendaval.',
    direccion: 'Parque El Ejido, sector sur',
    sector: 'San Blas',
    fecha: '2026-10-25 17:15',
    estado: 'pendiente',
    prioridad: 'media',
    coordenadas: { lat: -0.2112, lng: -78.4988 },
    fotografia: 'https://images.unsplash.com/photo-1579783902614-a3fb3927b675?w=600&auto=format&fit=crop&q=80',
    clima: { temperatura: 15.0, precipitacion: 3.2, condicion: 'Lluvia' }
  },
  {
    codigo: 'INC-2026-011',
    tipo: 'Bache',
    descripcion: 'Grieta amplia y bache en curva pronunciada sin señalética de peligro.',
    direccion: 'Av. Simón Bolívar, curva de Guápulo',
    sector: 'Guápulo',
    fecha: '2026-10-26 08:00',
    estado: 'pendiente',
    prioridad: 'alta',
    coordenadas: { lat: -0.2089, lng: -78.4732 },
    fotografia: 'https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?w=600&auto=format&fit=crop&q=80',
    clima: { temperatura: 13.8, precipitacion: 1.0, condicion: 'Niebla ligera' }
  },
  {
    codigo: 'INC-2026-012',
    tipo: 'Luminaria dañada',
    descripcion: 'Lámpara rota por acto vandálico frente al centro de salud.',
    direccion: 'Calle Carapungo y Panamericana Norte',
    sector: 'Calderón',
    fecha: '2026-10-26 09:40',
    estado: 'en_proceso',
    prioridad: 'media',
    coordenadas: { lat: -0.0987, lng: -78.4234 },
    fotografia: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?w=600&auto=format&fit=crop&q=80',
    clima: { temperatura: 19.0, precipitacion: 0.0, condicion: 'Despejado' }
  },
  {
    codigo: 'INC-2026-013',
    tipo: 'Alcantarilla obstruida',
    descripcion: 'Falta tapa de pozo de revisión en calzada. Señalizado provisionalmente con ramas.',
    direccion: 'Av. Maldonado y Moraspungo',
    sector: 'San Bartolo',
    fecha: '2026-10-26 12:10',
    estado: 'pendiente',
    prioridad: 'alta',
    coordenadas: { lat: -0.2598, lng: -78.5301 },
    fotografia: 'https://images.unsplash.com/photo-1584467735871-8e85353a8413?w=600&auto=format&fit=crop&q=80',
    clima: { temperatura: 16.0, precipitacion: 0.0, condicion: 'Nublado' }
  },
  {
    codigo: 'INC-2026-014',
    tipo: 'Señalización deteriorada',
    descripcion: 'Semáforo intermitente en rojo en ambos sentidos provocando congestión.',
    direccion: 'Av. 10 de Agosto y Mariana de Jesús',
    sector: 'Mariana de Jesús',
    fecha: '2026-10-26 14:50',
    estado: 'resuelta',
    prioridad: 'alta',
    coordenadas: { lat: -0.1902, lng: -78.4912 },
    fotografia: 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=600&auto=format&fit=crop&q=80',
    observacion: 'Técnicos de semaforización reemplazaron tarjeta de control dañada.',
    clima: { temperatura: 18.3, precipitacion: 0.2, condicion: 'Parcialmente nublado' }
  },
  {
    codigo: 'INC-2026-015',
    tipo: 'Daño en parque',
    descripcion: 'Bancas de madera destruidas y cerca perimetral caída.',
    direccion: 'Parque Bicentenario, sector norte',
    sector: 'La Concepción',
    fecha: '2026-10-26 16:45',
    estado: 'pendiente',
    prioridad: 'baja',
    coordenadas: { lat: -0.1534, lng: -78.4893 },
    fotografia: 'https://images.unsplash.com/photo-1579783902614-a3fb3927b675?w=600&auto=format&fit=crop&q=80',
    clima: { temperatura: 17.2, precipitacion: 0.0, condicion: 'Nublado' }
  }
];

const targetUrl = process.argv[2];

if (!targetUrl) {
  console.error('Error: Debes proporcionar la URL de tu MockAPI.');
  console.log('Uso: node scripts/seed-mockapi.mjs https://67xxxx.mockapi.io/api/v1/incidencias');
  process.exit(1);
}

async function seed() {
  console.log(`Iniciando carga de 15 incidencias a: ${targetUrl}...`);
  for (const item of SEED_DATA) {
    try {
      const res = await fetch(targetUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(item)
      });
      if (res.ok) {
        console.log(`[OK] Insertado ${item.codigo}: ${item.tipo} (${item.sector})`);
      } else {
        console.error(`[FAIL] ${item.codigo} HTTP ${res.status}: ${await res.text()}`);
      }
    } catch (err) {
      console.error(`[ERROR] ${item.codigo}:`, err.message);
    }
  }
  console.log('Carga completada.');
}

seed();
