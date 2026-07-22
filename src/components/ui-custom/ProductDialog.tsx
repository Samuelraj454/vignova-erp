import { useState, useEffect, useRef } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useCreateProduct, useUpdateProduct } from "@/hooks/useProducts";
import type { Product } from "@/services/products";
import { UploadCloud, X, Image as ImageIcon } from "lucide-react";
import { toast } from "sonner";

interface ProductDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  product?: Product | null;
}

export function ProductDialog({ open, onOpenChange, product }: ProductDialogProps) {
  const isEditing = !!product;
  const createMutation = useCreateProduct();
  const updateMutation = useUpdateProduct();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  const [formData, setFormData] = useState<Partial<Product>>({
    name: "",
    sku: "",
    categoryId: "",
    purchasePrice: 0,
    sellingPrice: 0,
    stock: 0,
    minStock: 5,
    status: "Active",
  });

  useEffect(() => {
    if (open) {
      setImageFile(null);
      if (product) {
        setFormData(product);
        setImagePreview(product.imageUrl || null);
      } else {
        setFormData({
          name: "",
          sku: "",
          categoryId: "",
          purchasePrice: 0,
          sellingPrice: 0,
          stock: 0,
          minStock: 5,
          status: "Active",
        });
        setImagePreview(null);
      }
    }
  }, [open, product]);

  const handleFileChange = (file: File | null) => {
    if (!file) return;
    const validTypes = ["image/jpeg", "image/png", "image/webp", "image/jpg"];
    if (!validTypes.includes(file.type)) {
      toast.error("Invalid file type. Only JPG, PNG, and WEBP are allowed.");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error("File is too large. Maximum size is 5MB.");
      return;
    }
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFileChange(e.dataTransfer.files[0]);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const data = new FormData();
    data.append("name", formData.name || "");
    data.append("sku", formData.sku || "");
    data.append("category_id", formData.categoryId || "");
    if (formData.supplierId) data.append("supplier_id", formData.supplierId);
    data.append("selling_price", (formData.sellingPrice || 0).toString());
    data.append("purchase_price", (formData.purchasePrice || 0).toString());
    data.append("stock", (formData.stock || 0).toString());
    data.append("min_stock", (formData.minStock || 0).toString());
    data.append("status", formData.status || "Active");
    if (imageFile) {
        data.append("image", imageFile);
    }

    if (isEditing && product) {
      updateMutation.mutate({ id: product.id, data }, {
        onSuccess: () => onOpenChange(false)
      });
    } else {
      createMutation.mutate(data, {
        onSuccess: () => onOpenChange(false)
      });
    }
  };

  const isPending = createMutation.isPending || updateMutation.isPending;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[95vw] sm:max-w-[425px] rounded-2xl max-h-[90vh] overflow-y-auto">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>{isEditing ? "Edit Product" : "Add Product"}</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="flex flex-col sm:grid sm:grid-cols-4 sm:items-center gap-2 sm:gap-4">
              <Label htmlFor="name" className="text-left sm:text-right font-medium">Name</Label>
              <Input 
                id="name" 
                value={formData.name || ""} 
                onChange={e => setFormData({...formData, name: e.target.value})} 
                className="col-span-3" 
                required 
              />
            </div>
            <div className="flex flex-col sm:grid sm:grid-cols-4 sm:items-center gap-2 sm:gap-4">
              <Label htmlFor="sku" className="text-left sm:text-right font-medium">SKU</Label>
              <Input 
                id="sku" 
                value={formData.sku || ""} 
                onChange={e => setFormData({...formData, sku: e.target.value})} 
                className="col-span-3" 
                required 
              />
            </div>
            <div className="flex flex-col sm:grid sm:grid-cols-4 sm:items-center gap-2 sm:gap-4">
              <Label htmlFor="price" className="text-left sm:text-right font-medium">Price (?)</Label>
              <Input 
                id="price" 
                type="number"
                step="0.01"
                value={formData.sellingPrice || 0} 
                onChange={e => setFormData({...formData, sellingPrice: parseFloat(e.target.value)})} 
                className="col-span-3" 
                required 
              />
            </div>
            <div className="flex flex-col sm:grid sm:grid-cols-4 sm:items-center gap-2 sm:gap-4">
              <Label htmlFor="stock" className="text-left sm:text-right font-medium">Stock</Label>
              <Input 
                id="stock" 
                type="number"
                value={formData.stock || 0} 
                onChange={e => setFormData({...formData, stock: parseInt(e.target.value)})} 
                className="col-span-3" 
                required 
              />
            </div>
            
            <div className="flex flex-col sm:grid sm:grid-cols-4 sm:items-start gap-2 sm:gap-4 mt-2">
              <Label className="text-left sm:text-right font-medium pt-2">Product Image</Label>
              <div className="col-span-3">
                <input 
                  type="file" 
                  accept="image/png, image/jpeg, image/webp, image/jpg" 
                  className="hidden" 
                  ref={fileInputRef} 
                  onChange={(e) => e.target.files && handleFileChange(e.target.files[0])} 
                />
                
                {imagePreview ? (
                  <div className="relative rounded-lg overflow-hidden border border-border group w-full h-48 bg-muted flex items-center justify-center">
                    <img src={imagePreview} alt="Preview" className="w-full h-full object-contain" />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                      <Button type="button" variant="secondary" size="sm" onClick={() => fileInputRef.current?.click()}>
                        Replace
                      </Button>
                      <Button type="button" variant="destructive" size="sm" onClick={() => { setImageFile(null); setImagePreview(null); }}>
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div 
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                    onClick={() => fileInputRef.current?.click()}
                    className={`border-2 border-dashed rounded-lg p-6 flex flex-col items-center justify-center cursor-pointer transition-colors w-full h-48 ${isDragging ? 'border-primary bg-primary/5' : 'border-border hover:bg-accent/50'}`}
                  >
                    <UploadCloud className={`h-10 w-10 mb-2 ${isDragging ? 'text-primary' : 'text-muted-foreground'}`} />
                    <p className="text-sm font-medium mb-1">Drag & Drop Image Here</p>
                    <p className="text-xs text-muted-foreground mb-4">OR</p>
                    <Button type="button" variant="outline" size="sm" className="pointer-events-none">
                      Choose Image
                    </Button>
                    <p className="text-[10px] text-muted-foreground mt-4">PNG • JPG • JPEG • WEBP (Max 5MB)</p>
                  </div>
                )}
                {imageFile && <p className="text-xs text-muted-foreground mt-2 truncate">Selected: {imageFile.name}</p>}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isPending}>
              Cancel
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending ? "Saving..." : "Save changes"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
