import { useState } from "react";
import { Outlet } from "react-router-dom";
import Sidebar, { type SidebarLink } from "./Sidebar";
import TopNavbar from "./TopNavbar";
import { Store, Receipt } from "lucide-react";

const employeeLinks: SidebarLink[] = [
  { title: "New Bill (POS)", href: "/employee/pos", icon: <Store size={20} /> },
  { title: "Today's Sales", href: "/employee", icon: <Receipt size={20} /> },
];

export default function EmployeeLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex h-screen w-full bg-background overflow-hidden relative">
      <Sidebar title="Vignova CRM (POS)" links={employeeLinks} isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />
      <main className="flex-1 flex flex-col relative overflow-hidden min-w-0">
        <TopNavbar onMenuClick={() => setSidebarOpen(true)} />
        <div className="flex-1 p-4 md:p-6 lg:p-8 overflow-auto bg-muted/20">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
