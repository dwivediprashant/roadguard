import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { ThemeProvider } from "@/components/theme-provider";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import { NotificationProvider } from "@/contexts/NotificationContext";
import { lazy, Suspense } from "react";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import FluidCursor from "@/components/FluidCursor";

const Index = lazy(() => import("./pages/Index"));
const Login = lazy(() => import("./pages/Login"));
const Signup = lazy(() => import("./pages/Signup"));
const Profile = lazy(() => import("./pages/Profile"));
const AdminDashboard = lazy(() => import("./pages/AdminDashboard"));
const WorkerDashboard = lazy(() => import("./pages/WorkerDashboard"));
const WorkerPortal = lazy(() => import("./pages/WorkerPortal"));
const TaskDetail = lazy(() => import("./pages/TaskDetail"));
const WorkshopDashboard = lazy(() => import("./pages/WorkshopDashboard"));
const WorkshopDetail = lazy(() => import("./pages/WorkshopDetail"));
const ServiceRequest = lazy(() => import("./pages/ServiceRequest"));
const UserDashboard = lazy(() => import("./pages/UserDashboard"));
const MyRequests = lazy(() => import("./pages/MyRequests"));
const WorkerTasks = lazy(() => import("./pages/WorkerTasks"));
const AdminLogin = lazy(() => import("./pages/AdminLogin"));
const AdminSignup = lazy(() => import("./pages/AdminSignup"));
const WorkerLogin = lazy(() => import("./pages/WorkerLogin"));
const WorkerSignup = lazy(() => import("./pages/WorkerSignup"));
const ForgotPassword = lazy(() => import("./pages/ForgotPassword"));
const ResetPassword = lazy(() => import("./pages/ResetPassword"));
const VerifyEmail = lazy(() => import("./pages/VerifyEmail"));
const OTPVerification = lazy(() => import("./pages/OTPVerification"));
const WorkerProfile = lazy(() => import("./pages/WorkerProfile"));
const AdminProfile = lazy(() => import("./pages/AdminProfile"));
const NotFound = lazy(() => import("./pages/NotFound"));

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,
      gcTime: 10 * 60 * 1000,
    },
  },
});

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, isLoading } = useAuth();
  
  if (isLoading) {
    return <LoadingSpinner />;
  }
  
  return user ? <>{children}</> : <Navigate to="/login" />;
};

const PublicRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, isLoading } = useAuth();
  

  if (isLoading) {
    return <LoadingSpinner />;
  }
  
  return user ? <Navigate to="/dashboard" /> : <>{children}</>;
};

const DashboardRoute = () => {
  const { user } = useAuth();
  
  if (user?.userType === 'admin') {
    return <AdminDashboard />;
  }
  
  if (user?.userType === 'worker') {
    return <WorkerDashboard />;
  }
  
  if (user?.userType === 'user') {
    return <UserDashboard />;
  }
  
  return <UserDashboard />;
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider defaultTheme="dark" storageKey="roadguard-ui-theme">
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <FluidCursor />
        <AuthProvider>
          <NotificationProvider>
            <BrowserRouter>
            <Suspense fallback={<LoadingSpinner />}>
              <Routes>
                <Route path="/" element={<Index />} />
                <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
                <Route path="/otp-login" element={<OTPVerification />} />
                <Route path="/signup" element={<PublicRoute><Signup /></PublicRoute>} />
                <Route path="/verify-email" element={<PublicRoute><VerifyEmail /></PublicRoute>} />
                <Route path="/forgot-password" element={<ForgotPassword />} />
                <Route path="/reset-password" element={<ResetPassword />} />
                <Route path="/dashboard" element={<ProtectedRoute><DashboardRoute /></ProtectedRoute>} />
                <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
                <Route path="/admin-login" element={<AdminLogin />} />
                <Route path="/admin-signup" element={<AdminSignup />} />
                <Route path="/worker-login" element={<WorkerLogin />} />
                <Route path="/worker-signup" element={<WorkerSignup />} />
                <Route path="/admin" element={<ProtectedRoute><AdminDashboard /></ProtectedRoute>} />
                <Route path="/admin-dashboard" element={<ProtectedRoute><AdminDashboard /></ProtectedRoute>} />
                <Route path="/worker" element={<ProtectedRoute><WorkerPortal /></ProtectedRoute>} />
                <Route path="/worker/tasks/:id" element={<ProtectedRoute><TaskDetail /></ProtectedRoute>} />
                <Route path="/worker-dashboard" element={<ProtectedRoute><WorkerDashboard /></ProtectedRoute>} />
                <Route path="/worker-tasks" element={<ProtectedRoute><WorkerTasks /></ProtectedRoute>} />

                <Route path="/user" element={<ProtectedRoute><UserDashboard /></ProtectedRoute>} />
                <Route path="/user-dashboard" element={<ProtectedRoute><UserDashboard /></ProtectedRoute>} />
                <Route path="/workshops" element={<WorkshopDashboard />} />
                <Route path="/workshop/:workshopId" element={<WorkshopDetail />} />
                <Route path="/worker/:workerId" element={<WorkerProfile />} />
                <Route path="/admin/:adminId" element={<AdminProfile />} />
                <Route path="/service-request/:workshopId" element={<ProtectedRoute><ServiceRequest /></ProtectedRoute>} />
                <Route path="/my-requests" element={<ProtectedRoute><MyRequests /></ProtectedRoute>} />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </Suspense>
            </BrowserRouter>
          </NotificationProvider>
        </AuthProvider>
      </TooltipProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
