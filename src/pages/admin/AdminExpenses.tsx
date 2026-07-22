import { formatCurrency } from "@/lib/utils";
import { useState } from "react";
import { motion } from "framer-motion";
import { Search, Plus, DollarSign, ArrowUpRight, Edit, Trash2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useExpenses, useDeleteExpense } from "@/hooks/useExpenses";
import { ExpenseDialog } from "@/components/ui-custom/ExpenseDialog";
import type { Expense } from "@/services/expenses";

export default function AdminExpenses() {
  const { data: expenses = [], isLoading } = useExpenses();
  const deleteMutation = useDeleteExpense();

  const [searchTerm, setSearchTerm] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedExpense, setSelectedExpense] = useState<Expense | null>(null);

  const filtered = expenses.filter(e => 
    e.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
    e.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleAdd = () => {
    setSelectedExpense(null);
    setDialogOpen(true);
  };

  const handleEdit = (expense: Expense) => {
    setSelectedExpense(expense);
    setDialogOpen(true);
  };

  const handleDelete = (id: string) => {
    if (confirm("Are you sure you want to delete this expense?")) {
      deleteMutation.mutate(id);
    }
  };

  const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0);
  const pendingPayments = expenses.filter(e => e.status === "Pending").reduce((sum, e) => sum + e.amount, 0);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Expenses</h1>
          <p className="text-muted-foreground">Track and manage business operational costs</p>
        </div>
        <Button className="rounded-xl" onClick={handleAdd}>
          <Plus className="mr-2 h-4 w-4" /> Add Expense
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-3 mb-6">
        <div className="glass-panel p-6 rounded-2xl flex items-center gap-4">
          <div className="h-12 w-12 rounded-full bg-rose-500/10 flex items-center justify-center text-rose-500">
            <ArrowUpRight className="h-6 w-6" />
          </div>
          <div>
            <p className="text-sm text-muted-foreground font-medium">Total Expenses</p>
            <h3 className="text-2xl font-bold text-foreground">{formatCurrency(totalExpenses)}</h3>
          </div>
        </div>
        <div className="glass-panel p-6 rounded-2xl flex items-center gap-4">
          <div className="h-12 w-12 rounded-full bg-amber-500/10 flex items-center justify-center text-amber-500">
            <DollarSign className="h-6 w-6" />
          </div>
          <div>
            <p className="text-sm text-muted-foreground font-medium">Pending Payments</p>
            <h3 className="text-2xl font-bold text-foreground">{formatCurrency(pendingPayments)}</h3>
          </div>
        </div>
      </div>

      <div className="glass-panel p-6 rounded-2xl">
        <div className="flex gap-4 mb-6">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input 
              placeholder="Search expenses..." 
              className="pl-9 bg-background/50 border-border/50"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        <div className="rounded-xl border border-border/50 overflow-hidden bg-background/50">
          <div className="overflow-x-auto w-full">
            <table className="w-full text-sm text-left min-w-[500px] md:min-w-full">
              <thead className="bg-muted/50 text-muted-foreground font-medium border-b border-border/50">
                <tr>
                  <th className="px-4 md:px-6 py-4">Date</th>
                  <th className="px-4 md:px-6 py-4">Category</th>
                  <th className="px-4 md:px-6 py-4 hidden sm:table-cell">Description</th>
                  <th className="px-4 md:px-6 py-4 text-right">Amount</th>
                  <th className="px-4 md:px-6 py-4 text-center">Status</th>
                  <th className="px-4 md:px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  <tr>
                    <td colSpan={6} className="text-center py-10 text-muted-foreground">
                      <div className="flex flex-col items-center gap-2">
                        <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent"></div>
                        <span>Loading expenses...</span>
                      </div>
                    </td>
                  </tr>
                ) : filtered.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="text-center py-10 text-muted-foreground">
                      No expenses found matching "{searchTerm}"
                    </td>
                  </tr>
                ) : (
                  filtered.map((expense) => (
                    <tr key={expense.id} className="border-b border-border/50 hover:bg-muted/20 transition-colors">
                      <td className="px-4 md:px-6 py-4 text-muted-foreground whitespace-nowrap">{expense.date}</td>
                      <td className="px-4 md:px-6 py-4 font-medium whitespace-nowrap">{expense.category}</td>
                      <td className="px-4 md:px-6 py-4 hidden sm:table-cell">{expense.description}</td>
                      <td className="px-4 md:px-6 py-4 text-right font-bold text-rose-500 whitespace-nowrap">-{formatCurrency(expense.amount)}</td>
                      <td className="px-4 md:px-6 py-4 text-center">
                        <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-medium ${
                          expense.status === 'Paid' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-amber-500/10 text-amber-500'
                        }`}>
                          {expense.status}
                        </span>
                      </td>
                      <td className="px-4 md:px-6 py-4 text-right space-x-1 md:space-x-2 whitespace-nowrap">
                        <Button variant="ghost" size="icon" onClick={() => handleEdit(expense)}>
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive" onClick={() => handleDelete(expense.id)}>
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

      <ExpenseDialog 
        open={dialogOpen} 
        onOpenChange={setDialogOpen} 
        expense={selectedExpense} 
      />
    </motion.div>
  );
}

