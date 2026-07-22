import asyncio
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import sessionmaker
from sqlalchemy import text
import os

DATABASE_URL = os.environ.get("DATABASE_URL", "sqlite+aiosqlite:///./backend/erp_db.sqlite")

async def main():
    engine = create_async_engine(DATABASE_URL, echo=False)
    async_session = sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)
    
    async with async_session() as session:
        print("--- Products ---")
        res = await session.execute(text("SELECT id, name FROM products;"))
        for row in res.fetchall():
            print(row)
            
        print("--- Customers ---")
        res = await session.execute(text("SELECT id, name FROM customers;"))
        for row in res.fetchall():
            print(row)
            
        print("--- Users ---")
        res = await session.execute(text("SELECT id, name, employee_id FROM users;"))
        for row in res.fetchall():
            print(row)

asyncio.run(main())
