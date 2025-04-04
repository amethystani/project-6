import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { useAuthStore } from './store/auth';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Layout from './components/Layout';
import { ThemeProvider } from './components/ThemeProvider';
import Onboarding from './components/Onboarding';
import Landing from './pages/Landing';
import ApprovalsManagement from './pages/head/ApprovalsManagement';
import ResourceAllocation from './pages/admin/ResourceAllocation';

// Placeholder for routes that don't have components yet
const PlaceholderPage = () => (
  <div className="p-6 glass-card">
    <h1 className="text-2xl font-bold mb-4">Page Under Construction</h1>
    <p>This feature is coming soon. Please check back later.</p>
  </div>
);

// Auth protected route component
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, isLoading } = useAuthStore();
  
  if (isLoading) return null;
  
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  
  return <>{children}</>;
};

// Memoize InitAuth to prevent recreation on every render
const MemoizedInitAuth = React.memo(() => {
  const { verifyToken } = useAuthStore();
  const isVerifyingRef = React.useRef(false);
  
  useEffect(() => {
    // Only verify once on mount
    const verifyOnMount = async () => {
      const token = localStorage.getItem('token');
      if (token && !isVerifyingRef.current) {
        isVerifyingRef.current = true;
        console.log('Initial token verification...');
        await verifyToken();
        isVerifyingRef.current = false;
      }
    };
    
    verifyOnMount();
    
    // Set up periodic token verification (every 15 minutes)
    const intervalId = setInterval(async () => {
      const currentToken = localStorage.getItem('token');
      if (currentToken && !isVerifyingRef.current) {
        isVerifyingRef.current = true;
        console.log('Refreshing authentication...');
        await verifyToken();
        isVerifyingRef.current = false;
      }
    }, 15 * 60 * 1000); // 15 minutes
    
    return () => clearInterval(intervalId);
  }, []); // Empty dependency array to run only once
  
  return null;
});

function App() {
  const { user, isLoading } = useAuthStore();
  const [showOnboarding, setShowOnboarding] = useState(false);

  useEffect(() => {
    // Check if user is logged in and if onboarding has been completed
    if (user && !localStorage.getItem('onboarding_completed')) {
      setShowOnboarding(true);
    }
  }, [user]);

  const handleOnboardingComplete = () => {
    setShowOnboarding(false);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-radial from-primary/20 via-background to-background">
        <div className="flex flex-col items-center">
          <div className="animate-spin rounded-full h-12 w-12 sm:h-16 sm:w-16 md:h-24 md:w-24 border-b-2 border-primary" />
          <p className="mt-4 text-foreground/70 animate-pulse">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <ThemeProvider>
      <Router>
        <MemoizedInitAuth />
        <div className="min-h-screen overflow-x-hidden">
          {showOnboarding && user && (
            <Onboarding 
              role={user.role} 
              onComplete={handleOnboardingComplete} 
            />
          )}
          <Routes>
            {/* Public routes */}
            <Route path="/" element={<Landing />} />
            <Route path="/login" element={user ? <Navigate to="/dashboard" replace /> : <Login />} />
            
            {/* Protected routes */}
            <Route path="/dashboard" element={
              <ProtectedRoute>
                <Layout />
              </ProtectedRoute>
            }>
              <Route index element={<Dashboard />} />
              {/* Department Head routes */}
              <Route path="department-analytics" element={<PlaceholderPage />} />
              <Route path="approvals-management" element={<ApprovalsManagement />} />
              <Route path="reporting-strategy" element={<PlaceholderPage />} />
              {/* Admin Staff routes */}
              <Route path="user-management" element={<PlaceholderPage />} />
              <Route path="audit-logs" element={<PlaceholderPage />} />
              <Route path="resource-allocation" element={<ResourceAllocation />} />
              <Route path="system-settings" element={<PlaceholderPage />} />
              {/* Faculty routes */}
              <Route path="course-management" element={<PlaceholderPage />} />
              <Route path="grade-entry" element={<PlaceholderPage />} />
              <Route path="faculty-analytics" element={<PlaceholderPage />} />
              {/* Student routes */}
              <Route path="course-registration" element={<PlaceholderPage />} />
              <Route path="assignment-management" element={<PlaceholderPage />} />
              <Route path="academic-records" element={<PlaceholderPage />} />
              <Route path="schedule" element={<PlaceholderPage />} />
            </Route>
            
            {/* Redirect for authenticated users */}
            <Route 
              path="*" 
              element={user ? <Navigate to="/dashboard" replace /> : <Navigate to="/" replace />} 
            />
          </Routes>
        </div>
        <Toaster 
          position="top-right"
          toastOptions={{
            duration: 3000,
            className: 'bg-background border border-border',
            style: {
              borderRadius: '0.5rem',
              padding: '0.75rem 1rem',
            }
          }}
        />
      </Router>
    </ThemeProvider>
  );
}

export default App;