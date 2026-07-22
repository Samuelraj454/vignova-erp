import { NavLink } from "react-router-dom";
import { cn } from "@/lib/utils";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";

export interface SidebarLink {
  title: string;
  href: string;
  icon: React.ReactNode;
}

interface SidebarProps {
  title: string;
  links: SidebarLink[];
  isOpen?: boolean;
  setIsOpen?: (open: boolean) => void;
}

export default function Sidebar({ title, links, isOpen = false, setIsOpen }: SidebarProps) {
  return (
    <>
      {/* Mobile Backdrop Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-background/80 backdrop-blur-sm z-40 md:hidden" 
          onClick={() => setIsOpen?.(false)}
        />
      )}
      
      <aside className={cn(
        "fixed inset-y-0 left-0 z-50 w-64 md:w-64 lg:w-72 border-r bg-background/95 backdrop-blur-xl glass-panel no-scrollbar overflow-y-auto transform transition-transform duration-300 ease-in-out md:relative md:translate-x-0",
        isOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <div className="p-5 border-b border-border/50 flex items-center justify-between gap-3 sticky top-0 bg-background/95 backdrop-blur z-10">
          <div className="flex items-center gap-3 overflow-hidden">
            <div className="w-10 h-10 rounded-lg overflow-hidden shadow-sm shrink-0 border border-border">
              <img src="/logo.jpg" alt="Logo" className="w-full h-full object-cover" />
            </div>
            <h2 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-accent-foreground truncate">
              {title}
            </h2>
          </div>
          {setIsOpen && (
            <Button variant="ghost" size="icon" className="md:hidden shrink-0 h-8 w-8" onClick={() => setIsOpen(false)}>
              <X className="h-5 w-5" />
            </Button>
          )}
        </div>
        <nav className="p-4 space-y-1">
          {links.map((link) => (
            <NavLink
              key={link.href}
              to={link.href}
              end={link.href === "/admin" || link.href === "/employee"}
              onClick={() => setIsOpen?.(false)}
              className={({ isActive }) =>
                cn(
                  "flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200",
                  isActive
                    ? "bg-primary text-primary-foreground shadow-md shadow-primary/20"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                )
              }
            >
              {link.icon}
              {link.title}
            </NavLink>
          ))}
        </nav>
      </aside>
    </>
  );
}
