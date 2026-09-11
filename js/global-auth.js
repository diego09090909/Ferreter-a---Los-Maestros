

document.addEventListener('DOMContentLoaded', () => {
  
    const usuarioActivo = JSON.parse(localStorage.getItem('usuarioActivo'));

 
    const linkAdmin = document.getElementById('nav-link-admin');

    if (linkAdmin) {
     
        if (usuarioActivo && usuarioActivo.rol === 'Administrador') {
            linkAdmin.classList.remove('d-none'); 
        } else {
            linkAdmin.classList.add('d-none'); 
        }
    }
});