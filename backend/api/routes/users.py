from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from backend.db.database import get_db
from backend.models.models import User, ActivityLog
from backend.api.auth import require_role, get_password_hash
import uuid
import random
import string
from pydantic import BaseModel
from typing import Optional, List

router = APIRouter(prefix="/users", tags=["users"])

# --- Pydantic Schemas ---
class EmployeeCreateRequest(BaseModel):
    name: str
    email: str
    phone: Optional[str] = None
    address: Optional[str] = None
    department: Optional[str] = None
    role: str
    
class EmployeeUpdateRequest(BaseModel):
    role: Optional[str] = None
    status: Optional[str] = None # "Active" or "Disabled"

def generate_temp_password(length=6):
    chars = string.ascii_letters + string.digits
    return ''.join(random.choice(chars) for _ in range(length))

async def generate_employee_id(db: AsyncSession) -> str:
    from backend.models.models import SystemSequence
    import datetime
    
    year = datetime.datetime.utcnow().year
    
    result = await db.execute(select(SystemSequence).where(SystemSequence.name == "employee"))
    seq = result.scalars().first()
    
    if not seq:
        seq = SystemSequence(name="employee", last_value=0)
        db.add(seq)
        
    seq.last_value += 1
    
    return f"EMP-{year}-{seq.last_value:06d}"

@router.post("/employee", status_code=status.HTTP_201_CREATED)
async def create_employee(
    req: EmployeeCreateRequest, 
    db: AsyncSession = Depends(get_db), 
    admin: User = Depends(require_role(["Admin"]))
):
    # Check if email exists
    result = await db.execute(select(User).where(User.email == req.email))
    if result.scalars().first():
        raise HTTPException(status_code=400, detail="Email already registered")
        
    temp_password = generate_temp_password()
    emp_id = await generate_employee_id(db)
    
    new_user = User(
        id=f"usr_{uuid.uuid4().hex[:8]}",
        name=req.name,
        email=req.email,
        password_hash=get_password_hash(temp_password),
        role=req.role,
        is_active=True,
        requires_password_change=True,
        employee_id=emp_id,
        phone=req.phone,
        address=req.address,
        department=req.department
    )
    db.add(new_user)
    
    log = ActivityLog(
        id=f"act_{uuid.uuid4().hex[:8]}",
        user_id=admin.id,
        user_name=admin.name,
        action="Created Employee",
        details=f"Created {req.role} account for {req.name} ({emp_id})",
    )
    db.add(log)
    
    await db.commit()
    
    # Return credentials ONLY this one time
    return {
        "message": "Employee created successfully",
        "credentials": {
            "employee_id": emp_id,
            "email": req.email,
            "temporary_password": temp_password
        }
    }

@router.get("/")
async def list_employees(
    db: AsyncSession = Depends(get_db),
    admin: User = Depends(require_role(["Admin"]))
):
    # Get all non-admin users or just all users
    result = await db.execute(select(User).order_by(User.created_at.desc()))
    users = result.scalars().all()
    
    return [
        {
            "id": u.id,
            "name": u.name,
            "email": u.email,
            "role": u.role,
            "isActive": u.is_active,
            "requiresPasswordChange": u.requires_password_change,
            "employeeId": u.employee_id,
            "phone": u.phone,
            "department": u.department,
            "createdAt": u.created_at.isoformat() if u.created_at else None
        } for u in users
    ]

@router.put("/{user_id}/status")
async def change_status(
    user_id: str,
    req: EmployeeUpdateRequest,
    db: AsyncSession = Depends(get_db),
    admin: User = Depends(require_role(["Admin"]))
):
    result = await db.execute(select(User).where(User.id == user_id))
    user = result.scalars().first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
        
    if user.id == admin.id:
        raise HTTPException(status_code=400, detail="Cannot change your own status")
        
    is_active = req.status == "Active"
    user.is_active = is_active
    
    log = ActivityLog(
        id=f"act_{uuid.uuid4().hex[:8]}",
        user_id=admin.id,
        user_name=admin.name,
        action="Updated Employee Status",
        details=f"{'Enabled' if is_active else 'Disabled'} account for {user.name}",
    )
    db.add(log)
    await db.commit()
    return {"message": "Status updated"}

@router.put("/{user_id}/role")
async def change_role(
    user_id: str,
    req: EmployeeUpdateRequest,
    db: AsyncSession = Depends(get_db),
    admin: User = Depends(require_role(["Admin"]))
):
    result = await db.execute(select(User).where(User.id == user_id))
    user = result.scalars().first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
        
    if user.id == admin.id:
        raise HTTPException(status_code=400, detail="Cannot change your own role")
        
    user.role = req.role
    
    log = ActivityLog(
        id=f"act_{uuid.uuid4().hex[:8]}",
        user_id=admin.id,
        user_name=admin.name,
        action="Updated Employee Role",
        details=f"Changed role for {user.name} to {req.role}",
    )
    db.add(log)
    await db.commit()
    return {"message": "Role updated"}

@router.post("/{user_id}/reset-password")
async def reset_password(
    user_id: str,
    db: AsyncSession = Depends(get_db),
    admin: User = Depends(require_role(["Admin"]))
):
    result = await db.execute(select(User).where(User.id == user_id))
    user = result.scalars().first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
        
    temp_password = generate_temp_password()
    user.password_hash = get_password_hash(temp_password)
    user.requires_password_change = True
    
    log = ActivityLog(
        id=f"act_{uuid.uuid4().hex[:8]}",
        user_id=admin.id,
        user_name=admin.name,
        action="Reset Password",
        details=f"Generated temporary password for {user.name}",
    )
    db.add(log)
    await db.commit()
    
    return {
        "message": "Password reset successfully",
        "credentials": {
            "username": user.email,
            "temporary_password": temp_password
        }
    }
