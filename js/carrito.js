console.log("JavaScript está funcionando!!")

// ***** carrito de compras ******

const formulario = document.getElementById("formulario-carrito");
const totalCarrito = document.getElementById("total-carrito");
const contadorCarrito = document.getElementById("contador-carrito");
const mensajeResultado = document.getElementById("mensaje-resultado");

const filasProducto = document.querySelectorAll(".fila-producto");
const camposCantidad = document.querySelectorAll(".input-cantidad");
const botonesEliminar = document.querySelectorAll(".boton-eliminar");

function formatearPrecio(valor){
    return "$" + valor.toLocaleString("es-CL");
}

// ***** subtotales y total ******
function actualizarTotales(){

    let total = 0;
    let cantidadProductos = 0;

    filasProducto.forEach(function(fila){

        if(fila.classList.contains("d-none") === false){

            const campoCantidad = fila.querySelector(".input-cantidad");
            const celdaSubtotal = fila.querySelector(".subtotal");

            const precio = Number(fila.dataset.precio);
            const cantidad = Number(campoCantidad.value);

            if(cantidad >= 1 && cantidad <= 10){

                const subtotal = precio * cantidad;

                celdaSubtotal.textContent = formatearPrecio(subtotal);

                total = total + subtotal;
                cantidadProductos = cantidadProductos + cantidad;
            }
            else{
                celdaSubtotal.textContent = "-";
            }
        }
    });

    totalCarrito.textContent = formatearPrecio(total);
    contadorCarrito.textContent = cantidadProductos;
}

camposCantidad.forEach(function(campo){
    campo.addEventListener("input", function(){
        actualizarTotales();
    });
});

botonesEliminar.forEach(function(boton){
    boton.addEventListener("click", function(){

        const fila = boton.closest(".fila-producto");
        fila.classList.add("d-none");

        mensajeResultado.textContent = "Producto eliminado del carrito";
        mensajeResultado.className = "alert alert-warning mt-4";

        actualizarTotales();
    });
});

// ***** uso de formularios ******
formulario.addEventListener("submit", function(evento){
    evento.preventDefault();

    //rescatar los datos
    const entrega = document.querySelector("input[name='entrega']:checked");
    const pago = document.querySelector("input[name='pago']:checked");

    let hayProductos = false;
    let cantidadInvalida = false;

    filasProducto.forEach(function(fila){

        if(fila.classList.contains("d-none") === false){

            hayProductos = true;

            const cantidad = Number(fila.querySelector(".input-cantidad").value);

            if(cantidad < 1 || cantidad > 10 || isNaN(cantidad)){
                cantidadInvalida = true;
            }
        }
    });


    if(hayProductos === false){

        mensajeResultado.textContent = "Su carrito está vacío, agregue productos antes de confirmar";

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

    mensajeResultado.textContent =
    "Compra confirmada por " + totalCarrito.textContent + ". Entrega: " + entrega.value + ". Pago: " + pago.value;

    mensajeResultado.className = "alert alert-success mt-4";
});

actualizarTotales();
