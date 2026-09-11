console.log("JavaScript está funcionando!!")

// ***** carrito de compras ******
//rescatar los datos
const formulario = document.getElementById("formulario-carrito");
const cuerpoCarrito = document.getElementById("cuerpo-carrito");
const totalCarrito = document.getElementById("total-carrito");
const mensajeResultado = document.getElementById("mensaje-resultado");
const avisoVacio = document.getElementById("aviso-vacio");

// ***** dibujar la tabla con lo que hay guardado ******
function dibujarCarrito(){

    const carrito = obtenerCarrito();

    cuerpoCarrito.innerHTML = "";

    carrito.forEach(function(item){

        let etiquetaStock = '<span class="badge text-bg-success">En Stock</span>';

        if(item.stock === "ultimas"){
            etiquetaStock = '<span class="badge text-bg-danger">Últimas Unidades</span>';
        }

        const fila = document.createElement("tr");
        fila.className = "fila-producto";
        fila.dataset.precio = item.precio;

        fila.innerHTML =
        '<td class="celda-imagen">' +
            '<img src="' + item.imagen + '" alt="' + item.nombre + '" class="img-producto">' +
        '</td>' +
        '<td>' +
            '<p class="mb-1 fw-semibold">' + item.nombre + '</p>' +
            etiquetaStock +
        '</td>' +
        '<td class="text-center">' +
            '<input type="number" class="form-control form-control-sm input-cantidad" value="' + item.cantidad + '" min="1" max="10" data-codigo="' + item.codigo + '">' +
        '</td>' +
        '<td class="text-end">' + formatearPrecio(item.precio) + '</td>' +
        '<td class="text-end fw-semibold subtotal">' + formatearPrecio(item.precio * item.cantidad) + '</td>' +
        '<td class="text-end">' +
            '<button type="button" class="btn btn-sm btn-outline-danger boton-eliminar" data-codigo="' + item.codigo + '">&times;</button>' +
        '</td>';

        cuerpoCarrito.appendChild(fila);
    });

    if(carrito.length === 0){
        avisoVacio.className = "alert alert-secondary";
    }
    else{
        avisoVacio.className = "d-none";
    }

    actualizarTotal();
    activarEventos();
}

// ***** total del carrito ******
function actualizarTotal(){

    const carrito = obtenerCarrito();
    let total = 0;

    carrito.forEach(function(item){
        total = total + (item.precio * item.cantidad);
    });

    totalCarrito.textContent = formatearPrecio(total);
}

// ***** eventos de las filas dibujadas ******
function activarEventos(){

    const camposCantidad = document.querySelectorAll(".input-cantidad");
    const botonesEliminar = document.querySelectorAll(".boton-eliminar");

    //recalcular cuando el usuario cambia una cantidad
    camposCantidad.forEach(function(campo){
        campo.addEventListener("input", function(){

            const cantidad = Number(campo.value);

            if(cantidad >= 1 && cantidad <= 10){

                cambiarCantidad(campo.dataset.codigo, cantidad);

                const fila = campo.closest(".fila-producto");
                const celdaSubtotal = fila.querySelector(".subtotal");
                const precio = Number(fila.dataset.precio);

                celdaSubtotal.textContent = formatearPrecio(precio * cantidad);

                actualizarTotal();
            }
        });
    });

    //eliminar un producto del carrito
    botonesEliminar.forEach(function(boton){
        boton.addEventListener("click", function(){

            eliminarProducto(boton.dataset.codigo);

            mensajeResultado.textContent = "Producto eliminado del carrito";
            mensajeResultado.className = "alert alert-warning mt-4";

            dibujarCarrito();
        });
    });
}


// ***** procesar la compra y avisarle al panel de administracion ******
function finalizarCompra(entrega, pago){

    const carrito = obtenerCarrito();
    const usuarioActivo = JSON.parse(localStorage.getItem("usuarioActivo"));

    let nombreCliente = "Cliente Anónimo";

    if(usuarioActivo !== null){
        nombreCliente = usuarioActivo.nombre;
    }

    let total = 0;

    carrito.forEach(function(item){
        total = total + (item.precio * item.cantidad);
    });

    const idCompra = Date.now().toString().slice(-4);
    const fechaActual = new Date().toLocaleDateString("es-CL");

    //1. descontar el stock del catalogo
    const productos = JSON.parse(localStorage.getItem("productos")) || [];
    let categoriaVenta = "";

    carrito.forEach(function(item){

        const idProducto = Number(item.codigo.replace("producto-", ""));

        productos.forEach(function(producto){

            if(producto.id === idProducto){

                if(categoriaVenta === ""){
                    categoriaVenta = producto.categoria;
                }
                else if(categoriaVenta !== producto.categoria){
                    categoriaVenta = "Varios";
                }

                if(producto.stockTienda >= item.cantidad){
                    producto.stockTienda = producto.stockTienda - item.cantidad;
                }
                else{
                    const restante = item.cantidad - producto.stockTienda;
                    producto.stockTienda = 0;
                    producto.stockBodega = Math.max(0, producto.stockBodega - restante);
                }
            }
        });
    });

    if(categoriaVenta === ""){
        categoriaVenta = "General";
    }

    localStorage.setItem("productos", JSON.stringify(productos));

    //2. crear el pedido para el panel de administracion
    const pedidos = JSON.parse(localStorage.getItem("pedidos")) || [];

    pedidos.unshift({
        id: idCompra,
        cliente: nombreCliente,
        tipoPago: pago,
        tipoEntrega: entrega,
        total: total,
        estado: "Pendiente"
    });

    localStorage.setItem("pedidos", JSON.stringify(pedidos));

    //3. crear la venta para el panel de administracion
    const ventas = JSON.parse(localStorage.getItem("ventas")) || [];

    ventas.unshift({
        id: idCompra,
        fecha: fechaActual,
        categoria: categoriaVenta,
        monto: total,
        medioPago: pago
    });

    localStorage.setItem("ventas", JSON.stringify(ventas));

    //4. vaciar el carrito
    guardarCarrito([]);
}

// ***** uso de formularios ******
formulario.addEventListener("submit", function(evento){
    evento.preventDefault();

    //rescatar los datos
    const carrito = obtenerCarrito();
    const entrega = document.querySelector("input[name='entrega']:checked");
    const pago = document.querySelector("input[name='pago']:checked");

    let cantidadInvalida = false;

    carrito.forEach(function(item){
        if(item.cantidad < 1 || item.cantidad > 10){
            cantidadInvalida = true;
        }
    });

    //validar
    if(carrito.length === 0){

        mensajeResultado.textContent = "Su carrito está vacío, agregue productos desde el catálogo";

        mensajeResultado.className = "alert alert-danger mt-4";

        return;
    }

    if(cantidadInvalida === true){

        mensajeResultado.textContent = "Las cantidades deben estar entre 1 y 10 unidades";

        mensajeResultado.className = "alert alert-danger mt-4";

        return;
    }

    if(entrega === null || pago === null){

        mensajeResultado.textContent = "Debe seleccionar el tipo de entrega y el método de pago";

        mensajeResultado.className = "alert alert-danger mt-4";

        return;
    }

    //guardar el total antes de vaciar el carrito
    const totalCompra = totalCarrito.textContent;

    //registrar el pedido, la venta y descontar el stock
    finalizarCompra(entrega.value, pago.value);

    mensajeResultado.textContent =
    "Compra confirmada por " + totalCompra + ". Entrega: " + entrega.value + ". Pago: " + pago.value;

    mensajeResultado.className = "alert alert-success mt-4";

    dibujarCarrito();
});

// ***** productos de ejemplo mientras el catalogo no este conectado ******
function cargarEjemplos(){

    if(localStorage.getItem("carrito") !== null){
        return;
    }

    agregarProducto("taladro-650w", "Taladro percutor 650W", 39990, "imagenes/logo_maestros.png", "disponible");
    agregarProducto("cemento-25", "Cemento Polpaico 25 kg", 6490, "imagenes/logo_maestros.png", "ultimas");
    agregarProducto("set-destornilladores", "Set de destornilladores 12 piezas", 12990, "imagenes/logo_maestros.png", "disponible");

    cambiarCantidad("cemento-25", 3);
    cambiarCantidad("set-destornilladores", 2);
}

//dibujar el carrito al cargar la pagina
dibujarCarrito();
