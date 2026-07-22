import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getRecentSales, getAllSales, getDashboardStats, getSalesTrend, completeSale, receivePayment } from "../services/sales";
import type { Sale } from "../services/sales";
import { toast } from "sonner";

export const useRecentSales = () => {
  return useQuery({
    queryKey: ["recent-sales"],
    queryFn: getRecentSales,
  });
};

export const useAllSales = () => {
  return useQuery({
    queryKey: ["sales"],
    queryFn: getAllSales,
  });
};

export const useDashboardStats = () => {
  return useQuery({
    queryKey: ["dashboard-stats"],
    queryFn: getDashboardStats,
  });
};

export const useSalesTrend = () => {
  return useQuery({
    queryKey: ["sales-trend"],
    queryFn: getSalesTrend,
  });
};

export const useCompleteSale = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: completeSale,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["recent-sales"] });
      queryClient.invalidateQueries({ queryKey: ["sales"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard-stats"] });
      queryClient.invalidateQueries({ queryKey: ["products"] });
      queryClient.invalidateQueries({ queryKey: ["customers"] });
      queryClient.invalidateQueries({ queryKey: ["activity-logs"] });
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
      toast.success(`Sale ${data.billNumber} completed!`);
    },
    onError: (err) => {
      toast.error("Failed to complete sale: " + err.message);
    }
  });
};

export const useReceivePayment = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: receivePayment,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["recent-sales"] });
      queryClient.invalidateQueries({ queryKey: ["sales"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard-stats"] });
      queryClient.invalidateQueries({ queryKey: ["customers"] });
      queryClient.invalidateQueries({ queryKey: ["activity-logs"] });
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
      toast.success(`Payment collected for ${data.billNumber}!`);
    },
    onError: (err) => {
      toast.error("Failed to collect payment: " + err.message);
    }
  });
};
