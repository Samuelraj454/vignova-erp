import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getCustomers, getCustomerById, createCustomer, updateCustomer, deleteCustomer } from "../services/customers";
import type { Customer } from "../services/customers";
import { toast } from "sonner";

export const useCustomers = () => {
  return useQuery({
    queryKey: ["customers"],
    queryFn: getCustomers,
  });
};

export const useCustomer = (id: string) => {
  return useQuery({
    queryKey: ["customers", id],
    queryFn: () => getCustomerById(id),
    enabled: !!id,
  });
};

export const useCreateCustomer = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createCustomer,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["customers"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard-stats"] });
      toast.success("Customer created successfully");
    },
    onError: (err) => {
      toast.error("Failed to create customer: " + err.message);
    }
  });
};

export const useUpdateCustomer = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string, data: Partial<Customer> }) => updateCustomer(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["customers"] });
      queryClient.invalidateQueries({ queryKey: ["customers", variables.id] });
      toast.success("Customer updated successfully");
    },
    onError: (err) => {
      toast.error("Failed to update customer: " + err.message);
    }
  });
};

export const useDeleteCustomer = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteCustomer,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["customers"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard-stats"] });
      toast.success("Customer deleted successfully");
    },
    onError: (err) => {
      toast.error("Failed to delete customer: " + err.message);
    }
  });
};
