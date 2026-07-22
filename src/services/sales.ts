import { api } from "./api";

export interface SaleItem {
  productId: string;
  productName: string;
  quantity: number;
  price: number;
  total: number;
}

export interface Sale {
  id: string;
  billNumber: string;
  date: string;
  customerId?: string;
  customerName: string;
  totalAmount: number;
  tax: number;
  discount: number;
  paidAmount: number;
  pendingAmount: number;
  paymentMethod: "Cash" | "Credit Card" | "Bank Transfer" | "Credit" | "Mobile Money";
  status: "Paid" | "Partially Paid" | "Not Paid" | "Overdue" | "Cancelled" | "Refunded";
  dueDate?: string;
  reminderFrequency?: "Daily" | "Weekly" | "Custom";
  items: SaleItem[];
}

export const getRecentSales = async (): Promise<Sale[]> => {
  const response = await api.get('/sales/recent');
  return response.data;
};

export const getAllSales = async (): Promise<Sale[]> => {
  const response = await api.get('/sales');
  return response.data;
};

export const getDashboardStats = async (): Promise<any> => {
  const response = await api.get('/sales/dashboard-stats');
  return response.data;
};

export const getSalesTrend = async (): Promise<any> => {
  const response = await api.get('/sales/trend');
  return response.data;
};

export const completeSale = async (data: Omit<Sale, "id" | "billNumber" | "date"> & { cartId?: string, payments?: any[], status?: string }): Promise<{ id: string; billNumber: string }> => {
  const payload = {
    cart_id: data.cartId,
    customer_id: data.customerId,
    customer_name: data.customerName,
    items: data.items,
    subtotal: data.items.reduce((sum, item) => sum + item.total, 0),
    discount: data.discount,
    tax: data.tax,
    grand_total: data.totalAmount,
    payments: data.payments || [],
    status: data.status,
    due_date: data.dueDate,
    bill_number: "INV-" + new Date().getFullYear() + String(Math.floor(Math.random() * 10000)).padStart(4, '0')
  };
  const response = await api.post('/sales/checkout', payload);
  return { id: response.data.order_id || response.data.id, billNumber: payload.bill_number };
};

export const receivePayment = async (data: { saleId: string; amount: number; method: string }): Promise<boolean> => {
  await api.post(`/sales/${data.saleId}/payment`, { amount: data.amount, method: data.method });
  return true;
};
