import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { useAuthStore, guestUsers } from '../store/auth';
import { UserRole } from '../types';
import { Moon, Sun, User } from 'lucide-react';
import { useTheme } from '../components/ThemeProvider';
import { cn } from '../lib/utils';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { setUser } = useAuthStore();
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    toast.error('Regular login not implemented in demo');
  };

  const handleGuestLogin = (role: UserRole) => {
    setUser(guestUsers[role]);
    toast.success(`Logged in as ${role}`);
    navigate('/dashboard');
  };

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
          <User className="h-12 w-12 text-primary" />
        </div>
        <h1 className="text-2xl font-bold text-center mb-6">Login to UDIS</h1>

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
          <button type="submit" className="button-primary w-full">
            Login
          </button>
        </form>

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

        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={() => handleGuestLogin('student')}
            className="button-secondary"
          >
            Student
          </button>
          <button
            onClick={() => handleGuestLogin('faculty')}
            className="button-secondary"
          >
            Faculty
          </button>
          <button
            onClick={() => handleGuestLogin('admin')}
            className="button-secondary"
          >
            Admin
          </button>
          <button
            onClick={() => handleGuestLogin('head')}
            className="button-secondary"
          >
            Department Head
          </button>
        </div>
      </div>
    </div>
  );
}