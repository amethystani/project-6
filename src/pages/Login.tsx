import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { useAuthStore, guestUsers } from '../store/auth';
import { UserRole } from '../types';
import { Moon, Sun, User, ChevronLeft, GraduationCap, BookOpen, Shield, BarChart, LucideIcon } from 'lucide-react';
import { useTheme } from '../components/ThemeProvider';
import { cn } from '../lib/utils';

export default function Login() {
  const [selectedRole, setSelectedRole] = useState<UserRole | null>(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [accessCode, setAccessCode] = useState('');
  const { setUser } = useAuthStore();
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedRole) {
      toast.error('Please select a role first');
      return;
    }

    if (['faculty', 'admin', 'head'].includes(selectedRole) && !accessCode) {
      toast.error('Access code is required');
      return;
    }

    // In a real app, validate the access code here
    toast.error('Regular login not implemented in demo');
  };

  const handleGuestLogin = (role: UserRole) => {
    setUser(guestUsers[role]);
    toast.success(`Logged in as ${role}`);
    navigate('/dashboard');
  };

  const goBack = () => {
    setSelectedRole(null);
    setEmail('');
    setPassword('');
    setAccessCode('');
  };

  const roleIcons: Record<Exclude<UserRole, 'guest'>, LucideIcon> = {
    student: GraduationCap,
    faculty: BookOpen,
    admin: Shield,
    head: BarChart,
  };

  const mainRoles: Exclude<UserRole, 'guest'>[] = ['student', 'faculty', 'admin', 'head'];

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4">
      <div className="absolute top-4 right-4">
        <button
          onClick={toggleTheme}
          className="p-2 rounded-full hover:bg-primary/10"
        >
          {theme === 'dark' ? (
            <Sun className="h-5 w-5" />
          ) : (
            <Moon className="h-5 w-5" />
          )}
        </button>
      </div>

      <div className="glass-card w-full max-w-4xl">
        <div className="flex justify-center mb-6">
          <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
            <User className="h-6 w-6 text-primary" />
          </div>
        </div>
        
        {selectedRole ? (
          <>
            <div className="flex items-center mb-6">
              <button
                onClick={goBack}
                className="p-2 hover:bg-primary/10 rounded-full mr-2"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
              <h1 className="text-2xl font-bold">
                Login as {selectedRole.charAt(0).toUpperCase() + selectedRole.slice(1)}
              </h1>
            </div>

            <div className="max-w-md mx-auto">
              <form onSubmit={handleLogin} className="space-y-4 mb-6">
                <div>
                  <input
                    type="email"
                    placeholder="Email"
                    className="input-field"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
                <div>
                  <input
                    type="password"
                    placeholder="Password"
                    className="input-field"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>
                {['faculty', 'admin', 'head'].includes(selectedRole) && (
                  <div>
                    <input
                      type="password"
                      placeholder={`${selectedRole.charAt(0).toUpperCase() + selectedRole.slice(1)} Access Code`}
                      className="input-field"
                      value={accessCode}
                      onChange={(e) => setAccessCode(e.target.value)}
                      required
                    />
                  </div>
                )}
                <button type="submit" className="button-primary w-full">
                  Login
                </button>
              </form>
            </div>
          </>
        ) : (
          <>
            <h1 className="text-2xl font-bold text-center mb-8">Select Your Role</h1>
            <div className="grid grid-cols-4 gap-6 mb-8 px-4">
              {mainRoles.map((role) => {
                const Icon = roleIcons[role];
                return (
                  <button
                    key={role}
                    onClick={() => setSelectedRole(role)}
                    className="flex flex-col items-center p-6 rounded-xl border border-border hover:border-primary/50 transition-all duration-300 group relative bg-card"
                  >
                    <div className="w-16 h-16 rounded-xl bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                      <Icon className="h-8 w-8 text-primary" />
                    </div>
                    <span className="text-lg font-medium">
                      {role === 'head' ? 'Department Head' : role.charAt(0).toUpperCase() + role.slice(1)}
                    </span>
                    <div className="absolute inset-0 bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity rounded-xl" />
                  </button>
                );
              })}
            </div>
          </>
        )}

        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-border"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-background text-foreground">
              Or continue as guest
            </span>
          </div>
        </div>

        <div className="grid grid-cols-4 gap-4 px-4">
          {mainRoles.map((role) => (
            <button
              key={role}
              onClick={() => handleGuestLogin(role)}
              className="button-secondary py-2"
            >
              {role === 'head' ? 'Department Head' : role.charAt(0).toUpperCase() + role.slice(1)}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}