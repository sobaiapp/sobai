import React, { createContext, useState, useContext, useEffect } from 'react';
import { account, databases } from '../services/appwrite';
import { getUserProfile, loginUser, verifySession } from '../services/appwrite';

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
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const updateProfile = (newProfile) => {
    setProfile(newProfile);
  };

  const loadUserData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Verify session first
      const isSessionValid = await verifySession();
      if (!isSessionValid) {
        setUser(null);
        setProfile(null);
        return;
      }
      
      // Get current user
      const currentUser = await account.get();
      if (!currentUser) {
        setUser(null);
        setProfile(null);
        return;
      }
      
      setUser(currentUser);
      
      // Get user profile
      try {
        const userProfile = await getUserProfile(currentUser.$id);
        setProfile(userProfile);
      } catch (error) {
        console.error('Error loading profile:', error);
        setProfile(null);
      }
    } catch (error) {
      console.error('Error loading user data:', error);
      setError(error.message);
      setUser(null);
      setProfile(null);
    } finally {
      setLoading(false);
    }
  };

  // Check session on mount and when user changes
  useEffect(() => {
    const checkSession = async () => {
      await loadUserData();
    };
    checkSession();
  }, []);

  const login = async (email, password) => {
    try {
      setLoading(true);
      setError(null);
      
      // Login user
      const loggedInUser = await loginUser(email, password);
      if (!loggedInUser) {
        throw new Error('Failed to login');
      }
      
      // Clear any existing state
      setUser(null);
      setProfile(null);
      
      // Load fresh user data
      await loadUserData();
      
      return loggedInUser;
    } catch (error) {
      console.error('Login error:', error);
      setError(error.message);
      setUser(null);
      setProfile(null);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      setLoading(true);
      // Try to delete current session first
      try {
        await account.deleteSession('current');
      } catch (error) {
        console.log('No current session to delete');
      }
      
      // Clear all state regardless of session deletion result
      setUser(null);
      setProfile(null);
      setError(null);
    } catch (error) {
      console.error('Logout error:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const value = {
    user,
    profile,
    loading,
    error,
    login,
    logout,
    updateProfile,
    loadUserData
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
