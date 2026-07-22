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

const managerLinks: SidebarLink[] = [
  { title: "Dashboard", href: "/manager", icon: <LayoutDashboard size={20} /> },
  { title: "POS", href: "/manager/pos", icon: <Store size={20} /> },
  { title: "Products", href: "/manager/products", icon: <Package size={20} /> },
  { title: "Inventory", href: "/manager/inventory", icon: <Boxes size={20} /> },
  { title: "Categories", href: "/manager/categories", icon: <Tags size={20} /> },
  { title: "Suppliers", href: "/manager/suppliers", icon: <Truck size={20} /> },
  { title: "Customers", href: "/manager/customers", icon: <Users size={20} /> },
  { title: "Expenses", href: "/manager/expenses", icon: <CreditCard size={20} /> },
  { title: "Reports", href: "/manager/reports", icon: <PieChart size={20} /> },
];

export default function ManagerLayout() {
  console.log("Rendering AdminLayout.tsx");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex h-screen w-full bg-background overflow-x-hidden relative">
      <Sidebar title="Vignova CRM" links={managerLinks} isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />
      <main className="flex-1 flex flex-col relative overflow-hidden min-w-0">
        <TopNavbar onMenuClick={() => setSidebarOpen(true)} />
        <div className="flex-1 p-4 md:p-6 lg:p-8 overflow-auto bg-muted/20">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
