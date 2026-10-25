from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app.dependencies import get_current_user
from app.models import Business, Product, User
from app.schemas import ProductIn, ProductOut

router = APIRouter(tags=["Products"])

@router.get("/businesses/{business_id}/products", response_model=list[ProductOut])
def list_products(business_id: int, db: Session = Depends(get_db)):
    business = db.get(Business, business_id)
    if not business or not business.approved:
        raise HTTPException(status_code=404, detail="Approved business not found")
    return db.query(Product).filter(Product.business_id == business_id).all()

@router.post("/businesses/{business_id}/products", response_model=ProductOut, status_code=201)
def create_product(business_id: int, data: ProductIn, db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    business = db.get(Business, business_id)
    if not business:
        raise HTTPException(status_code=404, detail="Business not found")
    if business.owner_id != user.id and user.role != "admin":
        raise HTTPException(status_code=403, detail="Only the owner or admin can add products")
    product = Product(**data.model_dump(), business_id=business_id)
    db.add(product)
    db.commit()
    db.refresh(product)
    return product

@router.put("/products/{product_id}", response_model=ProductOut)
def update_product(product_id: int, data: ProductIn, db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    product = db.get(Product, product_id)
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    business = db.get(Business, product.business_id)
    if business.owner_id != user.id and user.role != "admin":
        raise HTTPException(status_code=403, detail="Only the owner or admin can edit products")
    for key, value in data.model_dump().items():
        setattr(product, key, value)
    db.commit()
    db.refresh(product)
    return product

@router.delete("/products/{product_id}", status_code=204)
def delete_product(product_id: int, db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    product = db.get(Product, product_id)
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    business = db.get(Business, product.business_id)
    if business.owner_id != user.id and user.role != "admin":
        raise HTTPException(status_code=403, detail="Only the owner or admin can delete products")
    db.delete(product)
    db.commit()
