from pydantic import BaseModel, ConfigDict, EmailStr, Field

class RegisterIn(BaseModel):
    email: EmailStr
    full_name: str = Field(min_length=2, max_length=120)
    password: str = Field(min_length=8, max_length=128)

class UserOut(BaseModel):
    id: int
    email: EmailStr
    full_name: str
    role: str
    model_config = ConfigDict(from_attributes=True)

class TokenOut(BaseModel):
    access_token: str
    token_type: str = "bearer"

class BusinessIn(BaseModel):
    name: str = Field(min_length=2, max_length=160)
    description: str = Field(default="", max_length=5000)
    category: str = Field(min_length=2, max_length=80)
    location: str = Field(min_length=2, max_length=120)

class BusinessOut(BusinessIn):
    id: int
    owner_id: int
    approved: bool
    model_config = ConfigDict(from_attributes=True)

class ProductIn(BaseModel):
    name: str = Field(min_length=2, max_length=160)
    description: str = Field(default="", max_length=5000)
    price: int = Field(ge=0, description="Price in paise; ₹100 = 10000")
    image_url: str | None = None

class ProductOut(ProductIn):
    id: int
    business_id: int
    model_config = ConfigDict(from_attributes=True)

class EnquiryIn(BaseModel):
    customer_name: str = Field(min_length=2, max_length=120)
    customer_email: EmailStr
    message: str = Field(min_length=5, max_length=5000)

class EnquiryOut(BaseModel):
    id: int
    business_id: int
    customer_name: str
    customer_email: EmailStr
    message: str
    status: str
    model_config = ConfigDict(from_attributes=True)
