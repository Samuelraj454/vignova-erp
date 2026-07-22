from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from backend.db.database import get_db
from backend.models import models as db_models
from backend import schemas
from typing import List, Dict, Any
from backend.core.websockets import ws_manager
from backend.api.auth import get_current_user, require_role, User
from pydantic import BaseModel
import datetime
import uuid

router = APIRouter(prefix="/sales", tags=["sales"])
from backend.schemas import CamelBase

class CheckoutRequest(CamelBase):
    cart_id: str
    customer_id: str | None = None
    customer_name: str | None = None
    items: List[Dict[str, Any]]
    subtotal: float
    discount: float
    tax: float
    grand_total: float
    payments: List[Dict[str, Any]] = []
    due_date: str | None = None
    bill_number: str | None = None
    status: str = "Paid"
    paid_amount: float | None = None
    payment_method: str | None = None

@router.post("/checkout")
async def process_checkout(req: CheckoutRequest, db: AsyncSession = Depends(get_db), current_user: User = Depends(require_role(["Admin", "Manager", "Cashier", "Employee"]))):
    try:
        # We start an explicit transaction. If any error occurs, it automatically rolls back
        async with db.begin_nested():
            now = datetime.datetime.utcnow()
            
            # 1. Handle Auto-Creating Customers for "Walk-in" with custom names
            if not req.customer_id and req.customer_name and req.customer_name.lower() != "walk-in customer":
                # Check if customer already exists by name
                existing_cust_res = await db.execute(select(db_models.Customer).where(db_models.Customer.name == req.customer_name))
                existing_cust = existing_cust_res.scalars().first()
                if existing_cust:
                    req.customer_id = existing_cust.id
                else:
                    new_cust_id = f"cus_{uuid.uuid4().hex[:8]}"
                    new_cust = db_models.Customer(
                        id=new_cust_id,
                        name=req.customer_name,
                        created_at=now
                    )
                    db.add(new_cust)
                    req.customer_id = new_cust_id
            
            # 2. Create Order
            order_id = f"ord_{uuid.uuid4().hex[:8]}"
            order = db_models.Order(
                id=order_id,
                cart_id=req.cart_id,
                date=now,
                customer_id=req.customer_id,
                customer_name=req.customer_name,
                total_amount=req.grand_total,
                tax=req.tax,
                discount=req.discount,
                items=req.items,
                status="Completed"
            )
            db.add(order)

            # 2. Update Cart (close it)
            cart_result = await db.execute(select(db_models.Cart).where(db_models.Cart.id == req.cart_id))
            cart = cart_result.scalars().first()
            if cart:
                cart.status = "Completed"
            
            import random
            
            # Fallbacks for old frontend cached requests
            req_payments = req.payments
            if not req_payments and req.paid_amount is not None:
                req_payments = [{"method": req.payment_method or "Cash", "amount": req.paid_amount}]
                
            bill_num = req.bill_number
            if not bill_num:
                bill_num = f"INV-{now.year}{str(random.randint(0, 9999)).zfill(4)}"

            # 3. Handle Inventory and create InventoryLogs
            for item in req.items:
                prod_id = item.get("product_id") or item.get("productId")
                qty = item.get("quantity", 1)
                
                prod_res = await db.execute(select(db_models.Product).where(db_models.Product.id == prod_id))
                prod = prod_res.scalars().first()
                if not prod:
                    raise HTTPException(status_code=400, detail=f"Product {prod_id} not found")
                if prod.stock < qty:
                    raise HTTPException(status_code=400, detail=f"Insufficient stock for {prod.name}")
                
                prod.stock -= qty
                
                log = db_models.InventoryLog(
                    id=f"inv_{uuid.uuid4().hex[:8]}",
                    product_id=prod.id,
                    product_name=prod.name,
                    type="Sale",
                    quantity=-qty,
                    date=now,
                    user_id=current_user.id,
                    reference_id=order_id,
                    notes="Sold via POS"
                )
                db.add(log)
            
            # 4. Calculate Paid Amount and create Invoice
            total_paid = sum(p.get("amount", 0) for p in req_payments)
            pending_amt = req.grand_total - total_paid
            inv_status = "Paid" if pending_amt <= 0 else "Partially Paid" if total_paid > 0 else "Not Paid"
            # allow frontend to override to Pending if needed
            if req.status in ["Pending", "Not Paid"] and total_paid == 0:
                inv_status = "Pending"
                
            due_dt = datetime.datetime.fromisoformat(req.due_date.replace("Z", "+00:00")).replace(tzinfo=None) if req.due_date else None
            invoice_id = f"inv_{uuid.uuid4().hex[:8]}"
            invoice = db_models.Invoice(
                id=invoice_id,
                order_id=order_id,
                bill_number=bill_num,
                date=now,
                customer_id=req.customer_id,
                customer_name=req.customer_name,
                total_amount=req.grand_total,
                paid_amount=total_paid,
                pending_amount=pending_amt,
                status=inv_status,
                due_date=due_dt
            )
            db.add(invoice)
            
            # 5. Create Payment records
            for p in req_payments:
                amt = p.get("amount", 0)
                method = p.get("method", "Cash")
                if amt > 0:
                    payment = db_models.Payment(
                        id=f"pay_{uuid.uuid4().hex[:8]}",
                        invoice_id=invoice_id,
                        date=now,
                        amount=amt,
                        method=method,
                        status="Completed",
                        cashier_id=current_user.id
                    )
                    db.add(payment)
            
            # 6. Update Customer History
            if req.customer_id:
                cust_res = await db.execute(select(db_models.Customer).where(db_models.Customer.id == req.customer_id))
                cust = cust_res.scalars().first()
                if cust:
                    cust.total_spent += total_paid
                    if pending_amt > 0:
                        cust.outstanding_credit += pending_amt
                        cust.pending_amount += pending_amt
                    cust.total_orders += 1
                    cust.last_purchase_date = now
                    cust.last_visit = now
                    cust.loyalty_points += int(req.grand_total // 10)

            # 7. Audit Log
            audit_log = db_models.ActivityLog(
                id=f"log_{uuid.uuid4().hex[:8]}",
                date=now,
                user_id=current_user.id,
                user_name=current_user.name,
                action="Complete Sale",
                details=f"Completed sale for {req.grand_total} (Order: {order_id})",
                entity_type="Sale",
                entity_id=order_id
            )
            db.add(audit_log)

        await db.commit()
        
        # Notify clients to sync table changes
        await ws_manager.broadcast("orders")
        await ws_manager.broadcast("invoices")
        await ws_manager.broadcast("payments")
        await ws_manager.broadcast("inventory_logs")
        await ws_manager.broadcast("products")
        if req.customer_id:
            await ws_manager.broadcast("customers")
        await ws_manager.broadcast("carts")
        await ws_manager.broadcast("activity_logs")

        return {"success": True, "order_id": order_id, "invoice_id": invoice_id}
        
    except Exception as e:
        await db.rollback()
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/dashboard-stats")
async def get_dashboard_stats(db: AsyncSession = Depends(get_db)):
    # Calculate today's stats
    today = datetime.datetime.utcnow().replace(hour=0, minute=0, second=0, microsecond=0)
    
    # Invoices for today
    inv_res = await db.execute(select(db_models.Invoice).where(db_models.Invoice.date >= today))
    invoices = inv_res.scalars().all()
    
    today_sales = sum(i.total_amount for i in invoices)
    today_paid = sum(i.paid_amount for i in invoices)
    
    # All pending credits (outstanding invoices)
    pending_res = await db.execute(select(db_models.Invoice).where(db_models.Invoice.pending_amount > 0))
    pending_invoices = pending_res.scalars().all()
    pending_credits = sum(i.pending_amount for i in pending_invoices)
    
    # Low stock items
    stock_res = await db.execute(select(db_models.Product).where(db_models.Product.stock <= db_models.Product.min_stock))
    low_stock_items = len(stock_res.scalars().all())
    
    return {
        "todaySales": today_sales,
        "todayPaidRevenue": today_paid,
        "pendingCredits": pending_credits,
        "lowStockItems": low_stock_items
    }

@router.get("/trend")
async def get_sales_trend(db: AsyncSession = Depends(get_db)):
    # Get last 7 days of sales grouped by day
    today = datetime.datetime.utcnow().replace(hour=0, minute=0, second=0, microsecond=0)
    start_date = today - datetime.timedelta(days=6)
    
    res = await db.execute(select(db_models.Invoice).where(db_models.Invoice.date >= start_date))
    invoices = res.scalars().all()
    
    # Group by date string 'MMM DD'
    trend_dict = {}
    for i in range(7):
        d = start_date + datetime.timedelta(days=i)
        trend_dict[d.strftime('%b %d')] = 0
        
    for inv in invoices:
        d_str = inv.date.strftime('%b %d')
        if d_str in trend_dict:
            trend_dict[d_str] += inv.total_amount
            
    trend_list = [{"name": k, "sales": v} for k, v in trend_dict.items()]
    return trend_list

@router.get("/recent")
async def get_recent_sales(db: AsyncSession = Depends(get_db)):
    res = await db.execute(select(db_models.Invoice).order_by(db_models.Invoice.date.desc()).limit(10))
    invoices = res.scalars().all()
    return [{
        "id": i.id,
        "billNumber": i.bill_number,
        "date": i.date.isoformat(),
        "customerId": i.customer_id,
        "customerName": i.customer_name,
        "totalAmount": i.total_amount,
        "paidAmount": i.paid_amount,
        "pendingAmount": i.pending_amount,
        "status": i.status
    } for i in invoices]

@router.get("")
async def get_all_sales(db: AsyncSession = Depends(get_db)):
    res = await db.execute(select(db_models.Invoice).order_by(db_models.Invoice.date.desc()))
    invoices = res.scalars().all()
    return [{
        "id": i.id,
        "billNumber": i.bill_number,
        "date": i.date.isoformat(),
        "customerId": i.customer_id,
        "customerName": i.customer_name,
        "totalAmount": i.total_amount,
        "paidAmount": i.paid_amount,
        "pendingAmount": i.pending_amount,
        "status": i.status
    } for i in invoices]
