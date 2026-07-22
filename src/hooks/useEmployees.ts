import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { 
  getEmployees, 
  createEmployee, 
  updateEmployeeStatus, 
  updateEmployeeRole,
  resetEmployeePassword,
  deleteEmployee
} from "../services/employees";
import { toast } from "sonner";

export const useEmployees = () => {
  return useQuery({
    queryKey: ["employees"],
    queryFn: getEmployees,
  });
};

export const useCreateEmployee = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createEmployee,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["employees"] });
      toast.success("Employee created successfully");
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.detail || "Failed to create employee");
    },
  });
};

export const useUpdateEmployeeStatus = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ userId, status }: { userId: string; status: "Active" | "Disabled" }) => updateEmployeeStatus(userId, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["employees"] });
      toast.success("Employee status updated");
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.detail || "Failed to update status");
    },
  });
};

export const useUpdateEmployeeRole = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ userId, role }: { userId: string; role: string }) => updateEmployeeRole(userId, role),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["employees"] });
      toast.success("Employee role updated");
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.detail || "Failed to update role");
    },
  });
};

export const useResetEmployeePassword = () => {
  return useMutation({
    mutationFn: resetEmployeePassword,
    onSuccess: () => {
      toast.success("Password reset successfully");
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.detail || "Failed to reset password");
    },
  });
};

export const useDeleteEmployee = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteEmployee,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["employees"] });
      toast.success("Employee soft deleted");
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.detail || "Failed to delete employee");
    },
  });
};
