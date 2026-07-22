import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

import pytest
from fastapi.testclient import TestClient
from backend.core.main import app
from backend.api.auth import get_current_user
from backend.models.models import User
import datetime
import json
import uuid

def override_get_current_user():
    return User(
        id="usr_testadmin",
        name="Test Admin",
        email="admin@test.com",
        role="Admin",
        is_active=True
    )

app.dependency_overrides[get_current_user] = override_get_current_user

def test_all_endpoints():
    client = TestClient(app)
    report = []
    
    # We will test Settings separately since it's a singleton
    # And then we test standard CRUD endpoints
    
    entities = [
        {"ep": "/api/users", "payload": {"name": "Test User", "email": f"test{uuid.uuid4().hex[:4]}@test.com", "role": "Employee", "password": "password123"}},
        {"ep": "/api/categories", "payload": {"name": "Test Category"}},
        {"ep": "/api/customers", "payload": {"name": "Test Customer"}},
        {"ep": "/api/suppliers", "payload": {"name": "Test Supplier"}},
        {"ep": "/api/products", "payload": {"sku": f"SKU-{uuid.uuid4().hex[:4]}", "name": "Test Product"}},
        {"ep": "/api/inventory_logs", "payload": {"product_id": "test", "product_name": "test", "type": "add", "quantity": 10, "date": datetime.datetime.utcnow().isoformat()}},
        {"ep": "/api/carts", "payload": {}},
        {"ep": "/api/orders", "payload": {"date": datetime.datetime.utcnow().isoformat()}},
        {"ep": "/api/invoices", "payload": {"order_id": "test", "bill_number": f"BILL-{uuid.uuid4().hex[:4]}", "date": datetime.datetime.utcnow().isoformat()}},
        {"ep": "/api/payments", "payload": {"invoice_id": "test", "date": datetime.datetime.utcnow().isoformat(), "method": "Cash"}},
        {"ep": "/api/expenses", "payload": {"date": datetime.datetime.utcnow().isoformat(), "category": "Office", "description": "Pens"}},
        {"ep": "/api/activity_logs", "payload": {"date": datetime.datetime.utcnow().isoformat(), "action": "Test", "details": "Test"}},
        {"ep": "/api/notifications", "payload": {"date": datetime.datetime.utcnow().isoformat(), "title": "Test", "message": "Test", "type": "Info"}},
    ]
    
    for entity in entities:
        ep = entity["ep"]
        payload = entity["payload"]
        
        # POST
        res_post = client.post(ep, json=payload)
        if res_post.status_code not in (200, 201):
            report.append(f"POST {ep} - FAILED {res_post.status_code}: {res_post.text}")
            continue
            
        data = res_post.json()
        item_id = data.get("id")
        report.append(f"POST {ep} - Status: {res_post.status_code}, ID: {item_id}")
        
        # GET ALL
        res_get_all = client.get(ep)
        report.append(f"GET {ep} - Status: {res_get_all.status_code}")
        
        # GET ONE
        res_get = client.get(f"{ep}/{item_id}")
        report.append(f"GET {ep}/{item_id} - Status: {res_get.status_code}")
        
        # PUT (only if not cart/activity/etc that might not have PUT depending on how it's defined, 
        # actually all exist in crud.py, but we'll try to update one field)
        # Note: inventory_logs doesn't have PUT in schemas? Actually crud.py uses item: schema for PUT, so we reuse payload.
        # It's fine to just resend the payload.
        if ep == "/api/users":
            # For users PUT, we might not send password, but it uses UserCreate. Wait, actually we can just pass the original payload.
            res_put = client.put(f"{ep}/{item_id}", json=payload)
            report.append(f"PUT {ep}/{item_id} - Status: {res_put.status_code}")
        else:
            res_put = client.put(f"{ep}/{item_id}", json=payload)
            report.append(f"PUT {ep}/{item_id} - Status: {res_put.status_code}")
            
        # DELETE
        res_del = client.delete(f"{ep}/{item_id}")
        report.append(f"DELETE {ep}/{item_id} - Status: {res_del.status_code}")
        
    # Settings GET and PUT
    res_set_get = client.get("/api/settings")
    report.append(f"GET /api/settings - Status: {res_set_get.status_code}")
    
    settings_payload = {
        "store_name": "Test",
        "tax_rate": 5.0,
        "currency": "USD",
        "theme": "light",
        "invoice_sequence": 1
    }
    res_set_put = client.put("/api/settings", json=settings_payload)
    report.append(f"PUT /api/settings - Status: {res_set_put.status_code}")

    with open(os.path.join(os.path.dirname(__file__), "api_test_report.txt"), "w") as f:
        f.write("\n".join(report))
        print("Report written to api_test_report.txt")

if __name__ == "__main__":
    test_all_endpoints()
