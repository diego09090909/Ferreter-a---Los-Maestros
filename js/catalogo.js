// 1. Obtener productos de localStorage o cargar los 16 iniciales
function obtenerProductos() {
    const productosGuardados = localStorage.getItem('productos');
    if (productosGuardados) {
        return JSON.parse(productosGuardados);
    } else {
        const productosIniciales = [
            { id: 1, nombre: "Taladro Percutor 710W", descripcion: "Taladro de alta potencia para perforaciones en concreto y madera.", precio: 49990, categoria: "Herramientas", marca: "m1", stockTienda: 10, stockBodega: 20, imagen: "https://picsum.photos/300/200?random=1" },
            { id: 2, nombre: "Cemento Bío Bío 25kg", descripcion: "Saco de cemento de alta resistencia para obras y estructuras.", precio: 7800, categoria: "Construccion", marca: "m2", stockTienda: 50, stockBodega: 200, imagen: "https://picsum.photos/300/200?random=2" },
            { id: 3, nombre: "Esmalte al Agua 1 Galón", descripcion: "Pintura lavable de alto cubrimiento para interiores y exteriores.", precio: 24990, categoria: "Pinturas", marca: "m3", stockTienda: 15, stockBodega: 30, imagen: "https://picsum.photos/300/200?random=3" },
            { id: 4, nombre: "Sierra Circular 1400W", descripcion: "Sierra profesional de corte rápido y preciso para madera.", precio: 65990, categoria: "Herramientas", marca: "m1", stockTienda: 4, stockBodega: 8, imagen: "https://picsum.photos/300/200?random=4" },
            { id: 5, nombre: "Cable Eléctrico THHN 100m", descripcion: "Rollo de cable cobre aislado 2.5mm² para instalaciones residenciales.", precio: 32990, categoria: "Electricidad", marca: "m2", stockTienda: 12, stockBodega: 25, imagen: "https://picsum.photos/300/200?random=5" },
            { id: 6, nombre: "Tubo PVC Hidráulico 25mm x 6m", descripcion: "Tubo de PVC de alta presión para agua potable y grifería.", precio: 4500, categoria: "Plomeria", marca: "m3", stockTienda: 40, stockBodega: 100, imagen: "https://picsum.photos/300/200?random=6" },
            { id: 7, nombre: "Cortacésped Eléctrico 1200W", descripcion: "Cortacésped compacto ideal para jardines medianos y pequeños.", precio: 89990, categoria: "Jardineria", marca: "m1", stockTienda: 2, stockBodega: 5, imagen: "https://picsum.photos/300/200?random=7" },
            { id: 8, nombre: "Esmeril Angular 4.5\" 800W", descripcion: "Herramienta versátil para corte y desbaste de metales.", precio: 38990, categoria: "Herramientas", marca: "m2", stockTienda: 8, stockBodega: 15, imagen: "https://picsum.photos/300/200?random=8" },
            { id: 9, nombre: "Set de Brochas Profesional", descripcion: "Pack de 5 brochas de cerda sintética de varios tamaños.", precio: 8990, categoria: "Pinturas", marca: "m3", stockTienda: 25, stockBodega: 50, imagen: "https://picsum.photos/300/200?random=9" },
            { id: 10, nombre: "Llave Monomando Lavaplatos", descripcion: "Grifería de acero inoxidable con cuello flexible.", precio: 18990, categoria: "Plomeria", marca: "m1", stockTienda: 6, stockBodega: 12, imagen: "https://picsum.photos/300/200?random=10" },
            { id: 11, nombre: "Manguera Reforzada 20m", descripcion: "Manguera de jardín anti-torsión con acoples rápidos incluidos.", precio: 12990, categoria: "Jardineria", marca: "m2", stockTienda: 18, stockBodega: 30, imagen: "https://picsum.photos/300/200?random=11" },
            { id: 12, nombre: "Tablero Eléctrico 8 Polos", descripcion: "Caja de distribución sobrepuesta para automáticos.", precio: 9990, categoria: "Electricidad", marca: "m3", stockTienda: 14, stockBodega: 20, imagen: "https://picsum.photos/300/200?random=12" },
            { id: 13, nombre: "Ladrillo Princesa 29x14x7", descripcion: "Ladrillo estructurado para albañilería reinforced.", precio: 850, categoria: "Construccion", marca: "m1", stockTienda: 500, stockBodega: 2000, imagen: "https://picsum.photos/300/200?random=13" },
            { id: 14, nombre: "Lijadora Orbital 220W", descripcion: "Lijadora ligera con recolector de polvo para acabados finos.", precio: 27990, categoria: "Herramientas", marca: "m2", stockTienda: 5, stockBodega: 10, imagen: "https://picsum.photos/300/200?random=14" },
            { id: 15, nombre: "Pintura Anticorrosiva 1Gal", descripcion: "Protección anticorrosiva de secado rápido para estructuras metálicas.", precio: 21990, categoria: "Pinturas", marca: "m3", stockTienda: 9, stockBodega: 18, imagen: "https://picsum.photos/300/200?random=15" },
            { id: 16, nombre: "Foco LED Proyector 50W", descripcion: "Foco exterior IP65 luz fría de bajo consumo energético.", precio: 14990, categoria: "Electricidad", marca: "m1", stockTienda: 22, stockBodega: 40, imagen: "https://picsum.photos/300/200?random=16" }
        ];
        localStorage.setItem('productos', JSON.stringify(productosIniciales));
        return productosIniciales;
    }
}

// 2. Renderizar las tarjetas de productos
function renderizarProductos(lista) {
    const contenedorGrid = document.getElementById('gridProductos');
    if (!contenedorGrid) return;

    contenedorGrid.innerHTML = '';

    if (lista.length === 0) {
        contenedorGrid.innerHTML = '<p class="text-muted small col-12 p-3">No se encontraron productos con los filtros seleccionados.</p>';
        return;
    }

    lista.forEach(producto => {
        const estaAgotado = (producto.stockTienda + producto.stockBodega) === 0;

        const tarjeta = `
        <div class="col">
            <div class="card h-100 border-0 shadow-sm">
                <img src="${producto.imagen}" class="card-img-top" alt="${producto.nombre}">
                <div class="card-body d-flex flex-column">
                    <h5 class="card-title h6 fw-bold">${producto.nombre}</h5>
                    <p class="card-text small text-muted flex-grow-1">${producto.descripcion}</p>
                    <span class="fw-bold fs-6 mb-2 text-primary">$${producto.precio.toLocaleString('es-CL')}</span>
                    
                    <button class="btn ${estaAgotado ? 'btn-secondary' : 'btn-primary'} btn-sm mt-auto boton-agregar" 
                            data-id="${producto.id}" ${estaAgotado ? 'disabled' : ''}>
                        ${estaAgotado ? 'Sin Stock' : 'Añadir al Carrito'}
                    </button>
                </div>
            </div>
        </div>
        `;
        contenedorGrid.innerHTML += tarjeta;
    });

    activarBotonesAgregar();
}

// 3. Filtrar los productos
function filtrarProductos() {
    const productos = obtenerProductos();

    const categoriasSeleccionadas = [];
    document.querySelectorAll('.filter-category').forEach(check => {
        if (check.checked) categoriasSeleccionadas.push(check.value);
    });

    const marcasSeleccionadas = [];
    document.querySelectorAll('.filter-marca').forEach(check => {
        if (check.checked) marcasSeleccionadas.push(check.value);
    });

    const rangoPrecio = document.getElementById('rango');
    const precioMaximo = rangoPrecio ? Number(rangoPrecio.value) : Infinity;

    const precioMaximoTexto = document.getElementById('precioMaximoTexto');
    if (precioMaximoTexto && rangoPrecio) {
        precioMaximoTexto.textContent = precioMaximo.toLocaleString('es-CL');
    }

    const productosFiltrados = productos.filter(producto => {
        const noHayMarca = marcasSeleccionadas.length === 0;
        const marcaCorrecta = marcasSeleccionadas.includes(producto.marca);
        const cumpleMarca = noHayMarca || marcaCorrecta;

        const noHayCat = categoriasSeleccionadas.length === 0;
        const catCorrecta = categoriasSeleccionadas.includes(producto.categoria);
        const cumpleCategoria = noHayCat || catCorrecta;

        const cumplePrecio = producto.precio <= precioMaximo;

        return cumpleCategoria && cumpleMarca && cumplePrecio;
    });

    renderizarProductos(productosFiltrados);
}

// 4. Efecto visual del botón (Verde por 1 segundo) y agregar al carrito
function activarBotonesAgregar() {
    const productos = obtenerProductos();

    document.querySelectorAll('.boton-agregar').forEach(boton => {
        boton.addEventListener('click', () => {
            const idProducto = Number(boton.dataset.id);
            const producto = productos.find(p => p.id === idProducto);
            if (!producto) return;

            // Si tienes la función global para agregar al carrito, la ejecutas:
            if (typeof agregarProducto === 'function') {
                agregarProducto('producto-' + producto.id, producto.nombre, producto.precio, producto.imagen, 'disponible');
            }

            // --- EFECTO VISUAL DE 1 SEGUNDO ---
            boton.textContent = '¡Agregado!';
            boton.classList.remove('btn-primary');
            boton.classList.add('btn-success');
            boton.disabled = true;

            setTimeout(() => {
                boton.textContent = 'Añadir al Carrito';
                boton.classList.remove('btn-success');
                boton.classList.add('btn-primary');
                boton.disabled = false;
            }, 1000);
        });
    });
}

// 5. Cargar eventos e inicializar
document.addEventListener('DOMContentLoaded', () => {
    const productos = obtenerProductos();
    renderizarProductos(productos);

    document.querySelectorAll('.filter-category').forEach(check => {
        check.addEventListener('change', filtrarProductos);
    });

    document.querySelectorAll('.filter-marca').forEach(check => {
        check.addEventListener('change', filtrarProductos);
    });

    const rangoPrecio = document.getElementById('rango');
    if (rangoPrecio) {
        rangoPrecio.addEventListener('input', filtrarProductos);
    }
});