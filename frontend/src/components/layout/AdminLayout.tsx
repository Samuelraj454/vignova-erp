import { useState } from "react";
import { Outlet } from "react-router-dom";
import Sidebar, { type SidebarLink } from "./Sidebar";
import TopNavbar from "./TopNavbar";
import {
  LayoutDashboard,
  Store,
  Package,
  Boxes,
  Tags,
  Truck,
  Users,
  CreditCard,
  BarChart3,
  PieChart,
  Settings,
  Bell,
  Activity,
} from "lucide-react";

const adminLinks: SidebarLink[] = [
  { title: "Dashboard", href: "/admin", icon: <LayoutDashboard size={20} /> },
  { title: "POS", href: "/admin/pos", icon: <Store size={20} /> },
  { title: "Employees", href: "/admin/employees", icon: <Users size={20} /> },
  { title: "Products", href: "/admin/products", icon: <Package size={20} /> },
  { title: "Inventory", href: "/admin/inventory", icon: <Boxes size={20} /> },
  { title: "Categories", href: "/admin/categories", icon: <Tags size={20} /> },
  { title: "Suppliers", href: "/admin/suppliers", icon: <Truck size={20} /> },
  { title: "Customers", href: "/admin/customers", icon: <Users size={20} /> },
  { title: "Expenses", href: "/admin/expenses", icon: <CreditCard size={20} /> },
  { title: "Reports", href: "/admin/reports", icon: <BarChart3 size={20} /> },
  { title: "Analytics", href: "/admin/analytics", icon: <PieChart size={20} /> },
  { title: "Notifications", href: "/admin/notifications", icon: <Bell size={20} /> },
  { title: "Activity Logs", href: "/admin/activity-logs", icon: <Activity size={20} /> },
  { title: "Settings", href: "/admin/settings", icon: <Settings size={20} /> },
];

export default function AdminLayout() {
  console.log("Rendering AdminLayout.tsx");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex h-screen w-full bg-background overflow-x-hidden relative">
      <Sidebar title="Vignova CRM" links={adminLinks} isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />
      <main className="flex-1 flex flex-col relative overflow-hidden min-w-0">
        <TopNavbar onMenuClick={() => setSidebarOpen(true)} />
        <div className="flex-1 p-4 md:p-6 lg:p-8 overflow-auto bg-muted/20">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
