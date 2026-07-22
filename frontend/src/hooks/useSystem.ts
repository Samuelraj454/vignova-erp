import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getActivityLogs, getNotifications, markNotificationRead, markAllNotificationsRead } from "../services/system";

export const useActivityLogs = () => {
  return useQuery({
    queryKey: ["activity-logs"],
    queryFn: getActivityLogs,
  });
};

export const useNotifications = () => {
  return useQuery({
    queryKey: ["notifications"],
    queryFn: getNotifications,
  });
};

export const useMarkNotificationRead = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: markNotificationRead,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
    }
  });
};

export const useMarkAllNotificationsRead = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: markAllNotificationsRead,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
    }
  });
};
