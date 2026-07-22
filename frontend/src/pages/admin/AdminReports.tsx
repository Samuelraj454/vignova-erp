import { formatCurrency } from "@/lib/utils";
import { useState } from "react";
import { motion } from "framer-motion";
import { Download, Calendar, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { useSalesTrend, useAllSales } from "@/hooks/useSales";

export default function AdminReports() {
  const { data: salesTrend = [], isLoading: trendLoading } = useSalesTrend();
  const { data: allSales = [], isLoading: salesLoading } = useAllSales();
  const [timeRange, setTimeRange] = useState("year");
  
  const isLoading = trendLoading || salesLoading;

  // Estimation adjustment based on timeRange
  const multiplier = timeRange === "day" ? 0.05 : timeRange === "week" ? 0.2 : timeRange === "month" ? 0.5 : 1;
  
  const reportData = salesTrend.map(t => ({
    name: t.name,
    Sales: Math.round(t.sales * multiplier),
    Profit: Math.round(t.sales * multiplier * 0.45) // Estimate 45% margin for estimation purposes
  }));

  const handleExportCSV = () => {
    const headers = ["Period", "Sales (₹)", "Profit (₹)"];
    const rows = reportData.map(row => [row.name, row.Sales, row.Profit]);
    const csvContent = [headers, ...rows].map(e => e.join(",")).join("\n");
    
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `business_report_${timeRange}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Business Reports</h1>
          <p className="text-muted-foreground">Generate and export financial insights</p>
        </div>
        <div className="flex gap-2">
          <div className="relative">
            <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
            <select 
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value)}
              className="h-10 pl-9 pr-8 rounded-xl border border-input bg-background hover:bg-accent hover:text-accent-foreground appearance-none cursor-pointer text-sm font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 transition-colors"
            >
              <option value="day">This Day</option>
              <option value="week">This Week</option>
              <option value="month">This Month</option>
              <option value="year">This Year</option>
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none opacity-50" />
          </div>
          <Button className="rounded-xl min-h-[44px] py-2 px-4" onClick={handleExportCSV}><Download className="mr-2 h-4 w-4" /> Export CSV</Button>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <div className="glass-panel p-6 rounded-2xl col-span-2">
          <h2 className="text-lg font-semibold mb-6">Sales vs Profit (Recent Days)</h2>
          <div className="h-[400px] w-full">
            {isLoading ? (
              <div className="flex items-center justify-center h-full">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={reportData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: 'hsl(var(--muted-foreground))' }} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fill: 'hsl(var(--muted-foreground))' }} tickFormatter={(value) => formatCurrency(value)} />
                  <Tooltip 
                    cursor={{ fill: 'hsl(var(--muted)/0.3)' }}
                    contentStyle={{ backgroundColor: 'hsl(var(--background))', border: '1px solid hsl(var(--border))', borderRadius: '8px' }}
                  />
                  <Legend />
                  <Bar dataKey="Sales" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="Profit" fill="#10b981" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
        <div className="col-span-2 grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
          {[
            { title: "Cash Collection", value: allSales.reduce((acc, s) => acc + (s.payments?.filter(p => p.method === 'Cash').reduce((sum, p) => sum + p.amount, 0) || 0), 0), color: "text-emerald-500" },
            { title: "UPI Collection", value: allSales.reduce((acc, s) => acc + (s.payments?.filter(p => p.method === 'UPI').reduce((sum, p) => sum + p.amount, 0) || 0), 0), color: "text-blue-500" },
            { title: "Card Collection", value: allSales.reduce((acc, s) => acc + (s.payments?.filter(p => p.method === 'Card').reduce((sum, p) => sum + p.amount, 0) || 0), 0), color: "text-purple-500" },
            { title: "Pending Payments", value: allSales.reduce((acc, s) => acc + s.pendingAmount, 0), color: "text-destructive" }
          ].map((stat, i) => (
            <div key={i} className="glass-panel p-4 rounded-xl flex flex-col justify-center">
              <p className="text-sm text-muted-foreground">{stat.title}</p>
              <p className={`text-2xl font-bold ${stat.color}`}>{formatCurrency(stat.value)}</p>
            </div>
          ))}
        </div>

        <div className="glass-panel p-6 rounded-2xl col-span-2 mt-4">
          <h2 className="text-lg font-semibold mb-6">Recent Transactions</h2>
          <div className="overflow-x-auto w-full">
            <Table className="min-w-[600px]">
              <TableHeader>
                <TableRow>
                  <TableHead>Invoice</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Payment Method</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Collected</TableHead>
                  <TableHead className="text-right">Pending</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {allSales.slice(0, 10).map((sale) => (
                  <TableRow key={sale.id}>
                    <TableCell className="font-medium whitespace-nowrap">{sale.billNumber}</TableCell>
                    <TableCell className="whitespace-nowrap text-muted-foreground">{new Date(sale.date).toLocaleDateString()}</TableCell>
                    <TableCell className="whitespace-nowrap">{sale.customerName}</TableCell>
                    <TableCell className="whitespace-nowrap">{sale.paymentMethod}</TableCell>
                    <TableCell>
                      <Badge variant={sale.status === "Paid" ? "default" : sale.status === "Partially Paid" ? "secondary" : sale.status === "Pending" || sale.status === "Not Paid" ? "destructive" : "outline"} className="text-[10px]">
                        {sale.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right whitespace-nowrap text-emerald-500">{formatCurrency(sale.paidAmount?.toFixed(2) || "0.00")}</TableCell>
                    <TableCell className="text-right whitespace-nowrap text-destructive">{formatCurrency(sale.pendingAmount?.toFixed(2) || "0.00")}</TableCell>
                    <TableCell className="text-right whitespace-nowrap">{formatCurrency(sale.totalAmount)}</TableCell>
                  </TableRow>
                ))}
                {allSales.length === 0 && !isLoading && (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center text-muted-foreground h-24">
                      No transactions found
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

