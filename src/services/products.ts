import { api } from "./api";
import type { Product } from "../database/schema";

export type { Product };


export const getProducts = async () => {
  const res = await api.get("/products");
  return res.data;
};

export const getProductById = async (id: string) => {
  const res = await api.get(`/products/${id}`);
  return res.data;
};

export const createProduct = async (data: any) => {
  const res = await api.post("/products", data, {
    headers: { "Content-Type": "multipart/form-data" }
  });
  return res.data;
};

export const updateProduct = async (id: string, data: any) => {
  const res = await api.put(`/products/${id}`, data, {
    headers: { "Content-Type": "multipart/form-data" }
  });
  return res.data;
};

export const deleteProduct = async (id: string) => {
  const res = await api.delete(`/products/${id}`);
  return res.data;
};
