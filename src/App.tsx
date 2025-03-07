import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { useAuthStore } from './store/auth';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Layout from './components/Layout';
import { ThemeProvider } from './components/ThemeProvider';

// Placeholder for routes that don't have components yet
const PlaceholderPage = () => (
  <div className="p-6 glass-card">
    <h1 className="text-2xl font-bold mb-4">Page Under Construction</h1>
    <p>This feature is coming soon. Please check back later.</p>
  </div>
);

function App() {
  const { user, isLoading } = useAuthStore();

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
        <div className="min-h-screen bg-gradient-radial from-primary/20 via-background to-background overflow-x-hidden">
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/" element={<Layout />}>
              <Route index element={<Dashboard />} />
              {/* Department Head routes */}
              <Route path="department-analytics" element={<PlaceholderPage />} />
              <Route path="approvals-management" element={<PlaceholderPage />} />
              <Route path="reporting-strategy" element={<PlaceholderPage />} />
              {/* Admin Staff routes */}
              <Route path="user-management" element={<PlaceholderPage />} />
              <Route path="audit-logs" element={<PlaceholderPage />} />
              <Route path="resource-allocation" element={<PlaceholderPage />} />
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
          </Routes>
        </div>
        <Toaster 
          position="top-right"
          toastOptions={{
            duration: 3000,
            className: 'glass-morphism',
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