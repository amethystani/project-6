import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { useAuthStore } from './store/auth';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Layout from './components/Layout';
import { ThemeProvider } from './components/ThemeProvider';
// Department Head pages
import DepartmentAnalytics from './pages/head/DepartmentAnalytics';
import ApprovalsManagement from './pages/head/ApprovalsManagement';
import ReportingStrategy from './pages/head/ReportingStrategy';
// Admin Staff pages
import UserManagement from './pages/admin/UserManagement';
import AuditLogs from './pages/admin/AuditLogs';
import ResourceAllocation from './pages/admin/ResourceAllocation';
import SystemSettings from './pages/admin/SystemSettings';
// Faculty pages
import CourseManagement from './pages/faculty/CourseManagement';
import GradeEntry from './pages/faculty/GradeEntry';
import FacultyAnalytics from './pages/faculty/FacultyAnalytics';
// Student pages
import CourseRegistration from './pages/student/CourseRegistration';
import AssignmentManagement from './pages/student/AssignmentManagement';
import AcademicRecords from './pages/student/AcademicRecords';
import Schedule from './pages/student/Schedule';

function App() {
  const { user, isLoading } = useAuthStore();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary" />
      </div>
    );
  }

  return (
    <ThemeProvider>
      <Router>
        <div className="min-h-screen bg-gradient-radial from-primary/20 via-background to-background">
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/" element={<Layout />}>
              <Route index element={<Dashboard />} />
              {/* Department Head routes */}
              <Route path="department-analytics" element={<DepartmentAnalytics />} />
              <Route path="approvals-management" element={<ApprovalsManagement />} />
              <Route path="reporting-strategy" element={<ReportingStrategy />} />
              {/* Admin Staff routes */}
              <Route path="user-management" element={<UserManagement />} />
              <Route path="audit-logs" element={<AuditLogs />} />
              <Route path="resource-allocation" element={<ResourceAllocation />} />
              <Route path="system-settings" element={<SystemSettings />} />
              {/* Faculty routes */}
              <Route path="course-management" element={<CourseManagement />} />
              <Route path="grade-entry" element={<GradeEntry />} />
              <Route path="faculty-analytics" element={<FacultyAnalytics />} />
              {/* Student routes */}
              <Route path="course-registration" element={<CourseRegistration />} />
              <Route path="assignment-management" element={<AssignmentManagement />} />
              <Route path="academic-records" element={<AcademicRecords />} />
              <Route path="schedule" element={<Schedule />} />
            </Route>
          </Routes>
        </div>
        <Toaster position="top-right" />
      </Router>
    </ThemeProvider>
  );
}

export default App;