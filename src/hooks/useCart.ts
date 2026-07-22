import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import type { Cart, CartItem } from "../database/schema";
import { api } from "../services/api";

const getActiveCart = async (): Promise<Cart> => {
  const response = await api.get('/cart/active');
  return response.data;
};

export const useCart = () => {
  return useQuery({
    queryKey: ["activeCart"],
    queryFn: getActiveCart,
  });
};

export const useUpdateCart = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: { id: string; items: CartItem[]; subtotal: number; tax: number; discount: number; grandTotal: number }) => {
      const response = await api.put(`/cart/${data.id}`, {
        items: data.items,
        subtotal: data.subtotal,
        tax: data.tax,
        discount: data.discount,
        grandTotal: data.grandTotal
      });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["activeCart"] });
    },
  });
};

