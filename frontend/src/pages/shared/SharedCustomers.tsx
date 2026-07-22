import { formatCurrency } from "@/lib/utils";
import { useState } from "react";
import { motion } from "framer-motion";
import { Search, Plus, Star, Edit, Trash2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useCustomers, useDeleteCustomer } from "@/hooks/useCustomers";
import { CustomerDialog } from "@/components/ui-custom/CustomerDialog";
import type { Customer } from "@/services/customers";

export default function SharedCustomers() {
  const { data: customers = [], isLoading } = useCustomers();
  const deleteMutation = useDeleteCustomer();
  
  const [searchTerm, setSearchTerm] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);

  const filtered = customers.filter(c => 
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.phone.includes(searchTerm)
  );

  const handleAdd = () => {
    setSelectedCustomer(null);
    setDialogOpen(true);
  };

  const handleEdit = (customer: Customer) => {
    setSelectedCustomer(customer);
    setDialogOpen(true);
  };

  const handleDelete = (id: string) => {
    if (confirm("Are you sure you want to delete this customer?")) {
      deleteMutation.mutate(id);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Customers</h1>
          <p className="text-muted-foreground">Manage your customer database and loyalty program</p>
        </div>
        <Button className="rounded-xl" onClick={handleAdd}>
          <Plus className="mr-2 h-4 w-4" /> New Customer
        </Button>
      </div>

      <div className="glass-panel p-6 rounded-2xl">
        <div className="flex gap-4 mb-6">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input 
              placeholder="Search by name, email or phone..." 
              className="pl-9 bg-background/50 border-border/50"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        <div className="rounded-xl border border-border/50 overflow-hidden bg-background/50">
          <table className="w-full text-sm text-left">
            <thead className="bg-muted/50 text-muted-foreground font-medium border-b border-border/50">
              <tr>
                <th className="px-6 py-4">Customer</th>
                <th className="px-6 py-4">Contact</th>
                <th className="px-6 py-4 text-center">Total Orders</th>
                <th className="px-6 py-4 text-right">Total Spent</th>
                <th className="px-6 py-4 text-right">Pending Amount</th>
                <th className="px-6 py-4 text-right">Credit Limit</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="text-center py-10 text-muted-foreground">
                    <div className="flex flex-col items-center gap-2">
                      <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent"></div>
                      <span>Loading customers...</span>
                    </div>
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-10 text-muted-foreground">
                    No customers found matching "{searchTerm}"
                  </td>
                </tr>
              ) : (
                filtered.map((customer) => (
                  <tr key={customer.id} className="border-b border-border/50 hover:bg-muted/20 transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-medium text-foreground">{customer.name}</div>
                      <div className="text-xs text-muted-foreground">{customer.id}</div>
                    </td>
                    <td className="px-6 py-4 text-muted-foreground">
                      <div>{customer.phone}</div>
                    </td>
                    <td className="px-6 py-4 text-center font-medium">{customer.totalOrders || 0}</td>
                    <td className="px-6 py-4 text-right font-medium">{formatCurrency(customer.totalSpent)}</td>
                    <td className="px-6 py-4 text-right font-medium text-destructive">{formatCurrency((customer.pendingAmount || 0))}</td>
                    <td className="px-6 py-4 text-right font-medium text-blue-500">{formatCurrency((customer.creditLimit || 0))}</td>
                    <td className="px-6 py-4 text-right space-x-2">
                      <Button variant="ghost" size="icon" onClick={() => handleEdit(customer)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive" onClick={() => handleDelete(customer.id)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <CustomerDialog 
        open={dialogOpen} 
        onOpenChange={setDialogOpen} 
        customer={selectedCustomer} 
      />
    </motion.div>
  );
}

