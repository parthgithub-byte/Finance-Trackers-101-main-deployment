import { useState, useEffect } from 'react';

export const useAuth = () => {
  const [userId, setUserId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Sync userId with localStorage on mount
  useEffect(() => {
    const storedId = localStorage.getItem('user_id');
    setUserId(storedId);
    setIsLoading(false);
  }, []);

  const isLoggedIn = !!userId;

  const login = (userId: string) => {
    localStorage.setItem('user_id', userId);
    setUserId(userId);
    // Let the component handle the redirect after login
  };

  const logout = () => {
    localStorage.removeItem('user_id');
    setUserId(null);
    // Let the component handle redirect after logout
  };

  return { userId, isLoggedIn, login, logout, isLoading };
};
