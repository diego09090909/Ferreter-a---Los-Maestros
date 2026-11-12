import { useEffect, useState } from 'react'
import { Container, Table, Form, Button, Alert, Row, Col } from 'react-bootstrap'
import FormularioDireccion from '../components/FormularioDireccion'
import { useCarrito } from '../context/CarritoContext'
import { useAuth } from '../context/AuthContext'
import { useNavigate } from 'react-router-dom'
import { MAX_DIRECCIONES, agregarDireccion, listarDirecciones } from '../services/direcciones'
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
import { DIRECCION_VACIA, erroresDireccion, limpiarDireccion, textoDireccion } from '../utils/direccion'
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
    const { usuario } = useAuth()
    const navigate = useNavigate()

    const [entrega, setEntrega] = useState('')
    const [pago, setPago] = useState('')
    const [mensaje, setMensaje] = useState(null)

    const catalogo = obtenerProductos()

    const [datosCliente, setDatosCliente] = useState(() => ({
        nombre: usuario?.nombre ?? '',
        email: usuario?.email ?? '',
    }))
    // direcciones guardadas del cliente; "seleccion" es el id de la elegida o 'nueva' para escribir otra
    const [direcciones, setDirecciones] = useState([])
    const [seleccion, setSeleccion] = useState('nueva')
    const [direccion, setDireccion] = useState(DIRECCION_VACIA)
    const [guardarEnCuenta, setGuardarEnCuenta] = useState(false)

    // al entrar con sesion se cargan sus direcciones y se marca la predeterminada (viene primera)
    useEffect(() => {
        if (!usuario) return
        listarDirecciones(usuario).then((lista) => {
            setDirecciones(lista)
            if (lista.length > 0) setSeleccion(lista[0].id)
        })
    }, [usuario])

    const usaNueva = seleccion === 'nueva'
    const direccionElegida = usaNueva ? direccion : direcciones.find((d) => d.id === seleccion)
    const puedeGuardar = Boolean(usuario) && direcciones.length < MAX_DIRECCIONES

    const conDespacho = entrega === ENTREGA_DOMICILIO
    const comuna = direccionElegida?.comuna ?? ''
    const envio = conDespacho ? costoDespacho(comuna, total) : 0
    const totalAPagar = total + (envio ?? 0)
    const faltaGratis = conDespacho ? faltaParaDespachoGratis(comuna, total) : 0
    const [intento, setIntento] = useState(false)
    const erroresCompra = {
        ...erroresDatos(datosCliente),
        ...(entrega ? {} : { entrega: 'Elige un tipo de entrega' }),
        ...(pago ? {} : { pago: 'Elige un medio de pago' }),
    }
    // solo se valida el formulario cuando se escribe una direccion nueva; las guardadas ya son validas
    const erroresEntrega = conDespacho && usaNueva ? erroresDireccion(direccion) : {}
    const err = intento ? erroresCompra : {}
    const errDireccion = intento ? erroresEntrega : {}

    async function confirmar() {
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

        let direccionFinal
        if (conDespacho) direccionFinal = usaNueva ? limpiarDireccion(direccion) : direccionElegida

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

        // la direccion nueva se guarda en "Mis direcciones" si el cliente lo pidio
        if (conDespacho && usaNueva && guardarEnCuenta && puedeGuardar) {
            const guardada = await agregarDireccion(usuario, direccionFinal)
            setDirecciones(await listarDirecciones(usuario))
            setSeleccion(guardada.id)
            setDireccion(DIRECCION_VACIA)
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
                        {direcciones.length > 0
                            ? 'Elige una de tus direcciones guardadas o escribe una nueva.'
                            : 'Completa la dirección donde quieres recibir tu pedido.'}
                    </p>

                    {direcciones.length > 0 && (
                        <div className="mb-3" role="radiogroup" aria-label="Direcciones guardadas">
                            {direcciones.map((d) => (
                                <Form.Check
                                    key={d.id}
                                    type="radio"
                                    id={`dir-${d.id}`}
                                    name="direccion-entrega"
                                    className="border rounded p-2 ps-5 mb-2"
                                    checked={seleccion === d.id}
                                    onChange={() => setSeleccion(d.id)}
                                    label={
                                        <>
                                            <strong>{d.alias}</strong>
                                            {d.predeterminada && <span className="badge bg-primary ms-2">Predeterminada</span>}
                                            <span className="d-block small text-muted">{textoDireccion(d)}</span>
                                        </>
                                    }
                                />
                            ))}
                            <Form.Check
                                type="radio"
                                id="dir-nueva"
                                name="direccion-entrega"
                                className="border rounded p-2 ps-5"
                                checked={usaNueva}
                                onChange={() => setSeleccion('nueva')}
                                label={<strong>Usar una dirección nueva</strong>}
                            />
                        </div>
                    )}

                    {usaNueva && (
                        <>
                            <FormularioDireccion prefijo="entrega-dir" valor={direccion} onChange={setDireccion} errores={errDireccion} />

                            {puedeGuardar && (
                                <Form.Check
                                    id="guardar-direccion"
                                    type="checkbox"
                                    label="Guardar esta dirección en mi cuenta"
                                    checked={guardarEnCuenta}
                                    onChange={(e) => setGuardarEnCuenta(e.target.checked)}
                                />
                            )}
                            {guardarEnCuenta && puedeGuardar && (
                                <div className="mt-2" style={{ maxWidth: 320 }}>
                                    <Form.Label htmlFor="entrega-dir-alias" className="small">Nombre de la dirección (opcional)</Form.Label>
                                    <Form.Control
                                        id="entrega-dir-alias"
                                        size="sm"
                                        placeholder="Ej: Casa, Oficina, Obra"
                                        maxLength={50}
                                        value={direccion.alias}
                                        onChange={(e) => setDireccion({ ...direccion, alias: e.target.value })}
                                    />
                                </div>
                            )}
                            {usuario && !puedeGuardar && (
                                <p className="small text-muted mb-0">
                                    Ya tienes {MAX_DIRECCIONES} direcciones guardadas. Esta dirección se usará solo para este pedido.
                                </p>
                            )}
                        </>
                    )}
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
                    <span>{textoEnvio(entrega, conDespacho, comuna, envio)}</span>
                </div>
                <hr className="my-2" />
                <div className="d-flex justify-content-between fs-5">
                    <strong>Total a pagar</strong>
                    <strong>{formatearPrecio(totalAPagar)}</strong>
                </div>
                {faltaGratis > 0 && carrito.length > 0 && (
                    <p className="text-success small mb-0 mt-2">
                        Te faltan {formatearPrecio(faltaGratis)} para tener despacho gratis en {comuna}.
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