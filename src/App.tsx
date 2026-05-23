import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import Login from "./pages/auth/Login";
import Signup from "./pages/auth/Signup";
import ForgotPassword from "./pages/auth/ForgotPassword";
import Onboarding from "./pages/auth/Onboarding";
import Dashboard from "./pages/Dashboard";
import Assets from "./pages/Assets";
import Issues from "./pages/Issues";
import Reports from "./pages/Reports";
import ReportIssue from "./pages/ReportIssue";
import Settings from "./pages/Settings";
import NotFound from "./pages/NotFound";
import AdminDashboard from "./pages/AdminDashboard";
import AssetTypes from "./pages/AssetTypes";
import CompleteClaim from "./pages/CompleteClaim";
import OwnerDashboard from "./pages/OwnerDashboard";
import EditBusinessProfile from "./pages/EditBusinessProfile";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Don't refetch every time the user switches tabs and comes back.
      // The data isn't real-time critical and refetching causes skeleton flashes.
      refetchOnWindowFocus: false,
      // Keep data fresh for 1 minute before considering it stale. This prevents
      // re-fetches from happening between page transitions in the same session.
      staleTime: 60_000,
    },
  },
});

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, organization, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Check for email verification
  if (!user.email_confirmed_at) {
    return (
      <div className="flex min-h-screen items-center justify-center flex-col gap-4 p-4 text-center">
        <h1 className="text-2xl font-bold">Email Verification Required</h1>
        <p className="text-muted-foreground">Please check your email to verify your account before continuing.</p>
        <button
          onClick={() => window.location.reload()}
          className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
        >
          I've verified my email
        </button>
      </div>
    );
  }

  if (!organization) {
    return <Navigate to="/onboarding" replace />;
  }

  return <>{children}</>;
}

function AdminRoute({ children }: { children: React.ReactNode }) {
  const { user, isAdmin, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    );
  }

  if (!user || !isAdmin) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <div className="qresolve-theme">
            <Routes>
              <Route path="/" element={<Navigate to="/login" replace />} />
              <Route path="/login" element={<Login />} />
              <Route path="/signup" element={<Signup />} />
              <Route path="/forgot-password" element={<ForgotPassword />} />
              <Route path="/onboarding" element={<Onboarding />} />
              <Route path="/report/:assetId" element={<ReportIssue />} />
              <Route path="/admin" element={<AdminRoute><AdminDashboard /></AdminRoute>} />
              <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
              <Route path="/owner-dashboard" element={<ProtectedRoute><OwnerDashboard /></ProtectedRoute>} />
              <Route path="/edit-business-profile" element={<ProtectedRoute><EditBusinessProfile /></ProtectedRoute>} />
              <Route path="/assets" element={<ProtectedRoute><Assets /></ProtectedRoute>} />
              <Route path="/asset-types" element={<ProtectedRoute><AssetTypes /></ProtectedRoute>} />
              <Route path="/issues" element={<ProtectedRoute><Issues /></ProtectedRoute>} />
              <Route path="/reports" element={<ProtectedRoute><Reports /></ProtectedRoute>} />
              <Route path="/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />
              <Route path="/complete-claim" element={
                <div className="qresolve-theme">
                  <div className="min-h-screen bg-background">
                    <CompleteClaim />
                  </div>
                </div>
              } />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </div>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
