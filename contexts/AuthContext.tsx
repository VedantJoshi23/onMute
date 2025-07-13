import * as SecureStore from 'expo-secure-store';
import React, { createContext, useContext, useEffect, useState } from 'react';

interface User {
  id: string;
  email: string;
  name: string;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string, name?: string) => Promise<boolean>;
  register: (email: string, password: string, name: string) => Promise<boolean>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const USER_KEY = 'userData';
const TOKEN_KEY = 'authToken';

// Helper function to create valid SecureStore keys from email addresses
const sanitizeEmailForKey = (email: string): string => {
  return `user_${email.replace(/[^a-zA-Z0-9._-]/g, '-')}`;
};

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
    try {
      console.log('Loading user data...');
      const userData = await SecureStore.getItemAsync(USER_KEY);
      const token = await SecureStore.getItemAsync(TOKEN_KEY);
      
      console.log('Stored userData:', userData ? 'Found' : 'Not found');
      console.log('Stored token:', token ? 'Found' : 'Not found');
      
      if (userData && token) {
        const parsedUser = JSON.parse(userData);
        console.log('Restoring user session for:', parsedUser.email);
        setUser(parsedUser);
        console.log('Authentication state updated - isAuthenticated will be:', true);
      } else {
        console.log('No valid session found');
        console.log('Authentication state updated - isAuthenticated will be:', false);
      }
    } catch (error) {
      console.error('Failed to load user data:', error);
    } finally {
      setIsLoading(false);
      console.log('Authentication check complete - isLoading set to false');
    }
  };

  const login = async (email: string, password: string, name?: string): Promise<boolean> => {
    try {
      console.log('Attempting login for:', email);
      // Check if user exists by looking for user data with sanitized email as key
      const sanitizedKey = sanitizeEmailForKey(email);
      const existingUserData = await SecureStore.getItemAsync(sanitizedKey);
      
      if (existingUserData) {
        console.log('User found in storage');
        const existingUser = JSON.parse(existingUserData);
        if (existingUser.password === password) {
          console.log('Password matches, logging in user');
          const userData: User = {
            id: existingUser.id,
            email: existingUser.email,
            name: existingUser.name,
          };
          
          // Store current session data for persistence
          await SecureStore.setItemAsync(USER_KEY, JSON.stringify(userData));
          await SecureStore.setItemAsync(TOKEN_KEY, 'authenticated');
          setUser(userData);
          console.log('Login successful');
          return true;
        } else {
          console.log('Password does not match');
        }
      } else {
        console.log('User not found in storage');
      }
      return false;
    } catch (error) {
      console.error('Login failed:', error);
      return false;
    }
  };

  const register = async (email: string, password: string, name: string): Promise<boolean> => {
    try {
      console.log('Attempting registration for:', email);
      // Check if user already exists
      const sanitizedKey = sanitizeEmailForKey(email);
      const existingUserData = await SecureStore.getItemAsync(sanitizedKey);
      if (existingUserData) {
        console.log('User already exists');
        return false; // User already exists
      }

      console.log('Creating new user');
      const newUser = {
        id: Date.now().toString(),
        email,
        password, // In a real app, this should be hashed
        name,
      };

      const userData: User = {
        id: newUser.id,
        email: newUser.email,
        name: newUser.name,
      };

      // Store user credentials with sanitized email key for login lookup
      await SecureStore.setItemAsync(sanitizedKey, JSON.stringify(newUser));
      // Store current session data for persistence
      await SecureStore.setItemAsync(USER_KEY, JSON.stringify(userData));
      await SecureStore.setItemAsync(TOKEN_KEY, 'authenticated');
      
      setUser(userData);
      console.log('Registration successful');
      return true;
    } catch (error) {
      console.error('Registration failed:', error);
      return false;
    }
  };

  const logout = async () => {
    try {
      console.log('Logging out user');
      // Only clear session data, keep user credentials for future login
      await SecureStore.deleteItemAsync(USER_KEY);
      await SecureStore.deleteItemAsync(TOKEN_KEY);
      setUser(null);
      console.log('Logout successful');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  const value: AuthContextType = {
    user,
    isLoading,
    isAuthenticated: !!user,
    login,
    register,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
