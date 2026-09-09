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
      if (!email || !password) throw new Error('Invalid credentials');

      const name = email.split('@')[0];
      const res = await fetch('/api/dev/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'create', name, email })
      });

      let userData;
      if (res.ok) {
        const data = await res.json();
        userData = data.user;
      } else {
        // Fallback for local/offline login
        userData = {
          id: `user-${Date.now()}`,
          email,
          name,
          avatar_url: null,
          wallet_balance_tc: 500,
          snatched_balance_tc: 0,
          streak: 0,
          total_workouts: 0,
          group_id: null,
          group_type: null,
          created_at: new Date().toISOString()
        };
      }

      localStorage.setItem('tribefit_user', JSON.stringify(userData));
      setUser(userData);
      toast.success('Welcome to TribeFit! 🎉');
      return { success: true };
    } catch (error) {
      toast.error(error.message || 'Login failed');
      return { success: false, error: error.message };
    }
  };

  const signup = async (email, password, name) => {
    try {
      // Simulate signup API call
      if (email && password && name) {
        const userId = `user_${Date.now()}`;
        const userData = {
          id: userId,
          email,
          name,
          avatar: null,
          tribe_id: null,
          wallet_balance_tc: 100, // Welcome bonus
          snatched_balance_tc: 0,
          streak: 0,
          total_workouts: 0,
          group_type: null,
          created_at: new Date().toISOString()
        };
        
        // Add user to database (for dev mode)
        try {
          await fetch('/api/dev/users', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
              action: 'create', 
              name: name,
              userId: userId,
              initialData: userData
            })
          });
        } catch (dbError) {
          console.log('Note: Could not add to database, but user created locally');
        }
        
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