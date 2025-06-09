"""
Main FastAPI application file for ArtiCube backend.
"""
from fastapi import FastAPI, Depends
from fastapi.middleware.cors import CORSMiddleware

# Import the new router implementation
from app.api.routers.agent_router import router as agent_router
from app.api.routers.content_router import router as content_router
from app.api.routers.user_router import router as user_router
from app.db.mongodb import connect_to_mongo, close_mongo_connection
from app.utils.config import settings
from contextlib import asynccontextmanager
import logging

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
)
logger = logging.getLogger("articube")

@asynccontextmanager
async def lifespan(app: FastAPI):
    """
    Lifecycle events for the FastAPI app
    - Connect to MongoDB on startup
    - Close MongoDB connection on shutdown
    """
    logger.info("Starting ArtiCube API")
    # Connect to MongoDB on startup
    await connect_to_mongo()
    logger.info("Connected to MongoDB")
    
    yield
    
    # Close MongoDB connection on shutdown
    await close_mongo_connection()
    logger.info("Closed MongoDB connection")
    logger.info("ArtiCube API shutdown complete")

# Create FastAPI app
app = FastAPI(
    title="ArtiCube API",
    description="API for ArtiCube - A knowledge retrieval application",
    version="0.1.0",
    lifespan=lifespan
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount routers
app.include_router(agent_router, prefix="/api/agent", tags=["Agent"])
app.include_router(user_router, prefix="/api/users", tags=["Users"])
app.include_router(content_router, prefix="/api/content", tags=["Content"])

@app.get("/", tags=["Health"])
async def root():
    """
    Health check endpoint
    """
    return {
        "status": "ok",
        "message": "Welcome to ArtiCube API",
        "version": "0.1.0"
    }

@app.get("/health", tags=["Health"])
async def health_check():
    """
    Root endpoint for API health check.
    """
    return {"status": "ok", "message": "ArtiCube API is running"}

@app.get("/api/v1/health", tags=["Health"])
async def api_health_check():
    """
    API v1 health check endpoint for deployment health checks.
    """
    return {"status": "ok", "message": "ArtiCube API v1 is running"}
