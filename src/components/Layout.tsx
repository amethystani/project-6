import React, { useState, useEffect } from 'react';
import { Outlet, Navigate, Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/auth';
import { useAuth } from '../lib/auth';
import axios from 'axios';
import { 
  Moon, 
  Sun, 
  LogOut, 
  Home, 
  BarChart3, 
  ClipboardCheck, 
  FileBarChart,
  Users,
  Activity,
  Database,
  Settings,
  Menu,
  X,
  Bell,
  MessageSquare,
  BookOpen,
  GraduationCap,
  FileSpreadsheet,
  Calendar,
  FileText,
  User,
  ChevronDown,
  ChevronRight,
  Book
} from 'lucide-react';
import { useTheme } from './ThemeProvider';
import { cn } from '../lib/utils';
import NotificationsSidebar from './NotificationsSidebar';

interface NavItem {
  name: string;
  href: string;
  icon: React.ElementType;
}

interface Course {
  id: number;
  course_code: string;
  title: string;
  credits: number;
}

interface Enrollment {
  id: number;
  course: Course;
}

const StudentNavigation = () => {
  const location = useLocation();

  const mainNavItems = [
    { name: 'Dashboard', href: '/dashboard', icon: Home },
    { name: 'My Courses', href: '/dashboard/course-registration', icon: BookOpen },
    { name: 'Available Courses', href: '/dashboard/available-courses', icon: BookOpen },
    { name: 'Assignments', href: '/dashboard/assignment-management', icon: FileText },
    { name: 'Academic Records', href: '/dashboard/academic-records', icon: GraduationCap },
    { name: 'Schedule', href: '/dashboard/schedule', icon: Calendar },
  ];

  return (
    <nav className="px-2 space-y-1 flex-1 overflow-y-auto hide-scrollbar">
      {/* Main navigation items */}
      {mainNavItems.map((item) => {
        const isActive = location.pathname === item.href;
        return (
          <Link
            key={item.name}
            to={item.href}
            className={cn(
              "group flex items-center px-3 py-2 text-sm font-medium rounded-md transition-all duration-200",
              isActive
                ? "bg-primary text-primary-foreground shadow-sm"
                : "text-muted-foreground hover:bg-primary/10 hover:text-foreground"
            )}
          >
            <item.icon
              className={cn(
                "mr-3 h-5 w-5 transition-transform duration-200 group-hover:scale-110",
                isActive ? "text-primary-foreground" : "text-muted-foreground group-hover:text-foreground"
              )}
              aria-hidden="true"
            />
            {item.name}
          </Link>
        );
      })}
    </nav>
  );
};

export default function Layout() {
  const { user, logout } = useAuthStore();
  const { theme } = useTheme();
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  // Lock body scroll when mobile menu is open
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.classList.add('menu-open');
    } else {
      document.body.classList.remove('menu-open');
    }
    
    // Cleanup effect
    return () => {
      document.body.classList.remove('menu-open');
    };
  }, [mobileMenuOpen]);

  // Close mobile menu when route changes
  useEffect(() => {
    setMobileMenuOpen(false);
    setNotificationsOpen(false);
    setProfileMenuOpen(false);
  }, [location.pathname]);

  if (!user) {
    return <Navigate to="/login" />;
  }

  // Close all dropdowns when clicking outside
  const handleClickOutside = () => {
    setNotificationsOpen(false);
    setProfileMenuOpen(false);
  };

  // Navigation items for different roles
  const getDepartmentHeadNav = () => (
    <nav className="px-2 space-y-1">
      {[
        { name: 'Dashboard', href: '/dashboard', icon: Home },
        { name: 'Department Analytics', href: '/dashboard/department-analytics', icon: BarChart3 },
        { name: 'Approvals Management', href: '/dashboard/approvals-management', icon: ClipboardCheck },
        { name: 'Approvals & Policy', href: '/dashboard/approvals-policy', icon: FileText },
        { name: 'Reports & Strategy', href: '/dashboard/reporting-strategy', icon: FileBarChart },
      ].map((item) => {
        const isActive = location.pathname === item.href;
        return (
          <Link
            key={item.name}
            to={item.href}
            className={cn(
              "group flex items-center px-3 py-2 text-sm font-medium rounded-md transition-all duration-200",
              isActive
                ? "bg-primary text-primary-foreground shadow-sm"
                : "text-muted-foreground hover:bg-primary/10 hover:text-foreground"
            )}
          >
            <item.icon
              className={cn(
                "mr-3 h-5 w-5 transition-transform duration-200 group-hover:scale-110",
                isActive ? "text-primary-foreground" : "text-muted-foreground group-hover:text-foreground"
              )}
              aria-hidden="true"
            />
            {item.name}
          </Link>
        );
      })}
    </nav>
  );

  // Faculty specific navigation
  const getFacultyNav = () => (
    <nav className="px-2 space-y-1">
      {[
        { name: 'Dashboard', href: '/', icon: Home },
        { name: 'Course Management', href: '/course-management', icon: BookOpen },
        { name: 'Grade Entry', href: '/grade-entry', icon: FileSpreadsheet },
        { name: 'Faculty Analytics', href: '/faculty-analytics', icon: BarChart3 },
        { name: 'Schedule', href: '/schedule', icon: Calendar },
      ].map((item) => {
        const isActive = location.pathname === item.href;
        return (
          <Link
            key={item.name}
            to={item.href}
            className={cn(
              "group flex items-center px-3 py-2 text-sm font-medium rounded-md transition-all duration-200",
              isActive
                ? "bg-primary text-primary-foreground shadow-sm"
                : "text-muted-foreground hover:bg-primary/10 hover:text-foreground"
            )}
          >
            <item.icon
              className={cn(
                "mr-3 h-5 w-5 transition-transform duration-200 group-hover:scale-110",
                isActive ? "text-primary-foreground" : "text-muted-foreground group-hover:text-foreground"
              )}
              aria-hidden="true"
            />
            {item.name}
          </Link>
        );
      })}
    </nav>
  );

  // Admin specific navigation
  const getAdminNav = () => (
    <nav className="px-2 space-y-1">
      {[
        { name: 'Dashboard', href: '/', icon: Home },
        { name: 'Course Approvals', href: '/resource-allocation', icon: ClipboardCheck },
        { name: 'User Management', href: '/user-management', icon: Users },
        { name: 'Audit Logs', href: '/audit-logs', icon: Activity },
        { name: 'System Settings', href: '/system-settings', icon: Settings },
      ].map((item) => {
        const isActive = location.pathname === item.href;
        return (
          <Link
            key={item.name}
            to={item.href}
            className={cn(
              "group flex items-center px-3 py-2 text-sm font-medium rounded-md transition-all duration-200",
              isActive
                ? "bg-primary text-primary-foreground shadow-sm"
                : "text-muted-foreground hover:bg-primary/10 hover:text-foreground"
            )}
          >
            <item.icon
              className={cn(
                "mr-3 h-5 w-5 transition-transform duration-200 group-hover:scale-110",
                isActive ? "text-primary-foreground" : "text-muted-foreground group-hover:text-foreground"
              )}
              aria-hidden="true"
            />
            {item.name}
          </Link>
        );
      })}
    </nav>
  );

  // Show appropriate navigation based on user role
  const navigation = 
    user.role === 'head' ? getDepartmentHeadNav() : 
    user.role === 'admin' ? getAdminNav() : 
    user.role === 'faculty' ? getFacultyNav() :
    user.role === 'student' ? <StudentNavigation /> :
    <nav className="px-2 space-y-1">
      <Link
        to="/"
        className={cn(
          "group flex items-center px-3 py-2 text-sm font-medium rounded-md transition-all duration-200",
          location.pathname === "/"
            ? "bg-primary text-primary-foreground shadow-sm"
            : "text-muted-foreground hover:bg-primary/10 hover:text-foreground"
        )}
      >
        <Home
          className={cn(
            "mr-3 h-5 w-5 transition-transform duration-200 group-hover:scale-110",
            location.pathname === "/" ? "text-primary-foreground" : "text-muted-foreground group-hover:text-foreground"
          )}
          aria-hidden="true"
        />
        Dashboard
      </Link>
    </nav>;

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  // Sample notifications
  const notifications = [
    { id: 1, title: 'System Update', message: 'The system will be down for maintenance on Saturday', time: '2 hours ago', unread: true },
    { id: 2, title: 'New Course Available', message: 'A new course has been added to your curriculum', time: '1 day ago', unread: false },
    { id: 3, title: 'Upcoming Event', message: 'Department seminar scheduled for next week', time: '2 days ago', unread: false },
  ];

  // Handle user logout and redirect to landing page
  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Mobile menu button */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-50 bg-background border-b">
        <div className="flex items-center justify-between p-4">
          <button
            onClick={toggleMobileMenu}
            className="p-2 rounded-md text-muted-foreground hover:text-foreground hover:bg-primary/10 transition-colors"
          >
            {mobileMenuOpen ? (
              <X className="h-6 w-6" />
            ) : (
              <Menu className="h-6 w-6" />
            )}
          </button>
          <div className="flex items-center gap-4">
            <button
              onClick={() => setNotificationsOpen(!notificationsOpen)}
              className="relative p-2 rounded-md text-muted-foreground hover:text-foreground hover:bg-primary/10 transition-colors"
            >
              <Bell className="h-6 w-6" />
              {notifications.some(n => n.unread) && (
                <span className="absolute top-1 right-1 h-2 w-2 bg-primary rounded-full" />
              )}
            </button>
            <button
              onClick={() => setProfileMenuOpen(!profileMenuOpen)}
              className="flex items-center gap-2 p-2 rounded-md text-muted-foreground hover:text-foreground hover:bg-primary/10 transition-colors"
            >
              <User className="h-6 w-6" />
              <ChevronDown className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Sidebar */}
      <div
        className={cn(
          "fixed inset-y-0 left-0 z-40 w-64 bg-background border-r transform transition-transform duration-200 ease-in-out lg:translate-x-0",
          mobileMenuOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="flex flex-col h-full">
          <div className="flex-1 flex flex-col pt-16 lg:pt-0">
            <div className="flex items-center justify-center h-16 px-4 border-b">
              <h1 className="text-xl font-semibold">
                {user.role === 'student' 
                  ? 'Student Portal' 
                  : user.role === 'faculty' 
                  ? 'Faculty Portal' 
                  : user.role === 'admin' 
                  ? 'Admin Portal' 
                  : user.role === 'head' 
                  ? 'Department Head Portal' 
                  : 'User Portal'}
              </h1>
            </div>
            {navigation}
          </div>
          <div className="p-4 border-t space-y-2">
            <Link
              to="/dashboard/profile"
              className="flex items-center gap-2 w-full px-3 py-2 text-sm font-medium rounded-md text-muted-foreground hover:bg-primary/10 hover:text-foreground transition-colors"
            >
              <User className="h-5 w-5" />
              Profile
            </Link>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 w-full px-3 py-2 text-sm font-medium rounded-md text-muted-foreground hover:bg-primary/10 hover:text-foreground transition-colors"
            >
              <LogOut className="h-5 w-5" />
              Logout
            </button>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="lg:pl-64">
        <main className="min-h-screen pt-16 lg:pt-0">
          <Outlet />
        </main>
      </div>

      {/* Notifications sidebar */}
      {notificationsOpen && (
        <div className="fixed inset-y-0 right-0 z-40 w-80 bg-background border-l transform transition-transform duration-200 ease-in-out lg:translate-x-0">
          <div className="h-full pt-16 lg:pt-0">
            <NotificationsSidebar />
          </div>
        </div>
      )}

      {/* Profile menu */}
      {profileMenuOpen && (
        <div className="fixed inset-0 z-50 lg:hidden" onClick={handleClickOutside}>
          <div className="absolute inset-0 bg-black/20" />
          <div className="absolute right-4 top-16 w-48 bg-background rounded-md shadow-lg border">
            <div className="py-1">
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 w-full px-4 py-2 text-sm text-muted-foreground hover:bg-primary/10 hover:text-foreground transition-colors"
              >
                <LogOut className="h-4 w-4" />
                Logout
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}