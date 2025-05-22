"""
Content models for saved content and reading history
"""
from datetime import datetime
from typing import Optional, List, Any, Dict
from pydantic import BaseModel, Field, ConfigDict
from bson import ObjectId

from app.api.models.user import PyObjectId

class ContentBase(BaseModel):
    """
    Base content model
    """
    title: str
    summary: Optional[str] = None
    content_type: str = Field(..., description="Type of content (e.g., article, movie, event)")
    
class ContentCreate(ContentBase):
    """
    Content creation model
    """
    full_content: str
    metadata: Dict[str, Any] = Field(default_factory=dict)
    tags: List[str] = Field(default_factory=list)
    source_url: Optional[str] = None
    
class ContentInDB(ContentBase):
    """
    Content model as stored in the database
    """
    id: PyObjectId = Field(default_factory=PyObjectId, alias="_id")
    full_content: str
    metadata: Dict[str, Any] = Field(default_factory=dict)
    tags: List[str] = Field(default_factory=list)
    source_url: Optional[str] = None
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
    view_count: int = 0
    
    model_config = ConfigDict(
        populate_by_name=True,
        arbitrary_types_allowed=True,
        json_encoders={ObjectId: str}
    )

class Content(ContentBase):
    """
    Content model returned to client
    """
    id: str
    metadata: Dict[str, Any]
    tags: List[str]
    source_url: Optional[str] = None
    created_at: datetime
    view_count: int
    
    model_config = ConfigDict(
        populate_by_name=True,
        arbitrary_types_allowed=True,
        from_attributes=True
    )
    
class ContentWithFullText(Content):
    """
    Content model with full text included
    """
    full_content: str
    
class UserSavedContent(BaseModel):
    """
    Model for user's saved content
    """
    id: PyObjectId = Field(default_factory=PyObjectId, alias="_id")
    user_id: PyObjectId
    content_id: PyObjectId
    saved_at: datetime = Field(default_factory=datetime.utcnow)
    last_read_position: Optional[int] = None  # Character position for resuming
    notes: Optional[str] = None
    
    model_config = ConfigDict(
        populate_by_name=True,
        arbitrary_types_allowed=True,
        json_encoders={ObjectId: str}
    )
    
class ReadingHistory(BaseModel):
    """
    Model for user's reading history
    """
    id: PyObjectId = Field(default_factory=PyObjectId, alias="_id")
    user_id: PyObjectId
    content_id: PyObjectId
    accessed_at: datetime = Field(default_factory=datetime.utcnow)
    time_spent: Optional[int] = None  # Time spent reading in seconds
    read_position: Optional[int] = None  # Character position reached
    completed: bool = False
    
    model_config = ConfigDict(
        populate_by_name=True,
        arbitrary_types_allowed=True,
        json_encoders={ObjectId: str}
    )
