import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useCreateSupplier, useUpdateSupplier } from "@/hooks/useSuppliers";
import type { Supplier } from "@/services/suppliers";

interface SupplierDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  supplier?: Supplier | null;
}

export function SupplierDialog({ open, onOpenChange, supplier }: SupplierDialogProps) {
  const isEditing = !!supplier;
  const createMutation = useCreateSupplier();
  const updateMutation = useUpdateSupplier();

  const [formData, setFormData] = useState<Partial<Supplier>>({
    name: "",
    contactPerson: "",
    email: "",
    phone: "",
    leadTime: "",
  });

  useEffect(() => {
    if (open) {
      if (supplier) {
        setFormData(supplier);
      } else {
        setFormData({
          name: "",
          contactPerson: "",
          email: "",
          phone: "",
          leadTime: "3 Days",
        });
      }
    }
  }, [open, supplier]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isEditing && supplier) {
      updateMutation.mutate({ id: supplier.id, data: formData }, {
        onSuccess: () => onOpenChange(false)
      });
    } else {
      createMutation.mutate(formData as Omit<Supplier, "id" | "activeOrders">, {
        onSuccess: () => onOpenChange(false)
      });
    }
  };

  const isPending = createMutation.isPending || updateMutation.isPending;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-full h-[100dvh] sm:h-auto sm:max-w-2xl sm:rounded-2xl overflow-y-auto">
        <form onSubmit={handleSubmit} className="flex flex-col h-full">
          <DialogHeader className="flex-shrink-0">
            <DialogTitle>{isEditing ? "Edit Supplier" : "Add Supplier"}</DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-4 flex-1">
            <div className="space-y-2">
              <Label htmlFor="name" className="font-medium">Name</Label>
              <Input 
                id="name" 
                value={formData.name || ""} 
                onChange={e => setFormData({...formData, name: e.target.value})} 
                required 
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="contactPerson" className="font-medium">Contact Person</Label>
              <Input 
                id="contactPerson" 
                value={formData.contactPerson || ""} 
                onChange={e => setFormData({...formData, contactPerson: e.target.value})} 
                required 
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email" className="font-medium">Email</Label>
              <Input 
                id="email" 
                type="email"
                value={formData.email || ""} 
                onChange={e => setFormData({...formData, email: e.target.value})} 
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone" className="font-medium">Phone</Label>
              <Input 
                id="phone" 
                value={formData.phone || ""} 
                onChange={e => setFormData({...formData, phone: e.target.value})} 
              />
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="leadTime" className="font-medium">Lead Time</Label>
              <Input 
                id="leadTime" 
                placeholder="e.g. 5 Days"
                value={formData.leadTime || ""} 
                onChange={e => setFormData({...formData, leadTime: e.target.value})} 
              />
            </div>
          </div>
          <DialogFooter className="mt-auto sm:mt-0 pt-4 pb-8 sm:pb-0 flex-shrink-0">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isPending} className="w-full sm:w-auto">
              Cancel
            </Button>
            <Button type="submit" disabled={isPending} className="w-full sm:w-auto">
              {isPending ? "Saving..." : "Save Supplier"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
