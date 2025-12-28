import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useMutation, useQuery } from 'convex/react';
import { api } from '@/convex/_generated/api';

interface User {
  id: string;
  email: string;
  name: string;
  onboardingCompleted: boolean;
  dailyCalorieGoal?: number;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  loading: boolean;
  signIn: (token: string) => Promise<void>;
  signOut: () => Promise<void>;
  refreshUser: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const getCurrentUser = useQuery(api.auth.getCurrentUser, token ? { token } : 'skip');
  const signOutMutation = useMutation(api.auth.signOut);

  // Load token from storage on app start
  useEffect(() => {
    loadStoredToken();
  }, []);

  // Update user when getCurrentUser query returns
  useEffect(() => {
    if (token && getCurrentUser !== undefined) {
      setUser(getCurrentUser);
      setLoading(false);
    } else if (token && getCurrentUser === null) {
      // Token is invalid, clear it
      signOut();
    } else if (!token) {
      setLoading(false);
    }
  }, [getCurrentUser, token, refreshTrigger]);

  const loadStoredToken = async () => {
    try {
      const storedToken = await AsyncStorage.getItem('auth_token');
      if (storedToken) {
        setToken(storedToken);
      } else {
        setLoading(false);
      }
    } catch (error) {
      console.error('Error loading token:', error);
      setLoading(false);
    }
  };

  const signIn = async (authToken: string) => {
    try {
      await AsyncStorage.setItem('auth_token', authToken);
      setToken(authToken);
    } catch (error) {
      console.error('Error storing token:', error);
      throw error;
    }
  };

  const signOut = async () => {
    try {
      // Clear local storage first
      await AsyncStorage.removeItem('auth_token');
      setToken(null);
      setUser(null);
      setLoading(false);
    } catch (error) {
      console.error('Sign out error:', error);
    }
  };

  const refreshUser = () => {
    setRefreshTrigger(prev => prev + 1);
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, signIn, signOut, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}