import { useState } from "react";
import { motion } from "framer-motion";
import { Search, AlertCircle, TrendingDown, ArrowDownUp } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useProducts } from "@/hooks/useProducts";
import { UpdateStockDialog } from "@/components/ui-custom/UpdateStockDialog";
import type { Product } from "@/services/products";

export default function AdminInventory() {
  const { data: products = [], isLoading } = useProducts();
  const [searchTerm, setSearchTerm] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  const filtered = products.filter(item => 
    item.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    item.sku.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleUpdateStock = (product: Product) => {
    setSelectedProduct(product);
    setDialogOpen(true);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Inventory</h1>
          <p className="text-muted-foreground">Monitor stock levels across locations</p>
        </div>
      </div>

      <div className="glass-panel p-6 rounded-2xl">
        <div className="flex gap-4 mb-6">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input 
              placeholder="Search by product or SKU..." 
              className="pl-9 bg-background/50 border-border/50"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        <div className="rounded-xl border border-border/50 overflow-hidden bg-background/50">
          <div className="overflow-x-auto w-full">
            <table className="w-full text-sm text-left min-w-[600px] md:min-w-full">
              <thead className="bg-muted/50 text-muted-foreground font-medium border-b border-border/50">
                <tr>
                  <th className="px-4 md:px-6 py-4">Product</th>
                  <th className="px-4 md:px-6 py-4 hidden sm:table-cell">SKU</th>
                  <th className="px-4 md:px-6 py-4 text-right">Stock</th>
                  <th className="px-4 md:px-6 py-4 text-right hidden md:table-cell">Reorder Level</th>
                  <th className="px-4 md:px-6 py-4">Status</th>
                  <th className="px-4 md:px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  <tr>
                    <td colSpan={6} className="text-center py-10 text-muted-foreground">
                      <div className="flex flex-col items-center gap-2">
                        <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent"></div>
                        <span>Loading inventory...</span>
                      </div>
                    </td>
                  </tr>
                ) : filtered.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="text-center py-10 text-muted-foreground">
                      No products found matching "{searchTerm}"
                    </td>
                  </tr>
                ) : (
                  filtered.map((item) => (
                    <tr key={item.id} className="border-b border-border/50 hover:bg-muted/20 transition-colors">
                      <td className="px-4 md:px-6 py-4 font-medium whitespace-nowrap">{item.name}</td>
                      <td className="px-4 md:px-6 py-4 text-muted-foreground hidden sm:table-cell">{item.sku}</td>
                      <td className="px-4 md:px-6 py-4 text-right font-medium">{item.stock}</td>
                      <td className="px-4 md:px-6 py-4 text-right text-muted-foreground hidden md:table-cell">{item.minStock}</td>
                      <td className="px-4 md:px-6 py-4">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium whitespace-nowrap ${
                          item.stock > item.minStock ? 'bg-emerald-500/10 text-emerald-500' : 
                          item.stock > 0 ? 'bg-amber-500/10 text-amber-500' : 'bg-rose-500/10 text-rose-500'
                        }`}>
                          {item.stock === 0 && <AlertCircle className="w-3 h-3" />}
                          {item.stock > 0 && item.stock <= item.minStock && <TrendingDown className="w-3 h-3" />}
                          {item.stock > item.minStock ? "In Stock" : item.stock > 0 ? "Low Stock" : "Out of Stock"}
                        </span>
                      </td>
                      <td className="px-4 md:px-6 py-4 text-right">
                        <Button variant="outline" size="sm" onClick={() => handleUpdateStock(item)} className="whitespace-nowrap min-h-[44px] py-2 px-4">
                          Update Stock
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

      <UpdateStockDialog 
        open={dialogOpen} 
        onOpenChange={setDialogOpen} 
        product={selectedProduct} 
      />
    </motion.div>
  );
}
