from sqlalchemy.ext.asyncio import create_async_engine, async_sessionmaker, AsyncSession
from sqlalchemy.orm import DeclarativeBase
from typing import AsyncGenerator
from contextlib import asynccontextmanager
from app.config import settings

class Base(DeclarativeBase):
    pass

class Database:
    _engine = None
    _session_factory = None

    @classmethod
    def connect(cls):
        cls._engine = create_async_engine(settings.DATABASE_URL, echo=False)
        cls._session_factory = async_sessionmaker(
            bind=cls._engine,
            autoflush=False,
            expire_on_commit=False,
            class_=AsyncSession
        )

    @classmethod
    async def close(cls):
        """Close the database connection."""
        if cls._engine:
            await cls._engine.dispose()
            cls._engine = None
            cls._session_factory = None

    @classmethod
    @asynccontextmanager
    async def get_async_session(cls) -> AsyncGenerator[AsyncSession, None]:
        """Context manager for database sessions."""
        if cls._session_factory is None:
            raise RuntimeError("Database is not connected. Call connect() first.")
        async with cls._session_factory() as session:
            try:
                yield session
            finally:
                await session.close()