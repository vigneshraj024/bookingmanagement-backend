import { useState, useEffect } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom"; // 👈 added Navigate
import { LoginForm } from "@/components/auth/LoginForm";
import { Dashboard } from "@/pages/Dashboard";
import { Admin } from "@/types/booking";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentAdmin, setCurrentAdmin] = useState<Admin | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      // For custom API authentication, check if user is logged in
      // You could check localStorage, sessionStorage, or make an API call
      const isLoggedIn = localStorage.getItem('isAuthenticated') === 'true';
      const storedAdmin = localStorage.getItem('currentAdmin');
      
      if (isLoggedIn && storedAdmin) {
        setCurrentAdmin(JSON.parse(storedAdmin));
        setIsAuthenticated(true);
      }
    } catch (error) {
      console.error("Auth check failed:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleLoginSuccess = async () => {
    // For custom API authentication, we'll create a mock admin object
    // In a real app, you'd get this from your API response or localStorage
    const mockAdmin: Admin = {
      id: "1",
      name: "Admin User",
      email: "admin@sportsbooking.com"
    };
    
    // Store authentication state in localStorage
    localStorage.setItem('isAuthenticated', 'true');
    localStorage.setItem('currentAdmin', JSON.stringify(mockAdmin));
    
    setCurrentAdmin(mockAdmin);
    setIsAuthenticated(true);
  };

  const handleSignOut = () => {
    // Clear authentication state from localStorage
    localStorage.removeItem('isAuthenticated');
    localStorage.removeItem('currentAdmin');
    
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

    {/* Not found */}
    <Route path="*" element={<NotFound />} />
  </Routes>
</BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
