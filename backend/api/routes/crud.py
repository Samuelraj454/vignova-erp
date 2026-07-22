from fastapi import APIRouter, Depends, HTTPException, File, UploadFile, Form
import os
import uuid
from PIL import Image
import io

from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from backend.db.database import get_db
from backend.models import models as db_models
from backend import schemas
from typing import List, Dict, Any
from backend.core.websockets import ws_manager
from backend.api.auth import get_current_user, require_role, User
import re

def to_snake_case(name):
    s1 = re.sub('(.)([A-Z][a-z]+)', r'\1_\2', name)
    return re.sub('([a-z0-9])([A-Z])', r'\1_\2', s1).lower()

def convert_dict_keys(d, func):
    if isinstance(d, list):
        return [convert_dict_keys(i, func) for i in d]
    if isinstance(d, dict):
        return {func(k): convert_dict_keys(v, func) for k, v in d.items()}
    return d

router = APIRouter()


# ================= User =================

@router.get("/users", response_model=List[schemas.UserResponse])
async def get_users(skip: int = 0, limit: int = 100, db: AsyncSession = Depends(get_db), current_user: User = Depends(get_current_user)):
    result = await db.execute(select(db_models.User).offset(skip).limit(limit))
    return result.scalars().all()

@router.get("/users/{id}", response_model=schemas.UserResponse)
async def get_user(id: str, db: AsyncSession = Depends(get_db), current_user: User = Depends(get_current_user)):
    result = await db.execute(select(db_models.User).where(db_models.User.id == id))
    item = result.scalars().first()
    if not item:
        raise HTTPException(status_code=404)
    return item

@router.post("/users", response_model=schemas.UserResponse)
async def create_user(item: schemas.UserCreate, db: AsyncSession = Depends(get_db), current_user: User = Depends(require_role(["Admin", "Manager"]))):
    from backend.api.auth import get_password_hash
    item_dict = item.model_dump(exclude_unset=True)
    password = item_dict.pop("password", "default_password")
    item_dict["password_hash"] = get_password_hash(password)
    db_item = db_models.User(**item_dict)
    db.add(db_item)
    await db.commit()
    await db.refresh(db_item)
    await ws_manager.broadcast("users")
    return db_item

@router.put("/users/{id}", response_model=schemas.UserResponse)
async def update_user(id: str, item: schemas.UserCreate, db: AsyncSession = Depends(get_db), current_user: User = Depends(require_role(["Admin", "Manager"]))):
    from backend.api.auth import get_password_hash
    item_dict = item.model_dump(exclude_unset=True)
    if "password" in item_dict:
        item_dict["password_hash"] = get_password_hash(item_dict.pop("password"))

    result = await db.execute(select(db_models.User).where(db_models.User.id == id))
    db_item = result.scalars().first()
    if not db_item:
        raise HTTPException(status_code=404)
    for k, v in item_dict.items():
        setattr(db_item, k, v)
    await db.commit()
    await db.refresh(db_item)
    await ws_manager.broadcast("users")
    return db_item

@router.delete("/users/{id}")
async def delete_user(id: str, db: AsyncSession = Depends(get_db), current_user: User = Depends(require_role(["Admin"]))):
    result = await db.execute(select(db_models.User).where(db_models.User.id == id))
    db_item = result.scalars().first()
    if not db_item:
        raise HTTPException(status_code=404)
    await db.delete(db_item)
    await db.commit()
    await ws_manager.broadcast("users")
    return {"success": True}


# ================= Customer =================

@router.get("/customers", response_model=List[schemas.CustomerResponse])
async def get_customers(skip: int = 0, limit: int = 100, db: AsyncSession = Depends(get_db), current_user: User = Depends(get_current_user)):
    result = await db.execute(select(db_models.Customer).offset(skip).limit(limit))
    return result.scalars().all()

@router.get("/customers/{id}", response_model=schemas.CustomerResponse)
async def get_customer(id: str, db: AsyncSession = Depends(get_db), current_user: User = Depends(get_current_user)):
    result = await db.execute(select(db_models.Customer).where(db_models.Customer.id == id))
    item = result.scalars().first()
    if not item:
        raise HTTPException(status_code=404)
    return item

@router.post("/customers", response_model=schemas.CustomerResponse)
async def create_customer(item: schemas.CustomerCreate, db: AsyncSession = Depends(get_db), current_user: User = Depends(require_role(["Admin", "Manager"]))):
    db_item = db_models.Customer(**item.model_dump(exclude_unset=True))
    db.add(db_item)
    await db.commit()
    await db.refresh(db_item)
    await ws_manager.broadcast("customers")
    return db_item

@router.put("/customers/{id}", response_model=schemas.CustomerResponse)
async def update_customer(id: str, item: schemas.CustomerCreate, db: AsyncSession = Depends(get_db), current_user: User = Depends(require_role(["Admin", "Manager"]))):
    item_dict = item.model_dump(exclude_unset=True)
    result = await db.execute(select(db_models.Customer).where(db_models.Customer.id == id))
    db_item = result.scalars().first()
    if not db_item:
        raise HTTPException(status_code=404)
    for k, v in item_dict.items():
        setattr(db_item, k, v)
    await db.commit()
    await db.refresh(db_item)
    await ws_manager.broadcast("customers")
    return db_item

@router.delete("/customers/{id}")
async def delete_customer(id: str, db: AsyncSession = Depends(get_db), current_user: User = Depends(require_role(["Admin"]))):
    result = await db.execute(select(db_models.Customer).where(db_models.Customer.id == id))
    db_item = result.scalars().first()
    if not db_item:
        raise HTTPException(status_code=404)
    await db.delete(db_item)
    await db.commit()
    await ws_manager.broadcast("customers")
    return {"success": True}


# ================= Supplier =================

@router.get("/suppliers", response_model=List[schemas.SupplierResponse])
async def get_suppliers(skip: int = 0, limit: int = 100, db: AsyncSession = Depends(get_db), current_user: User = Depends(get_current_user)):
    result = await db.execute(select(db_models.Supplier).offset(skip).limit(limit))
    return result.scalars().all()

@router.get("/suppliers/{id}", response_model=schemas.SupplierResponse)
async def get_supplier(id: str, db: AsyncSession = Depends(get_db), current_user: User = Depends(get_current_user)):
    result = await db.execute(select(db_models.Supplier).where(db_models.Supplier.id == id))
    item = result.scalars().first()
    if not item:
        raise HTTPException(status_code=404)
    return item

@router.post("/suppliers", response_model=schemas.SupplierResponse)
async def create_supplier(item: schemas.SupplierCreate, db: AsyncSession = Depends(get_db), current_user: User = Depends(require_role(["Admin", "Manager"]))):
    db_item = db_models.Supplier(**item.model_dump(exclude_unset=True))
    db.add(db_item)
    await db.commit()
    await db.refresh(db_item)
    await ws_manager.broadcast("suppliers")
    return db_item

@router.put("/suppliers/{id}", response_model=schemas.SupplierResponse)
async def update_supplier(id: str, item: schemas.SupplierCreate, db: AsyncSession = Depends(get_db), current_user: User = Depends(require_role(["Admin", "Manager"]))):
    item_dict = item.model_dump(exclude_unset=True)
    result = await db.execute(select(db_models.Supplier).where(db_models.Supplier.id == id))
    db_item = result.scalars().first()
    if not db_item:
        raise HTTPException(status_code=404)
    for k, v in item_dict.items():
        setattr(db_item, k, v)
    await db.commit()
    await db.refresh(db_item)
    await ws_manager.broadcast("suppliers")
    return db_item

@router.delete("/suppliers/{id}")
async def delete_supplier(id: str, db: AsyncSession = Depends(get_db), current_user: User = Depends(require_role(["Admin"]))):
    result = await db.execute(select(db_models.Supplier).where(db_models.Supplier.id == id))
    db_item = result.scalars().first()
    if not db_item:
        raise HTTPException(status_code=404)
    await db.delete(db_item)
    await db.commit()
    await ws_manager.broadcast("suppliers")
    return {"success": True}


# ================= Category =================

@router.get("/categories", response_model=List[schemas.CategoryResponse])
async def get_categories(skip: int = 0, limit: int = 100, db: AsyncSession = Depends(get_db), current_user: User = Depends(get_current_user)):
    result = await db.execute(select(db_models.Category).offset(skip).limit(limit))
    return result.scalars().all()

@router.get("/categories/{id}", response_model=schemas.CategoryResponse)
async def get_category(id: str, db: AsyncSession = Depends(get_db), current_user: User = Depends(get_current_user)):
    result = await db.execute(select(db_models.Category).where(db_models.Category.id == id))
    item = result.scalars().first()
    if not item:
        raise HTTPException(status_code=404)
    return item

@router.post("/categories", response_model=schemas.CategoryResponse)
async def create_category(item: schemas.CategoryCreate, db: AsyncSession = Depends(get_db), current_user: User = Depends(require_role(["Admin", "Manager"]))):
    db_item = db_models.Category(**item.model_dump(exclude_unset=True))
    db.add(db_item)
    await db.commit()
    await db.refresh(db_item)
    await ws_manager.broadcast("categories")
    return db_item

@router.put("/categories/{id}", response_model=schemas.CategoryResponse)
async def update_category(id: str, item: schemas.CategoryCreate, db: AsyncSession = Depends(get_db), current_user: User = Depends(require_role(["Admin", "Manager"]))):
    item_dict = item.model_dump(exclude_unset=True)
    result = await db.execute(select(db_models.Category).where(db_models.Category.id == id))
    db_item = result.scalars().first()
    if not db_item:
        raise HTTPException(status_code=404)
    for k, v in item_dict.items():
        setattr(db_item, k, v)
    await db.commit()
    await db.refresh(db_item)
    await ws_manager.broadcast("categories")
    return db_item

@router.delete("/categories/{id}")
async def delete_category(id: str, db: AsyncSession = Depends(get_db), current_user: User = Depends(require_role(["Admin"]))):
    result = await db.execute(select(db_models.Category).where(db_models.Category.id == id))
    db_item = result.scalars().first()
    if not db_item:
        raise HTTPException(status_code=404)
    await db.delete(db_item)
    await db.commit()
    await ws_manager.broadcast("categories")
    return {"success": True}


# ================= Product =================

@router.get("/products", response_model=List[schemas.ProductResponse])
async def get_products(skip: int = 0, limit: int = 100, db: AsyncSession = Depends(get_db), current_user: User = Depends(get_current_user)):
    result = await db.execute(select(db_models.Product).offset(skip).limit(limit))
    return result.scalars().all()

@router.get("/products/{id}", response_model=schemas.ProductResponse)
async def get_product(id: str, db: AsyncSession = Depends(get_db), current_user: User = Depends(get_current_user)):
    result = await db.execute(select(db_models.Product).where(db_models.Product.id == id))
    item = result.scalars().first()
    if not item:
        raise HTTPException(status_code=404)
    return item

import base64

import cloudinary
import cloudinary.uploader
from backend.core.config import settings

cloudinary.config(
    cloud_name=settings.CLOUDINARY_CLOUD_NAME,
    api_key=settings.CLOUDINARY_API_KEY,
    api_secret=settings.CLOUDINARY_API_SECRET
)

async def process_image_upload(image: UploadFile) -> str:
    if not image:
        return None
        
    allowed_types = ["image/jpeg", "image/png", "image/webp"]
    if image.content_type not in allowed_types:
        raise HTTPException(status_code=400, detail="Invalid file type. Only JPG, PNG, and WEBP are allowed.")
        
    contents = await image.read()
    if len(contents) > 5 * 1024 * 1024:
        raise HTTPException(status_code=400, detail="File too large. Maximum size is 5MB.")
        
    try:
        # Upload to Cloudinary using their uploader
        response = cloudinary.uploader.upload(
            contents,
            folder="vignova_products",
            transformation=[
                {"width": 800, "height": 800, "crop": "limit"}
            ]
        )
        # Return the secure HTTPS url
        return response.get("secure_url")
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Cloudinary upload failed: {str(e)}")

@router.post("/products", response_model=schemas.ProductResponse)
async def create_product(
    name: str = Form(...),
    sku: str = Form(...),
    barcode: str = Form(None),
    category_id: str = Form(None),
    supplier_id: str = Form(None),
    purchase_price: float = Form(0),
    selling_price: float = Form(0),
    stock: int = Form(0),
    min_stock: int = Form(0),
    status: str = Form("Active"),
    image: UploadFile = File(None),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_role(["Admin", "Manager"]))
):
    image_url = None
    if image and image.filename:
        image_url = await process_image_upload(image)
        
    product_id = f"prod_{uuid.uuid4().hex[:8]}"
    db_item = db_models.Product(
        id=product_id,
        name=name,
        sku=sku,
        barcode=barcode,
        category_id=category_id,
        supplier_id=supplier_id,
        purchase_price=purchase_price,
        selling_price=selling_price,
        stock=stock,
        min_stock=min_stock,
        status=status,
        image_url=image_url
    )
    db.add(db_item)
    await db.commit()
    await db.refresh(db_item)
    await ws_manager.broadcast("products")
    return db_item

@router.put("/products/{id}", response_model=schemas.ProductResponse)
async def update_product(
    id: str,
    name: str = Form(...),
    sku: str = Form(...),
    barcode: str = Form(None),
    category_id: str = Form(None),
    supplier_id: str = Form(None),
    purchase_price: float = Form(0),
    selling_price: float = Form(0),
    stock: int = Form(0),
    min_stock: int = Form(0),
    status: str = Form("Active"),
    image: UploadFile = File(None),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_role(["Admin", "Manager"]))
):
    result = await db.execute(select(db_models.Product).where(db_models.Product.id == id))
    db_item = result.scalars().first()
    if not db_item:
        raise HTTPException(status_code=404)
        
    if image and image.filename:
        image_url = await process_image_upload(image)
        db_item.image_url = image_url

    db_item.name = name
    db_item.sku = sku
    db_item.barcode = barcode
    db_item.category_id = category_id
    db_item.supplier_id = supplier_id
    db_item.purchase_price = purchase_price
    db_item.selling_price = selling_price
    db_item.stock = stock
    db_item.min_stock = min_stock
    db_item.status = status
    
    await db.commit()
    await db.refresh(db_item)
    await ws_manager.broadcast("products")
    return db_item

@router.delete("/products/{id}")
async def delete_product(id: str, db: AsyncSession = Depends(get_db), current_user: User = Depends(require_role(["Admin"]))):
    result = await db.execute(select(db_models.Product).where(db_models.Product.id == id))
    db_item = result.scalars().first()
    if not db_item:
        raise HTTPException(status_code=404)
        
    await db.delete(db_item)
    await db.commit()
    await ws_manager.broadcast("products")
    return {"success": True}

# ================= InventoryLog =================


@router.get("/inventory_logs", response_model=List[schemas.InventoryLogResponse])
async def get_inventory_logs(skip: int = 0, limit: int = 100, db: AsyncSession = Depends(get_db), current_user: User = Depends(get_current_user)):
    result = await db.execute(select(db_models.InventoryLog).offset(skip).limit(limit))
    return result.scalars().all()

@router.get("/inventory_logs/{id}")
async def get_inventorylog(id: str, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(db_models.InventoryLog).where(db_models.InventoryLog.id == id))
    item = result.scalars().first()
    if not item:
        raise HTTPException(status_code=404)
    return item

@router.post("/inventory_logs", response_model=schemas.InventoryLogResponse)
async def create_inventorylog(item: schemas.InventoryLogCreate, db: AsyncSession = Depends(get_db), current_user: User = Depends(require_role(["Admin", "Manager"]))):
    db_item = db_models.InventoryLog(**item.model_dump(exclude_unset=True))
    db.add(db_item)
    await db.commit()
    await db.refresh(db_item)
    await ws_manager.broadcast("inventory_logs")
    return db_item

@router.put("/inventory_logs/{id}", response_model=schemas.InventoryLogResponse)
async def update_inventorylog(id: str, item: schemas.InventoryLogCreate, db: AsyncSession = Depends(get_db), current_user: User = Depends(require_role(["Admin", "Manager"]))):
    item_dict = item.model_dump(exclude_unset=True)
    result = await db.execute(select(db_models.InventoryLog).where(db_models.InventoryLog.id == id))
    db_item = result.scalars().first()
    if not db_item:
        raise HTTPException(status_code=404)
    for k, v in item_dict.items():
        setattr(db_item, k, v)
    await db.commit()
    await db.refresh(db_item)
    await ws_manager.broadcast("inventory_logs")
    return db_item

@router.delete("/inventory_logs/{id}")
async def delete_inventorylog(id: str, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(db_models.InventoryLog).where(db_models.InventoryLog.id == id))
    db_item = result.scalars().first()
    if not db_item:
        raise HTTPException(status_code=404)
    await db.delete(db_item)
    await db.commit()
    await ws_manager.broadcast("inventory_logs")
    return {"success": True}


# ================= Cart =================

@router.get("/carts", response_model=List[schemas.CartResponse])
async def get_carts(skip: int = 0, limit: int = 100, db: AsyncSession = Depends(get_db), current_user: User = Depends(get_current_user)):
    result = await db.execute(select(db_models.Cart).offset(skip).limit(limit))
    return result.scalars().all()

@router.get("/carts/{id}", response_model=schemas.CartResponse)
async def get_cart(id: str, db: AsyncSession = Depends(get_db), current_user: User = Depends(get_current_user)):
    result = await db.execute(select(db_models.Cart).where(db_models.Cart.id == id))
    item = result.scalars().first()
    if not item:
        raise HTTPException(status_code=404)
    return item

@router.post("/carts", response_model=schemas.CartResponse)
async def create_cart(item: schemas.CartCreate, db: AsyncSession = Depends(get_db), current_user: User = Depends(require_role(["Admin", "Manager"]))):
    db_item = db_models.Cart(**item.model_dump(exclude_unset=True))
    db.add(db_item)
    await db.commit()
    await db.refresh(db_item)
    await ws_manager.broadcast("carts")
    return db_item

@router.put("/carts/{id}", response_model=schemas.CartResponse)
async def update_cart(id: str, item: schemas.CartCreate, db: AsyncSession = Depends(get_db), current_user: User = Depends(require_role(["Admin", "Manager"]))):
    item_dict = item.model_dump(exclude_unset=True)
    result = await db.execute(select(db_models.Cart).where(db_models.Cart.id == id))
    db_item = result.scalars().first()
    if not db_item:
        raise HTTPException(status_code=404)
    for k, v in item_dict.items():
        setattr(db_item, k, v)
    await db.commit()
    await db.refresh(db_item)
    await ws_manager.broadcast("carts")
    return db_item

@router.delete("/carts/{id}")
async def delete_cart(id: str, db: AsyncSession = Depends(get_db), current_user: User = Depends(require_role(["Admin"]))):
    result = await db.execute(select(db_models.Cart).where(db_models.Cart.id == id))
    db_item = result.scalars().first()
    if not db_item:
        raise HTTPException(status_code=404)
    await db.delete(db_item)
    await db.commit()
    await ws_manager.broadcast("carts")
    return {"success": True}


# ================= Order =================

@router.get("/orders", response_model=List[schemas.OrderResponse])
async def get_orders(skip: int = 0, limit: int = 100, db: AsyncSession = Depends(get_db), current_user: User = Depends(get_current_user)):
    result = await db.execute(select(db_models.Order).offset(skip).limit(limit))
    return result.scalars().all()

@router.get("/orders/{id}", response_model=schemas.OrderResponse)
async def get_order(id: str, db: AsyncSession = Depends(get_db), current_user: User = Depends(get_current_user)):
    result = await db.execute(select(db_models.Order).where(db_models.Order.id == id))
    item = result.scalars().first()
    if not item:
        raise HTTPException(status_code=404)
    return item

@router.post("/orders", response_model=schemas.OrderResponse)
async def create_order(item: schemas.OrderCreate, db: AsyncSession = Depends(get_db), current_user: User = Depends(require_role(["Admin", "Manager"]))):
    db_item = db_models.Order(**item.model_dump(exclude_unset=True))
    db.add(db_item)
    await db.commit()
    await db.refresh(db_item)
    await ws_manager.broadcast("orders")
    return db_item

@router.put("/orders/{id}", response_model=schemas.OrderResponse)
async def update_order(id: str, item: schemas.OrderCreate, db: AsyncSession = Depends(get_db), current_user: User = Depends(require_role(["Admin", "Manager"]))):
    item_dict = item.model_dump(exclude_unset=True)
    result = await db.execute(select(db_models.Order).where(db_models.Order.id == id))
    db_item = result.scalars().first()
    if not db_item:
        raise HTTPException(status_code=404)
    for k, v in item_dict.items():
        setattr(db_item, k, v)
    await db.commit()
    await db.refresh(db_item)
    await ws_manager.broadcast("orders")
    return db_item

@router.delete("/orders/{id}")
async def delete_order(id: str, db: AsyncSession = Depends(get_db), current_user: User = Depends(require_role(["Admin"]))):
    result = await db.execute(select(db_models.Order).where(db_models.Order.id == id))
    db_item = result.scalars().first()
    if not db_item:
        raise HTTPException(status_code=404)
    await db.delete(db_item)
    await db.commit()
    await ws_manager.broadcast("orders")
    return {"success": True}


# ================= Invoice =================

@router.get("/invoices", response_model=List[schemas.InvoiceResponse])
async def get_invoices(skip: int = 0, limit: int = 100, db: AsyncSession = Depends(get_db), current_user: User = Depends(get_current_user)):
    result = await db.execute(select(db_models.Invoice).offset(skip).limit(limit))
    return result.scalars().all()

@router.get("/invoices/{id}", response_model=schemas.InvoiceResponse)
async def get_invoice(id: str, db: AsyncSession = Depends(get_db), current_user: User = Depends(get_current_user)):
    result = await db.execute(select(db_models.Invoice).where(db_models.Invoice.id == id))
    item = result.scalars().first()
    if not item:
        raise HTTPException(status_code=404)
    return item

@router.post("/invoices", response_model=schemas.InvoiceResponse)
async def create_invoice(item: schemas.InvoiceCreate, db: AsyncSession = Depends(get_db), current_user: User = Depends(require_role(["Admin", "Manager"]))):
    db_item = db_models.Invoice(**item.model_dump(exclude_unset=True))
    db.add(db_item)
    await db.commit()
    await db.refresh(db_item)
    await ws_manager.broadcast("invoices")
    return db_item

@router.put("/invoices/{id}", response_model=schemas.InvoiceResponse)
async def update_invoice(id: str, item: schemas.InvoiceCreate, db: AsyncSession = Depends(get_db), current_user: User = Depends(require_role(["Admin", "Manager"]))):
    item_dict = item.model_dump(exclude_unset=True)
    result = await db.execute(select(db_models.Invoice).where(db_models.Invoice.id == id))
    db_item = result.scalars().first()
    if not db_item:
        raise HTTPException(status_code=404)
    for k, v in item_dict.items():
        setattr(db_item, k, v)
    await db.commit()
    await db.refresh(db_item)
    await ws_manager.broadcast("invoices")
    return db_item

@router.delete("/invoices/{id}")
async def delete_invoice(id: str, db: AsyncSession = Depends(get_db), current_user: User = Depends(require_role(["Admin"]))):
    result = await db.execute(select(db_models.Invoice).where(db_models.Invoice.id == id))
    db_item = result.scalars().first()
    if not db_item:
        raise HTTPException(status_code=404)
    await db.delete(db_item)
    await db.commit()
    await ws_manager.broadcast("invoices")
    return {"success": True}


# ================= Payment =================

@router.get("/payments", response_model=List[schemas.PaymentResponse])
async def get_payments(skip: int = 0, limit: int = 100, db: AsyncSession = Depends(get_db), current_user: User = Depends(get_current_user)):
    result = await db.execute(select(db_models.Payment).offset(skip).limit(limit))
    return result.scalars().all()

@router.get("/payments/{id}", response_model=schemas.PaymentResponse)
async def get_payment(id: str, db: AsyncSession = Depends(get_db), current_user: User = Depends(get_current_user)):
    result = await db.execute(select(db_models.Payment).where(db_models.Payment.id == id))
    item = result.scalars().first()
    if not item:
        raise HTTPException(status_code=404)
    return item

@router.post("/payments", response_model=schemas.PaymentResponse)
async def create_payment(item: schemas.PaymentCreate, db: AsyncSession = Depends(get_db), current_user: User = Depends(require_role(["Admin", "Manager"]))):
    db_item = db_models.Payment(**item.model_dump(exclude_unset=True))
    db.add(db_item)
    await db.commit()
    await db.refresh(db_item)
    await ws_manager.broadcast("payments")
    return db_item

@router.put("/payments/{id}", response_model=schemas.PaymentResponse)
async def update_payment(id: str, item: schemas.PaymentCreate, db: AsyncSession = Depends(get_db), current_user: User = Depends(require_role(["Admin", "Manager"]))):
    item_dict = item.model_dump(exclude_unset=True)
    result = await db.execute(select(db_models.Payment).where(db_models.Payment.id == id))
    db_item = result.scalars().first()
    if not db_item:
        raise HTTPException(status_code=404)
    for k, v in item_dict.items():
        setattr(db_item, k, v)
    await db.commit()
    await db.refresh(db_item)
    await ws_manager.broadcast("payments")
    return db_item

@router.delete("/payments/{id}")
async def delete_payment(id: str, db: AsyncSession = Depends(get_db), current_user: User = Depends(require_role(["Admin"]))):
    result = await db.execute(select(db_models.Payment).where(db_models.Payment.id == id))
    db_item = result.scalars().first()
    if not db_item:
        raise HTTPException(status_code=404)
    await db.delete(db_item)
    await db.commit()
    await ws_manager.broadcast("payments")
    return {"success": True}


# ================= Expense =================

@router.get("/expenses", response_model=List[schemas.ExpenseResponse])
async def get_expenses(skip: int = 0, limit: int = 100, db: AsyncSession = Depends(get_db), current_user: User = Depends(get_current_user)):
    result = await db.execute(select(db_models.Expense).offset(skip).limit(limit))
    return result.scalars().all()

@router.get("/expenses/{id}", response_model=schemas.ExpenseResponse)
async def get_expense(id: str, db: AsyncSession = Depends(get_db), current_user: User = Depends(get_current_user)):
    result = await db.execute(select(db_models.Expense).where(db_models.Expense.id == id))
    item = result.scalars().first()
    if not item:
        raise HTTPException(status_code=404)
    return item

@router.post("/expenses", response_model=schemas.ExpenseResponse)
async def create_expense(item: schemas.ExpenseCreate, db: AsyncSession = Depends(get_db), current_user: User = Depends(require_role(["Admin", "Manager"]))):
    db_item = db_models.Expense(**item.model_dump(exclude_unset=True))
    db.add(db_item)
    await db.commit()
    await db.refresh(db_item)
    await ws_manager.broadcast("expenses")
    return db_item

@router.put("/expenses/{id}", response_model=schemas.ExpenseResponse)
async def update_expense(id: str, item: schemas.ExpenseCreate, db: AsyncSession = Depends(get_db), current_user: User = Depends(require_role(["Admin", "Manager"]))):
    item_dict = item.model_dump(exclude_unset=True)
    result = await db.execute(select(db_models.Expense).where(db_models.Expense.id == id))
    db_item = result.scalars().first()
    if not db_item:
        raise HTTPException(status_code=404)
    for k, v in item_dict.items():
        setattr(db_item, k, v)
    await db.commit()
    await db.refresh(db_item)
    await ws_manager.broadcast("expenses")
    return db_item

@router.delete("/expenses/{id}")
async def delete_expense(id: str, db: AsyncSession = Depends(get_db), current_user: User = Depends(require_role(["Admin"]))):
    result = await db.execute(select(db_models.Expense).where(db_models.Expense.id == id))
    db_item = result.scalars().first()
    if not db_item:
        raise HTTPException(status_code=404)
    await db.delete(db_item)
    await db.commit()
    await ws_manager.broadcast("expenses")
    return {"success": True}


# ================= ActivityLog =================

@router.get("/activity_logs", response_model=List[schemas.ActivityLogResponse])
async def get_activity_logs(skip: int = 0, limit: int = 100, db: AsyncSession = Depends(get_db), current_user: User = Depends(get_current_user)):
    result = await db.execute(select(db_models.ActivityLog).offset(skip).limit(limit))
    return result.scalars().all()

@router.get("/activity_logs/{id}")
async def get_activitylog(id: str, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(db_models.ActivityLog).where(db_models.ActivityLog.id == id))
    item = result.scalars().first()
    if not item:
        raise HTTPException(status_code=404)
    return item

@router.post("/activity_logs", response_model=schemas.ActivityLogResponse)
async def create_activitylog(item: schemas.ActivityLogCreate, db: AsyncSession = Depends(get_db)):
    db_item = db_models.ActivityLog(**item.model_dump(exclude_unset=True))
    db.add(db_item)
    await db.commit()
    await db.refresh(db_item)
    await ws_manager.broadcast("activity_logs")
    return db_item

@router.put("/activity_logs/{id}", response_model=schemas.ActivityLogResponse)
async def update_activitylog(id: str, item: schemas.ActivityLogCreate, db: AsyncSession = Depends(get_db)):
    item_dict = item.model_dump(exclude_unset=True)
    result = await db.execute(select(db_models.ActivityLog).where(db_models.ActivityLog.id == id))
    db_item = result.scalars().first()
    if not db_item:
        raise HTTPException(status_code=404)
    for k, v in item_dict.items():
        setattr(db_item, k, v)
    await db.commit()
    await db.refresh(db_item)
    await ws_manager.broadcast("activity_logs")
    return db_item

@router.delete("/activity_logs/{id}")
async def delete_activitylog(id: str, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(db_models.ActivityLog).where(db_models.ActivityLog.id == id))
    db_item = result.scalars().first()
    if not db_item:
        raise HTTPException(status_code=404)
    await db.delete(db_item)
    await db.commit()
    await ws_manager.broadcast("activity_logs")
    return {"success": True}


# ================= Notification =================

@router.get("/notifications", response_model=List[schemas.NotificationResponse])
async def get_notifications(skip: int = 0, limit: int = 100, db: AsyncSession = Depends(get_db), current_user: User = Depends(get_current_user)):
    result = await db.execute(select(db_models.Notification).offset(skip).limit(limit))
    return result.scalars().all()

@router.get("/notifications/{id}", response_model=schemas.NotificationResponse)
async def get_notification(id: str, db: AsyncSession = Depends(get_db), current_user: User = Depends(get_current_user)):
    result = await db.execute(select(db_models.Notification).where(db_models.Notification.id == id))
    item = result.scalars().first()
    if not item:
        raise HTTPException(status_code=404)
    return item

@router.post("/notifications", response_model=schemas.NotificationResponse)
async def create_notification(item: schemas.NotificationCreate, db: AsyncSession = Depends(get_db), current_user: User = Depends(require_role(["Admin", "Manager"]))):
    db_item = db_models.Notification(**item.model_dump(exclude_unset=True))
    db.add(db_item)
    await db.commit()
    await db.refresh(db_item)
    await ws_manager.broadcast("notifications")
    return db_item

@router.put("/notifications/{id}", response_model=schemas.NotificationResponse)
async def update_notification(id: str, item: schemas.NotificationCreate, db: AsyncSession = Depends(get_db), current_user: User = Depends(require_role(["Admin", "Manager"]))):
    item_dict = item.model_dump(exclude_unset=True)
    result = await db.execute(select(db_models.Notification).where(db_models.Notification.id == id))
    db_item = result.scalars().first()
    if not db_item:
        raise HTTPException(status_code=404)
    for k, v in item_dict.items():
        setattr(db_item, k, v)
    await db.commit()
    await db.refresh(db_item)
    await ws_manager.broadcast("notifications")
    return db_item

@router.delete("/notifications/{id}")
async def delete_notification(id: str, db: AsyncSession = Depends(get_db), current_user: User = Depends(require_role(["Admin"]))):
    result = await db.execute(select(db_models.Notification).where(db_models.Notification.id == id))
    db_item = result.scalars().first()
    if not db_item:
        raise HTTPException(status_code=404)
    await db.delete(db_item)
    await db.commit()
    await ws_manager.broadcast("notifications")
    return {"success": True}


@router.get("/settings", response_model=schemas.SettingsResponse)
async def get_settings(skip: int = 0, limit: int = 100, db: AsyncSession = Depends(get_db), current_user: User = Depends(get_current_user)):
    result = await db.execute(select(db_models.Settings).where(db_models.Settings.id == "default"))
    settings = result.scalars().first()
    if not settings:
        settings = db_models.Settings(id="default")
        db.add(settings)
        await db.commit()
        await db.refresh(settings)
    return settings

@router.put("/settings", response_model=schemas.SettingsResponse)
async def update_settings(item: schemas.SettingsCreate, db: AsyncSession = Depends(get_db), current_user: User = Depends(require_role(["Admin", "Manager"]))):
    item_dict = item.model_dump(exclude_unset=True)
    id = "default"
    item_dict = convert_dict_keys(item_dict, to_snake_case)
    result = await db.execute(select(db_models.Settings).where(db_models.Settings.id == "default"))
    db_item = result.scalars().first()
    if not db_item:
        db_item = db_models.Settings(id="default")
        db.add(db_item)
    for k, v in item_dict.items():
        if k != "id":
            setattr(db_item, k, v)
    await db.commit()
    await db.refresh(db_item)
    await ws_manager.broadcast("settings")
    return db_item
