import React, { useState, useEffect } from 'react';
import { Outlet, Navigate, Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/auth';
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
  ChevronDown
} from 'lucide-react';
import { useTheme } from './ThemeProvider';
import { cn } from '../lib/utils';

export default function Layout() {
  const { user, logout } = useAuthStore();
  const { theme, toggleTheme } = useTheme();
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);

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
  const getDepartmentHeadNav = () => [
    { name: 'Dashboard', href: '/', icon: Home },
    { name: 'Department Analytics', href: '/department-analytics', icon: BarChart3 },
    { name: 'Approvals & Policy', href: '/approvals-management', icon: ClipboardCheck },
    { name: 'Reports & Strategy', href: '/reporting-strategy', icon: FileBarChart },
  ];

  // Faculty specific navigation
  const getFacultyNav = () => [
    { name: 'Dashboard', href: '/', icon: Home },
    { name: 'Course Management', href: '/course-management', icon: BookOpen },
    { name: 'Grade Entry', href: '/grade-entry', icon: FileSpreadsheet },
    { name: 'Faculty Analytics', href: '/faculty-analytics', icon: BarChart3 },
    { name: 'Schedule', href: '/schedule', icon: Calendar },
  ];

  // Student specific navigation
  const getStudentNav = () => [
    { name: 'Dashboard', href: '/', icon: Home },
    { name: 'Course Registration', href: '/course-registration', icon: BookOpen },
    { name: 'Assignments', href: '/assignment-management', icon: FileText },
    { name: 'Academic Records', href: '/academic-records', icon: GraduationCap },
    { name: 'Schedule', href: '/schedule', icon: Calendar },
  ];

  // Admin specific navigation
  const getAdminNav = () => [
    { name: 'Dashboard', href: '/', icon: Home },
    { name: 'Course Approvals', href: '/resource-allocation', icon: ClipboardCheck },
    { name: 'User Management', href: '/user-management', icon: Users },
    { name: 'Audit Logs', href: '/audit-logs', icon: Activity },
    { name: 'System Settings', href: '/system-settings', icon: Settings },
  ];

  // Show appropriate navigation based on user role
  const navigation = 
    user.role === 'head' ? getDepartmentHeadNav() : 
    user.role === 'admin' ? getAdminNav() : 
    user.role === 'faculty' ? getFacultyNav() :
    user.role === 'student' ? getStudentNav() :
    [{ name: 'Dashboard', href: '/', icon: Home }];

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
    <div className="min-h-screen flex flex-col">
      {/* Mobile Navigation Header - Fixed position */}
      <header className="sticky top-0 z-50 bg-background border-b shadow-sm">
        <div className="px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <button
                onClick={toggleMobileMenu}
                className="md:hidden p-2 rounded-md mr-2"
                aria-label="Toggle menu"
              >
                {mobileMenuOpen ? (
                  <X className="h-6 w-6" />
                ) : (
                  <Menu className="h-6 w-6" />
                )}
              </button>
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-md bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-white font-bold text-lg">
                  U
                </div>
                <h1 className="text-xl font-bold">UDIS</h1>
              </div>
              <span className="ml-4 px-3 py-1 rounded-full text-xs capitalize bg-primary/10 font-medium">
                {user.role}
              </span>
            </div>
            
            <div className="flex items-center gap-2">
              {/* Notifications dropdown */}
              <div className="relative">
                <button 
                  className="p-2 rounded-md hover:bg-primary/10 relative"
                  onClick={(e) => {
                    e.stopPropagation();
                    setNotificationsOpen(!notificationsOpen);
                    setProfileMenuOpen(false);
                  }}
                >
                  <Bell className="h-5 w-5" />
                  {notifications.some(n => n.unread) && (
                    <span className="absolute top-1 right-1 w-2 h-2 bg-primary rounded-full"></span>
                  )}
                </button>
                
                {notificationsOpen && (
                  <div className="absolute right-0 mt-2 w-80 bg-background rounded-md shadow-lg py-1 z-50 border border-border">
                    <div className="p-3 border-b border-border">
                      <h3 className="font-semibold">Notifications</h3>
                    </div>
                    <div className="max-h-96 overflow-y-auto">
                      {notifications.map((notification) => (
                        <div 
                          key={notification.id} 
                          className={cn(
                            "p-3 hover:bg-primary/5 cursor-pointer",
                            notification.unread ? "bg-primary/5" : ""
                          )}
                        >
                          <div className="flex justify-between">
                            <span className="font-medium">{notification.title}</span>
                            <span className="text-xs text-muted-foreground">{notification.time}</span>
                          </div>
                          <p className="text-sm mt-1">{notification.message}</p>
                          {notification.unread && (
                            <div className="mt-2 flex justify-end">
                              <span className="text-xs px-2 py-1 bg-primary/10 rounded-full text-primary">New</span>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                    <div className="p-2 border-t border-border">
                      <button className="w-full p-2 text-center text-primary hover:bg-primary/5 rounded-md text-sm font-medium">
                        View all notifications
                      </button>
                    </div>
                  </div>
                )}
              </div>
              
              {/* Theme toggle */}
              <button
                onClick={toggleTheme}
                className="p-2 rounded-md hover:bg-primary/10 transition-all duration-200"
                aria-label="Toggle theme"
              >
                {theme === 'dark' ? (
                  <Sun className="h-5 w-5 rotate-0 scale-100 transition-all duration-300" />
                ) : (
                  <Moon className="h-5 w-5 rotate-90 scale-100 transition-all duration-300" />
                )}
              </button>
              
              {/* User profile dropdown */}
              <div className="relative ml-2">
                <button 
                  className="flex items-center gap-2 hover:bg-primary/10 px-2 py-1 rounded-md"
                  onClick={(e) => {
                    e.stopPropagation();
                    setProfileMenuOpen(!profileMenuOpen);
                    setNotificationsOpen(false);
                  }}
                >
                  <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
                    <User className="h-5 w-5 text-primary" />
                  </div>
                  <ChevronDown className={cn(
                    "h-4 w-4 transition-transform duration-200",
                    profileMenuOpen ? "rotate-180" : ""
                  )} />
                </button>
                
                {profileMenuOpen && (
                  <div className="absolute right-0 mt-2 w-56 bg-background rounded-md shadow-lg py-1 z-50 border border-border">
                    <div className="p-3 border-b border-border">
                      <p className="font-semibold">{user.name}</p>
                      <p className="text-sm text-muted-foreground">{user.email}</p>
                    </div>
                    <Link to="/profile" className="block px-4 py-2 text-sm hover:bg-primary/5">
                      Your Profile
                    </Link>
                    <Link to="/settings" className="block px-4 py-2 text-sm hover:bg-primary/5">
                      Settings
                    </Link>
                    <div className="border-t border-border my-1"></div>
                    <button 
                      onClick={handleLogout}
                      className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 flex items-center"
                    >
                      <LogOut className="h-4 w-4 mr-2" />
                      Sign out
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="flex-1 flex">
        {/* Sidebar - Fixed position on desktop, slide-over on mobile */}
        <aside
          className={cn(
            "md:w-64 bg-background fixed md:sticky top-16 h-[calc(100vh-64px)] z-40 border-r transition-transform duration-300 ease-in-out",
            mobileMenuOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
          )}
        >
          <div className="flex flex-col h-full py-4">
            <div className="px-4 mb-4">
              <div className="relative">
                <input 
                  type="text" 
                  placeholder="Search..." 
                  className="w-full h-10 bg-background/50 border border-border rounded-md pl-4 pr-8 focus:outline-none focus:ring-2 focus:ring-primary/50"
                />
                <div className="absolute right-3 top-3 text-muted-foreground">
                  <svg width="15" height="15" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M10 6.5C10 8.433 8.433 10 6.5 10C4.567 10 3 8.433 3 6.5C3 4.567 4.567 3 6.5 3C8.433 3 10 4.567 10 6.5ZM9.30884 10.0159C8.53901 10.6318 7.56251 11 6.5 11C4.01472 11 2 8.98528 2 6.5C2 4.01472 4.01472 2 6.5 2C8.98528 2 11 4.01472 11 6.5C11 7.56251 10.6318 8.53901 10.0159 9.30884L12.8536 12.1464C13.0488 12.3417 13.0488 12.6583 12.8536 12.8536C12.6583 13.0488 12.3417 13.0488 12.1464 12.8536L9.30884 10.0159Z" fill="currentColor" fillRule="evenodd" clipRule="evenodd"></path>
                  </svg>
                </div>
              </div>
            </div>
            
            <nav className="px-2 space-y-1 flex-1 overflow-y-auto hide-scrollbar">
              {navigation.map((item) => {
                const isActive = location.pathname === item.href;
                return (
                  <Link
                    key={item.name}
                    to={item.href}
                    className={cn(
                      "group flex items-center px-2 py-2 text-sm font-medium rounded-md transition-all duration-200",
                      isActive
                        ? "bg-primary text-primary-foreground"
                        : "hover:bg-primary/10"
                    )}
                  >
                    <item.icon
                      className={cn(
                        "mr-3 h-5 w-5 transition-transform duration-200 group-hover:scale-110",
                        isActive ? "text-primary-foreground" : "text-primary"
                      )}
                      aria-hidden="true"
                    />
                    {item.name}
                  </Link>
                );
              })}
            </nav>
            
            <div className="px-4 mt-auto">
              <div className="rounded-md bg-primary/5 p-3">
                <h4 className="font-medium text-sm mb-1">Need help?</h4>
                <p className="text-xs text-muted-foreground mb-2">Contact support for assistance with any issues.</p>
                <button className="w-full py-1.5 bg-primary text-primary-foreground rounded-md text-xs font-medium flex items-center justify-center">
                  <MessageSquare className="h-3 w-3 mr-1" />
                  Contact Support
                </button>
              </div>
            </div>
          </div>
        </aside>

        {/* Backdrop for mobile */}
        {mobileMenuOpen && (
          <div 
            className="fixed inset-0 bg-black/30 z-30 md:hidden"
            onClick={toggleMobileMenu}
          ></div>
        )}

        {/* Main content area */}
        <main 
          className="flex-1 md:ml-0 pt-0 pb-12"
          onClick={handleClickOutside}
        >
          <div className="max-w-7xl mx-auto">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}