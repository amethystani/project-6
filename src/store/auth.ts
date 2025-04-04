import { create } from 'zustand';
import { User, UserRole } from '../types';
import { persist } from 'zustand/middleware';

// Helper function to map backend role names to frontend role names
const mapRoleFromBackend = (role: string): UserRole => {
  return role === 'department_head' ? 'head' : role as UserRole;
};

interface AuthState {
  user: User | null;
  isLoading: boolean;
  setUser: (user: User | null) => void;
  setLoading: (loading: boolean) => void;
  logout: () => void;
  verifyToken: () => Promise<void>;
}

// Try to get the user from localStorage for initial state
const getInitialState = () => {
  try {
    const storedUser = localStorage.getItem('user');
    return storedUser ? JSON.parse(storedUser) : null;
  } catch (e) {
    console.error('Failed to parse stored user', e);
    return null;
  }
};

// Track the last time we verified a token to prevent excessive requests
let lastVerified = 0;
const THROTTLE_MS = 2000; // Minimum 2 seconds between verification attempts

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: getInitialState(),
      isLoading: false,
      setUser: (user) => {
        // Map backend role to frontend role if needed
        if (user && user.role === 'department_head') {
          user = { ...user, role: 'head' };
        }
        
        // Also store in localStorage for redundancy
        if (user) {
          localStorage.setItem('user', JSON.stringify(user));
        } else {
          localStorage.removeItem('user');
        }
        set({ user });
      },
      setLoading: (loading) => set({ isLoading: loading }),
      logout: () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        set({ user: null });
      },
      verifyToken: async () => {
        // Throttle verification requests
        const now = Date.now();
        if (now - lastVerified < THROTTLE_MS) {
          console.log('Verification throttled, skipping...');
          return;
        }
        
        const token = localStorage.getItem('token');
        if (!token) {
          // Only update state if there's a change
          if (get().user !== null) {
            set({ user: null, isLoading: false });
          }
          return;
        }
        
        // Don't set loading if we're already loaded and have a user
        // This prevents flicker when refreshing a valid token
        if (!get().user) {
          set({ isLoading: true });
        }
        
        lastVerified = now;
        
        try {
          const response = await fetch('http://localhost:5001/auth/verify-token', {
            method: 'GET',
            headers: {
              'Authorization': `Bearer ${token}`
            }
          });
          
          if (!response.ok) {
            throw new Error(`Server returned ${response.status}`);
          }
          
          const data = await response.json();
          
          if (data.success) {
            // Map backend role to frontend role if needed
            if (data.user.role === 'department_head') {
              data.user.role = 'head';
            }
            
            // Only update if there's a change to avoid re-renders
            if (JSON.stringify(get().user) !== JSON.stringify(data.user)) {
              set({ user: data.user });
              // Also update localStorage
              localStorage.setItem('user', JSON.stringify(data.user));
            }
          } else {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            set({ user: null });
          }
        } catch (error) {
          console.error('Token verification error:', error);
          // Don't remove token on network errors to prevent logout on temporary issues
          if (error instanceof Error && error.message.includes('Server returned')) {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            set({ user: null });
          }
        } finally {
          // Only update loading state if it's different from current
          if (get().isLoading) {
            set({ isLoading: false });
          }
        }
      }
    }),
    {
      name: 'auth-storage',
      // Only store the user
      partialize: (state) => ({ user: state.user }),
    }
  )
);

// Guest login data for demo purposes
export const guestUsers: Record<Exclude<UserRole, 'department_head'>, User> = {
  student: {
    id: 'guest-student',
    email: 'student@demo.com',
    role: 'student',
    name: 'Demo Student',
  },
  faculty: {
    id: 'guest-faculty',
    email: 'faculty@demo.com',
    role: 'faculty',
    name: 'Demo Faculty',
  },
  admin: {
    id: 'guest-admin',
    email: 'admin@demo.com',
    role: 'admin',
    name: 'Demo Admin',
  },
  head: {
    id: 'guest-head',
    email: 'head@demo.com',
    role: 'head',
    name: 'Demo Department Head',
  },
  guest: {
    id: 'guest',
    email: 'guest@demo.com',
    role: 'guest',
    name: 'Guest User',
  },
};