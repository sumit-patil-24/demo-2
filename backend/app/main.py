from sqlalchemy import text
from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from typing import List, Optional
import psutil
import time

from app.database import Base, engine, get_db
from app import models, schemas

# Initialize DB Tables
Base.metadata.create_all(bind=engine)

app = FastAPI(title="LocalBizHub API", version="1.0.0")

# Enable CORS for React Frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

START_TIME = time.time()

# --- Health & Monitoring Endpoint ---
@app.get("/health")
def health_check(db: Session = Depends(get_db)):
    db_status = "ok"
    try:
        db.execute(text("SELECT 1"))
    except Exception:
        db_status = "unreachable"

    return {
        "status": "healthy" if db_status == "ok" else "degraded",
        "uptime_seconds": round(time.time() - START_TIME, 2),
        "database": db_status,
        "cpu_usage_percent": psutil.cpu_percent(),
        "memory_usage_percent": psutil.virtual_memory().percent
    }

# --- Customer Endpoints ---
@app.get("/api/v1/businesses", response_model=List[schemas.BusinessResponse])
def search_businesses(
    category: Optional[str] = None, 
    location: Optional[str] = None, 
    db: Session = Depends(get_db)
):
    query = db.query(models.Business).filter(models.Business.status == "approved")
    if category:
        query = query.filter(models.Business.category.ilike(f"%{category}%"))
    if location:
        query = query.filter(models.Business.location.ilike(f"%{location}%"))
    return query.all()

@app.post("/api/v1/enquiries", response_model=schemas.EnquiryResponse)
def submit_enquiry(enquiry: schemas.EnquiryCreate, db: Session = Depends(get_db)):
    db_enquiry = models.Enquiry(**enquiry.dict())
    db.add(db_enquiry)
    db.commit()
    db.refresh(db_enquiry)
    return db_enquiry

# --- Business Owner Endpoints ---
@app.post("/api/v1/businesses", response_model=schemas.BusinessResponse)
def create_business(business: schemas.BusinessCreate, db: Session = Depends(get_db)):
    db_business = models.Business(**business.dict(), status="pending")
    db.add(db_business)
    db.commit()
    db.refresh(db_business)
    return db_business

@app.post("/api/v1/products", response_model=schemas.ProductResponse)
def add_product(product: schemas.ProductCreate, db: Session = Depends(get_db)):
    db_product = models.Product(**product.dict())
    db.add(db_product)
    db.commit()
    db.refresh(db_product)
    return db_product

@app.delete("/api/v1/products/{product_id}")
def delete_product(product_id: int, db: Session = Depends(get_db)):
    prod = db.query(models.Product).filter(models.Product.id == product_id).first()
    if not prod:
        raise HTTPException(status_code=404, detail="Product not found")
    db.delete(prod)
    db.commit()
    return {"message": "Product deleted successfully"}

# --- Admin Endpoints ---
@app.get("/api/v1/admin/businesses", response_model=List[schemas.BusinessResponse])
def get_all_businesses_admin(db: Session = Depends(get_db)):
    return db.query(models.Business).all()

@app.put("/api/v1/admin/businesses/{business_id}/status")
def update_business_status(business_id: int, status: str, db: Session = Depends(get_db)):
    biz = db.query(models.Business).filter(models.Business.id == business_id).first()
    if not biz:
        raise HTTPException(status_code=404, detail="Business not found")
    biz.status = status
    db.commit()
    return {"message": f"Business status updated to {status}"}
