import React, { useState, useEffect } from 'react';
import { Outlet, Navigate, Link, useLocation } from 'react-router-dom';
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
  X
} from 'lucide-react';
import { useTheme } from './ThemeProvider';
import { cn } from '../lib/utils';

export default function Layout() {
  const { user, logout } = useAuthStore();
  const { theme, toggleTheme } = useTheme();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

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
  }, [location.pathname]);

  if (!user) {
    return <Navigate to="/login" />;
  }

  // Navigation items for different roles
  const getDepartmentHeadNav = () => [
    { name: 'Dashboard', href: '/', icon: Home },
    { name: 'Department Analytics', href: '/department-analytics', icon: BarChart3 },
    { name: 'Approvals & Policy', href: '/approvals-management', icon: ClipboardCheck },
    { name: 'Reports & Strategy', href: '/reporting-strategy', icon: FileBarChart },
  ];

  // Admin specific navigation
  const getAdminNav = () => [
    { name: 'Dashboard', href: '/', icon: Home },
    { name: 'User Management', href: '/user-management', icon: Users },
    { name: 'Audit Logs', href: '/audit-logs', icon: Activity },
    { name: 'Resource Allocation', href: '/resource-allocation', icon: Database },
    { name: 'System Settings', href: '/system-settings', icon: Settings },
  ];

  // Show appropriate navigation based on user role
  const navigation = 
    user.role === 'head' ? getDepartmentHeadNav() : 
    user.role === 'admin' ? getAdminNav() : 
    [{ name: 'Dashboard', href: '/', icon: Home }];

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  return (
    <div className="min-h-screen flex flex-col">
      {/* Mobile Navigation Header - Fixed position */}
      <nav className="mobile-nav-fixed glass-morphism border-b">
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
              <h1 className="text-xl font-bold">UDIS</h1>
              <span className="ml-4 px-3 py-1 rounded-full text-sm capitalize bg-primary/10">
                {user.role}
              </span>
            </div>
            <div className="flex items-center gap-4">
              <button
                onClick={toggleTheme}
                className="p-2 rounded-full hover:bg-primary/10"
                aria-label="Toggle theme"
              >
                {theme === 'dark' ? (
                  <Sun className="h-5 w-5" />
                ) : (
                  <Moon className="h-5 w-5" />
                )}
              </button>
              <button
                onClick={logout}
                className="md:hidden flex items-center gap-2 px-3 py-2 rounded hover:bg-primary/10"
              >
                <LogOut className="h-5 w-5" />
                <span className="sr-only md:not-sr-only">Logout</span>
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Menu - With proper positioning */}
      {mobileMenuOpen && (
        <div className="mobile-menu-container md:hidden">
          <div className="glass-morphism h-full w-64 flex flex-col">
            <div className="p-4 border-b">
              <div className="mt-2 px-3 py-1 rounded-full text-sm capitalize bg-primary/10 inline-block">
                {user.role}
              </div>
            </div>
            <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
              {navigation.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.href;
                return (
                  <Link
                    key={item.name}
                    to={item.href}
                    className={cn(
                      "flex items-center px-3 py-2 rounded-md transition-colors",
                      isActive 
                        ? "bg-primary text-primary-foreground" 
                        : "hover:bg-primary/10"
                    )}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <Icon className="mr-3 h-5 w-5" />
                    {item.name}
                  </Link>
                );
              })}
            </nav>
            <div className="p-4 border-t">
              <button
                onClick={logout}
                className="flex w-full items-center px-3 py-2 rounded-md hover:bg-primary/10 transition-colors"
              >
                <LogOut className="mr-3 h-5 w-5" />
                Logout
              </button>
            </div>
          </div>
          {/* Semi-transparent backdrop */}
          <div 
            className="absolute inset-0 bg-black/50 -z-10"
            onClick={() => setMobileMenuOpen(false)}
            aria-hidden="true"
          />
        </div>
      )}

      {/* Desktop Sidebar */}
      <aside className="glass-morphism w-64 border-r fixed inset-y-0 hidden md:flex flex-col">
        <div className="p-4 border-b">
          <h1 className="text-xl font-bold">UDIS</h1>
          <div className="mt-2 px-3 py-1 rounded-full text-sm capitalize bg-primary/10 inline-block">
            {user.role}
          </div>
        </div>
        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {navigation.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.href;
            return (
              <Link
                key={item.name}
                to={item.href}
                className={cn(
                  "flex items-center px-3 py-2 rounded-md transition-colors",
                  isActive 
                    ? "bg-primary text-primary-foreground" 
                    : "hover:bg-primary/10"
                )}
              >
                <Icon className="mr-3 h-5 w-5" />
                {item.name}
              </Link>
            );
          })}
        </nav>
        <div className="p-4 border-t">
          <button
            onClick={logout}
            className="flex w-full items-center px-3 py-2 rounded-md hover:bg-primary/10 transition-colors"
          >
            <LogOut className="mr-3 h-5 w-5" />
            Logout
          </button>
        </div>
      </aside>

      <div className="flex flex-col flex-1 md:pl-64 pt-16 md:pt-0">
        <main className="flex-1 px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8 overflow-x-hidden">
          <Outlet />
        </main>
      </div>
    </div>
  );
}