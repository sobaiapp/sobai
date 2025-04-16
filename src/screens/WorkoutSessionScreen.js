import React, { useState, useEffect, useRef } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  SafeAreaView,
  Image,
  Animated,
  Vibration,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';

const WorkoutSessionScreen = ({ route, navigation }) => {
  const { workout } = route.params;
  const [currentStep, setCurrentStep] = useState(0);
  const [isActive, setIsActive] = useState(false);
  const [time, setTime] = useState(0);
  const [isResting, setIsResting] = useState(false);
  const progressAnim = useRef(new Animated.Value(0)).current;

  const WORK_TIME = 30; // seconds per exercise
  const REST_TIME = 10; // seconds rest between exercises

  useEffect(() => {
    let interval = null;
    if (isActive) {
      interval = setInterval(() => {
        setTime((time) => {
          if (isResting) {
            if (time <= 1) {
              setIsResting(false);
              setCurrentStep((prev) => (prev + 1) % workout.steps.length);
              Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
              return 0;
            }
            return time - 1;
          } else {
            if (time >= WORK_TIME) {
              setIsResting(true);
              Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
              return REST_TIME;
            }
            return time + 1;
          }
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isActive, isResting]);

  useEffect(() => {
    Animated.timing(progressAnim, {
      toValue: isResting ? 0 : time / WORK_TIME,
      duration: 1000,
      useNativeDriver: false,
    }).start();
  }, [time, isResting]);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  const toggleWorkout = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setIsActive(!isActive);
  };

  const handleComplete = () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    const workoutData = {
      name: workout.name,
      duration: formatTime(time),
      calories: Math.round(time / 60 * 5), // Rough estimate: 5 calories per minute
      steps: workout.steps
    };
    navigation.navigate('WorkoutComplete', { workout: workoutData });
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity 
            onPress={() => navigation.goBack()}
            style={styles.backButton}
          >
            <Ionicons name="close" size={28} color="#000" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>{workout.name}</Text>
          <TouchableOpacity 
            onPress={handleComplete}
            style={styles.finishButton}
          >
            <Text style={styles.finishButtonText}>Finish</Text>
          </TouchableOpacity>
        </View>

        {/* Timer Section */}
        <View style={styles.timerSection}>
          <Text style={styles.timerText}>
            {formatTime(isResting ? REST_TIME - time : WORK_TIME - time)}
          </Text>
          <Text style={styles.phaseText}>
            {isResting ? 'Rest' : 'Work'}
          </Text>
          <View style={styles.progressContainer}>
            <Animated.View 
              style={[
                styles.progressBar,
                { 
                  width: progressAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: ['0%', '100%'],
                  }),
                  backgroundColor: isResting ? '#4CAF50' : '#4A90E2',
                }
              ]} 
            />
          </View>
        </View>

        {/* Exercise Section */}
        <View style={styles.exerciseSection}>
          <Text style={styles.stepNumber}>
            Step {currentStep + 1} of {workout.steps.length}
          </Text>
          <Text style={styles.stepText}>
            {workout.steps[currentStep]}
          </Text>
        </View>

        {/* Control Section */}
        <View style={styles.controlSection}>
          <TouchableOpacity 
            style={[styles.controlButton, isActive && styles.activeButton]}
            onPress={toggleWorkout}
          >
            <Ionicons 
              name={isActive ? 'pause' : 'play'} 
              size={32} 
              color="#fff" 
            />
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#fff',
  },
  container: {
    flex: 1,
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
  finishButton: {
    padding: 8,
  },
  finishButtonText: {
    color: '#4A90E2',
    fontSize: 16,
    fontWeight: '600',
  },
  timerSection: {
    alignItems: 'center',
    padding: 20,
  },
  timerText: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#000',
  },
  phaseText: {
    fontSize: 18,
    color: '#666',
    marginTop: 5,
  },
  progressContainer: {
    width: '100%',
    height: 4,
    backgroundColor: '#eee',
    borderRadius: 2,
    marginTop: 20,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    borderRadius: 2,
  },
  exerciseSection: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
  },
  stepNumber: {
    fontSize: 16,
    color: '#666',
    marginBottom: 10,
  },
  stepText: {
    fontSize: 24,
    color: '#000',
    lineHeight: 32,
    textAlign: 'center',
  },
  controlSection: {
    padding: 20,
    alignItems: 'center',
  },
  controlButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#4A90E2',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  activeButton: {
    backgroundColor: '#E24A4A',
  },
});

export default WorkoutSessionScreen; 