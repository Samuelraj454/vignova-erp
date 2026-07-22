import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "@/store/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Card, CardContent } from "@/components/ui/card";
import { motion, AnimatePresence } from "framer-motion";
import { Eye, EyeOff } from "lucide-react";

const adminSchema = z.object({
  email: z.string().min(1, "Username or Email is required"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

const changePasswordSchema = z.object({
  newPassword: z.string().min(6, "Password must be at least 6 characters"),
  confirmPassword: z.string().min(6, "Password must be at least 6 characters"),
}).refine(data => data.newPassword === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});

type AdminFormValues = z.infer<typeof adminSchema>;
type ChangePasswordFormValues = z.infer<typeof changePasswordSchema>;

export default function Login() {
  const [loginType, setLoginType] = useState<"admin" | "employee">("admin");
  const [step, setStep] = useState<"login" | "change_password">("login");
  const [tempAuthData, setTempAuthData] = useState<any>(null);
  const [showPassword, setShowPassword] = useState(false);
  
  const { isAuthenticated, user, loginAsAdmin, loginAsEmployee, completePasswordChange } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (isAuthenticated && user) {
      const r = user.role.toLowerCase();
      if (r === "admin") navigate("/admin", { replace: true });
      else if (r === "manager") navigate("/manager", { replace: true });
      else if (["employee", "cashier"].includes(r)) navigate("/employee", { replace: true });
    }
  }, [isAuthenticated, user, navigate]);

  const adminForm = useForm<AdminFormValues>({
    resolver: zodResolver(adminSchema),
    defaultValues: { email: "", password: "" },
  });

  const changePasswordForm = useForm<ChangePasswordFormValues>({
    resolver: zodResolver(changePasswordSchema),
    defaultValues: { newPassword: "", confirmPassword: "" },
  });

  const onAdminSubmit = async (data: AdminFormValues) => {
    try {
      const result = await loginAsAdmin(data.email, data.password);
      if (result && result.requires_password_change) {
        setTempAuthData({
          token: result.access_token,
          user: result.user,
          currentPassword: data.password
        });
        setStep("change_password");
        toast.info("First time login: Please change your temporary password.");
      }
    } catch (e) {
      // Handled in context
    }
  };

  const onChangePasswordSubmit = async (data: ChangePasswordFormValues) => {
    try {
      const res = await fetch("/api/auth/change-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${tempAuthData.token}`
        },
        body: JSON.stringify({
          current_password: tempAuthData.currentPassword,
          new_password: data.newPassword
        })
      });
      
      if (!res.ok) {
        const contentType = res.headers.get("content-type");
        if (contentType && contentType.includes("application/json")) {
          const errorData = await res.json();
          throw new Error(errorData.detail || "Failed to change password");
        } else {
          throw new Error("A server error occurred (Invalid JSON response). Check backend deployment.");
        }
      }
      
      toast.success("Password updated successfully. Logging you in...");
      completePasswordChange(tempAuthData.token, tempAuthData.user);
    } catch (e: any) {
      toast.error(e.message);
    }
  };

  return (
    <div 
      className="flex flex-col items-center justify-center min-h-screen relative overflow-hidden bg-cover bg-center bg-white"
      style={{ backgroundImage: "url('/logo.jpg')" }}
    >
      <div className="absolute inset-0 bg-white/85 backdrop-blur-sm" />

      <div className="relative z-10 w-full max-w-md p-4 flex flex-col items-center">
        {/* Logo Header */}
        <div className="flex items-center gap-2 mb-2">
          <div className="w-8 h-8 rounded bg-white shadow-sm flex items-center justify-center overflow-hidden border border-gray-100">
            <img src="/logo.jpg" alt="Vignova Logo" className="w-full h-full object-cover" />
          </div>
          <h1 className="text-2xl font-bold text-blue-600 tracking-tight">
            Vignova
          </h1>
        </div>
        <p className="text-sm text-gray-500 mb-6">
          {step === "login" ? "Sign in to manage your workspace" : "Mandatory Password Change"}
        </p>

        {/* Toggle Login Type */}
        {step === "login" && (
          <div className="flex p-1 bg-[#edf2fa] rounded-lg mb-6 w-full max-w-sm">
            <button
              type="button"
              className={`flex-1 py-1.5 text-sm font-medium rounded-md transition-all duration-200 ${
                loginType === "admin" ? "bg-white shadow-sm text-blue-600" : "text-gray-500 hover:text-gray-700"
              }`}
              onClick={() => setLoginType("admin")}
            >
              Admin
            </button>
            <button
              type="button"
              className={`flex-1 py-1.5 text-sm font-medium rounded-md transition-all duration-200 ${
                loginType === "employee" ? "bg-white shadow-sm text-blue-600" : "text-gray-500 hover:text-gray-700"
              }`}
              onClick={() => setLoginType("employee")}
            >
              Employee
            </button>
          </div>
        )}

        {/* Card */}
        <Card className="w-full bg-white shadow-xl shadow-blue-900/5 border-gray-100 rounded-2xl overflow-hidden">
          <CardContent className="p-6">
            <AnimatePresence mode="wait">
              {step === "login" ? (
                  <motion.form
                    key="login-creds"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    transition={{ duration: 0.2 }}
                    onSubmit={adminForm.handleSubmit(onAdminSubmit)} 
                    className="space-y-5"
                  >
                    <div className="space-y-1.5 text-left w-full">
                      <Label htmlFor="email" className="text-xs font-medium text-gray-700">
                        {loginType === "admin" ? "Username or Email" : "Employee ID or Email"}
                      </Label>
                      <Input 
                        id="email" 
                        type="text" 
                        placeholder={loginType === "admin" ? "admin@example.com" : "employee@example.com"} 
                        {...adminForm.register("email")} 
                        className="bg-[#edf2fa] border-transparent focus-visible:ring-blue-500 h-11 text-sm rounded-lg text-gray-900 placeholder:text-gray-400" 
                      />
                      {adminForm.formState.errors.email && (
                        <p className="text-xs text-red-500">{adminForm.formState.errors.email.message}</p>
                      )}
                    </div>
                    <div className="space-y-1.5 text-left w-full">
                      <Label htmlFor="password" className="text-xs font-medium text-gray-700">Password</Label>
                      <div className="relative">
                        <Input 
                          id="password" 
                          type={showPassword ? "text" : "password"} 
                          placeholder="••••••••" 
                          {...adminForm.register("password")} 
                          className="bg-[#edf2fa] border-transparent focus-visible:ring-blue-500 h-11 text-sm rounded-lg text-gray-900 placeholder:text-gray-400 pr-10" 
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                        >
                          {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                      </div>
                      {adminForm.formState.errors.password && (
                        <p className="text-xs text-red-500">{adminForm.formState.errors.password.message}</p>
                      )}
                    </div>
                    <Button type="submit" className="w-full h-11 rounded-lg bg-[#5e7bf6] hover:bg-blue-600 text-white font-medium shadow-none transition-colors mt-2" disabled={adminForm.formState.isSubmitting}>
                      Sign in
                    </Button>
                  </motion.form>
              ) : (
                <motion.form
                  key="change-password"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.2 }}
                  onSubmit={changePasswordForm.handleSubmit(onChangePasswordSubmit)} 
                  className="space-y-5"
                >
                  <div className="bg-yellow-50 text-yellow-800 p-3 rounded-lg text-xs font-medium">
                    This is your first time logging in with a temporary password. You must change it to continue.
                  </div>
                  <div className="space-y-1.5 text-left w-full">
                    <Label htmlFor="newPassword" className="text-xs font-medium text-gray-700">New Password</Label>
                    <Input 
                      id="newPassword" 
                      type="password" 
                      placeholder="••••••••" 
                      {...changePasswordForm.register("newPassword")} 
                      className="bg-[#edf2fa] border-transparent focus-visible:ring-blue-500 h-11 text-sm rounded-lg text-gray-900 placeholder:text-gray-400" 
                    />
                    {changePasswordForm.formState.errors.newPassword && (
                      <p className="text-xs text-red-500">{changePasswordForm.formState.errors.newPassword.message}</p>
                    )}
                  </div>
                  <div className="space-y-1.5 text-left w-full">
                    <Label htmlFor="confirmPassword" className="text-xs font-medium text-gray-700">Confirm New Password</Label>
                    <Input 
                      id="confirmPassword" 
                      type="password" 
                      placeholder="••••••••" 
                      {...changePasswordForm.register("confirmPassword")} 
                      className="bg-[#edf2fa] border-transparent focus-visible:ring-blue-500 h-11 text-sm rounded-lg text-gray-900 placeholder:text-gray-400" 
                    />
                    {changePasswordForm.formState.errors.confirmPassword && (
                      <p className="text-xs text-red-500">{changePasswordForm.formState.errors.confirmPassword.message}</p>
                    )}
                  </div>
                  <div className="flex gap-2 mt-2">
                    <Button type="button" variant="outline" className="w-full h-11 rounded-lg" onClick={() => setStep("login")}>
                      Cancel
                    </Button>
                    <Button type="submit" className="w-full h-11 rounded-lg bg-[#5e7bf6] hover:bg-blue-600 text-white font-medium shadow-none transition-colors" disabled={changePasswordForm.formState.isSubmitting}>
                      Update & Login
                    </Button>
                  </div>
                </motion.form>
              )}
            </AnimatePresence>
          </CardContent>
        </Card>

        
      </div>
    </div>
  );
}
