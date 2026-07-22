import { api } from "./api";
import type { Product } from "./products";

export const adjustStock = async (productId: string, quantity: number, type: "add" | "remove" | "set", movementType: string, reason: string): Promise<Product> => {
  const response = await api.post(`/inventory/adjust`, { productId, quantity, type, movementType, reason });
  return response.data;
};

export const getLowStockProducts = async (): Promise<Product[]> => {
  const response = await api.get('/inventory/low-stock');
  return response.data;
};

