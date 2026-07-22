import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { adjustStock, getLowStockProducts } from "../services/inventory";
import { toast } from "sonner";

export const useAdjustStock = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ productId, quantity, type, movementType, reason }: { productId: string, quantity: number, type: "add" | "remove" | "set", movementType: string, reason: string }) => 
      adjustStock(productId, quantity, type, movementType, reason),
    onSuccess: (updatedProduct) => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
      queryClient.invalidateQueries({ queryKey: ["products", updatedProduct.id] });
      queryClient.invalidateQueries({ queryKey: ["low-stock"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard-stats"] });
      toast.success(`Stock adjusted for ${updatedProduct.name}`);
    },
    onError: (err) => {
      toast.error("Failed to adjust stock: " + err.message);
    }
  });
};

export const useLowStock = () => {
  return useQuery({
    queryKey: ["low-stock"],
    queryFn: getLowStockProducts,
  });
};
