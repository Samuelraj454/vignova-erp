import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useCreateExpense, useUpdateExpense } from "@/hooks/useExpenses";
import type { Expense } from "@/services/expenses";

interface ExpenseDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  expense?: Expense | null;
}

export function ExpenseDialog({ open, onOpenChange, expense }: ExpenseDialogProps) {
  const isEditing = !!expense;
  const createMutation = useCreateExpense();
  const updateMutation = useUpdateExpense();

  const [formData, setFormData] = useState<Partial<Expense>>({
    date: new Date().toISOString().split("T")[0],
    category: "Utilities",
    description: "",
    amount: 0,
    status: "Paid",
  });

  useEffect(() => {
    if (open) {
      if (expense) {
        setFormData(expense);
      } else {
        setFormData({
          date: new Date().toISOString().split("T")[0],
          category: "Utilities",
          description: "",
          amount: 0,
          status: "Paid",
        });
      }
    }
  }, [open, expense]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isEditing && expense) {
      updateMutation.mutate({ id: expense.id, data: formData }, {
        onSuccess: () => onOpenChange(false)
      });
    } else {
      createMutation.mutate(formData as Omit<Expense, "id">, {
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
            <DialogTitle>{isEditing ? "Edit Expense" : "Add Expense"}</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="flex flex-col sm:grid sm:grid-cols-4 sm:items-center gap-2 sm:gap-4">
              <Label htmlFor="date" className="text-left sm:text-right font-medium">Date</Label>
              <Input 
                id="date" 
                type="date"
                value={formData.date || ""} 
                onChange={e => setFormData({...formData, date: e.target.value})} 
                className="col-span-3" 
                required 
              />
            </div>
            <div className="flex flex-col sm:grid sm:grid-cols-4 sm:items-center gap-2 sm:gap-4">
              <Label className="text-left sm:text-right font-medium">Category</Label>
              <Select value={formData.category} onValueChange={(v) => setFormData({...formData, category: v})}>
                <SelectTrigger className="col-span-3">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Utilities">Utilities</SelectItem>
                  <SelectItem value="Inventory">Inventory</SelectItem>
                  <SelectItem value="Rent">Rent</SelectItem>
                  <SelectItem value="Marketing">Marketing</SelectItem>
                  <SelectItem value="Salary">Salary</SelectItem>
                  <SelectItem value="Other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex flex-col sm:grid sm:grid-cols-4 sm:items-center gap-2 sm:gap-4">
              <Label htmlFor="description" className="text-left sm:text-right font-medium">Description</Label>
              <Input 
                id="description" 
                value={formData.description || ""} 
                onChange={e => setFormData({...formData, description: e.target.value})} 
                className="col-span-3" 
                required 
              />
            </div>
            <div className="flex flex-col sm:grid sm:grid-cols-4 sm:items-center gap-2 sm:gap-4">
              <Label htmlFor="amount" className="text-left sm:text-right font-medium">Amount (₹)</Label>
              <Input 
                id="amount" 
                type="number"
                step="0.01"
                min="0"
                value={formData.amount || 0} 
                onChange={e => setFormData({...formData, amount: parseFloat(e.target.value) || 0})} 
                className="col-span-3" 
                required 
              />
            </div>
            <div className="flex flex-col sm:grid sm:grid-cols-4 sm:items-center gap-2 sm:gap-4">
              <Label className="text-left sm:text-right font-medium">Status</Label>
              <Select value={formData.status} onValueChange={(v: "Paid" | "Pending") => setFormData({...formData, status: v})}>
                <SelectTrigger className="col-span-3">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Paid">Paid</SelectItem>
                  <SelectItem value="Pending">Pending</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isPending}>
              Cancel
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending ? "Saving..." : "Save Expense"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
