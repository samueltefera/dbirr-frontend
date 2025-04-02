// lib/context/AuthContext.tsx
'use client'; // This context will be used in client components

import React, { createContext, useState, useContext, useEffect, ReactNode, useCallback } from 'react';
import api from '../api'; // Import your API client

// Define the shape of the user object based on your backend response
interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  brandColor: string;
  useDefaultTheme: boolean;
  toggleDarkMode: boolean;
  useDevnet: boolean;
  walletAddress: string; // Added this field
  // Add other relevant fields returned by GET /users/me
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  login: (token: string, userData: User) => void;
  logout: () => void;
  refetchUser: () => Promise<void>; // Function to manually refetch user data
  updateUserLocally: (updatedData: Partial<User>) => void; // Update local user state
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true); // Start loading until check is done

  const fetchUserProfile = useCallback(async (currentToken: string) => {
    setIsLoading(true);
    try {
      const response = await api.get('/users/me', {
        headers: { Authorization: `Bearer ${currentToken}` }, // Explicitly pass token here too
      });
      setUser(response.data);
      setToken(currentToken);
    } catch (error) {
      console.error('Failed to fetch user profile:', error);
      localStorage.removeItem('dbirr_token'); // Clear invalid token
      setUser(null);
      setToken(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Check for token on initial load
  useEffect(() => {
    const storedToken = localStorage.getItem('dbirr_token');
    if (storedToken) {
      fetchUserProfile(storedToken);
    } else {
      setIsLoading(false); // No token, stop loading
    }
  }, [fetchUserProfile]);

  const login = (newToken: string, userData: User) => {
    localStorage.setItem('dbirr_token', newToken);
    setToken(newToken);
    setUser(userData);
  };

  const logout = () => {
    localStorage.removeItem('dbirr_token');
    setToken(null);
    setUser(null);
    // Optional: Redirect to login using router if needed
    // router.push('/auth/login');
  };

  const refetchUser = async () => {
    const currentToken = localStorage.getItem('dbirr_token');
    if (currentToken) {
      await fetchUserProfile(currentToken);
    } else {
        logout(); // Ensure logged out state if token disappears
    }
  };

   const updateUserLocally = (updatedData: Partial<User>) => {
     setUser(prevUser => prevUser ? { ...prevUser, ...updatedData } : null);
   };

  return (
    <AuthContext.Provider value={{ user, token, isLoading, login, logout, refetchUser, updateUserLocally }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};