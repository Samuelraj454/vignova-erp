import uuid
from sqlalchemy import Column, String, Integer, Float, Boolean, ForeignKey, DateTime, JSON
from sqlalchemy.orm import relationship
from backend.db.database import Base
import datetime

class SystemSequence(Base):
    __tablename__ = "system_sequences"
    name = Column(String, primary_key=True)
    last_value = Column(Integer, default=0)

class User(Base):
    __tablename__ = "users"
    id = Column(String, primary_key=True, index=True, default=lambda: f"usr_" + uuid.uuid4().hex[:8])
    name = Column(String, nullable=False)
    email = Column(String, unique=True, index=True, nullable=False)
    password_hash = Column(String, nullable=False)
    role = Column(String, nullable=False) # Admin, Manager, Cashier
    is_active = Column(Boolean, default=True)
    requires_password_change = Column(Boolean, default=False)
    employee_id = Column(String, index=True, nullable=True)
    phone = Column(String, nullable=True)
    address = Column(String, nullable=True)
    department = Column(String, nullable=True)
    is_deleted = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

class Customer(Base):
    __tablename__ = "customers"
    id = Column(String, primary_key=True, index=True, default=lambda: f"cus_" + uuid.uuid4().hex[:8])
    name = Column(String, nullable=False)
    email = Column(String)
    phone = Column(String)
    address = Column(String)
    total_spent = Column(Float, default=0)
    outstanding_credit = Column(Float, default=0)
    pending_amount = Column(Float, default=0)
    total_orders = Column(Integer, default=0)
    last_purchase_date = Column(DateTime, nullable=True)
    loyalty_points = Column(Integer, default=0)
    last_visit = Column(DateTime, nullable=True)
    credit_limit = Column(Float, default=0)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

class Supplier(Base):
    __tablename__ = "suppliers"
    id = Column(String, primary_key=True, index=True, default=lambda: f"sup_" + uuid.uuid4().hex[:8])
    name = Column(String, nullable=False)
    contact_person = Column(String)
    email = Column(String)
    phone = Column(String)
    outstanding_amount = Column(Float, default=0)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

class Category(Base):
    __tablename__ = "categories"
    id = Column(String, primary_key=True, index=True, default=lambda: f"cat_" + uuid.uuid4().hex[:8])
    name = Column(String, nullable=False)
    description = Column(String)

class Product(Base):
    __tablename__ = "products"
    id = Column(String, primary_key=True, index=True, default=lambda: f"prd_" + uuid.uuid4().hex[:8])
    sku = Column(String, unique=True, index=True)
    barcode = Column(String, nullable=True)
    name = Column(String, nullable=False)
    category_id = Column(String, ForeignKey("categories.id", ondelete="SET NULL"))
    supplier_id = Column(String, ForeignKey("suppliers.id", ondelete="SET NULL"), nullable=True)
    purchase_price = Column(Float, default=0)
    selling_price = Column(Float, default=0)
    stock = Column(Integer, default=0)
    min_stock = Column(Integer, default=0)
    status = Column(String, default="Active")
    image_url = Column(String, nullable=True)

class InventoryLog(Base):
    __tablename__ = "inventory_logs"
    id = Column(String, primary_key=True, index=True, default=lambda: f"inv_" + uuid.uuid4().hex[:8])
    product_id = Column(String, ForeignKey("products.id", ondelete="SET NULL"))
    product_name = Column(String)
    type = Column(String, nullable=False)
    quantity = Column(Integer, nullable=False)
    date = Column(DateTime, default=datetime.datetime.utcnow)
    user_id = Column(String, ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    reference_id = Column(String, nullable=True)
    notes = Column(String, nullable=True)

class Cart(Base):
    __tablename__ = "carts"
    id = Column(String, primary_key=True, index=True, default=lambda: f"crt_" + uuid.uuid4().hex[:8])
    customer_id = Column(String, ForeignKey("customers.id", ondelete="SET NULL"), nullable=True)
    customer_name = Column(String, nullable=True)
    cashier_id = Column(String, ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    created_date = Column(DateTime, default=datetime.datetime.utcnow)
    status = Column(String, default="Active")
    items = Column(JSON, default=list)
    subtotal = Column(Float, default=0)
    discount = Column(Float, default=0)
    tax = Column(Float, default=0)
    grand_total = Column(Float, default=0)

class Order(Base):
    __tablename__ = "orders"
    id = Column(String, primary_key=True, index=True, default=lambda: f"ord_" + uuid.uuid4().hex[:8])
    cart_id = Column(String, ForeignKey("carts.id", ondelete="SET NULL"), nullable=True)
    date = Column(DateTime, default=datetime.datetime.utcnow)
    customer_id = Column(String, ForeignKey("customers.id", ondelete="SET NULL"), nullable=True)
    customer_name = Column(String)
    total_amount = Column(Float, default=0)
    tax = Column(Float, default=0)
    discount = Column(Float, default=0)
    items = Column(JSON, default=list)
    status = Column(String, default="Completed")

class Invoice(Base):
    __tablename__ = "invoices"
    id = Column(String, primary_key=True, index=True, default=lambda: f"inv_" + uuid.uuid4().hex[:8])
    order_id = Column(String, ForeignKey("orders.id", ondelete="CASCADE"))
    bill_number = Column(String, unique=True, index=True)
    date = Column(DateTime, default=datetime.datetime.utcnow)
    customer_id = Column(String, ForeignKey("customers.id", ondelete="SET NULL"), nullable=True)
    customer_name = Column(String)
    total_amount = Column(Float, default=0)
    paid_amount = Column(Float, default=0)
    pending_amount = Column(Float, default=0)
    status = Column(String, default="Not Paid")
    due_date = Column(DateTime, nullable=True)
    reminder_frequency = Column(String, nullable=True)
    reminder_count = Column(Integer, default=0)
    last_reminder_date = Column(DateTime, nullable=True)

class Payment(Base):
    __tablename__ = "payments"
    id = Column(String, primary_key=True, index=True, default=lambda: f"pay_" + uuid.uuid4().hex[:8])
    invoice_id = Column(String, ForeignKey("invoices.id", ondelete="CASCADE"))
    date = Column(DateTime, default=datetime.datetime.utcnow)
    amount = Column(Float, default=0)
    method = Column(String)
    status = Column(String, default="Completed")
    cashier_id = Column(String, ForeignKey("users.id", ondelete="SET NULL"), nullable=True)

class Expense(Base):
    __tablename__ = "expenses"
    id = Column(String, primary_key=True, index=True, default=lambda: f"exp_" + uuid.uuid4().hex[:8])
    date = Column(DateTime, default=datetime.datetime.utcnow)
    category = Column(String)
    amount = Column(Float, default=0)
    description = Column(String)
    receipt_url = Column(String, nullable=True)

class ActivityLog(Base):
    __tablename__ = "activity_logs"
    id = Column(String, primary_key=True, index=True, default=lambda: f"act_" + uuid.uuid4().hex[:8])
    date = Column(DateTime, default=datetime.datetime.utcnow)
    user_id = Column(String, ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    user_name = Column(String)
    action = Column(String)
    details = Column(String)
    entity_type = Column(String, nullable=True)
    entity_id = Column(String, nullable=True)

class Notification(Base):
    __tablename__ = "notifications"
    id = Column(String, primary_key=True, index=True, default=lambda: f"not_" + uuid.uuid4().hex[:8])
    date = Column(DateTime, default=datetime.datetime.utcnow)
    title = Column(String)
    message = Column(String)
    is_read = Column(Boolean, default=False)
    type = Column(String)
    reference_id = Column(String, nullable=True)

class Settings(Base):
    __tablename__ = "settings"
    id = Column(String, primary_key=True, default="default")
    store_name = Column(String, default="Vignova ERP")
    tax_rate = Column(Float, default=5.0)
    currency = Column(String, default="USD")
    theme = Column(String, default="system")
    invoice_sequence = Column(Integer, default=0)
