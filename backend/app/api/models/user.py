"""
User models for database and API interactions
"""
from datetime import datetime
from typing import Optional, List
from pydantic import BaseModel, EmailStr, Field, ConfigDict
from bson import ObjectId

# Custom type for MongoDB ObjectId
class PyObjectId(str):
    """
    Custom type for handling MongoDB's ObjectId
    Compatible with Pydantic v2
    """
    @classmethod
    def __get_validators__(cls):
        yield cls.validate
        
    @classmethod
    def validate(cls, v, info=None):  # Added info parameter for Pydantic v2
        if not ObjectId.is_valid(v):
            raise ValueError("Invalid ObjectId")
        return str(ObjectId(v))
    
    @classmethod
    def __get_pydantic_json_schema__(cls, _core_schema, field_schema):
        field_schema.update(type="string")

# User Models
class UserBase(BaseModel):
    """
    Base User model
    """
    email: EmailStr
    username: str
    full_name: Optional[str] = None

class UserCreate(UserBase):
    """
    User creation model
    """
    password: str

class UserInDB(UserBase):
    """
    User model as stored in the database
    """
    id: Optional[PyObjectId] = Field(default_factory=lambda: str(ObjectId()), alias="_id")
    hashed_password: str
    is_active: bool = True
    is_verified: bool = False
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
    last_login: Optional[datetime] = None
    
    model_config = ConfigDict(
        populate_by_name=True,
        arbitrary_types_allowed=True,
        json_encoders={ObjectId: str}
    )

class User(UserBase):
    """
    User model returned to client
    """
    id: str
    is_active: bool
    created_at: datetime
    
    model_config = ConfigDict(
        populate_by_name=True,
        arbitrary_types_allowed=True,
        from_attributes=True
    )

class UserUpdate(BaseModel):
    """
    User update model
    """
    full_name: Optional[str] = None
    email: Optional[EmailStr] = None
    
    model_config = ConfigDict(
        arbitrary_types_allowed=True
    )

class Token(BaseModel):
    """
    Token schema
    """
    access_token: str
    token_type: str = "bearer"
    
class TokenData(BaseModel):
    """
    Token payload schema
    """
    user_id: Optional[str] = None
