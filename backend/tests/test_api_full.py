import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

import pytest
from fastapi.testclient import TestClient
from backend.core.main import app
from backend.api.auth import get_current_user
from backend.models.models import User
import uuid
import json

def override_get_current_user():
    return User(
        id="usr_test123",
        name="Test Admin",
        email="admin@test.com",
        role="Admin",
        is_active=True
    )

app.dependency_overrides[get_current_user] = override_get_current_user

def test_full_crud():
    entities = {
        "/api/categories": {"name": "Test Category"},
        "/api/customers": {"name": "Test Customer"},
        "/api/suppliers": {"name": "Test Supplier"},
    }

    report = []

    with TestClient(app) as client:
        for ep, payload in entities.items():
            print(f"Testing full CRUD for {ep}...")
            
            # POST
            res_post = client.post(ep, json=payload)
            if res_post.status_code not in (200, 201):
                report.append(f"POST {ep} failed: {res_post.status_code} {res_post.text}")
                continue
                
            data = res_post.json()
            item_id = data.get("id")
            report.append(f"POST {ep} - Status: {res_post.status_code}, ID: {item_id}")
            
            # GET single
            res_get = client.get(f"{ep}/{item_id}")
            report.append(f"GET {ep}/{item_id} - Status: {res_get.status_code}")
            
            # PUT
            payload["name"] = payload["name"] + " Updated"
            res_put = client.put(f"{ep}/{item_id}", json=payload)
            report.append(f"PUT {ep}/{item_id} - Status: {res_put.status_code}")
            if res_put.status_code not in (200, 201):
                report.append(f"  PUT error: {res_put.text}")
            
            # DELETE
            res_del = client.delete(f"{ep}/{item_id}")
            report.append(f"DELETE {ep}/{item_id} - Status: {res_del.status_code}")
            if res_del.status_code not in (200, 204):
                report.append(f"  DELETE error: {res_del.text}")
                
    with open(os.path.join(os.path.dirname(__file__), "test_report_full.txt"), "w") as f:
        f.write("\n".join(report))
        print("Report written to test_report_full.txt")

if __name__ == "__main__":
    test_full_crud()
