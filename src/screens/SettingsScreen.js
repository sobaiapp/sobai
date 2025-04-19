import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  Switch,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ScrollView,
  ActivityIndicator,
  Appearance,
  Linking,
  Platform,
  Share
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Haptics from 'expo-haptics';
import { logoutUser, getCurrentUser } from '../services/appwrite';
import { 
  requestNotificationPermissions, 
  scheduleDailyQuoteNotification,
  checkNotificationsEnabled 
} from '../services/notifications';

const SettingsScreen = () => {
  const navigation = useNavigation();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [notificationsLoading, setNotificationsLoading] = useState(false);
  const [darkMode, setDarkMode] = useState(Appearance.getColorScheme() === 'dark');
  const [settings, setSettings] = useState({
    notifications: false,
    hapticFeedback: true,
    appVersion: '1.0.0'
  });

  // Load user and settings
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const [currentUser, savedSettings, notificationsEnabled] = await Promise.all([
          getCurrentUser(),
          AsyncStorage.getItem('appSettings'),
          checkNotificationsEnabled()
        ]);
        
        setUser(currentUser);
        if (savedSettings) {
          const parsedSettings = JSON.parse(savedSettings);
          setSettings(prev => ({ ...prev, ...parsedSettings }));
          if (parsedSettings.darkMode !== undefined) {
            setDarkMode(parsedSettings.darkMode);
          }
        }
        setSettings(prev => ({ ...prev, notifications: notificationsEnabled }));
      } catch (error) {
        console.error('Error loading data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  // Save settings when they change
  useEffect(() => {
    const saveSettings = async () => {
      try {
        await AsyncStorage.setItem('appSettings', JSON.stringify({
          ...settings,
          darkMode
        }));
      } catch (error) {
        console.error('Error saving settings:', error);
      }
    };
    saveSettings();
  }, [settings, darkMode]);

  const handleLogout = async () => {
    try {
      setLoading(true);
      await logoutUser();
      
      // Clear navigation stack and go to Start screen
      navigation.reset({
        index: 0,
        routes: [{ name: 'Start' }]
      });
    } catch (error) {
      console.error('Logout error:', error);
      Alert.alert(
        'Logout Failed',
        error.message || 'Failed to log out. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  const confirmLogout = () => {
    if (settings.hapticFeedback) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    
    Alert.alert(
      'Log Out',
      'Are you sure you want to log out?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Log Out', onPress: handleLogout, style: 'destructive' }
      ]
    );
  };

  const confirmDeleteAccount = () => {
    if (settings.hapticFeedback) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    
    Alert.alert(
      'Delete Account',
      'Are you sure you want to delete your account? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Delete', onPress: () => navigation.navigate('DeleteAccount'), style: 'destructive' }
      ]
    );
  };

  const toggleSetting = async (setting) => {
    if (settings.hapticFeedback) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }

    if (setting === 'notifications') {
      setNotificationsLoading(true);
      const newValue = !settings.notifications;
      
      try {
        if (newValue) {
          const granted = await requestNotificationPermissions();
          if (!granted) {
            Alert.alert(
              'Permission Required',
              'Please enable notifications in your device settings to receive daily motivational quotes.',
              [{ text: 'OK' }]
            );
            setNotificationsLoading(false);
            return;
          }
        }
        
        // Update the UI immediately
        setSettings(prev => ({ ...prev, notifications: newValue }));
        
        // Schedule notifications in the background
        scheduleDailyQuoteNotification(newValue).then(() => {
          setNotificationsLoading(false);
          if (newValue) {
            Alert.alert(
              'Notifications Enabled',
              'You should receive a test notification shortly. Daily motivational quotes will be sent at 9 AM.',
              [{ text: 'OK' }]
            );
          } else {
            Alert.alert(
              'Notifications Disabled',
              'Daily motivational quotes have been turned off.',
              [{ text: 'OK' }]
            );
          }
        });
      } catch (error) {
        console.error('Error toggling notifications:', error);
        setNotificationsLoading(false);
        Alert.alert(
          'Error',
          'Failed to update notification settings. Please try again.',
          [{ text: 'OK' }]
        );
      }
    } else {
      setSettings(prev => ({ ...prev, [setting]: !prev[setting] }));
    }
  };

  const toggleDarkMode = () => {
    if (settings.hapticFeedback) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    setDarkMode(prev => !prev);
  };

  const openLegalLink = (type) => {
    if (settings.hapticFeedback) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    
    let url;
    if (type === 'terms') {
      url = Platform.OS === 'ios' 
        ? 'https://www.apple.com/legal/internet-services/itunes/' 
        : 'https://play.google.com/about/play-terms.html';
    } else if (type === 'privacy') {
      url = Platform.OS === 'ios' 
        ? 'https://www.apple.com/legal/privacy/' 
        : 'https://policies.google.com/privacy';
    }
    
    Linking.canOpenURL(url).then(supported => {
      if (supported) {
        Linking.openURL(url);
      } else {
        Alert.alert('Error', 'Unable to open link');
      }
    });
  };

  const openSupportEmail = () => {
    if (settings.hapticFeedback) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    
    Linking.openURL('mailto:support@sobai.app?subject=App Support');
  };

  const openWebsite = () => {
    if (settings.hapticFeedback) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    
    Linking.openURL('https://www.sobai.app');
  };

  const shareApp = async () => {
    if (settings.hapticFeedback) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    
    try {
      const message = 'Check out SobAi - Your Personal Sobriety Companion! Download it here: https://www.sobai.app';
      await Share.share({
        message,
        title: 'Share SobAi',
      });
    } catch (error) {
      console.error('Error sharing app:', error);
      Alert.alert('Error', 'Failed to share the app. Please try again.');
    }
  };

  const SettingItem = ({ 
    icon, 
    label, 
    value, 
    onPress, 
    isSwitch = false,
    switchValue,
    onSwitchChange,
    isLast = false,
    isDestructive = false,
    isLoading = false
  }) => (
    <TouchableOpacity
      style={[
        styles.settingItem,
        isLast && styles.lastItem,
        isDestructive && styles.destructiveItem,
        darkMode && styles.darkSettingItem
      ]}
      onPress={onPress}
      activeOpacity={0.7}
      disabled={isLoading}
    >
      <View style={styles.itemContent}>
        <Ionicons 
          name={icon} 
          size={22} 
          color={isDestructive ? '#FF3B30' : (darkMode ? '#fff' : '#333')} 
          style={styles.itemIcon}
        />
        <Text style={[
          styles.itemLabel,
          isDestructive && styles.destructiveText,
          darkMode && styles.darkText
        ]}>
          {label}
        </Text>
      </View>
      
      {isSwitch ? (
        isLoading ? (
          <ActivityIndicator size="small" color={darkMode ? '#fff' : '#333'} />
        ) : (
          <Switch
            value={switchValue}
            onValueChange={onSwitchChange}
            trackColor={{ false: '#767577', true: darkMode ? '#4CD964' : '#34C759' }}
            thumbColor="#fff"
          />
        )
      ) : (
        <Text style={[
          styles.itemValue,
          darkMode && styles.darkText
        ]}>
          {value}
        </Text>
      )}
    </TouchableOpacity>
  );

  const Section = ({ title, children }) => (
    <View style={[
      styles.section,
      darkMode && styles.darkSection
    ]}>
      <Text style={[
        styles.sectionTitle,
        darkMode && styles.darkSectionTitle
      ]}>
        {title}
      </Text>
      {children}
    </View>
  );

  if (loading) {
    return (
      <View style={[
        styles.loadingContainer,
        darkMode && styles.darkLoadingContainer
      ]}>
        <ActivityIndicator size="large" color={darkMode ? '#fff' : '#000'} />
      </View>
    );
  }

  return (
    <ScrollView style={[
      styles.container,
      darkMode && styles.darkContainer
    ]}>
      {/* User Section */}
      {user && (
        <Section title="ACCOUNT">
          <SettingItem
            icon="person-outline"
            label="Profile"
            onPress={() => navigation.navigate('Profile')}
          />
          <SettingItem
            icon="mail-outline"
            label="Email"
            value={user.email}
          />
          <SettingItem
            icon="lock-closed-outline"
            label="Change Password"
            onPress={() => navigation.navigate('ChangePassword')}
            isLast={true}
          />
        </Section>
      )}

      {/* Preferences Section */}
      <Section title="PREFERENCES">
        <SettingItem
          icon="notifications-outline"
          label="Notifications"
          isSwitch={true}
          switchValue={settings.notifications}
          onSwitchChange={() => toggleSetting('notifications')}
          isLoading={notificationsLoading}
        />
        <SettingItem
          icon="moon-outline"
          label="Dark Mode"
          isSwitch={true}
          switchValue={darkMode}
          onSwitchChange={toggleDarkMode}
        />
        <SettingItem
          icon="phone-portrait-outline"
          label="Haptic Feedback"
          isSwitch={true}
          switchValue={settings.hapticFeedback}
          onSwitchChange={() => toggleSetting('hapticFeedback')}
          isLast={true}
        />
      </Section>

      {/* Support Section */}
      <Section title="SUPPORT">
        <SettingItem
          icon="help-circle-outline"
          label="Help Center"
          onPress={() => navigation.navigate('HelpCenter')}
        />
        <SettingItem
          icon="chatbubble-ellipses-outline"
          label="Contact Us"
          onPress={openWebsite}
        />
        <SettingItem
          icon="mail-outline"
          label="Support Email"
          onPress={openSupportEmail}
          isLast={true}
        />
      </Section>

      {/* App Section */}
      <Section title="APP INFO">
        <SettingItem
          icon="information-circle-outline"
          label="Version"
          value={settings.appVersion}
        />
        <SettingItem
          icon="star-outline"
          label="Rate App"
          onPress={() => {}}
        />
        <SettingItem
          icon="share-social-outline"
          label="Share App"
          onPress={shareApp}
          isLast={true}
        />
      </Section>

      {/* Legal Section */}
      <Section title="LEGAL">
        <SettingItem
          icon="document-text-outline"
          label="Terms and Conditions"
          onPress={() => openLegalLink('terms')}
        />
        <SettingItem
          icon="shield-checkmark-outline"
          label="Privacy Policy"
          onPress={() => openLegalLink('privacy')}
        />
        <SettingItem
          icon="trash-outline"
          label="Delete Account"
          onPress={confirmDeleteAccount}
          isDestructive={true}
          isLast={true}
        />
      </Section>

      {/* Logout Section */}
      {user && (
        <Section title="ACTIONS">
          <SettingItem
            icon="log-out-outline"
            label="Log Out"
            onPress={confirmLogout}
            isDestructive={true}
            isLast={true}
          />
        </Section>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
    paddingTop: 16,
  },
  darkContainer: {
    backgroundColor: '#121212',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
  },
  darkLoadingContainer: {
    backgroundColor: '#121212',
  },
  section: {
    backgroundColor: '#fff',
    borderRadius: 12,
    marginHorizontal: 16,
    marginBottom: 16,
    overflow: 'hidden',
  },
  darkSection: {
    backgroundColor: '#1e1e1e',
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '500',
    color: '#6c757d',
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
    textTransform: 'uppercase',
  },
  darkSectionTitle: {
    color: '#9e9e9e',
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: 'rgba(0,0,0,0.1)',
  },
  darkSettingItem: {
    borderBottomColor: 'rgba(255,255,255,0.1)',
  },
  lastItem: {
    borderBottomWidth: 0,
  },
  destructiveItem: {
    backgroundColor: 'rgba(255,59,48,0.05)',
  },
  itemContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  itemIcon: {
    marginRight: 12,
  },
  itemLabel: {
    fontSize: 16,
    color: '#212529',
  },
  darkText: {
    color: '#fff',
  },
  destructiveText: {
    color: '#FF3B30',
  },
  itemValue: {
    fontSize: 16,
    color: '#6c757d',
  },
});

export default SettingsScreen;