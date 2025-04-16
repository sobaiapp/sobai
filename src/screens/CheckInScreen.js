import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  Keyboard,
  TouchableWithoutFeedback,
  SafeAreaView,
  Animated,
  Alert
} from 'react-native';
import { Swipeable } from 'react-native-gesture-handler';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';
import * as Haptics from 'expo-haptics';

const CheckInScreen = () => {
  const navigation = useNavigation();
  const [mood, setMood] = useState('');
  const [notes, setNotes] = useState('');
  const [checkIns, setCheckIns] = useState([]);
  const [buttonScale] = useState(new Animated.Value(1));

  useEffect(() => {
    const loadCheckIns = async () => {
      try {
        const savedCheckIns = await AsyncStorage.getItem('checkIns');
        if (savedCheckIns) {
          setCheckIns(JSON.parse(savedCheckIns));
        }
      } catch (error) {
        console.error('Error loading check-ins:', error);
      }
    };

    loadCheckIns();
  }, []);

  useEffect(() => {
    const saveCheckIns = async () => {
      try {
        await AsyncStorage.setItem('checkIns', JSON.stringify(checkIns));
      } catch (error) {
        console.error('Error saving check-ins:', error);
      }
    };

    saveCheckIns();
  }, [checkIns]);

  const animateButton = () => {
    Animated.sequence([
      Animated.timing(buttonScale, {
        toValue: 0.95,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(buttonScale, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const handleCheckIn = () => {
    if (!mood.trim()) {
      Alert.alert('Required', 'Please enter your mood');
      return;
    }

    animateButton();
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    const now = new Date();
    const newCheckIn = {
      mood,
      notes,
      timestamp: now.toLocaleString(),
      date: now.toDateString(),
      time: now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setCheckIns([newCheckIn, ...checkIns]);
    setMood('');
    setNotes('');
    Keyboard.dismiss();
  };

  const deleteCheckIn = (index) => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    Alert.alert(
      'Delete Check-In',
      'Are you sure you want to delete this check-in?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            const updatedCheckIns = checkIns.filter((_, i) => i !== index);
            setCheckIns(updatedCheckIns);
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
          },
        },
      ]
    );
  };

  const renderRightAction = (progress, dragX, index) => {
    const scale = dragX.interpolate({
      inputRange: [-100, 0],
      outputRange: [1, 0],
      extrapolate: 'clamp',
    });

    return (
      <TouchableOpacity
        style={styles.deleteButton}
        onPress={() => deleteCheckIn(index)}
        activeOpacity={0.6}
      >
        <Animated.View style={{ transform: [{ scale }] }}>
          <Ionicons name="trash" size={24} color="#fff" />
        </Animated.View>
      </TouchableOpacity>
    );
  };

  const renderCheckInItem = ({ item, index }) => (
    <Swipeable
      renderRightActions={(progress, dragX) => renderRightAction(progress, dragX, index)}
      rightThreshold={40}
      friction={2}
    >
      <View style={styles.checkInCard}>
        <View style={styles.cardHeader}>
          <Text style={styles.moodText}>{item.mood}</Text>
          <View style={styles.timeBadge}>
            <Ionicons name="time" size={14} color="#fff" />
            <Text style={styles.timeText}>{item.time}</Text>
          </View>
        </View>
        <Text style={styles.dateText}>{item.date}</Text>
        {item.notes ? (
          <View style={styles.notesContainer}>
            <Ionicons name="document-text" size={16} color="#666" style={styles.notesIcon} />
            <Text style={styles.notesText}>{item.notes}</Text>
          </View>
        ) : null}
      </View>
    </Swipeable>
  );

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.container}>
          {/* Header with Back Button */}
          <View style={styles.header}>
            <TouchableOpacity 
              onPress={() => navigation.goBack()}
              style={styles.backButton}
            >
              <Ionicons name="chevron-back" size={28} color="#000" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Mood Check-In</Text>
            <View style={styles.headerRight} />
          </View>

          {/* Check-in Form */}
          <View style={styles.formContainer}>
            <Text style={styles.inputLabel}>How are you feeling today?</Text>
            <TextInput
              style={styles.input}
              placeholder="Happy, anxious, tired..."
              placeholderTextColor="#999"
              value={mood}
              onChangeText={setMood}
              returnKeyType="next"
            />

            <Text style={styles.inputLabel}>Additional notes (optional)</Text>
            <TextInput
              style={[styles.input, styles.notesInput]}
              placeholder="What's contributing to your mood?"
              placeholderTextColor="#999"
              value={notes}
              onChangeText={setNotes}
              multiline
              numberOfLines={4}
            />

            <Animated.View style={{ transform: [{ scale: buttonScale }] }}>
              <TouchableOpacity 
                style={styles.button} 
                onPress={handleCheckIn}
                activeOpacity={0.8}
              >
                <Text style={styles.buttonText}>Submit Check-In</Text>
                <Ionicons name="send" size={20} color="#fff" style={styles.buttonIcon} />
              </TouchableOpacity>
            </Animated.View>
          </View>

          {/* Check-in History */}
          <View style={styles.historyContainer}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Your Check-In History</Text>
              {checkIns.length > 0 && (
                <Text style={styles.countText}>{checkIns.length} entries</Text>
              )}
            </View>

            {checkIns.length === 0 ? (
              <View style={styles.emptyState}>
                <Ionicons name="calendar" size={40} color="#ccc" />
                <Text style={styles.emptyText}>No check-ins yet</Text>
                <Text style={styles.emptySubtext}>Your mood history will appear here</Text>
              </View>
            ) : (
              <FlatList
                data={checkIns}
                keyExtractor={(item, index) => index.toString()}
                renderItem={renderCheckInItem}
                contentContainerStyle={styles.listContent}
                showsVerticalScrollIndicator={false}
              />
            )}
          </View>
        </View>
      </SafeAreaView>
    </TouchableWithoutFeedback>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#fff',
    marginTop: -13

  },
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  backButton: {
    padding: 5,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#000',
  },
  headerRight: {
    width: 28,
  },
  formContainer: {
    padding: 20,
    backgroundColor: '#fff',
    borderRadius: 12,
    margin: 15,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
    marginBottom: 8,
  },
  input: {
    width: '100%',
    padding: 15,
    borderRadius: 10,
    backgroundColor: '#f5f5f5',
    color: '#333',
    marginBottom: 20,
    fontSize: 16,
  },
  notesInput: {
    height: 100,
    textAlignVertical: 'top',
  },
  button: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#000',
    padding: 16,
    borderRadius: 10,
    marginTop: 10,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    marginRight: 10,
  },
  buttonIcon: {
    marginLeft: 5,
  },
  historyContainer: {
    flex: 1,
    paddingHorizontal: 15,
    paddingTop: 10,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
    paddingHorizontal: 5,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  countText: {
    fontSize: 14,
    color: '#666',
  },
  listContent: {
    paddingBottom: 30,
  },
  checkInCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 15,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 5,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 5,
  },
  moodText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    flex: 1,
  },
  timeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#4CAF50',
    paddingVertical: 3,
    paddingHorizontal: 8,
    borderRadius: 10,
  },
  timeText: {
    color: '#fff',
    fontSize: 12,
    marginLeft: 5,
  },
  dateText: {
    fontSize: 12,
    color: '#777',
    marginBottom: 10,
  },
  notesContainer: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
    paddingTop: 10,
    marginTop: 10,
  },
  notesIcon: {
    marginRight: 8,
    marginTop: 2,
  },
  notesText: {
    fontSize: 14,
    color: '#555',
    flex: 1,
    lineHeight: 20,
  },
  deleteButton: {
    backgroundColor: '#FF6B6B',
    justifyContent: 'center',
    alignItems: 'center',
    width: 80,
    height: '80%',
    borderRadius: 10,
    marginTop: 10,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  emptyText: {
    fontSize: 16,
    color: '#999',
    marginTop: 10,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#ccc',
    marginTop: 5,
  },
});

export default CheckInScreen;