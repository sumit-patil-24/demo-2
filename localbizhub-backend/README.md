# LocalBizHub backend

Node.js + Express REST API, PostgreSQL via Prisma, JWT auth, Docker Compose.

```
localbizhub/
├── backend/            Express API (src/), Prisma schema + seed (prisma/), Dockerfile
├── frontend/           <- your existing React app goes here
├── frontend-patch/     3 changed frontend files + .env.example (see "Connect the frontend")
├── docker-compose.yml  db (PostgreSQL 16) + backend
└── .env.example        copy to .env
```

## Run with Docker (API on port 5000)

```bash
cp .env.example .env
# edit .env: set JWT_SECRET, POSTGRES_PASSWORD, ADMIN_PASSWORD
docker compose up --build
curl http://localhost:5000/health        # {"status":"ok","db":"up",...}
```

On every start the backend container runs `prisma db push` (creates/updates tables), then an idempotent seed (categories, the admin from `ADMIN_EMAIL`/`ADMIN_PASSWORD`, and demo data if `SEED_DEMO_DATA=true`), then starts the API.
Reset everything: `docker compose down -v`.

## Run without Docker

```bash
# needs a local PostgreSQL; create db "localbizhub" first
cd backend && cp .env.example .env     # edit DATABASE_URL, JWT_SECRET
npm install
npx prisma db push && npm run db:seed
npm run dev
```

## Demo logins (when SEED_DEMO_DATA=true; password = SEED_DEMO_PASSWORD, default `Demo@12345`)
| Role | Email |
|---|---|
| Admin | `ADMIN_EMAIL` / `ADMIN_PASSWORD` from .env |
| Business owner | `owner1@localbizhub.example` ... `owner7@localbizhub.example` |
| Customer | `customer@localbizhub.example` |

Change or disable demo data (`SEED_DEMO_DATA=false`) outside local development.

## Connect the frontend

1. Put your React app in `frontend/` (or keep it where it is; paths below are relative to it).
2. Copy `frontend-patch/src/**` over your `src/` (3 files: `services/endpoints.js`, `services/index.js`, `pages/Explore.jsx`). This only adds `GET /locations`, so the Location dropdown no longer depends on `demo.js`.
3. In the frontend `.env` set:
   ```
   VITE_API_BASE_URL=http://localhost:5000/api
   VITE_DEMO_MODE=false
   ```
4. `npm run dev` (Vite serves on http://localhost:5173, which is the default `CORS_ORIGIN`). If you serve the frontend from another origin, add it to `CORS_ORIGIN` (comma-separated).

Everything else in your `services/` already matches: `/auth/login`, `/auth/register`, `/businesses`, `/businesses/:id`, `/enquiries`, `/categories`. Responses use the same shapes as `demo.js` (`{items,total}`, `{token,user:{name,email,role}}`, `categories: string[]`, `business.category` as a name, `price`/`rating` as numbers). The axios interceptor already sends `Authorization: Bearer <lbh_token>`, and errors come back as `{ message }`, which `errorMessage()` displays.

Role naming: the frontend registers with `role: "owner"` (not "business"), so the API uses `customer | owner | admin` in JSON. Admins cannot self-register.

## API reference (base `/api`)

Public
- `GET /categories` -> `string[]` · `GET /locations` -> `string[]`
- `GET /businesses?q&category&location&sort=newest|rating|name&page&pageSize` -> `{items,total}` (approved only; `q` matches name, description, location, category, product names)
- `GET /businesses/:id` -> business with `products[]`
- `POST /enquiries {name,email,message,businessId}` (login optional; links it to the customer if a token is sent)
- `POST /auth/register`, `POST /auth/login`, `GET /auth/me`

Customer: `GET /enquiries/mine`

Business owner (`role=owner`; one business per owner; new businesses start as `pending` and are hidden until an admin approves)
- `GET|POST|PUT /owner/business` (body uses `category` as a category *name*)
- `GET|POST /owner/products`, `PUT|DELETE /owner/products/:id`
- `GET /owner/enquiries?status&page&pageSize`, `PATCH /owner/enquiries/:id {status: new|read|replied|closed}`

Admin (`role=admin`)
- `GET /admin/businesses?status&q&page&pageSize`, `PATCH /admin/businesses/:id/status {status: pending|approved|rejected|suspended}`
- `GET|POST /admin/categories`, `PUT|DELETE /admin/categories/:id` (delete blocked while businesses use it)
- `GET /admin/enquiries?status&businessId&page&pageSize`
- `GET /admin/stats` -> user/business/enquiry counts, enquiries per day (30 days), approved businesses per category

Health: `GET /health` (also `/api/health`) returns 200 when the API can reach the database, 503 otherwise.

## Notes and limits
- Authorization is enforced on the server (JWT + role middleware); the frontend `Guard` is UX only.
- `rating` is a stored column (seeded). There is no reviews feature yet, so new businesses show 0.
- Images are URLs, not uploads.
- Schema sync uses `prisma db push` for simplicity. Before production, create real migrations: `cd backend && npx prisma migrate dev --name init` and switch the entrypoint to `prisma migrate deploy`.
