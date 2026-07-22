import asyncio
import os
import sys

from sqlalchemy.ext.asyncio import create_async_engine
from sqlalchemy import text

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from backend.core.config import settings

async def update_settings():
    engine = create_async_engine(settings.DATABASE_URL)
    async with engine.begin() as conn:
        await conn.execute(text("""
            UPDATE settings 
            SET store_name = 'Test', tax_rate = 5.0, currency = 'USD', theme = 'light' 
            WHERE id = 'default'
        """))
    print("Settings updated.")

if __name__ == "__main__":
    asyncio.run(update_settings())
