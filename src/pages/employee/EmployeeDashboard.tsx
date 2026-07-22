import { formatCurrency } from "@/lib/utils";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Receipt, Clock, Wallet, Search } from "lucide-react";
import { StatCard } from "@/components/ui-custom/StatCard";
import { useDashboardStats } from "@/hooks/useSales";
import { getRecentSales } from "@/services/sales";
import type { Sale } from "@/services/sales";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useNavigate } from "react-router-dom";

export default function EmployeeDashboard() {
  const [recentSales, setRecentSales] = useState<Sale[]>([]);
  const { data: stats } = useDashboardStats();
  const navigate = useNavigate();

  useEffect(() => {
    async function fetchData() {
      try {
        const salesData = await getRecentSales();
        setRecentSales(salesData as Sale[]);
      } catch (error) {
        console.error("Failed to fetch recent sales", error);
      }
    }
    fetchData();
  }, []);

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <div className="flex flex-col md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Today's Shift Overview</h1>
          <p className="text-muted-foreground mt-1">Summary of your sales and pending actions.</p>
        </div>
        <div className="mt-4 md:mt-0 flex gap-2">
          <Button onClick={() => navigate("/employee/pos")} className="rounded-xl shadow-lg shadow-primary/20 bg-primary">
            New Bill (POS)
          </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <StatCard 
          title="My Sales Today" 
          value={formatCurrency(stats?.todaySales || 0)}
          icon={<Receipt size={20} />}
        />
        <StatCard 
          title="Bills Created" 
          value={recentSales.length > 0 ? `${recentSales.length}+` : "0"}
          icon={<Wallet size={20} />}
        />
        <StatCard 
          title="Pending Credits" 
          value={(stats?.pendingCredits || 0).toString()}
          icon={<Clock size={20} />}
          className="border-accent/30"
        />
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card className="glass-card border-white/20">
          <CardHeader>
            <CardTitle>My Recent Bills</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Bill No.</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {recentSales.map((sale) => (
                  <TableRow key={sale.id}>
                    <TableCell className="font-medium">{sale.billNumber}</TableCell>
                    <TableCell>{sale.customerName}</TableCell>
                    <TableCell className="text-right">{formatCurrency(sale.totalAmount)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Card className="glass-card border-white/20">
          <CardHeader>
            <CardTitle>Customer Lookup</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">Search customer by phone number or name to quickly create a bill or check pending credits.</p>
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Enter phone number..." className="pl-9 h-10 rounded-xl" />
            </div>
            <Button className="w-full rounded-xl" variant="secondary">Search Customer</Button>
          </CardContent>
        </Card>
      </div>
    </motion.div>
  );
}
