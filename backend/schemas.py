from pydantic import BaseModel, EmailStr, Field, ConfigDict
from typing import List, Optional, Any
from datetime import datetime

def to_camel(string: str) -> str:
    parts = string.split('_')
    return parts[0] + ''.join(word.capitalize() for word in parts[1:])

class CamelBase(BaseModel):
    model_config = ConfigDict(alias_generator=to_camel, populate_by_name=True, from_attributes=True)

class UserBase(CamelBase):
    name: str = Field(..., min_length=1)
    email: EmailStr
    role: str = Field(..., pattern="^(Admin|Manager|Cashier|Employee)$")

class UserCreate(UserBase):
    password: str = Field(..., min_length=6)

class UserResponse(UserBase):
    id: str
    created_at: datetime
    employee_id: Optional[str] = None
    is_active: Optional[bool] = None
    phone: Optional[str] = None
    department: Optional[str] = None
    address: Optional[str] = None

class CustomerCreate(CamelBase):
    name: str = Field(..., min_length=1)
    email: Optional[str] = None
    phone: Optional[str] = None
    address: Optional[str] = None
    total_spent: float = 0
    outstanding_credit: float = 0
    pending_amount: float = 0
    total_orders: int = 0
    last_purchase_date: Optional[datetime] = None
    loyalty_points: int = 0
    last_visit: Optional[datetime] = None
    credit_limit: float = 0

class CustomerResponse(CustomerCreate):
    id: str
    created_at: datetime

class SupplierCreate(CamelBase):
    name: str = Field(..., min_length=1)
    contact_person: Optional[str] = None
    email: Optional[str] = None
    phone: Optional[str] = None
    outstanding_amount: float = 0

class SupplierResponse(SupplierCreate):
    id: str
    created_at: datetime

class CategoryCreate(CamelBase):
    name: str = Field(..., min_length=1)
    description: Optional[str] = None

class CategoryResponse(CategoryCreate):
    id: str

class ProductCreate(CamelBase):
    sku: str = Field(..., min_length=1)
    barcode: Optional[str] = None
    name: str = Field(..., min_length=1)
    category_id: Optional[str] = None
    supplier_id: Optional[str] = None
    purchase_price: float = 0
    selling_price: float = 0
    stock: int = 0
    min_stock: int = 0
    status: str = Field(default="Active")
    image_url: Optional[str] = None

class ProductResponse(ProductCreate):
    id: str

class InventoryLogCreate(CamelBase):
    product_id: str
    product_name: str
    type: str
    quantity: int
    date: datetime
    user_id: Optional[str] = None
    reference_id: Optional[str] = None
    notes: Optional[str] = None

class InventoryLogResponse(InventoryLogCreate):
    id: str

class CartItem(CamelBase):
    product_id: str
    quantity: int
    price: float
    total: float
    product_name: str

class CartCreate(CamelBase):
    customer_id: Optional[str] = None
    customer_name: Optional[str] = None
    cashier_id: Optional[str] = None
    status: str = Field(default="Active")
    items: List[CartItem] = Field(default_factory=list)
    subtotal: float = 0
    discount: float = 0
    tax: float = 0
    grand_total: float = 0

class CartResponse(CartCreate):
    id: str
    created_date: datetime

class OrderCreate(CamelBase):
    cart_id: Optional[str] = None
    date: datetime
    customer_id: Optional[str] = None
    customer_name: Optional[str] = None
    total_amount: float = 0
    tax: float = 0
    discount: float = 0
    items: List[CartItem] = Field(default_factory=list)
    status: str = Field(default="Completed")

class OrderResponse(OrderCreate):
    id: str

class InvoiceCreate(CamelBase):
    order_id: str
    bill_number: str
    date: datetime
    customer_id: Optional[str] = None
    customer_name: Optional[str] = None
    total_amount: float = 0
    paid_amount: float = 0
    pending_amount: float = 0
    status: str = Field(default="Not Paid")
    due_date: Optional[datetime] = None
    reminder_frequency: Optional[str] = None
    reminder_count: int = 0
    last_reminder_date: Optional[datetime] = None

class InvoiceResponse(InvoiceCreate):
    id: str

class PaymentCreate(CamelBase):
    invoice_id: str
    date: datetime
    amount: float = 0
    method: str
    status: str = Field(default="Completed")
    cashier_id: Optional[str] = None

class PaymentResponse(PaymentCreate):
    id: str

class ExpenseCreate(CamelBase):
    date: datetime
    category: str
    amount: float = 0
    description: str
    receipt_url: Optional[str] = None

class ExpenseResponse(ExpenseCreate):
    id: str

class ActivityLogCreate(CamelBase):
    date: datetime
    user_id: Optional[str] = None
    user_name: Optional[str] = None
    action: str
    details: str
    entity_type: Optional[str] = None
    entity_id: Optional[str] = None

class ActivityLogResponse(ActivityLogCreate):
    id: str

class NotificationCreate(CamelBase):
    date: datetime
    title: str
    message: str
    is_read: bool = False
    type: str
    reference_id: Optional[str] = None

class NotificationResponse(NotificationCreate):
    id: str

class SettingsCreate(CamelBase):
    store_name: str
    tax_rate: float
    currency: str
    theme: str
    invoice_sequence: int

class SettingsResponse(SettingsCreate):
    id: str
