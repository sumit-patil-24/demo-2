from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy import or_
from sqlalchemy.orm import Session
from app.database import get_db
from app.dependencies import get_current_user, require_role
from app.models import Business, User
from app.schemas import BusinessIn, BusinessOut

router = APIRouter(prefix="/businesses", tags=["Businesses"])

@router.get("", response_model=list[BusinessOut])
def list_businesses(search: str | None = None, category: str | None = None, location: str | None = None,
                    approved_only: bool = True, db: Session = Depends(get_db)):
    q = db.query(Business)
    if approved_only:
        q = q.filter(Business.approved.is_(True))
    if search:
        term = f"%{search}%"
        q = q.filter(or_(Business.name.ilike(term), Business.description.ilike(term)))
    if category:
        q = q.filter(Business.category.ilike(f"%{category}%"))
    if location:
        q = q.filter(Business.location.ilike(f"%{location}%"))
    return q.order_by(Business.created_at.desc()).all()

@router.post("", response_model=BusinessOut, status_code=201)
def create_business(data: BusinessIn, db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    business = Business(**data.model_dump(), owner_id=user.id, approved=False)
    db.add(business)
    db.commit()
    db.refresh(business)
    return business

@router.get("/mine", response_model=list[BusinessOut])
def my_businesses(db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    return db.query(Business).filter(Business.owner_id == user.id).all()

@router.put("/{business_id}", response_model=BusinessOut)
def update_business(business_id: int, data: BusinessIn, db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    business = db.get(Business, business_id)
    if not business:
        raise HTTPException(status_code=404, detail="Business not found")
    if business.owner_id != user.id and user.role != "admin":
        raise HTTPException(status_code=403, detail="Only the owner or admin can update this business")
    for key, value in data.model_dump().items():
        setattr(business, key, value)
    if user.role != "admin":
        business.approved = False
    db.commit()
    db.refresh(business)
    return business

@router.delete("/{business_id}", status_code=204)
def delete_business(business_id: int, db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    business = db.get(Business, business_id)
    if not business:
        raise HTTPException(status_code=404, detail="Business not found")
    if business.owner_id != user.id and user.role != "admin":
        raise HTTPException(status_code=403, detail="Only the owner or admin can delete this business")
    db.delete(business)
    db.commit()
