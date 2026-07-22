import { api } from "./api";
import type { User } from "../database/schema";
import axios from "axios";
import { toast } from "sonner";

export const getEmployees = async (): Promise<User[]> => {
  const res = await api.get("/users");
  return res.data;
};

export const createEmployee = async (employeeData: Partial<User>) => {
  try {
    console.log("Creating employee", employeeData);
    const res = await api.post("/users/employee", employeeData);
    console.log("Employee created", res.data);
    return res.data;
  } catch (error: any) {
    console.error("Employee creation failed:", error);

    if (axios.isAxiosError(error)) {
        console.error("Status:", error.response?.status);
        console.error("Response:", error.response?.data);
        console.error("Request:", error.config);
        toast.error(
            error.response?.data?.detail ??
            JSON.stringify(error.response?.data) ??
            error.message
        );
    } else {
        console.error(error);
        toast.error(String(error));
    }

    throw error;
  }
};

export const updateEmployeeStatus = async (userId: string, status: "Active" | "Disabled") => {
  const res = await api.put(`/users/${userId}/status`, { status });
  return res.data;
};

export const updateEmployeeRole = async (userId: string, role: string) => {
  const res = await api.put(`/users/${userId}/role`, { role });
  return res.data;
};

export const resetEmployeePassword = async (userId: string) => {
  const res = await api.post(`/users/${userId}/reset-password`);
  return res.data;
};

export const deleteEmployee = async (userId: string) => {
  const res = await api.delete(`/users/${userId}`);
  return res.data;
};
