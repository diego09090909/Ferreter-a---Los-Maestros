document.addEventListener('DOMContentLoaded', () => {
    const btnPedidos = document.getElementById('btn-pedidos');
    const btnUsuarios = document.getElementById('btn-usuarios');
    const btnStock = document.getElementById('btn-stock');
    const btnVentas = document.getElementById('btn-ventas');

    if (btnPedidos) btnPedidos.addEventListener('click', () => mostrarSeccion('pedidos'));
    if (btnUsuarios) btnUsuarios.addEventListener('click', () => mostrarSeccion('usuarios'));
    if (btnStock) btnStock.addEventListener('click', () => mostrarSeccion('stock'));
    if (btnVentas) btnVentas.addEventListener('click', () => mostrarSeccion('ventas'));
});

function mostrarSeccion(nombreSeccion) {
    const secciones = {
        pedidos: document.getElementById('seccion-pedidos'),
        usuarios: document.getElementById('seccion-usuarios'),
        stock: document.getElementById('seccion-stock'),
        ventas: document.getElementById('seccion-ventas')
    };

    Object.keys(secciones).forEach(key => {
        if (secciones[key]) {
            secciones[key].classList.add('d-none');
        }
    });

    if (secciones[nombreSeccion]) {
        secciones[nombreSeccion].classList.remove('d-none');
    }

    const botones = {
        pedidos: document.getElementById('btn-pedidos'),
        usuarios: document.getElementById('btn-usuarios'),
        stock: document.getElementById('btn-stock'),
        ventas: document.getElementById('btn-ventas')
    };

    Object.keys(botones).forEach(key => {
        const btn = botones[key];
        if (btn) {
            if (key === nombreSeccion) {
                btn.classList.remove('btn-outline-secondary', 'text-dark');
                btn.classList.add('btn-primary', 'active');
            } else {
                btn.classList.remove('btn-primary', 'active');
                btn.classList.add('btn-outline-secondary', 'text-dark');
            }
        }
    });
}