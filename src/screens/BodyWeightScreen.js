import React from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  SafeAreaView,
  FlatList
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useNavigation } from '@react-navigation/native';

const BODYWEIGHT_EXERCISES = [
  { id: '1', name: 'Push-ups', icon: 'body', difficulty: 'Beginner', muscles: 'Chest, Triceps' },
  { id: '2', name: 'Pull-ups', icon: 'body', difficulty: 'Intermediate', muscles: 'Back, Biceps' },
  { id: '3', name: 'Squats', icon: 'body', difficulty: 'Beginner', muscles: 'Legs, Glutes' },
  { id: '4', name: 'Lunges', icon: 'body', difficulty: 'Beginner', muscles: 'Legs, Glutes' },
  { id: '5', name: 'Plank', icon: 'body', difficulty: 'Beginner', muscles: 'Core' },
  { id: '6', name: 'Burpees', icon: 'body', difficulty: 'Intermediate', muscles: 'Full Body' },
  { id: '7', name: 'Dips', icon: 'body', difficulty: 'Intermediate', muscles: 'Triceps, Chest' },
  { id: '8', name: 'Handstand Push-ups', icon: 'body', difficulty: 'Advanced', muscles: 'Shoulders' },
  { id: '9', name: 'Muscle-ups', icon: 'body', difficulty: 'Advanced', muscles: 'Back, Arms' },
];

const BodyWeightScreen = () => {
  const navigation = useNavigation();

  const renderExercise = ({ item }) => (
    <TouchableOpacity 
      style={styles.exerciseCard}
      onPress={() => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        navigation.navigate('ExerciseDetail', { exercise: item });
      }}
    >
      <View style={styles.exerciseHeader}>
        <Ionicons name={item.icon} size={24} color="#4CAF50" />
        <Text style={styles.exerciseName}>{item.name}</Text>
      </View>
      <View style={styles.exerciseDetails}>
        <Text style={styles.exerciseDetail}>Difficulty: {item.difficulty}</Text>
        <Text style={styles.exerciseDetail}>Muscles: {item.muscles}</Text>
      </View>
    </TouchableOpacity>
  );

  return (
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
          <Text style={styles.headerTitle}>Bodyweight Exercises</Text>
          <View style={styles.headerRight} />
        </View>

        {/* Content */}
        <ScrollView contentContainerStyle={styles.content}>
          <Text style={styles.sectionDescription}>
            Build strength using just your body weight. No equipment needed for these exercises.
          </Text>
          
          <FlatList
            data={BODYWEIGHT_EXERCISES}
            renderItem={renderExercise}
            keyExtractor={item => item.id}
            scrollEnabled={false}
          />
        </ScrollView>
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
  headerRight: {
    width: 28,
  },
  content: {
    padding: 15,
    paddingBottom: 30,
  },
  sectionDescription: {
    fontSize: 16,
    color: '#555',
    marginBottom: 20,
    lineHeight: 24,
  },
  exerciseCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 15,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 5,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
  },
  exerciseHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  exerciseName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000',
    marginLeft: 10,
  },
  exerciseDetails: {
    marginLeft: 34, // Match icon size + margin
  },
  exerciseDetail: {
    fontSize: 14,
    color: '#555',
    marginBottom: 4,
  },
});

export default BodyWeightScreen;