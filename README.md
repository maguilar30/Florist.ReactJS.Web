# Floristería Yada — React SPA

Single-page application for **Floristería Yada**, built with **React 19**, **TypeScript**, **Vite**, and **React Router**. It talks to the **FastAPI** backend in `../server` (MySQL, JWT, camelCase JSON). The HTTP helper also accepts PascalCase keys if they appear.

## Quick start

Run the API first (see `../server/README.md`), then:

```powershell
cd client
npm install
Copy-Item .env.example .env
npm run dev
```

Open [http://localhost:5173](http://localhost:5173).

Seeded admin (empty database): `admin@yadacr.com` / `YadaAdmin123!`.

## API configuration

Copy `.env.example` to `.env`:

```env
VITE_API_BASE_URL=/api
VITE_API_PROXY_TARGET=http://localhost:5000
```

During development, requests to `/api/*` are proxied to `VITE_API_PROXY_TARGET` (see `vite.config.ts`). Leave `VITE_API_BASE_URL` as `/api` to use that proxy. If you set an absolute API URL instead, the FastAPI CORS list must include `http://localhost:5173`.

## What the SPA does

- Public catalog and product detail (live data from `GET /api/products`)
- Local cart (`localStorage`), delivery fees, and **Solicitar pedido** (`POST /api/orders`)
- Login, register, and profile (`/api/auth/*`)
- Admin: products, CRM customers + registered clients, and orders (status, address, fee, total, notes)

If the catalog request fails, the products page falls back to a small demo list so the layout still works.

## Delivery fees (cart)

| Option | Fee |
|--------|-----|
| Recoger en tienda (`pickup`) | $0 |
| Hasta 2 km (`up_to_2km`) | $5 |
| Hasta 5 km (`up_to_5km`) | $10 |
| Más de 5 km (`over_5km`) | $20 |

Home delivery requires an address. Checkout emails `info@yadacr.com` (via the API) and stores the order. The shop shows that the team will contact the customer to arrange payment — there is no online charge.

## API used by the client

JSON field names below are camelCase as the UI expects.

### Authentication

| Method | Path | Auth | Body |
|--------|------|------|------|
| POST | `/api/auth/login` | No | `{ email, password }` |
| POST | `/api/auth/register` | No | `{ email, password, fullName, phone? }` |
| GET | `/api/auth/me` | Bearer JWT | — |

Users with role `Admin` (case-insensitive) see **Pedidos**, **Productos**, and **Clientes**.

### Products

| Method | Path | Auth |
|--------|------|------|
| GET | `/api/products` | No |
| GET | `/api/products/{id}` | No |
| POST / PUT / DELETE | `/api/products` | Admin |

### Customers and clients (admin)

| Method | Path | Auth |
|--------|------|------|
| GET / POST / PUT / DELETE | `/api/customers` | Admin |
| GET | `/api/clients` | Admin |

### Orders

| Method | Path | Auth |
|--------|------|------|
| POST | `/api/orders` | No (cart checkout) |
| GET / PUT | `/api/orders` | Admin |

Checkout body includes `customerName`, `customerEmail`, `customerPhone`, optional `deliveryAddress` / `notes`, `deliveryOption`, and `items: [{ productId, quantity }]`.

Admin order statuses: pago pendiente, pagado, en preparación, listo para recoger, en camino, entregado, cancelado.

## Scripts

- `npm run dev` — development server
- `npm run build` — production build to `dist/`
- `npm run preview` — preview production build
- `npm run lint` — oxlint

## Routes

| Path | Description |
|------|-------------|
| `/` | Home |
| `/productos` | Product catalog |
| `/productos/:id` | Product detail |
| `/carrito` | Cart, delivery option, order request |
| `/login`, `/registro` | Authentication |
| `/cuenta` | Profile (authenticated) |
| `/admin/pedidos` | Order management (admin) |
| `/admin/productos` | Catalog CRUD (admin) |
| `/admin/clientes` | CRM customers and registered clients (admin) |
| `/contacto` | Contact |

## Project layout

```
client/
  src/
    api/           # auth, products, customers, clients, orders
    context/       # auth + cart
    pages/         # shop and admin screens
    components/    # layout, product card, UI
    delivery.ts    # delivery option labels and fees
    types/         # shared TypeScript models
```
