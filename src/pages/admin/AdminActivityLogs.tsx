import { motion } from "framer-motion";
import { Activity, User, Monitor, LogIn, Edit, Trash2, Loader2, AlertCircle } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/services/api";

interface ActivityLog {
  id: string;
  action: string;
  user_name: string;
  details: string;
  date: string;
}

export default function AdminActivityLogs() {
  const { data: logs, isLoading, error } = useQuery({
    queryKey: ['activity_logs'],
    queryFn: async () => {
      const res = await api.get('/activity_logs');
      return res.data as ActivityLog[];
    }
  });

  const getIcon = (action: string) => {
    if (action.includes("Login")) return LogIn;
    if (action.includes("Update") || action.includes("Edit")) return Edit;
    if (action.includes("Delete") || action.includes("Remove")) return Trash2;
    return Activity;
  };

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Activity Logs</h1>
        <p className="text-muted-foreground">Audit trail of system and user actions</p>
      </div>

      <div className="glass-panel p-6 rounded-2xl">
        <div className="rounded-xl border border-border/50 overflow-hidden bg-background/50">
          <div className="overflow-x-auto w-full">
            <table className="w-full text-sm text-left min-w-[500px] md:min-w-full">
              <thead className="bg-muted/50 text-muted-foreground font-medium border-b border-border/50">
                <tr>
                  <th className="px-4 md:px-6 py-4">Action</th>
                  <th className="px-4 md:px-6 py-4">User</th>
                  <th className="px-4 md:px-6 py-4 hidden sm:table-cell">Details</th>
                  <th className="px-4 md:px-6 py-4 text-right">Timestamp</th>
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  <tr>
                    <td colSpan={4} className="text-center py-8 text-muted-foreground">
                      <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2" />
                      Loading logs...
                    </td>
                  </tr>
                ) : error ? (
                  <tr>
                    <td colSpan={4} className="text-center py-8 text-destructive">
                      <AlertCircle className="w-6 h-6 mx-auto mb-2" />
                      Failed to load logs
                    </td>
                  </tr>
                ) : logs?.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="text-center py-8 text-muted-foreground">
                      No activity logs found.
                    </td>
                  </tr>
                ) : logs?.map((log) => {
                  const Icon = getIcon(log.action);
                  return (
                    <tr key={log.id} className="border-b border-border/50 hover:bg-muted/20 transition-colors">
                      <td className="px-4 md:px-6 py-4 font-medium flex items-center gap-3 whitespace-nowrap">
                        <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary shrink-0">
                          <Icon className="h-4 w-4" />
                        </div>
                        {log.action}
                      </td>
                      <td className="px-4 md:px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <User className="h-4 w-4 text-muted-foreground shrink-0" /> <span className="truncate">{log.user_name || "System"}</span>
                        </div>
                      </td>
                      <td className="px-4 md:px-6 py-4 text-muted-foreground hidden sm:table-cell whitespace-nowrap">{log.details}</td>
                      <td className="px-4 md:px-6 py-4 text-right text-muted-foreground whitespace-nowrap">{new Date(log.date).toLocaleString()}</td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
