function inicializarAdminPorDefecto() {
    const usuarios = JSON.parse(localStorage.getItem('usuarios')) || [];

    const existeAdmin = usuarios.some(u => u.rol === 'Administrador');

    if (!existeAdmin) {
        const adminPredefinido = {
            rut: "11.111.111-1",
            nombre: "Administrador General",
            email: "admin@losmaestros.cl",
            password: "admin123",
            rol: "Administrador"
        };
        usuarios.push(adminPredefinido);
        localStorage.setItem('usuarios', JSON.stringify(usuarios));
    }
}

function gestionarSesionYAccesos() {
    inicializarAdminPorDefecto();

    const usuarioActivo = JSON.parse(localStorage.getItem('usuarioActivo'));
    const esAdmin = usuarioActivo && usuarioActivo.rol === 'Administrador';


    const linkAdmin = document.getElementById('nav-link-admin');
    if (linkAdmin) {
        if (esAdmin) {
            linkAdmin.classList.remove('d-none');
        } else {
            linkAdmin.classList.add('d-none');
        }
    }


    const infoSesion = document.getElementById('info-sesion');
    const nombreUsuarioSesion = document.getElementById('nombre-usuario-sesion');
    const btnCerrarSesion = document.getElementById('btn-cerrar-sesion');

    if (usuarioActivo && infoSesion && nombreUsuarioSesion) {
        nombreUsuarioSesion.textContent = usuarioActivo.nombre || usuarioActivo.email;
        infoSesion.classList.remove('d-none');
        infoSesion.classList.add('d-flex');
    } else if (infoSesion) {
        infoSesion.classList.add('d-none');
        infoSesion.classList.remove('d-flex');
    }

  
    if (btnCerrarSesion) {
        btnCerrarSesion.addEventListener('click', () => {
            localStorage.removeItem('usuarioActivo');
            window.location.href = "index.html";
        });
    }

    // 4. Proteger acceso directo a admin.html
    const esPaginaAdmin = window.location.pathname.includes('admin.html');
    if (esPaginaAdmin && !esAdmin) {
        alert("Acceso denegado. Debe iniciar sesión con una cuenta de Administrador.");
        window.location.href = "login.html";
    }
}

document.addEventListener('DOMContentLoaded', gestionarSesionYAccesos);