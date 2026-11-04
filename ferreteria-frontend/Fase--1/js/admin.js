document.addEventListener('DOMContentLoaded', () => {
    const btnPedidos = document.getElementById('btn-pedidos');
    const btnUsuarios = document.getElementById('btn-usuarios');
    const btnStock = document.getElementById('btn-stock');
    const btnVentas = document.getElementById('btn-ventas');

    if (btnPedidos) btnPedidos.addEventListener('click', () => mostrarSeccion('pedidos'));
    if (btnUsuarios) btnUsuarios.addEventListener('click', () => mostrarSeccion('usuarios'));
    if (btnStock) btnStock.addEventListener('click', () => mostrarSeccion('stock'));
    if (btnVentas) btnVentas.addEventListener('click', () => mostrarSeccion('ventas'));

    cargarTablaStock();
    cargarTablaUsuarios();
    cargarTablaPedidos();
    cargarTablaVentas();
});

function mostrarSeccion(nombreSeccion) {
    const secciones = ['pedidos', 'usuarios', 'stock', 'ventas'];
    
    secciones.forEach(sec => {
        const el = document.getElementById('seccion-' + sec);
        if (el) el.classList.add('d-none');
    });

    const activa = document.getElementById('seccion-' + nombreSeccion);
    if (activa) activa.classList.remove('d-none');

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

function cargarTablaStock() {
    const tbody = document.getElementById('tabla-stock-body');
    if (!tbody) return;

    let productos = JSON.parse(localStorage.getItem('productos')) || [];
    tbody.innerHTML = '';

    if (productos.length === 0) {
        tbody.innerHTML = '<tr><td colspan="6" class="text-center text-muted">No hay productos en inventario. Visita el catálogo para cargar los productos iniciales.</td></tr>';
        return;
    }

    productos.forEach(p => {
        const stockTienda = p.stockTienda !== undefined ? p.stockTienda : 0;
        const stockBodega = p.stockBodega !== undefined ? p.stockBodega : 0;
        const totalStock = stockTienda + stockBodega;

        let estadoBadge = '<span class="badge bg-success">Disponible</span>';
        if (totalStock === 0) {
            estadoBadge = '<span class="badge bg-danger">Agotado</span>';
        } else if (stockTienda < 5) {
            estadoBadge = '<span class="badge bg-warning text-dark">Stock Bajo</span>';
        }

        tbody.innerHTML += `
            <tr>
                <td>${p.id}</td>
                <td>${p.nombre}</td>
                <td>${p.categoria || 'General'}</td>
                <td>${stockTienda}</td>
                <td>${stockBodega}</td>
                <td>${estadoBadge}</td>
            </tr>
        `;
    });
}

function cargarTablaUsuarios() {
    const tbody = document.getElementById('tabla-usuarios-body');
    if (!tbody) return;

    let usuarios = JSON.parse(localStorage.getItem('usuarios')) || [
        { rut: '11.111.111-1', nombre: 'Administrador General', email: 'admin@losmaestros.cl', rol: 'Administrador' },
        { rut: '22.222.222-2', nombre: 'Juan Pérez', email: 'juan.perez@email.com', rol: 'Cliente' }
    ];

    tbody.innerHTML = usuarios.map(u => `
        <tr>
            <td>${u.rut}</td>
            <td>${u.nombre}</td>
            <td>${u.email}</td>
            <td><span class="badge ${u.rol === 'Administrador' ? 'bg-primary' : 'bg-secondary'}">${u.rol}</span></td>
            <td><span class="badge bg-success">Activo</span></td>
        </tr>
    `).join('');
}

function cargarTablaPedidos() {
    const tbody = document.getElementById('tabla-pedidos-body');
    if (!tbody) return;

    let pedidos = JSON.parse(localStorage.getItem('pedidos')) || [
        { id: 101, cliente: 'Juan Pérez', tipoPago: 'WebPay (Debito)', tipoEntrega: 'Despacho a Domicilio', total: 49990, estado: 'Pendiente' },
        { id: 102, cliente: 'María González', tipoPago: 'Transferencia', tipoEntrega: 'Retiro en Tienda', total: 15600, estado: 'Entregado' }
    ];

    tbody.innerHTML = pedidos.map(p => `
        <tr>
            <td>#PED-${p.id}</td>
            <td>${p.cliente}</td>
            <td><span class="badge bg-warning text-dark">${p.tipoPago}</span></td>
            <td>${p.tipoEntrega}</td>
            <td>$${Number(p.total).toLocaleString('es-CL')}</td>
            <td><span class="badge bg-info text-dark">${p.estado}</span></td>
        </tr>
    `).join('');
}

function cargarTablaVentas() {
    const tbody = document.getElementById('tabla-ventas-body');
    if (!tbody) return;

    let ventas = JSON.parse(localStorage.getItem('ventas')) || [
        { id: 501, fecha: '11/09/2026', categoria: 'Herramientas', monto: 49990, medioPago: 'Débito' },
        { id: 502, fecha: '10/09/2026', categoria: 'Construccion', monto: 15600, medioPago: 'Crédito' }
    ];

    tbody.innerHTML = ventas.map(v => `
        <tr>
            <td>#VNT-${v.id}</td>
            <td>${v.fecha}</td>
            <td>${v.categoria}</td>
            <td>$${Number(v.monto).toLocaleString('es-CL')}</td>
            <td>${v.medioPago}</td>
        </tr>
    `).join('');
}