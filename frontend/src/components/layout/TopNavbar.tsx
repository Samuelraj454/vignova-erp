import { useState, useRef, useEffect } from "react";
import { Bell, Search, Menu, Sun, Moon, FileText, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { formatCurrency, cn } from "@/lib/utils";
import { useAuth } from "@/stores/AuthContext";
import { useTheme } from "@/stores/ThemeContext";
import { useNavigate } from "react-router-dom";
import { api } from "@/services/api";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

interface TopNavbarProps {
  onMenuClick?: () => void;
}

export default function TopNavbar({ onMenuClick }: TopNavbarProps = {}) {
  const { user, logout } = useAuth();
  const { theme, setTheme } = useTheme();
  const navigate = useNavigate();
  
  const [searchQuery, setSearchQuery] = useState("");
  const [showResults, setShowResults] = useState(false);
  const [searchFocused, setSearchFocused] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  
  const [searchResults, setSearchResults] = useState({ sales: [], customers: [] });

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowResults(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    const fetchSearch = async () => {
      if (searchQuery.length > 1) {
        try {
          const response = await api.get('/search', { params: { q: searchQuery } });
          setSearchResults(response.data);
        } catch (error) {
          // Ignore error
          setSearchResults({ sales: [], customers: [] });
        }
      }
    };
    const timeoutId = setTimeout(fetchSearch, 300);
    return () => clearTimeout(timeoutId);
  }, [searchQuery]);

  return (
    <header className="h-16 border-b border-border/50 bg-background/60 backdrop-blur-md flex items-center justify-between px-4 md:px-6 sticky top-0 z-30">
      <div className="flex items-center gap-2 md:gap-4 flex-1">
        <Button variant="ghost" size="icon" className="md:hidden shrink-0 min-h-[44px] min-w-[44px]" onClick={onMenuClick}>
          <Menu className="h-5 w-5" />
        </Button>
        {!searchFocused && (
          <Button variant="ghost" size="icon" className="sm:hidden shrink-0 min-h-[44px] min-w-[44px] ml-auto" onClick={() => setSearchFocused(true)}>
            <Search className="h-5 w-5" />
          </Button>
        )}
        <div className={cn("relative transition-all duration-300", searchFocused ? "flex-1 block" : "hidden sm:block w-full max-w-sm md:w-64")} ref={searchRef}>
          <Search className="absolute left-2.5 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search invoice or customer..."
            className="w-full pl-9 h-11 bg-muted/50 border-none focus-visible:ring-1 rounded-full"
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setShowResults(true);
            }}
            onFocus={() => { setShowResults(true); setSearchFocused(true); }}
            onBlur={(e) => {
              if (!e.target.value) setSearchFocused(false);
            }}
          />
          {showResults && searchQuery.length > 1 && (
            <div className="absolute top-full left-0 right-0 mt-2 bg-background border border-border/50 rounded-xl shadow-lg overflow-hidden z-50">
              <div className="p-2 space-y-1">
                {searchResults.sales.length > 0 && (
                  <>
                    <div className="text-xs font-semibold text-muted-foreground px-2 py-1">Transactions</div>
                    {searchResults.sales.map(sale => (
                      <div key={sale.id} className="flex items-center gap-2 px-2 py-2 hover:bg-muted/50 rounded-lg cursor-pointer transition-colors" onClick={() => { setShowResults(false); navigate("/admin/reports"); }}>
                        <FileText className="h-4 w-4 text-primary" />
                        <div className="flex-1">
                          <p className="text-sm font-medium leading-none">{sale.billNumber}</p>
                          <p className="text-xs text-muted-foreground">{sale.customerName} - {formatCurrency(sale.totalAmount)}</p>
                        </div>
                        {sale.pendingAmount > 0 && (
                          <div className="text-[10px] bg-destructive/10 text-destructive px-2 py-0.5 rounded-full font-semibold">
                            Pending: {formatCurrency(sale.pendingAmount)}
                          </div>
                        )}
                      </div>
                    ))}
                  </>
                )}
                {searchResults.customers.length > 0 && (
                  <>
                    <div className="text-xs font-semibold text-muted-foreground px-2 py-1 mt-2">Customers</div>
                    {searchResults.customers.map(cust => (
                      <div key={cust.id} className="flex items-center gap-2 px-2 py-2 hover:bg-muted/50 rounded-lg cursor-pointer transition-colors" onClick={() => { setShowResults(false); navigate("/admin/customers"); }}>
                        <User className="h-4 w-4 text-primary" />
                        <div>
                          <p className="text-sm font-medium leading-none">{cust.name}</p>
                          <p className="text-xs text-muted-foreground">{cust.email || cust.phone}</p>
                        </div>
                      </div>
                    ))}
                  </>
                )}
                {searchResults.sales.length === 0 && searchResults.customers.length === 0 && (
                  <div className="px-2 py-4 text-sm text-center text-muted-foreground">No results found</div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
      <div className="flex items-center gap-4">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="rounded-full relative min-h-[44px] min-w-[44px]">
              {theme === "dark" ? (
                <Moon className="h-5 w-5 transition-all" />
              ) : theme === "light" ? (
                <Sun className="h-5 w-5 transition-all" />
              ) : (
                <Sun className="h-5 w-5 transition-all" /> // fallback for system icon, could use Monitor
              )}
              <span className="sr-only">Toggle theme</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => setTheme("light")}>
              Light
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setTheme("dark")}>
              Dark
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setTheme("system")}>
              System
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
        
        <Button variant="ghost" size="icon" className="rounded-full relative min-h-[44px] min-w-[44px]" onClick={() => {
          if (user?.role?.toLowerCase() === "admin") {
            navigate("/admin/notifications");
          } else {
            import("sonner").then(m => m.toast.info("No new notifications at this time."));
          }
        }}>
          <Bell className="h-5 w-5" />
          {user?.role?.toLowerCase() === "admin" && (
            <span className="absolute top-2 right-2 h-2 w-2 rounded-full bg-destructive"></span>
          )}
        </Button>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="relative h-11 w-11 rounded-full min-h-[44px] min-w-[44px]">
              <Avatar className="h-11 w-11 border border-primary/20">
                <AvatarFallback className="bg-primary/10 text-primary">
                  {user?.name?.substring(0, 2).toUpperCase() || "US"}
                </AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56" align="end" forceMount>
            <DropdownMenuLabel className="font-normal">
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-medium leading-none">{user?.name}</p>
                <p className="text-xs leading-none text-muted-foreground">
                  {user?.email || user?.employeeId}
                </p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={logout} className="text-destructive focus:text-destructive">
              Log out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
