import '@testing-library/jest-dom/vitest'
import { afterEach } from 'vitest'

// cada prueba empieza sin sesión ni datos guardados
afterEach(() => {
  localStorage.clear()
})
if (!window.matchMedia) {
  window.matchMedia = (q) => ({ matches: false, media: q, addEventListener() {}, removeEventListener() {}, addListener() {}, removeListener() {} })
}
