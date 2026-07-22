import { formatCurrency } from "@/lib/utils";
import { motion } from "framer-motion";
import { DollarSign, Users, AlertTriangle, TrendingUp } from "lucide-react";
import { StatCard } from "@/components/ui-custom/StatCard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { useDashboardStats, useSalesTrend, useRecentSales } from "@/hooks/useSales";
import { useActivityLogs } from "@/hooks/useSystem";
import { useCustomers } from "@/hooks/useCustomers";

export default function AdminDashboard() {
  console.log("Rendering AdminDashboard.tsx");
  const { data: stats, isLoading: statsLoading } = useDashboardStats();
  const { data: salesTrend = [], isLoading: trendLoading } = useSalesTrend();
  const { data: recentSales = [], isLoading: recentLoading } = useRecentSales();
  const { data: activityLogs = [], isLoading: logsLoading } = useActivityLogs();
  const { data: customers = [], isLoading: custLoading } = useCustomers();

  const loading = statsLoading || trendLoading || recentLoading || logsLoading || custLoading;
  
  const topCustomers = [...customers].sort((a, b) => b.totalSpent - a.totalSpent).slice(0, 5);
  const recentActivity = activityLogs.slice(0, 5);

  if (loading) {
    return (
      <div className="flex h-full w-full items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
          <p className="text-muted-foreground">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <div className="flex flex-col md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard Overview</h1>
          <p className="text-muted-foreground mt-1">Here's what's happening in your store today.</p>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard 
          title="Today's Invoiced" 
          value={formatCurrency(stats?.todaySales || 0)}
          icon={<DollarSign size={20} />}
          trend="Total Invoiced"
          trendUp={true}
        />
        <StatCard 
          title="Collected Today" 
          value={formatCurrency(stats?.todayPaidRevenue || 0)}
          icon={<TrendingUp size={20} className="text-emerald-500" />}
          trend="Paid & Collected"
          trendUp={true}
        />
        <StatCard 
          title="Outstanding Revenue" 
          value={formatCurrency(stats?.pendingCredits || 0)}
          icon={<AlertTriangle size={20} className="text-amber-500" />}
          trend="Pending Collection"
          trendUp={false}
          className="border-amber-500/30"
        />
        <StatCard 
          title="Low Stock Items" 
          value={stats?.lowStockItems || 0}
          icon={<AlertTriangle size={20} />}
          trend={`${stats?.lowStockItems || 0} items`}
          trendUp={false}
          className={stats?.lowStockItems && stats.lowStockItems > 0 ? "border-destructive/30 text-destructive" : ""}
        />
      </div>

      {/* Charts and Tables */}
      <div className="grid gap-6 md:grid-cols-7">
        <Card className="md:col-span-4 glass-card border-white/20">
          <CardHeader>
            <CardTitle>Sales Trend</CardTitle>
          </CardHeader>
          <CardContent className="pl-0">
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={salesTrend} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                  <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => formatCurrency(value)} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: 'hsl(var(--background))', borderColor: 'hsl(var(--border))', borderRadius: '8px' }}
                    itemStyle={{ color: 'hsl(var(--foreground))' }}
                  />
                  <Area type="monotone" dataKey="sales" stroke="hsl(var(--primary))" strokeWidth={3} fillOpacity={1} fill="url(#colorSales)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card className="md:col-span-3 glass-card border-white/20">
          <CardHeader>
            <CardTitle>Recent Sales</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto w-full">
              <Table className="min-w-[400px]">
                <TableHeader>
                  <TableRow>
                    <TableHead>Bill No.</TableHead>
                    <TableHead>Customer</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Amount</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {recentSales.map((sale) => (
                    <TableRow key={sale.id}>
                      <TableCell className="font-medium whitespace-nowrap">{sale.billNumber}</TableCell>
                      <TableCell className="whitespace-nowrap">{sale.customerName}</TableCell>
                      <TableCell>
                        <Badge variant={sale.status === "Paid" ? "default" : sale.status === "Partially Paid" ? "secondary" : sale.status === "Pending" || sale.status === "Not Paid" ? "destructive" : "outline"} className="text-[10px]">
                          {sale.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right whitespace-nowrap">{formatCurrency(sale.totalAmount)}</TableCell>
                    </TableRow>
                  ))}
                  {recentSales.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center text-muted-foreground h-24">
                        No recent sales
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card className="glass-card border-white/20">
          <CardHeader>
            <CardTitle>Top Customers</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {topCustomers.map(customer => (
                <div key={customer.id} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
                      {customer.name.substring(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <p className="text-sm font-medium leading-none">{customer.name}</p>
                      <p className="text-xs text-muted-foreground mt-1">{customer.totalOrders} Orders</p>
                    </div>
                  </div>
                  <div className="font-bold">{formatCurrency(customer.totalSpent)}</div>
                </div>
              ))}
              {topCustomers.length === 0 && (
                <p className="text-sm text-muted-foreground text-center py-4">No customer data available</p>
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="glass-card border-white/20">
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentActivity.map(log => (
                <div key={log.id} className="flex items-start gap-4">
                  <div className="h-2 w-2 mt-2 rounded-full bg-primary shrink-0"></div>
                  <div>
                    <p className="text-sm font-medium">{log.action}</p>
                    <p className="text-xs text-muted-foreground">{log.details}</p>
                    <p className="text-[10px] text-muted-foreground/70 mt-1">{new Date(log.date).toLocaleString()}</p>
                  </div>
                </div>
              ))}
              {recentActivity.length === 0 && (
                <p className="text-sm text-muted-foreground text-center py-4">No recent activity</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </motion.div>
  );
}

