import React from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  SafeAreaView,
  Image,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';

const WorkoutCompleteScreen = ({ route, navigation }) => {
  const { workout } = route.params;

  const handleDone = () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    navigation.navigate('Home');
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Workout Complete!</Text>
          <Text style={styles.headerSubtitle}>Great job! You've finished your workout.</Text>
        </View>

        {/* Workout Summary */}
        <View style={styles.summaryCard}>
          <Text style={styles.summaryTitle}>Workout Summary</Text>
          <View style={styles.summaryRow}>
            <View style={styles.summaryItem}>
              <Ionicons name="time-outline" size={24} color="#4A90E2" />
              <Text style={styles.summaryLabel}>Duration</Text>
              <Text style={styles.summaryValue}>{workout.duration}</Text>
            </View>
            <View style={styles.summaryItem}>
              <Ionicons name="flame-outline" size={24} color="#E24A4A" />
              <Text style={styles.summaryLabel}>Calories</Text>
              <Text style={styles.summaryValue}>{workout.calories}</Text>
            </View>
            <View style={styles.summaryItem}>
              <Ionicons name="fitness-outline" size={24} color="#4CAF50" />
              <Text style={styles.summaryLabel}>Exercises</Text>
              <Text style={styles.summaryValue}>{workout.steps.length}</Text>
            </View>
          </View>
        </View>

        {/* Achievements */}
        <View style={styles.achievementsCard}>
          <Text style={styles.achievementsTitle}>Achievements</Text>
          <View style={styles.achievementItem}>
            <View style={styles.achievementIcon}>
              <Ionicons name="trophy" size={24} color="#FFD700" />
            </View>
            <View style={styles.achievementContent}>
              <Text style={styles.achievementTitle}>Workout Completed</Text>
              <Text style={styles.achievementDescription}>
                You've completed your {workout.name} workout!
              </Text>
            </View>
          </View>
          <View style={styles.achievementItem}>
            <View style={styles.achievementIcon}>
              <Ionicons name="fitness" size={24} color="#4CAF50" />
            </View>
            <View style={styles.achievementContent}>
              <Text style={styles.achievementTitle}>Exercise Mastery</Text>
              <Text style={styles.achievementDescription}>
                Completed all {workout.steps.length} exercises
              </Text>
            </View>
          </View>
        </View>

        {/* Next Steps */}
        <View style={styles.nextStepsCard}>
          <Text style={styles.nextStepsTitle}>Next Steps</Text>
          <TouchableOpacity style={styles.nextStepButton}>
            <Ionicons name="water-outline" size={24} color="#4A90E2" />
            <Text style={styles.nextStepText}>Stay Hydrated</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.nextStepButton}>
            <Ionicons name="restaurant-outline" size={24} color="#4A90E2" />
            <Text style={styles.nextStepText}>Eat a Healthy Meal</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.nextStepButton}>
            <Ionicons name="bed-outline" size={24} color="#4A90E2" />
            <Text style={styles.nextStepText}>Get Rest</Text>
          </TouchableOpacity>
        </View>

        {/* Done Button */}
        <TouchableOpacity 
          style={styles.doneButton}
          onPress={handleDone}
        >
          <Text style={styles.doneButtonText}>Done</Text>
        </TouchableOpacity>
      </ScrollView>
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
    padding: 20,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 10,
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
  summaryCard: {
    margin: 20,
    padding: 20,
    backgroundColor: '#fff',
    borderRadius: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  summaryTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 20,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  summaryItem: {
    alignItems: 'center',
    flex: 1,
  },
  summaryLabel: {
    fontSize: 14,
    color: '#666',
    marginTop: 8,
  },
  summaryValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000',
    marginTop: 4,
  },
  achievementsCard: {
    margin: 20,
    padding: 20,
    backgroundColor: '#fff',
    borderRadius: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  achievementsTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 20,
  },
  achievementItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  achievementIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#FFF9E6',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  achievementContent: {
    flex: 1,
  },
  achievementTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 4,
  },
  achievementDescription: {
    fontSize: 14,
    color: '#666',
  },
  nextStepsCard: {
    margin: 20,
    padding: 20,
    backgroundColor: '#fff',
    borderRadius: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  nextStepsTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 20,
  },
  nextStepButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    backgroundColor: '#F5F5F5',
    borderRadius: 10,
    marginBottom: 10,
  },
  nextStepText: {
    fontSize: 16,
    color: '#000',
    marginLeft: 15,
  },
  doneButton: {
    margin: 20,
    backgroundColor: '#4A90E2',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
  },
  doneButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default WorkoutCompleteScreen; 