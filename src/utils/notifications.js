import * as Notifications from 'expo-notifications';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Request permission to send notifications
export async function requestNotificationPermission() {
  const { status } = await Notifications.requestPermissionsAsync();
  if (status !== 'granted') {
    console.log('Permission not granted for notifications');
    return false;
  }
  return true;
}

// Schedule a daily notification
export async function scheduleDailyNotification() {
  const hasScheduled = await AsyncStorage.getItem('daily_notification_scheduled');
  if (hasScheduled) return; // Prevent duplicate scheduling

  const stoicQuotes = [
    "The happiness of your life depends upon the quality of your thoughts. - Marcus Aurelius",
    "You have power over your mind – not outside events. Realize this, and you will find strength. - Marcus Aurelius",
    "We suffer more often in imagination than in reality. - Seneca",
    "Do what you can, with what you have, where you are. - Epictetus",
  ];

  const randomQuote = stoicQuotes[Math.floor(Math.random() * stoicQuotes.length)];

  await Notifications.scheduleNotificationAsync({
    content: {
      title: "Stoic Wisdom of the Day",
      body: randomQuote,
    },
    trigger: {
      hour: 8, // Set notification time (8 AM)
      minute: 0,
      repeats: true,
    },
  });

  await AsyncStorage.setItem('daily_notification_scheduled', 'true');
}
