import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Modal, Button, Alert, Animated } from 'react-native';
import * as Haptic from 'expo-haptics';
import { Video } from 'expo-av';
import { Ionicons, FontAwesome, AntDesign } from '@expo/vector-icons'; // Importing icons
import * as AppleAuthentication from 'expo-apple-authentication';
import { account } from '../appwrite/config';
import AsyncStorage from '@react-native-async-storage/async-storage';

const StartScreen = ({ navigation }) => {
  const [modalVisible, setModalVisible] = useState(false);
  const [isAppleAuthAvailable, setIsAppleAuthAvailable] = useState(false);
  const [slideAnim] = useState(new Animated.Value(0));

  useEffect(() => {
    // Check if Apple Sign In is available on the device
    const checkAppleAuth = async () => {
      const isAvailable = await AppleAuthentication.isAvailableAsync();
      setIsAppleAuthAvailable(isAvailable);
    };
    checkAppleAuth();
  }, []);

  // Handle the button press with haptic feedback
  const handleGetStarted = async () => {
    await Haptic.impactAsync(Haptic.ImpactFeedbackStyle.Medium);
    navigation.navigate('Onboarding');
  };

  const handleLogin = async () => {
    await Haptic.impactAsync(Haptic.ImpactFeedbackStyle.Light);
    setModalVisible(true);
    // Animate the modal slide up
    Animated.timing(slideAnim, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true,
    }).start();
  };

  const handleCloseModal = () => {
    Animated.timing(slideAnim, {
      toValue: 0,
      duration: 300,
      useNativeDriver: true,
    }).start(() => setModalVisible(false));
  };

  // Login with email handler
  const handleLoginWithEmail = () => {
    navigation.navigate('Login');
    setModalVisible(false);
  };

  // You can add handlers for Google and Apple login here
  const handleLoginWithGoogle = () => {
    // Handle Google login logic here
    setModalVisible(false);
  };

  const handleLoginWithApple = async () => {
    try {
      // First, try to clear any existing sessions
      try {
        const sessions = await account.listSessions();
        for (const session of sessions.sessions) {
          try {
            await account.deleteSession(session.$id);
            console.log('Deleted existing session:', session.$id);
          } catch (e) {
            console.log('Failed to delete session:', e);
          }
        }
      } catch (e) {
        console.log('No sessions to delete or error listing sessions:', e);
      }

      const credential = await AppleAuthentication.signInAsync({
        requestedScopes: [
          AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
          AppleAuthentication.AppleAuthenticationScope.EMAIL,
        ],
      });

      console.log('Apple Sign In successful:', credential);

      try {
        // Generate a valid user ID (max 36 chars, only alphanumeric, hyphen, underscore)
        const userId = `apple_${credential.user.slice(0, 8)}`;
        const tempEmail = `apple_${credential.user.slice(0, 8)}@temp.com`;
        const securePassword = `Apple_${credential.identityToken.slice(0, 8)}_${Date.now()}`;

        // First try to get the existing user
        try {
          // Try to create a session directly
          const session = await account.createSession(tempEmail, securePassword);
          console.log('Session created for existing user:', session);
          
          const user = await account.get();
          console.log('Logged in as existing user:', user);

          // Store user data
          await AsyncStorage.setItem('user', JSON.stringify(user));
          await AsyncStorage.setItem('session', JSON.stringify(session));

          // Navigate to main screen
          navigation.reset({
            index: 0,
            routes: [{ name: 'MainTabs' }]
          });
          return;
        } catch (sessionError) {
          console.log('Failed to create session:', sessionError);
          
          // Try to create a new user
          try {
            const user = await account.create(
              userId,
              tempEmail,
              securePassword,
              credential.fullName?.givenName || 'Apple User'
            );
            console.log('New user created:', user);

            // Create session for the new user
            const session = await account.createSession(tempEmail, securePassword);
            console.log('New session created:', session);

            // Store user data
            await AsyncStorage.setItem('user', JSON.stringify(user));
            await AsyncStorage.setItem('session', JSON.stringify(session));

            // Navigate to main screen
            navigation.reset({
              index: 0,
              routes: [{ name: 'MainTabs' }]
            });
          } catch (createError) {
            if (createError.message.includes('already exists')) {
              Alert.alert(
                'Login Error',
                'There was an issue with your Apple ID. Please try logging in with email or contact support.'
              );
            } else {
              throw createError;
            }
          }
        }
      } catch (error) {
        console.error('Sign in error:', error);
        Alert.alert('Error', 'Failed to sign in. Please try using email login instead.');
      }
    } catch (error) {
      console.error('Apple Sign In Error:', error);
      if (error.code === 'ERR_CANCELED') {
        Alert.alert('Sign In Canceled', 'You canceled the sign in process.');
      } else {
        Alert.alert('Error', 'Failed to sign in with Apple. Please try again.');
      }
    }
  };

  // Function to check user's subscription status
  const checkUserSubscription = async (userId) => {
    try {
      // Get user's subscription status from Appwrite
      const userData = await account.get();
      return userData?.prefs?.hasSubscription || false;
    } catch (error) {
      console.error('Error checking subscription:', error);
      return false;
    }
  };

  return (
    <View style={styles.container}>
      {/* Video or Image Section */}
      <View style={styles.mediaContainer}>
        <Video
          source={{ uri: 'https://videos.pexels.com/video-files/4612796/4612796-sd_506_960_25fps.mp4' }}
          style={styles.video}
          resizeMode="cover"
          shouldPlay
          isLooping
          isMuted
        />
      </View>

      {/* Bottom Container */}
      <View style={styles.bottomContainer}>
        <Text style={styles.title}>Sobriety Made Easy</Text>
        <Text style={styles.description}>
          Track your sobriety progress, stay motivated, and reach your goals with support.
        </Text>
        <TouchableOpacity style={styles.button} onPress={handleGetStarted}>
          <Text style={styles.buttonText}>Get Started</Text>
        </TouchableOpacity>

        {/* Login Button */}
        <TouchableOpacity style={styles.loginButton} onPress={handleLogin}>
          <Text style={styles.loginText}>Already a member? <Text style={styles.loginTextBold}>Login</Text></Text>
        </TouchableOpacity>
      </View>

      {/* Login Modal */}
      <Modal
        animationType="none"
        transparent={true}
        visible={modalVisible}
        onRequestClose={handleCloseModal}
      >
        <View style={styles.modalOverlay}>
          <Animated.View 
            style={[
              styles.modalContainer,
              {
                transform: [{
                  translateY: slideAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [500, 0]
                  })
                }]
              }
            ]}
          >
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Welcome Back</Text>
              <TouchableOpacity onPress={handleCloseModal} style={styles.closeButton}>
                <Ionicons name="close" size={24} color="#000" />
              </TouchableOpacity>
            </View>

            <View style={styles.loginOptions}>
              {isAppleAuthAvailable && (
                <TouchableOpacity 
                  style={[styles.loginOption, styles.appleButton]} 
                  onPress={handleLoginWithApple}
                >
                  <AntDesign name="apple1" size={20} color="#fff" />
                  <Text style={[styles.loginOptionText, styles.appleText]}>Continue with Apple</Text>
                </TouchableOpacity>
              )}

              <TouchableOpacity 
                style={[styles.loginOption, styles.googleButton]} 
                onPress={handleLoginWithGoogle}
              >
                <Ionicons name="logo-google" size={20} color="#000" />
                <Text style={[styles.loginOptionText, styles.googleText]}>Continue with Google</Text>
              </TouchableOpacity>

              <TouchableOpacity 
                style={[styles.loginOption, styles.emailButton]} 
                onPress={handleLoginWithEmail}
              >
                <FontAwesome name="envelope" size={20} color="#000" />
                <Text style={[styles.loginOptionText, styles.emailText]}>Continue with Email</Text>
              </TouchableOpacity>
            </View>
          </Animated.View>
        </View>
      </Modal>
    </View>
  );
};

export default StartScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9F9F9',
  },
  mediaContainer: {
    flex: 3,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#000',
  },
  video: {
    width: '100%',
    height: '100%',
  },
  bottomContainer: {
    flex: 1.6,
    backgroundColor: '#fff',
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    padding: 20,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 5,
  },
  title: {
    fontSize: 42,
    fontWeight: 'bold',
    color: '#000',
    textAlign: 'center',
    marginBottom: 10,
  },
  description: {
    fontSize: 16,
    color: '#555',
    textAlign: 'center',
    marginBottom: 30,
  },
  button: {
    backgroundColor: '#000',
    paddingVertical: 14,
    width: 300,
    borderRadius: 30,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 24,
    fontWeight: 'bold',
  },
  loginButton: {
    marginTop: 15,
  },
  loginText: {
    fontSize: 16,
    color: '#555',
  },
  loginTextBold: {
    fontWeight: 'bold',
    color: '#000',
  },
  // Modal Styles
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContainer: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#000',
  },
  closeButton: {
    padding: 8,
  },
  loginOptions: {
    gap: 12,
  },
  loginOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 10,
    gap: 10,
  },
  appleButton: {
    backgroundColor: '#000',
  },
  googleButton: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ddd',
  },
  emailButton: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ddd',
  },
  loginOptionText: {
    fontSize: 16,
    fontWeight: '600',
  },
  appleText: {
    color: '#fff',
  },
  googleText: {
    color: '#000',
  },
  emailText: {
    color: '#000',
  },
});
