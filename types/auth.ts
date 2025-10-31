export interface AuthState {
  isAuthenticated: boolean;
  isLoading: boolean;
}

export interface LoginResult {
  success: boolean;
  error?: string;
}
