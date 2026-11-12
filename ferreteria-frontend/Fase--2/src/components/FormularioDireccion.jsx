import ErrorCampo from './ErrorCampo'
import { REGION_DESPACHO } from '../data/despacho'
import { comunasConCobertura } from '../utils/despacho'
import { claseCampo } from '../utils/validaciones'


// errores: { calle, numero, comuna } con el mensaje de cada campo que falle
// conAlias: muestra el campo "Nombre de la dirección" (Casa, Obra...) para las direcciones guardadas
function FormularioDireccion({ valor, onChange, prefijo, errores = {}, conAlias = false }) {
    const cambiar = (parcial) => onChange({ ...valor, ...parcial })
    const comunas = comunasConCobertura()

    return (
        <>
            {conAlias && (
                <div className="mb-3">
                    <label htmlFor={`${prefijo}-alias`} className="form-label">Nombre de la dirección (opcional)</label>
                    <input
                        type="text"
                        className="form-control"
                        id={`${prefijo}-alias`}
                        placeholder="Ej: Casa, Oficina, Obra"
                        maxLength={50}
                        value={valor.alias ?? ''}
                        onChange={(e) => cambiar({ alias: e.target.value })}
                    />
                </div>
            )}

            <div className="row g-3 mb-3">
                <div className="col-12 col-sm-8">
                    <label htmlFor={`${prefijo}-calle`} className="form-label obligatorio">Calle</label>
                    <input
                        type="text"
                        className={claseCampo('form-control', errores.calle)}
                        id={`${prefijo}-calle`}
                        placeholder="Av. Francisco de Aguirre"
                        autoComplete="address-line1"
                        required
                        aria-invalid={Boolean(errores.calle)}
                        aria-describedby={`${prefijo}-calle-error`}
                        value={valor.calle}
                        onChange={(e) => cambiar({ calle: e.target.value })}
                    />
                    <ErrorCampo id={`${prefijo}-calle-error`} mensaje={errores.calle} />
                </div>

                <div className="col-12 col-sm-4">
                    <label htmlFor={`${prefijo}-numero`} className="form-label obligatorio">Número</label>
                    <input
                        type="text"
                        className={claseCampo('form-control', errores.numero)}
                        id={`${prefijo}-numero`}
                        placeholder="1450"
                        maxLength={8}
                        required
                        aria-invalid={Boolean(errores.numero)}
                        aria-describedby={`${prefijo}-numero-error`}
                        value={valor.numero}
                        onChange={(e) => cambiar({ numero: e.target.value })}
                    />
                    <ErrorCampo id={`${prefijo}-numero-error`} mensaje={errores.numero} />
                </div>
            </div>

            <div className="mb-3">
                <label htmlFor={`${prefijo}-departamento`} className="form-label">Departamento (opcional)</label>
                <input
                    type="text"
                    className="form-control"
                    id={`${prefijo}-departamento`}
                    placeholder="Ej: 603"
                    maxLength={20}
                    value={valor.departamento}
                    onChange={(e) => cambiar({ departamento: e.target.value })}
                />
            </div>

            <div className="row g-3 mb-3">
                <div className="col-12 col-sm-6">
                    <label htmlFor={`${prefijo}-region`} className="form-label">Región</label>
                    <input
                        type="text"
                        className="form-control"
                        id={`${prefijo}-region`}
                        value={REGION_DESPACHO}
                        readOnly
                        disabled
                    />
                </div>

                <div className="col-12 col-sm-6">
                    <label htmlFor={`${prefijo}-comuna`} className="form-label obligatorio">Comuna</label>
                    <select
                        className={claseCampo('form-select', errores.comuna)}
                        id={`${prefijo}-comuna`}
                        required
                        aria-invalid={Boolean(errores.comuna)}
                        aria-describedby={`${prefijo}-comuna-error`}
                        value={valor.comuna}
                        onChange={(e) => cambiar({ comuna: e.target.value })}
                    >
                        <option value="">Selecciona...</option>
                        {comunas.map((comuna) => (
                            <option key={comuna} value={comuna}>{comuna}</option>
                        ))}
                    </select>
                    <ErrorCampo id={`${prefijo}-comuna-error`} mensaje={errores.comuna} />
                </div>
            </div>

            <p className="text-secondary small mt-n2 mb-3">
                Solo despachamos a comunas de la Región de Coquimbo con cobertura.
            </p>

            <div className="mb-3">
                <label htmlFor={`${prefijo}-indicaciones`} className="form-label">Indicaciones para la entrega (opcional)</label>
                <textarea
                    className="form-control"
                    id={`${prefijo}-indicaciones`}
                    rows="2"
                    placeholder="Ej: entre calles, color del edificio, no tiene timbre"
                    maxLength={300}
                    value={valor.indicaciones}
                    onChange={(e) => cambiar({ indicaciones: e.target.value })}
                />
            </div>
        </>
    )
}

export default FormularioDireccion
