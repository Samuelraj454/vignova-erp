import re

with open('backend/models/models.py', 'r') as f:
    content = f.read()

def replacer(match):
    table_name = match.group(1)
    prefix = table_name[:3]
    if table_name == "users":
        prefix = "usr"
    elif table_name == "customers":
        prefix = "cus"
    elif table_name == "suppliers":
        prefix = "sup"
    elif table_name == "categories":
        prefix = "cat"
    elif table_name == "products":
        prefix = "prd"
    elif table_name == "inventory_logs":
        prefix = "inv"
    elif table_name == "carts":
        prefix = "crt"
    elif table_name == "orders":
        prefix = "ord"
    elif table_name == "invoices":
        prefix = "inv"
    elif table_name == "payments":
        prefix = "pay"
    elif table_name == "expenses":
        prefix = "exp"
    elif table_name == "activity_logs":
        prefix = "act"
    elif table_name == "notifications":
        prefix = "not"
    
    return f'__tablename__ = "{table_name}"\n    id = Column(String, primary_key=True, index=True, default=lambda: f"{prefix}_" + uuid.uuid4().hex[:8])'

new_content = re.sub(r'__tablename__ = "(.*?)"\n    id = Column\(String, primary_key=True, index=True\)', replacer, content)

# Check if import uuid is present
if "import uuid" not in new_content:
    new_content = "import uuid\n" + new_content

with open('backend/models/models.py', 'w') as f:
    f.write(new_content)
print("Updated models.py")
