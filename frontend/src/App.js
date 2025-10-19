import React, { Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './contexts/AuthContext';
import { AuthProvider } from './contexts/AuthContext';
import { Toaster } from 'sonner';
import './App.css';

// Lazy load components for better performance
const LoginPage = lazy(() => import('./components/auth/LoginPage'));
const AdminLoginPage = lazy(() => import('./components/auth/AdminLoginPage'));
const PendingApproval = lazy(() => import('./components/auth/PendingApproval'));
const AdminDashboard = lazy(() => import('./components/admin/AdminDashboard'));
const StudentDashboard = lazy(() => import('./components/student/StudentDashboard'));
const ExamInterface = lazy(() => import('./components/exam/ExamInterface'));

// Protected Route Component
const ProtectedRoute = ({ children, allowedRoles = [], isAdminRoute = false }) => {
  const { user, userRole, loading, refreshDemoMode } = useAuth();

  // Refresh demo mode on route changes if no user but demo mode exists
  React.useEffect(() => {
    if (!user && !loading) {
      const storedDemoMode = localStorage.getItem('demoMode');
      if (storedDemoMode) {
        refreshDemoMode();
      }
    }
  }, [user, loading, refreshDemoMode]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (!user) {
    // Check for demo mode before redirecting to login
    const storedDemoMode = localStorage.getItem('demoMode');
    if (storedDemoMode) {
      // Wait for refreshDemoMode to complete
      return (
        <div className="min-h-screen flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
        </div>
      );
    }
    // Redirect to admin login if accessing admin route, otherwise to student login
    return <Navigate to={isAdminRoute ? "/admin/login" : "/login"} replace />;
  }

  if (allowedRoles.length > 0 && !allowedRoles.includes(userRole)) {
    if (userRole === 'pending') {
      return <Navigate to="/pending" replace />;
    }
    // If admin trying to access student route, redirect to admin
    if (userRole === 'admin' && !isAdminRoute) {
      return <Navigate to="/admin" replace />;
    }
    // If student trying to access admin route, redirect to login
    if (userRole === 'student' && isAdminRoute) {
      return <Navigate to="/login" replace />;
    }
    return <Navigate to="/unauthorized" replace />;
  }

  return children;
};

// Loading Component
const LoadingScreen = () => (
  <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
    <div className="flex flex-col items-center space-y-4">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      <p className="text-gray-600 font-medium">Loading IELTS Platform...</p>
    </div>
  </div>
);

// Root Redirect Component - handles demo modes
const RootRedirect = () => {
  const { user, userRole, loading } = useAuth();

  if (loading) {
    return <LoadingScreen />;
  }

  if (user) {
    // User is authenticated, redirect based on role
    if (userRole === 'admin') {
      return <Navigate to="/admin" replace />;
    } else if (userRole === 'student') {
      return <Navigate to="/student" replace />;
    } else if (userRole === 'pending') {
      return <Navigate to="/pending" replace />;
    }
  }

  // Not authenticated, redirect to student login
  return <Navigate to="/login" replace />;
};

// Admin Route Redirect Component - handles /admin redirect
const AdminRouteRedirect = () => {
  const { user, userRole, loading } = useAuth();

  if (loading) {
    return <LoadingScreen />;
  }

  if (user && userRole === 'admin') {
    // Admin user, allow access to admin dashboard
    return <Navigate to="/admin/dashboard" replace />;
  }

  // Not authenticated or not admin, redirect to admin login
  return <Navigate to="/admin/login" replace />;
};

// Main App Component
function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <div className="App min-h-screen bg-gray-50">
          <Suspense fallback={<LoadingScreen />}>
            <Routes>
              {/* Public Routes */}
              <Route path="/login" element={<LoginPage />} />
              <Route path="/admin/login" element={<AdminLoginPage />} />
              <Route path="/admin" element={<AdminRouteRedirect />} />

              {/* Pending Approval Route */}
              <Route
                path="/pending"
                element={
                  <ProtectedRoute>
                    <PendingApproval />
                  </ProtectedRoute>
                }
              />

              {/* Admin Routes */}
              <Route
                path="/admin/*"
                element={
                  <ProtectedRoute allowedRoles={['admin']} isAdminRoute={true}>
                    <AdminDashboard />
                  </ProtectedRoute>
                }
              />
              
              {/* Student Routes */}
              <Route 
                path="/student/*" 
                element={
                  <ProtectedRoute allowedRoles={['student']}>
                    <StudentDashboard />
                  </ProtectedRoute>
                } 
              />
              
              {/* Exam Interface */}
              <Route 
                path="/exam/:examId" 
                element={
                  <ProtectedRoute allowedRoles={['student']}>
                    <ExamInterface />
                  </ProtectedRoute>
                } 
              />
              
              {/* Root Redirect */}
              <Route path="/" element={<RootRedirect />} />
              
              {/* Catch All - Redirect to Login */}
              <Route path="*" element={<Navigate to="/login" replace />} />
            </Routes>
          </Suspense>
          
          {/* Global Toast Notifications */}
          <Toaster 
            position="top-right"
            expand={true}
            richColors={true}
            closeButton={true}
          />
        </div>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
