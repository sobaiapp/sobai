import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Modal, ScrollView, Dimensions, TextInput, Linking } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import DateTimePicker from '@react-native-community/datetimepicker';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import DaysSoberCard from '../components/DaysSoberCard'; // Import component
import { Animated, Easing } from 'react-native'; // Import Animated API
import Ionicons from 'react-native-vector-icons/Ionicons';
import { LinearGradient } from 'expo-linear-gradient';
import { CircularProgress } from 'react-native-circular-progress';

const HomeScreen = ({ navigation }) => {
  const [startDate, setStartDate] = useState(null);
  const [daysSober, setDaysSober] = useState(0);
  const [animatedDays, setAnimatedDays] = useState(0);
  const [progress, setProgress] = useState(0);
  const [showPicker, setShowPicker] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [fadeAnim] = useState(new Animated.Value(0));  // Animation state for fade-in
  const [showPhoneModal, setShowPhoneModal] = useState(false);
  const [sponsorPhone, setSponsorPhone] = useState('');
  const [isFirstCall, setIsFirstCall] = useState(true);
  const shineAnim = useRef(new Animated.Value(0)).current;
  const [totalCheckIns, setTotalCheckIns] = useState(0);

  useEffect(() => {
    loadStartDate();
    checkSponsorPhone();
    loadTotalCheckIns();
    // Start animation when the screen loads
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 1000,
      easing: Easing.ease,
      useNativeDriver: true,
    }).start();

    // Start shine animation
    Animated.loop(
      Animated.sequence([
        Animated.timing(shineAnim, {
          toValue: 1,
          duration: 1500,
          useNativeDriver: true,
        }),
        Animated.timing(shineAnim, {
          toValue: 0,
          duration: 1500,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

  // Add effect to animate the days number
  useEffect(() => {
    if (daysSober > 0) {
      const duration = 2000; // 2 seconds
      const steps = 60; // Number of steps in the animation
      const stepValue = daysSober / steps;
      let currentStep = 0;

      const interval = setInterval(() => {
        currentStep++;
        setAnimatedDays(Math.floor(stepValue * currentStep));

        if (currentStep >= steps) {
          setAnimatedDays(daysSober);
          clearInterval(interval);
        }
      }, duration / steps);

      return () => clearInterval(interval);
    }
  }, [daysSober]);

  const loadStartDate = async () => {
    try {
      const storedDate = await AsyncStorage.getItem('sobrietyStartDate');
      if (storedDate) {
        setStartDate(storedDate);
        calculateDaysSober(storedDate);
      }
    } catch (error) {
      console.error('Error loading date:', error);
    }
  };

  const checkSponsorPhone = async () => {
    try {
      const phone = await AsyncStorage.getItem('sponsorPhone');
      if (phone) {
        setSponsorPhone(phone);
        setIsFirstCall(false);
      }
    } catch (error) {
      console.error('Error loading sponsor phone:', error);
    }
  };

  const calculateDaysSober = (date) => {
    const start = new Date(date);
    const today = new Date();
    const difference = Math.floor((today - start) / (1000 * 60 * 60 * 24));
    setDaysSober(difference);
    setProgress(Math.min(difference / 365, 1)); // 1-year progress
  };

  const showDatePicker = () => {
    setShowPicker(true);
  };

  const onDateChange = (event, selected) => {
    if (selected) {
      setSelectedDate(selected);
    }
  };

  const confirmDate = async () => {
    setShowPicker(false);
    const formattedDate = selectedDate.toISOString().split('T')[0];
    try {
      await AsyncStorage.setItem('sobrietyStartDate', formattedDate);
      setStartDate(formattedDate);
      calculateDaysSober(formattedDate);
    } catch (error) {
      console.error('Error saving date:', error);
    }
  };

  const handleCallSponsor = () => {
    if (isFirstCall) {
      setShowPhoneModal(true);
    } else {
      makePhoneCall();
    }
  };

  const saveSponsorPhone = async () => {
    try {
      await AsyncStorage.setItem('sponsorPhone', sponsorPhone);
      setIsFirstCall(false);
      setShowPhoneModal(false);
      makePhoneCall();
    } catch (error) {
      console.error('Error saving sponsor phone:', error);
    }
  };

  const makePhoneCall = () => {
    if (sponsorPhone) {
      Linking.openURL(`tel:${sponsorPhone}`);
    }
  };

  const loadTotalCheckIns = async () => {
    try {
      const checkIns = await AsyncStorage.getItem('totalCheckIns');
      if (checkIns) {
        setTotalCheckIns(parseInt(checkIns));
      }
    } catch (error) {
      console.error('Error loading check-ins:', error);
    }
  };

  return (
    <LinearGradient
      colors={['#F0F8FF', '#FFF0F5', '#F0F8FF']}
      style={styles.container}
    >
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
      {/* Fade-in animation for the Days Sober Card */}
      <Animated.View style={[styles.card, { opacity: fadeAnim }]}>
        <Text style={styles.cardTitle}>Days Clean</Text>
          <Text style={styles.counter}>{animatedDays} Days</Text>
        {startDate ? (
          <Text style={styles.dateText}>Since: {startDate}</Text>
        ) : (
          <Text style={styles.dateText}>Set your start date below.</Text>
        )}
        <TouchableOpacity style={styles.button} onPress={showDatePicker}>
          <Text style={styles.buttonText}>Select Start Date</Text>
        </TouchableOpacity>
      </Animated.View>

      {/* Fade-in for icon buttons */}
      <Animated.View style={[styles.iconContainer, { opacity: fadeAnim }]}>
        <TouchableOpacity style={styles.iconButton} onPress={() => navigation.navigate('Meetings')}>
          <Icon name="calendar-check" size={30} color="dodgerblue" />
          <Text style={styles.iconText}>Meetings</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.iconButton} onPress={handleCallSponsor}>
          <Icon name="phone-in-talk" size={30} color="lime" />
          <Text style={styles.iconText}>Call Sponsor</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.iconButton} onPress={() => navigation.navigate('PanicScreen')}>
          <Icon name="alert" size={30} color="red" />
          <Text style={styles.iconText}>Panic Button</Text>
        </TouchableOpacity>
      </Animated.View>

      {/* Progress Card */}
        <Animated.View style={[styles.card, { opacity: fadeAnim }]}>
          <Text style={styles.cardTitle}>Goal Progress</Text>
          <Text style={styles.progressText}>{Math.floor(progress * 100)}% of 1-Year Goal</Text>
          <View style={styles.progressBarContainer}>
            <Animated.View 
              style={[
                styles.progressBar, 
                { 
                  width: `${progress * 100}%`,
                }
              ]} 
            />
            <Animated.View
              style={[
                styles.shine,
                {
                  transform: [{
                    translateX: shineAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [-100, 300]
                    })
                  }]
                }
              ]}
            />
          </View>
        </Animated.View>

     {/* Card Container with fade animation */}
<Animated.View style={[styles.cardContainer, { opacity: fadeAnim }]}>
  {/* Check-In Card */}
  <View style={styles.card2}>
            <Text style={styles.card2Title}>Daily Check-In</Text>
            <View style={styles.healthProgressContainer}>
              <CircularProgress
                size={100}
                width={10}
                fill={Math.min((totalCheckIns / 30) * 100, 100)}
                tintColor="#000"
                backgroundColor="#ddd"
                rotation={0}
                lineCap="round"
              >
                {(fill) => (
                  <View style={styles.healthProgressTextContainer}>
                    <Icon name="calendar-check" size={32} color="#4CAF50" />
                  </View>
                )}
              </CircularProgress>
            </View>
    <TouchableOpacity style={styles.button} onPress={() => navigation.navigate('CheckIn')}>
              <Text style={styles.buttonText}>Check-In</Text>
    </TouchableOpacity>
  </View>

  {/* Health Card */}
  <View style={styles.card2}>
            <Text style={styles.card2Title}>Health</Text>
            <View style={styles.healthProgressContainer}>
              <CircularProgress
                size={100}
                width={10}
                fill={75}
                tintColor="#000"
                backgroundColor="#ddd"
                rotation={0}
                lineCap="round"
              >
                {(fill) => (
                  <View style={styles.healthProgressTextContainer}>
                    <Icon name="heart-pulse" size={32} color="#FF6B6B" />
                  </View>
                )}
              </CircularProgress>
            </View>
    <TouchableOpacity style={styles.button} onPress={() => navigation.navigate('Health')}>
      <Text style={styles.buttonText}>Track Health</Text>
    </TouchableOpacity>
  </View>

  {/* Relapse Prevention Plan Card */}
  <View style={styles.card2}>
    <Ionicons name="shield-checkmark" size={38} color="#323232" style={styles.cardIcon} />
    <Text style={styles.cardTitle}>Relapse Prevention Plan</Text>
    <Text style={styles.relapseText}>Review your personalized relapse prevention strategies.</Text>
    <TouchableOpacity style={styles.button} onPress={() => navigation.navigate('RelapsePrevention')}>
      <Text style={styles.buttonText}>View Plan</Text>
    </TouchableOpacity>
  </View>

  {/* Challenges & Goals Card */}
  <View style={styles.card2}>
    <Ionicons name="trophy" size={38} color="#323232" style={styles.cardIcon} />
    <Text style={styles.cardTitle}>Challenges & Goals</Text>
    <Text style={styles.challengeText}>New Challenge: 7 Days Without Sugar!</Text>
    <TouchableOpacity style={styles.button} onPress={() => navigation.navigate('Challenges')}>
              <Text style={styles.buttonText}>Start Now</Text>
    </TouchableOpacity>
  </View>
</Animated.View>

      {/* Date Picker Modal */}
      {showPicker && (
        <Modal transparent={true} animationType="slide" visible={showPicker} onRequestClose={() => setShowPicker(false)}>
          <View style={styles.modalContainer}>
            <View style={styles.modalContent}>
              <DateTimePicker value={selectedDate} mode="date" display="spinner" onChange={onDateChange} maximumDate={new Date()} />
              <TouchableOpacity style={styles.doneButton} onPress={confirmDate}>
                <Text style={styles.doneButtonText}>Done</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      )}

      {/* Phone Number Modal */}
      <Modal transparent={true} animationType="slide" visible={showPhoneModal} onRequestClose={() => setShowPhoneModal(false)}>
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Enter Sponsor's Phone Number</Text>
            <TextInput
              style={styles.phoneInput}
              placeholder="Enter phone number"
              keyboardType="phone-pad"
              value={sponsorPhone}
              onChangeText={setSponsorPhone}
            />
            <TouchableOpacity style={styles.saveButton} onPress={saveSponsorPhone}>
              <Text style={styles.saveButtonText}>Save & Call</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.cancelButton} onPress={() => setShowPhoneModal(false)}>
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </ScrollView>
    </LinearGradient>
  );
};

export default HomeScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    alignItems: 'center',
    padding: 20,
  },
  header: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 20,
  },
  cardIcon: {
    alignSelf: 'center',
    marginBottom: 8,
  },
  card: {
    width: '100%',
    backgroundColor: 'rgba(255, 255, 255, 0.7)',
    borderRadius: 12,
    padding: 15,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    backdropFilter: 'blur(10px)',
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 20,
  },
  counter: {
    fontSize: 42,
    fontWeight: 'bold',
    color: '#323232',
  },
  dateText: {
    fontSize: 16,
    color: '#555',
    marginTop: 5,
    marginBottom: 5,
  },
  progressText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 5,
  },
  progressBarContainer: {
    width: '100%',
    height: 10,
    backgroundColor: '#ddd',
    borderRadius: 5,
    overflow: 'hidden',
    position: 'relative',
  },
  progressBar: {
    height: '100%',
    backgroundColor: '#000',
    borderRadius: 5,
  },
  shine: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    transform: [{ skewX: '-20deg' }],
  },
  button: {
    backgroundColor: '#000',
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderRadius: 30,
    marginTop: 20,
    elevation: 3,
    minWidth: 100,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContent: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 10,
    width: '80%',
    alignItems: 'center',
  },
  doneButton: {
    marginTop: 10,
    backgroundColor: '#000',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  doneButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  iconContainer: {
    flexDirection: 'row',
    justifyContent: 'space-evenly', // Ensures equal spacing
    alignItems: 'center', // Aligns items in the center
    marginTop: 5,
    marginBottom: '15',
    width: '100%', // Makes sure it spans the card width
  },
  iconButton: {
    alignItems: 'center',
    flex: 1, // Ensures equal spacing
  },
  iconText: {
    fontSize: 12,
    color: '#555',
    marginTop: 5,
    textAlign: 'center',
  },
  milestoneText: {
    fontSize: 16,
    color: '#555',
    marginBottom: 10,
  },
  healthText: {
    fontSize: 16,
    color: '#555',
    marginBottom: 10,
  },
  statsText: {
    fontSize: 16,
    color: '#555',
    marginBottom: 10,
  },
  cardContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    paddingHorizontal: 5,
    marginTop: 20,
  },
  card2: {
    width: '48%',
    backgroundColor: 'rgba(255, 255, 255, 0.7)',
    borderRadius: 12,
    padding: 15,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    backdropFilter: 'blur(10px)',
    alignItems: 'center',
  },
  card2Title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 20,
    textAlign: 'center',
  },
  healthProgressContainer: {
    alignItems: 'center',
    marginVertical: 20,
  },
  healthProgressTextContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  progressIcon: {
    marginBottom: 4,
  },
  healthProgressText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#000',
  },
  healthProgressLabel: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  healthStatsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginVertical: 20,
    width: '100%',
  },
  healthStat: {
    alignItems: 'center',
  },
  healthStatLabel: {
    fontSize: 18,
    color: '#555',
    marginBottom: 5,
  },
  healthStatValue: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#000',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  phoneInput: {
    width: '100%',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 10,
    marginBottom: 20,
  },
  saveButton: {
    backgroundColor: '#000',
    paddingVertical: 12,
    paddingHorizontal: 25,
    borderRadius: 30,
    marginBottom: 10,
    width: '100%',
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  cancelButton: {
    backgroundColor: '#f0f0f0',
    paddingVertical: 12,
    paddingHorizontal: 25,
    borderRadius: 30,
    width: '100%',
  },
  cancelButtonText: {
    color: '#555',
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  healthProgressContainer: {
    alignItems: 'center',
    marginVertical: 15,
  },
  healthProgressTextContainer: {
    alignItems: 'center',
  },
  healthProgressText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#000',
  },
  healthProgressLabel: {
    fontSize: 12,
    color: '#555',
    marginTop: 4,
  },
  healthStatsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginVertical: 10,
    width: '100%',
  },
  healthStat: {
    alignItems: 'center',
  },
  healthStatLabel: {
    fontSize: 14,
    color: '#555',
    marginBottom: 4,
  },
  healthStatValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#000',
  },
});