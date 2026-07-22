import requests
import json

login_data = {"username": "admin@vignova.com", "password": "Admin@123"}
login_res = requests.post("https://vignova-erp.onrender.com/api/auth/login", data=login_data)
token = login_res.json()["access_token"]

headers = {"Authorization": f"Bearer {token}"}
form_data = {
    "name": "gum",
    "sku": "SKU-IN 0002",
    "purchase_price": "0",
    "selling_price": "0",
    "stock": "0",
    "min_stock": "0",
    "category_id": "",
    "supplier_id": "",
    "status": "Active"
}

# Sending as multipart/form-data
res = requests.post("https://vignova-erp.onrender.com/api/products", headers=headers, data=form_data, files={"image": ("", "")})
print(res.status_code)
print(res.text)
