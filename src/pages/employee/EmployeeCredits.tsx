import { formatCurrency } from "@/lib/utils";
import { useState } from "react";
import { motion } from "framer-motion";
import { Search, FileText } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

const CREDITS: any[] = [];

export default function EmployeeCredits() {
  const [searchTerm, setSearchTerm] = useState("");

  const filtered = CREDITS.filter(c => 
    c.customerName.toLowerCase().includes(searchTerm.toLowerCase()) || c.id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Pending Credits</h1>
        <p className="text-muted-foreground">Manage unpaid customer invoices</p>
      </div>

      <div className="glass-panel p-6 rounded-2xl">
        <div className="flex gap-4 mb-6">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input 
              placeholder="Search by customer or ID..." 
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
                <th className="px-6 py-4">Invoice ID</th>
                <th className="px-6 py-4">Customer Name</th>
                <th className="px-6 py-4">Issue Date</th>
                <th className="px-6 py-4">Due Date</th>
                <th className="px-6 py-4 text-right">Amount Due</th>
                <th className="px-6 py-4 text-center">Status</th>
                <th className="px-6 py-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((credit) => (
                <tr key={credit.id} className="border-b border-border/50 hover:bg-muted/20 transition-colors">
                  <td className="px-6 py-4 font-medium flex items-center gap-2"><FileText className="h-4 w-4 text-primary" /> {credit.id}</td>
                  <td className="px-6 py-4">{credit.customerName}</td>
                  <td className="px-6 py-4 text-muted-foreground">{credit.date}</td>
                  <td className="px-6 py-4 text-muted-foreground">{credit.dueDate}</td>
                  <td className="px-6 py-4 text-right font-bold text-rose-500">{formatCurrency(credit.amountDue)}</td>
                  <td className="px-6 py-4 text-center">
                    <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-medium ${
                      credit.status === 'Overdue' ? 'bg-rose-500/10 text-rose-500' : 'bg-amber-500/10 text-amber-500'
                    }`}>
                      {credit.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <Button size="sm" variant="outline" className="rounded-lg h-8">Receive</Button>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={7} className="text-center py-8 text-muted-foreground">
                    No pending credits found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </motion.div>
  );
}
