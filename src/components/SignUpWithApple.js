import React, { useState } from 'react';
import { View, TouchableOpacity, Text, StyleSheet, ActivityIndicator, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { account, databases, DATABASE_ID, ID, PROFILES_COLLECTION_ID } from '../services/appwrite';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '../context/AuthContext';
import * as AppleAuthentication from 'expo-apple-authentication';

const SignUpWithApple = () => {
  const [loading, setLoading] = useState(false);
  const navigation = useNavigation();
  const { setUser } = useAuth();

  const handleSignUp = async () => {
    try {
      setLoading(true);
      
      // Start native Apple Sign In
      const credential = await AppleAuthentication.signInAsync({
        requestedScopes: [
          AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
          AppleAuthentication.AppleAuthenticationScope.EMAIL,
        ],
      });

      console.log('Apple Sign In successful:', credential);

      // Generate a valid user ID (max 36 chars, only alphanumeric, hyphen, underscore)
      const userId = `apple_${credential.user.slice(0, 8)}`;
      const tempEmail = `apple_${credential.user.slice(0, 8)}@temp.com`;
      
      // Generate a secure password that meets Appwrite's requirements
      const securePassword = `Apple_${credential.identityToken.slice(0, 8)}_${Date.now()}`;

      try {
        // First try to create a session for existing user
        try {
          const session = await account.createSession(
            tempEmail,
            securePassword
          );
          console.log('Session created for existing user:', session);
          
          const user = await account.get();
          console.log('Existing user found:', user);

          // Create or update profile
          try {
            const currentDate = new Date().toISOString();
            const profileData = {
              name: credential.fullName?.givenName || 'Apple User',
              email: tempEmail,
              userId: user.$id,
              createdAt: currentDate,
              cleanDate: currentDate,
              updatedAt: currentDate,
              type: 'user'
            };
            
            console.log('Creating/updating profile with data:', profileData);
            
            const profile = await databases.createDocument(
              DATABASE_ID,
              PROFILES_COLLECTION_ID,
              user.$id, // Use the same ID as the user
              profileData
            );
            
            console.log('Profile created/updated successfully:', profile);
          } catch (profileError) {
            console.error('Error creating/updating profile:', profileError);
            // Continue even if profile creation fails
          }

          if (setUser) {
            setUser(user);
          }
          navigation.navigate('Main'); // Changed from MainTabs to Main
          return;
        } catch (sessionError) {
          console.log('No existing session, creating new user');
        }

        // If no existing user, create a new one
        const user = await account.create(
          userId,
          tempEmail,
          securePassword,
          credential.fullName?.givenName || 'Apple User'
        );

        console.log('New user created:', user);

        // Create user profile
        try {
          const currentDate = new Date().toISOString();
          const profileData = {
            userId: user.$id,
            name: credential.fullName?.givenName || 'Apple User',
            email: tempEmail,
            createdAt: currentDate,
            updatedAt: currentDate,
            cleanDate: currentDate,
            avatar: null,
            streak: 0,
            milestones: [],
            friends: [],
            bio: null
          };
          
          console.log('Creating profile with data:', profileData);
          
          const profile = await databases.createDocument(
            DATABASE_ID,
            PROFILES_COLLECTION_ID,
            user.$id, // Use the same ID as the user
            profileData
          );
          
          console.log('Profile created successfully:', profile);
        } catch (profileError) {
          console.error('Error creating profile:', profileError);
          // Continue even if profile creation fails
        }

        if (setUser) {
          setUser(user);
        }

        // Navigate to main screen
        navigation.navigate('MainTabs');

      } catch (error) {
        console.error('Sign up error:', error);
        Alert.alert('Error', error.message || 'Failed to create account');
      }

    } catch (error) {
      console.error('Apple Sign In Error:', error);
      if (error.code === 'ERR_CANCELED') {
        Alert.alert('Sign Up Canceled', 'You canceled the sign up process.');
      } else {
        Alert.alert('Error', 'Failed to sign up with Apple. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <TouchableOpacity 
      style={styles.button}
      onPress={handleSignUp}
      disabled={loading}
    >
      {loading ? (
        <ActivityIndicator color="#fff" />
      ) : (
        <View style={styles.buttonContent}>
          <Ionicons name="logo-apple" size={20} color="#fff" />
          <Text style={styles.buttonText}>Sign up with Apple</Text>
        </View>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    backgroundColor: '#000',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
});

export default SignUpWithApple; 