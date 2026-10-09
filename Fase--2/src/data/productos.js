
export const CATEGORIAS = [
  { valor: 'Herramientas', etiqueta: 'Herramientas' },
  { valor: 'Construccion', etiqueta: 'Construcción' },
  { valor: 'Electricidad', etiqueta: 'Electricidad' },
  { valor: 'Pinturas', etiqueta: 'Pinturas' },
  { valor: 'Plomeria', etiqueta: 'Plomería' },
  { valor: 'Jardineria', etiqueta: 'Jardinería' },
]

export const PRODUCTOS_INICIALES = [
  { id: 1, nombre: 'Taladro Percutor 710W', descripcion: 'Taladro de alta potencia para perforaciones en concreto y madera.', precio: 49990, categoria: 'Herramientas', marca: 'Bauker', stockTienda: 10, stockBodega: 20, imagen: '/imagenes/taladroBAUKER-710.png' },
  { id: 2, nombre: 'Cemento Bío Bío 25kg', descripcion: 'Saco de cemento de alta resistencia para obras y estructuras.', precio: 7800, categoria: 'Construccion', marca: 'Cintac', stockTienda: 50, stockBodega: 200, imagen: '/imagenes/cemento-biobio-25kg.png' },
  { id: 3, nombre: 'Esmalte al Agua 1 Galón', descripcion: 'Pintura lavable de alto cubrimiento para interiores y exteriores.', precio: 24990, categoria: 'Pinturas', marca: 'Kolor', stockTienda: 15, stockBodega: 30, imagen: '/imagenes/esmalte-agua-kolor.png' },
  { id: 4, nombre: 'Sierra Circular 1400W', descripcion: 'Sierra profesional de corte rápido y preciso para madera.', precio: 65990, categoria: 'Herramientas', marca: 'DeWalt', stockTienda: 4, stockBodega: 8, imagen: '/imagenes/cierra-circular-dewalt.png' },
  { id: 5, nombre: 'Cable Eléctrico THHN 100m', descripcion: 'Rollo de cable cobre aislado 2.5mm² para instalaciones residenciales.', precio: 32990, categoria: 'Electricidad', marca: '3M', stockTienda: 12, stockBodega: 25, imagen: '/imagenes/cable-100m.png' },
  { id: 6, nombre: 'Tubo PVC Hidráulico 25mm x 6m', descripcion: 'Tubo de PVC de alta presión para agua potable y grifería.', precio: 4500, categoria: 'Plomeria', marca: 'TIGRE', stockTienda: 40, stockBodega: 100, imagen: '/imagenes/tubo-pvc.png' },
  { id: 7, nombre: 'Cortacésped Eléctrico 1200W', descripcion: 'Cortacésped compacto ideal para jardines medianos y pequeños.', precio: 89990, categoria: 'Jardineria', marca: 'Stihl', stockTienda: 2, stockBodega: 5, imagen: '/imagenes/cortacesped-stilth.png' },
  { id: 8, nombre: 'Esmeril Angular 4.5" 800W', descripcion: 'Herramienta versátil para corte y desbaste de metales.', precio: 38990, categoria: 'Herramientas', marca: 'Bosch', stockTienda: 8, stockBodega: 15, imagen: '/imagenes/esmeril-bosch.png' },
  { id: 9, nombre: 'Set de Brochas Profesional', descripcion: 'Pack de 5 brochas de cerda sintética de varios tamaños.', precio: 8990, categoria: 'Pinturas', marca: 'Tersuave', stockTienda: 25, stockBodega: 50, imagen: '/imagenes/set-brochas.png' },
  { id: 10, nombre: 'Llave Monomando Lavaplatos', descripcion: 'Grifería de acero inoxidable con cuello flexible.', precio: 18990, categoria: 'Plomeria', marca: 'Topex', stockTienda: 6, stockBodega: 12, imagen: '/imagenes/monomando.png' },
  { id: 11, nombre: 'Manguera Reforzada 20m', descripcion: 'Manguera de jardín anti-torsión con acoples rápidos incluidos.', precio: 12990, categoria: 'Jardineria', marca: 'Kärcher', stockTienda: 18, stockBodega: 30, imagen: '/imagenes/manguera-reforzada.png' },
  { id: 12, nombre: 'Tablero Eléctrico 8 Polos', descripcion: 'Caja de distribución sobrepuesta para automáticos.', precio: 9990, categoria: 'Electricidad', marca: 'Stanley', stockTienda: 14, stockBodega: 20, imagen: '/imagenes/tableroelectrico-8-polos.png' },
  { id: 13, nombre: 'Ladrillo Princesa 29x14x7', descripcion: 'Ladrillo estructurado para albañilería reinforced.', precio: 850, categoria: 'Construccion', marca: 'Sika', stockTienda: 500, stockBodega: 2000, imagen: '/imagenes/ladrillo-princesa.png' },
  { id: 14, nombre: 'Lijadora Orbital 220W', descripcion: 'Lijadora ligera con recolector de polvo para acabados finos.', precio: 27990, categoria: 'Herramientas', marca: 'Makita', stockTienda: 5, stockBodega: 10, imagen: '/imagenes/lijadora-orbita-makita.png' },
  { id: 15, nombre: 'Pintura Anticorrosiva 1Gal', descripcion: 'Protección anticorrosiva de secado rápido para estructuras metálicas.', precio: 21990, categoria: 'Pinturas', marca: 'Kolor', stockTienda: 9, stockBodega: 18, imagen: '/imagenes/pintura-anticorrosiva-kolor.png' },
  { id: 16, nombre: 'Foco LED Proyector 50W', descripcion: 'Foco exterior IP65 luz fría de bajo consumo energético.', precio: 14990, categoria: 'Electricidad', marca: 'Sipetrol', stockTienda: 22, stockBodega: 40, imagen: '/imagenes/focoled-50w.png' },
]

export const ZONAS_DESPACHO = [
  { comuna: 'La Serena', plazo: '24 horas', costo: '$3.990', estado: 'Con cobertura', color: 'success' },
  { comuna: 'Coquimbo', plazo: '24 horas', costo: '$4.490', estado: 'Con cobertura', color: 'success' },
  { comuna: 'Andacollo', plazo: '48 horas', costo: '$7.990', estado: 'Con cobertura', color: 'success' },
  { comuna: 'Vicuña', plazo: '48 horas', costo: '$8.990', estado: 'Con cobertura', color: 'success' },
  { comuna: 'Ovalle', plazo: '72 horas', costo: '$11.990', estado: 'Días acordados', color: 'warning' },
  { comuna: 'La Higuera', plazo: '-', costo: '-', estado: 'Sin cobertura', color: 'secondary' },
]
