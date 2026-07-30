import { create } from 'zustand';
import { authAPI } from '@/lib/api';
import { resetRefreshState } from '@/lib/api';

interface User {
  id: number;
  email: string;
  first_name: string;
  last_name: string;
  phone_number?: string;
  email_verified?: boolean;
  referral_code?: string;
  is_staff?: boolean;
  is_superuser?: boolean;
  is_active?: boolean;
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isInitialized: boolean;
  login: (email: string, password: string, captchaToken?: string) => Promise<void>;
  register: (data: any) => Promise<void>;
  logout: () => Promise<void>;
  fetchUser: () => Promise<void>;
  updateUser: (userData: User) => void;
  initialize: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  isAuthenticated: false,
  isLoading: false,
  isInitialized: false,
  
  initialize: async () => {
    if (get().isInitialized) return;
    
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('access_token');
      if (token) {
        set({ isLoading: true });
        try {
          const response = await authAPI.getCurrentUser();
          set({ 
            user: response.data, 
            isAuthenticated: true, 
            isLoading: false,
            isInitialized: true 
          });
        } catch (error) {
          // Token might be invalid, clear it
          localStorage.removeItem('access_token');
          localStorage.removeItem('refresh_token');
          set({ 
            user: null, 
            isAuthenticated: false, 
            isLoading: false,
            isInitialized: true 
          });
        }
      } else {
        set({ isInitialized: true });
      }
    }
  },
  
  login: async (email: string, password: string, captchaToken?: string) => {
    set({ isLoading: true });
    try {
      const response = await authAPI.login(email, password, captchaToken);
      const { tokens } = response.data;
      if (tokens && typeof window !== 'undefined') {
        localStorage.setItem('access_token', tokens.access);
        localStorage.setItem('refresh_token', tokens.refresh);
      }
      // Reset refresh state for new session
      resetRefreshState();
      // Fetch user to get updated user data including is_staff
      await get().fetchUser();
      set({ isAuthenticated: true, isLoading: false, isInitialized: true });
    } catch (error: any) {
      set({ isLoading: false });
      throw error;
    }
  },
  
  register: async (data: any) => {
    set({ isLoading: true });
    try {
      // Registration no longer authenticates the user — they must verify their
      // email first, then log in. So we do NOT store tokens or set
      // isAuthenticated here; the register page shows a "check your email" view.
      await authAPI.register(data);
      set({ isLoading: false });
    } catch (error: any) {
      set({ isLoading: false });
      throw error;
    }
  },
  
  logout: async () => {
    try {
      await authAPI.logout();
    } catch (error) {
      // Continue with logout even if API call fails
    } finally {
      if (typeof window !== 'undefined') {
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
      }
      set({ user: null, isAuthenticated: false });
    }
  },
  
  fetchUser: async () => {
    try {
      const response = await authAPI.getCurrentUser();
      set({ user: response.data, isAuthenticated: true, isLoading: false });
    } catch (error) {
      // If fetch fails, clear tokens
      if (typeof window !== 'undefined') {
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
      }
      set({ user: null, isAuthenticated: false, isLoading: false });
    }
  },
  
  updateUser: (userData: User) => {
    set({ user: userData });
  },
}));

