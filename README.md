# Floristería Yada — React SPA

Single-page application for **Floristería Yada**, built with **React 19**, **TypeScript**, and **Vite**. It consumes a **ASP.NET Core Web API** for products, customers, and JWT authentication.

## Quick start

```bash
cd client
npm install
npm run dev
```

Open [http://localhost:5173](http://localhost:5173).

## API configuration

Copy `.env.example` to `.env` and set your API URL:

```env
VITE_API_BASE_URL=http://localhost:5000/api
VITE_API_PROXY_TARGET=http://localhost:5000
```

During development, requests to `/api/*` are proxied to `VITE_API_PROXY_TARGET` (see `vite.config.ts`). You can leave `VITE_API_BASE_URL` unset to use the proxy path `/api`.

Enable CORS on the .NET API for the Vite origin (`http://localhost:5173`) if you call the API directly without the proxy.

## Expected .NET API contract

JSON property names may be PascalCase; the client normalizes them to camelCase.

### Authentication

| Method | Path | Auth | Body |
|--------|------|------|------|
| POST | `/api/auth/login` | No | `{ email, password }` |
| POST | `/api/auth/register` | No | `{ email, password, fullName, phone? }` |
| GET | `/api/auth/me` | Bearer JWT | — |

**Response (login/register):**

```json
{
  "token": "eyJ...",
  "expiresAt": "2026-10-21T00:00:00Z",
  "user": {
    "id": "guid",
    "email": "user@example.com",
    "fullName": "Nombre Apellido",
    "roles": ["Customer"]
  }
}
```

Users with role `Admin` (case-insensitive) can open **Clientes** (`/admin/clientes`).

### Products

| Method | Path | Auth |
|--------|------|------|
| GET | `/api/products` | No |
| GET | `/api/products/{id}` | No |

**Product:**

```json
{
  "id": 1,
  "name": "Ramo Clásico",
  "description": "...",
  "price": 45.0,
  "imageUrl": "https://...",
  "category": "Ramos",
  "inStock": true
}
```

If the API is unavailable, the catalog page shows a demo catalog so the UI remains usable.

### Customers (admin)

| Method | Path | Auth |
|--------|------|------|
| GET | `/api/customers` | Bearer |
| GET | `/api/customers/{id}` | Bearer |
| POST | `/api/customers` | Bearer |
| PUT | `/api/customers/{id}` | Bearer |
| DELETE | `/api/customers/{id}` | Bearer |

## Scripts

- `npm run dev` — development server
- `npm run build` — production build to `dist/`
- `npm run preview` — preview production build

## Routes

| Path | Description |
|------|-------------|
| `/` | Home |
| `/productos` | Product catalog |
| `/productos/:id` | Product detail |
| `/carrito` | Shopping cart (localStorage) |
| `/login`, `/registro` | Authentication |
| `/cuenta` | Profile (authenticated) |
| `/admin/clientes` | Customer CRUD (admin) |
| `/contacto` | Contact |
