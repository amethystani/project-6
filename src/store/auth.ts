import { create } from 'zustand';
import { User, UserRole } from '../types';

interface AuthState {
  user: User | null;
  isLoading: boolean;
  setUser: (user: User | null) => void;
  setLoading: (loading: boolean) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isLoading: false,
  setUser: (user) => set({ user }),
  setLoading: (loading) => set({ isLoading: loading }),
  logout: () => set({ user: null }),
}));

// Guest login data for demo purposes
export const guestUsers: Record<UserRole, User> = {
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