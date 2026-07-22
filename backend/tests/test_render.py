import asyncio
import httpx

BASE_URL = "https://vignova-erp.onrender.com"

async def test_api():
    print("Testing Production Backend...")
    async with httpx.AsyncClient() as client:
        # 1. Test Auth
        print("Testing Admin Login...")
        res = await client.post(f"{BASE_URL}/api/auth/login", data={"username": "admin@vignova.com", "password": "Admin@123"})
        if res.status_code != 200:
            print(f"Login failed: {res.status_code} {res.text}")
            return
        token = res.json()["access_token"]
        headers = {"Authorization": f"Bearer {token}"}
        print("Admin Login OK.")

        # 2. Employee CRUD
        print("Testing Employee Creation...")
        res = await client.post(
            f"{BASE_URL}/api/employees",
            headers=headers,
            json={"name": "Prod Employee", "email": "proddemo@vignova.com", "password": "password", "role": "Employee", "department": "Sales"}
        )
        print(f"Employee Creation: {res.status_code}")

        # 3. Product CRUD
        print("Testing Product Creation...")
        res = await client.post(
            f"{BASE_URL}/api/products",
            headers=headers,
            json={"name": "Prod Product", "selling_price": 99.99, "purchase_price": 50, "stock": 100, "category_id": "test"}
        )
        print(f"Product Creation: {res.status_code}")
        
        # 4. Fetch Products
        res = await client.get(f"{BASE_URL}/api/products", headers=headers)
        print(f"Fetch Products: {res.status_code}")
        if res.status_code == 200:
            print(f"Products returned: {len(res.json())}")

        print("All API tests completed.")

if __name__ == "__main__":
    asyncio.run(test_api())
