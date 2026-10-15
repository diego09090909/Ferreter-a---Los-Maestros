import { REGIONES } from '../data/regiones'
import { comunasDe } from '../utils/direccion'


function FormularioDireccion({ valor, onChange, prefijo }) {
    const cambiar = (parcial) => onChange({ ...valor, ...parcial })
    const comunas = comunasDe(valor.region)

    return (
        <>
            <div className="mb-3">
                <label htmlFor={`${prefijo}-calle`} className="form-label">Calle y número</label>
                <input
                    type="text"
                    className="form-control"
                    id={`${prefijo}-calle`}
                    placeholder="Av. Francisco de Aguirre 1450"
                    autoComplete="street-address"
                    value={valor.calle}
                    onChange={(e) => cambiar({ calle: e.target.value })}
                />
            </div>

            <div className="mb-3">
                <label htmlFor={`${prefijo}-departamento`} className="form-label">Departamento (opcional)</label>
                <input
                    type="text"
                    className="form-control"
                    id={`${prefijo}-departamento`}
                    placeholder="Ej: 603"
                    value={valor.departamento}
                    onChange={(e) => cambiar({ departamento: e.target.value })}
                />
            </div>

            <div className="row g-3 mb-3">
                <div className="col-12 col-sm-6">
                    <label htmlFor={`${prefijo}-region`} className="form-label">Región</label>
                    <select
                        className="form-select"
                        id={`${prefijo}-region`}
                        value={valor.region}
                        onChange={(e) => cambiar({ region: e.target.value, comuna: '' })}
                    >
                        <option value="">Selecciona...</option>
                        {REGIONES.map((region) => (
                            <option key={region.nombre} value={region.nombre}>{region.nombre}</option>
                        ))}
                    </select>
                </div>

                <div className="col-12 col-sm-6">
                    <label htmlFor={`${prefijo}-comuna`} className="form-label">Comuna</label>
                    <select
                        className="form-select"
                        id={`${prefijo}-comuna`}
                        value={valor.comuna}
                        disabled={!valor.region}
                        onChange={(e) => cambiar({ comuna: e.target.value })}
                    >
                        <option value="">Selecciona...</option>
                        {comunas.map((comuna) => (
                            <option key={comuna} value={comuna}>{comuna}</option>
                        ))}
                    </select>
                </div>
            </div>

            <div className="mb-3">
                <label htmlFor={`${prefijo}-indicaciones`} className="form-label">Indicaciones para la entrega (opcional)</label>
                <textarea
                    className="form-control"
                    id={`${prefijo}-indicaciones`}
                    rows="2"
                    placeholder="Ej: entre calles, color del edificio, no tiene timbre"
                    value={valor.indicaciones}
                    onChange={(e) => cambiar({ indicaciones: e.target.value })}
                />
            </div>
        </>
    )
}

export default FormularioDireccion