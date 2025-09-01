import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import Index from "./pages/Index";
import { AuthPage } from "./pages/AuthPage";
import { Overview } from "./pages/dashboard/Overview";
import { Visitors } from "./pages/dashboard/Visitors";
import { PageViews } from "./pages/dashboard/PageViews";
import { Sources } from "./pages/dashboard/Sources";
import { RealTime } from "./pages/dashboard/RealTime";
import { ABTesting } from "./pages/dashboard/ABTesting";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/auth" element={<AuthPage />} />
            <Route path="/dashboard" element={<DashboardLayout><Overview /></DashboardLayout>} />
            <Route path="/dashboard/visitors" element={<DashboardLayout><Visitors /></DashboardLayout>} />
            <Route path="/dashboard/pageviews" element={<DashboardLayout><PageViews /></DashboardLayout>} />
            <Route path="/dashboard/sources" element={<DashboardLayout><Sources /></DashboardLayout>} />
            <Route path="/dashboard/realtime" element={<DashboardLayout><RealTime /></DashboardLayout>} />
            <Route path="/dashboard/ab-testing" element={<DashboardLayout><ABTesting /></DashboardLayout>} />
            <Route path="/dashboard/benchmarks" element={<DashboardLayout><div>Benchmarks coming soon</div></DashboardLayout>} />
            <Route path="/dashboard/ai-assistant" element={<DashboardLayout><div>AI Assistant coming soon</div></DashboardLayout>} />
            <Route path="/dashboard/carbon" element={<DashboardLayout><div>Carbon Impact coming soon</div></DashboardLayout>} />
            <Route path="/dashboard/settings" element={<DashboardLayout><div>Settings coming soon</div></DashboardLayout>} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
