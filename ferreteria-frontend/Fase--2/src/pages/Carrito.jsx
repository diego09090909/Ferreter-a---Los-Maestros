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
import { completarDireccion, erroresDireccion, limpiarDireccion, textoDireccion } from '../utils/direccion'
import { costoDespacho, faltaParaDespachoGratis } from '../utils/despacho'
import { formatearPrecio } from '../utils/formato'
import { enfocarPrimerError, erroresDatos, hayErrores } from '../utils/validaciones'


function rutaImagen(item, catalogo) {
    const producto = catalogo.find((p) => `producto-${p.id}` === item.codigo)
    const origen = item.imagen ?? producto?.imagen

    if (!origen) return null
    if (/^(https?:|data:|\/)/.test(origen)) return origen

    return '/imagenes/' + origen.replace(/^(\.\/)?(public\/)?(imagenes\/)?/, '')
}

function textoEnvio(entrega, conDespacho, comuna, envio) {
    if (!entrega) return 'Elige el tipo de entrega'
    if (!conDespacho) return 'Gratis (retiro en tienda)'
    if (!comuna) return 'Elige la comuna'
    if (envio === null) return 'Sin cobertura en esa comuna'
    if (envio === 0) return 'Gratis'
    return formatearPrecio(envio)
}


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

    const catalogo = obtenerProductos()

    const [datosCliente, setDatosCliente] = useState(() => ({
        nombre: usuario?.nombre ?? '',
        email: usuario?.email ?? '',
    }))
    const [direccion, setDireccion] = useState(() => completarDireccion(usuario?.direccion))
    const [guardarEnCuenta, setGuardarEnCuenta] = useState(false)
    const tieneDireccionGuardada = Boolean(usuario?.direccion?.calle)
    const conDespacho = entrega === ENTREGA_DOMICILIO
    const envio = conDespacho ? costoDespacho(direccion.comuna, total) : 0
    const totalAPagar = total + (envio ?? 0)
    const faltaGratis = conDespacho ? faltaParaDespachoGratis(direccion.comuna, total) : 0
    const [intento, setIntento] = useState(false)
    const erroresCompra = {
        ...erroresDatos(datosCliente),
        ...(entrega ? {} : { entrega: 'Elige un tipo de entrega' }),
        ...(pago ? {} : { pago: 'Elige un medio de pago' }),
    }
    const erroresEntrega = conDespacho ? erroresDireccion(direccion) : {}
    const err = intento ? erroresCompra : {}
    const errDireccion = intento ? erroresEntrega : {}

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


        setIntento(true)
        if (hayErrores({ ...erroresCompra, ...erroresEntrega })) {
            setMensaje({ tipo: 'danger', texto: 'Revisa los campos marcados en rojo.' })
            enfocarPrimerError(document)
            return
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
            costoDespacho: envio ?? 0,
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
        setIntento(false)
        setEntrega('')
        setPago('')
        setGuardarEnCuenta(false)
        setMensaje({
            tipo: 'success',
            texto: `Compra realizada con éxito. Pedido #${resultado.pedido.id} por ${formatearPrecio(resultado.pedido.total)}.${destino}`,
        })
    }

    return (
        <Container as="main" className="my-4">
            <h1 className="h3 mb-4">Carrito de compras</h1>

            <div className="table-responsive">
                <Table striped align="middle" className="tabla-apilable">
                    <thead>
                        <tr>
                            <th></th>
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
                                <td colSpan={6} className="text-center text-muted">
                                    No hay productos en el carrito.
                                </td>
                            </tr>
                        )}

                        {carrito.map((item) => {
                            const imagen = rutaImagen(item, catalogo)

                            return (
                                <tr key={item.codigo}>
                                    <td className="celda-imagen">
                                        {imagen && (
                                            <img src={imagen} alt={item.nombre} className="img-producto" />
                                        )}
                                    </td>
                                    <td data-label="Producto">{item.nombre}</td>
                                    <td data-label="Precio">{formatearPrecio(item.precio)}</td>
                                    <td data-label="Cantidad">
                                        <Form.Control
                                            className="input-cantidad"
                                            type="number"
                                            min={CANTIDAD_MINIMA}
                                            max={CANTIDAD_MAXIMA}
                                            value={item.cantidad}
                                            onChange={(e) =>
                                                cambiarCantidad(item.codigo, Number(e.target.value))
                                            }
                                        />
                                    </td>
                                    <td data-label="Subtotal">{formatearPrecio(item.precio * item.cantidad)}</td>
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
                            )
                        })}
                    </tbody>
                </Table>
            </div>

            <p className="fs-5 text-end">
                Subtotal productos: <strong>{formatearPrecio(total)}</strong>
            </p>

            <h2 className="h5 mt-4">Datos del cliente</h2>
            <p className="text-secondary small mb-1 nota-obligatorios">Campos obligatorios</p>
            <p className="text-muted small">
                {usuario
                    ? 'Completamos tus datos con los de tu cuenta. Puedes cambiarlos para este pedido.'
                    : 'Inicia sesión para completar tus datos automáticamente.'}
            </p>
            <Row className="g-3 mb-4">
                <Col md={6}>
                    <Form.Label htmlFor="cliente-nombre" className="obligatorio">Nombre completo</Form.Label>
                    <Form.Control
                        id="cliente-nombre"
                        required
                        isInvalid={Boolean(err.nombre)}
                        value={datosCliente.nombre}
                        onChange={(e) => setDatosCliente({ ...datosCliente, nombre: e.target.value })}
                    />
                    <Form.Control.Feedback type="invalid">{err.nombre}</Form.Control.Feedback>
                </Col>
                <Col md={6}>
                    <Form.Label htmlFor="cliente-email" className="obligatorio">Correo electrónico</Form.Label>
                    <Form.Control
                        id="cliente-email"
                        type="email"
                        required
                        isInvalid={Boolean(err.email)}
                        value={datosCliente.email}
                        onChange={(e) => setDatosCliente({ ...datosCliente, email: e.target.value })}
                    />
                    <Form.Control.Feedback type="invalid">{err.email}</Form.Control.Feedback>
                </Col>
            </Row>

            <Row className="g-3">
                <Col md={6}>
                    <Form.Label htmlFor="entrega" className="obligatorio">Tipo de entrega</Form.Label>
                    <Form.Select
                        id="entrega"
                        required
                        isInvalid={Boolean(err.entrega)}
                        value={entrega}
                        onChange={(e) => setEntrega(e.target.value)}
                    >
                        <option value="">Selecciona...</option>
                        {OPCIONES_ENTREGA.map((opcion) => (
                            <option key={opcion} value={opcion}>{opcion}</option>
                        ))}
                    </Form.Select>
                    <Form.Control.Feedback type="invalid">{err.entrega}</Form.Control.Feedback>
                </Col>
                <Col md={6}>
                    <Form.Label htmlFor="pago" className="obligatorio">Medio de pago</Form.Label>
                    <Form.Select
                        id="pago"
                        required
                        isInvalid={Boolean(err.pago)}
                        value={pago}
                        onChange={(e) => setPago(e.target.value)}
                    >
                        <option value="">Selecciona...</option>
                        {OPCIONES_PAGO.map((opcion) => (
                            <option key={opcion} value={opcion}>{opcion}</option>
                        ))}
                    </Form.Select>
                    <Form.Control.Feedback type="invalid">{err.pago}</Form.Control.Feedback>
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

                    <FormularioDireccion prefijo="entrega-dir" valor={direccion} onChange={setDireccion} errores={errDireccion} />

                    <Form.Check
                        id="guardar-direccion"
                        type="checkbox"
                        label="Guardar esta dirección en mi cuenta"
                        checked={guardarEnCuenta}
                        onChange={(e) => setGuardarEnCuenta(e.target.checked)}
                    />
                </section>
            )}

            <section className="border rounded p-3 mt-4 bg-light" aria-label="Resumen de la compra">
                <h2 className="h6 fw-bold mb-3">Resumen</h2>
                <div className="d-flex justify-content-between">
                    <span>Subtotal productos</span>
                    <span>{formatearPrecio(total)}</span>
                </div>
                <div className="d-flex justify-content-between">
                    <span>Despacho</span>
                    <span>{textoEnvio(entrega, conDespacho, direccion.comuna, envio)}</span>
                </div>
                <hr className="my-2" />
                <div className="d-flex justify-content-between fs-5">
                    <strong>Total a pagar</strong>
                    <strong>{formatearPrecio(totalAPagar)}</strong>
                </div>
                {faltaGratis > 0 && carrito.length > 0 && (
                    <p className="text-success small mb-0 mt-2">
                        Te faltan {formatearPrecio(faltaGratis)} para tener despacho gratis en {direccion.comuna}.
                    </p>
                )}
            </section>

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