import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getSuppliers, getSupplierById, createSupplier, updateSupplier, deleteSupplier } from "../services/suppliers";
import type { Supplier } from "../services/suppliers";
import { toast } from "sonner";

export const useSuppliers = () => {
  return useQuery({
    queryKey: ["suppliers"],
    queryFn: getSuppliers,
  });
};

export const useSupplier = (id: string) => {
  return useQuery({
    queryKey: ["suppliers", id],
    queryFn: () => getSupplierById(id),
    enabled: !!id,
  });
};

export const useCreateSupplier = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createSupplier,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["suppliers"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard-stats"] });
      toast.success("Supplier created successfully");
    },
    onError: (err) => {
      toast.error("Failed to create supplier: " + err.message);
    }
  });
};

export const useUpdateSupplier = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string, data: Partial<Supplier> }) => updateSupplier(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["suppliers"] });
      queryClient.invalidateQueries({ queryKey: ["suppliers", variables.id] });
      toast.success("Supplier updated successfully");
    },
    onError: (err) => {
      toast.error("Failed to update supplier: " + err.message);
    }
  });
};

export const useDeleteSupplier = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteSupplier,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["suppliers"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard-stats"] });
      toast.success("Supplier deleted successfully");
    },
    onError: (err) => {
      toast.error("Failed to delete supplier: " + err.message);
    }
  });
};
