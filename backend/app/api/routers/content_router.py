"""
Content router for managing saved content
"""
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, Path, status
from bson import ObjectId

from app.api.models.user import UserInDB
from app.api.models.content import (
    Content, ContentCreate, ContentInDB, ContentWithFullText,
    UserSavedContent, ReadingHistory
)
from app.auth.jwt import get_current_active_user
from app.db.mongodb import get_database

router = APIRouter()

@router.post("/", response_model=Content)
async def create_content(
    content_data: ContentCreate,
    current_user: UserInDB = Depends(get_current_active_user)
):
    """
    Create new content
    """
    db = get_database()
    
    # Create content in DB
    content_in_db = ContentInDB(**content_data.model_dump())
    
    result = await db.content.insert_one(content_in_db.model_dump(by_alias=True))
    
    # Return created content
    created_content = await db.content.find_one({"_id": result.inserted_id})
    return Content(
        id=str(created_content["_id"]),
        title=created_content["title"],
        summary=created_content.get("summary"),
        content_type=created_content["content_type"],
        metadata=created_content.get("metadata", {}),
        tags=created_content.get("tags", []),
        source_url=created_content.get("source_url"),
        created_at=created_content["created_at"],
        view_count=created_content["view_count"]
    )

@router.get("/", response_model=List[Content])
async def list_content(
    skip: int = Query(0, ge=0),
    limit: int = Query(10, ge=1, le=100),
    content_type: Optional[str] = None,
    tag: Optional[str] = None,
    current_user: UserInDB = Depends(get_current_active_user)
):
    """
    List content with optional filters
    """
    db = get_database()
    
    # Build filter
    filter_query = {}
    if content_type:
        filter_query["content_type"] = content_type
    if tag:
        filter_query["tags"] = tag
    
    # Get content
    cursor = db.content.find(filter_query).skip(skip).limit(limit)
    
    # Convert to list
    content_list = []
    async for document in cursor:
        content_list.append(Content(
            id=str(document["_id"]),
            title=document["title"],
            summary=document.get("summary"),
            content_type=document["content_type"],
            metadata=document.get("metadata", {}),
            tags=document.get("tags", []),
            source_url=document.get("source_url"),
            created_at=document["created_at"],
            view_count=document["view_count"]
        ))
    
    return content_list

@router.get("/{content_id}", response_model=ContentWithFullText)
async def get_content(
    content_id: str = Path(...),
    current_user: UserInDB = Depends(get_current_active_user)
):
    """
    Get specific content by ID with full text
    """
    db = get_database()
    
    try:
        content = await db.content.find_one_and_update(
            {"_id": ObjectId(content_id)},
            {"$inc": {"view_count": 1}}  # Increment view count
        )
    except:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid content ID"
        )
    
    if not content:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Content not found"
        )
    
    # Record reading history
    history = ReadingHistory(
        user_id=current_user.id,
        content_id=ObjectId(content_id)
    )
    await db.reading_history.insert_one(history.model_dump(by_alias=True))
    
    # Return content with full text
    return ContentWithFullText(
        id=str(content["_id"]),
        title=content["title"],
        summary=content.get("summary"),
        content_type=content["content_type"],
        full_content=content["full_content"],
        metadata=content.get("metadata", {}),
        tags=content.get("tags", []),
        source_url=content.get("source_url"),
        created_at=content["created_at"],
        view_count=content["view_count"]
    )

@router.post("/{content_id}/save", status_code=status.HTTP_201_CREATED)
async def save_content(
    content_id: str = Path(...),
    read_position: Optional[int] = None,
    notes: Optional[str] = None,
    current_user: UserInDB = Depends(get_current_active_user)
):
    """
    Save content for a user
    """
    db = get_database()
    
    # Check content exists
    try:
        content = await db.content.find_one({"_id": ObjectId(content_id)})
    except:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid content ID"
        )
    
    if not content:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Content not found"
        )
    
    # Check if already saved
    existing = await db.saved_content.find_one({
        "user_id": current_user.id,
        "content_id": ObjectId(content_id)
    })
    
    if existing:
        # Update existing saved content
        await db.saved_content.update_one(
            {"_id": existing["_id"]},
            {"$set": {
                "last_read_position": read_position,
                "notes": notes
            }}
        )
        return {"message": "Saved content updated"}
    
    # Save new content
    saved_content = UserSavedContent(
        user_id=current_user.id,
        content_id=ObjectId(content_id),
        last_read_position=read_position,
        notes=notes
    )
    
    await db.saved_content.insert_one(saved_content.model_dump(by_alias=True))
    
    return {"message": "Content saved successfully"}

@router.get("/saved/", response_model=List[Content])
async def get_saved_content(
    current_user: UserInDB = Depends(get_current_active_user)
):
    """
    Get user's saved content
    """
    db = get_database()
    
    # Get saved content IDs
    saved_content = []
    
    # Join saved_content and content collections
    pipeline = [
        {"$match": {"user_id": current_user.id}},
        {"$lookup": {
            "from": "content",
            "localField": "content_id",
            "foreignField": "_id",
            "as": "content"
        }},
        {"$unwind": "$content"}
    ]
    
    async for document in db.saved_content.aggregate(pipeline):
        content = document["content"]
        saved_content.append(Content(
            id=str(content["_id"]),
            title=content["title"],
            summary=content.get("summary"),
            content_type=content["content_type"],
            metadata=content.get("metadata", {}),
            tags=content.get("tags", []),
            source_url=content.get("source_url"),
            created_at=content["created_at"],
            view_count=content["view_count"]
        ))
    
    return saved_content

@router.delete("/{content_id}/save", status_code=status.HTTP_204_NO_CONTENT)
async def unsave_content(
    content_id: str = Path(...),
    current_user: UserInDB = Depends(get_current_active_user)
):
    """
    Remove content from user's saved list
    """
    db = get_database()
    
    # Delete saved content
    result = await db.saved_content.delete_one({
        "user_id": current_user.id,
        "content_id": ObjectId(content_id)
    })
    
    if result.deleted_count == 0:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Content not found in saved list"
        )
