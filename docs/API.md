# LocalBizHub API reference (base `/api`)

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

Errors are always JSON: `{ "message": "..." }` (validation errors also include `errors: { field: message }`).

Admin also has `GET /admin/users?role&q&page&pageSize` and `DELETE /admin/users/:id` (cannot delete yourself or another admin).
