from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime

# Product Schemas
class ProductBase(BaseModel):
    name: str
    price: float
    description: Optional[str] = None
    image_url: Optional[str] = None

class ProductCreate(ProductBase):
    business_id: int

class ProductResponse(ProductBase):
    id: int
    business_id: int
    class Config:
        from_attributes = True

# Business Schemas
class BusinessBase(BaseModel):
    name: str
    category: str
    location: str
    description: Optional[str] = None

class BusinessCreate(BusinessBase):
    owner_id: int

class BusinessResponse(BusinessBase):
    id: int
    status: str
    created_at: datetime
    products: List[ProductResponse] = []
    class Config:
        from_attributes = True

# Enquiry Schemas
class EnquiryCreate(BaseModel):
    business_id: int
    customer_name: str
    customer_email: str
    message: str

class EnquiryResponse(EnquiryCreate):
    id: int
    status: str
    created_at: datetime
    class Config:
        from_attributes = True
