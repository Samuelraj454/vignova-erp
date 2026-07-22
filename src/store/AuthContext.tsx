import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { toast } from "sonner";

export type Role = "admin" | "employee" | null;

interface User {
  id: string;
  name: string;
  role: Role;
  email?: string;
  employeeId?: string;
  permissions: string[];
}

interface AuthState {
  user: User | null;
  token: string | null;
  expiresAt: number | null;
  requiresPasswordChange: boolean;
}

interface AuthContextType {
  user: User | null;
  role: Role;
  isAuthenticated: boolean;
  isLoading: boolean;
  requiresPasswordChange: boolean;
  loginAsAdmin: (email: string, password?: string, rememberMe?: boolean) => Promise<any>;
  loginAsEmployee: (employeeId: string, password?: string, rememberMe?: boolean) => Promise<any>;
  logout: () => void;
  switchRole: (newRole: Role) => void;
  hasPermission: (permission: string) => boolean;
  completePasswordChange: (token: string, user: User) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Token duration (e.g., 30 minutes for session, 7 days for remember me)
const SESSION_DURATION = 30 * 60 * 1000; 
const REMEMBER_ME_DURATION = 7 * 24 * 60 * 60 * 1000;

export function AuthProvider({ children }: { children: ReactNode }) {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    token: null,
    expiresAt: null,
    requiresPasswordChange: false,
  });
  const [isLoading, setIsLoading] = useState(true);

  // Restore session
  useEffect(() => {
    const restoreSession = async () => {
      setIsLoading(true);
      try {
        const stored = localStorage.getItem("crm-auth");
        const jwt = localStorage.getItem("jwt_token");
        
        if (stored && jwt) {
          const parsed: AuthState = JSON.parse(stored);
          if (parsed.expiresAt && Date.now() < parsed.expiresAt) {
            if (parsed.expiresAt - Date.now() < 5 * 60 * 1000) {
              parsed.expiresAt = Date.now() + SESSION_DURATION;
              localStorage.setItem("crm-auth", JSON.stringify(parsed));
            }
            setAuthState(parsed);
          } else {
            localStorage.removeItem("crm-auth");
            localStorage.removeItem("jwt_token");
          }
        } else {
          localStorage.removeItem("crm-auth");
          localStorage.removeItem("jwt_token");
        }
      } catch (error) {
        console.error("Failed to restore session", error);
      } finally {
        setIsLoading(false);
      }
    };
    
    restoreSession();
  }, []);

  // Initialize background tasks ONLY after login
  useEffect(() => {
    if (authState.token && authState.user) {
      // Connect real websockets if applicable
    }
  }, [authState.token, authState.user]);


  const loginAsAdmin = async (email: string, password?: string, rememberMe: boolean = false) => {
    try {
      const formData = new URLSearchParams();
      formData.append("username", email);
      formData.append("password", password || "password123");
      
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded"
        },
        body: formData
      });
      
      let data;
      const contentType = res.headers.get("content-type");
      if (contentType && contentType.includes("application/json")) {
        data = await res.json();
      } else {
        const text = await res.text();
        throw new Error("A server error occurred (Invalid JSON response). Check backend deployment.");
      }
      
      if (!res.ok) {
        throw new Error(data.detail || "Invalid credentials");
      }
      
      if (data.requires_password_change) {
        // Return this to let the component handle the password change flow
        return data;
      }
      
      const user = data.user;
      const duration = rememberMe ? REMEMBER_ME_DURATION : SESSION_DURATION;
      const newState: AuthState = {
        user,
        token: data.access_token,
        expiresAt: Date.now() + duration,
        requiresPasswordChange: false
      };
      setAuthState(newState);
      // Strictly using localStorage for this implementation
      localStorage.setItem("crm-auth", JSON.stringify(newState));
      localStorage.setItem("jwt_token", data.access_token);
      
      toast.success("Successfully logged in");
      return data;
    } catch (e: any) {
      toast.error(e.message || "Failed to login");
      throw e;
    }
  };

  const completePasswordChange = (token: string, user: User) => {
    const duration = SESSION_DURATION;
    const newState: AuthState = {
      user,
      token,
      expiresAt: Date.now() + duration,
      requiresPasswordChange: false
    };
    setAuthState(newState);
    localStorage.setItem("crm-auth", JSON.stringify(newState));
    localStorage.setItem("jwt_token", token);
  };


  const loginAsEmployee = async (employeeId: string, rememberMe: boolean = false) => {
    // For this example, we treat employeeId as the password or something, but we'll use a hardcoded email and pass for employee login for now.
    return loginAsAdmin(`emp_${employeeId}@erp.com`, employeeId, rememberMe);
  };

  const logout = () => {
    setAuthState({ user: null, token: null, expiresAt: null });
    localStorage.removeItem("crm-auth");
    localStorage.removeItem("jwt_token");
    toast.success("Logged out successfully");
  };

  const switchRole = (newRole: Role) => {
    if (!authState.user) return;
    const updatedUser = { ...authState.user, role: newRole };
    // adjust permissions
    if (newRole === "admin") updatedUser.permissions = ["*"];
    if (newRole === "employee") updatedUser.permissions = ["pos", "customers", "inventory.view"];
    saveSession(updatedUser, true);
    toast.info(`Switched role to ${newRole}`);
  };

  const hasPermission = (permission: string) => {
    if (!authState.user) return false;
    if (authState.user.permissions.includes("*")) return true;
    return authState.user.permissions.includes(permission);
  };

  return (
    <AuthContext.Provider
      value={{
        user: authState.user,
        role: authState.user?.role || null,
        isAuthenticated: !!authState.token && !!authState.user,
        isLoading,
        requiresPasswordChange: authState.requiresPasswordChange,
        loginAsAdmin,
        loginAsEmployee,
        logout,
        switchRole,
        hasPermission,
        completePasswordChange
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
