import { Fragment } from 'react'
import { Modal } from 'react-bootstrap'


function ModalDetalle({ titulo, filas, onCerrar, children }) {
  return (
    <Modal show onHide={onCerrar} centered>
      <Modal.Header closeButton closeLabel="Cerrar">
        <Modal.Title as="h2" className="h5 fw-bold">{titulo}</Modal.Title>
      </Modal.Header>

      <Modal.Body>
        <dl className="row small mb-0">
          {filas
            .filter(([, valor]) => valor !== null && valor !== undefined && valor !== '')
            .map(([etiqueta, valor]) => (
              <Fragment key={etiqueta}>
                <dt className="col-5 text-secondary">{etiqueta}</dt>
                <dd className="col-7">{valor}</dd>
              </Fragment>
            ))}
        </dl>
        {children}
      </Modal.Body>

      <Modal.Footer>
        <button type="button" className="btn btn-outline-secondary" onClick={onCerrar}>Cerrar</button>
      </Modal.Footer>
    </Modal>
  )
}

export default ModalDetalle
