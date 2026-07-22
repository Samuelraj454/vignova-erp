import { api } from "./api";
import type { ActivityLog, Notification } from "../database/schema";

export type { ActivityLog, Notification };

export const getActivityLogs = async (): Promise<ActivityLog[]> => {
  const response = await api.get('/system/activity-logs');
  return response.data;
};

export const getNotifications = async (): Promise<Notification[]> => {
  const response = await api.get('/system/notifications');
  return response.data;
};

export const markNotificationRead = async (id: string): Promise<Notification> => {
  const response = await api.put(`/system/notifications/${id}/read`);
  return response.data;
};

export const markAllNotificationsRead = async (): Promise<boolean> => {
  await api.put('/system/notifications/read-all');
  return true;
};

