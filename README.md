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
- **Catálogo de productos** con buscador, filtros por categoría, marca y precio, ordenamiento por precio y página de detalle de cada producto.
- **Carrito de compras** con cantidades, subtotal, costo de despacho y total a pagar.
- **Compra:** solo los clientes con sesión iniciada; se elige medio de pago (débito, crédito o cuenta corriente) y el stock se descuenta al confirmar.
- **Tipos de entrega:** retiro en tienda (gratis) o despacho a domicilio con costo según la comuna.
- **Despacho gratis** en La Serena y Coquimbo por compras sobre $50.000.
- **Registro e inicio de sesión** con RUT o correo, validación de RUT chileno (dígito verificador) y errores marcados campo por campo.
- **Mi Cuenta:** editar datos personales, cambiar contraseña, guardar hasta 5 direcciones de despacho y revisar el historial de pedidos con su estado.
- **Cobertura y ubicación:** mapa de la tienda, horarios de atención y tabla de zonas de despacho con plazos y costos.
- **Diseño responsivo:** las tablas se apilan en el celular y el menú se abre como panel lateral.

### Panel de administración
- **Pedidos:** lista y detalle de todos los pedidos. El administrador cambia su estado (Pendiente → Pagada → Despachada → Entregada); al anular un pedido, su stock vuelve al inventario.
- **Inventario:** stock y stock mínimo de cada producto, con aviso de stock bajo. El administrador crea, edita y elimina productos, y repone o ajusta el stock.
- **Usuarios:** el administrador crea cuentas de administrador o vendedor, las edita y las elimina. La cuenta **Principal** no se puede eliminar.
- **Ventas:** histórico de ventas filtrado por año y mes.
- El vendedor solo ve **Pedidos** e **Inventario**, y no puede modificar nada.

---

## 🔐 Roles del sistema

| Rol | Acceso |
|---|---|
| **Administrador** | Acceso total al panel: pedidos y sus estados, productos (crear, editar y eliminar), stock, usuarios y ventas. No compra. |
| **Vendedor** | Ve la lista y el detalle de productos, y la lista y el detalle de órdenes. No ve ninguna otra sección ni modifica datos. No compra. |
| **Cliente** | Solo accede a la tienda: catálogo, carrito, compras y su cuenta. |

Las restricciones se aplican en el frontend (menús y rutas) y también en cada microservicio: sin token la API responde **401** y con un rol sin permiso responde **403**.

---

## 🏗️ Arquitectura

El proyecto es un **monorepo** con un frontend en React y un backend de **microservicios** en Spring Boot. Cada microservicio expone su propia API REST documentada con Swagger y trabaja con su propia base de datos MySQL. La autenticación se maneja con **JWT**.

```
                    ┌──────────────────────────┐
                    │   Frontend (React + Vite) │
                    └────────────┬─────────────┘
                                 │ HTTP / JSON  (Authorization: Bearer <JWT>)
          ┌──────────────────────┼──────────────────────┐
          ▼                      ▼                      ▼
   ┌─────────────┐        ┌─────────────┐        ┌─────────────┐
   │ ms-usuarios │        │ ms-catalogo │        │  ms-ventas  │
   │ login · JWT │        │ productos   │◄───────│ ventas      │
   │ usuarios    │        │ categorías  │ stock  │ despacho    │
   └──────┬──────┘        └──────┬──────┘        └──────┬──────┘
          ▼                      ▼                      ▼
       MySQL                  MySQL                  MySQL
```

- **ms-usuarios** entrega el token (dura 1 hora) y el refresh token (7 días). Los tres microservicios validan el token con la misma clave secreta, así que no necesitan consultar a ms-usuarios en cada petición.
- **ms-ventas** es el único que llama a otro microservicio: descuenta o repone stock en ms-catalogo con un **token de servicio** propio (rol `SERVICIO`, 5 minutos).
- En desarrollo, el frontend llama a catálogo y ventas a través del **proxy de Vite**, y a ms-usuarios directo en el puerto 8081 (con CORS).

**Modelo de datos (una base por microservicio):**

```
ferreteria_usuarios   USUARIOS   ──< DIRECCIONES
ferreteria_catalogo   CATEGORIAS ──< PRODUCTOS
ferreteria_ventas     VENTAS     ──< DETALLE_VENTAS

VENTAS.usuario_id          ┄┄► USUARIOS  (otra base)
DETALLE_VENTAS.producto_id ┄┄► PRODUCTOS (otra base)
```

Las líneas punteadas son referencias sin clave foránea, porque esos datos viven en otro microservicio. Cada detalle de venta guarda una copia del nombre y del precio del producto, así el historial no cambia si después se edita o se elimina un producto.

---

## 📁 Estructura del repositorio

```
Ferreter-a---Los-Maestros/
├── ferreteria-frontend/
│   ├── Fase--1/              # Primera entrega: HTML, CSS, Bootstrap y JavaScript
│   └── Fase--2/              # Aplicación React (versión actual)
│       ├── public/imagenes/  # Logo y fotos de productos (productos/<código>.webp)
│       └── src/
│           ├── components/   # Navbar, Footer, formularios, rutas protegidas…
│           ├── context/      # AuthContext (sesión) y CarritoContext
│           ├── data/         # Costos y plazos de despacho por comuna
│           ├── hooks/        # Hooks propios (useTitulo)
│           ├── pages/        # Inicio, Catálogo, Carrito, Cobertura, Login, MiCuenta, Admin
│           ├── services/     # Llamadas a la API con axios (api.js agrega el token)
│           ├── styles/       # Estilos por página
│           ├── test/         # Datos y servidor falso para las pruebas
│           └── utils/        # Lógica reutilizable y validaciones (con pruebas)
│
└── ferreteria-backend/
    ├── ms-usuarios/          # Usuarios, roles, direcciones y autenticación
    ├── ms-catalogo/          # Productos, categorías y stock
    └── ms-ventas/            # Ventas, detalle, estados del pedido y despacho
```

Cada microservicio sigue la misma estructura por capas:

```
src/main/java/com/ferreteria/ms_<nombre>/
├── config/        # Seguridad (SecurityConfig), Swagger y datos iniciales
├── controller/    # Endpoints REST
├── dto/           # Objetos de entrada (Request) y salida (Response)
├── exception/     # Errores personalizados y manejador global
├── mapper/        # Conversión entre entidades y DTOs
├── model/         # Entidades JPA
├── repository/    # Acceso a la base de datos (Spring Data JPA)
├── security/      # Generación y validación del JWT
└── service/       # Lógica de negocio
```

`ms-ventas` tiene además `client/`, con el cliente HTTP que llama a ms-catalogo.

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

| Microservicio | Responsabilidad | Entidades principales | Puerto | Base de datos |
|---|---|---|---|---|
| `ms-usuarios` | Registro, login, emisión y renovación de tokens JWT, roles, direcciones y cuentas del personal | `Usuario`, `Rol`, `Direccion` | 8081 | `ferreteria_usuarios` |
| `ms-catalogo` | Catálogo, categorías, búsqueda, CRUD de productos y control de stock | `Producto`, `Categoria` | 8082 | `ferreteria_catalogo` |
| `ms-ventas` | Compras, detalle de venta, estados del pedido, medio de pago y costo de despacho | `Venta`, `DetalleVenta`, `EstadoVenta`, `MedioPago` | 8083 | `ferreteria_ventas` |

Al primer arranque, `ms-catalogo` carga 9 categorías y 85 productos desde `src/main/resources/data/` y `ms-usuarios` crea la cuenta del administrador **Principal**.

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

**Configurar las claves (solo la primera vez).** En cada microservicio, copia `secrets.properties.example` como `secrets.properties` y completa los valores:

| Clave | Dónde | Qué es |
|---|---|---|
| `app.jwt.secret` | Los tres | Clave para firmar el JWT. **Debe ser la misma en los tres microservicios** |
| `DB_PASSWORD` | Los tres | Contraseña de MySQL (vacía si usas XAMPP sin contraseña) |
| `app.admin.password` | `ms-usuarios` | Contraseña de la cuenta Principal que se crea al primer arranque |

> ⚠️ `secrets.properties` está en `.gitignore` y **nunca** se sube al repositorio. Las bases de datos se crean solas al arrancar.

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
- No subir `node_modules/`, `target/`, `dist/`, `.env`, `secrets.properties` ni configuraciones personales del editor.
- Cada integrante trabaja en su microservicio; si hay que tocar el de otro, se coordina antes.

---

## 📌 Estado del proyecto

### ✅ Completado
- [x] **Fase 1:** sitio estático con HTML, CSS, Bootstrap y JavaScript
- [x] **Fase 2:** migración a React con componentes, contextos, rutas protegidas y pruebas con Vitest
- [x] **Fase 3:** backend con tres microservicios Spring Boot y MySQL, conectados al frontend
- [x] Servicios, controladores REST, mappers y manejo global de errores en los tres microservicios
- [x] Autenticación con Spring Security y JWT (con refresh token) y token de servicio entre microservicios
- [x] Documentación de los endpoints con Swagger y versionado `/api/v1`
- [x] Frontend conectado a la API con sesión persistente y renovación automática del token
- [x] Panel por rol: administrador completo y vendedor de solo lectura (Pedidos e Inventario)
- [x] CRUD de productos, reposición y ajuste de stock, y cambio de estado de pedidos
- [x] Fotos para el catálogo, nombradas por código de producto
- [x] Pruebas unitarias: 36 en `ms-usuarios`, 18 en `ms-catalogo`, 25 en `ms-ventas` y 77 en el frontend
- [x] Documentación de APIs e integración (Anexos 2 y 3), manual de usuario (Anexo 4) y planilla de requisitos

---

<p align="center">
  Proyecto académico · Duoc UC · 2026<br>
  Los nombres, precios y datos de la tienda son ficticios.
</p>
