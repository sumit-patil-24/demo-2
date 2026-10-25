from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app.dependencies import require_role
from app.models import Business, User

router = APIRouter(prefix="/admin", tags=["Admin"])

@router.get("/stats")
def stats(db: Session = Depends(get_db), admin: User = Depends(require_role("admin"))):
    return {
        "users": db.query(User).count(),
        "businesses": db.query(Business).count(),
        "pending_businesses": db.query(Business).filter(Business.approved.is_(False)).count(),
    }

@router.get("/businesses")
def all_businesses(db: Session = Depends(get_db), admin: User = Depends(require_role("admin"))):
    return db.query(Business).order_by(Business.created_at.desc()).all()

@router.patch("/businesses/{business_id}/approval")
def approve_business(business_id: int, approved: bool, db: Session = Depends(get_db), admin: User = Depends(require_role("admin"))):
    business = db.get(Business, business_id)
    if not business:
        raise HTTPException(status_code=404, detail="Business not found")
    business.approved = approved
    db.commit()
    db.refresh(business)
    return {"id": business.id, "approved": business.approved}
