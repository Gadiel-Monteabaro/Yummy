# Yummy — Sistema de Gestión para Local de Comida

Sistema web completo para la gestión de inventario, productos y órdenes de cocina en locales gastronómicos. Desarrollado con una arquitectura separada de frontend y backend.

---

## Descripción

**Yummy** es una aplicación web orientada a la gestión interna de locales de comida. Permite administrar el inventario de productos, visualizar y gestionar órdenes en tiempo real desde cocina, y mantener un control centralizado del negocio.

---

## Funcionalidades

- **Gestión de productos** — Alta, baja y modificación de productos del menú/inventario
- **Visualización de órdenes en cocina** — Panel en tiempo real para que el equipo de cocina vea las órdenes entrantes
- **Control de inventario** — Seguimiento de stock y disponibilidad de productos
- **Interfaz intuitiva** — Diseño limpio y responsivo adaptado al flujo de trabajo de un local de comida

---

## Tecnologías

### Backend — [`Gadiel-Monteabaro/Yummy`](https://github.com/Gadiel-Monteabaro/Yummy)

| Tecnología | Uso |
|---|---|
| **Node.js** | Entorno de ejecución |
| **TypeScript** | Lenguaje principal |
| **Express v5** | Framework HTTP / API REST |
| **PostgreSQL** | Base de datos relacional |
| **pg** | Driver de conexión a PostgreSQL |
| **express-validator** | Validación de datos de entrada |
| **cors** | Manejo de CORS para el frontend |
| **dotenv** | Variables de entorno |
| **morgan** | Logger de requests HTTP |
| **tsx / ts-node** | Ejecución de TypeScript en desarrollo |

### Frontend — [`Gadiel-Monteabaro/yummy-frontend`](https://github.com/Gadiel-Monteabaro/yummy-frontend)

| Tecnología | Uso |
|---|---|
| **React 19** | Librería de UI |
| **TypeScript** | Lenguaje principal |
| **Vite** | Build tool y servidor de desarrollo |
| **Tailwind CSS v4** | Estilos y diseño responsivo |
| **React Router DOM v7** | Navegación entre páginas |
| **TanStack Query (React Query)** | Fetching y caché de datos del servidor |
| **Zustand** | Manejo de estado global |
| **React Hook Form + Zod** | Formularios con validación de esquemas |
| **Axios** | Cliente HTTP para consumir la API |
| **Headless UI** | Componentes de UI accesibles |
| **Lucide React** | Íconos |
| **Sonner** | Notificaciones/toasts |

---

## Estructura del proyecto

```
Yummy/                  ← Backend
└── src/
    ├── server.ts       ← Entry point del servidor
    └── ...             ← Rutas, controladores, modelos

yummy-frontend/         ← Frontend
├── public/
└── src/
    ├── main.tsx        ← Entry point de React
    └── ...             ← Componentes, páginas, hooks, stores
```

---
### Requisitos previos

- Node.js 18+
- PostgreSQL
- npm o yarn

---
## Repositorios

| Repositorio | Descripción |
|---|---|
| [Yummy (Backend)](https://github.com/Gadiel-Monteabaro/Yummy) | API REST con Node.js, Express y PostgreSQL |
| [yummy-frontend](https://github.com/Gadiel-Monteabaro/yummy-frontend) | SPA con React, Vite y Tailwind CSS |

---

## Autor

**Gadiel Monteabaro**
- GitHub: [@Gadiel-Monteabaro](https://github.com/Gadiel-Monteabaro)
