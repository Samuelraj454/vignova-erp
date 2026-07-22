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
      <DialogContent className="w-[95vw] sm:max-w-[425px] rounded-2xl max-h-[90vh] overflow-y-auto">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>{isEditing ? "Edit Supplier" : "Add Supplier"}</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="flex flex-col sm:grid sm:grid-cols-4 sm:items-center gap-2 sm:gap-4">
              <Label htmlFor="name" className="text-left sm:text-right font-medium">Name</Label>
              <Input 
                id="name" 
                value={formData.name || ""} 
                onChange={e => setFormData({...formData, name: e.target.value})} 
                className="col-span-3" 
                required 
              />
            </div>
            <div className="flex flex-col sm:grid sm:grid-cols-4 sm:items-center gap-2 sm:gap-4">
              <Label htmlFor="contactPerson" className="text-left sm:text-right font-medium">Contact Person</Label>
              <Input 
                id="contactPerson" 
                value={formData.contactPerson || ""} 
                onChange={e => setFormData({...formData, contactPerson: e.target.value})} 
                className="col-span-3" 
                required 
              />
            </div>
            <div className="flex flex-col sm:grid sm:grid-cols-4 sm:items-center gap-2 sm:gap-4">
              <Label htmlFor="email" className="text-left sm:text-right font-medium">Email</Label>
              <Input 
                id="email" 
                type="email"
                value={formData.email || ""} 
                onChange={e => setFormData({...formData, email: e.target.value})} 
                className="col-span-3" 
              />
            </div>
            <div className="flex flex-col sm:grid sm:grid-cols-4 sm:items-center gap-2 sm:gap-4">
              <Label htmlFor="phone" className="text-left sm:text-right font-medium">Phone</Label>
              <Input 
                id="phone" 
                value={formData.phone || ""} 
                onChange={e => setFormData({...formData, phone: e.target.value})} 
                className="col-span-3" 
              />
            </div>
            <div className="flex flex-col sm:grid sm:grid-cols-4 sm:items-center gap-2 sm:gap-4">
              <Label htmlFor="leadTime" className="text-left sm:text-right font-medium">Lead Time</Label>
              <Input 
                id="leadTime" 
                placeholder="e.g. 5 Days"
                value={formData.leadTime || ""} 
                onChange={e => setFormData({...formData, leadTime: e.target.value})} 
                className="col-span-3" 
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isPending}>
              Cancel
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending ? "Saving..." : "Save Supplier"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
