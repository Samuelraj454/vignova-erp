import { useState } from "react";
import { motion } from "framer-motion";
import { Search, Plus, Mail, Phone, Edit, Trash2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useSuppliers, useDeleteSupplier } from "@/hooks/useSuppliers";
import { SupplierDialog } from "@/components/ui-custom/SupplierDialog";
import type { Supplier } from "@/services/suppliers";

export default function AdminSuppliers() {
  const { data: suppliers = [], isLoading } = useSuppliers();
  const deleteMutation = useDeleteSupplier();
  
  const [searchTerm, setSearchTerm] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedSupplier, setSelectedSupplier] = useState<Supplier | null>(null);

  const filtered = suppliers.filter(s => 
    s.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleAdd = () => {
    setSelectedSupplier(null);
    setDialogOpen(true);
  };

  const handleEdit = (supplier: Supplier) => {
    setSelectedSupplier(supplier);
    setDialogOpen(true);
  };

  const handleDelete = (id: string) => {
    if (confirm("Are you sure you want to delete this supplier?")) {
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
          <h1 className="text-3xl font-bold tracking-tight">Suppliers</h1>
          <p className="text-muted-foreground">Manage your vendor directory</p>
        </div>
        <Button className="rounded-xl min-h-[44px] py-2 px-4" onClick={handleAdd}>
          <Plus className="mr-2 h-4 w-4" /> Add Supplier
        </Button>
      </div>

      <div className="glass-panel p-6 rounded-2xl">
        <div className="flex gap-4 mb-6">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input 
              placeholder="Search suppliers..." 
              className="pl-9 bg-background/50 border-border/50"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        <div className="rounded-xl border border-border/50 overflow-hidden bg-background/50">
          <div className="overflow-x-auto w-full">
            <table className="w-full text-sm text-left min-w-[600px] md:min-w-full">
              <thead className="bg-muted/50 text-muted-foreground font-medium border-b border-border/50">
                <tr>
                  <th className="px-4 md:px-6 py-4">Supplier Name</th>
                  <th className="px-4 md:px-6 py-4 hidden sm:table-cell">Contact Person</th>
                  <th className="px-4 md:px-6 py-4">Contact Info</th>
                  <th className="px-4 md:px-6 py-4 hidden md:table-cell">Lead Time</th>
                  <th className="px-4 md:px-6 py-4 text-center">Active Orders</th>
                  <th className="px-4 md:px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  <tr>
                    <td colSpan={6} className="text-center py-10 text-muted-foreground">
                      <div className="flex flex-col items-center gap-2">
                        <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent"></div>
                        <span>Loading suppliers...</span>
                      </div>
                    </td>
                  </tr>
                ) : filtered.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="text-center py-10 text-muted-foreground">
                      No suppliers found matching "{searchTerm}"
                    </td>
                  </tr>
                ) : (
                  filtered.map((supplier) => (
                    <tr key={supplier.id} className="border-b border-border/50 hover:bg-muted/20 transition-colors">
                      <td className="px-4 md:px-6 py-4 font-medium whitespace-nowrap">{supplier.name}</td>
                      <td className="px-4 md:px-6 py-4 hidden sm:table-cell">{supplier.contactPerson}</td>
                      <td className="px-4 md:px-6 py-4 space-y-1">
                        <div className="flex items-center gap-2 text-muted-foreground whitespace-nowrap">
                          <Mail className="h-3 w-3" /> {supplier.email}
                        </div>
                        <div className="flex items-center gap-2 text-muted-foreground whitespace-nowrap">
                          <Phone className="h-3 w-3" /> {supplier.phone}
                        </div>
                      </td>
                      <td className="px-4 md:px-6 py-4 text-muted-foreground hidden md:table-cell">{supplier.leadTime}</td>
                      <td className="px-4 md:px-6 py-4 text-center">
                        <span className="inline-flex items-center justify-center h-6 w-6 rounded-full bg-primary/10 text-primary font-medium text-xs">
                          {supplier.activeOrders}
                        </span>
                      </td>
                      <td className="px-4 md:px-6 py-4 text-right space-x-1 md:space-x-2 whitespace-nowrap">
                        <Button variant="ghost" size="icon" className="h-11 w-11" onClick={() => handleEdit(supplier)}>
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-11 w-11 text-destructive hover:text-destructive" onClick={() => handleDelete(supplier.id)}>
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
      </div>

      <SupplierDialog 
        open={dialogOpen} 
        onOpenChange={setDialogOpen} 
        supplier={selectedSupplier} 
      />
    </motion.div>
  );
}
