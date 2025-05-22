"""
Authentication handlers for JWT-based authentication
"""
from datetime import datetime, timedelta
from typing import Optional, Dict, Any

from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from jose import JWTError, jwt
from passlib.context import CryptContext
from pydantic import ValidationError
from bson import ObjectId

from app.api.models.user import UserInDB, TokenData
from app.db.mongodb import get_database
from app.utils.config import settings

# Password hashing context
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# OAuth2 scheme for token authentication
oauth2_scheme = OAuth2PasswordBearer(tokenUrl=f"{settings.API_V1_STR}/auth/login")

def verify_password(plain_password: str, hashed_password: str) -> bool:
    """
    Verify a password against a hash
    """
    return pwd_context.verify(plain_password, hashed_password)

def get_password_hash(password: str) -> str:
    """
    Hash a password
    """
    return pwd_context.hash(password)

async def get_user_by_email(email: str) -> Optional[UserInDB]:
    """
    Get a user by email
    """
    try:
        db = get_database()
        user_data = await db.users.find_one({"email": email})
        if user_data:
            # Convert MongoDB ObjectId to string for Pydantic model
            if "_id" in user_data and isinstance(user_data["_id"], ObjectId):
                user_data["_id"] = str(user_data["_id"])  # Convert ObjectId to string
            return UserInDB(**user_data)
        return None
    except Exception as e:
        import logging
        logging.error(f"Error retrieving user by email: {str(e)}")
        return None

async def authenticate_user(email: str, password: str) -> Optional[UserInDB]:
    """
    Authenticate a user
    """
    user = await get_user_by_email(email)
    if not user:
        return None
    if not verify_password(password, user.hashed_password):
        return None
    
    # Update last login time
    db = get_database()
    await db.users.update_one(
        {"_id": user.id},
        {"$set": {"last_login": datetime.utcnow()}}
    )
    
    return user

def create_access_token(data: Dict[str, Any], expires_delta: Optional[timedelta] = None) -> str:
    """
    Create a JWT access token
    """
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, settings.SECRET_KEY, algorithm="HS256")
    return encoded_jwt

async def get_current_user(token: str = Depends(oauth2_scheme)) -> UserInDB:
    """
    Get current authenticated user from token
    """
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=["HS256"])
        user_id: str = payload.get("sub")
        if user_id is None:
            raise credentials_exception
        token_data = TokenData(user_id=user_id)
    except (JWTError, ValidationError):
        raise credentials_exception
    
    try:
        db = get_database()
        # Convert the string ID to ObjectId for MongoDB
        object_id = ObjectId(token_data.user_id)
        user_data = await db.users.find_one({"_id": object_id})
        if user_data is None:
            raise credentials_exception
            
        # Convert ObjectId to string for Pydantic model
        if "_id" in user_data and isinstance(user_data["_id"], ObjectId):
            user_data["_id"] = str(user_data["_id"])
            
        return UserInDB(**user_data)
    except Exception as e:
        import logging
        logging.error(f"Error fetching user: {str(e)}")
        raise credentials_exception

async def get_current_active_user(current_user: UserInDB = Depends(get_current_user)) -> UserInDB:
    """
    Get current active user
    """
    if not current_user.is_active:
        raise HTTPException(status_code=400, detail="Inactive user")
    return current_user
