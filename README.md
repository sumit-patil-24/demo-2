# LocalBizHub frontend (React + Vite + Tailwind)
Frontend only. Docker, CI/CD, Nginx and the backend belong to teammates.

## Run
    cp .env.example .env
    npm install
    npm run dev
`VITE_DEMO_MODE=true` serves sample data from `src/data/demo.js` (a banner is shown). Set it to `false` to call `VITE_API_BASE_URL`; failures show real error messages, never fake success.

## Provisional API contract (unconfirmed; edit `src/services/endpoints.js`)
- POST /auth/login {email,password} -> {token,user:{name,email,role}}
- POST /auth/register {name,email,password,role: customer|owner} -> same
- GET /businesses?q&category&location&sort&page&pageSize -> {items,total}
- GET /businesses/:id -> business with `products[]`
- POST /enquiries {name,email,message,businessId}
- GET /categories -> string[]

`src/routes/Guard.jsx` is a UX-only guard; the backend must enforce roles.

## Not built yet
Customer, Business Owner and Admin dashboards, product CRUD, image upload, charts, related businesses. Nothing has been installed, built or tested yet.
