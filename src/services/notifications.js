import * as Notifications from 'expo-notifications';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getMotivationalQuote } from './api';

// Configure notifications
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

// Request notification permissions
export const requestNotificationPermissions = async () => {
  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;
  
  if (existingStatus !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }
  
  return finalStatus === 'granted';
};

// Send a test notification
export const sendTestNotification = async () => {
  try {
    const quote = await getMotivationalQuote();
    
    await Notifications.scheduleNotificationAsync({
      content: {
        title: "Test Notification",
        body: quote.text,
        data: { quote },
      },
      trigger: null, // Send immediately
    });
    
    return true;
  } catch (error) {
    console.error('Error sending test notification:', error);
    return false;
  }
};

// Schedule daily motivational quote notification
export const scheduleDailyQuoteNotification = async (enabled) => {
  try {
    // Cancel any existing notifications
    await Notifications.cancelAllScheduledNotificationsAsync();

    if (!enabled) return;

    // Send a test notification immediately
    await sendTestNotification();

    // Get a motivational quote for daily notification
    const quote = await getMotivationalQuote();
    
    // Schedule notification for 9 AM daily
    await Notifications.scheduleNotificationAsync({
      content: {
        title: "Daily Motivation",
        body: quote.text,
        data: { quote },
      },
      trigger: {
        hour: 9,
        minute: 0,
        repeats: true,
      },
    });

    // Save notification preference
    await AsyncStorage.setItem('notificationsEnabled', JSON.stringify(enabled));
  } catch (error) {
    console.error('Error scheduling notification:', error);
  }
};

// Check if notifications are enabled
export const checkNotificationsEnabled = async () => {
  try {
    const enabled = await AsyncStorage.getItem('notificationsEnabled');
    return enabled ? JSON.parse(enabled) : false;
  } catch (error) {
    console.error('Error checking notifications:', error);
    return false;
  }
}; 