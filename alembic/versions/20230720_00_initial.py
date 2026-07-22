# -*- coding: utf-8 -*-
"""initial

Revision ID: 20230720_00_initial
Revises: None
Create Date: 2026-07-20 21:10:00.000000
"""

from alembic import op
import sqlalchemy as sa
import datetime

# revision identifiers, used by Alembic.
revision = "20230720_00_initial"
down_revision = None
branch_labels = None
depends_on = None

def upgrade():
    # Create tables based on models
    op.create_table(
        "system_sequences",
        sa.Column("name", sa.String(), primary_key=True),
        sa.Column("last_value", sa.Integer(), default=0),
    )
    op.create_table(
        "users",
        sa.Column("id", sa.String(), primary_key=True, index=True),
        sa.Column("name", sa.String(), nullable=False),
        sa.Column("email", sa.String(), unique=True, index=True, nullable=False),
        sa.Column("password_hash", sa.String(), nullable=False),
        sa.Column("role", sa.String(), nullable=False),
        sa.Column("is_active", sa.Boolean(), default=True),
        sa.Column("requires_password_change", sa.Boolean(), default=False),
        sa.Column("employee_id", sa.String(), index=True, nullable=True),
        sa.Column("phone", sa.String(), nullable=True),
        sa.Column("address", sa.String(), nullable=True),
        sa.Column("department", sa.String(), nullable=True),
        sa.Column("is_deleted", sa.Boolean(), default=False),
        sa.Column("created_at", sa.DateTime(), default=datetime.datetime.utcnow),
    )
    op.create_table(
        "customers",
        sa.Column("id", sa.String(), primary_key=True, index=True),
        sa.Column("name", sa.String(), nullable=False),
        sa.Column("email", sa.String()),
        sa.Column("phone", sa.String()),
        sa.Column("address", sa.String()),
        sa.Column("total_spent", sa.Float(), default=0),
        sa.Column("outstanding_credit", sa.Float(), default=0),
        sa.Column("pending_amount", sa.Float(), default=0),
        sa.Column("total_orders", sa.Integer(), default=0),
        sa.Column("last_purchase_date", sa.DateTime(), nullable=True),
        sa.Column("loyalty_points", sa.Integer(), default=0),
        sa.Column("last_visit", sa.DateTime(), nullable=True),
        sa.Column("credit_limit", sa.Float(), default=0),
        sa.Column("created_at", sa.DateTime(), default=datetime.datetime.utcnow),
    )
    op.create_table(
        "suppliers",
        sa.Column("id", sa.String(), primary_key=True, index=True),
        sa.Column("name", sa.String(), nullable=False),
        sa.Column("contact_person", sa.String()),
        sa.Column("email", sa.String()),
        sa.Column("phone", sa.String()),
        sa.Column("outstanding_amount", sa.Float(), default=0),
        sa.Column("created_at", sa.DateTime(), default=datetime.datetime.utcnow),
    )
    op.create_table(
        "categories",
        sa.Column("id", sa.String(), primary_key=True, index=True),
        sa.Column("name", sa.String(), nullable=False),
        sa.Column("description", sa.String()),
    )
    op.create_table(
        "products",
        sa.Column("id", sa.String(), primary_key=True, index=True),
        sa.Column("sku", sa.String(), unique=True, index=True),
        sa.Column("barcode", sa.String(), nullable=True),
        sa.Column("name", sa.String(), nullable=False),
        sa.Column("category_id", sa.String(), sa.ForeignKey("categories.id", ondelete="SET NULL")),
        sa.Column("supplier_id", sa.String(), sa.ForeignKey("suppliers.id", ondelete="SET NULL"), nullable=True),
        sa.Column("purchase_price", sa.Float(), default=0),
        sa.Column("selling_price", sa.Float(), default=0),
        sa.Column("stock", sa.Integer(), default=0),
        sa.Column("min_stock", sa.Integer(), default=0),
        sa.Column("status", sa.String(), default="Active"),
        sa.Column("image_url", sa.String(), nullable=True),
    )
    op.create_table(
        "inventory_logs",
        sa.Column("id", sa.String(), primary_key=True, index=True),
        sa.Column("product_id", sa.String(), sa.ForeignKey("products.id", ondelete="SET NULL")),
        sa.Column("product_name", sa.String()),
        sa.Column("type", sa.String(), nullable=False),
        sa.Column("quantity", sa.Integer(), nullable=False),
        sa.Column("date", sa.DateTime(), default=datetime.datetime.utcnow),
        sa.Column("user_id", sa.String(), sa.ForeignKey("users.id", ondelete="SET NULL"), nullable=True),
        sa.Column("reference_id", sa.String(), nullable=True),
        sa.Column("notes", sa.String(), nullable=True),
    )
    op.create_table(
        "carts",
        sa.Column("id", sa.String(), primary_key=True, index=True),
        sa.Column("customer_id", sa.String(), sa.ForeignKey("customers.id", ondelete="SET NULL"), nullable=True),
        sa.Column("customer_name", sa.String(), nullable=True),
        sa.Column("cashier_id", sa.String(), sa.ForeignKey("users.id", ondelete="SET NULL"), nullable=True),
        sa.Column("created_date", sa.DateTime(), default=datetime.datetime.utcnow),
        sa.Column("status", sa.String(), default="Active"),
        sa.Column("items", sa.JSON(), default=list),
        sa.Column("subtotal", sa.Float(), default=0),
        sa.Column("discount", sa.Float(), default=0),
        sa.Column("tax", sa.Float(), default=0),
        sa.Column("grand_total", sa.Float(), default=0),
    )
    op.create_table(
        "orders",
        sa.Column("id", sa.String(), primary_key=True, index=True),
        sa.Column("cart_id", sa.String(), sa.ForeignKey("carts.id", ondelete="SET NULL"), nullable=True),
        sa.Column("date", sa.DateTime(), default=datetime.datetime.utcnow),
        sa.Column("customer_id", sa.String(), sa.ForeignKey("customers.id", ondelete="SET NULL"), nullable=True),
        sa.Column("customer_name", sa.String()),
        sa.Column("total_amount", sa.Float(), default=0),
        sa.Column("tax", sa.Float(), default=0),
        sa.Column("discount", sa.Float(), default=0),
        sa.Column("items", sa.JSON(), default=list),
        sa.Column("status", sa.String(), default="Completed"),
    )
    op.create_table(
        "invoices",
        sa.Column("id", sa.String(), primary_key=True, index=True),
        sa.Column("order_id", sa.String(), sa.ForeignKey("orders.id", ondelete="CASCADE")),
        sa.Column("bill_number", sa.String(), unique=True, index=True),
        sa.Column("date", sa.DateTime(), default=datetime.datetime.utcnow),
        sa.Column("customer_id", sa.String(), sa.ForeignKey("customers.id", ondelete="SET NULL"), nullable=True),
        sa.Column("customer_name", sa.String()),
        sa.Column("total_amount", sa.Float(), default=0),
        sa.Column("paid_amount", sa.Float(), default=0),
        sa.Column("pending_amount", sa.Float(), default=0),
        sa.Column("status", sa.String(), default="Not Paid"),
        sa.Column("due_date", sa.DateTime(), nullable=True),
        sa.Column("reminder_frequency", sa.String(), nullable=True),
        sa.Column("reminder_count", sa.Integer(), default=0),
        sa.Column("last_reminder_date", sa.DateTime(), nullable=True),
    )
    op.create_table(
        "payments",
        sa.Column("id", sa.String(), primary_key=True, index=True),
        sa.Column("invoice_id", sa.String(), sa.ForeignKey("invoices.id", ondelete="CASCADE")),
        sa.Column("date", sa.DateTime(), default=datetime.datetime.utcnow),
        sa.Column("amount", sa.Float(), default=0),
        sa.Column("method", sa.String()),
        sa.Column("status", sa.String(), default="Completed"),
        sa.Column("cashier_id", sa.String(), sa.ForeignKey("users.id", ondelete="SET NULL"), nullable=True),
    )
    op.create_table(
        "expenses",
        sa.Column("id", sa.String(), primary_key=True, index=True),
        sa.Column("date", sa.DateTime(), default=datetime.datetime.utcnow),
        sa.Column("category", sa.String()),
        sa.Column("amount", sa.Float(), default=0),
        sa.Column("description", sa.String()),
        sa.Column("receipt_url", sa.String(), nullable=True),
    )
    op.create_table(
        "activity_logs",
        sa.Column("id", sa.String(), primary_key=True, index=True),
        sa.Column("date", sa.DateTime(), default=datetime.datetime.utcnow),
        sa.Column("user_id", sa.String(), sa.ForeignKey("users.id", ondelete="SET NULL"), nullable=True),
        sa.Column("user_name", sa.String()),
        sa.Column("action", sa.String()),
        sa.Column("details", sa.String()),
        sa.Column("entity_type", sa.String(), nullable=True),
        sa.Column("entity_id", sa.String(), nullable=True),
    )
    op.create_table(
        "notifications",
        sa.Column("id", sa.String(), primary_key=True, index=True),
        sa.Column("date", sa.DateTime(), default=datetime.datetime.utcnow),
        sa.Column("title", sa.String()),
        sa.Column("message", sa.String()),
        sa.Column("is_read", sa.Boolean(), default=False),
        sa.Column("type", sa.String()),
        sa.Column("reference_id", sa.String(), nullable=True),
    )
    op.create_table(
        "settings",
        sa.Column("id", sa.String(), primary_key=True, default="default"),
        sa.Column("store_name", sa.String(), default="Vignova ERP"),
        sa.Column("tax_rate", sa.Float(), default=5.0),
        sa.Column("currency", sa.String(), default="USD"),
        sa.Column("theme", sa.String(), default="system"),
        sa.Column("invoice_sequence", sa.Integer(), default=0),
    )

def downgrade():
    op.drop_table("settings")
    op.drop_table("notifications")
    op.drop_table("activity_logs")
    op.drop_table("expenses")
    op.drop_table("payments")
    op.drop_table("invoices")
    op.drop_table("orders")
    op.drop_table("carts")
    op.drop_table("inventory_logs")
    op.drop_table("products")
    op.drop_table("categories")
    op.drop_table("suppliers")
    op.drop_table("customers")
    op.drop_table("users")
    op.drop_table("system_sequences")
