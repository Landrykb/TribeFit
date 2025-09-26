import React, { createContext, useContext, useState, useEffect } from 'react';
import { useToast } from '../ui/Toast';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const toast = useToast();

  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      // Check if user is logged in (check localStorage for demo)
      const savedUser = localStorage.getItem('tribefit_user');
      if (savedUser) {
        setUser(JSON.parse(savedUser));
      }
    } catch (error) {
      console.error('Auth check failed:', error);
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, password) => {
    try {
      // Simulate login API call
      if (email && password) {
        const userData = {
          id: `user-${Date.now()}`,
          email,
          name: email.split('@')[0],
          avatar: null,
          tribe_id: '10000000-0000-0000-0000-000000000001',
          wallet_balance_tc: 500,
          streak_days: 7,
          created_at: new Date().toISOString()
        };
        
        localStorage.setItem('tribefit_user', JSON.stringify(userData));
        setUser(userData);
        toast.success('Welcome to TribeFit! 🎉');
        return { success: true };
      } else {
        throw new Error('Invalid credentials');
      }
    } catch (error) {
      toast.error(error.message || 'Login failed');
      return { success: false, error: error.message };
    }
  };

  const signup = async (email, password, name) => {
    try {
      // Simulate signup API call
      if (email && password && name) {
        const userData = {
          id: `user-${Date.now()}`,
          email,
          name,
          avatar: null,
          tribe_id: null,
          wallet_balance_tc: 100, // Welcome bonus
          streak_days: 0,
          created_at: new Date().toISOString()
        };
        
        localStorage.setItem('tribefit_user', JSON.stringify(userData));
        setUser(userData);
        toast.success('Account created successfully! Welcome! 🎉');
        return { success: true };
      } else {
        throw new Error('All fields are required');
      }
    } catch (error) {
      toast.error(error.message || 'Signup failed');
      return { success: false, error: error.message };
    }
  };

  const logout = () => {
    localStorage.removeItem('tribefit_user');
    setUser(null);
    toast.info('Logged out successfully');
  };

  const updateUser = (updates) => {
    const updatedUser = { ...user, ...updates };
    setUser(updatedUser);
    localStorage.setItem('tribefit_user', JSON.stringify(updatedUser));
  };

  const value = {
    user,
    loading,
    login,
    signup,
    logout,
    updateUser,
    isAuthenticated: !!user
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};