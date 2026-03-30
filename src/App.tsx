import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/hooks/useAuth";
import ProtectedRoute from "@/components/ProtectedRoute";
import Index from "./pages/Index";
import MenuPage from "./pages/MenuPage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import NewOrderPage from "./pages/NewOrderPage";
import OrderConfirmationPage from "./pages/OrderConfirmationPage";
import OrderHistoryPage from "./pages/OrderHistoryPage";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminOrdersPage from "./pages/admin/AdminOrdersPage";
import AdminDeliveriesPage from "./pages/admin/AdminDeliveriesPage";
import AdminClientsPage from "./pages/admin/AdminClientsPage";
import AdminMenuPage from "./pages/admin/AdminMenuPage";
import AdminConfigPage from "./pages/admin/AdminConfigPage";
import NataliaPanel from "./pages/admin/NataliaPanel";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <AuthProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/menu" element={<MenuPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/registro" element={<RegisterPage />} />
            <Route path="/pedido/nuevo" element={<ProtectedRoute allowedRoles={['cliente']}><NewOrderPage /></ProtectedRoute>} />
            <Route path="/pedido/confirmacion" element={<ProtectedRoute allowedRoles={['cliente']}><OrderConfirmationPage /></ProtectedRoute>} />
            <Route path="/pedido/historial" element={<ProtectedRoute allowedRoles={['cliente']}><OrderHistoryPage /></ProtectedRoute>} />
            <Route path="/admin" element={<ProtectedRoute allowedRoles={['superadmin']}><AdminDashboard /></ProtectedRoute>} />
            <Route path="/admin/pedidos" element={<ProtectedRoute allowedRoles={['superadmin', 'admin_adjunto']}><AdminOrdersPage /></ProtectedRoute>} />
            <Route path="/admin/repartos" element={<ProtectedRoute allowedRoles={['superadmin', 'admin_adjunto']}><AdminDeliveriesPage /></ProtectedRoute>} />
            <Route path="/admin/clientes" element={<ProtectedRoute allowedRoles={['superadmin']}><AdminClientsPage /></ProtectedRoute>} />
            <Route path="/admin/menu" element={<ProtectedRoute allowedRoles={['superadmin']}><AdminMenuPage /></ProtectedRoute>} />
            <Route path="/admin/configuracion" element={<ProtectedRoute allowedRoles={['superadmin']}><AdminConfigPage /></ProtectedRoute>} />
            <Route path="/natalia" element={<ProtectedRoute allowedRoles={['admin_adjunto']}><NataliaPanel /></ProtectedRoute>} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
