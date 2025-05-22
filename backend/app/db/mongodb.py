"""
MongoDB database connection and utility functions.
"""
from motor.motor_asyncio import AsyncIOMotorClient
from loguru import logger

from app.utils.config import settings

# MongoDB Client - initialized in the startup event
mongodb_client = None
mongodb_database = None

async def connect_to_mongo():
    """
    Create database connection.
    """
    global mongodb_client, mongodb_database
    try:
        # Print the connection string to debug (omit password in logs)
        conn_str = settings.MONGODB_URL
        masked_conn_str = conn_str.replace(conn_str.split('@')[0].split('//')[1], "***:***")
        logger.info(f"Connecting to MongoDB: {masked_conn_str}")
        
        # Create client with proper options for cloud MongoDB Atlas
        mongodb_client = AsyncIOMotorClient(
            settings.MONGODB_URL,
            serverSelectionTimeoutMS=10000,  # 10 seconds timeout for server selection
            connectTimeoutMS=20000,  # 20 seconds timeout for connection
            maxIdleTimeMS=45000,    # Prevent disconnect due to idle connection
            retryWrites=True,        # Enable retry for write operations
            appname="ArtiCube"       # Identify our application in MongoDB logs
        )
        
        # Access the database
        mongodb_database = mongodb_client[settings.MONGODB_DB_NAME]
        
        # Verify that the connection works by listing collections instead of admin command
        collections = await mongodb_database.list_collection_names()
        logger.info(f"Connected to MongoDB. Available collections: {collections}")
        
        # Create indexes for better query performance if users collection doesn't exist
        if "users" not in collections:
            logger.info("Creating users collection and indexes")
            await mongodb_database.create_collection("users")
            await mongodb_database.users.create_index("email", unique=True)
            logger.info("Created index on users.email")
        
    except Exception as e:
        logger.error(f"Failed to connect to MongoDB: {e}")
        raise

async def close_mongo_connection():
    """
    Close database connection.
    """
    global mongodb_client
    if mongodb_client:
        mongodb_client.close()
        logger.info("MongoDB connection closed")

def get_database():
    """
    Get database instance.
    """
    if mongodb_database is None:
        logger.error("Database not initialized. Make sure connect_to_mongo() has been called.")
        raise RuntimeError("MongoDB connection not established. The database is not initialized.")
    return mongodb_database

# Collection helpers
async def get_collection(collection_name: str):
    """
    Get a specific collection.
    """
    return mongodb_database[collection_name]
