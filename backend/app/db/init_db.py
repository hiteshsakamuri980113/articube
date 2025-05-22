"""
Database initialization script.
"""
import asyncio
from loguru import logger
from motor.motor_asyncio import AsyncIOMotorClient
from app.db.mongodb import connect_to_mongo, close_mongo_connection, get_database
from app.auth.jwt import get_password_hash
from app.api.models.user import UserInDB
from app.utils.config import settings

async def create_initial_user():
    """
    Create an initial admin user if none exists
    """
    db = get_database()
    
    # Check if any user exists
    user_count = await db.users.count_documents({})
    if user_count == 0:
        logger.info("No users found in database. Creating initial admin user...")
        
        # Create admin user
        admin_user = UserInDB(
            email="admin@articube.ai",
            username="admin",
            full_name="Admin User",
            hashed_password=get_password_hash("adminpassword"),  # Change this in production!
            is_active=True,
            is_verified=True
        )
        
        # Insert admin user
        user_dict = admin_user.model_dump(by_alias=True)
        if "id" in user_dict:
            del user_dict["id"]
            
        result = await db.users.insert_one(user_dict)
        logger.info(f"Created initial admin user with ID: {result.inserted_id}")
    else:
        logger.info(f"Found {user_count} existing users in database")

async def create_indexes():
    """
    Create necessary database indexes
    """
    db = get_database()
    
    # Ensure indexes exist
    logger.info("Creating database indexes...")
    await db.users.create_index("email", unique=True)
    await db.users.create_index("username", unique=True)
    
    # Add other indexes as needed
    # await db.content.create_index([("title", "text"), ("summary", "text")])
    
    logger.info("Database indexes created")

async def init_db():
    """
    Initialize database with required data and structures
    """
    try:
        # Connect to MongoDB
        await connect_to_mongo()
        
        # Create indexes
        await create_indexes()
        
        # Create initial user
        await create_initial_user()
        
        logger.success("Database initialization completed successfully")
    except Exception as e:
        logger.error(f"Database initialization failed: {e}")
        raise
    finally:
        # Close connection when done
        await close_mongo_connection()

if __name__ == "__main__":
    # Run the initialization script
    asyncio.run(init_db())
