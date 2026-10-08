// ***** buscador de la barra lateral ******

//sacar las tildes para que "electrico" encuentre "Eléctrico"
function sinTildes(texto){
    return texto.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
}

//leer lo que se busco desde la direccion de la pagina
function textoBuscado(){
    const parametros = new URLSearchParams(window.location.search);
    const texto = parametros.get("buscar");

    if(texto === null){
        return "";
    }

    return texto.trim();
}

//cerrar la barra lateral despues de buscar
function cerrarMenu(){
    const menu = document.getElementById("offcanvasNavbar");

    if(menu === null || typeof bootstrap === "undefined"){
        return;
    }

    const instancia = bootstrap.Offcanvas.getInstance(menu);

    if(instancia !== null){
        instancia.hide();
    }
}

//dejar el formulario de busqueda funcionando
function activarBuscador(){

    const formulario = document.querySelector('.offcanvas form[role="search"]');

    if(formulario === null){
        return;
    }

    const campo = formulario.querySelector('input[type="search"]');

    if(campo === null){
        return;
    }

    //si llegamos desde otra pagina, mostrar lo que se busco
    const textoDeLaUrl = textoBuscado();

    if(textoDeLaUrl !== ""){
        campo.value = textoDeLaUrl;
    }

    const estamosEnElCatalogo = window.location.pathname.indexOf("catalogo.html") !== -1;

    formulario.addEventListener("submit", function(evento){
        evento.preventDefault();

        const texto = campo.value.trim();

        //en el catalogo filtramos al tiro, sin recargar
        if(estamosEnElCatalogo === true && typeof filtrarProductos === "function"){
            filtrarProductos();
            cerrarMenu();
            return;
        }

        //en las demas paginas nos vamos al catalogo con la busqueda puesta
        if(texto === ""){
            window.location.href = "catalogo.html";
        }
        else{
            window.location.href = "catalogo.html?buscar=" + encodeURIComponent(texto);
        }
    });
}

//los scripts van al final del body, asi que el formulario ya existe
activarBuscador();
