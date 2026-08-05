from typing import AsyncGenerator
from sqlalchemy.ext.asyncio import (
    AsyncEngine,
    AsyncSession,
    async_sessionmaker,
    create_async_engine,
)
from app.core.config import settings

engine: AsyncEngine = create_async_engine(
    settings.ASYNC_DATABASE_URI,
    echo=(settings.ENVIRONMENT == "development"),  
    pool_size=20,          
    max_overflow=10,      
    pool_pre_ping=True,    
    pool_recycle=3600,     
)

# Async session factory
AsyncSessionLocal = async_sessionmaker(
    bind=engine,
    class_=AsyncSession,
    autocommit=False,
    autoflush=False,
    expire_on_commit=False, 
)


async def get_db_session() -> AsyncGenerator[AsyncSession, None]:
   
    async with AsyncSessionLocal() as session:
        try:
            yield session
            await session.commit()
        except Exception:
            await session.rollback()
            raise
        