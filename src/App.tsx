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
import UserManagement from './pages/admin/UserManagement';
import AuditLogs from './pages/admin/AuditLogs';
import SystemSettings from './pages/admin/SystemSettings';
import CourseManagement from './pages/faculty/CourseManagement';
import GradeEntry from './pages/faculty/GradeEntry';
import FacultyAnalytics from './pages/faculty/FacultyAnalytics';
import FacultySchedule from './pages/faculty/Schedule';
import CourseRegistration from './pages/student/CourseRegistration';
import AssignmentManagement from './pages/student/AssignmentManagement';
import AcademicRecords from './pages/student/AcademicRecords';
import StudentSchedule from './pages/student/Schedule';
import AvailableCourses from './pages/student/AvailableCourses';
import Profile from './pages/Profile';
import DepartmentAnalytics from './pages/head/DepartmentAnalytics';
import ReportingStrategy from './pages/head/ReportingStrategy';
import ApprovalsPolicy from './pages/head/ApprovalsPolicy';
import CourseSubmission from './pages/head/CourseSubmission';
import CourseMaterials from './pages/faculty/CourseMaterials';
import CourseAssignments from './pages/faculty/CourseAssignments';
import CourseRoster from './pages/faculty/CourseRoster';
import CourseAnnouncements from './pages/faculty/CourseAnnouncements';

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
              <Route path="department-analytics" element={<DepartmentAnalytics />} />
              <Route path="approvals-management" element={<ApprovalsManagement />} />
              <Route path="approvals-policy" element={<ApprovalsPolicy />} />
              <Route path="reporting-strategy" element={<ReportingStrategy />} />
              <Route path="course-submission" element={<CourseSubmission />} />
              {/* Admin Staff routes */}
              <Route path="user-management" element={<UserManagement />} />
              <Route path="audit-logs" element={<AuditLogs />} />
              <Route path="resource-allocation" element={<ResourceAllocation />} />
              <Route path="system-settings" element={<SystemSettings />} />
              {/* Faculty routes */}
              <Route path="course-management" element={<CourseManagement />} />
              <Route path="course-management/materials" element={<CourseMaterials />} />
              <Route path="course-management/assignments" element={<CourseAssignments />} />
              <Route path="course-management/roster" element={<CourseRoster />} />
              <Route path="course-management/announcements" element={<CourseAnnouncements />} />
              <Route path="grade-entry" element={<GradeEntry />} />
              <Route path="faculty-analytics" element={<FacultyAnalytics />} />
              <Route path="faculty-schedule" element={<FacultySchedule />} />
              {/* Student routes */}
              <Route path="course-registration" element={<CourseRegistration />} />
              <Route path="available-courses" element={<AvailableCourses />} />
              <Route path="assignment-management" element={<AssignmentManagement />} />
              <Route path="academic-records" element={<AcademicRecords />} />
              <Route path="student-schedule" element={<StudentSchedule />} />
              {/* Profile route */}
              <Route path="profile" element={<Profile />} />
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