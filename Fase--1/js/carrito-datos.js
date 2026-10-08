// ***** datos del carrito compartidos entre las paginas ******

//leer el carrito guardado
function obtenerCarrito(){
    const guardado = localStorage.getItem("carrito");

    if(guardado === null){
        return [];
    }

    return JSON.parse(guardado);
}

//guardar el carrito
function guardarCarrito(carrito){
    localStorage.setItem("carrito", JSON.stringify(carrito));
    actualizarContador();
}

//agregar un producto, o sumarle uno si ya estaba
function agregarProducto(codigo, nombre, precio, imagen, stock){
    const carrito = obtenerCarrito();
    let encontrado = false;

    carrito.forEach(function(item){
        if(item.codigo === codigo){
            item.cantidad = item.cantidad + 1;
            encontrado = true;
        }
    });

    if(encontrado === false){
        carrito.push({
            codigo: codigo,
            nombre: nombre,
            precio: precio,
            imagen: imagen,
            stock: stock,
            cantidad: 1
        });
    }

    guardarCarrito(carrito);
}

//sacar un producto del carrito
function eliminarProducto(codigo){
    const carrito = obtenerCarrito();
    const nuevoCarrito = [];

    carrito.forEach(function(item){
        if(item.codigo !== codigo){
            nuevoCarrito.push(item);
        }
    });

    guardarCarrito(nuevoCarrito);
}

//cambiar la cantidad de un producto
function cambiarCantidad(codigo, cantidad){
    const carrito = obtenerCarrito();

    carrito.forEach(function(item){
        if(item.codigo === codigo){
            item.cantidad = cantidad;
        }
    });

    guardarCarrito(carrito);
}

//dar formato de pesos chilenos
function formatearPrecio(valor){
    return "$" + valor.toLocaleString("es-CL");
}

//pintar el numero del globito rojo de la navbar
function actualizarContador(){
    const contadorCarrito = document.getElementById("contador-carrito");

    if(contadorCarrito === null){
        return;
    }

    const carrito = obtenerCarrito();
    let cantidadProductos = 0;

    carrito.forEach(function(item){
        cantidadProductos = cantidadProductos + item.cantidad;
    });

    contadorCarrito.textContent = cantidadProductos;

    if(cantidadProductos === 0){
        contadorCarrito.classList.add("d-none");
    }
    else{
        contadorCarrito.classList.remove("d-none");
    }
}

//al cargar cualquier pagina, pintar el contador
actualizarContador();
