from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any
from datetime import datetime


class UserBase(BaseModel):
    pass # To be defined fully if needed, but we can accept dict for now in dynamic mode or define strictly

class UserCreate(UserBase):
    pass

class UserUpdate(UserBase):
    pass

class UserResponse(UserBase):
    id: str
    name: Optional[str] = None
    email: Optional[str] = None
    role: Optional[str] = None
    phone: Optional[str] = None
    department: Optional[str] = None
    address: Optional[str] = None
    employeeId: Optional[str] = Field(None, alias="employee_id")
    isActive: Optional[bool] = Field(None, alias="is_active")
    createdAt: Optional[datetime] = Field(None, alias="created_at")

    class Config:
        from_attributes = True
        populate_by_name = True
        allow_population_by_field_name = True

class CustomerBase(BaseModel):
    pass # To be defined fully if needed, but we can accept dict for now in dynamic mode or define strictly

class CustomerCreate(CustomerBase):
    pass

class CustomerUpdate(CustomerBase):
    pass

class CustomerResponse(CustomerBase):
    id: str
    class Config:
        from_attributes = True

class SupplierBase(BaseModel):
    pass # To be defined fully if needed, but we can accept dict for now in dynamic mode or define strictly

class SupplierCreate(SupplierBase):
    pass

class SupplierUpdate(SupplierBase):
    pass

class SupplierResponse(SupplierBase):
    id: str
    class Config:
        from_attributes = True

class CategoryBase(BaseModel):
    pass # To be defined fully if needed, but we can accept dict for now in dynamic mode or define strictly

class CategoryCreate(CategoryBase):
    pass

class CategoryUpdate(CategoryBase):
    pass

class CategoryResponse(CategoryBase):
    id: str
    class Config:
        from_attributes = True

class ProductBase(BaseModel):
    pass # To be defined fully if needed, but we can accept dict for now in dynamic mode or define strictly

class ProductCreate(ProductBase):
    pass

class ProductUpdate(ProductBase):
    pass

class ProductResponse(ProductBase):
    id: str
    class Config:
        from_attributes = True

class InventoryLogBase(BaseModel):
    pass # To be defined fully if needed, but we can accept dict for now in dynamic mode or define strictly

class InventoryLogCreate(InventoryLogBase):
    pass

class InventoryLogUpdate(InventoryLogBase):
    pass

class InventoryLogResponse(InventoryLogBase):
    id: str
    class Config:
        from_attributes = True

class CartBase(BaseModel):
    pass # To be defined fully if needed, but we can accept dict for now in dynamic mode or define strictly

class CartCreate(CartBase):
    pass

class CartUpdate(CartBase):
    pass

class CartResponse(CartBase):
    id: str
    class Config:
        from_attributes = True

class OrderBase(BaseModel):
    pass # To be defined fully if needed, but we can accept dict for now in dynamic mode or define strictly

class OrderCreate(OrderBase):
    pass

class OrderUpdate(OrderBase):
    pass

class OrderResponse(OrderBase):
    id: str
    class Config:
        from_attributes = True

class InvoiceBase(BaseModel):
    pass # To be defined fully if needed, but we can accept dict for now in dynamic mode or define strictly

class InvoiceCreate(InvoiceBase):
    pass

class InvoiceUpdate(InvoiceBase):
    pass

class InvoiceResponse(InvoiceBase):
    id: str
    class Config:
        from_attributes = True

class PaymentBase(BaseModel):
    pass # To be defined fully if needed, but we can accept dict for now in dynamic mode or define strictly

class PaymentCreate(PaymentBase):
    pass

class PaymentUpdate(PaymentBase):
    pass

class PaymentResponse(PaymentBase):
    id: str
    class Config:
        from_attributes = True

class ExpenseBase(BaseModel):
    pass # To be defined fully if needed, but we can accept dict for now in dynamic mode or define strictly

class ExpenseCreate(ExpenseBase):
    pass

class ExpenseUpdate(ExpenseBase):
    pass

class ExpenseResponse(ExpenseBase):
    id: str
    class Config:
        from_attributes = True

class ActivityLogBase(BaseModel):
    pass # To be defined fully if needed, but we can accept dict for now in dynamic mode or define strictly

class ActivityLogCreate(ActivityLogBase):
    pass

class ActivityLogUpdate(ActivityLogBase):
    pass

class ActivityLogResponse(ActivityLogBase):
    id: str
    class Config:
        from_attributes = True

class NotificationBase(BaseModel):
    pass # To be defined fully if needed, but we can accept dict for now in dynamic mode or define strictly

class NotificationCreate(NotificationBase):
    pass

class NotificationUpdate(NotificationBase):
    pass

class NotificationResponse(NotificationBase):
    id: str
    class Config:
        from_attributes = True
