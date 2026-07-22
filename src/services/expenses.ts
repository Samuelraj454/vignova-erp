import { api } from "./api";
import type { Expense } from "../database/schema";

export type { Expense };

export const getExpenses = async (): Promise<Expense[]> => {
  const response = await api.get('/expenses');
  return response.data;
};

export const getExpenseById = async (id: string): Promise<Expense> => {
  const response = await api.get(`/expenses/${id}`);
  return response.data;
};

export const createExpense = async (data: Omit<Expense, "id">): Promise<Expense> => {
  const response = await api.post('/expenses', data);
  return response.data;
};

export const updateExpense = async (id: string, data: Partial<Expense>): Promise<Expense> => {
  const response = await api.put(`/expenses/${id}`, data);
  return response.data;
};

export const deleteExpense = async (id: string): Promise<boolean> => {
  await api.delete(`/expenses/${id}`);
  return true;
};

