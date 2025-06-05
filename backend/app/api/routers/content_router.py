"""
Content router for managing saved content
"""
from typing import List, Optional, Dict
from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException, Query, Path, status
from bson import ObjectId

from app.api.models.user import UserInDB
from app.api.models.content import SavedSearchResult

from app.auth.jwt import get_current_active_user
from app.db.mongodb import get_database

router = APIRouter()

@router.post("/save", status_code=status.HTTP_201_CREATED)
async def save_content_v2(
    content_data: dict,
    current_user: UserInDB = Depends(get_current_active_user)
):
    db = get_database()
        
    # This is saving a search result
    if all(k in content_data for k in ["title", "content"]):
        # Create saved search result
        saved_search = SavedSearchResult(
            id=ObjectId(),  # Explicitly set a new ObjectId
            user_id=current_user.id,
            title=content_data["title"],
            snippet=content_data.get("snippet", ""),
            content=content_data["content"],
            sources=content_data.get("sources", []),
            saved_at=datetime.utcnow()
        )

        try:
            result = await db.saved_search_results.insert_one(saved_search.model_dump(by_alias=True))       
            return {"message": "Content saved successfully", "id": str(result.inserted_id)}
        except Exception as e:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_ERROR,
                detail="Error while saving the content. Please try again later."
            )


        
    else:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid save request. Must provide title and content"
        )


@router.get("/saved", response_model=List[Dict])
async def get_saved_search_results(
    current_user: UserInDB = Depends(get_current_active_user)
):
    """
    Get user's saved search results
    """
    db = get_database()
    
    saved_results = []
    cursor = db.saved_search_results.find({"user_id": current_user.id}).sort("saved_at", -1)
    
    async for document in cursor:
        saved_results.append({
            "id": str(document["_id"]),
            "title": document["title"],
            "snippet": document["snippet"],
            "content": document["content"],
            "sources": document["sources"],
            "saved_at": document["saved_at"]
        })
    
    return saved_results

@router.delete("/delete", status_code=status.HTTP_204_NO_CONTENT)
async def delete_saved_search_result(
    # content_id: str = Path(...),
    content_id = Query(str),
    current_user: UserInDB = Depends(get_current_active_user)
):
    """
    Delete a saved search result
    """
    print(f"content_id passed from front end: {content_id}")
    db = get_database()
    
    try:
        result = await db.saved_search_results.delete_one({
            "_id": content_id,
            "user_id": current_user.id
        })
        
        if result.deleted_count == 0:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Saved search result not found"
            )
    except Exception as e:
        if "not found" in str(e).lower():
            raise e
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid search result ID"
        )
