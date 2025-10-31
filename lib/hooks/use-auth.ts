import { useCallback } from 'react';
import { toast } from 'sonner';
import { useStore } from '@/lib/store';
import {
  authenticate as authenticateAction,
  logout as logoutAction,
} from '@/app/actions';

export function useAuth() {
  const isAuthenticated = useStore((state) => state.isAuthenticated);
  const setIsAuthenticated = useStore((state) => state.setIsAuthenticated);
  const setIsLoading = useStore((state) => state.setIsLoading);
  const isLoading = useStore((state) => state.isLoading);

  const login = useCallback(
    async (password: string) => {
      setIsLoading(true);

      try {
        const result = await authenticateAction(password);

        if (result.success) {
          setIsAuthenticated(true);
          toast.success('Logged in successfully');
        } else {
          toast.error(result.error || 'Invalid password');
        }

        return result;
      } finally {
        setIsLoading(false);
      }
    },
    [setIsAuthenticated, setIsLoading]
  );

  const logout = useCallback(async () => {
    setIsLoading(true);

    try {
      await logoutAction();
      setIsAuthenticated(false);
      toast.success('Logged out successfully');
    } finally {
      setIsLoading(false);
    }
  }, [setIsAuthenticated, setIsLoading]);

  return {
    isAuthenticated,
    isLoading,
    login,
    logout,
  };
}
