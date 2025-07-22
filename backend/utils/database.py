"""
Database connection management utilities
"""
from contextlib import asynccontextmanager
from typing import AsyncGenerator
from prisma import Prisma
import alog

# Global database instance
_db_instance: Prisma | None = None

async def get_database() -> Prisma:
    """
    Get database instance with proper connection management.
    This function ensures a single database connection is maintained
    and reused across requests to avoid connection race conditions.
    """
    global _db_instance
    
    if _db_instance is None:
        _db_instance = Prisma()
    
    if not _db_instance.is_connected():
        await _db_instance.connect()
        alog.info("Database connected")
    
    return _db_instance

async def disconnect_database():
    """
    Disconnect from database. Should be called during application shutdown.
    """
    global _db_instance
    
    if _db_instance and _db_instance.is_connected():
        await _db_instance.disconnect()
        alog.info("Database disconnected")
        _db_instance = None

@asynccontextmanager
async def get_db_session() -> AsyncGenerator[Prisma, None]:
    """
    Context manager for database operations.
    Use this for operations that need a database session.
    """
    db = await get_database()
    try:
        yield db
    except Exception as e:
        alog.error(f"Database operation error: {e}")
        raise
