import { useEffect } from 'react'
import { Row, Col, Card, Table, Badge, Ratio } from 'react-bootstrap'
import 'bootstrap-icons/font/bootstrap-icons.min.css'
import { ZONAS_DESPACHO } from '../data/productos'
import './cobertura.css'

function Cobertura() {
    useEffect(() => {
        document.title = 'Cobertura y Ubicación'
    }, [])

    return (
        <>
            <h1 className="h3 fw-bold mb-4">COBERTURA Y UBICACIÓN</h1>

            <Row className="g-4">
                <Col lg={4}>
                    <Card className="h-100 shadow-sm">
                        <Card.Body>
                            <h2 className="h6 text-uppercase text-secondary fw-bold mb-4">
                                Nuestra tienda
                            </h2>

                            <ul className="list-unstyled datos-tienda mb-0">
                                <li className="d-flex gap-3 mb-4">
                                    <i className="bi bi-geo-alt-fill"></i>
                                    <div>
                                        <p className="fw-semibold mb-1">Dirección</p>
                                        <p className="text-secondary mb-0">
                                            Av. Francisco de Aguirre 1450, Local 5
                                            <br />
                                            La Serena, Región de Coquimbo
                                        </p>
                                    </div>
                                </li>

                                <li className="d-flex gap-3 mb-4">
                                    <i className="bi bi-telephone-fill"></i>
                                    <div>
                                        <p className="fw-semibold mb-1">Teléfono</p>
                                        <p className="mb-0">
                                            <a href="tel:+56932848760" className="text-decoration-none">
                                                +56 9 3284 8760
                                            </a>
                                        </p>
                                    </div>
                                </li>

                                <li className="d-flex gap-3 mb-4">
                                    <i className="bi bi-envelope-fill"></i>
                                    <div>
                                        <p className="fw-semibold mb-1">Correo</p>
                                        <p className="mb-0">
                                            <a
                                                href="mailto:contacto@losmaestros.cl"
                                                className="text-decoration-none"
                                            >
                                                contacto@losmaestros.cl
                                            </a>
                                        </p>
                                    </div>
                                </li>

                                <li className="d-flex gap-3">
                                    <i className="bi bi-clock-fill"></i>
                                    <div>
                                        <p className="fw-semibold mb-1">Horario de atención</p>
                                        <p className="text-secondary mb-0">
                                            Lunes a Viernes: 09:00 - 19:00 hrs
                                            <br />
                                            Sábado: 10:00 - 14:00 hrs
                                            <br />
                                            Domingo: cerrado
                                        </p>
                                    </div>
                                </li>
                            </ul>
                        </Card.Body>
                    </Card>
                </Col>

                <Col lg={8}>
                    <Card className="h-100 shadow-sm overflow-hidden">
                        <Card.Header className="bg-white border-bottom py-3">
                            <h2 className="h6 fw-bold mb-0">
                                <i className="bi bi-map-fill text-success me-2"></i>
                                Mapa interactivo
                            </h2>
                        </Card.Header>

                        <Card.Body className="p-0">
                            <Ratio aspectRatio="16x9" className="mapa-tienda">
                                <iframe
                                    src="https://www.google.com/maps?q=Av.+Francisco+de+Aguirre+1450,+La+Serena,+Chile&hl=es&z=14&output=embed"
                                    title="Mapa de ubicación de Ferretería Los Maestros"
                                    allowFullScreen
                                    loading="lazy"
                                    referrerPolicy="strict-origin-when-cross-origin"
                                ></iframe>
                            </Ratio>
                        </Card.Body>

                        <Card.Footer className="bg-light py-2">
                            <small className="text-muted">
                                Puedes acercar, alejar y mover el mapa para ubicar la tienda.
                            </small>
                        </Card.Footer>
                    </Card>
                </Col>
            </Row>

            <h2 className="h5 fw-bold mt-5 mb-3">Zonas de Despacho</h2>

            <div className="table-responsive">
                <Table hover className="align-middle tabla-cobertura">
                    <thead className="table-light">
                        <tr>
                            <th scope="col">Comuna</th>
                            <th scope="col">Plazo de entrega</th>
                            <th scope="col" className="text-end">
                                Costo de despacho
                            </th>
                            <th scope="col" className="text-center">
                                Estado
                            </th>
                        </tr>
                    </thead>

                    <tbody>
                        {ZONAS_DESPACHO.map((zona) => (
                            <tr key={zona.comuna}>
                                <td className="fw-semibold">{zona.comuna}</td>
                                <td>{zona.plazo}</td>
                                <td className="text-end">{zona.costo}</td>
                                <td className="text-center">
                                    <Badge
                                        bg={zona.color}
                                        text={zona.color === 'warning' ? 'dark' : undefined}
                                    >
                                        {zona.estado}
                                    </Badge>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </Table>
            </div>

            <p className="text-secondary small">
                Despacho gratis en La Serena y Coquimbo por compras sobre $50.000.
                Contratistas con cuenta corriente coordinan despacho directo a obra.
            </p>
        </>
    )
}

export default Cobertura