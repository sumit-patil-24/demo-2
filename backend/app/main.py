from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.config import settings
from app.database import Base, engine
from app import models  # noqa: F401 - registers SQLAlchemy models
from app.routers import auth, businesses, products, enquiries, admin

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Convenient for this assignment starter. For production, use Alembic migrations.
    Base.metadata.create_all(bind=engine)
    yield

app = FastAPI(title="LocalBizHub API", version="0.1.0", lifespan=lifespan)
origins = [origin.strip() for origin in settings.cors_origins.split(",") if origin.strip()]
app.add_middleware(CORSMiddleware, allow_origins=origins, allow_credentials=True, allow_methods=["*"], allow_headers=["*"])

@app.get("/")
def root():
    return {"message": "LocalBizHub API", "docs": "/docs", "health": "/health"}

@app.get("/health")
def health():
    return {"status": "ok"}

app.include_router(auth.router)
app.include_router(businesses.router)
app.include_router(products.router)
app.include_router(enquiries.router)
app.include_router(admin.router)
