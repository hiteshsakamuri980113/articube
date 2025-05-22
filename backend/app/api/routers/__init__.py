"""
Initialize routers module
"""
from fastapi import APIRouter

from app.api.routers.user_router import router as user_router
from app.api.routers.content_router import router as content_router
from app.api.routers.agent_router import router as agent_router
