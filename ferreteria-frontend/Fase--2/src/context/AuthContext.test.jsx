import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import { AuthProvider, useAuth } from './AuthContext'

function Estado() {
  const { usuario, conectado } = useAuth()
  return (
    <p>
      {usuario ? usuario.nombre : 'sin sesión'} | {conectado ? 'conectado' : 'sin token'} | {usuario?.token ?? 'token oculto'}
    </p>
  )
}

const montar = () => render(<AuthProvider><Estado /></AuthProvider>)

describe('AuthContext: conectado', () => {
  it('con token guardado la sesión está conectada, pero el token no se expone en usuario', () => {
    localStorage.setItem('usuarioActivo', JSON.stringify({ nombre: 'Ana Soto', rol: 'Cliente', token: 't', refreshToken: 'r' }))
    montar()
    expect(screen.getByText('Ana Soto | conectado | token oculto')).toBeInTheDocument()
  })

  it('una sesión sin token no está conectada', () => {
    localStorage.setItem('usuarioActivo', JSON.stringify({ nombre: 'Ana Soto', rol: 'Cliente' }))
    montar()
    expect(screen.getByText('Ana Soto | sin token | token oculto')).toBeInTheDocument()
  })

  it('sin sesión no está conectado', () => {
    montar()
    expect(screen.getByText('sin sesión | sin token | token oculto')).toBeInTheDocument()
  })
})
