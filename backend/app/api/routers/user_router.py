"""
User router for user management
"""
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm

from app.api.models.user import User, UserCreate, UserUpdate, UserInDB, Token
from app.auth.jwt import (
    authenticate_user, create_access_token, get_current_active_user,
    get_password_hash, get_user_by_email
)
from app.db.mongodb import get_database
from app.utils.config import settings

from datetime import timedelta

router = APIRouter()

@router.post("/register", response_model=User)
async def register_user(user_data: UserCreate):
    """
    Register a new user
    """
    try:
        db = get_database()
        
        # Check if email already exists
        if await get_user_by_email(user_data.email):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Email already registered"
            )
        
        # Create new user
        hashed_password = get_password_hash(user_data.password)
        user_in_db = UserInDB(
            email=user_data.email,
            username=user_data.username,
            full_name=user_data.full_name,
            hashed_password=hashed_password
        )
        
        # Insert to database
        user_dict = user_in_db.model_dump(by_alias=True, exclude={"id"})
        # Make sure we're not trying to set an ID that doesn't exist yet
        if "_id" in user_dict and user_dict["_id"] is None:
            del user_dict["_id"]
            
        result = await db.users.insert_one(user_dict)
        
        # Return created user
        created_user = await db.users.find_one({"_id": result.inserted_id})
        if not created_user:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to retrieve created user"
            )
            
        return User(
            id=str(created_user["_id"]),
            email=created_user["email"],
            username=created_user["username"],
            full_name=created_user.get("full_name"),
            is_active=created_user["is_active"],
            created_at=created_user["created_at"]
        )
    except Exception as e:
        # Log the error and return a user-friendly message
        import logging
        logging.error(f"Error registering user: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"An error occurred while registering the user: {str(e)}"
        )

@router.post("/login", response_model=Token)
async def login_for_access_token(form_data: OAuth2PasswordRequestForm = Depends()):
    """
    OAuth2 compatible token login, get an access token for future requests
    """
    print(f"form data sent from front end: {form_data}")
    user = await authenticate_user(form_data.username, form_data.password)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": str(user.id)}, expires_delta=access_token_expires
    )
    
    return {"access_token": access_token, "token_type": "bearer"}

@router.get("/me", response_model=User)
async def read_users_me(current_user: UserInDB = Depends(get_current_active_user)):
    """
    Get current user
    """
    return current_user

@router.put("/me", response_model=User)
async def update_user_me(
    user_update: UserUpdate,
    current_user: UserInDB = Depends(get_current_active_user)
):
    """
    Update current user
    """
    try:
        db = get_database()
        
        # Check email doesn't exist if changing
        if user_update.email and user_update.email != current_user.email:
            if await get_user_by_email(user_update.email):
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Email already registered"
                )
        
        # Update user
        update_data = user_update.model_dump(exclude_unset=True)
        if update_data:
            # Set the updated_at timestamp
            from datetime import datetime
            update_data["updated_at"] = datetime.utcnow()
            
            # Convert user ID to ObjectId for proper MongoDB query
            from bson import ObjectId
            user_id = current_user.id
            if not isinstance(user_id, ObjectId):
                try:
                    user_id = ObjectId(user_id)
                except:
                    raise HTTPException(
                        status_code=status.HTTP_400_BAD_REQUEST,
                        detail="Invalid user ID format"
                    )
            
            result = await db.users.update_one(
                {"_id": user_id},
                {"$set": update_data}
            )
            
            if result.matched_count == 0:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail="User not found"
                )
        
        # Return updated user
        updated_user = await db.users.find_one({"_id": user_id})
        if not updated_user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Failed to retrieve updated user"
            )
            
        return User(
            id=str(updated_user["_id"]),
            email=updated_user["email"],
            username=updated_user["username"],
            full_name=updated_user.get("full_name"),
            is_active=updated_user["is_active"],
            created_at=updated_user["created_at"]
        )
    except HTTPException:
        raise  # Re-raise HTTP exceptions as they are already properly formatted
    except Exception as e:
        import logging
        logging.error(f"Error updating user: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"An error occurred while updating the user: {str(e)}"
        )
