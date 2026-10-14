import { describe, expect, it } from 'vitest'
import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import App from './App'
import { AuthProvider } from './context/AuthContext'
import { CarritoProvider } from './context/CarritoContext'

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
  it('muestra 16 productos y filtra por categoría', async () => {
    const user = userEvent.setup()
    montar('/catalogo')
    expect(screen.getByText(/Mostrando 16 productos/)).toBeInTheDocument()
    await user.click(screen.getByText('Categoría de Productos'))
    await user.click(screen.getByLabelText('Pinturas'))
    expect(screen.getByText(/Mostrando 3 productos/)).toBeInTheDocument()
  })

  it('agregar desde el catálogo actualiza el globito y llega al carrito', async () => {
    const user = userEvent.setup()
    montar('/catalogo')
    await user.click(screen.getAllByRole('button', { name: 'Añadir al Carrito' })[0])
    expect(screen.getByText('1')).toBeInTheDocument()
    await user.click(screen.getByLabelText('Ver carrito'))
    expect(screen.getByText('Taladro Percutor 710W')).toBeInTheDocument()
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
    expect(screen.getByRole('alert')).toHaveTextContent('La contraseña no es correcta')
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
    expect(screen.getByRole('alert')).toHaveTextContent('al menos 3 caracteres')

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
    expect(tarjeta.getByRole('alert')).toHaveTextContent('no coinciden')

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
