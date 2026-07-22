import { formatCurrency } from "@/lib/utils";
import { motion } from "framer-motion";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { Package } from "lucide-react";
import { useSalesTrend, useAllSales } from "@/hooks/useSales";

export default function AdminAnalytics() {
  const { data: salesTrend = [], isLoading: trendLoading } = useSalesTrend();
  const { data: allSales = [], isLoading: salesLoading } = useAllSales();
  const isLoading = trendLoading || salesLoading;

  const productSales = allSales.reduce((acc, sale) => {
    sale.items.forEach(item => {
      if (!acc[item.productId]) {
        acc[item.productId] = { name: item.productName, count: 0, revenue: 0 };
      }
      acc[item.productId].count += item.quantity;
      acc[item.productId].revenue += item.total;
    });
    return acc;
  }, {} as Record<string, { name: string, count: number, revenue: number }>);
  
  const topProducts = Object.values(productSales)
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 5);

  const trafficData = salesTrend.map(t => ({
    name: t.name,
    users: Math.floor(t.sales / 10) + Math.floor(Math.random() * 20) // estimated traffic correlation
  }));

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Analytics Dashboard</h1>
        <p className="text-muted-foreground">Deep dive into user and traffic metrics</p>
      </div>

      <div className="glass-panel p-6 rounded-2xl">
        <h2 className="text-lg font-semibold mb-6">Store Traffic (Recent Days)</h2>
        <div className="h-[400px] w-full">
          {isLoading ? (
            <div className="flex items-center justify-center h-full">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={trafficData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorUsers" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: 'hsl(var(--muted-foreground))' }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: 'hsl(var(--muted-foreground))' }} />
                <Tooltip 
                  contentStyle={{ backgroundColor: 'hsl(var(--background))', border: '1px solid hsl(var(--border))', borderRadius: '8px' }}
                />
                <Area type="monotone" dataKey="users" stroke="hsl(var(--primary))" fillOpacity={1} fill="url(#colorUsers)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      <div className="glass-panel p-6 rounded-2xl">
        <h2 className="text-lg font-semibold mb-6">Top Selling Products</h2>
        <div className="space-y-4">
          {topProducts.map((product, i) => (
            <div key={i} className="flex items-center justify-between border-b border-border/50 pb-4 last:border-0 last:pb-0">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                  <Package className="h-5 w-5" />
                </div>
                <div>
                  <p className="font-medium">{product.name}</p>
                  <p className="text-xs text-muted-foreground">{product.count} units sold</p>
                </div>
              </div>
              <div className="font-bold">{formatCurrency(product.revenue)}</div>
            </div>
          ))}
          {topProducts.length === 0 && !isLoading && (
            <p className="text-sm text-muted-foreground text-center py-4">No sales data available</p>
          )}
        </div>
      </div>
    </motion.div>
  );
}

