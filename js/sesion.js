// ***** sesion del usuario: saludo en la navbar y cierre de sesion ******

//leer la sesion guardada
function obtenerUsuarioActivo(){
    const guardado = localStorage.getItem("usuarioActivo");

    if(guardado === null){
        return null;
    }

    return JSON.parse(guardado);
}

//guardar la sesion cuando alguien entra o se registra
function guardarSesion(usuario){
    localStorage.setItem("usuarioActivo", JSON.stringify(usuario));
}

//cerrar la sesion y volver al inicio
function cerrarSesion(){
    localStorage.removeItem("usuarioActivo");
    window.location.href = "index.html";
}

//dejar solo el primer nombre para que no desarme la navbar
function primerNombre(nombre){

    if(nombre === undefined || nombre === null || nombre === ""){
        return "Usuario";
    }

    return nombre.trim().split(" ")[0];
}

//pintar el saludo al lado del icono del carrito
function pintarSaludo(){

    const enlaceCarrito = document.querySelector('a[aria-label="Ver carrito"]');

    if(enlaceCarrito === null){
        return;
    }

    //si ya estaba pintado lo sacamos para volver a dibujarlo
    const zonaAnterior = document.getElementById("zona-sesion");

    if(zonaAnterior !== null){
        zonaAnterior.remove();
    }

    const usuarioActivo = obtenerUsuarioActivo();

    const zona = document.createElement("div");
    zona.id = "zona-sesion";
    zona.className = "d-flex align-items-center gap-2";

    if(usuarioActivo === null){
        zona.innerHTML =
        '<a class="btn btn-sm btn-outline-success" href="login.html">Iniciar sesión</a>';
    }
    else{
        zona.innerHTML =
        '<span class="saludo-usuario">Bienvenido <strong id="nombre-sesion"></strong></span>' +
        '<button type="button" class="btn btn-sm btn-outline-secondary" id="boton-salir">Salir</button>';
    }

    enlaceCarrito.parentNode.insertBefore(zona, enlaceCarrito);

    //el nombre se escribe con textContent, no dentro del innerHTML
    const nombreSesion = document.getElementById("nombre-sesion");

    if(nombreSesion !== null){
        nombreSesion.textContent = primerNombre(usuarioActivo.nombre);
    }

    const botonSalir = document.getElementById("boton-salir");

    if(botonSalir !== null){
        botonSalir.addEventListener("click", function(){
            cerrarSesion();
        });
    }
}

//al cargar cualquier pagina, pintar el saludo
document.addEventListener("DOMContentLoaded", pintarSaludo);
