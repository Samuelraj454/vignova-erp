import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/sonner";
import { AuthProvider } from "./store/AuthContext";
import { ThemeProvider } from "./store/ThemeContext";
import { ErrorBoundary } from "./components/ErrorBoundary";
import AppRoutes from "./routes/AppRoutes";


const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: false,
      staleTime: 1000 * 60 * 5, // 5 minutes
    },
  },
});

import DeviceSimulator from "./components/ui/DeviceSimulator";
import { startReminderEngine } from "./services/jobs";

// Database seeding is now handled by the backend.


export default function App() {
  console.log("Rendering App.tsx");
    return (
        <ErrorBoundary>
            <QueryClientProvider client={queryClient}>
                <ThemeProvider defaultTheme="system" storageKey="crm-theme">
                    <AuthProvider>
                        <AppRoutes />
                        <Toaster position="top-right" richColors />
                        <DeviceSimulator />
                    </AuthProvider>
                </ThemeProvider>
            </QueryClientProvider>
        </ErrorBoundary>
    );
}
