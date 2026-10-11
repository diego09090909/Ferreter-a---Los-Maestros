import { render, screen } from '@testing-library/react'
import Cobertura from './Cobertura'
import { ZONAS_DESPACHO } from '../data/productos'

describe('Cobertura', () => {
    it('muestra una fila por cada zona de despacho', () => {
        render(<Cobertura />)
        expect(screen.getAllByRole('row')).toHaveLength(ZONAS_DESPACHO.length + 1)
    })

    it('muestra el estado de La Higuera como sin cobertura', () => {
        render(<Cobertura />)
        expect(screen.getByText('Sin cobertura')).toBeInTheDocument()
    })
})