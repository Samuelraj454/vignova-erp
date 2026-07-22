import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAdjustStock } from "@/hooks/useInventory";
import type { Product } from "@/services/products";

interface UpdateStockDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  product?: Product | null;
}

export function UpdateStockDialog({ open, onOpenChange, product }: UpdateStockDialogProps) {
  const adjustStockMutation = useAdjustStock();
  
  const [type, setType] = useState<"add" | "remove" | "set">("add");
  const [movementType, setMovementType] = useState<string>("Stock Adjustment");
  const [quantity, setQuantity] = useState(0);
  const [reason, setReason] = useState("");

  useEffect(() => {
    if (open) {
      setType("add");
      setMovementType("Stock Adjustment");
      setQuantity(0);
      setReason("");
    }
  }, [open]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!product) return;
    
    adjustStockMutation.mutate({
      productId: product.id,
      quantity,
      type,
      movementType,
      reason: reason || "Manual adjustment"
    }, {
      onSuccess: () => onOpenChange(false)
    });
  };

  const isPending = adjustStockMutation.isPending;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[95vw] sm:max-w-[425px] rounded-2xl max-h-[90vh] overflow-y-auto">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Update Stock for {product?.name}</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="flex flex-col sm:grid sm:grid-cols-4 sm:items-center gap-2 sm:gap-4">
              <Label className="text-left sm:text-right font-medium">Action</Label>
              <Select value={type} onValueChange={(v: "add" | "remove" | "set") => setType(v)}>
                <SelectTrigger className="col-span-3">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="add">Add Stock (+)</SelectItem>
                  <SelectItem value="remove">Remove Stock (-)</SelectItem>
                  <SelectItem value="set">Set Exact Amount (=)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex flex-col sm:grid sm:grid-cols-4 sm:items-center gap-2 sm:gap-4">
              <Label className="text-left sm:text-right font-medium">Type</Label>
              <Select value={movementType} onValueChange={setMovementType}>
                <SelectTrigger className="col-span-3">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Purchase From Supplier">Purchase From Supplier</SelectItem>
                  <SelectItem value="Customer Return">Customer Return</SelectItem>
                  <SelectItem value="Supplier Return">Supplier Return</SelectItem>
                  <SelectItem value="Stock Adjustment">Stock Adjustment</SelectItem>
                  <SelectItem value="Damaged Stock">Damaged Stock</SelectItem>
                  <SelectItem value="Expired Stock">Expired Stock</SelectItem>
                  <SelectItem value="Manual Correction">Manual Correction</SelectItem>
                  <SelectItem value="Initial Stock">Initial Stock</SelectItem>
                  <SelectItem value="Transfer">Transfer</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex flex-col sm:grid sm:grid-cols-4 sm:items-center gap-2 sm:gap-4">
              <Label htmlFor="quantity" className="text-left sm:text-right font-medium">Quantity</Label>
              <Input 
                id="quantity" 
                type="number"
                min="0"
                value={quantity} 
                onChange={e => setQuantity(parseInt(e.target.value) || 0)} 
                className="col-span-3" 
                required 
              />
            </div>
            <div className="flex flex-col sm:grid sm:grid-cols-4 sm:items-center gap-2 sm:gap-4">
              <Label htmlFor="reason" className="text-left sm:text-right font-medium">Reason</Label>
              <Input 
                id="reason" 
                placeholder="e.g. New shipment, Damaged goods"
                value={reason} 
                onChange={e => setReason(e.target.value)} 
                className="col-span-3" 
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isPending}>
              Cancel
            </Button>
            <Button type="submit" disabled={isPending || quantity <= 0}>
              {isPending ? "Updating..." : "Update Stock"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
