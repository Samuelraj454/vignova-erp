import { useState } from "react";
import { motion } from "framer-motion";
import { Search, Wallet, Plus, CreditCard, Banknote, Loader2, AlertCircle } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/services/api";

export default function EmployeePayments() {
  const [searchTerm, setSearchTerm] = useState("");

  const { data: payments, isLoading, error } = useQuery({
    queryKey: ['payments'],
    queryFn: async () => {
      const res = await api.get('/payments');
      return res.data;
    }
  });

  const filtered = (payments || []).filter((p: any) => 
    (p.invoice_id && p.invoice_id.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (p.id && p.id.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Receive Payments</h1>
          <p className="text-muted-foreground">Process incoming payments for pending invoices</p>
        </div>
        <Button className="rounded-xl bg-emerald-500 hover:bg-emerald-600"><Plus className="mr-2 h-4 w-4" /> New Payment</Button>
      </div>

      <div className="glass-panel p-6 rounded-2xl">
        <div className="flex gap-4 mb-6">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input 
              placeholder="Search by invoice or ID..." 
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
                <th className="px-6 py-4">Payment ID</th>
                <th className="px-6 py-4">Invoice Ref</th>
                <th className="px-6 py-4">Method</th>
                <th className="px-6 py-4 text-right">Amount Paid</th>
                <th className="px-6 py-4 text-center">Date</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan={5} className="text-center py-8 text-muted-foreground">
                    <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2" />
                    Loading...
                  </td>
                </tr>
              ) : error ? (
                <tr>
                  <td colSpan={5} className="text-center py-8 text-destructive">
                    <AlertCircle className="w-6 h-6 mx-auto mb-2" />
                    Error loading payments
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={5} className="text-center py-8 text-muted-foreground">
                    No payments found.
                  </td>
                </tr>
              ) : filtered.map((payment: any) => (
                <tr key={payment.id} className="border-b border-border/50 hover:bg-muted/20 transition-colors">
                  <td className="px-6 py-4 font-medium flex items-center gap-2"><Wallet className="h-4 w-4 text-emerald-500" /> {payment.id}</td>
                  <td className="px-6 py-4 text-muted-foreground">{payment.invoice_id}</td>
                  <td className="px-6 py-4">
                    <span className="inline-flex items-center gap-2 text-muted-foreground">
                      {payment.method === 'Cash' ? <Banknote className="h-4 w-4" /> : <CreditCard className="h-4 w-4" />}
                      {payment.method}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right font-bold text-emerald-500">+${payment.amount?.toFixed(2)}</td>
                  <td className="px-6 py-4 text-center text-muted-foreground">{new Date(payment.date).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </motion.div>
  );
}
