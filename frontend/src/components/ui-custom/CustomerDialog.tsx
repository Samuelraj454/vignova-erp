import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useCreateCustomer, useUpdateCustomer } from "@/hooks/useCustomers";
import { useAllSales, useReceivePayment } from "@/hooks/useSales";
import type { Customer } from "@/services/customers";
import { CreditCard, Banknote, Smartphone, Wallet, Building2 } from "lucide-react";
import { formatCurrency } from "@/lib/utils";

interface CustomerDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  customer?: Customer | null;
}

export function CustomerDialog({ open, onOpenChange, customer }: CustomerDialogProps) {
  const isEditing = !!customer;
  const createMutation = useCreateCustomer();
  const updateMutation = useUpdateCustomer();

  const [formData, setFormData] = useState<Partial<Customer>>({
    name: "",
    email: "",
    phone: "",
    address: "",
  });

  const { data: allSales = [] } = useAllSales();
  const receivePaymentMutation = useReceivePayment();
  const customerSales = isEditing && customer ? allSales.filter(sale => sale.customerId === customer.id || sale.customerName === customer.name) : [];
  
  const [payModal, setPayModal] = useState<{ open: boolean, sale: any }>({ open: false, sale: null });
  const [payAmount, setPayAmount] = useState<string>("");
  const [payMethod, setPayMethod] = useState<string>("Cash");

  useEffect(() => {
    if (open) {
      if (customer) {
        setFormData(customer);
      } else {
        setFormData({
          name: "",
          email: "",
          phone: "",
          address: "",
        });
      }
    }
  }, [open, customer]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isEditing && customer) {
      updateMutation.mutate({ id: customer.id, data: formData }, {
        onSuccess: () => onOpenChange(false)
      });
    } else {
      createMutation.mutate(formData as Omit<Customer, "id" | "totalSpent" | "loyaltyPoints" | "lastVisit">, {
        onSuccess: () => onOpenChange(false)
      });
    }
  };

  const isPending = createMutation.isPending || updateMutation.isPending;

  return (
    <>
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>{isEditing ? "Edit Customer" : "Add Customer"}</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name" className="text-right">Name</Label>
              <Input 
                id="name" 
                value={formData.name || ""} 
                onChange={e => setFormData({...formData, name: e.target.value})} 
                className="col-span-3" 
                required 
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="phone" className="text-right">Phone</Label>
              <Input 
                id="phone" 
                value={formData.phone || ""} 
                onChange={e => setFormData({...formData, phone: e.target.value})} 
                className="col-span-3" 
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="address" className="text-right">Address</Label>
              <Input 
                id="address" 
                value={formData.address || ""} 
                onChange={e => setFormData({...formData, address: e.target.value})} 
                className="col-span-3" 
              />
            </div>
          </div>
          
          {isEditing && customer && (
            <div className="mt-4 border-t border-border/50 pt-4">
              <div className="grid grid-cols-2 gap-2 mb-4 bg-muted/20 p-3 rounded-lg border">
                <div>
                  <p className="text-xs text-muted-foreground">Outstanding Balance</p>
                  <p className="font-bold text-destructive">{formatCurrency(customer.outstandingCredit)}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Total Spent</p>
                  <p className="font-bold text-emerald-500">{formatCurrency(customer.totalSpent)}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Pending Invoices</p>
                  <p className="font-medium">{customerSales.filter(s => s.pendingAmount > 0).length}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Loyalty Points</p>
                  <p className="font-medium">{customer.loyaltyPoints || 0}</p>
                </div>
              </div>
              <h3 className="font-semibold mb-3">Order History</h3>
              <div className="space-y-3 max-h-40 overflow-y-auto pr-2">
                {customerSales.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-4">No recent orders</p>
                ) : (
                  customerSales.map(sale => (
                    <div key={sale.id} className="flex flex-col gap-2 bg-muted/30 p-3 rounded-lg border border-border/50">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium">{sale.billNumber}</p>
                          <p className="text-xs text-muted-foreground">{new Date(sale.date).toLocaleDateString()}</p>
                        </div>
                        <div className="text-right flex flex-col items-end">
                          <p className="text-sm font-bold text-primary">{formatCurrency(sale.totalAmount)}</p>
                          <div className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[9px] font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 border-transparent ${sale.status === 'Paid' ? 'bg-secondary text-secondary-foreground' : 'bg-destructive/10 text-destructive'}`}>
                            {sale.status}
                          </div>
                        </div>
                      </div>
                      {sale.pendingAmount > 0 && (
                        <div className="flex justify-between items-center mt-2 pt-2 border-t border-border/50">
                          <p className="text-xs font-medium text-destructive">Pending: {formatCurrency(sale.pendingAmount)}</p>
                          <Button 
                            type="button" 
                            size="sm" 
                            className="h-7 text-xs" 
                            onClick={() => {
                              setPayModal({ open: true, sale });
                              setPayAmount(sale.pendingAmount.toString());
                              setPayMethod("Cash");
                            }}
                          >
                            Receive Payment
                          </Button>
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isPending}>
              Cancel
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending ? "Saving..." : "Save Customer"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>

    {/* Receive Payment Modal */}
    {payModal.sale && (
      <Dialog open={payModal.open} onOpenChange={(open) => setPayModal(prev => ({ ...prev, open }))}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Receive Payment</DialogTitle>
          </DialogHeader>
          <div className="py-4 space-y-4">
            <div className="bg-muted/50 p-4 rounded-xl border border-border/50">
              <p className="text-sm text-muted-foreground mb-1">Invoice: {payModal.sale.billNumber}</p>
              <div className="flex justify-between items-end">
                <p className="text-xs font-medium">Pending Amount:</p>
                <p className="text-2xl font-bold text-destructive">{formatCurrency(payModal.sale.pendingAmount)}</p>
              </div>
            </div>
            
            <div className="space-y-2">
              <Label>Amount to Collect (₹)</Label>
              <Input 
                type="number" 
                value={payAmount} 
                onChange={e => setPayAmount(e.target.value)} 
                className="text-lg h-12"
              />
            </div>

            <div className="space-y-2">
              <Label>Payment Method</Label>
              <div className="grid grid-cols-2 gap-2">
                {["Cash", "Card", "UPI", "Bank Transfer", "Wallet"].map(method => (
                  <Button 
                    key={method}
                    type="button" 
                    variant={payMethod === method ? "default" : "outline"}
                    onClick={() => setPayMethod(method)}
                    className="h-10 justify-start"
                  >
                    {method === "Cash" && <Banknote className="mr-2 h-4 w-4" />}
                    {method === "Card" && <CreditCard className="mr-2 h-4 w-4" />}
                    {method === "UPI" && <Smartphone className="mr-2 h-4 w-4" />}
                    {method === "Bank Transfer" && <Building2 className="mr-2 h-4 w-4" />}
                    {method === "Wallet" && <Wallet className="mr-2 h-4 w-4" />}
                    {method}
                  </Button>
                ))}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setPayModal({ open: false, sale: null })} disabled={receivePaymentMutation.isPending}>
              Cancel
            </Button>
            <Button 
              onClick={() => {
                const amt = parseFloat(payAmount);
                if (!amt || amt <= 0 || amt > payModal.sale.pendingAmount) return;
                receivePaymentMutation.mutate({
                  saleId: payModal.sale.id,
                  amount: amt,
                  method: payMethod
                }, {
                  onSuccess: () => setPayModal({ open: false, sale: null })
                });
              }}
              disabled={receivePaymentMutation.isPending || !parseFloat(payAmount) || parseFloat(payAmount) <= 0 || parseFloat(payAmount) > payModal.sale.pendingAmount}
            >
              {receivePaymentMutation.isPending ? "Processing..." : "Confirm Collection"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    )}
    </>
  );
}
