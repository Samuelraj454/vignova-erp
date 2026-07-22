import { useState } from "react";
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
import { motion } from "framer-motion";

const signupSchema = z.object({
  fullName: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  confirmPassword: z.string().min(6, "Please confirm your password")
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});

type SignupFormValues = z.infer<typeof signupSchema>;

export default function Signup() {
  const navigate = useNavigate();
  const { loginAsAdmin } = useAuth(); // Assuming sign up logs you in as admin

  const signupForm = useForm<SignupFormValues>({
    resolver: zodResolver(signupSchema),
    defaultValues: { fullName: "", email: "", password: "", confirmPassword: "" },
  });

  const onSubmit = async (data: SignupFormValues) => {
    try {
      const res = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data)
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.detail || "Signup failed");
      }
      
      // Auto login after signup
      await loginAsAdmin(data.email, data.password);
      toast.success("Account created successfully!");
      navigate("/admin");
    } catch (e: any) {
      toast.error(e.message || "Failed to create account");
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
        <p className="text-sm text-gray-500 mb-6">Create your workspace account</p>

        {/* Card */}
        <Card className="w-full bg-white shadow-xl shadow-blue-900/5 border-gray-100 rounded-2xl overflow-hidden">
          <CardContent className="p-6">
            <motion.form
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              onSubmit={signupForm.handleSubmit(onSubmit)} 
              className="space-y-5"
            >
              <div className="space-y-1.5 text-left w-full">
                <Label htmlFor="fullName" className="text-xs font-medium text-gray-700">Full Name</Label>
                <Input 
                  id="fullName" 
                  type="text" 
                  placeholder="John Doe" 
                  {...signupForm.register("fullName")} 
                  className="bg-[#edf2fa] border-transparent focus-visible:ring-blue-500 h-11 text-sm rounded-lg text-gray-900 placeholder:text-gray-400" 
                />
                {signupForm.formState.errors.fullName && (
                  <p className="text-xs text-red-500">{signupForm.formState.errors.fullName.message}</p>
                )}
              </div>
              
              <div className="space-y-1.5 text-left w-full">
                <Label htmlFor="email" className="text-xs font-medium text-gray-700">Email</Label>
                <Input 
                  id="email" 
                  type="email" 
                  placeholder="admin@example.com" 
                  {...signupForm.register("email")} 
                  className="bg-[#edf2fa] border-transparent focus-visible:ring-blue-500 h-11 text-sm rounded-lg text-gray-900 placeholder:text-gray-400" 
                />
                {signupForm.formState.errors.email && (
                  <p className="text-xs text-red-500">{signupForm.formState.errors.email.message}</p>
                )}
              </div>

              <div className="space-y-1.5 text-left w-full">
                <Label htmlFor="password" className="text-xs font-medium text-gray-700">Password</Label>
                <Input 
                  id="password" 
                  type="password" 
                  placeholder="••••••••" 
                  {...signupForm.register("password")} 
                  className="bg-[#edf2fa] border-transparent focus-visible:ring-blue-500 h-11 text-sm rounded-lg text-gray-900 placeholder:text-gray-400" 
                />
                {signupForm.formState.errors.password && (
                  <p className="text-xs text-red-500">{signupForm.formState.errors.password.message}</p>
                )}
              </div>

              <div className="space-y-1.5 text-left w-full">
                <Label htmlFor="confirmPassword" className="text-xs font-medium text-gray-700">Confirm Password</Label>
                <Input 
                  id="confirmPassword" 
                  type="password" 
                  placeholder="••••••••" 
                  {...signupForm.register("confirmPassword")} 
                  className="bg-[#edf2fa] border-transparent focus-visible:ring-blue-500 h-11 text-sm rounded-lg text-gray-900 placeholder:text-gray-400" 
                />
                {signupForm.formState.errors.confirmPassword && (
                  <p className="text-xs text-red-500">{signupForm.formState.errors.confirmPassword.message}</p>
                )}
              </div>

              <Button type="submit" className="w-full h-11 rounded-lg bg-[#5e7bf6] hover:bg-blue-600 text-white font-medium shadow-none transition-colors mt-2" disabled={signupForm.formState.isSubmitting}>
                Sign up
              </Button>
            </motion.form>
          </CardContent>
        </Card>

        {/* Footer text */}
        <div className="mt-8 text-center space-y-3">
          <p className="text-sm text-gray-500">
            Already have an account? <Link to="/login" className="text-[#5e7bf6] font-medium hover:underline">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
