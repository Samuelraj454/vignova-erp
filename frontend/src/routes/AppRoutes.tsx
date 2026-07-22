import { Routes, Route, Navigate } from "react-router-dom";
import { ProtectedRoute } from "./ProtectedRoute";

// Auth
import Login from "../pages/auth/Login";
import Signup from "../pages/auth/Signup";

// Admin Pages
import AdminDashboard from '../pages/admin/AdminDashboard';
import AdminEmployees from '../pages/admin/AdminEmployees';
import AdminProducts from "../pages/admin/AdminProducts";
import AdminPOS from "../pages/admin/AdminPOS";
import AdminCategories from "../pages/admin/AdminCategories";
import AdminInventory from "../pages/admin/AdminInventory";
import AdminSuppliers from "../pages/admin/AdminSuppliers";
import AdminExpenses from "../pages/admin/AdminExpenses";
import AdminReports from "../pages/admin/AdminReports";
import AdminAnalytics from "../pages/admin/AdminAnalytics";
import AdminNotifications from "../pages/admin/AdminNotifications";
import AdminActivityLogs from "../pages/admin/AdminActivityLogs";
import AdminSettings from "../pages/admin/AdminSettings";

// Employee Pages
import EmployeeDashboard from "../pages/employee/EmployeeDashboard";
import EmployeePOS from "../pages/employee/EmployeePOS";
import EmployeeCredits from "../pages/employee/EmployeeCredits";
import EmployeePayments from "../pages/employee/EmployeePayments";

// Shared Pages
import SharedCustomers from "../pages/shared/SharedCustomers";

// Layouts
import AdminLayout from "../components/layout/AdminLayout";
import ManagerLayout from "../components/layout/ManagerLayout";
import EmployeeLayout from "../components/layout/EmployeeLayout";

export default function AppRoutes() {
  console.log("Rendering AppRoutes.tsx");
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />

      {/* Admin Routes */}
      <Route element={<ProtectedRoute allowedRoles={["admin"]} />}>
        <Route element={<AdminLayout />}>
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/admin/pos" element={<AdminPOS />} />
          <Route path="/admin/employees" element={<AdminEmployees />} />
          <Route path="/admin/products" element={<AdminProducts />} />
          <Route path="/admin/inventory" element={<AdminInventory />} />
          <Route path="/admin/categories" element={<AdminCategories />} />
          <Route path="/admin/suppliers" element={<AdminSuppliers />} />
          <Route path="/admin/customers" element={<SharedCustomers />} />
          <Route path="/admin/expenses" element={<AdminExpenses />} />
          <Route path="/admin/reports" element={<AdminReports />} />
          <Route path="/admin/analytics" element={<AdminAnalytics />} />
          <Route path="/admin/notifications" element={<AdminNotifications />} />
          <Route path="/admin/activity-logs" element={<AdminActivityLogs />} />
          <Route path="/admin/settings" element={<AdminSettings />} />
        </Route>
      </Route>

            {/* Manager Routes */}
      <Route element={<ProtectedRoute allowedRoles={["manager"]} />}>
        <Route element={<ManagerLayout />}>
          <Route path="/manager" element={<AdminDashboard />} />
          <Route path="/manager/pos" element={<AdminPOS />} />
          <Route path="/manager/products" element={<AdminProducts />} />
          <Route path="/manager/inventory" element={<AdminInventory />} />
          <Route path="/manager/categories" element={<AdminCategories />} />
          <Route path="/manager/suppliers" element={<AdminSuppliers />} />
          <Route path="/manager/customers" element={<SharedCustomers />} />
          <Route path="/manager/expenses" element={<AdminExpenses />} />
          <Route path="/manager/reports" element={<AdminReports />} />
        </Route>
      </Route>

      {/* Employee Routes */}
      <Route element={<ProtectedRoute allowedRoles={["employee"]} />}>
        <Route element={<EmployeeLayout />}>
          <Route path="/employee" element={<EmployeeDashboard />} />
          <Route path="/employee/pos" element={<EmployeePOS />} />
          <Route path="/employee/credits" element={<EmployeeCredits />} />
          <Route path="/employee/payments" element={<EmployeePayments />} />
          <Route path="/employee/customers" element={<SharedCustomers />} />
        </Route>
      </Route>
      
      {/* Fallback */}
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}
