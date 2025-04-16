import React, { useState } from 'react';
import { View, TouchableOpacity, Text, StyleSheet, ActivityIndicator, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { account } from '../services/appwrite';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '../context/AuthContext';
import * as AppleAuthentication from 'expo-apple-authentication';

const SignInWithApple = () => {
  const [loading, setLoading] = useState(false);
  const navigation = useNavigation();
  const { setUser } = useAuth();

  const handleSignIn = async () => {
    try {
      setLoading(true);
      
      // First check if there's an active session
      try {
        const sessions = await account.listSessions();
        for (const session of sessions.sessions) {
          try {
            await account.deleteSession(session.$id);
          } catch (error) {
            console.log(`Failed to delete session ${session.$id}`);
          }
        }
      } catch (error) {
        console.log('No active sessions found');
      }

      // Start native Apple Sign In
      const credential = await AppleAuthentication.signInAsync({
        requestedScopes: [
          AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
          AppleAuthentication.AppleAuthenticationScope.EMAIL,
        ],
      });

      console.log('Apple Sign In successful:', credential);

      try {
        // Generate a consistent user ID based on Apple user info
        const userId = `apple_${credential.user}`;
        const tempEmail = `apple_${credential.user}@temp.com`;

        // Try to create a session for the existing user
        const session = await account.createSession(
          tempEmail,
          credential.identityToken
        );

        console.log('Session created:', session);

        // Get the current user
        const currentUser = await account.get();
        console.log('Current user:', currentUser);

        if (!currentUser) {
          throw new Error('Failed to get user information');
        }

        // Update user state
        if (setUser) {
          setUser(currentUser);
        }

        // Navigate to main screen
        navigation.replace('MainTabs');

      } catch (error) {
        console.error('Session creation error:', error);
        if (error.type === 'user_not_found') {
          // If user not found, try to create a new account
          try {
            const user = await account.create(
              `apple_${credential.user}`,
              `apple_${credential.user}@temp.com`,
              credential.identityToken,
              credential.fullName?.givenName || 'Apple User'
            );

            console.log('New user created:', user);

            // Create session for the new user
            const session = await account.createSession(
              `apple_${credential.user}@temp.com`,
              credential.identityToken
            );

            // Get the current user
            const currentUser = await account.get();
            if (setUser) {
              setUser(currentUser);
            }
            navigation.replace('MainTabs');
          } catch (createError) {
            console.error('Account creation error:', createError);
            Alert.alert('Error', 'Failed to create account. Please try again.');
          }
        } else {
          Alert.alert('Error', error.message || 'Failed to sign in with Apple');
        }
      }

    } catch (error) {
      console.error('Apple Sign In Error:', error);
      if (error.code === 'ERR_CANCELED') {
        Alert.alert('Sign In Canceled', 'You canceled the sign in process.');
      } else {
        Alert.alert('Error', 'Failed to sign in with Apple. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <TouchableOpacity 
      style={styles.button}
      onPress={handleSignIn}
      disabled={loading}
    >
      {loading ? (
        <ActivityIndicator color="#fff" />
      ) : (
        <View style={styles.buttonContent}>
          <Ionicons name="logo-apple" size={20} color="#fff" />
          <Text style={styles.buttonText}>Sign in with Apple</Text>
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

export default SignInWithApple; 