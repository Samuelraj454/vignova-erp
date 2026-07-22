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
      <DialogContent className="w-full h-[100dvh] sm:h-auto sm:max-w-2xl sm:rounded-2xl overflow-y-auto">
        <form onSubmit={handleSubmit} className="flex flex-col h-full">
          <DialogHeader className="flex-shrink-0">
            <DialogTitle>{isEditing ? "Edit Expense" : "Add Expense"}</DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-4 flex-1">
            <div className="space-y-2">
              <Label htmlFor="date" className="font-medium">Date</Label>
              <Input 
                id="date" 
                type="date"
                value={formData.date || ""} 
                onChange={e => setFormData({...formData, date: e.target.value})} 
                required 
              />
            </div>
            <div className="space-y-2">
              <Label className="font-medium">Category</Label>
              <Select value={formData.category} onValueChange={(v) => setFormData({...formData, category: v})}>
                <SelectTrigger>
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
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="description" className="font-medium">Description</Label>
              <Input 
                id="description" 
                value={formData.description || ""} 
                onChange={e => setFormData({...formData, description: e.target.value})} 
                required 
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="amount" className="font-medium">Amount (₹)</Label>
              <Input 
                id="amount" 
                type="number"
                step="0.01"
                min="0"
                value={formData.amount || 0} 
                onChange={e => setFormData({...formData, amount: parseFloat(e.target.value) || 0})} 
                required 
              />
            </div>
            <div className="space-y-2">
              <Label className="font-medium">Status</Label>
              <Select value={formData.status} onValueChange={(v: "Paid" | "Pending") => setFormData({...formData, status: v})}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Paid">Paid</SelectItem>
                  <SelectItem value="Pending">Pending</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter className="mt-auto sm:mt-0 pt-4 pb-8 sm:pb-0 flex-shrink-0">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isPending} className="w-full sm:w-auto">
              Cancel
            </Button>
            <Button type="submit" disabled={isPending} className="w-full sm:w-auto">
              {isPending ? "Saving..." : "Save Expense"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
