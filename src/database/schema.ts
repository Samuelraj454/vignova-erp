// Centralized ERP Database Schema

export interface User {
  id: string;
  name: string;
  email: string;
  username: string;
  role: "Admin" | "Manager" | "Cashier" | "Employee";
  isActive?: boolean;
  requiresPasswordChange?: boolean;
  employeeId?: string;
  phone?: string;
  address?: string;
  department?: string;
  createdAt: string;
}

export interface Customer {
  
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  totalSpent: number;
  outstandingCredit: number;
  createdAt: string;
  totalOrders: number;
  pendingAmount: number;
  lastPurchaseDate?: string;
  loyaltyPoints?: number;
  lastVisit?: string;
  creditLimit: number;
}

export interface Supplier {
  
  id: string;
  name: string;
  contactPerson: string;
  email: string;
  phone: string;
  outstandingAmount: number;
  createdAt: string;
}

export interface Category {
  
  id: string;
  name: string;
  description: string;
}

export interface Product {
  
  id: string;
  sku: string;
  barcode?: string;
  name: string;
  categoryId: string;
  supplierId?: string;
  purchasePrice: number;
  sellingPrice: number;
  stock: number;
  minStock: number;
  status: "Active" | "Low Stock" | "Out of Stock" | "Archived";
  imageUrl?: string;
}

export interface InventoryLog {
  
  id: string;
  productId: string;
  productName: string;
  type: "Purchase From Supplier" | "Customer Sale" | "Customer Return" | "Supplier Return" | "Stock Adjustment" | "Damaged Stock" | "Expired Stock" | "Manual Correction" | "Initial Stock" | "Transfer";
  quantity: number;
  date: string;
  userId?: string;
  referenceId?: string; // e.g., Order ID or Return ID
  notes?: string;
}

export interface CartItem {
  productId: string;
  productName: string;
  quantity: number;
  price: number;
  total: number;
}

export interface Cart {
  
  id: string;
  customerId?: string;
  customerName?: string;
  cashierId?: string;
  createdDate: string;
  status: "Active" | "Archived";
  items: CartItem[];
  subtotal: number;
  discount: number;
  tax: number;
  grandTotal: number;
}

export interface OrderItem {
  productId: string;
  productName: string;
  quantity: number;
  price: number;
  total: number;
}

export interface Order {
  
  id: string;
  cartId?: string;
  date: string;
  customerId?: string;
  customerName: string;
  totalAmount: number;
  tax: number;
  discount: number;
  items: OrderItem[];
  status: "Completed" | "Cancelled" | "Refunded";
}

export interface Invoice {
  
  id: string;
  orderId: string;
  billNumber: string;
  date: string;
  customerId?: string;
  customerName: string;
  totalAmount: number;
  paidAmount: number;
  pendingAmount: number;
  status: "Paid" | "Partially Paid" | "Not Paid" | "Overdue";
  dueDate?: string;
  reminderFrequency?: "Daily" | "Weekly" | "Monthly" | "Custom";
  reminderCount?: number;
  lastReminderDate?: string;
}

export interface Payment {
  
  id: string;
  invoiceId: string;
  date: string;
  amount: number;
  method: "Cash" | "Card" | "UPI" | "Split" | "Bank Transfer" | "Wallet" | "Credit";
  status: "Completed" | "Failed" | "Refunded";
  cashierId?: string;
}

export interface Expense {
  
  id: string;
  date: string;
  category: string;
  amount: number;
  description: string;
  receiptUrl?: string;
}

export interface ActivityLog {
  
  id: string;
  date: string;
  userId?: string;
  user: string;
  action: string;
  details: string;
  entityType?: string;
  entityId?: string;
}

export interface Notification {
  
  id: string;
  date: string;
  title: string;
  message: string;
  isRead: boolean;
  type: "info" | "warning" | "error" | "success";
  referenceId?: string;
}

export interface Settings {
  storeName: string;
  taxRate: number;
  currency: string;
  theme: "light" | "dark" | "system";
  invoiceSequence: number;
}

export interface AppDatabase {
  users: User[];
  customers: Customer[];
  suppliers: Supplier[];
  categories: Category[];
  products: Product[];
  inventoryLogs: InventoryLog[];
  carts: Cart[];
  orders: Order[];
  invoices: Invoice[];
  payments: Payment[];
  expenses: Expense[];
  activityLogs: ActivityLog[];
  notifications: Notification[];
  settings: Settings;
}
