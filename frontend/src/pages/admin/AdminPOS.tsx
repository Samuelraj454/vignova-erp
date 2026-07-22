import { formatCurrency } from "@/lib/utils";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, ShoppingCart, CreditCard, Banknote, Trash2, Plus, Minus, UserPlus, FileText, Package, Smartphone, SplitSquareHorizontal, Check } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { Product } from "@/services/products";
import { useProducts } from "@/hooks/useProducts";
import { useCompleteSale, useRecentSales, useReceivePayment } from "@/hooks/useSales";
import { useCustomers } from "@/hooks/useCustomers";
import { useCart, useUpdateCart } from "@/hooks/useCart";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface CartItem extends Product {
  quantity: number;
}

export default function AdminPOS() {
  const { data: products = [], isLoading: loading } = useProducts();
  const { data: recentSales = [] } = useRecentSales();
  const { data: customers = [] } = useCustomers();
  const completeSaleMutation = useCompleteSale();

  const [searchQuery, setSearchQuery] = useState("");
  const { data: cartEntity } = useCart();
  const updateCartMutation = useUpdateCart();
  
  // We compute the full cart items by joining with products
  const cart = (cartEntity?.items || []).map(item => {
    const p = products.find(prod => prod.id === item.productId);
    return {
      ...(p || {} as any),
      id: item.productId,
      name: item.productName,
      sellingPrice: item.price,
      quantity: item.quantity,
    } as CartItem;
  });

  const [discount, setDiscount] = useState(0);
  const [checkoutModal, setCheckoutModal] = useState<{ open: boolean, method: any }>({ open: false, method: null });
  const [completedSale, setCompletedSale] = useState<any>(null);

  const [paymentStatus, setPaymentStatus] = useState<"Paid" | "Partially Paid" | "Not Paid">("Paid");
  const [splitPayments, setSplitPayments] = useState<{method: string, amount: number}[]>([{method: "Cash", amount: 0}]);
  const [collectionModal, setCollectionModal] = useState<{open: boolean, sale: any | null}>({open: false, sale: null});
  const [collectionAmount, setCollectionAmount] = useState<string>("");
  const [collectionMethod, setCollectionMethod] = useState<string>("Cash");
  const receivePaymentMutation = useReceivePayment();
  const [selectedCustomer, setSelectedCustomer] = useState<string>("walkin");
  const [customCustomerName, setCustomCustomerName] = useState<string>("");
  const [dueDate, setDueDate] = useState<string>("");
  const [reminderFreq, setReminderFreq] = useState<"Daily" | "Weekly" | "Custom">("Daily");
  const [mobileTab, setMobileTab] = useState<"products" | "cart">("products");

  const filteredProducts = products.filter(p => 
    p.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    (p.barcode && p.barcode.includes(searchQuery))
  );

  const saveCartState = (newCart: CartItem[]) => {
    if (!cartEntity) {
      toast.error("Cart session not initialized. Please refresh the page.");
      return;
    }
    const subtotal = newCart.reduce((sum, item) => sum + (item.sellingPrice * item.quantity), 0);
    const tax = subtotal * 0.05;
    const total = Math.max(0, subtotal + tax - discount);

    updateCartMutation.mutate({
      id: cartEntity.id,
      items: newCart.map(item => ({
        productId: item.id,
        productName: item.name,
        quantity: item.quantity,
        price: item.sellingPrice,
        total: item.sellingPrice * item.quantity
      })),
      subtotal,
      tax,
      discount,
      grandTotal: total
    });
  };

  const addToCart = (product: Product) => {
    if (product.stock <= 0) {
      toast.error("Product out of stock");
      return;
    }
    const existing = cart.find(item => item.id === product.id);
    if (existing) {
      if (existing.quantity >= product.stock) {
        toast.error("Cannot add more than available stock");
        return;
      }
      saveCartState(cart.map(item => item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item));
    } else {
      saveCartState([...cart, { ...product, quantity: 1 }]);
    }
  };

  const updateQuantity = (id: string, delta: number) => {
    saveCartState(cart.map(item => {
      if (item.id === id) {
        const newQ = item.quantity + delta;
        if (newQ > item.stock) {
          toast.error("Exceeds stock limit");
          return item;
        }
        return { ...item, quantity: Math.max(1, newQ) };
      }
      return item;
    }));
  };

  const removeFromCart = (id: string) => {
    saveCartState(cart.filter(item => item.id !== id));
  };

  const subtotal = cart.reduce((sum, item) => sum + (item.sellingPrice * item.quantity), 0);
  const tax = subtotal * 0.05; // 5% tax
  const total = Math.max(0, subtotal + tax - discount);

  const handleCheckout = () => {
    if (cart.length === 0) {
      toast.error("Cart is empty");
      return;
    }

    if ((paymentStatus === "Not Paid" || paymentStatus === "Partially Paid") && (!selectedCustomer || selectedCustomer === "walkin") && customCustomerName.trim() === "") {
      toast.error("Please select a registered customer or provide a name for credit/partial sales");
      return;
    }

    if ((paymentStatus === "Not Paid" || paymentStatus === "Partially Paid") && !dueDate) {
      toast.error("Please select a due date for the pending amount");
      return;
    }

    let paidAmount = 0;
    let finalPayments: {method: string, amount: number}[] = [];
    
    if (paymentStatus === "Paid") {
      paidAmount = splitPayments.reduce((sum, p) => sum + (Number(p.amount) || 0), 0);
      if (Math.abs(paidAmount - total) > 0.01) {
         toast.error("Split payments must exactly equal the total amount.");
         return;
      }
      finalPayments = splitPayments.map(p => ({ method: p.method, amount: Number(p.amount) }));
    } else if (paymentStatus === "Partially Paid") {
      paidAmount = splitPayments.reduce((sum, p) => sum + (Number(p.amount) || 0), 0);
      if (paidAmount <= 0 || paidAmount >= total) {
        toast.error("Partial payment must be greater than 0 and less than total.");
        return;
      }
      finalPayments = splitPayments.map(p => ({ method: p.method, amount: Number(p.amount) }));
    } else {
      paidAmount = 0;
      finalPayments = [];
    }

    const pendingAmount = total - paidAmount;
    const finalMethod = paymentStatus === "Not Paid" ? "Credit" : (finalPayments.length > 1 ? "Split" : finalPayments[0]?.method || "Cash");
    
    let custName = "Walk-in Customer";
    if (selectedCustomer && selectedCustomer !== "walkin") {
      custName = customers.find(c => c.id === selectedCustomer)?.name || "Walk-in Customer";
    } else if (customCustomerName.trim() !== "") {
      custName = customCustomerName.trim();
    }

    completeSaleMutation.mutate({
      cartId: cartEntity?.id,
      customerId: (selectedCustomer && selectedCustomer !== "walkin") ? selectedCustomer : undefined,
      customerName: custName,
      totalAmount: total,
      tax,
      discount,
      payments: finalPayments,
      status: paymentStatus,
      dueDate: (paymentStatus === "Not Paid" || paymentStatus === "Partially Paid") ? dueDate : undefined,
      reminderFrequency: (paymentStatus === "Not Paid" || paymentStatus === "Partially Paid") ? reminderFreq : undefined,
      items: cart.map(item => ({
        productId: item.id,
        productName: item.name,
        quantity: item.quantity,
        price: item.sellingPrice,
        total: item.sellingPrice * item.quantity
      }))
    }, {
      onSuccess: (data) => {
        setCompletedSale({ ...data, _cart: cart, _subtotal: subtotal, _tax: tax, _discount: discount, _total: total });
        setDiscount(0);
        setSplitPayments([{method: "Cash", amount: 0}]);
        setDueDate("");
        setCustomCustomerName("");
      }
    });
  };
  const handlePrintInvoice = (saleData?: any) => {
    const isFromHistory = !!saleData;
    const printCart = isFromHistory ? saleData._cart : cart;
    const printSubtotal = isFromHistory ? saleData._subtotal : subtotal;
    const printTax = isFromHistory ? saleData._tax : tax;
    const printDiscount = isFromHistory ? saleData._discount : discount;
    const printTotal = isFromHistory ? saleData._total : total;
    const printWindow = window.open('', '', 'width=800,height=600');
    if (!printWindow) {
      toast.error("Please allow popups to print invoices");
      return;
    }

    const date = new Date().toLocaleString();
    const invoiceHtml = `
      <html>
        <head>
          <title>Invoice - Vignova CRM</title>
          <style>
            body { font-family: system-ui, -apple-system, sans-serif; padding: 40px; color: #1a1a1a; max-width: 800px; margin: 0 auto; }
            .header { text-align: center; margin-bottom: 40px; padding-bottom: 20px; border-bottom: 2px solid #e5e7eb; }
            .store-name { font-size: 28px; font-weight: 800; margin: 0 0 8px 0; color: #0f172a; }
            .info { color: #64748b; font-size: 14px; margin: 4px 0; }
            .invoice-title { font-size: 20px; font-weight: 600; margin: 30px 0 20px 0; text-transform: uppercase; letter-spacing: 0.05em; color: #475569; }
            .table { width: 100%; border-collapse: collapse; margin-bottom: 30px; }
            .table th { background-color: #f8fafc; font-weight: 600; color: #475569; text-transform: uppercase; font-size: 12px; letter-spacing: 0.05em; padding: 12px; text-align: left; border-bottom: 2px solid #e5e7eb; }
            .table td { padding: 16px 12px; border-bottom: 1px solid #f1f5f9; color: #334155; }
            .text-right { text-align: right !important; }
            .text-center { text-align: center !important; }
            .summary-box { width: 350px; margin-left: auto; background-color: #f8fafc; padding: 24px; border-radius: 12px; }
            .summary-row { display: flex; justify-content: space-between; margin-bottom: 12px; color: #475569; }
            .total-row { display: flex; justify-content: space-between; margin-top: 16px; padding-top: 16px; border-top: 2px dashed #cbd5e1; font-weight: 700; font-size: 20px; color: #0f172a; }
            .footer { text-align: center; margin-top: 60px; font-size: 14px; color: #94a3b8; }
            @media print {
              body { padding: 0; }
              .summary-box { background-color: transparent; border: 1px solid #e5e7eb; }
            }
          </style>
        </head>
        <body>
          <div class="header">
            <h1 class="store-name">Vignova CRM</h1>
            <p class="info">123 Tech Lane, Silicon Valley, CA 94025</p>
            <p class="info">Phone: +1 (555) 000-0000 | Email: support@vignova.com</p>
          </div>
          
          <div style="display: flex; justify-content: space-between; align-items: flex-end;">
            <div class="invoice-title">RECEIPT</div>
            <p class="info" style="margin-bottom: 20px;"><strong>Date:</strong> ${date}</p>
          </div>
          
          <table class="table">
            <thead>
              <tr>
                <th>Item Description</th>
                <th class="text-center">Qty</th>
                <th class="text-right">Price</th>
                <th class="text-right">Total</th>
              </tr>
            </thead>
            <tbody>
              ${printCart.map((item: any) => `
                <tr>
                  <td style="font-weight: 500;">{formatCurrency(item.name)}</td>
                  <td class="text-center">{formatCurrency(item.quantity)}</td>
                  <td class="text-right">${formatCurrency(item.sellingPrice)}</td>
                  <td class="text-right font-medium">${formatCurrency((item.sellingPrice * item.quantity))}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>

          <div class="summary-box">
            <div class="summary-row">
              <span>Subtotal</span>
              <span>${formatCurrency(printSubtotal)}</span>
            </div>
            <div class="summary-row">
              <span>Tax (5%)</span>
              <span>${formatCurrency(printTax)}</span>
            </div>
            ${printDiscount > 0 ? `
            <div class="summary-row" style="color: #10b981;">
              <span>Discount</span>
              <span>-${formatCurrency(printDiscount)}</span>
            </div>
            ` : ''}
            <div class="total-row">
              <span>Total Amount</span>
              <span>${formatCurrency(printTotal)}</span>
            </div>
          </div>

          <div class="footer">
            <p style="font-weight: 500; color: #475569; font-size: 16px; margin-bottom: 8px;">Thank you for shopping with us!</p>
            <p>Please keep this receipt for your records. Returns accepted within 30 days.</p>
          </div>
        </body>
      </html>
    `;

    printWindow.document.write(invoiceHtml);
    printWindow.document.close();
    printWindow.focus();
    
    setTimeout(() => {
      printWindow.print();
      printWindow.close();
    }, 250);
  };

  return (
    <div className="flex flex-col lg:flex-row h-[calc(100vh-5rem)] md:h-[calc(100vh-6rem)] gap-4 md:gap-6 pb-48 lg:pb-0 relative">
      
      {/* Mobile Tabs Header */}
      <div className="lg:hidden flex bg-muted p-1 rounded-xl shrink-0 mt-2 z-10 mx-4 md:mx-0">
        <Button 
          variant={mobileTab === "products" ? "default" : "ghost"} 
          className="flex-1 rounded-lg min-h-[48px] text-base" 
          onClick={() => setMobileTab("products")}
        >
          <Package className="w-5 h-5 mr-2" /> Products
        </Button>
        <Button 
          variant={mobileTab === "cart" ? "default" : "ghost"} 
          className="flex-1 rounded-lg relative min-h-[48px] text-base" 
          onClick={() => setMobileTab("cart")}
        >
          <ShoppingCart className="w-5 h-5 mr-2" /> Cart
          {cart.length > 0 && (
            <Badge variant="destructive" className="absolute -top-2 -right-2 h-6 w-6 flex items-center justify-center p-0 rounded-full">{cart.length}</Badge>
          )}
        </Button>
      </div>

      {/* Left side - Products */}
      <div className={`flex-1 flex-col gap-4 overflow-hidden h-full min-h-[50vh] ${mobileTab === "products" ? "flex" : "hidden lg:flex"}`}>
        <div className="relative shrink-0 mx-4 lg:mx-0">
          <Search className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
          <Input 
            placeholder="Search products by name or barcode..." 
            className="pl-10 h-12 text-base md:text-lg rounded-xl glass-panel"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <ScrollArea className="flex-1 glass-card rounded-2xl p-2 md:p-4 border-white/20 h-full">
          {loading ? (
            <div className="flex flex-col items-center justify-center h-full gap-4 py-20">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
              <p className="text-muted-foreground">Loading products...</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-3 md:gap-4 pb-4">
              {filteredProducts.map(product => (
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  key={product.id}
                  onClick={() => addToCart(product)}
                  className="bg-background/80 backdrop-blur-md rounded-xl border p-3 md:p-4 cursor-pointer hover:border-primary/50 transition-colors shadow-sm relative overflow-hidden group flex flex-col min-h-[160px]"
                >
                  <div className="aspect-square rounded-lg bg-muted mb-3 overflow-hidden shrink-0">
                    {product.imageUrl ? (
                      <img src={product.imageUrl} alt={product.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300" />
                    ) : (
                      <Package className="w-full h-full p-6 md:p-8 text-muted-foreground/30" />
                    )}
                  </div>
                  <h3 className="font-medium text-xs md:text-sm line-clamp-2 leading-tight flex-1">{product.name}</h3>
                  <div className="flex justify-between items-center mt-2 shrink-0">
                    <span className="font-bold text-primary text-sm md:text-base">{formatCurrency(product.sellingPrice)}</span>
                    <Badge variant={product.stock > product.minStock ? "secondary" : "destructive"} className="text-[9px] md:text-[10px] px-1 md:px-2 py-0 h-4 md:h-5">
                      {product.stock} left
                    </Badge>
                  </div>
                </motion.div>
              ))}
              {filteredProducts.length === 0 && !loading && (
                <div className="col-span-full flex justify-center py-10 text-muted-foreground">
                  No products found.
                </div>
              )}
            </div>
          )}
        </ScrollArea>
      </div>

      {/* Right side - Cart */}
      <Card className={`w-full lg:w-96 flex-col glass-card border-white/20 overflow-hidden shadow-xl rounded-2xl shrink-0 h-full mt-0 ${mobileTab === "cart" ? "flex" : "hidden lg:flex"}`}>
        {completedSale ? (
          <div className="flex flex-col items-center justify-center h-full space-y-6 p-6">
            <div className="h-20 w-20 bg-emerald-100 rounded-full flex items-center justify-center mb-2">
              <Check className="h-10 w-10 text-emerald-600" />
            </div>
            <h2 className="text-2xl font-bold text-center">Payment Successful!</h2>
            <p className="text-muted-foreground text-center">
              Invoice: {completedSale.billNumber} <br/>
              Amount: {formatCurrency(completedSale._total || 0)}
            </p>
            <div className="w-full space-y-3 pt-6">
              <Button className="w-full h-12 rounded-xl" onClick={() => handlePrintInvoice(completedSale)}>
                <FileText className="mr-2 h-4 w-4" /> Print Invoice
              </Button>
              <Button variant="outline" className="w-full h-12 rounded-xl border-primary/20 hover:bg-primary/5 text-primary" onClick={() => setCompletedSale(null)}>
                <Plus className="mr-2 h-4 w-4" /> New Sale
              </Button>
            </div>
          </div>
        ) : (
          <Tabs defaultValue="current" className="h-full flex flex-col">
            <CardHeader className="bg-primary/5 border-b pb-4 pt-4 px-4">
              <div className="flex justify-between items-center mb-4">
                <CardTitle className="flex items-center gap-2">
                  <ShoppingCart size={20} className="text-primary" /> POS Register
                </CardTitle>
                <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full" title="Add Customer">
                  <UserPlus size={18} />
                </Button>
              </div>
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="current">Current Order</TabsTrigger>
                <TabsTrigger value="history">Recent Orders</TabsTrigger>
              </TabsList>
            </CardHeader>
            
            <TabsContent value="current" className="flex-1 flex flex-col m-0 h-full overflow-hidden">
              <ScrollArea className="flex-1 p-4">
          {cart.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-muted-foreground space-y-4 pt-12">
              <ShoppingCart size={48} className="opacity-20" />
              <p>Your cart is empty</p>
            </div>
          ) : (
            <div className="space-y-4">
              <AnimatePresence>
                {cart.map(item => (
                  <motion.div 
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    key={item.id} 
                    className="flex justify-between items-center bg-background/50 p-3 rounded-lg border"
                  >
                    <div className="flex-1 overflow-hidden pr-2">
                      <h4 className="text-sm font-medium truncate">{item.name}</h4>
                      <div className="text-primary font-bold text-sm">{formatCurrency(item.sellingPrice)}</div>
                    </div>
                    <div className="flex items-center gap-2 bg-muted/50 rounded-lg p-1">
                      <Button variant="ghost" size="icon" className="min-h-[48px] min-w-[48px]" onClick={() => updateQuantity(item.id, -1)}>
                        <Minus size={20} />
                      </Button>
                      <span className="text-base font-bold w-6 text-center">{item.quantity}</span>
                      <Button variant="ghost" size="icon" className="min-h-[48px] min-w-[48px]" onClick={() => updateQuantity(item.id, 1)}>
                        <Plus size={20} />
                      </Button>
                      <Button variant="destructive" size="icon" className="min-h-[48px] min-w-[48px] ml-1" onClick={() => removeFromCart(item.id)}>
                        <Trash2 size={20} />
                      </Button>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          )}
        </ScrollArea>

        <CardFooter className="flex flex-col bg-background/95 backdrop-blur-md lg:bg-muted/30 p-0 border-t fixed bottom-[4.5rem] md:bottom-20 lg:static left-0 right-0 z-40 rounded-t-2xl lg:rounded-none shadow-[0_-10px_40px_rgba(0,0,0,0.1)] lg:shadow-none mx-2 lg:mx-0">
          <div className="w-full p-4 space-y-2 text-sm">
            <div className="flex justify-between items-center lg:hidden cursor-pointer" onClick={() => setMobileTab("cart")}>
              <span className="text-base font-bold flex items-center gap-2"><ShoppingCart className="w-4 h-4"/> Cart Total ({cart.length} items)</span>
              <span className="text-2xl font-bold text-primary">{formatCurrency(total)}</span>
            </div>
            
            <div className={`hidden lg:block space-y-2 ${mobileTab === 'cart' ? 'block !mt-0' : ''}`}>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Subtotal</span>
                <span>{formatCurrency(subtotal)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Tax (5%)</span>
                <span>{formatCurrency(tax)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Discount</span>
                <div className="flex items-center gap-2">
                  <span className="text-emerald-500">-₹</span>
                  <Input 
                    type="number" 
                    value={discount} 
                    onChange={e => setDiscount(Math.max(0, parseFloat(e.target.value) || 0))} 
                    className="h-8 w-20 px-2 py-1 text-right text-emerald-500 font-medium" 
                  />
                </div>
              </div>
              <Separator className="my-2" />
              <div className="flex justify-between items-center">
                <span className="text-base font-bold">Total</span>
                <span className="text-2xl font-bold text-primary">{formatCurrency(total)}</span>
              </div>
            </div>
          </div>
          
          <div className="flex flex-col gap-2 p-4 pt-0 w-full">
            <Button 
              className="h-14 rounded-xl w-full bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg shadow-primary/20 text-lg font-bold" 
              onClick={() => {
                if (mobileTab === 'products' && window.innerWidth < 1024) {
                  setMobileTab('cart');
                } else {
                  setCheckoutModal({ open: true, method: null });
                }
              }}
              disabled={cart.length === 0 || completeSaleMutation.isPending}
            >
              <ShoppingCart className="mr-2 h-5 w-5" /> 
              {completeSaleMutation.isPending ? "Processing..." : 
                (mobileTab === 'products' && window.innerWidth < 1024 ? "View Cart" : "Complete Purchase")}
            </Button>
            <Button 
              variant="outline" 
              className={`h-12 rounded-xl w-full border-primary/20 hover:bg-primary/5 text-primary ${mobileTab === 'products' && window.innerWidth < 1024 ? 'hidden lg:flex' : 'flex'}`}
              disabled={cart.length === 0}
              onClick={() => handlePrintInvoice()}
            >
              <FileText className="mr-2 h-4 w-4" /> Print Proforma
            </Button>
          </div>
        </CardFooter>
            </TabsContent>

            <TabsContent value="history" className="flex-1 m-0 h-full overflow-hidden">
              <ScrollArea className="h-full p-4">
                {recentSales.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full text-muted-foreground space-y-4 pt-12">
                    <FileText size={48} className="opacity-20" />
                    <p>No recent orders</p>
                  </div>
                ) : (
                  <div className="space-y-4 pb-4">
                    {recentSales.map(sale => (
                      <div key={sale.id} className="bg-background/50 border rounded-xl p-4 shadow-sm">
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <p className="font-bold">{sale.billNumber}</p>
                            <p className="text-xs text-muted-foreground">{new Date(sale.date).toLocaleString()}</p>
                          </div>
                          <Badge variant={sale.status === "Paid" ? "default" : sale.status === "Pending" ? "secondary" : "destructive"} className="text-[10px]">
                            {sale.status}
                          </Badge>
                        </div>
                        <div className="flex justify-between items-end mt-4">
                          <div>
                            <p className="text-sm font-medium">{sale.customerName}</p>
                            <p className="text-xs text-muted-foreground">{(sale.items?.length) || 0} items</p>
                          </div>
                          <div className="text-right">
                            <p className="text-lg font-bold text-primary">{formatCurrency(sale.totalAmount)}</p>
                            <div className="flex items-center justify-end gap-1 mt-1">
                              {(sale.status === "Not Paid" || sale.status === "Partially Paid" || sale.status === "Pending") && (
                                <Button variant="outline" size="sm" className="h-6 text-xs px-2 border-primary/30 text-primary" onClick={() => setCollectionModal({ open: true, sale })}>
                                  <Banknote className="mr-1 h-3 w-3" /> Collect
                                </Button>
                              )}
                              <Button variant="ghost" size="sm" className="h-6 text-xs px-2" onClick={() => handlePrintInvoice(sale)}>
                                <FileText className="mr-1 h-3 w-3" /> Receipt
                              </Button>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </ScrollArea>
            </TabsContent>
          </Tabs>
        )}
      </Card>

      {/* Advanced Checkout Modal */}
      <Dialog open={checkoutModal.open} onOpenChange={(open) => setCheckoutModal(prev => ({ ...prev, open }))}>
        <DialogContent className="sm:max-w-[600px] w-[95vw] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl">Complete Purchase</DialogTitle>
          </DialogHeader>
          <div className="py-4 space-y-6">
            
            {/* Header Totals */}
            <div className="flex justify-between items-center bg-primary/5 p-4 rounded-xl border border-primary/20">
              <div>
                <p className="text-sm text-muted-foreground font-medium">Grand Total</p>
                <p className="text-3xl font-bold text-primary">{formatCurrency(total)}</p>
              </div>
              {paymentStatus === "Partially Paid" && (
                <div className="text-right">
                  <p className="text-sm text-destructive font-medium">Balance Due</p>
                  <p className="text-2xl font-bold text-destructive">{formatCurrency((total - splitPayments.reduce((sum, p) => sum + (Number(p.amount) || 0), 0)))}</p>
                </div>
              )}
              {paymentStatus === "Not Paid" && (
                <div className="text-right">
                  <p className="text-sm text-destructive font-medium">Balance Due</p>
                  <p className="text-2xl font-bold text-destructive">{formatCurrency(total)}</p>
                </div>
              )}
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Customer</Label>
                <Select value={selectedCustomer} onValueChange={setSelectedCustomer}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select Customer (Walk-in)" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="walkin">Walk-in Customer</SelectItem>
                    {customers.map(c => (
                      <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {selectedCustomer === "walkin" && (
                  <Input 
                    placeholder="Type name (Optional)" 
                    value={customCustomerName}
                    onChange={e => setCustomCustomerName(e.target.value)}
                    className="mt-2"
                  />
                )}
              </div>
              <div className="space-y-2">
                <Label>Payment Status</Label>
                <Select value={paymentStatus} onValueChange={(val: any) => setPaymentStatus(val)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Paid">Paid</SelectItem>
                    <SelectItem value="Partially Paid">Partially Paid</SelectItem>
                    <SelectItem value="Not Paid">Not Paid (Credit)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {paymentStatus !== "Not Paid" && (
              <div className="space-y-4 border-t pt-4">
                <div className="flex justify-between items-center">
                  <Label>Payment Methods (Split Supported)</Label>
                  <Button variant="ghost" size="sm" onClick={() => setSplitPayments([...splitPayments, {method: "Cash", amount: 0}])}><Plus className="h-4 w-4 mr-1"/> Add Split</Button>
                </div>
                {splitPayments.map((sp, idx) => (
                  <div key={idx} className="flex gap-2 items-center">
                    <Select value={sp.method} onValueChange={(val) => {
                      const newSp = [...splitPayments];
                      newSp[idx].method = val;
                      setSplitPayments(newSp);
                    }}>
                      <SelectTrigger className="w-[180px]">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Cash">Cash</SelectItem>
                        <SelectItem value="Card">Card</SelectItem>
                        <SelectItem value="UPI">UPI</SelectItem>
                        <SelectItem value="Bank Transfer">Bank Transfer</SelectItem>
                        <SelectItem value="Wallet">Wallet</SelectItem>
                      </SelectContent>
                    </Select>
                    <Input 
                      type="number" 
                      value={sp.amount || ""} 
                      onChange={e => {
                        const newSp = [...splitPayments];
                        newSp[idx].amount = parseFloat(e.target.value) || 0;
                        setSplitPayments(newSp);
                      }} 
                      placeholder="Amount"
                      className="flex-1"
                    />
                    {splitPayments.length > 1 && (
                      <Button variant="ghost" size="icon" className="text-destructive" onClick={() => setSplitPayments(splitPayments.filter((_, i) => i !== idx))}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                ))}
                <div className="flex justify-between text-sm pt-2 text-muted-foreground font-medium">
                   <span>Total Entered: {formatCurrency(splitPayments.reduce((sum, p) => sum + (Number(p.amount) || 0), 0))}</span>
                   <span className={splitPayments.reduce((sum, p) => sum + (Number(p.amount) || 0), 0) < total && paymentStatus === "Paid" ? "text-destructive" : ""}>Required: {formatCurrency(total)}</span>
                </div>
              </div>
            )}

            {(paymentStatus === "Partially Paid" || paymentStatus === "Not Paid") && (
              <div className="grid grid-cols-2 gap-4 border-t pt-4 bg-destructive/5 p-4 rounded-xl mt-4">
                <div className="space-y-2">
                  <Label className="text-destructive">Due Date (Required)</Label>
                  <Input type="date" value={dueDate} onChange={e => setDueDate(e.target.value)} className="h-10" />
                </div>
                <div className="space-y-2">
                  <Label>Reminder Frequency</Label>
                  <Select value={reminderFreq} onValueChange={(val: any) => setReminderFreq(val)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Daily">Daily</SelectItem>
                      <SelectItem value="Weekly">Weekly</SelectItem>
                      <SelectItem value="Custom">Custom</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            )}

          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCheckoutModal({ open: false, method: null })}>Cancel</Button>
            <Button 
              onClick={() => {
                handleCheckout();
                setCheckoutModal({ open: false, method: null });
              }}
              disabled={completeSaleMutation.isPending}
            >
              {completeSaleMutation.isPending ? "Processing..." : "Confirm"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Payment Collection Modal */}
      <Dialog open={collectionModal.open} onOpenChange={(open) => setCollectionModal(prev => ({ ...prev, open }))}>
        <DialogContent className="sm:max-w-[400px] w-[95vw] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Collect Payment</DialogTitle>
          </DialogHeader>
          {collectionModal.sale && (
            <div className="py-4 space-y-4">
              <div className="bg-muted p-4 rounded-xl flex justify-between items-center">
                <div>
                  <p className="text-sm text-muted-foreground">Pending Amount</p>
                  <p className="text-2xl font-bold text-destructive">{formatCurrency(collectionModal.sale.pendingAmount)}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-muted-foreground">Invoice</p>
                  <p className="font-medium">{collectionModal.sale.billNumber}</p>
                </div>
              </div>
              <div className="space-y-2">
                <Label>Amount to Collect</Label>
                <div className="flex items-center gap-2">
                  <Input 
                    type="number" 
                    value={collectionAmount} 
                    onChange={(e) => setCollectionAmount(e.target.value)} 
                    placeholder="Enter amount"
                  />
                  <Button variant="secondary" onClick={() => setCollectionAmount(collectionModal.sale.pendingAmount.toString())}>Max</Button>
                </div>
              </div>
              <div className="space-y-2">
                <Label>Payment Method</Label>
                <Select value={collectionMethod} onValueChange={setCollectionMethod}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Cash">Cash</SelectItem>
                    <SelectItem value="Card">Card</SelectItem>
                    <SelectItem value="UPI">UPI</SelectItem>
                    <SelectItem value="Bank Transfer">Bank Transfer</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setCollectionModal({ open: false, sale: null })}>Cancel</Button>
            <Button 
              disabled={receivePaymentMutation.isPending || !collectionAmount || parseFloat(collectionAmount) <= 0 || parseFloat(collectionAmount) > (collectionModal.sale?.pendingAmount || 0)}
              onClick={() => {
                receivePaymentMutation.mutate({
                  saleId: collectionModal.sale.id,
                  amount: parseFloat(collectionAmount),
                  method: collectionMethod
                }, {
                  onSuccess: () => {
                    setCollectionModal({ open: false, sale: null });
                    setCollectionAmount("");
                  }
                });
              }}
            >
              {receivePaymentMutation.isPending ? "Processing..." : "Confirm Payment"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

