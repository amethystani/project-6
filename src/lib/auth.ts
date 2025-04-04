import { useAuthStore } from '../store/auth';

export function useAuth() {
  const { user, isLoading, logout, verifyToken } = useAuthStore();
  
  // Get token from localStorage
  const token = localStorage.getItem('token');
  
  return {
    user,
    token,
    logout,
    isLoading,
    verifyToken,
    isAuthenticated: !!user
  };
} 