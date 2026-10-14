import { useState } from 'react'
import { Container, Table, Form, Button, Alert, Row, Col } from 'react-bootstrap'
import { useCarrito } from '../context/CarritoContext'
import { leer, guardar } from '../utils/storage'
import { obtenerProductos } from '../data/almacen'
import {
    OPCIONES_ENTREGA,
    OPCIONES_PAGO,
    CANTIDAD_MINIMA,
    CANTIDAD_MAXIMA,
    hayCantidadInvalida,
    registrarCompra,
} from '../utils/carrito'

function dinero(valor) {
    return '$' + valor.toLocaleString('es-CL')
}

export default function Carrito() {
    const { carrito, total, cambiarCantidad, eliminar, vaciar } = useCarrito()
    const [entrega, setEntrega] = useState('')
    const [pago, setPago] = useState('')
    const [mensaje, setMensaje] = useState(null)

    function confirmar() {
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

        const resultado = registrarCompra({
            carrito,
            productos: obtenerProductos(),
            usuario: leer('usuarioActivo', null),
            entrega,
            pago,
        })

        guardar('productos', resultado.productos)
        guardar('pedidos', [...leer('pedidos', []), resultado.pedido])
        guardar('ventas', [...leer('ventas', []), resultado.venta])

        vaciar()
        setEntrega('')
        setPago('')
        setMensaje({ tipo: 'success', texto: 'Compra realizada con éxito.' })
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