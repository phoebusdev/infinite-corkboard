import { StateCreator } from 'zustand';
import { AuthSlice } from '@/types/store';

export const createAuthSlice: StateCreator<AuthSlice> = (set) => ({
  isAuthenticated: false,
  isLoading: false,

  setIsAuthenticated: (isAuthenticated) => set({ isAuthenticated }),

  setIsLoading: (isLoading) => set({ isLoading }),
});
