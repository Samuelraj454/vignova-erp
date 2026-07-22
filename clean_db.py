import asyncio
import os
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import sessionmaker
from sqlalchemy import text

DATABASE_URL = "postgresql+asyncpg://neondb_owner:npg_Lz7GnRcXePV2@ep-hidden-mountain-aw94tlqa-pooler.c-12.us-east-1.aws.neon.tech/neondb?ssl=require"

async def main():
    try:
        engine = create_async_engine(DATABASE_URL, echo=False)
        async_session = sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)
        
        async with async_session() as session:
            print("--- Beginning Database Purge ---")
            
            # Disable constraints if needed, but since we are deleting all records, order matters
            # Delete in order of dependencies (child to parent)
            tables_to_purge = [
                'payments',
                'inventory_logs',
                'invoices',
                'orders',
                'products',
                'customers'
            ]
            
            for table in tables_to_purge:
                await session.execute(text(f"DELETE FROM {table};"))
                print(f"Purged {table}")
                
            # For users, delete everyone EXCEPT admin@vignova.com
            res = await session.execute(text("DELETE FROM users WHERE email != 'admin@vignova.com';"))
            print("Purged demo/sample users, preserved admin@vignova.com")
            
            await session.commit()
            print("--- Database Purge Complete ---")
            
            print("\n--- Verifying Row Counts ---")
            all_tables = ['users', 'products', 'customers', 'orders', 'invoices', 'inventory_logs', 'payments']
            
            for table in all_tables:
                res = await session.execute(text(f"SELECT COUNT(*) FROM {table};"))
                count = res.scalar()
                print(f"Table {table}: {count} rows")
                
                if count > 0:
                    print(f"Remaining data in {table}:")
                    res = await session.execute(text(f"SELECT email, role FROM {table} LIMIT 5;" if table == 'users' else f"SELECT * FROM {table} LIMIT 5;"))
                    for row in res.fetchall():
                        print(row)
                print("-" * 30)
                
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    asyncio.run(main())
