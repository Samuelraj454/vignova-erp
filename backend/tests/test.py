import asyncio
from backend.database.database import AsyncSessionLocal
from backend.api.routes.users import list_employees
async def main():
    async with AsyncSessionLocal() as db:
        users = await list_employees(db=db, admin=None)
        print(users)
asyncio.run(main())
