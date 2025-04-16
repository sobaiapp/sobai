import 'react-native-gesture-handler'; // Ensure this is at the top
import React, { useEffect, useState } from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import Navigation from './src/navigation/Navigation';
import { requestNotificationPermission, scheduleDailyNotification } from './src/utils/notifications';
import * as Notifications from 'expo-notifications';
import { View, StyleSheet, Alert } from 'react-native';
import { AuthProvider } from './src/context/AuthContext';

export default function App() {
  const [notificationPermission, setNotificationPermission] = useState(null);

  useEffect(() => {
    const setupNotifications = async () => {
      try {
        const hasPermission = await requestNotificationPermission();
        setNotificationPermission(hasPermission);
        
        if (hasPermission) {
          await scheduleDailyNotification();
        } else {
          Alert.alert(
            'Notifications Disabled',
            'Please enable notifications in your device settings to receive important updates.',
            [{ text: 'OK' }]
          );
        }
      } catch (error) {
        console.error('Error setting up notifications:', error);
        Alert.alert(
          'Error',
          'There was a problem setting up notifications. Please try again later.',
          [{ text: 'OK' }]
        );
      }
    };

    setupNotifications();

    // Listen for notifications when app is in foreground
    const subscription = Notifications.addNotificationReceivedListener(notification => {
      console.log("Notification Received: ", notification);
    });

    return () => {
      subscription.remove();
    };
  }, []);

  return (
    <GestureHandlerRootView style={styles.container}>
      <AuthProvider>
        <Navigation />
      </AuthProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
