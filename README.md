# LocalBizHub

A small-business marketplace built for the Ventrix Technologies DevOps Engineering Internship task.

## Stack
- React + Vite frontend
- Python FastAPI REST API
- PostgreSQL + SQLAlchemy
- Docker Compose
- Nginx frontend/reverse proxy
- GitHub Actions CI

## Features in this starter
- Customer registration and login with JWT access tokens
- Business profile create, update, delete, search, category/location filters
- Product CRUD APIs
- Customer enquiries and owner enquiry status updates
- Admin approval endpoints and basic statistics
- `/health` endpoint
- Dockerized services and a basic CI workflow

## Local setup (Docker recommended)
1. Install Docker Desktop and start it.
2. Copy `.env.example` to `.env`.
3. Change `POSTGRES_PASSWORD`, the password inside `DATABASE_URL`, and `JWT_SECRET_KEY` in `.env`. Keep the two database passwords identical.
4. Start services:

   ```bash
   docker compose up --build -d
   docker compose ps
   docker compose logs -f backend
   ```

5. Open:
   - Frontend: http://localhost:5173
   - API docs: http://localhost:8000/docs
   - Health: http://localhost:8000/health

Stop services with `docker compose down`. To also delete local database data, use `docker compose down -v` (destructive).

## API notes
- Register: `POST /auth/register`
- Login: `POST /auth/login` using form fields `username` (email) and `password`
- Current user: `GET /auth/me` with `Authorization: Bearer <token>`
- Create business: `POST /businesses` with a bearer token
- Public business search: `GET /businesses?search=&category=&location=`
- Add product: `POST /businesses/{business_id}/products`
- Submit enquiry: `POST /enquiries/{business_id}`
- Admin endpoints: `/admin/*`

Registration creates a `customer` role. For local development only, create the first admin by registering a user, then promote that user's row in PostgreSQL. With Docker, run `docker compose exec db psql -U localbizhub -d localbizhub` and execute:
```sql
UPDATE users SET role = 'admin' WHERE email = 'admin@example.com';
```
Do not expose database credentials or grant public access to PostgreSQL. Use a strong JWT secret in all environments.

## Development without Docker
Backend:
```bash
cd backend
python -m venv .venv
# Windows PowerShell:
.\.venv\Scripts\Activate.ps1
# macOS/Linux:
# source .venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --reload
```
Set `DATABASE_URL` to a PostgreSQL connection string or use SQLite for quick API smoke tests. If using SQLite, install the listed requirements first.

Frontend:
```bash
cd frontend
npm install
npm run dev
```
When running Vite directly, set `VITE_API_URL=http://localhost:8000` in `frontend/.env.local`; in Docker the frontend Nginx proxy handles `/api`.

## Important next steps before cloud deployment
- Add Alembic database migrations.
- Add stronger tests for authentication, authorization, CRUD and approval flows.
- Configure image upload storage (e.g. S3) and file type/size validation.
- Add frontend forms and owner/admin dashboards.
- Configure production HTTPS, secure headers, and environment secrets.
- Add Docker image publishing and SSH/SSM-based deployment steps to CI/CD.
- Document and demonstrate a 502 troubleshooting exercise with actual logs and root cause.
