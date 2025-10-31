'use client';

import { useState } from 'react';
import { useAuth } from '@/lib/hooks/use-auth';

export default function AuthDialog() {
  const [password, setPassword] = useState('');
  const [showDialog, setShowDialog] = useState(false);
  const { isAuthenticated, login, logout, isLoading } = useAuth();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    const result = await login(password);
    if (result.success) {
      setPassword('');
      setShowDialog(false);
    }
  };

  if (isAuthenticated) {
    return (
      <button
        onClick={logout}
        disabled={isLoading}
        className="fixed top-4 right-4 z-50 bg-red-500 text-white px-4 py-2 rounded shadow-lg hover:bg-red-600 disabled:opacity-50"
      >
        {isLoading ? 'Logging out...' : 'Logout'}
      </button>
    );
  }

  return (
    <>
      <button
        onClick={() => setShowDialog(true)}
        className="fixed top-4 right-4 z-50 bg-blue-500 text-white px-4 py-2 rounded shadow-lg hover:bg-blue-600"
      >
        Login to Edit
      </button>

      {showDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-xl max-w-md w-full">
            <h2 className="text-2xl font-bold mb-4">Admin Login</h2>
            <form onSubmit={handleLogin}>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter password"
                className="w-full px-3 py-2 border border-gray-300 rounded mb-4"
                autoFocus
                disabled={isLoading}
              />
              <div className="flex gap-2">
                <button
                  type="submit"
                  disabled={isLoading}
                  className="flex-1 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 disabled:opacity-50"
                >
                  {isLoading ? 'Logging in...' : 'Login'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowDialog(false);
                    setPassword('');
                  }}
                  disabled={isLoading}
                  className="flex-1 bg-gray-300 text-gray-800 px-4 py-2 rounded hover:bg-gray-400 disabled:opacity-50"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
