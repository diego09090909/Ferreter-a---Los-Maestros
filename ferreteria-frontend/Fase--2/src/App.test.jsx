import { beforeEach, describe, expect, it, vi } from 'vitest'
import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import App from './App'
import { AuthProvider } from './context/AuthContext'
import { CarritoProvider } from './context/CarritoContext'
import { obtenerCategorias, obtenerProducto, obtenerProductos } from './services/catalogo'

vi.mock('./services/catalogo', () => ({
  obtenerProductos: vi.fn(),
  obtenerCategorias: vi.fn(),
  obtenerProducto: vi.fn(),
}))

const PRODUCTOS_API = [
  { id: 1, codigo: 'HE001', nombre: 'Taladro Percutor 710W', precio: 49990, unidad: 'Unidad', stock: 10, disponible: true, marca: 'Bauker', subcategoria: 'Taladros', categoria: 'Herramientas', imagen: null },
  { id: 2, codigo: 'PT001', nombre: 'Pintura látex interior 1 galón', precio: 9990, unidad: 'Galón', stock: 40, disponible: true, marca: 'Sipa', subcategoria: 'Látex', categoria: 'Pinturas', imagen: null },
  { id: 3, codigo: 'PT004', nombre: 'Esmalte sintético 1/4 litro', precio: 4290, unidad: '1/4 L', stock: 0, disponible: false, marca: 'Sipa', subcategoria: 'Esmalte', categoria: 'Pinturas', imagen: null },
  { id: 4, codigo: 'MC001', nombre: 'Cemento Polpaico gris 25 kg', precio: 5990, unidad: 'Saco', stock: 80, disponible: true, marca: 'Polpaico', subcategoria: 'Cementos', categoria: 'Mat. Construcción', imagen: null },
]
const CATEGORIAS_API = [
  { id: 1, nombre: 'Herramientas', etiqueta: 'Herramientas Manuales y Eléctricas' },
  { id: 2, nombre: 'Pinturas', etiqueta: 'Pinturas y Recubrimientos' },
  { id: 3, nombre: 'Mat. Construcción', etiqueta: 'Materiales de Construcción' },
]

beforeEach(() => {
  obtenerProductos.mockResolvedValue(PRODUCTOS_API)
  obtenerCategorias.mockResolvedValue(CATEGORIAS_API)
  obtenerProducto.mockImplementation(async (id) => {
    const producto = PRODUCTOS_API.find((p) => p.id === Number(id))
    if (!producto) throw { response: { status: 404 } }
    return { ...producto, categoriaEtiqueta: 'Materiales de Construcción' }
  })
})

const ADMIN = {
  rut: '11.111.111-1', nombre: 'Administrador General', email: 'admin@losmaestros.cl',
  password: 'admin123', rol: 'Administrador',
}
const CLIENTE = {
  rut: '12.345.678-5', nombre: 'Ana Soto', email: 'ana@correo.cl', password: 'secreto1', rol: 'Cliente',
}

function montar(ruta = '/', { sesion } = {}) {
  if (sesion) localStorage.setItem('usuarioActivo', JSON.stringify(sesion))
  localStorage.setItem('usuarios', JSON.stringify([ADMIN, CLIENTE]))
  return render(
    <MemoryRouter initialEntries={[ruta]}>
      <AuthProvider>
        <CarritoProvider>
          <App />
        </CarritoProvider>
      </AuthProvider>
    </MemoryRouter>,
  )
}

describe('catálogo y carrito', () => {
  it('carga los productos desde la API y filtra por categoría', async () => {
    const user = userEvent.setup()
    montar('/catalogo')
    expect(await screen.findByText(/Mostrando 4 productos/)).toBeInTheDocument()
    await user.click(screen.getByText('Categoría de Productos'))
    await user.click(screen.getByLabelText('Pinturas y Recubrimientos'))
    expect(screen.getByText(/Mostrando 2 productos/)).toBeInTheDocument()
  })

  it('muestra la unidad y deshabilita los productos sin stock', async () => {
    montar('/catalogo')
    expect(await screen.findByText('/ Saco')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Sin Stock' })).toBeDisabled()
  })

  it('si el backend no responde muestra un error y permite reintentar', async () => {
    const user = userEvent.setup()
    obtenerProductos.mockRejectedValueOnce({ request: {} })
    montar('/catalogo')
    expect(await screen.findByText(/No se pudo conectar con el servidor/)).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'Reintentar' }))
    expect(await screen.findByText(/Mostrando 4 productos/)).toBeInTheDocument()
  })

  it('agregar desde el catálogo actualiza el globito y llega al carrito', async () => {
    const user = userEvent.setup()
    montar('/catalogo')
    await user.click((await screen.findAllByRole('button', { name: 'Añadir al Carrito' }))[0])
    expect(screen.getByText('1')).toBeInTheDocument()
    await user.click(screen.getByLabelText('Ver carrito'))
    expect(screen.getByText('Taladro Percutor 710W')).toBeInTheDocument()
  })
})




describe('detalle de producto', () => {
  it('desde el catálogo se abre el detalle del producto', async () => {
    const user = userEvent.setup()
    montar('/catalogo')
    await user.click(await screen.findByRole('link', { name: 'Cemento Polpaico gris 25 kg' }))

    expect(await screen.findByRole('heading', { name: 'Cemento Polpaico gris 25 kg' })).toBeInTheDocument()
    expect(screen.getByText(/Código MC001/)).toBeInTheDocument()
    expect(screen.getByText('Disponible · 80 en stock')).toBeInTheDocument()
  })

  it('agrega el producto al carrito desde el detalle', async () => {
    const user = userEvent.setup()
    montar('/catalogo/4')
    await user.click(await screen.findByRole('button', { name: /Añadir al Carrito/ }))
    expect(screen.getByRole('button', { name: /¡Agregado!/ })).toBeInTheDocument()
    expect(JSON.parse(localStorage.getItem('carrito'))[0].nombre).toBe('Cemento Polpaico gris 25 kg')
  })

  it('muestra un aviso si el producto no existe', async () => {
    montar('/catalogo/999')
    expect(await screen.findByText('Producto no encontrado')).toBeInTheDocument()
  })
})




describe('login de administrador y rutas protegidas', () => {
  it('/admin sin sesión manda al login con aviso', () => {
    montar('/admin')
    expect(screen.getByText(/Acceso denegado/)).toBeInTheDocument()
  })

  it('un cliente no puede entrar a /admin', () => {
    montar('/admin', { sesion: CLIENTE })
    expect(screen.getByText(/Acceso denegado/)).toBeInTheDocument()
  })

  it('el admin entra con su correo y llega al panel', async () => {
    const user = userEvent.setup()
    montar('/login')
    await user.type(screen.getByLabelText('RUT o correo'), 'admin@losmaestros.cl')
    await user.type(screen.getByLabelText('Contraseña', { selector: '#ingreso-password' }), 'admin123')
    await user.click(screen.getByRole('button', { name: 'Entrar' }))
    expect(await screen.findByText('Panel Admin', {}, { timeout: 3000 })).toBeInTheDocument()
  })

  it('rechaza una contraseña incorrecta', async () => {
    const user = userEvent.setup()
    montar('/login')
    await user.type(screen.getByLabelText('RUT o correo'), 'admin@losmaestros.cl')
    await user.type(screen.getByLabelText('Contraseña', { selector: '#ingreso-password' }), 'mala')
    await user.click(screen.getByRole('button', { name: 'Entrar' }))
    expect(screen.getByRole('alert')).toHaveTextContent('Usuario o contraseña incorrectos')
  })
})




describe('registro', () => {
  it('marca en rojo los campos obligatorios vacíos y los limpia al completarlos', async () => {
    const user = userEvent.setup()
    montar('/login')
    await user.click(screen.getByRole('button', { name: 'Crear Cuenta' }))

    expect(screen.getAllByRole('alert').at(-1)).toHaveTextContent('Revisa los campos marcados en rojo')
    const numero = screen.getByLabelText('Número')
    expect(numero).toHaveClass('is-invalid')
    expect(screen.getByText('Ingresa el número')).toBeInTheDocument()
    expect(screen.getByText('Ingresa tu RUT')).toBeInTheDocument()

    await user.type(numero, '867')
    expect(numero).not.toHaveClass('is-invalid')
    expect(screen.queryByText('Ingresa el número')).not.toBeInTheDocument()
  })
})




describe('panel admin: nuevo usuario', () => {
  const abrirFormulario = async (user) => {
    montar('/admin', { sesion: ADMIN })
    await user.click(screen.getByRole('button', { name: /Usuarios/ }))
    await user.click(screen.getByRole('button', { name: '+ Nuevo Usuario' }))
    return within(await screen.findByRole('dialog'))
  }

  it('marca los campos obligatorios y solo ofrece roles de personal', async () => {
    const user = userEvent.setup()
    const modal = await abrirFormulario(user)

    const opciones = modal.getAllByRole('option').map((o) => o.textContent)
    expect(opciones).toEqual(['Selecciona...', 'Administrador', 'Vendedor'])

    await user.click(modal.getByRole('button', { name: 'Crear usuario' }))
    expect(modal.getByText('Elige un rol')).toBeInTheDocument()
    expect(modal.getByLabelText('RUT')).toHaveClass('is-invalid')
  })

  it('crea un vendedor y aparece en la tabla', async () => {
    const user = userEvent.setup()
    const modal = await abrirFormulario(user)

    await user.type(modal.getByLabelText('Nombre completo'), 'Pedro Vendedor')
    await user.type(modal.getByLabelText('RUT'), '222222222')
    await user.type(modal.getByLabelText('Correo electrónico'), 'pedro@losmaestros.cl')
    await user.type(modal.getByLabelText('Contraseña'), 'vende123')
    await user.selectOptions(modal.getByLabelText('Rol'), 'VENDEDOR')
    await user.click(modal.getByRole('button', { name: 'Crear usuario' }))

    expect(await screen.findByText(/Se creó la cuenta de Pedro Vendedor/)).toBeInTheDocument()
    const fila = screen.getByText('pedro@losmaestros.cl').closest('tr')
    expect(fila).toHaveTextContent('22.222.222-2')
    expect(fila).toHaveTextContent('Vendedor')
  })

  it('no permite repetir un correo', async () => {
    const user = userEvent.setup()
    const modal = await abrirFormulario(user)

    await user.type(modal.getByLabelText('Nombre completo'), 'Otro Admin')
    await user.type(modal.getByLabelText('RUT'), '222222222')
    await user.type(modal.getByLabelText('Correo electrónico'), 'admin@losmaestros.cl')
    await user.type(modal.getByLabelText('Contraseña'), 'clave123')
    await user.selectOptions(modal.getByLabelText('Rol'), 'ADMIN')
    await user.click(modal.getByRole('button', { name: 'Crear usuario' }))

    expect(await modal.findByRole('alert')).toHaveTextContent('El email ya esta registrado')
  })
})




describe('Mi cuenta', () => {
  it('sin sesión redirige al login', () => {
    montar('/mi-cuenta')
    expect(screen.getByText('INICIAR SESIÓN / REGISTRO')).toBeInTheDocument()
  })

  it('muestra los datos del usuario y oculta el panel admin a un cliente', () => {
    montar('/mi-cuenta', { sesion: CLIENTE })
    expect(screen.getByRole('heading', { name: 'Ana Soto' })).toBeInTheDocument()
    expect(screen.getByLabelText('RUT')).toBeDisabled()
    expect(screen.queryByRole('link', { name: /Panel Admin/ })).not.toBeInTheDocument()
  })

  it('el admin ve el acceso al panel', () => {
    montar('/mi-cuenta', { sesion: ADMIN })
    expect(screen.getByRole('link', { name: /Panel Admin/ })).toBeInTheDocument()
  })

  it('valida y guarda los datos nuevos (sesión y lista de usuarios)', async () => {
    const user = userEvent.setup()
    montar('/mi-cuenta', { sesion: CLIENTE })
    const nombre = screen.getByLabelText('Nombre completo')

    await user.clear(nombre)
    await user.type(nombre, 'An')
    await user.click(screen.getByRole('button', { name: 'Guardar cambios' }))
    expect(screen.getByRole('alert')).toHaveTextContent('Revisa los campos marcados en rojo')
    expect(nombre).toHaveClass('is-invalid')
    expect(screen.getByText('El nombre debe tener al menos 3 caracteres')).toBeInTheDocument()

    await user.clear(nombre)
    await user.type(nombre, 'Ana María Soto')
    await user.click(screen.getByRole('button', { name: 'Guardar cambios' }))
    expect(screen.getByRole('alert')).toHaveTextContent('se actualizaron correctamente')
    expect(JSON.parse(localStorage.getItem('usuarioActivo')).nombre).toBe('Ana María Soto')
    expect(JSON.parse(localStorage.getItem('usuarios')).find((u) => u.rut === CLIENTE.rut).nombre).toBe('Ana María Soto')
  })

  it('no deja usar el correo de otra cuenta', async () => {
    const user = userEvent.setup()
    montar('/mi-cuenta', { sesion: CLIENTE })
    const correo = screen.getByLabelText('Correo electrónico')
    await user.clear(correo)
    await user.type(correo, 'admin@losmaestros.cl')
    await user.click(screen.getByRole('button', { name: 'Guardar cambios' }))
    expect(screen.getByRole('alert')).toHaveTextContent('Ya existe otra cuenta con ese correo')
  })

  it('cambia la contraseña solo si la actual es correcta y las nuevas coinciden', async () => {
    const user = userEvent.setup()
    montar('/mi-cuenta', { sesion: CLIENTE })
    const tarjeta = within(screen.getByText('Cambiar contraseña').closest('.card'))
    const enviar = () => user.click(tarjeta.getByRole('button', { name: 'Actualizar contraseña' }))

    await user.type(tarjeta.getByLabelText('Contraseña actual'), 'incorrecta')
    await user.type(tarjeta.getByLabelText('Nueva contraseña'), 'nueva123')
    await user.type(tarjeta.getByLabelText('Repetir nueva contraseña'), 'nueva123')
    await enviar()
    expect(tarjeta.getByRole('alert')).toHaveTextContent('La contraseña actual no es correcta')

    await user.clear(tarjeta.getByLabelText('Contraseña actual'))
    await user.type(tarjeta.getByLabelText('Contraseña actual'), 'secreto1')
    await user.clear(tarjeta.getByLabelText('Repetir nueva contraseña'))
    await user.type(tarjeta.getByLabelText('Repetir nueva contraseña'), 'distinta')
    await enviar()
    expect(tarjeta.getByText('Las contraseñas nuevas no coinciden')).toBeInTheDocument()
    expect(tarjeta.getByLabelText('Repetir nueva contraseña')).toHaveClass('is-invalid')

    await user.clear(tarjeta.getByLabelText('Repetir nueva contraseña'))
    await user.type(tarjeta.getByLabelText('Repetir nueva contraseña'), 'nueva123')
    await enviar()
    expect(tarjeta.getByRole('alert')).toHaveTextContent('actualizada correctamente')
    expect(JSON.parse(localStorage.getItem('usuarioActivo')).password).toBe('nueva123')
  })

  it('lista solo los pedidos del usuario, el más reciente primero', () => {
    localStorage.setItem('pedidos', JSON.stringify([
      { id: '1111', cliente: 'Ana Soto', rut: CLIENTE.rut, tipoPago: 'Crédito', tipoEntrega: 'Retiro en tienda', total: 10000, estado: 'Pendiente' },
      { id: '2222', cliente: 'Otra Persona', rut: '9.999.999-9', tipoPago: 'Crédito', tipoEntrega: 'Retiro en tienda', total: 5000, estado: 'Pendiente' },
      { id: '3333', cliente: 'Ana Soto', rut: CLIENTE.rut, tipoPago: 'Cuenta Corriente', tipoEntrega: 'Despacho a domicilio', total: 25000, estado: 'Pendiente' },
    ]))
    montar('/mi-cuenta', { sesion: CLIENTE })
    const filas = screen.getAllByRole('row').slice(1)
    expect(filas).toHaveLength(2)
    expect(filas[0]).toHaveTextContent('#PED-3333')
    expect(filas[1]).toHaveTextContent('#PED-1111')
    expect(screen.queryByText('#PED-2222')).not.toBeInTheDocument()
  })

  it('cerrar sesión borra la sesión y vuelve al inicio', async () => {
    const user = userEvent.setup()
    montar('/mi-cuenta', { sesion: CLIENTE })
    await user.click(screen.getByRole('button', { name: /Cerrar sesión/ }))
    expect(localStorage.getItem('usuarioActivo')).toBeNull()
    expect(await screen.findByText(/Construye tus proyectos/)).toBeInTheDocument()
  })
})
