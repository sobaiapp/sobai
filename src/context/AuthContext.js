import React, { createContext, useState, useContext, useEffect } from 'react';
import { account, databases } from '../services/appwrite';
import { getUserProfile, loginUser, verifySession, logoutUser } from '../services/appwrite';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { CommonActions } from '@react-navigation/native';

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
  const [navigation, setNavigation] = useState(null);

  const setNavigationRef = (nav) => {
    setNavigation(nav);
  };

  const clearAllData = async () => {
    try {
      // Clear AsyncStorage
      const keys = await AsyncStorage.getAllKeys();
      await AsyncStorage.multiRemove(keys);
      
      // Clear React state
      setUser(null);
      setProfile(null);
      setError(null);
      
      // Clear navigation state
      if (navigation) {
        navigation.dispatch(
          CommonActions.reset({
            index: 0,
            routes: [{ name: 'Start' }],
          })
        );
      }
    } catch (error) {
      console.error('Error clearing all data:', error);
    }
  };

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
        await clearAllData();
        return;
      }
      
      // Get current user
      const currentUser = await account.get();
      if (!currentUser) {
        await clearAllData();
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
      await clearAllData();
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
      
      // Clear all data before login
      await clearAllData();
      
      // Login user
      const session = await account.createEmailSession(email, password);
      const accountData = await account.get();
      
      // Set user data
      setUser(accountData);
      
      // Load fresh profile data
      try {
        const userProfile = await getUserProfile(accountData.$id);
        setProfile(userProfile);
      } catch (error) {
        console.error('Error loading profile:', error);
        setProfile(null);
      }
      
      return session;
    } catch (error) {
      console.error('Login error:', error);
      setError(error.message);
      await clearAllData();
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Clear all data
      await clearAllData();
      
      // Then logout from Appwrite
      await logoutUser();
      
    } catch (error) {
      console.error('Logout error:', error);
      setError(error.message);
      throw error;
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
    loadUserData,
    setNavigationRef
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
