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
VITE_COMPANY_ID=yada
```

`VITE_COMPANY_ID` is the company **slug** (not the database UUID). Every API request sends it as `X-Company-Id`, so this SPA instance only sees that company's products, customers, orders, and users. Cart and auth tokens in `localStorage` are also keyed by this slug.

During development, requests to `/api/*` are proxied to `VITE_API_PROXY_TARGET` (see `vite.config.ts`). Leave `VITE_API_BASE_URL` as `/api` to use that proxy. If you set an absolute API URL instead, the FastAPI CORS list must include `http://localhost:5173`.

## What the SPA does

- Public catalog and product detail (live data from `GET /api/products`, including `stockQuantity`)
- Local cart (`localStorage`) capped to available stock, delivery fees from `GET /api/delivery-fees`, and **Solicitar pedido** (`POST /api/orders`; the API deducts inventory and restores it if the order is later cancelled)
- Login, register, and profile (`/api/auth/*`)
- Account page shows the signed-in profile and loyalty stars (one star per delivered order); **Mis pedidos** lists that user's orders (`GET /api/orders/mine`) and each order's history
- Contact page and footer load shop address, phone, hours, email, and social links from `GET /api/contact-info`
- Admin: products, product categories, CRM customers + registered clients, orders (including creating an order for a customer), discount codes (with an overall redemption cap), loyalty rewards, customers with loyalty stars, contact messages, shop contact details, and delivery fees

If the catalog request fails, the products page falls back to a small demo list so the layout still works.

## Delivery fees (cart)

The cart loads options from `GET /api/delivery-fees`. Admins add, edit, and remove options at `/admin/envio` (`PUT /api/delivery-fees`). Defaults are seeded only when a company has none: Recoger en tienda $0, Hasta 2 km $5, Hasta 5 km $10, Más de 5 km $20.

Home delivery requires an address. Checkout emails `info@yadacr.com` (via the API) and stores the order. The shop shows that the team will contact the customer to arrange payment — there is no online charge.

## API used by the client

JSON field names below are camelCase as the UI expects.

### Authentication

| Method | Path | Auth | Body |
|--------|------|------|------|
| POST | `/api/auth/login` | No | `{ email, password }` |
| POST | `/api/auth/register` | No | `{ email, password, fullName, phone? }` |
| POST | `/api/auth/forgot-password` | No | `{ email }` |
| POST | `/api/auth/reset-password` | No | `{ token, password }` |
| GET | `/api/auth/me` | Bearer JWT | — |

Users with role `Admin` (case-insensitive) see **Pedidos**, **Productos**, and **Clientes**.

### Products

| Method | Path | Auth |
|--------|------|------|
| GET | `/api/products` | No |
| GET | `/api/products/{id}` | No |
| POST / PUT / DELETE | `/api/products` | Admin |
| GET | `/api/product-categories` | No |
| POST / PUT / DELETE | `/api/product-categories` | Admin |

### Customers and clients (admin)

| Method | Path | Auth |
|--------|------|------|
| GET / POST / PUT / DELETE | `/api/customers` | Admin |
| GET | `/api/clients` | Admin |
| POST | `/api/contact-messages` | No (contact form) |
| GET / PATCH / DELETE | `/api/contact-messages` | Admin |
| GET | `/api/contact-info` | No |
| PUT | `/api/contact-info` | Admin |
| GET | `/api/delivery-fees` | No |
| PUT | `/api/delivery-fees` | Admin |
| GET / POST / PUT / DELETE | `/api/discount-codes` | Admin |
| POST | `/api/discount-codes/preview` | No (optional JWT) |
| GET | `/api/loyalty/me` | JWT |
| GET | `/api/loyalty/accounts/{userId}` | Admin |
| GET | `/api/loyalty/members` | Admin |
| GET / POST / PUT / DELETE | `/api/loyalty/rewards` | Admin |

### Orders

| Method | Path | Auth |
|--------|------|------|
| POST | `/api/orders` | No (cart checkout; linked to the user if logged in) |
| POST | `/api/orders/admin` | Admin (order on behalf of a customer; optional `userId`) |
| GET | `/api/orders/mine` | JWT (own orders) |
| GET | `/api/orders/mine/{id}/history` | JWT (own order timeline) |
| GET / PUT | `/api/orders` | Admin |
| GET | `/api/orders/{id}/history` | Admin |

Checkout body includes `customerName`, `customerEmail`, `customerPhone`, optional `deliveryAddress` / `notes`, `deliveryOption`, and `items: [{ productId, quantity }]`.

Admin order statuses: pago pendiente, pagado, en preparación, listo para recoger, en camino, entregado, cancelado. Changing status emails the customer after the update is saved. Creation, status changes, and completion (`delivered`) are stored in order history.

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
| `/olvide-contrasena` | Request a password-reset email |
| `/restablecer-contrasena` | Set a new password from the email link |
| `/cuenta` | Profile (authenticated) |
| `/mis-pedidos` | Own orders and history (authenticated) |
| `/admin` | Admin area (menu + Pedidos by default) |
| `/admin/productos` | Catalog CRUD (admin) |
| `/admin/clientes` | CRM customers and registered clients (admin) |
| `/admin/mensajes` | Contact form inbox (admin) |
| `/admin/contacto` | Shop contact details (admin) |
| `/admin/envio` | Delivery fees (admin) |
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
