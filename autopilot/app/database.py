import asyncpg
from typing import AsyncGenerator
from contextlib import asynccontextmanager
from app.config import settings

class Database:
    _pool: asyncpg.Pool | None = None

    @classmethod
    async def connect(cls):
        if cls._pool is None:
            cls._pool = await asyncpg.create_pool(
                dsn=settings.DATABASE_URL,
                min_size=1,
                max_size=10
            )

    @classmethod
    async def close(cls):
        if cls._pool:
            await cls._pool.close()
            cls._pool = None

    @classmethod
    @asynccontextmanager
    async def get_async_session(cls) -> AsyncGenerator[asyncpg.Connection, None]:
        async with cls._pool.acquire() as connection:
            yield connection