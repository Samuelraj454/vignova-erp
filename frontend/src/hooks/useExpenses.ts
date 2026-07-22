import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getExpenses, getExpenseById, createExpense, updateExpense, deleteExpense } from "../services/expenses";
import type { Expense } from "../services/expenses";
import { toast } from "sonner";

export const useExpenses = () => {
  return useQuery({
    queryKey: ["expenses"],
    queryFn: getExpenses,
  });
};

export const useExpense = (id: string) => {
  return useQuery({
    queryKey: ["expenses", id],
    queryFn: () => getExpenseById(id),
    enabled: !!id,
  });
};

export const useCreateExpense = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createExpense,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["expenses"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard-stats"] });
      toast.success("Expense added successfully");
    },
    onError: (err) => {
      toast.error("Failed to add expense: " + err.message);
    }
  });
};

export const useUpdateExpense = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string, data: Partial<Expense> }) => updateExpense(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["expenses"] });
      queryClient.invalidateQueries({ queryKey: ["expenses", variables.id] });
      queryClient.invalidateQueries({ queryKey: ["dashboard-stats"] });
      toast.success("Expense updated successfully");
    },
    onError: (err) => {
      toast.error("Failed to update expense: " + err.message);
    }
  });
};

export const useDeleteExpense = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteExpense,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["expenses"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard-stats"] });
      toast.success("Expense deleted successfully");
    },
    onError: (err) => {
      toast.error("Failed to delete expense: " + err.message);
    }
  });
};
