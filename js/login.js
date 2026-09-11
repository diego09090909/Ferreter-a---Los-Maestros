console.log("JavaScript está funcionando!!")

// ***** login y registro ******
//rescatar los datos
const formularioIngreso = document.getElementById("formulario-ingreso");
const formularioRegistro = document.getElementById("formulario-registro");
const mensajeIngreso = document.getElementById("mensaje-ingreso");
const mensajeRegistro = document.getElementById("mensaje-registro");

//patron para revisar el correo
const patronCorreo = /^[^\s@]+@[^\s@]+\.[a-z]{2,}$/i;

// ***** usuarios guardados ******
//leer la lista de usuarios
function obtenerUsuarios(){
    const guardado = localStorage.getItem("usuarios");

    if(guardado === null){
        return [];
    }

    return JSON.parse(guardado);
}

//guardar la lista de usuarios
function guardarUsuarios(usuarios){
    localStorage.setItem("usuarios", JSON.stringify(usuarios));
}

// ***** herramientas para el rut ******
//dejar el rut sin puntos ni guion para poder compararlo
function limpiarRut(rut){
    return rut.replace(/\./g, "").replace(/-/g, "").toUpperCase();
}

//revisar si lo escrito parece un rut y no un correo
function pareceRut(texto){
    return /^[0-9.\-]*[kK]?$/.test(texto);
}

//dibujar el guion solo mientras el usuario escribe
function dibujarGuion(campo){

    //dejar solo numeros y la K, y no pasar de 9 caracteres
    let limpio = campo.value.replace(/[^0-9kK]/g, "").toUpperCase();

    if(limpio.length > 9){
        limpio = limpio.slice(0, 9);
    }

    //hasta 7 caracteres todavia no sabemos cual es el digito verificador
    if(limpio.length < 8){
        campo.value = limpio;
        return;
    }

    const cuerpo = limpio.slice(0, -1);
    const digitoVerificador = limpio.slice(-1);

    campo.value = cuerpo + "-" + digitoVerificador;
}

// ***** eventos de los campos de rut ******
const campoRutRegistro = document.getElementById("registro-rut");
const campoUsuarioIngreso = document.getElementById("ingreso-usuario");

//en el registro el campo es solo rut, se formatea siempre
campoRutRegistro.addEventListener("input", function(){
    dibujarGuion(campoRutRegistro);
});

//en el ingreso el campo acepta rut o correo, se formatea solo si parece rut
campoUsuarioIngreso.addEventListener("input", function(){

    if(pareceRut(campoUsuarioIngreso.value) === true){
        dibujarGuion(campoUsuarioIngreso);
    }
});

//revisar el digito verificador con el metodo modulo 11
function rutEsValido(rut){

    const limpio = limpiarRut(rut);

    if(limpio.length < 8){
        return false;
    }

    const cuerpo = limpio.slice(0, -1);
    const digitoVerificador = limpio.slice(-1);

    if(isNaN(Number(cuerpo)) === true){
        return false;
    }

    let suma = 0;
    let multiplicador = 2;

    for(let i = cuerpo.length - 1; i >= 0; i--){

        suma = suma + (Number(cuerpo.charAt(i)) * multiplicador);

        multiplicador = multiplicador + 1;

        if(multiplicador > 7){
            multiplicador = 2;
        }
    }

    const resto = 11 - (suma % 11);
    let esperado = String(resto);

    if(resto === 11){
        esperado = "0";
    }

    if(resto === 10){
        esperado = "K";
    }

    return esperado === digitoVerificador;
}

//dejar el rut con puntos y guion para guardarlo bonito
function formatearRut(rut){

    const limpio = limpiarRut(rut);
    const cuerpo = limpio.slice(0, -1);
    const digitoVerificador = limpio.slice(-1);

    let conPuntos = "";
    let contador = 0;

    for(let i = cuerpo.length - 1; i >= 0; i--){

        conPuntos = cuerpo.charAt(i) + conPuntos;
        contador = contador + 1;

        if(contador === 3 && i !== 0){
            conPuntos = "." + conPuntos;
            contador = 0;
        }
    }

    return conPuntos + "-" + digitoVerificador;
}

// ***** uso de formularios: ingresar ******
formularioIngreso.addEventListener("submit", function(evento){
    evento.preventDefault();

    //rescatar los datos
    const usuarioEscrito = document.getElementById("ingreso-usuario").value.trim();
    const contrasenaEscrita = document.getElementById("ingreso-password").value;

    //validar
    if(usuarioEscrito === "" || contrasenaEscrita === ""){

        mensajeIngreso.textContent = "Debe completar su RUT o correo y su contraseña";

        mensajeIngreso.className = "alert alert-danger mt-3";

        return;
    }

    //buscar la cuenta por correo o por rut
    const usuarios = obtenerUsuarios();
    let encontrado = null;

    usuarios.forEach(function(item){

        const correoGuardado = item.email === undefined ? "" : item.email;
        const rutGuardado = item.rut === undefined ? "" : item.rut;

        const mismoCorreo = correoGuardado.toLowerCase() === usuarioEscrito.toLowerCase();
        const mismoRut = limpiarRut(rutGuardado) === limpiarRut(usuarioEscrito);

        if(mismoCorreo === true || mismoRut === true){
            encontrado = item;
        }
    });

    if(encontrado === null){

        mensajeIngreso.textContent = "No existe una cuenta con ese RUT o correo";

        mensajeIngreso.className = "alert alert-danger mt-3";

        return;
    }

    if(encontrado.password !== contrasenaEscrita){

        mensajeIngreso.textContent = "La contraseña no es correcta";

        mensajeIngreso.className = "alert alert-danger mt-3";

        return;
    }

    //guardar la sesion y saludar
    guardarSesion(encontrado);
    pintarSaludo();

    mensajeIngreso.textContent = "Bienvenido " + encontrado.nombre + ", entrando al sitio...";

    mensajeIngreso.className = "alert alert-success mt-3";

    setTimeout(function(){

        if(encontrado.rol === "Administrador"){
            window.location.href = "admin.html";
        }
        else{
            window.location.href = "index.html";
        }

    }, 1200);
});

// ***** uso de formularios: registrarse ******
formularioRegistro.addEventListener("submit", function(evento){
    evento.preventDefault();

    //rescatar los datos
    const nombre = document.getElementById("registro-nombre").value.trim();
    const rut = document.getElementById("registro-rut").value.trim();
    const correo = document.getElementById("registro-email").value.trim();
    const contrasena = document.getElementById("registro-password").value;

    //validar
    if(nombre === "" || rut === "" || correo === "" || contrasena === ""){

        mensajeRegistro.textContent = "Debe completar todos los campos";

        mensajeRegistro.className = "alert alert-danger mt-3";

        return;
    }

    if(nombre.length < 3){

        mensajeRegistro.textContent = "El nombre debe tener al menos 3 caracteres";

        mensajeRegistro.className = "alert alert-danger mt-3";

        return;
    }

    if(rutEsValido(rut) === false){

        mensajeRegistro.textContent = "El RUT no es válido, revise el dígito verificador";

        mensajeRegistro.className = "alert alert-danger mt-3";

        return;
    }

    if(patronCorreo.test(correo) === false){

        mensajeRegistro.textContent = "El correo no tiene un formato válido";

        mensajeRegistro.className = "alert alert-danger mt-3";

        return;
    }

    if(contrasena.length < 6 || contrasena.length > 18){

        mensajeRegistro.textContent = "La contraseña debe tener entre 6 y 18 caracteres";

        mensajeRegistro.className = "alert alert-danger mt-3";

        return;
    }

    //revisar que la cuenta no exista ya
    const usuarios = obtenerUsuarios();
    let repetido = false;

    usuarios.forEach(function(item){

        const correoGuardado = item.email === undefined ? "" : item.email;
        const rutGuardado = item.rut === undefined ? "" : item.rut;

        if(limpiarRut(rutGuardado) === limpiarRut(rut)){
            repetido = true;
        }

        if(correoGuardado.toLowerCase() === correo.toLowerCase()){
            repetido = true;
        }
    });

    if(repetido === true){

        mensajeRegistro.textContent = "Ya existe una cuenta con ese RUT o ese correo";

        mensajeRegistro.className = "alert alert-danger mt-3";

        return;
    }

    //crear la cuenta
    const nuevoUsuario = {
        rut: formatearRut(rut),
        nombre: nombre,
        email: correo,
        password: contrasena,
        rol: "Cliente"
    };

    usuarios.push(nuevoUsuario);
    guardarUsuarios(usuarios);

    //dejarlo con la sesion iniciada al tiro
    guardarSesion(nuevoUsuario);
    pintarSaludo();

    mensajeRegistro.textContent = "Cuenta creada correctamente. Bienvenido " + nombre;

    mensajeRegistro.className = "alert alert-success mt-3";

    formularioRegistro.reset();

    setTimeout(function(){
        window.location.href = "index.html";
    }, 1200);
});
