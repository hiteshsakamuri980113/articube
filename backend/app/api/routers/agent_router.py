"""
Agent router for handling information retrieval via Google ADK agents
"""
from typing import Dict, Any, Optional, List
from fastapi import APIRouter, Depends, HTTPException, Body, Query
from pydantic import BaseModel

from app.api.models.user import UserInDB
from app.auth.jwt import get_current_active_user
from app.agents.knowledge_agent import get_information
from app.db.mongodb import get_database
from datetime import datetime
import logging

router = APIRouter()

class QueryInput(BaseModel):
    """
    Input model for agent queries
    """
    query: str
    additional_context: Optional[Dict[str, Any]] = None

class AgentResponse(BaseModel):
    """
    Response model for agent queries
    """
    response: str
    sources: Optional[List[Dict[str, Any]]] = None
    metadata: Optional[Dict[str, Any]] = None

@router.post("/query", response_model=AgentResponse)
async def query_agent(
    query_input: QueryInput,
    save_to_history: bool = Query(True),
    current_user: UserInDB = Depends(get_current_active_user)
):
    """
    Query the information agent
    
    Args:
        query_input: The query and optional additional context
        save_to_history: Whether to save the query to history
        current_user: The current user
        
    Returns:
        Agent response with text response and sources
    """
    try:
        # Use our new implementation for getting information
        response = await get_information(query_input.query)
        
        # Save query to history if requested
        if save_to_history:
            try:
                db = get_database()
                await db.query_history.insert_one({
                    "user_id": current_user.id,
                    "query": query_input.query,
                    "response": response.get("response", ""),
                    "sources": response.get("sources", []),
                    "timestamp": datetime.utcnow()
                })
            except Exception as hist_error:
                # Log error but don't fail the request
                logging.error(f"Failed to save query to history: {str(hist_error)}")
        
        # Return response
        return AgentResponse(
            response=response.get("response", ""),
            sources=response.get("sources", []),
            metadata=response.get("metadata", {})
        )
    
    except Exception as e:
        import traceback
        error_trace = traceback.format_exc()
        logging.error(f"Agent error: {str(e)}\n{error_trace}")
        
        raise HTTPException(
            status_code=500,
            detail=f"Agent error: {str(e)}"
        )

@router.get("/history", response_model=List[Dict[str, Any]])
async def get_query_history(
    limit: int = Query(10, ge=1, le=50),
    current_user: UserInDB = Depends(get_current_active_user)
):
    """
    Get user's query history
    
    Args:
        limit: Maximum number of history items to return
        current_user: The current user
        
    Returns:
        List of query history items
    """
    try:
        db = get_database()
        
        # Get history
        cursor = db.query_history.find(
            {"user_id": current_user.id}
        ).sort("timestamp", -1).limit(limit)
        
        # Convert to list
        history_list = []
        async for document in cursor:
            history_list.append({
                "id": str(document["_id"]),
                "query": document["query"],
                "response": document["response"],
                "sources": document.get("sources", []),
                "timestamp": document["timestamp"]
            })
        
        return history_list
        
    except Exception as e:
        logging.error(f"Error retrieving query history: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Error retrieving query history: {str(e)}"
        )
