import asyncio
import os
import sys
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import sessionmaker
from sqlalchemy import text

DATABASE_URL = "postgresql+asyncpg://neondb_owner:npg_Lz7GnRcXePV2@ep-hidden-mountain-aw94tlqa-pooler.c-12.us-east-1.aws.neon.tech/neondb?ssl=require"

async def main():
    try:
        engine = create_async_engine(DATABASE_URL, echo=False)
        async_session = sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)
        
        async with async_session() as session:
            print("--- Database Connected ---")
            
            tables = ['users', 'products', 'customers', 'orders', 'invoices', 'inventory_logs', 'payments']
            
            for table in tables:
                res = await session.execute(text(f"SELECT COUNT(*) FROM {table};"))
                count = res.scalar()
                print(f"Table {table}: {count} rows")
                
                if count > 0:
                    print(f"Sample data from {table}:")
                    res = await session.execute(text(f"SELECT * FROM {table} LIMIT 5;"))
                    for row in res.fetchall():
                        print(row)
                print("-" * 30)
                
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    asyncio.run(main())
