import { useState } from 'react'
import { Container, Table, Form, Button, Alert, Row, Col } from 'react-bootstrap'
import FormularioDireccion from '../components/FormularioDireccion'
import { useCarrito } from '../context/CarritoContext'
import { useAuth } from '../context/AuthContext'
import { useNavigate } from 'react-router-dom'
import { leer, guardar } from '../utils/storage'
import { obtenerProductos } from '../data/almacen'
import {
    ENTREGA_DOMICILIO,
    OPCIONES_ENTREGA,
    OPCIONES_PAGO,
    CANTIDAD_MINIMA,
    CANTIDAD_MAXIMA,
    hayCantidadInvalida,
    registrarCompra,
} from '../utils/carrito'
import { DIRECCION_VACIA, errorDireccion, limpiarDireccion, textoDireccion } from '../utils/direccion'
import { correoValido, nombreValido } from '../utils/validaciones'

function dinero(valor) {
    return '$' + valor.toLocaleString('es-CL')
}

// Al cambiar de usuario o cerrar sesión la página se reinicia, para no dejar
// a la vista los datos de otra persona.
export default function Carrito() {
    const { usuario } = useAuth()
    return <PaginaCarrito key={usuario ? usuario.rut : 'sin-sesion'} />
}

function PaginaCarrito() {
    const { carrito, total, cambiarCantidad, eliminar, vaciar } = useCarrito()
    const { usuario, actualizarUsuario } = useAuth()
    const navigate = useNavigate()

    const [entrega, setEntrega] = useState('')
    const [pago, setPago] = useState('')
    const [mensaje, setMensaje] = useState(null)


    const [datosCliente, setDatosCliente] = useState(() => ({
        nombre: usuario?.nombre ?? '',
        email: usuario?.email ?? '',
    }))
    const [direccion, setDireccion] = useState(() => ({ ...DIRECCION_VACIA, ...usuario?.direccion }))
    const [guardarEnCuenta, setGuardarEnCuenta] = useState(false)
    const tieneDireccionGuardada = Boolean(usuario?.direccion?.calle)

    function confirmar() {
        if (!usuario) {
            setMensaje({
                tipo: 'danger',
                texto: 'Debes iniciar sesión para poder finalizar tu compra. Redirigiendo al login...'
            })
            
        setTimeout(() => {
            navigate('/login')
        }, 2500)
        return
        }
        
        if (carrito.length === 0) {
            return setMensaje({ tipo: 'danger', texto: 'El carrito está vacío.' })
        }

        if (hayCantidadInvalida(carrito)) {
            return setMensaje({
                tipo: 'danger',
                texto: `Las cantidades deben estar entre ${CANTIDAD_MINIMA} y ${CANTIDAD_MAXIMA}.`,
            })
        }

        if (!entrega) {
            return setMensaje({ tipo: 'danger', texto: 'Elige un tipo de entrega.' })
        }

        if (!pago) {
            return setMensaje({ tipo: 'danger', texto: 'Elige un medio de pago.' })
        }

        if (!nombreValido(datosCliente.nombre)) {
            return setMensaje({ tipo: 'danger', texto: 'El nombre debe tener al menos 3 caracteres.' })
        }

        if (!correoValido(datosCliente.email)) {
            return setMensaje({ tipo: 'danger', texto: 'El correo no tiene un formato válido.' })
        }

        // la dirección solo se pide (y se guarda en el pedido) si hay despacho a domicilio
        const conDespacho = entrega === ENTREGA_DOMICILIO
        const errorDeDireccion = conDespacho ? errorDireccion(direccion) : null

        if (errorDeDireccion) {
            return setMensaje({ tipo: 'danger', texto: errorDeDireccion + '.' })
        }

        const direccionFinal = conDespacho ? limpiarDireccion(direccion) : undefined

        const resultado = registrarCompra({
            carrito,
            productos: obtenerProductos(),
            usuario,
            entrega,
            pago,
            cliente: { nombre: datosCliente.nombre.trim(), email: datosCliente.email.trim() },
            direccion: direccionFinal,
        })

        guardar('productos', resultado.productos)
        guardar('pedidos', [...leer('pedidos', []), resultado.pedido])
        guardar('ventas', [...leer('ventas', []), resultado.venta])

        if (conDespacho && guardarEnCuenta) {
            actualizarUsuario({ direccion: direccionFinal })
        }

        const destino = conDespacho
            ? ` Se despachará a ${textoDireccion(direccionFinal)}.`
            : ' Puedes retirar tu pedido en la tienda.'

        vaciar()
        setEntrega('')
        setPago('')
        setGuardarEnCuenta(false)
        setMensaje({
            tipo: 'success',
            texto: `Compra realizada con éxito. Pedido #${resultado.pedido.id}.${destino}`,
        })
    }

    return (
        <Container as="main" className="my-4">
            <h1 className="h3 mb-4">Carrito de compras</h1>

            <div className="table-responsive">
                <Table striped align="middle">
                    <thead>
                        <tr>
                            <th>Producto</th>
                            <th>Precio</th>
                            <th style={{ width: '120px' }}>Cantidad</th>
                            <th>Subtotal</th>
                            <th></th>
                        </tr>
                    </thead>
                    <tbody>
                        {carrito.length === 0 && (
                            <tr>
                                <td colSpan={5} className="text-center text-muted">
                                    No hay productos en el carrito.
                                </td>
                            </tr>
                        )}

                        {carrito.map((item) => (
                            <tr key={item.codigo}>
                                <td>{item.nombre}</td>
                                <td>{dinero(item.precio)}</td>
                                <td>
                                    <Form.Control
                                        type="number"
                                        min={CANTIDAD_MINIMA}
                                        max={CANTIDAD_MAXIMA}
                                        value={item.cantidad}
                                        onChange={(e) =>
                                            cambiarCantidad(item.codigo, Number(e.target.value))
                                        }
                                    />
                                </td>
                                <td>{dinero(item.precio * item.cantidad)}</td>
                                <td>
                                    <Button
                                        variant="outline-danger"
                                        size="sm"
                                        onClick={() => eliminar(item.codigo)}
                                    >
                                        Quitar
                                    </Button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </Table>
            </div>

            <p className="fs-5 text-end">
                Total: <strong>{dinero(total)}</strong>
            </p>

            <h2 className="h5 mt-4">Datos del cliente</h2>
            <p className="text-muted small">
                {usuario
                    ? 'Completamos tus datos con los de tu cuenta. Puedes cambiarlos para este pedido.'
                    : 'Inicia sesión para completar tus datos automáticamente.'}
            </p>
            <Row className="g-3 mb-4">
                <Col md={6}>
                    <Form.Label htmlFor="cliente-nombre">Nombre completo</Form.Label>
                    <Form.Control
                        id="cliente-nombre"
                        value={datosCliente.nombre}
                        onChange={(e) => setDatosCliente({ ...datosCliente, nombre: e.target.value })}
                    />
                </Col>
                <Col md={6}>
                    <Form.Label htmlFor="cliente-email">Correo electrónico</Form.Label>
                    <Form.Control
                        id="cliente-email"
                        type="email"
                        value={datosCliente.email}
                        onChange={(e) => setDatosCliente({ ...datosCliente, email: e.target.value })}
                    />
                </Col>
            </Row>

            <Row className="g-3">
                <Col md={6}>
                    <Form.Label htmlFor="entrega">Tipo de entrega</Form.Label>
                    <Form.Select id="entrega" value={entrega} onChange={(e) => setEntrega(e.target.value)}>
                        <option value="">Selecciona...</option>
                        {OPCIONES_ENTREGA.map((opcion) => (
                            <option key={opcion} value={opcion}>{opcion}</option>
                        ))}
                    </Form.Select>
                </Col>
                <Col md={6}>
                    <Form.Label htmlFor="pago">Medio de pago</Form.Label>
                    <Form.Select id="pago" value={pago} onChange={(e) => setPago(e.target.value)}>
                        <option value="">Selecciona...</option>
                        {OPCIONES_PAGO.map((opcion) => (
                            <option key={opcion} value={opcion}>{opcion}</option>
                        ))}
                    </Form.Select>
                </Col>
            </Row>

            {entrega === ENTREGA_DOMICILIO && (
                <section className="mt-4" aria-labelledby="titulo-direccion">
                    <h2 id="titulo-direccion" className="h5">Dirección de entrega</h2>
                    <p className="text-muted small">
                        {tieneDireccionGuardada
                            ? 'Usamos la dirección de tu cuenta. Puedes modificarla para este pedido.'
                            : 'Completa la dirección donde quieres recibir tu pedido.'}
                    </p>

                    <FormularioDireccion prefijo="entrega-dir" valor={direccion} onChange={setDireccion} />

                    <Form.Check
                        id="guardar-direccion"
                        type="checkbox"
                        label="Guardar esta dirección en mi cuenta"
                        checked={guardarEnCuenta}
                        onChange={(e) => setGuardarEnCuenta(e.target.checked)}
                    />
                </section>
            )}

            <Button variant="success" className="mt-4" onClick={confirmar}>
                Confirmar compra
            </Button>

            {mensaje && (
                <Alert variant={mensaje.tipo} className="mt-4">
                    {mensaje.texto}
                </Alert>
            )}
        </Container>
    )
}