import { useState, useEffect } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { LoginForm } from "@/components/auth/LoginForm";
import { Dashboard } from "@/pages/Dashboard";
import { Admin } from "@/types/booking";
import NotFound from "./pages/NotFound";
import { authService } from "@/lib/auth";
import { AuditLogsPage } from "@/pages/AuditLogs";
import { PriceMasterPage } from "@/pages/PriceMaster";

const queryClient = new QueryClient();

const App = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentAdmin, setCurrentAdmin] = useState<Admin | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let unsub: any;
    const init = async () => {
      await checkAuthStatus();
      const sub = authService.onAuthStateChange(async () => {
        await checkAuthStatus();
      });
      unsub = sub.unsubscribe;
    };
    init();
    return () => {
      if (typeof unsub === 'function') unsub();
    };
  }, []);

  const checkAuthStatus = async () => {
    try {
      const user = await authService.getCurrentUser();
      if (user) {
        setCurrentAdmin(user);
        setIsAuthenticated(true);
      } else {
        setCurrentAdmin(null);
        setIsAuthenticated(false);
      }
    } catch (error) {
      console.error("Auth check failed:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleLoginSuccess = async () => {
    await checkAuthStatus();
  };

  const handleSignOut = () => {
    authService.signOut();
    setCurrentAdmin(null);
    setIsAuthenticated(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        
<BrowserRouter>
  <Routes>
    {/* Login route */}
    <Route
      path="/"
      element={
        isAuthenticated && currentAdmin ? (
          <Navigate to="/dashboard" replace /> // redirect if logged in
        ) : (
          <LoginForm onSuccess={handleLoginSuccess} />
        )
      }
    />

    {/* Dashboard route */}
    <Route
      path="/dashboard"
      element={
        isAuthenticated && currentAdmin ? (
          <Dashboard admin={currentAdmin} onSignOut={handleSignOut} />
        ) : (
          <Navigate to="/" replace /> // redirect if not logged in
        )
      }
    />

    {/* Audit Logs route */}
    <Route
      path="/audit-logs"
      element={
        isAuthenticated && currentAdmin ? (
          <AuditLogsPage />
        ) : (
          <Navigate to="/" replace />
        )
      }
    />

    {/* Price Master route */}
    <Route
      path="/price-master"
      element={
        isAuthenticated && currentAdmin ? (
          <PriceMasterPage />
        ) : (
          <Navigate to="/" replace />
        )
      }
    />

    {/* Not found */}
    <Route path="*" element={<NotFound />} />
  </Routes>
</BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
