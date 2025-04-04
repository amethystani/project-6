import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { useAuthStore, guestUsers } from '../store/auth';
import { UserRole } from '../types';
import { Moon, Sun, User, ChevronLeft, GraduationCap, BookOpen, Shield, BarChart, LucideIcon } from 'lucide-react';
import { useTheme } from '../components/ThemeProvider';
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
  const { theme, toggleTheme } = useTheme();

  const checkUser = async () => {
    if (!email) {
      toast.error('Please enter your email');
      return;
    }

    try {
      const response = await fetch('http://localhost:5001/auth/check-user', {
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
      const response = await fetch('http://localhost:5001/auth/setup-password', {
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

    // Set a fixed access code for faculty, admin, and head roles
    const accessCodeValue = "snu";
    
    // Map role to backend format
    const backendRole = mapRoleToBackend(selectedRole);

    try {
      // Make API call to the backend login endpoint
      const response = await fetch('http://localhost:5001/auth/login', {
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

    // Set a fixed access code for faculty, admin, and head roles
    const accessCodeValue = "snu";
    
    // Map role to backend format
    const backendRole = mapRoleToBackend(selectedRole);

    try {
      const response = await fetch('http://localhost:5001/auth/register', {
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
        // Don't automatically sign in
        // localStorage.setItem('token', data.access_token);
        // setUser(data.user);
        toast.success('Registration successful! Please sign in with your new account.');
        
        // Switch to login mode and keep the email filled
        setIsRegisterMode(false);
        setPassword('');
        // navigate('/dashboard');
      } else {
        toast.error(data.message || 'Registration failed');
      }
    } catch (error) {
      console.error('Registration error:', error);
      toast.error('Failed to register. Please try again later.');
    }
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

        <div className="glass-card w-full max-w-md">
          <div className="flex justify-center mb-6">
            <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
              <User className="h-6 w-6 text-primary" />
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
            <button type="submit" className="button-primary w-full">
              Set Password & Login
            </button>
          </form>
        </div>
      </div>
    );
  }

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
                      className="button-primary px-8"
                      onClick={() => setIsRegisterMode(false)}
                    >
                      Login
                    </button>
                    <button 
                      className="button-secondary px-8"
                      onClick={() => setIsRegisterMode(true)}
                    >
                      Register
                    </button>
                  </div>
                  
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
                    <div className="flex">
                      <input
                        type="password"
                        placeholder="Password"
                        className="input-field flex-1"
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
                          value="snu"
                          readOnly
                          required
                        />
                      </div>
                    )}
                    <button type="submit" className="button-primary w-full">
                      Login
                    </button>
                  </form>
                </>
              ) : (
                <>
                  <div className="flex justify-center gap-4 mb-6">
                    <button 
                      className="button-secondary px-8"
                      onClick={() => setIsRegisterMode(false)}
                    >
                      Login
                    </button>
                    <button 
                      className="button-primary px-8"
                      onClick={() => setIsRegisterMode(true)}
                    >
                      Register
                    </button>
                  </div>
                  
                  <form onSubmit={handleRegister} className="space-y-4 mb-6">
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
                    {['faculty', 'admin', 'head'].includes(selectedRole) && (
                      <div>
                        <input
                          type="password"
                          placeholder={`${selectedRole.charAt(0).toUpperCase() + selectedRole.slice(1)} Access Code`}
                          className="input-field"
                          value="snu"
                          readOnly
                          required
                        />
                      </div>
                    )}
                    <button type="submit" className="button-primary w-full">
                      Register
                    </button>
                  </form>
                </>
              )}
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