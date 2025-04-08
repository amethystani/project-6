import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { useAuthStore } from '../store/auth';
import { UserRole } from '../types';
import { ChevronLeft, GraduationCap, BookOpen, Shield, BarChart, Home, LucideIcon } from 'lucide-react';
import { cn } from '../lib/utils';

// Helper function to map between frontend and backend role names
const mapRoleToBackend = (role: UserRole | null): string | null => {
  if (!role) return null;
  return role === 'head' ? 'department_head' : role;
};

const mapRoleFromBackend = (role: string): UserRole => {
  return role === 'department_head' ? 'head' : role as UserRole;
};

export default function Login() {
  const [selectedRole, setSelectedRole] = useState<UserRole | null>(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [accessCode, setAccessCode] = useState('');
  const [isFirstTimeSetup, setIsFirstTimeSetup] = useState(false);
  const [isRegisterMode, setIsRegisterMode] = useState(false);
  const [userDetails, setUserDetails] = useState<{
    email: string;
    first_name: string;
    last_name: string;
    role: string;
  } | null>(null);
  const { setUser } = useAuthStore();
  const navigate = useNavigate();

  const checkUser = async () => {
    if (!email) {
      toast.error('Please enter your email');
      return;
    }

    try {
      const response = await fetch('http://localhost:5001/api/auth/check-user', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email
        }),
      });

      const data = await response.json();

      if (data.success && data.exists) {
        if (data.needs_setup) {
          setIsFirstTimeSetup(true);
          setUserDetails(data.user_details);
          toast.success('Please set up your password');
        } else {
          // User exists and has password already set up
          setIsFirstTimeSetup(false);
        }
      } else if (data.success && !data.exists) {
        // Instead of showing error, proceed with login
        setIsFirstTimeSetup(false);
      } else {
        toast.error(data.message || 'Error checking user');
      }
    } catch (error) {
      console.error('Error checking user:', error);
      toast.error('Failed to check user. Please try again later.');
    }
  };

  const setupPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (password !== confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    if (password.length < 8) {
      toast.error('Password must be at least 8 characters long');
      return;
    }

    try {
      const response = await fetch('http://localhost:5001/api/auth/setup-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          password
        }),
      });

      const data = await response.json();

      if (data.success) {
        localStorage.setItem('token', data.access_token);
        setUser(data.user);
        toast.success('Password set up successfully!');
        navigate('/dashboard');
      } else {
        toast.error(data.message || 'Password setup failed');
      }
    } catch (error) {
      console.error('Password setup error:', error);
      toast.error('Failed to set up password. Please try again later.');
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedRole) {
      toast.error('Please select a role first');
      return;
    }

    // Map role to backend format
    const backendRole = mapRoleToBackend(selectedRole);

    try {
      // Make API call to the backend login endpoint
      const response = await fetch('http://localhost:5001/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          password,
        }),
      });

      const data = await response.json();

      if (data.success) {
        // Store the access token in localStorage
        localStorage.setItem('token', data.access_token);
        
        // Set the user in our store
        setUser(data.user);
        
        toast.success('Login successful');
        navigate('/dashboard');
      } else {
        toast.error(data.message || 'Login failed');
      }
    } catch (error) {
      console.error('Login error:', error);
      toast.error('Login failed. Please try again later.');
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (password !== confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    if (password.length < 8) {
      toast.error('Password must be at least 8 characters long');
      return;
    }
    
    // Map role to backend format
    const backendRole = mapRoleToBackend(selectedRole);

    try {
      const response = await fetch('http://localhost:5001/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          password,
          first_name: "User",
          last_name: String(Math.floor(Math.random() * 1000)),
          role: backendRole
        }),
      });

      const data = await response.json();

      if (data.success) {
        toast.success('Registration successful! Please sign in with your new account.');
        
        // Switch to login mode and keep the email filled
        setIsRegisterMode(false);
        setPassword('');
      } else {
        toast.error(data.message || 'Registration failed');
      }
    } catch (error) {
      console.error('Registration error:', error);
      toast.error('Failed to register. Please try again later.');
    }
  };

  const goBack = () => {
    setSelectedRole(null);
    setEmail('');
    setPassword('');
    setConfirmPassword('');
    setAccessCode('');
    setIsFirstTimeSetup(false);
    setUserDetails(null);
  };

  const roleIcons: Record<Exclude<UserRole, 'guest' | 'department_head'>, LucideIcon> = {
    student: GraduationCap,
    faculty: BookOpen,
    admin: Shield,
    head: BarChart,
  };

  const mainRoles: Exclude<UserRole, 'guest' | 'department_head'>[] = ['student', 'faculty', 'admin', 'head'];

  // Render first-time setup screen
  if (isFirstTimeSetup && userDetails) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-gradient-to-br from-background to-background/80">
        <div className="absolute top-4 right-4">
          <Link to="/" className="p-2 rounded-full hover:bg-primary/10 flex items-center justify-center">
            <Home className="h-5 w-5" />
          </Link>
        </div>

        <div className="glass-card w-full max-w-md">
          <div className="flex justify-center mb-6">
            <div className="w-20 h-20 flex items-center justify-center">
              <img src="/assets/logo/logo.jpg" alt="University Logo" className="h-16 w-auto" />
            </div>
          </div>
          
          <div className="flex items-center mb-6">
            <button
              onClick={goBack}
              className="p-2 hover:bg-primary/10 rounded-full mr-2"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <h1 className="text-2xl font-bold">
              First-time Password Setup
            </h1>
          </div>
          
          <div className="text-center mb-6">
            <p className="mb-2">Welcome, {userDetails.first_name} {userDetails.last_name}!</p>
            <p className="text-foreground/70">Please set up your password to continue.</p>
          </div>

          <form onSubmit={setupPassword} className="space-y-4 mb-6">
            <div>
              <input
                type="email"
                value={email}
                disabled
                className="input-field opacity-70"
              />
            </div>
            <div>
              <input
                type="password"
                placeholder="New Password"
                className="input-field"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={8}
              />
            </div>
            <div>
              <input
                type="password"
                placeholder="Confirm Password"
                className="input-field"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                minLength={8}
              />
            </div>
            <button type="submit" className="button-primary w-full backdrop-blur-sm bg-primary/90 shadow-lg border border-primary/20 hover:bg-primary/80 hover:shadow-primary/10 transition-all">
              Set Password & Login
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-gradient-to-br from-background to-background/80">
      <div className="absolute top-4 right-4">
        <Link to="/" className="p-2 rounded-full hover:bg-primary/10 flex items-center justify-center">
          <Home className="h-5 w-5" />
        </Link>
      </div>

      <div className="glass-card w-full max-w-md shadow-xl">
        <div className="flex justify-center mb-6">
          <div className="w-24 h-24 flex items-center justify-center">
            <img src="/assets/logo/logo.jpg" alt="University Logo" className="h-20 w-auto" />
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
                {isRegisterMode 
                  ? `Register as ${selectedRole.charAt(0).toUpperCase() + selectedRole.slice(1)}`
                  : `Login as ${selectedRole.charAt(0).toUpperCase() + selectedRole.slice(1)}`}
              </h1>
            </div>

            <div className="max-w-md mx-auto">
              {!isRegisterMode ? (
                <>
                  <div className="flex justify-center gap-4 mb-6">
                    <button 
                      className="button-primary px-8 backdrop-blur-md bg-primary/80 shadow-lg border border-white/10 hover:bg-primary/90 hover:shadow-primary/30 transition-all duration-300 relative overflow-hidden"
                      onClick={() => setIsRegisterMode(false)}
                    >
                      <span className="absolute inset-0 w-full h-full bg-gradient-to-tr from-white/5 to-transparent"></span>
                      <span className="relative z-10">Login</span>
                    </button>
                    <button 
                      className="button-secondary px-8 backdrop-blur-md bg-secondary/70 shadow-lg border border-white/10 hover:bg-secondary/80 hover:shadow-secondary/20 transition-all duration-300 relative overflow-hidden"
                      onClick={() => setIsRegisterMode(true)}
                    >
                      <span className="absolute inset-0 w-full h-full bg-gradient-to-tr from-white/5 to-transparent"></span>
                      <span className="relative z-10">Register</span>
                    </button>
                  </div>
                  
                  <form onSubmit={handleLogin} className="space-y-4 mb-6">
                    <div>
                      <input
                        type="email"
                        placeholder="Email"
                        className="input-field backdrop-blur-md bg-background/60 border-white/10 focus:border-primary/50 focus:ring-2 focus:ring-primary/20 transition-all duration-300"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                      />
                    </div>
                    <div>
                      <input
                        type="password"
                        placeholder="Password"
                        className="input-field backdrop-blur-md bg-background/60 border-white/10 focus:border-primary/50 focus:ring-2 focus:ring-primary/20 transition-all duration-300"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                      />
                    </div>
                    <button type="submit" className="button-primary w-full backdrop-blur-md bg-primary/80 shadow-lg border border-white/10 hover:bg-primary/90 hover:shadow-primary/30 hover:scale-[1.02] transition-all duration-300 relative overflow-hidden group">
                      <span className="absolute inset-0 w-full h-full bg-gradient-to-r from-white/10 via-white/5 to-transparent opacity-0 group-hover:opacity-100 group-hover:translate-x-full transition-all duration-1000"></span>
                      <span className="relative z-10">Login</span>
                    </button>
                  </form>
                </>
              ) : (
                <>
                  <div className="flex justify-center gap-4 mb-6">
                    <button 
                      className="button-secondary px-8 backdrop-blur-md bg-secondary/70 shadow-lg border border-white/10 hover:bg-secondary/80 hover:shadow-secondary/20 transition-all duration-300 relative overflow-hidden"
                      onClick={() => setIsRegisterMode(false)}
                    >
                      <span className="absolute inset-0 w-full h-full bg-gradient-to-tr from-white/5 to-transparent"></span>
                      <span className="relative z-10">Login</span>
                    </button>
                    <button 
                      className="button-primary px-8 backdrop-blur-md bg-primary/80 shadow-lg border border-white/10 hover:bg-primary/90 hover:shadow-primary/30 transition-all duration-300 relative overflow-hidden"
                      onClick={() => setIsRegisterMode(true)}
                    >
                      <span className="absolute inset-0 w-full h-full bg-gradient-to-tr from-white/5 to-transparent"></span>
                      <span className="relative z-10">Register</span>
                    </button>
                  </div>
                  
                  <form onSubmit={handleRegister} className="space-y-4 mb-6">
                    <div>
                      <input
                        type="email"
                        placeholder="Email"
                        className="input-field backdrop-blur-md bg-background/60 border-white/10 focus:border-primary/50 focus:ring-2 focus:ring-primary/20 transition-all duration-300"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                      />
                    </div>
                    <div>
                      <input
                        type="password"
                        placeholder="Password"
                        className="input-field backdrop-blur-md bg-background/60 border-white/10 focus:border-primary/50 focus:ring-2 focus:ring-primary/20 transition-all duration-300"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        minLength={8}
                      />
                    </div>
                    <div>
                      <input
                        type="password"
                        placeholder="Confirm Password"
                        className="input-field backdrop-blur-md bg-background/60 border-white/10 focus:border-primary/50 focus:ring-2 focus:ring-primary/20 transition-all duration-300"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        required
                        minLength={8}
                      />
                    </div>
                    <button type="submit" className="button-primary w-full backdrop-blur-md bg-primary/80 shadow-lg border border-white/10 hover:bg-primary/90 hover:shadow-primary/30 hover:scale-[1.02] transition-all duration-300 relative overflow-hidden group">
                      <span className="absolute inset-0 w-full h-full bg-gradient-to-r from-white/10 via-white/5 to-transparent opacity-0 group-hover:opacity-100 group-hover:translate-x-full transition-all duration-1000"></span>
                      <span className="relative z-10">Register</span>
                    </button>
                  </form>
                </>
              )}
            </div>
          </>
        ) : (
          <>
            <h1 className="text-2xl font-bold text-center mb-8">University Department Information System</h1>
            <p className="text-center text-foreground/70 mb-8">Please select your role to continue</p>
            
            <div className="grid grid-cols-2 gap-4 mb-8">
              {mainRoles.map((role) => {
                const Icon = roleIcons[role];
                return (
                  <button
                    key={role}
                    onClick={() => setSelectedRole(role)}
                    className="flex flex-col items-center p-6 rounded-xl border border-border/50 hover:border-primary/50 transition-all duration-300 group bg-card/80 backdrop-blur-sm hover:shadow-lg hover:shadow-primary/5"
                  >
                    <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-3 group-hover:bg-primary/20 transition-colors">
                      <Icon className="h-6 w-6 text-primary" />
                    </div>
                    <span className="text-sm font-medium">
                      {role === 'head' ? 'Department Head' : role.charAt(0).toUpperCase() + role.slice(1)}
                    </span>
                  </button>
                );
              })}
            </div>
          </>
        )}
      </div>
      
      <div className="mt-6 text-sm text-foreground/60">
        © 2024 University Learning Portal. All rights reserved.
      </div>
    </div>
  );
}