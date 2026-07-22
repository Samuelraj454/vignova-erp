from fastapi import FastAPI, Depends, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
import os
import uvicorn
from contextlib import asynccontextmanager

from backend.api.routes import api_router
from backend.core.websockets import ws_manager
from backend.tasks.scheduler import start_scheduler
from sqlalchemy.exc import SQLAlchemyError
from fastapi.responses import JSONResponse
from fastapi import Request
from backend.db.database import engine, Base

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Tables are managed via Alembic migrations; no automatic creation here

    # Create tables automatically for Vercel deployment
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

    # Seed default users (if needed) - keep logic but ensure sequence exists
    from backend.db.database import AsyncSessionLocal
    from backend.models.models import User, SystemSequence
    from backend.api.auth import get_password_hash
    from sqlalchemy.future import select
    import uuid
    import datetime

    async with AsyncSessionLocal() as db:
        result = await db.execute(select(SystemSequence).where(SystemSequence.name == "employee"))
        seq = result.scalars().first()
        if not seq:
            seq = SystemSequence(name="employee", last_value=0)
            db.add(seq)
            await db.commit()
        # Ensure seq is loaded after commit
        if not seq:
            result = await db.execute(select(SystemSequence).where(SystemSequence.name == "employee"))
            seq = result.scalars().first()
        admin = await db.execute(select(User).where(User.email == "admin@vignova.com"))
        admin_user = admin.scalars().first()
        if not admin_user:
            seq.last_value += 1
            year = datetime.datetime.utcnow().year
            emp_id = f"EMP-{year}-{seq.last_value:06d}"
            db.add(User(
                id=f"usr_{uuid.uuid4().hex[:8]}",
                name="System Admin",
                email="admin@vignova.com",
                password_hash=get_password_hash("Admin@123"),
                role="Admin",
                is_active=True,
                requires_password_change=False,
                employee_id=emp_id
            ))
        await db.commit()

    # Start background scheduler
    start_scheduler()
    yield
    # Shutdown logic if needed

app = FastAPI(title="Vignova ERP Backend", lifespan=lifespan)

@app.exception_handler(SQLAlchemyError)
async def sqlalchemy_exception_handler(request: Request, exc: SQLAlchemyError):
    return JSONResponse(
        status_code=500,
        content={"message": "Database transaction failed", "detail": str(exc)},
    )

@app.exception_handler(ValueError)
async def value_error_handler(request: Request, exc: ValueError):
    return JSONResponse(
        status_code=400,
        content={"message": "Invalid value provided", "detail": str(exc)},
    )

@app.exception_handler(Exception)
async def generic_exception_handler(request: Request, exc: Exception):
    import traceback
    return JSONResponse(
        status_code=500,
        content={"message": "Internal Server Error", "detail": str(exc), "traceback": traceback.format_exc()},
    )

from backend.core.config import settings

app.add_middleware(
    CORSMiddleware,
    allow_origins=[settings.FRONTEND_URL, "https://vignova-1.vercel.app", "*"], # Allows all for easy testing since we don't have exact custom domains yet, but includes explicit domain

    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(api_router, prefix="/api")

try:
    os.makedirs("backend/uploads/products", exist_ok=True)
    app.mount("/uploads", StaticFiles(directory="backend/uploads"), name="uploads")
except (OSError, RuntimeError):
    pass

if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
