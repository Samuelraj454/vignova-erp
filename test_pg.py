import asyncio
from sqlalchemy.ext.asyncio import create_async_engine
from sqlalchemy import text
import os
from dotenv import load_dotenv

load_dotenv("backend/.env")

DATABASE_URL = os.getenv("DATABASE_URL")
if not DATABASE_URL:
    DATABASE_URL = "postgresql+asyncpg://neondb_owner:npg_Lz7GnRcXePV2@ep-hidden-mountain-aw94tlqa-pooler.c-12.us-east-1.aws.neon.tech/neondb?ssl=require"

async def test_db():
    print(f"Connecting to: {DATABASE_URL}")
    engine = create_async_engine(DATABASE_URL)
    async with engine.begin() as conn:
        result = await conn.execute(text("SELECT version();"))
        version = result.scalar()
        print(f"Version: {version}")
        
        result2 = await conn.execute(text("SELECT current_database();"))
        db = result2.scalar()
        print(f"Current DB: {db}")

asyncio.run(test_db())
