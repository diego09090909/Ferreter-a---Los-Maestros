# 🔨 Ferretería Los Maestros

Plataforma web de comercio electrónico para **Ferretería Los Maestros**, una ferretería de **La Serena, Región de Coquimbo**. Permite explorar el catálogo de productos, comprar en línea con retiro en tienda o despacho a domicilio, consultar las zonas de cobertura y administrar productos, pedidos y usuarios desde un panel con roles.

> 📚 Proyecto académico de la asignatura **DSY1104 – Desarrollo Fullstack II** (Duoc UC, carrera Analista Programador).

---

## 📋 Tabla de contenidos

- [Equipo](#-equipo)
- [Funcionalidades](#-funcionalidades)
- [Roles del sistema](#-roles-del-sistema)
- [Arquitectura](#-arquitectura)
- [Estructura del repositorio](#-estructura-del-repositorio)
- [Tecnologías](#-tecnologías)
- [Microservicios](#-microservicios)
- [Zonas de despacho](#-zonas-de-despacho)
- [Cómo ejecutar el proyecto](#-cómo-ejecutar-el-proyecto)
- [Flujo de trabajo con Git](#-flujo-de-trabajo-con-git)
- [Estado del proyecto](#-estado-del-proyecto)

---

## 👥 Equipo

| Integrante | Responsabilidad principal |
|---|---|
| Kevin Gonzalez | Frontend · `ms-catalogo` |
| Diego Jiménez | Frontend · `ms-usuarios` |
| José Sánchez | `ms-ventas` |

---

## ✨ Funcionalidades

### Tienda (clientes)
- **Catálogo de productos** con buscador, filtros por categoría, marca y precio, y ordenamiento por precio.
- **Carrito de compras** con cantidades, subtotal, costo de despacho y total a pagar.
- **Tipos de entrega:** retiro en tienda (gratis) o despacho a domicilio con costo según la comuna.
- **Despacho gratis** en La Serena y Coquimbo por compras sobre $50.000.
- **Registro e inicio de sesión** con RUT o correo, validación de RUT chileno (dígito verificador) y errores marcados campo por campo.
- **Mi Cuenta:** editar datos personales, cambiar contraseña, guardar la dirección de entrega y revisar el historial de pedidos.
- **Cobertura y ubicación:** mapa de la tienda, horarios de atención y tabla de zonas de despacho con plazos y costos.
- **Diseño responsivo:** las tablas se apilan en el celular y el menú se abre como panel lateral.

### Panel de administración
- Pedidos del mes, usuarios registrados, control de inventario (stock en tienda y en bodega) e histórico de ventas.
- Acceso restringido según el rol del usuario.

---

## 🔐 Roles del sistema

| Rol | Acceso |
|---|---|
| **Administrador** | Acceso total al sistema: productos, pedidos, usuarios y ventas. |
| **Vendedor** | Ve la lista y el detalle de productos, y la lista y el detalle de órdenes. No ve ninguna otra sección. |
| **Cliente** | Solo accede a la tienda: catálogo, carrito, compras y su cuenta. |

---

## 🏗️ Arquitectura

El proyecto es un **monorepo** con un frontend en React y un backend de **microservicios** en Spring Boot. Cada microservicio tiene su propia base de datos y expone una API REST documentada con Swagger. La autenticación se maneja con **JWT**.

```
                    ┌──────────────────────────┐
                    │   Frontend (React + Vite) │
                    └────────────┬─────────────┘
                                 │ HTTP / JSON  (Authorization: Bearer <JWT>)
          ┌──────────────────────┼──────────────────────┐
          ▼                      ▼                      ▼
   ┌─────────────┐        ┌─────────────┐        ┌─────────────┐
   │ ms-usuarios │        │ ms-catalogo │        │  ms-ventas  │
   │ login · JWT │        │ productos   │◄───────│ boletas     │
   │ usuarios    │        │ categorías  │ stock  │ despacho    │
   └──────┬──────┘        └──────┬──────┘        └──────┬──────┘
          ▼                      ▼                      ▼
       MySQL                  MySQL                  MySQL
```

**Modelo de datos (propuesta de la asignatura):**

```
USUARIO ┄┄► BOLETA ──► DETALLE_BOLETA ◄── PRODUCTO ◄── CATEGORIA
```

La línea punteada indica que BOLETA guarda la referencia al usuario, pero esa información vive en otro microservicio.

---

## 📁 Estructura del repositorio

```
Ferreter-a---Los-Maestros/
├── ferreteria-frontend/
│   ├── Fase--1/              # Primera entrega: HTML, CSS, Bootstrap y JavaScript
│   └── Fase--2/              # Aplicación React (versión actual)
│       ├── public/imagenes/  # Imágenes de productos y logo
│       └── src/
│           ├── components/   # Navbar, Footer, formularios, rutas protegidas…
│           ├── context/      # AuthContext (sesión) y CarritoContext
│           ├── data/         # Datos temporales (se reemplazan por la API)
│           ├── hooks/        # Hooks propios (useTitulo)
│           ├── pages/        # Inicio, Catálogo, Carrito, Cobertura, Login, MiCuenta, Admin
│           ├── services/     # Acceso a datos
│           ├── styles/       # Estilos por página
│           └── utils/        # Lógica reutilizable y validaciones (con pruebas)
│
└── ferreteria-backend/
    ├── ms-usuarios/          # Usuarios, roles, direcciones y autenticación
    ├── ms-catalogo/          # Productos, categorías y stock
    └── ms-ventas/            # Boletas, detalle de venta y despacho
```

Cada microservicio sigue la misma estructura por capas:

```
src/main/java/com/ferreteria/ms_<nombre>/
├── controller/    # Endpoints REST
├── dto/           # Objetos de entrada (Request) y salida (Response)
├── exception/     # Errores personalizados y manejador global
├── model/         # Entidades JPA
├── repository/    # Acceso a la base de datos (Spring Data JPA)
└── service/       # Lógica de negocio
```

---

## 🛠️ Tecnologías

### Frontend
| Tecnología | Uso |
|---|---|
| React 19 + Vite | Interfaz y entorno de desarrollo |
| React Router 7 | Navegación y rutas protegidas |
| Bootstrap 5 + React-Bootstrap | Diseño responsivo y componentes |
| Bootstrap Icons | Íconos |
| React Hook Form | Formularios |
| Vitest + Testing Library | Pruebas unitarias y de componentes |
| Oxlint | Revisión de código |

### Backend
| Tecnología | Uso |
|---|---|
| Java 17 + Spring Boot 4.1 | Microservicios REST |
| Spring Data JPA | Persistencia |
| MySQL | Base de datos |
| Spring Security + JWT | Autenticación y autorización por roles |
| Bean Validation | Validación de datos de entrada |
| springdoc-openapi (Swagger) | Documentación de la API |
| Lombok | Menos código repetitivo en entidades y DTOs |
| Maven Wrapper | Compilación sin instalar Maven |

---

## 🧩 Microservicios

| Microservicio | Responsabilidad | Entidades principales | Puerto (propuesto) |
|---|---|---|---|
| `ms-usuarios` | Registro, login, emisión y renovación de tokens JWT, roles y direcciones | `Usuario`, `Rol`, `Direccion` | 8081 |
| `ms-catalogo` | Catálogo, categorías, búsqueda y control de stock | `Producto`, `Categoria` | 8082 |
| `ms-ventas` | Boletas, detalle de compra, estados del pedido y costo de despacho | `Venta`, `DetalleVenta`, `EstadoVenta` | 8083 |

Todas las rutas usan versionado: `/api/v1/...`

Con cada microservicio corriendo, su documentación queda disponible en:
`http://localhost:<puerto>/swagger-ui.html`

---

## 🚚 Zonas de despacho

La tienda despacha solo dentro de la **Región de Coquimbo**:

| Comuna | Plazo | Costo |
|---|---|---|
| La Serena | 24 horas | $3.990 |
| Coquimbo | 24 horas | $4.490 |
| Andacollo | 48 horas | $7.990 |
| Vicuña | 48 horas | $8.990 |
| Ovalle | 72 horas (días acordados) | $11.990 |
| La Higuera | Sin cobertura | — |

El despacho es **gratis en La Serena y Coquimbo** para compras sobre **$50.000**. El retiro en tienda siempre es gratis.

---

## 🚀 Cómo ejecutar el proyecto

### Requisitos previos
- [Node.js 22 LTS](https://nodejs.org/)
- [JDK 17](https://adoptium.net/) o superior
- MySQL 8 (por ejemplo, con XAMPP o Laragon)
- Git

> 💡 En Windows, si PowerShell bloquea los scripts de npm, ejecuta una vez:
> `Set-ExecutionPolicy -Scope CurrentUser RemoteSigned`

### 1. Clonar el repositorio
```powershell
git clone https://github.com/diego09090909/Ferreter-a---Los-Maestros.git
cd Ferreter-a---Los-Maestros
```

### 2. Frontend
```powershell
cd ferreteria-frontend/Fase--2
npm install
npm run dev
```
La aplicación queda disponible en **http://localhost:5173**

| Comando | Qué hace |
|---|---|
| `npm run dev` | Levanta el servidor de desarrollo |
| `npm test` | Ejecuta las pruebas con Vitest |
| `npm run build` | Genera la versión de producción en `dist/` |
| `npm run lint` | Revisa el código con Oxlint |

### 3. Backend
Con MySQL encendido, cada microservicio se levanta desde su propia carpeta:
```powershell
cd ferreteria-backend/ms-usuarios
.\mvnw.cmd spring-boot:run
```
Repite lo mismo en `ms-catalogo` y `ms-ventas`, cada uno en una terminal distinta.

| Comando | Qué hace |
|---|---|
| `.\mvnw.cmd clean compile` | Compila el microservicio |
| `.\mvnw.cmd test` | Ejecuta las pruebas |
| `.\mvnw.cmd spring-boot:run` | Levanta el microservicio |

> En Linux o macOS se usa `./mvnw` en lugar de `.\mvnw.cmd`.

---

## 🌿 Flujo de trabajo con Git

1. Actualizar `main` antes de empezar:
   ```powershell
   git checkout main
   git pull origin main
   ```
2. Crear una rama por cada cambio, con un nombre descriptivo:
   ```powershell
   git checkout -b catalogo-service
   ```
3. Hacer commits pequeños, con mensajes claros en español que expliquen **qué** cambia.
4. Subir la rama y abrir un **Pull Request** hacia `main` para que otro integrante lo revise.
5. Después del merge, volver a `main` y actualizar.

**Reglas del equipo**
- No subir `node_modules/`, `target/`, `dist/`, `.env` ni configuraciones personales del editor.
- Cada integrante trabaja en su microservicio; si hay que tocar el de otro, se coordina antes.

---

## 📌 Estado del proyecto

### ✅ Completado
- [x] **Fase 1:** sitio estático con HTML, CSS, Bootstrap y JavaScript
- [x] **Fase 2:** migración a React con componentes, contextos, rutas protegidas y pruebas con Vitest
- [x] Diseño responsivo para celular (tablas apilables y navbar)
- [x] Costo de despacho por comuna y despacho gratis sobre $50.000
- [x] Dirección con calle y número separados, limitada a comunas con cobertura
- [x] Validación de formularios con errores por campo
- [x] Estructura de monorepo y microservicios
- [x] Entidades, repositorios y DTOs de `ms-usuarios` y `ms-catalogo`

### 🚧 En desarrollo (Fase 3)
- [ ] Servicios y controladores REST de los tres microservicios
- [ ] Autenticación con Spring Security y JWT (con refresh token)
- [ ] Documentación de los endpoints con Swagger
- [ ] Conexión del frontend a la API (reemplazar los datos de `localStorage`)
- [ ] Sesión persistente con token y rol **Vendedor** en el frontend
- [ ] Vistas de detalle de producto y de pedido
- [ ] CRUD de productos y cambio de estado de pedidos en el panel
- [ ] Pruebas de integración entre frontend y backend
- [ ] Manual de usuario y documentación de APIs e integración

---

<p align="center">
  Proyecto académico · Duoc UC · 2026<br>
  Los nombres, precios y datos de la tienda son ficticios.
</p>
