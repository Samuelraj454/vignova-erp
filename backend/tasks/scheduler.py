from apscheduler.schedulers.asyncio import AsyncIOScheduler
from apscheduler.triggers.cron import CronTrigger
from sqlalchemy.future import select
from backend.database.database import AsyncSessionLocal
from backend.models.models import Invoice, Notification, ActivityLog
import datetime

scheduler = AsyncIOScheduler()

async def check_overdue_invoices():
    async with AsyncSessionLocal() as session:
        now = datetime.datetime.utcnow()
        # Find unpaid invoices past due date
        result = await session.execute(
            select(Invoice).where(
                (Invoice.status.in_(["Not Paid", "Partially Paid"])) &
                (Invoice.due_date < now)
            )
        )
        invoices = result.scalars().all()

        from backend.core.websockets import ws_manager
        emitted = False
        
        for invoice in invoices:
            if invoice.status != "Overdue":
                invoice.status = "Overdue"
                # Generate Notification
                notif = Notification(
                    id=f"notif_{int(now.timestamp() * 1000)}",
                    title="Invoice Overdue",
                    message=f"Invoice {invoice.bill_number} is now overdue. Pending: ${invoice.pending_amount}",
                    type="warning"
                )
                session.add(notif)
                # Generate Activity Log
                log = ActivityLog(
                    id=f"log_{int(now.timestamp() * 1000)}",
                    user_name="System",
                    action="Invoice Overdue",
                    details=f"Invoice {invoice.bill_number} marked as overdue"
                )
                session.add(log)
                emitted = True
        
        await session.commit()
        if emitted:
            await ws_manager.broadcast("invoices")
            await ws_manager.broadcast("notifications")
            await ws_manager.broadcast("activity_logs")

def start_scheduler():
    scheduler.add_job(check_overdue_invoices, CronTrigger(minute='*/30'))
    scheduler.start()
