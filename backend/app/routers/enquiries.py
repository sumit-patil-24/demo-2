from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app.dependencies import get_current_user
from app.models import Business, Enquiry, User
from app.schemas import EnquiryIn, EnquiryOut

router = APIRouter(prefix="/enquiries", tags=["Enquiries"])

@router.post("/{business_id}", response_model=EnquiryOut, status_code=201)
def submit_enquiry(business_id: int, data: EnquiryIn, db: Session = Depends(get_db)):
    business = db.get(Business, business_id)
    if not business or not business.approved:
        raise HTTPException(status_code=404, detail="Approved business not found")
    enquiry = Enquiry(business_id=business_id, **data.model_dump())
    db.add(enquiry)
    db.commit()
    db.refresh(enquiry)
    return enquiry

@router.get("/mine", response_model=list[EnquiryOut])
def business_enquiries(db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    owned_ids = [b.id for b in db.query(Business.id).filter(Business.owner_id == user.id).all()]
    if user.role == "admin":
        return db.query(Enquiry).order_by(Enquiry.created_at.desc()).all()
    if not owned_ids:
        return []
    return db.query(Enquiry).filter(Enquiry.business_id.in_(owned_ids)).order_by(Enquiry.created_at.desc()).all()

@router.patch("/{enquiry_id}/status", response_model=EnquiryOut)
def update_enquiry_status(enquiry_id: int, status: str, db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    if status not in {"new", "in_progress", "closed"}:
        raise HTTPException(status_code=422, detail="Status must be new, in_progress, or closed")
    enquiry = db.get(Enquiry, enquiry_id)
    if not enquiry:
        raise HTTPException(status_code=404, detail="Enquiry not found")
    business = db.get(Business, enquiry.business_id)
    if user.role != "admin" and business.owner_id != user.id:
        raise HTTPException(status_code=403, detail="Only the business owner or admin can update this enquiry")
    enquiry.status = status
    db.commit()
    db.refresh(enquiry)
    return enquiry
