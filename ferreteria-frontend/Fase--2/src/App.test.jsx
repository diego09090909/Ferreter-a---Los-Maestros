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




describe('panel admin: editar y eliminar usuarios', () => {
  const VENDEDOR = {
    rut: '22.222.222-2', nombre: 'Pedro Vendedor', email: 'pedro@losmaestros.cl', password: 'vende123', rol: 'Vendedor',
  }
  const OTRO_ADMIN = {
    rut: '33.333.333-3', nombre: 'Laura Admin', email: 'laura@losmaestros.cl', password: 'laura123', rol: 'Administrador',
  }
  const abrirUsuarios = async (user, sesion = ADMIN) => {
    montar('/admin', { sesion })
    localStorage.setItem('usuarios', JSON.stringify([ADMIN, CLIENTE, VENDEDOR, OTRO_ADMIN]))
    await user.click(screen.getByRole('button', { name: /Usuarios/ }))
  }
  const usuarioGuardado = (rut) => JSON.parse(localStorage.getItem('usuarios')).find((u) => u.rut === rut)

  it('cambia el rol de una cuenta de personal y solo ofrece Administrador o Vendedor', async () => {
    const user = userEvent.setup()
    await abrirUsuarios(user)

    await user.click(screen.getByRole('button', { name: 'Editar a Pedro Vendedor' }))
    const modal = within(await screen.findByRole('dialog'))
    expect(modal.getByLabelText('RUT')).toBeDisabled()
    expect(modal.getAllByRole('option').map((o) => o.textContent)).toEqual(['Administrador', 'Vendedor'])

    await user.selectOptions(modal.getByLabelText('Rol'), 'ADMIN')
    await user.click(modal.getByRole('button', { name: 'Guardar cambios' }))

    expect(await screen.findByText(/Se actualizó la cuenta de Pedro Vendedor/)).toBeInTheDocument()
    expect(screen.getByText('pedro@losmaestros.cl').closest('tr')).toHaveTextContent('Administrador')
    expect(usuarioGuardado(VENDEDOR.rut).rol).toBe('Administrador')
  })

  it('los datos de un cliente no se editan desde el panel, solo se puede eliminar la cuenta', async () => {
    const user = userEvent.setup()
    await abrirUsuarios(user)

    expect(screen.queryByRole('button', { name: 'Editar a Ana Soto' })).not.toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Eliminar a Ana Soto' })).toBeInTheDocument()
  })

  it('otro admin no puede editar ni eliminar la cuenta principal', async () => {
    const user = userEvent.setup()
    await abrirUsuarios(user, OTRO_ADMIN)

    const fila = screen.getByText('admin@losmaestros.cl').closest('tr')
    expect(fila).toHaveTextContent('Principal')
    expect(fila).toHaveTextContent('Sin acciones')
    expect(screen.queryByRole('button', { name: 'Editar a Administrador General' })).not.toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Eliminar a Administrador General' })).not.toBeInTheDocument()
    // al resto del personal si lo puede gestionar
    expect(screen.getByRole('button', { name: 'Editar a Pedro Vendedor' })).toBeInTheDocument()
  })

  it('en su propia cuenta el admin no puede eliminarse ni cambiar su rol', async () => {
    const user = userEvent.setup()
    await abrirUsuarios(user)

    expect(screen.queryByRole('button', { name: 'Eliminar a Administrador General' })).not.toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'Editar a Administrador General' }))
    const modal = within(await screen.findByRole('dialog'))
    expect(modal.getByLabelText('Rol')).toBeDisabled()
    expect(modal.getByText('No puedes cambiar el rol de tu propia cuenta.')).toBeInTheDocument()
  })

  it('no deja usar el correo de otra cuenta', async () => {
    const user = userEvent.setup()
    await abrirUsuarios(user)

    await user.click(screen.getByRole('button', { name: 'Editar a Pedro Vendedor' }))
    const modal = within(await screen.findByRole('dialog'))
    const correo = modal.getByLabelText('Correo electrónico')
    await user.clear(correo)
    await user.type(correo, 'admin@losmaestros.cl')
    await user.click(modal.getByRole('button', { name: 'Guardar cambios' }))

    expect(await modal.findByRole('alert')).toHaveTextContent('El email ya esta registrado')
    expect(usuarioGuardado(VENDEDOR.rut).email).toBe('pedro@losmaestros.cl')
  })

  it('elimina una cuenta solo después de confirmar, junto con sus direcciones', async () => {
    const user = userEvent.setup()
    await abrirUsuarios(user)
    localStorage.setItem('direcciones', JSON.stringify({ [CLIENTE.rut]: [{ id: 1, calle: 'Balmaceda' }] }))

    await user.click(screen.getByRole('button', { name: 'Eliminar a Ana Soto' }))
    expect(screen.getByText('¿Eliminar a Ana Soto?')).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: 'No' }))
    expect(screen.getByText('ana@correo.cl')).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'Eliminar a Ana Soto' }))
    await user.click(screen.getByRole('button', { name: 'Sí, eliminar' }))

    expect(await screen.findByText('Se eliminó la cuenta de Ana Soto.')).toBeInTheDocument()
    expect(screen.queryByText('ana@correo.cl')).not.toBeInTheDocument()
    expect(usuarioGuardado(CLIENTE.rut)).toBeUndefined()
    expect(JSON.parse(localStorage.getItem('direcciones'))).toEqual({})
  })
})

describe('panel del vendedor', () => {
  const VENDEDOR = {
    rut: '22.222.222-2', nombre: 'Pedro Vendedor', email: 'pedro@losmaestros.cl', password: 'vende123', rol: 'Vendedor',
  }
  const PEDIDO = {
    id: '2715', cliente: 'Ana Soto', email: 'ana@correo.cl', rut: CLIENTE.rut,
    tipoPago: 'Crédito', tipoEntrega: 'Despacho a domicilio',
    direccionEntrega: { calle: 'Balmaceda', numero: '123', departamento: '', comuna: 'La Serena', region: 'Región de Coquimbo' },
    items: [{ nombre: 'Cemento Polpaico gris 25 kg', cantidad: 2, precio: 5990 }],
    subtotal: 11980, costoDespacho: 3990, total: 15970, estado: 'Pendiente',
  }

  it('el vendedor inicia sesión y llega a su panel', async () => {
    const user = userEvent.setup()
    montar('/login')
    localStorage.setItem('usuarios', JSON.stringify([ADMIN, CLIENTE, VENDEDOR]))
    await user.type(screen.getByLabelText('RUT o correo'), 'pedro@losmaestros.cl')
    await user.type(screen.getByLabelText('Contraseña', { selector: '#ingreso-password' }), 'vende123')
    await user.click(screen.getByRole('button', { name: 'Entrar' }))
    expect(await screen.findByRole('heading', { name: 'Panel Vendedor' }, { timeout: 3000 })).toBeInTheDocument()
  })

  it('solo ve Pedidos e Inventario: no ve Usuarios ni Ventas', () => {
    montar('/admin', { sesion: VENDEDOR })
    expect(screen.getByRole('heading', { name: 'Panel Vendedor' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Pedidos/ })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Inventario/ })).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: /Usuarios/ })).not.toBeInTheDocument()
    expect(screen.queryByRole('button', { name: /Ventas/ })).not.toBeInTheDocument()
  })

  it('el admin sigue viendo las cuatro secciones', () => {
    montar('/admin', { sesion: ADMIN })
    expect(screen.getByRole('heading', { name: 'Panel Admin' })).toBeInTheDocument()
    for (const seccion of [/Pedidos/, /Usuarios/, /Inventario/, /Ventas/]) {
      expect(screen.getByRole('button', { name: seccion })).toBeInTheDocument()
    }
  })

  it('ve el detalle de un pedido con sus productos y la dirección', async () => {
    const user = userEvent.setup()
    localStorage.setItem('pedidos', JSON.stringify([PEDIDO]))
    montar('/admin', { sesion: VENDEDOR })

    await user.click(screen.getByRole('button', { name: 'Ver detalle del pedido #PED-2715' }))
    const modal = await screen.findByRole('dialog')
    expect(modal).toHaveTextContent('Pedido #PED-2715')
    expect(modal).toHaveTextContent('2 x Cemento Polpaico gris 25 kg')
    expect(modal).toHaveTextContent('Balmaceda 123, La Serena')
    expect(modal).toHaveTextContent(/Total\s*\$15\.970/)
  })

  it('ve el detalle de un producto desde Inventario', async () => {
    const user = userEvent.setup()
    montar('/admin', { sesion: VENDEDOR })

    await user.click(screen.getByRole('button', { name: /Inventario/ }))
    await user.click(await screen.findByRole('button', { name: 'Ver detalle de Taladro Percutor 710W' }))
    const modal = await screen.findByRole('dialog')
    expect(modal).toHaveTextContent('Bauker')
    expect(modal).toHaveTextContent('$49.990')
  })
})

describe('inventario del panel', () => {
  const VENDEDOR = {
    rut: '22.222.222-2', nombre: 'Pedro Vendedor', email: 'pedro@losmaestros.cl', password: 'vende123', rol: 'Vendedor',
  }
  const abrirInventario = async (user, sesion = ADMIN) => {
    montar('/admin', { sesion })
    await user.click(screen.getByRole('button', { name: /Inventario/ }))
  }
  const stockGuardado = (nombre) => JSON.parse(localStorage.getItem('productos')).find((p) => p.nombre === nombre).stock

  it('muestra un solo stock por producto (tienda y bodega juntos) con su stock mínimo', async () => {
    const user = userEvent.setup()
    await abrirInventario(user)

    const fila = (await screen.findByText('Taladro Percutor 710W')).closest('tr')
    expect(within(fila).getByText('30')).toBeInTheDocument()
    expect(within(fila).getByText('5')).toBeInTheDocument()
    expect(fila).toHaveTextContent('Disponible')
  })

  it('el admin repone stock y queda guardado', async () => {
    const user = userEvent.setup()
    await abrirInventario(user)

    await user.click(await screen.findByRole('button', { name: 'Reponer stock de Taladro Percutor 710W' }))
    const modal = within(await screen.findByRole('dialog'))
    await user.type(modal.getByLabelText('Cantidad que llegó'), '5')
    expect(modal.getByText(/Quedará en 35 unidades/)).toBeInTheDocument()
    await user.click(modal.getByRole('button', { name: 'Reponer' }))

    expect(await screen.findByText(/Se repusieron 5 unidades de Taladro Percutor 710W/)).toBeInTheDocument()
    expect(screen.getByText('Taladro Percutor 710W').closest('tr')).toHaveTextContent('35')
    expect(stockGuardado('Taladro Percutor 710W')).toBe(35)
  })

  it('el admin ajusta al stock contado y el producto queda con stock bajo', async () => {
    const user = userEvent.setup()
    await abrirInventario(user)

    await user.click(await screen.findByRole('button', { name: 'Ajustar stock de Sierra Circular 1400W' }))
    const modal = within(await screen.findByRole('dialog'))
    await user.type(modal.getByLabelText('Stock contado'), '3')
    await user.click(modal.getByRole('button', { name: 'Guardar ajuste' }))

    expect(await screen.findByText(/Stock ajustado a 3 unidades de Sierra Circular 1400W/)).toBeInTheDocument()
    expect(stockGuardado('Sierra Circular 1400W')).toBe(3)

    await user.click(screen.getByLabelText(/Ver solo productos con stock bajo/))
    expect(screen.getByText('Sierra Circular 1400W').closest('tr')).toHaveTextContent('Stock bajo')
    expect(screen.queryByText('Taladro Percutor 710W')).not.toBeInTheDocument()
  })

  it('valida la cantidad: reponer al menos 1 y el ajuste distinto al stock actual', async () => {
    const user = userEvent.setup()
    await abrirInventario(user)

    await user.click(await screen.findByRole('button', { name: 'Reponer stock de Taladro Percutor 710W' }))
    let modal = within(await screen.findByRole('dialog'))
    await user.type(modal.getByLabelText('Cantidad que llegó'), '0')
    await user.click(modal.getByRole('button', { name: 'Reponer' }))
    expect(modal.getByText('La cantidad debe ser al menos 1')).toBeInTheDocument()
    await user.click(modal.getByRole('button', { name: 'Cancelar' }))

    await user.click(screen.getByRole('button', { name: 'Ajustar stock de Taladro Percutor 710W' }))
    modal = within(await screen.findByRole('dialog'))
    await user.type(modal.getByLabelText('Stock contado'), '30')
    await user.click(modal.getByRole('button', { name: 'Guardar ajuste' }))
    expect(modal.getByText('El stock contado es igual al actual')).toBeInTheDocument()
    expect(stockGuardado('Taladro Percutor 710W')).toBe(30)
  })

  it('el vendedor ve el inventario pero no puede mover stock', async () => {
    const user = userEvent.setup()
    await abrirInventario(user, VENDEDOR)

    expect(await screen.findByRole('button', { name: 'Ver detalle de Taladro Percutor 710W' })).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: /Reponer stock/ })).not.toBeInTheDocument()
    expect(screen.queryByRole('button', { name: /Ajustar stock/ })).not.toBeInTheDocument()
    expect(screen.queryByRole('button', { name: /Editar producto/ })).not.toBeInTheDocument()
    expect(screen.queryByRole('button', { name: '+ Nuevo producto' })).not.toBeInTheDocument()
  })
})

describe('inventario: crear y editar productos', () => {
  const TALADRO = {
    id: 1, codigo: 'HE001', nombre: 'Taladro percutor 650W 13mm', descripcion: '', categoriaId: 1, categoria: 'Herramientas',
    subcategoria: 'Eléctricas', marca: 'Makita', unidad: 'Unidad', precioCompra: 32000, precio: 49990, stock: 10, stockMinimo: 5, imagen: null,
  }
  const abrirInventario = async (user) => {
    localStorage.setItem('productos', JSON.stringify([TALADRO]))
    montar('/admin', { sesion: ADMIN })
    await user.click(screen.getByRole('button', { name: /Inventario/ }))
    await screen.findByText('Taladro percutor 650W 13mm')
  }
  const productosGuardados = () => JSON.parse(localStorage.getItem('productos'))
  const escribir = async (user, modal, etiqueta, texto) => {
    const campo = modal.getByLabelText(etiqueta)
    await user.clear(campo)
    await user.type(campo, texto)
  }

  it('crea un producto con las mismas reglas que ms-catalogo', async () => {
    const user = userEvent.setup()
    await abrirInventario(user)

    await user.click(screen.getByRole('button', { name: '+ Nuevo producto' }))
    const modal = within(await screen.findByRole('dialog'))
    await user.click(modal.getByRole('button', { name: 'Crear producto' }))
    expect(modal.getByText('Ingresa el código')).toBeInTheDocument()
    expect(modal.getByText('Elige una categoría')).toBeInTheDocument()

    await escribir(user, modal, 'Código', 'he007')
    await escribir(user, modal, 'Nombre', 'Taladro inalámbrico 18V')
    await user.selectOptions(modal.getByLabelText('Categoría'), 'Herramientas')
    await escribir(user, modal, 'Subcategoría', 'Eléctricas')
    await escribir(user, modal, 'Unidad', 'Unidad')
    await escribir(user, modal, 'Precio de compra', '30000')
    await escribir(user, modal, 'Precio de venta', '25000')
    await escribir(user, modal, 'Stock inicial', '12')
    await escribir(user, modal, 'Stock mínimo', '3')
    await user.click(modal.getByRole('button', { name: 'Crear producto' }))
    expect(modal.getByText('El precio de venta debe ser mayor al de compra', { selector: '.invalid-feedback, [id$="-error"]' })).toBeInTheDocument()

    await escribir(user, modal, 'Precio de venta', '45990')
    expect(modal.getByText('Margen por unidad: $15.990')).toBeInTheDocument()
    await user.click(modal.getByRole('button', { name: 'Crear producto' }))

    expect(await screen.findByText('Se creó el producto Taladro inalámbrico 18V.')).toBeInTheDocument()
    expect(screen.getByText('Taladro inalámbrico 18V').closest('tr')).toHaveTextContent('12')
    expect(productosGuardados().find((p) => p.codigo === 'HE007')).toMatchObject({ categoriaId: 1, categoria: 'Herramientas', precio: 45990, stock: 12 })
  })

  it('no deja repetir un código', async () => {
    const user = userEvent.setup()
    await abrirInventario(user)

    await user.click(screen.getByRole('button', { name: '+ Nuevo producto' }))
    const modal = within(await screen.findByRole('dialog'))
    await escribir(user, modal, 'Código', 'HE001')
    await escribir(user, modal, 'Nombre', 'Otro taladro')
    await user.selectOptions(modal.getByLabelText('Categoría'), 'Herramientas')
    await escribir(user, modal, 'Subcategoría', 'Eléctricas')
    await escribir(user, modal, 'Unidad', 'Unidad')
    await escribir(user, modal, 'Precio de compra', '30000')
    await escribir(user, modal, 'Precio de venta', '45990')
    await escribir(user, modal, 'Stock inicial', '5')
    await escribir(user, modal, 'Stock mínimo', '2')
    await user.click(modal.getByRole('button', { name: 'Crear producto' }))

    expect(await modal.findByRole('alert')).toHaveTextContent('Ya existe un producto con el codigo HE001')
    expect(productosGuardados()).toHaveLength(1)
  })

  it('edita el precio de un producto sin tocar su stock', async () => {
    const user = userEvent.setup()
    await abrirInventario(user)

    await user.click(screen.getByRole('button', { name: 'Editar producto Taladro percutor 650W 13mm' }))
    const modal = within(await screen.findByRole('dialog'))
    expect(modal.getByLabelText('Código')).toHaveValue('HE001')
    expect(modal.getByLabelText('Stock actual')).toBeDisabled()

    await escribir(user, modal, 'Precio de venta', '52990')
    await user.click(modal.getByRole('button', { name: 'Guardar cambios' }))

    expect(await screen.findByText('Se actualizó el producto Taladro percutor 650W 13mm.')).toBeInTheDocument()
    expect(productosGuardados()[0]).toMatchObject({ precio: 52990, stock: 10 })
  })
})

describe('direcciones guardadas', () => {
  const DIRECCIONES_ANA = {
    [CLIENTE.rut]: [
      { id: 1, alias: 'Casa', calle: 'Av. Francisco de Aguirre', numero: '1450', departamento: '', comuna: 'La Serena', region: 'Región de Coquimbo', indicaciones: '', predeterminada: true },
      { id: 2, alias: 'Obra', calle: 'Los Carrera', numero: '380', departamento: '', comuna: 'Ovalle', region: 'Región de Coquimbo', indicaciones: '', predeterminada: false },
    ],
  }

  const llenarDireccion = async (user, contenedor, { calle, numero, comuna }) => {
    await user.type(contenedor.getByLabelText('Calle'), calle)
    await user.type(contenedor.getByLabelText('Número'), numero)
    await user.selectOptions(contenedor.getByLabelText('Comuna'), comuna)
  }

  it('agrega direcciones en Mi Cuenta y la primera queda predeterminada', async () => {
    const user = userEvent.setup()
    montar('/mi-cuenta', { sesion: CLIENTE })
    const seccion = within(screen.getByRole('region', { name: 'Mis direcciones' }))
    expect(seccion.getByText('Aún no tienes direcciones guardadas.')).toBeInTheDocument()

    await user.click(seccion.getByRole('button', { name: '+ Agregar dirección' }))
    await user.type(seccion.getByLabelText('Nombre de la dirección (opcional)'), 'Casa')
    await llenarDireccion(user, seccion, { calle: 'Balmaceda', numero: '120', comuna: 'Coquimbo' })
    await user.click(seccion.getByRole('button', { name: 'Guardar dirección' }))

    expect(await seccion.findByText('Casa')).toBeInTheDocument()
    expect(seccion.getByText('Predeterminada')).toBeInTheDocument()
    expect(seccion.getByText('Balmaceda 120, Coquimbo, Región de Coquimbo')).toBeInTheDocument()
  })

  it('cambia la predeterminada y elimina con confirmación', async () => {
    const user = userEvent.setup()
    localStorage.setItem('direcciones', JSON.stringify(DIRECCIONES_ANA))
    montar('/mi-cuenta', { sesion: CLIENTE })
    const seccion = within(screen.getByRole('region', { name: 'Mis direcciones' }))

    await user.click(await seccion.findByRole('button', { name: 'Usar como predeterminada' }))
    const items = await seccion.findAllByRole('listitem')
    expect(items[0]).toHaveTextContent('Obra')
    expect(items[0]).toHaveTextContent('Predeterminada')

    await user.click(within(items[0]).getByRole('button', { name: 'Eliminar' }))
    await user.click(within(items[0]).getByRole('button', { name: 'Sí, eliminar' }))
    const restantes = await seccion.findAllByRole('listitem')
    expect(restantes).toHaveLength(1)
    expect(restantes[0]).toHaveTextContent('Casa')
    expect(restantes[0]).toHaveTextContent('Predeterminada')
  })

  it('en el carrito viene marcada la predeterminada y el despacho usa su comuna', async () => {
    const user = userEvent.setup()
    localStorage.setItem('direcciones', JSON.stringify(DIRECCIONES_ANA))
    localStorage.setItem('carrito', JSON.stringify([{ codigo: 'producto-4', nombre: 'Cemento', precio: 5990, imagen: null, cantidad: 2 }]))
    montar('/carrito', { sesion: CLIENTE })

    await user.selectOptions(screen.getByLabelText('Tipo de entrega'), 'Despacho a domicilio')
    expect(await screen.findByLabelText(/Casa/)).toBeChecked()
    expect(screen.getByText('$3.990')).toBeInTheDocument()

    await user.click(screen.getByLabelText(/Obra/))
    expect(screen.getByText('$11.990')).toBeInTheDocument()

    await user.click(screen.getByLabelText('Usar una dirección nueva'))
    expect(screen.getByLabelText('Calle')).toBeInTheDocument()
    expect(screen.getByLabelText('Guardar esta dirección en mi cuenta')).toBeInTheDocument()
  })

  it('la dirección del registro queda guardada como predeterminada', async () => {
    const user = userEvent.setup()
    montar('/login')
    await user.type(screen.getByLabelText('Nombre completo'), 'Luis Pérez')
    await user.type(screen.getByLabelText('RUT', { selector: '#registro-rut' }), '222222222')
    await user.type(screen.getByLabelText('Correo electrónico'), 'luis@correo.cl')
    await user.type(screen.getByLabelText('Contraseña', { selector: '#registro-password' }), 'clave123')
    const formulario = within(screen.getByRole('button', { name: 'Crear Cuenta' }).closest('form'))
    await llenarDireccion(user, formulario, { calle: 'Cordovez', numero: '55', comuna: 'La Serena' })
    await user.click(screen.getByRole('button', { name: 'Crear Cuenta' }))

    expect(await screen.findByText(/Cuenta creada correctamente/)).toBeInTheDocument()
    const guardadas = JSON.parse(localStorage.getItem('direcciones'))['22.222.222-2']
    expect(guardadas).toHaveLength(1)
    expect(guardadas[0]).toMatchObject({ alias: 'Principal', calle: 'Cordovez', numero: '55', predeterminada: true })
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
