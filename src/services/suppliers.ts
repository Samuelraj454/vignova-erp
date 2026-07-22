import { api } from "./api";
import type { Supplier } from "../database/schema";

export type { Supplier };

export const getSuppliers = async (): Promise<Supplier[]> => {
  const response = await api.get('/suppliers');
  return response.data;
};

export const getSupplierById = async (id: string): Promise<Supplier> => {
  const response = await api.get(`/suppliers/${id}`);
  return response.data;
};

export const createSupplier = async (data: Omit<Supplier, "id" | "createdAt">): Promise<Supplier> => {
  const response = await api.post('/suppliers', data);
  return response.data;
};

export const updateSupplier = async (id: string, data: Partial<Supplier>): Promise<Supplier> => {
  const response = await api.put(`/suppliers/${id}`, data);
  return response.data;
};

export const deleteSupplier = async (id: string): Promise<boolean> => {
  await api.delete(`/suppliers/${id}`);
  return true;
};

