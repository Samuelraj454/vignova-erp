import { formatCurrency } from "@/lib/utils";
import { useState } from "react";
import { Plus, Search, Filter, MoreHorizontal, Edit, Trash2, Eye } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import type { Product } from "@/services/products";
import { useProducts, useDeleteProduct } from "@/hooks/useProducts";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ProductDialog } from "@/components/ui-custom/ProductDialog";
import { EmptyState } from "@/components/ui-custom/EmptyState";

export default function AdminProducts() {
  const { data: products = [], isLoading } = useProducts();
  const deleteMutation = useDeleteProduct();

  const [searchQuery, setSearchQuery] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [viewProduct, setViewProduct] = useState<Product | null>(null);

  const filteredProducts = products.filter(p => 
    p.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    p.sku.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleAdd = () => {
    setEditingProduct(null);
    setDialogOpen(true);
  };

  const handleEdit = (product: Product) => {
    setEditingProduct(product);
    setDialogOpen(true);
  };

  const handleView = (product: Product) => {
    setViewProduct(product);
    setDetailsOpen(true);
  };

  const handleDelete = (id: string) => {
    if (confirm("Are you sure you want to delete this product?")) {
      deleteMutation.mutate(id);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Products Inventory</h1>
          <p className="text-muted-foreground mt-1">Manage your catalog, pricing, and stock levels.</p>
        </div>
        <Button onClick={handleAdd} className="w-full sm:w-auto rounded-xl shadow-lg shadow-primary/20 min-h-[48px] py-2 px-4">
          <Plus className="mr-2 h-4 w-4" /> Add Product
        </Button>
      </div>

      <Card className="glass-card border-white/20">
        <CardHeader className="pb-3 border-b">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <CardTitle>All Products</CardTitle>
            <div className="flex items-center gap-2 w-full md:w-auto">
              <div className="relative flex-1 md:w-64">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input 
                  placeholder="Search products..." 
                  className="pl-9 w-full bg-background/50 rounded-xl"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <Button variant="outline" size="icon" className="rounded-xl border-border/50 shrink-0 min-h-[40px]">
                <Filter className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="hidden md:block">
            <Table className="w-full">
              <TableHeader className="bg-muted/30">
                <TableRow>
                  <TableHead className="w-[80px] text-center">Image</TableHead>
                  <TableHead>Product Name</TableHead>
                  <TableHead className="hidden md:table-cell">SKU</TableHead>
                  <TableHead className="hidden sm:table-cell">Category</TableHead>
                  <TableHead className="text-right">Price</TableHead>
                  <TableHead className="text-center">Stock</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-10 text-muted-foreground">
                      <div className="flex flex-col items-center gap-2">
                        <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent"></div>
                        <span>Loading products...</span>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : filteredProducts.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="p-10">
                      <EmptyState 
                        icon="📦" 
                        title="No Products Yet" 
                        description="You haven't added any products yet, or none match your search." 
                        actionLabel="Add Product" 
                        onAction={handleAdd} 
                      />
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredProducts.map((product) => (
                    <TableRow key={product.id} className="hover:bg-muted/20">
                      <TableCell className="text-center">
                        <div className="w-[60px] h-[60px] rounded-md bg-muted overflow-hidden mx-auto border">
                          {product.imageUrl ? (
                            <img src={product.imageUrl} alt={product.name} className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-xs text-muted-foreground text-center">No image</div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="font-medium whitespace-nowrap">{product.name}</TableCell>
                      <TableCell className="text-muted-foreground text-sm hidden md:table-cell">{product.sku}</TableCell>
                      <TableCell className="hidden sm:table-cell">{product.category}</TableCell>
                      <TableCell className="text-right font-medium">{formatCurrency(product.sellingPrice)}</TableCell>
                      <TableCell className="text-center">
                        <span className={product.stock <= product.minStock ? "text-destructive font-bold" : ""}>
                          {product.stock}
                        </span>
                      </TableCell>
                      <TableCell>
                        <Badge variant={
                          product.status === "Active" ? "default" : 
                          product.status === "Low Stock" ? "secondary" : "destructive"
                        }>
                          {product.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-11 w-11">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-40 rounded-xl">
                            <DropdownMenuItem onClick={() => handleView(product)}>
                              <Eye className="mr-2 h-4 w-4" /> View Details
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleEdit(product)}>
                              <Edit className="mr-2 h-4 w-4" /> Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleDelete(product.id)} className="text-destructive focus:text-destructive">
                              <Trash2 className="mr-2 h-4 w-4" /> Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          <div className="md:hidden space-y-4 p-4">
            {isLoading ? (
              <div className="flex flex-col items-center justify-center py-10 text-muted-foreground gap-2">
                <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent"></div>
                <span>Loading products...</span>
              </div>
            ) : filteredProducts.length === 0 ? (
              <EmptyState 
                icon="📦" 
                title="No Products Yet" 
                description="You haven't added any products yet, or none match your search." 
                actionLabel="Add Product" 
                onAction={handleAdd} 
              />
            ) : (
              filteredProducts.map((product) => (
                <Card key={product.id} className="glass-card">
                  <CardContent className="p-4 space-y-3">
                    <div className="flex items-start gap-4">
                      <div className="w-16 h-16 rounded-md bg-muted overflow-hidden shrink-0 border">
                        {product.imageUrl ? (
                          <img src={product.imageUrl} alt={product.name} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-[10px] text-muted-foreground text-center">No image</div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-start gap-2">
                          <h4 className="font-semibold truncate">{product.name}</h4>
                          <Badge variant={
                            product.status === "Active" ? "default" : 
                            product.status === "Low Stock" ? "secondary" : "destructive"
                          } className="shrink-0">
                            {product.status}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mt-1">SKU: {product.sku}</p>
                        <p className="font-medium text-primary mt-1">{formatCurrency(product.sellingPrice)}</p>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-2 text-sm pt-2">
                      <div>
                        <span className="text-muted-foreground block text-xs mb-1">Category</span>
                        <span>{product.category}</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground block text-xs mb-1">Stock</span>
                        <span className={product.stock <= product.minStock ? "text-destructive font-bold" : ""}>
                          {product.stock}
                        </span>
                      </div>
                    </div>

                    <div className="pt-3 mt-3 border-t flex justify-end gap-2">
                      <Button variant="outline" size="sm" onClick={() => handleView(product)} className="flex-1 min-h-[48px]">
                        <Eye className="h-4 w-4 mr-2" /> View
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => handleEdit(product)} className="flex-1 min-h-[48px]">
                        <Edit className="h-4 w-4 mr-2" /> Edit
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => handleDelete(product.id)} className="flex-1 text-destructive hover:bg-destructive/10 hover:text-destructive min-h-[48px]">
                        <Trash2 className="h-4 w-4 mr-2" /> Delete
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      <ProductDialog 
        open={dialogOpen} 
        onOpenChange={setDialogOpen} 
        product={editingProduct} 
      />

      <Dialog open={detailsOpen} onOpenChange={setDetailsOpen}>
        <DialogContent className="w-full h-[100dvh] sm:h-auto sm:max-w-2xl sm:rounded-2xl overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Product Details</DialogTitle>
          </DialogHeader>
          {viewProduct && (
            <div className="flex flex-col items-center gap-6 py-4">
              <div className="w-[300px] h-[300px] rounded-2xl overflow-hidden shadow-lg border relative group cursor-pointer">
                {viewProduct.imageUrl ? (
                  <img 
                    src={viewProduct.imageUrl} 
                    alt={viewProduct.name} 
                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110" 
                  />
                ) : (
                  <div className="w-full h-full bg-muted flex items-center justify-center text-muted-foreground">
                    No Image Available
                  </div>
                )}
              </div>
              <div className="w-full space-y-2 text-center">
                <h3 className="text-2xl font-bold">{viewProduct.name}</h3>
                <p className="text-muted-foreground">SKU: {viewProduct.sku}</p>
                <div className="flex items-center justify-center gap-4 mt-2">
                  <Badge variant="outline" className="text-lg py-1 px-3">{formatCurrency(viewProduct.sellingPrice)}</Badge>
                  <Badge variant={viewProduct.stock > viewProduct.minStock ? "default" : "destructive"}>
                    {viewProduct.stock} in stock
                  </Badge>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

