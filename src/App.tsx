import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider, useAuth } from "@/lib/auth-context";
import { DashboardLayout } from "@/components/DashboardLayout";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import TrackingPage from "./pages/TrackingPage";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminOrders from "./pages/admin/AdminOrders";
import AdminMitra from "./pages/admin/AdminMitra";
import AdminReports from "./pages/admin/AdminReports";
import AdminExpenses from "./pages/admin/AdminExpenses";
import AdminSettings from "./pages/admin/AdminSettings";
import AdminAccounts from "./pages/admin/AdminAccounts";
import AdminInventory from "./pages/admin/AdminInventory";
import StaffDashboard from "./pages/StaffDashboard";
import MitraDashboard from "./pages/mitra/MitraDashboard";
import MitraNewOrder from "./pages/mitra/MitraNewOrder";
import MitraOrders from "@/pages/mitra/MitraOrders";
import OrderDetailPage from "@/pages/mitra/OrderDetailPage";
import MitraSettings from "@/pages/mitra/MitraSettings";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

function ProtectedRoute({ children, role }: { children: React.ReactNode; role?: 'admin' | 'mitra' | 'staff' }) {
  const { isAuthenticated, user } = useAuth();
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (role && user?.role !== role) {
    const defaultPath = user?.role === 'admin' ? '/admin' : user?.role === 'staff' ? '/staff' : '/mitra';
    return <Navigate to={defaultPath} replace />;
  }
  return <DashboardLayout>{children}</DashboardLayout>;
}

function AuthRedirect() {
  const { isAuthenticated, user } = useAuth();
  if (isAuthenticated) {
    const defaultPath = user?.role === 'admin' ? '/admin' : user?.role === 'staff' ? '/staff' : '/mitra';
    return <Navigate to={defaultPath} replace />;
  }
  return <LoginPage />;
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <AuthProvider>
        <BrowserRouter 
          future={{ 
            v7_startTransition: true, 
            v7_relativeSplatPath: true,
          }}
        >
          <Routes>
            <Route path="/" element={<TrackingPage />} />
            <Route path="/tracking" element={<TrackingPage />} />
            <Route path="/login" element={<AuthRedirect />} />
            <Route path="/register" element={<RegisterPage />} />

            <Route path="/admin" element={<ProtectedRoute role="admin"><AdminDashboard /></ProtectedRoute>} />
            <Route path="/admin/orders" element={<ProtectedRoute role="admin"><AdminOrders /></ProtectedRoute>} />
            <Route path="/admin/mitra" element={<ProtectedRoute role="admin"><AdminMitra /></ProtectedRoute>} />
            <Route path="/admin/reports" element={<ProtectedRoute role="admin"><AdminReports /></ProtectedRoute>} />
            <Route path="/admin/expenses" element={<ProtectedRoute role="admin"><AdminExpenses /></ProtectedRoute>} />
            <Route path="/admin/accounts" element={<ProtectedRoute role="admin"><AdminAccounts /></ProtectedRoute>} />
            <Route path="/admin/inventory" element={<ProtectedRoute role="admin"><AdminInventory /></ProtectedRoute>} />
            <Route path="/admin/settings" element={<ProtectedRoute role="admin"><AdminSettings /></ProtectedRoute>} />

            <Route path="/staff" element={<ProtectedRoute role="staff"><StaffDashboard /></ProtectedRoute>} />

            <Route path="/mitra" element={<ProtectedRoute role="mitra"><MitraDashboard /></ProtectedRoute>} />
            <Route path="/mitra/new-order" element={<ProtectedRoute role="mitra"><MitraNewOrder /></ProtectedRoute>} />
            <Route path="/mitra/orders" element={<ProtectedRoute role="mitra"><MitraOrders /></ProtectedRoute>} />
            <Route path="/mitra/orders/:orderId" element={<ProtectedRoute role="mitra"><OrderDetailPage /></ProtectedRoute>} />
            <Route path="/mitra/settings" element={<ProtectedRoute role="mitra"><MitraSettings /></ProtectedRoute>} />

            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;