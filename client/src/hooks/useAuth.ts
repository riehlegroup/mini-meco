import { useState, useEffect } from "react";
import AuthStorage from "@/services/storage/auth";
import { User } from "@/types/models";

/**
 * Custom hook for authentication state and operations.
 * Provides login, logout, and user state management.
 */
export const useAuth = () => {
  const authStorage = AuthStorage.getInstance();
  const [user, setUser] = useState<Partial<User> | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    // Initialize auth state from localStorage
    const storedUser = authStorage.getUser();
    const hasToken = authStorage.isAuthenticated();

    setUser(storedUser);
    setIsAuthenticated(hasToken);
    setIsLoading(false);
  }, []);

  const login = (token: string, userData: Partial<User>) => {
    authStorage.setToken(token);
    authStorage.setUser(userData);
    setUser(userData);
    setIsAuthenticated(true);
  };

  const logout = () => {
    authStorage.clear();
    setUser(null);
    setIsAuthenticated(false);
  };

  const updateUser = (userData: Partial<User>) => {
    authStorage.setUser(userData);
    setUser((prev) => ({ ...prev, ...userData }));
  };

  return {
    user,
    isAuthenticated,
    isLoading,
    login,
    logout,
    updateUser,
    getToken: () => authStorage.getToken(),
    getEmail: () => authStorage.getEmail(),
    getUserRole: () => authStorage.getUserRole(),
  };
};
