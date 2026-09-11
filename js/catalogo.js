function obtenerProductos() {
    const productosGuardados = localStorage.getItem('productos');
    if (productosGuardados) {
        const productos = JSON.parse(productosGuardados);
        
        const tieneFotosViejas = productos.some(p => p.imagen && p.imagen.includes('picsum.photos'));
        if (!tieneFotosViejas) {
            return productos;
        }
    }

    const productosIniciales = [
        { id: 1, nombre: "Taladro Percutor 710W", descripcion: "Taladro de alta potencia para perforaciones en concreto y madera.", precio: 49990, categoria: "Herramientas", marca: "Bauker", stockTienda: 10, stockBodega: 20, imagen: "imagenes/taladroBAUKER-710.png" },
        { id: 2, nombre: "Cemento Bío Bío 25kg", descripcion: "Saco de cemento de alta resistencia para obras y estructuras.", precio: 7800, categoria: "Construccion", marca: "Cintac", stockTienda: 50, stockBodega: 200, imagen: "imagenes/cemento-biobio-25kg.png" },
        { id: 3, nombre: "Esmalte al Agua 1 Galón", descripcion: "Pintura lavable de alto cubrimiento para interiores y exteriores.", precio: 24990, categoria: "Pinturas", marca: "Kolor", stockTienda: 15, stockBodega: 30, imagen: "imagenes/esmalte-agua-kolor.png" },
        { id: 4, nombre: "Sierra Circular 1400W", descripcion: "Sierra profesional de corte rápido y preciso para madera.", precio: 65990, categoria: "Herramientas", marca: "DeWalt", stockTienda: 4, stockBodega: 8, imagen: "imagenes/cierra-circular-dewalt.png" },
        { id: 5, nombre: "Cable Eléctrico THHN 100m", descripcion: "Rollo de cable cobre aislado 2.5mm² para instalaciones residenciales.", precio: 32990, categoria: "Electricidad", marca: "3M", stockTienda: 12, stockBodega: 25, imagen: "imagenes/cable-100m.png" },
        { id: 6, nombre: "Tubo PVC Hidráulico 25mm x 6m", descripcion: "Tubo de PVC de alta presión para agua potable y grifería.", precio: 4500, categoria: "Plomeria", marca: "TIGRE", stockTienda: 40, stockBodega: 100, imagen: "imagenes/tubo-pvc.png" },
        { id: 7, nombre: "Cortacésped Eléctrico 1200W", descripcion: "Cortacésped compacto ideal para jardines medianos y pequeños.", precio: 89990, categoria: "Jardineria", marca: "Stihl", stockTienda: 2, stockBodega: 5, imagen: "imagenes/cortacesped-stilth.png" },
        { id: 8, nombre: "Esmeril Angular 4.5\" 800W", descripcion: "Herramienta versátil para corte y desbaste de metales.", precio: 38990, categoria: "Herramientas", marca: "Bosch", stockTienda: 8, stockBodega: 15, imagen: "imagenes/esmeril-bosch.png" },
        { id: 9, nombre: "Set de Brochas Profesional", descripcion: "Pack de 5 brochas de cerda sintética de varios tamaños.", precio: 8990, categoria: "Pinturas", marca: "Tersuave", stockTienda: 25, stockBodega: 50, imagen: "imagenes/set-brochas.png" },
        { id: 10, nombre: "Llave Monomando Lavaplatos", descripcion: "Grifería de acero inoxidable con cuello flexible.", precio: 18990, categoria: "Plomeria", marca: "Topex", stockTienda: 6, stockBodega: 12, imagen: "imagenes/monomando.png" },
        { id: 11, nombre: "Manguera Reforzada 20m", descripcion: "Manguera de jardín anti-torsión con acoples rápidos incluidos.", precio: 12990, categoria: "Jardineria", marca: "Kärcher", stockTienda: 18, stockBodega: 30, imagen: "imagenes/manguera-reforzada.png" },
        { id: 12, nombre: "Tablero Eléctrico 8 Polos", descripcion: "Caja de distribución sobrepuesta para automáticos.", precio: 9990, categoria: "Electricidad", marca: "Stanley", stockTienda: 14, stockBodega: 20, imagen: "imagenes/tableroelectrico-8-polos.png" },
        { id: 13, nombre: "Ladrillo Princesa 29x14x7", descripcion: "Ladrillo estructurado para albañilería reinforced.", precio: 850, categoria: "Construccion", marca: "Sika", stockTienda: 500, stockBodega: 2000, imagen: "imagenes/ladrillo-princesa.png" },
        { id: 14, nombre: "Lijadora Orbital 220W", descripcion: "Lijadora ligera con recolector de polvo para acabados finos.", precio: 27990, categoria: "Herramientas", marca: "Makita", stockTienda: 5, stockBodega: 10, imagen: "imagenes/lijadora-orbita-makita.png" },
        { id: 15, nombre: "Pintura Anticorrosiva 1Gal", descripcion: "Protección anticorrosiva de secado rápido para estructuras metálicas.", precio: 21990, categoria: "Pinturas", marca: "Kolor", stockTienda: 9, stockBodega: 18, imagen: "imagenes/pintura-anticorrosiva-kolor.png" },
        { id: 16, nombre: "Foco LED Proyector 50W", descripcion: "Foco exterior IP65 luz fría de bajo consumo energético.", precio: 14990, categoria: "Electricidad", marca: "Sipetrol", stockTienda: 22, stockBodega: 40, imagen: "imagenes/focoled-50w.png" }
    ];

    localStorage.setItem('productos', JSON.stringify(productosIniciales));
    return productosIniciales;
}


function cargarFiltroMarcas() {
    const selectMarca = document.getElementById('filtro-marca');
    if (!selectMarca) return;

    const productos = obtenerProductos();
    const marcasUnicas = [...new Set(productos.map(p => p.marca))].sort();

    let htmlOpciones = '<option value="todas" selected>Todas las marcas</option>';
    
    marcasUnicas.forEach(marca => {
        if (marca) {
            htmlOpciones += `<option value="${marca}">${marca}</option>`;
        }
    });

    selectMarca.innerHTML = htmlOpciones;
}

function renderizarProductos(lista) {
    const contenedorGrid = document.getElementById('gridProductos');
    const contador = document.getElementById('contadorProductos');
    
    if (contador) {
        contador.textContent = `Mostrando ${lista.length} producto${lista.length === 1 ? '' : 's'}`;
    }

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

function filtrarProductos() {
    const productos = obtenerProductos();

    const categoriasSeleccionadas = [];
    document.querySelectorAll('.filter-category').forEach(check => {
        if (check.checked) categoriasSeleccionadas.push(check.value);
    });

    const selectMarca = document.getElementById('filtro-marca');
    const marcaSeleccionada = selectMarca ? selectMarca.value : 'todas';

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

    let productosFiltrados = productos.filter(producto => {
        const cumpleSelectMarca = (marcaSeleccionada === 'todas') || (producto.marca === marcaSeleccionada);

        const noHayCheckMarca = marcasSeleccionadas.length === 0;
        const marcaCheckCorrecta = marcasSeleccionadas.includes(producto.marca);
        const cumpleCheckMarca = noHayCheckMarca || marcaCheckCorrecta;

        const noHayCat = categoriasSeleccionadas.length === 0;
        const catCorrecta = categoriasSeleccionadas.includes(producto.categoria);
        const cumpleCategoria = noHayCat || catCorrecta;

        const cumplePrecio = producto.precio <= precioMaximo;

        return cumpleCategoria && cumpleSelectMarca && cumpleCheckMarca && cumplePrecio;
    });

    const selectOrdenar = document.getElementById('ordenar');
    const opcionOrden = selectOrdenar ? selectOrdenar.value : 'destacados';

    if (opcionOrden === '1') {
        productosFiltrados.sort((a, b) => a.precio - b.precio);
    } else if (opcionOrden === '2') {
        productosFiltrados.sort((a, b) => b.precio - a.precio);
    } else if (opcionOrden === 'destacados') {
        productosFiltrados.sort((a, b) => a.id - b.id);
    }

    renderizarProductos(productosFiltrados);
}

function activarBotonesAgregar() {
    const productos = obtenerProductos();

    document.querySelectorAll('.boton-agregar').forEach(boton => {
        boton.addEventListener('click', () => {
            const idProducto = Number(boton.dataset.id);
            const producto = productos.find(p => p.id === idProducto);
            if (!producto) return;

            if (typeof agregarProducto === 'function') {
                agregarProducto('producto-' + producto.id, producto.nombre, producto.precio, producto.imagen, 'disponible');
            }

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

document.addEventListener('DOMContentLoaded', () => {
    cargarFiltroMarcas();
    
    filtrarProductos();

    const selectOrdenar = document.getElementById('ordenar');
    if (selectOrdenar) {
        selectOrdenar.addEventListener('change', filtrarProductos);
    }

    const selectMarca = document.getElementById('filtro-marca');
    if (selectMarca) {
        selectMarca.addEventListener('change', filtrarProductos);
    }

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