from datetime import datetime, timedelta
from typing import Optional, List
from jose import JWTError, jwt
import bcrypt
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from backend.db.database import get_db
from backend.models.models import User, ActivityLog
import uuid
from pydantic import BaseModel

# Configuration (In production, these should be environment variables)
SECRET_KEY = "vignova_erp_super_secret_key"
REFRESH_SECRET_KEY = "vignova_erp_refresh_secret_key"
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30 # 30 minutes
REFRESH_TOKEN_EXPIRE_DAYS = 7 # 7 days

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/auth/login")
router = APIRouter(prefix="/auth", tags=["auth"])

def verify_password(plain_password, hashed_password):
    return bcrypt.checkpw(plain_password.encode('utf-8'), hashed_password.encode('utf-8'))

def get_password_hash(password):
    return bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

def create_refresh_token(data: dict, expires_delta: Optional[timedelta] = None):
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(days=REFRESH_TOKEN_EXPIRE_DAYS)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, REFRESH_SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

async def get_current_user(token: str = Depends(oauth2_scheme), db: AsyncSession = Depends(get_db)):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials or session expired",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        user_id: str = payload.get("sub")
        if user_id is None:
            raise credentials_exception
    except JWTError:
        raise credentials_exception
    
    result = await db.execute(select(User).where(User.id == user_id))
    user = result.scalars().first()
    if user is None:
        raise credentials_exception
    if not user.is_active:
        raise HTTPException(status_code=403, detail="Your account has been disabled. Please contact your administrator.")
        
    return user

def require_role(allowed_roles: List[str]):
    def role_checker(current_user: User = Depends(get_current_user)):
        if current_user.role not in allowed_roles:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Operation not permitted"
            )
        return current_user
    return role_checker

from sqlalchemy import or_

@router.post("/login")
async def login(form_data: OAuth2PasswordRequestForm = Depends(), db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(User).where(
        or_(User.email == form_data.username, User.employee_id == form_data.username)
    ))
    users = result.scalars().all()
    
    user = None
    for u in users:
        if verify_password(form_data.password, u.password_hash):
            user = u
            break
            
    if not user:
        # Log failed attempt
        log = ActivityLog(
            id=f"act_{uuid.uuid4().hex[:8]}",
            user_id=None,
            user_name=form_data.username,
            action="Login Failed",
            details="Invalid email or password",
        )
        db.add(log)
        await db.commit()
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
        
    if not getattr(user, 'is_active', True): # Gracefully handle existing models
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Account disabled"
        )
    
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user.id, "role": user.role}, expires_delta=access_token_expires
    )
    refresh_token = create_refresh_token(
        data={"sub": user.id, "role": user.role}
    )
    
    # Log successful login
    log = ActivityLog(
        id=f"act_{uuid.uuid4().hex[:8]}",
        user_id=user.id,
        user_name=user.name,
        action="Login Successful",
        details="User authenticated successfully",
    )
    db.add(log)
    await db.commit()
    
    requires_password_change = getattr(user, 'requires_password_change', False)
    
    return {
        "access_token": access_token, 
        "refresh_token": refresh_token,
        "token_type": "bearer",
        "requires_password_change": requires_password_change,
        "user": {
            "id": user.id,
            "name": user.name,
            "email": user.email,
            "role": user.role
        }
    }

class RefreshRequest(BaseModel):
    refresh_token: str

@router.post("/refresh")
async def refresh(req: RefreshRequest, db: AsyncSession = Depends(get_db)):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Invalid refresh token",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(req.refresh_token, REFRESH_SECRET_KEY, algorithms=[ALGORITHM])
        user_id: str = payload.get("sub")
        if user_id is None:
            raise credentials_exception
    except JWTError:
        raise credentials_exception
        
    result = await db.execute(select(User).where(User.id == user_id))
    user = result.scalars().first()
    if user is None or not getattr(user, 'is_active', True):
        raise credentials_exception
        
    access_token = create_access_token(data={"sub": user.id, "role": user.role})
    new_refresh_token = create_refresh_token(data={"sub": user.id, "role": user.role})
    
    return {
        "access_token": access_token,
        "refresh_token": new_refresh_token,
        "token_type": "bearer"
    }

class ChangePasswordRequest(BaseModel):
    current_password: str
    new_password: str

@router.post("/change-password")
async def change_password(req: ChangePasswordRequest, current_user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    if not verify_password(req.current_password, current_user.password_hash):
        raise HTTPException(status_code=400, detail="Incorrect current password")
        
    current_user.password_hash = get_password_hash(req.new_password)
    if hasattr(current_user, 'requires_password_change'):
        current_user.requires_password_change = False
        
    log = ActivityLog(
        id=f"act_{uuid.uuid4().hex[:8]}",
        user_id=current_user.id,
        user_name=current_user.name,
        action="Password Changed",
        details="User changed their password",
    )
    db.add(log)
    await db.commit()
    return {"message": "Password updated successfully"}

class SignupRequest(BaseModel):
    fullName: str
    email: str
    password: str

@router.post("/signup")
async def signup(req: SignupRequest, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(User).where(User.email == req.email))
    if result.scalars().first():
        raise HTTPException(status_code=400, detail="Email already registered")
    
    new_user = User(
        id=f"usr_{uuid.uuid4().hex[:8]}",
        name=req.fullName,
        email=req.email,
        password_hash=get_password_hash(req.password),
        role="Admin",
        is_active=True,
        requires_password_change=False
    )
    db.add(new_user)
    
    log = ActivityLog(
        id=f"act_{uuid.uuid4().hex[:8]}",
        user_id=new_user.id,
        user_name=new_user.name,
        action="User Signup",
        details="New admin account created",
    )
    db.add(log)
    
    await db.commit()
    return {"message": "User created successfully"}

@router.get("/me")
async def read_users_me(current_user: User = Depends(get_current_user)):
    return {
        "id": current_user.id,
        "name": current_user.name,
        "email": current_user.email,
        "role": current_user.role,
        "requires_password_change": getattr(current_user, 'requires_password_change', False)
    }
