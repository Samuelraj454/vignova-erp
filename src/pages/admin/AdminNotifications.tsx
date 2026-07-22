import { motion } from "framer-motion";
import { Bell, AlertTriangle, Package, CheckCircle2, Info } from "lucide-react";
import { useNotifications, useMarkAllNotificationsRead } from "@/hooks/useSystem";
import { useNavigate } from "react-router-dom";

export default function AdminNotifications() {
  const { data: notifications = [], isLoading } = useNotifications();
  const markAllReadMutation = useMarkAllNotificationsRead();
  const navigate = useNavigate();

  const getIcon = (type: string) => {
    switch(type) {
      case 'warning': return <Package className="h-5 w-5 text-amber-500" />;
      case 'success': return <CheckCircle2 className="h-5 w-5 text-emerald-500" />;
      case 'error': return <AlertTriangle className="h-5 w-5 text-rose-500" />;
      default: return <Info className="h-5 w-5 text-blue-500" />;
    }
  };

  const handleMarkAllRead = () => {
    markAllReadMutation.mutate();
  };

  const handleNotificationClick = (notif: any) => {
    const text = (notif.title + " " + notif.message).toLowerCase();
    
    if (text.includes("stock") || text.includes("inventory") || text.includes("low")) {
      navigate("/admin/inventory");
    } else if (text.includes("payment") || text.includes("sale") || text.includes("order") || text.includes("credit")) {
      navigate("/admin");
    } else if (text.includes("product")) {
      navigate("/admin/products");
    } else if (text.includes("customer")) {
      navigate("/admin/customers");
    } else if (text.includes("expense")) {
      navigate("/admin/expenses");
    }
  };

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6 max-w-4xl mx-auto">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Notifications</h1>
          <p className="text-muted-foreground">System alerts and updates</p>
        </div>
        <button 
          onClick={handleMarkAllRead} 
          disabled={markAllReadMutation.isPending || notifications.every(n => n.isRead)}
          className="text-sm text-primary font-medium hover:underline disabled:opacity-50 disabled:no-underline"
        >
          {markAllReadMutation.isPending ? "Marking..." : "Mark all as read"}
        </button>
      </div>

      <div className="glass-panel rounded-2xl overflow-hidden divide-y divide-border/50">
        {isLoading ? (
          <div className="p-10 flex justify-center text-muted-foreground">
            <div className="flex flex-col items-center gap-2">
              <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent"></div>
              <span>Loading notifications...</span>
            </div>
          </div>
        ) : notifications.length === 0 ? (
          <div className="p-10 flex flex-col items-center justify-center text-muted-foreground">
            <Bell className="h-10 w-10 opacity-20 mb-4" />
            <p>You're all caught up!</p>
          </div>
        ) : (
          notifications.map((notif) => (
            <div 
              key={notif.id} 
              onClick={() => handleNotificationClick(notif)}
              className={`p-4 sm:p-6 flex items-start gap-4 transition-colors cursor-pointer ${notif.isRead ? 'opacity-70 hover:opacity-100 bg-background/50 hover:bg-muted/50' : 'bg-primary/5 hover:bg-primary/10'}`}
            >
              <div className={`mt-1 h-10 w-10 rounded-full flex items-center justify-center shrink-0 ${
                notif.type === 'warning' ? 'bg-amber-500/10' :
                notif.type === 'success' ? 'bg-emerald-500/10' :
                notif.type === 'error' ? 'bg-rose-500/10' : 'bg-blue-500/10'
              }`}>
                {getIcon(notif.type)}
              </div>
              <div className="flex-1">
                <div className="flex justify-between items-start">
                  <p className="text-foreground font-medium">{notif.title}</p>
                  {!notif.isRead && <span className="h-2 w-2 rounded-full bg-primary mt-1.5 shrink-0" />}
                </div>
                <p className="text-sm text-muted-foreground mt-1">{notif.message}</p>
                <p className="text-xs text-muted-foreground mt-2">{new Date((notif as any).date || (notif as any).timestamp).toLocaleString()}</p>
              </div>
            </div>
          ))
        )}
      </div>
    </motion.div>
  );
}
