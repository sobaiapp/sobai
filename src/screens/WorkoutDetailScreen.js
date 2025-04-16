import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  SafeAreaView,
  FlatList,
  Image,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';

// Mock data for workouts
const WORKOUTS = {
  'Bodyweight': [
    { 
      id: '1', 
      name: 'Push-ups', 
      duration: '10 min', 
      difficulty: 'Medium',
      calories: 80,
      image: 'https://images.unsplash.com/photo-1598971639058-fab3c3109a00?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60',
      description: 'A classic bodyweight exercise that targets the chest, shoulders, and triceps.',
      steps: [
        'Start in a plank position with hands slightly wider than shoulders',
        'Lower your body until your chest nearly touches the floor',
        'Push your body back up to the starting position',
        'Repeat for the desired number of repetitions'
      ]
    },
    { 
      id: '2', 
      name: 'Squats', 
      duration: '15 min', 
      difficulty: 'Easy',
      calories: 100,
      image: 'https://images.unsplash.com/photo-1599058917765-a780eda07a3e?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60',
      description: 'A fundamental lower body exercise that targets the quadriceps, hamstrings, and glutes.',
      steps: [
        'Stand with feet shoulder-width apart',
        'Lower your body by bending your knees and hips',
        'Keep your back straight and chest up',
        'Return to the starting position by pushing through your heels'
      ]
    },
    { 
      id: '3', 
      name: 'Plank', 
      duration: '5 min', 
      difficulty: 'Medium',
      calories: 40,
      image: 'https://images.unsplash.com/photo-1599058917765-a780eda07a3e?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60',
      description: 'An isometric core exercise that strengthens the entire body.',
      steps: [
        'Start in a push-up position with forearms on the ground',
        'Keep your body in a straight line from head to heels',
        'Engage your core and hold the position'
      ]
    },
  ],
  'Strength': [
    { 
      id: '1', 
      name: 'Dumbbell Rows', 
      duration: '15 min', 
      difficulty: 'Medium',
      calories: 120,
      image: 'https://images.unsplash.com/photo-1583454110551-21f2fa2afe61?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60',
      description: 'A back exercise that targets the latissimus dorsi, rhomboids, and biceps.',
      steps: [
        'Stand with feet shoulder-width apart, holding a dumbbell in each hand',
        'Bend at the hips and knees, keeping your back straight',
        'Pull the dumbbells toward your hips, squeezing your shoulder blades together',
        'Lower the dumbbells with control and repeat'
      ]
    },
    { 
      id: '2', 
      name: 'Dumbbell Press', 
      duration: '15 min', 
      difficulty: 'Medium',
      calories: 110,
      image: 'https://images.unsplash.com/photo-1583454110551-21f2fa2afe61?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60',
      description: 'A chest exercise that targets the pectoralis major, anterior deltoids, and triceps.',
      steps: [
        'Lie on a bench with a dumbbell in each hand',
        'Press the dumbbells upward until your arms are fully extended',
        'Lower the dumbbells with control and repeat'
      ]
    },
  ],
  'Cardio': [
    { 
      id: '1', 
      name: 'Jump Rope', 
      duration: '20 min', 
      difficulty: 'Medium',
      calories: 200,
      image: 'https://images.unsplash.com/photo-1599058917765-a780eda07a3e?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60',
      description: 'A high-intensity cardio exercise that improves coordination and burns calories.',
      steps: [
        'Hold the jump rope handles at your sides',
        'Jump over the rope as it passes under your feet',
        'Land softly on the balls of your feet',
        'Continue jumping at a steady pace'
      ]
    },
    { 
      id: '2', 
      name: 'Burpees', 
      duration: '15 min', 
      difficulty: 'Hard',
      calories: 180,
      image: 'https://images.unsplash.com/photo-1599058917765-a780eda07a3e?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60',
      description: 'A full-body exercise that combines strength and cardio.',
      steps: [
        'Start in a standing position',
        'Drop into a squat position with hands on the ground',
        'Kick your feet back into a plank position',
        'Immediately return your feet to the squat position',
        'Jump up from the squatting position'
      ]
    },
  ],
  'HIIT': [
    { 
      id: '1', 
      name: 'Mountain Climbers', 
      duration: '10 min', 
      difficulty: 'Hard',
      calories: 150,
      image: 'https://images.unsplash.com/photo-1599058917765-a780eda07a3e?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60',
      description: 'A high-intensity exercise that targets the core and improves cardiovascular fitness.',
      steps: [
        'Start in a plank position',
        'Drive one knee toward your chest',
        'Quickly switch legs, alternating between left and right',
        'Keep your core engaged throughout the movement'
      ]
    },
    { 
      id: '2', 
      name: 'Jumping Jacks', 
      duration: '10 min', 
      difficulty: 'Easy',
      calories: 100,
      image: 'https://images.unsplash.com/photo-1599058917765-a780eda07a3e?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60',
      description: 'A classic cardio exercise that gets your heart rate up quickly.',
      steps: [
        'Start in a standing position with feet together and arms at your sides',
        'Jump and spread your legs while raising your arms above your head',
        'Jump back to the starting position and repeat'
      ]
    },
  ],
  'Stretching': [
    { 
      id: '1', 
      name: 'Hamstring Stretch', 
      duration: '5 min', 
      difficulty: 'Easy',
      calories: 20,
      image: 'https://images.unsplash.com/photo-1599058917765-a780eda07a3e?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60',
      description: 'A stretch that targets the hamstrings and lower back.',
      steps: [
        'Sit on the floor with one leg extended and the other bent',
        'Reach toward your toes, keeping your back straight',
        'Hold the stretch for 30 seconds',
        'Switch legs and repeat'
      ]
    },
    { 
      id: '2', 
      name: 'Quad Stretch', 
      duration: '5 min', 
      difficulty: 'Easy',
      calories: 20,
      image: 'https://images.unsplash.com/photo-1599058917765-a780eda07a3e?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60',
      description: 'A stretch that targets the quadriceps muscles.',
      steps: [
        'Stand on one leg, holding onto a wall or chair for balance',
        'Bend your other knee and grab your foot with your hand',
        'Pull your heel toward your glutes',
        'Hold for 30 seconds and switch legs'
      ]
    },
  ],
  'Mobility': [
    { 
      id: '1', 
      name: 'Hip Circles', 
      duration: '10 min', 
      difficulty: 'Easy',
      calories: 30,
      image: 'https://images.unsplash.com/photo-1599058917765-a780eda07a3e?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60',
      description: 'A mobility exercise that improves hip range of motion.',
      steps: [
        'Stand with feet shoulder-width apart',
        'Lift one leg and make circular motions with your hip',
        'Perform 10 circles in each direction',
        'Switch legs and repeat'
      ]
    },
    { 
      id: '2', 
      name: 'Shoulder Rolls', 
      duration: '10 min', 
      difficulty: 'Easy',
      calories: 30,
      image: 'https://images.unsplash.com/photo-1599058917765-a780eda07a3e?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60',
      description: 'A mobility exercise that improves shoulder range of motion.',
      steps: [
        'Stand or sit with your arms at your sides',
        'Roll your shoulders forward in a circular motion',
        'Perform 10 rolls, then reverse direction',
        'Repeat for 3 sets'
      ]
    },
  ],
  'Yoga': [
    { 
      id: '1', 
      name: 'Sun Salutation', 
      duration: '15 min', 
      difficulty: 'Medium',
      calories: 80,
      image: 'https://images.unsplash.com/photo-1599058917765-a780eda07a3e?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60',
      description: 'A sequence of yoga poses that flow together to warm up the body.',
      steps: [
        'Start in Mountain Pose',
        'Raise your arms overhead and arch back slightly',
        'Forward fold, bending at the hips',
        'Half lift, extending your spine',
        'Plank pose',
        'Lower to the ground',
        'Upward-facing dog',
        'Downward-facing dog',
        'Return to standing'
      ]
    },
    { 
      id: '2', 
      name: 'Warrior Pose', 
      duration: '10 min', 
      difficulty: 'Medium',
      calories: 50,
      image: 'https://images.unsplash.com/photo-1599058917765-a780eda07a3e?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60',
      description: 'A standing pose that builds strength and stability.',
      steps: [
        'Step your feet wide apart',
        'Turn your right foot out 90 degrees',
        'Bend your right knee over your ankle',
        'Raise your arms overhead',
        'Hold for 5 breaths, then switch sides'
      ]
    },
  ],
  'Plyometrics': [
    { 
      id: '1', 
      name: 'Box Jumps', 
      duration: '15 min', 
      difficulty: 'Hard',
      calories: 150,
      image: 'https://images.unsplash.com/photo-1599058917765-a780eda07a3e?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60',
      description: 'A plyometric exercise that improves power and explosiveness.',
      steps: [
        'Stand in front of a box or platform',
        'Squat down and explode upward',
        'Land softly on the box with both feet',
        'Step down and repeat'
      ]
    },
    { 
      id: '2', 
      name: 'Jump Squats', 
      duration: '15 min', 
      difficulty: 'Hard',
      calories: 140,
      image: 'https://images.unsplash.com/photo-1599058917765-a780eda07a3e?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60',
      description: 'A plyometric exercise that targets the lower body.',
      steps: [
        'Start in a squat position',
        'Explosively jump upward',
        'Land softly back in the squat position',
        'Immediately repeat the movement'
      ]
    },
  ],
  'Core': [
    { 
      id: '1', 
      name: 'Crunches', 
      duration: '10 min', 
      difficulty: 'Easy',
      calories: 60,
      image: 'https://images.unsplash.com/photo-1599058917765-a780eda07a3e?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60',
      description: 'A classic core exercise that targets the rectus abdominis.',
      steps: [
        'Lie on your back with knees bent and feet flat on the floor',
        'Place your hands behind your head, supporting your neck',
        'Lift your shoulders off the ground, engaging your core',
        'Lower back down with control and repeat'
      ]
    },
    { 
      id: '2', 
      name: 'Russian Twists', 
      duration: '10 min', 
      difficulty: 'Medium',
      calories: 70,
      image: 'https://images.unsplash.com/photo-1599058917765-a780eda07a3e?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60',
      description: 'A core exercise that targets the obliques.',
      steps: [
        'Sit on the floor with knees bent and feet elevated',
        'Lean back slightly and twist your torso to the right',
        'Return to center and twist to the left',
        'Continue alternating sides'
      ]
    },
  ],
};

const WorkoutDetailScreen = ({ route, navigation }) => {
  const { category } = route.params;
  const [selectedWorkout, setSelectedWorkout] = useState(null);
  const [loading, setLoading] = useState(false);

  const workouts = WORKOUTS[category] || [];

  const handleWorkoutPress = (workout) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setSelectedWorkout(workout);
  };

  const startWorkout = (workout) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setLoading(true);
    
    // Simulate loading
    setTimeout(() => {
      setLoading(false);
      navigation.navigate('WorkoutSession', { workout });
    }, 1500);
  };

  const renderWorkoutItem = ({ item }) => (
    <TouchableOpacity 
      style={styles.workoutCard}
      onPress={() => handleWorkoutPress(item)}
    >
      <Image 
        source={{ uri: item.image }} 
        style={styles.workoutImage}
        resizeMode="cover"
      />
      <View style={styles.workoutInfo}>
        <Text style={styles.workoutName}>{item.name}</Text>
        <View style={styles.workoutDetails}>
          <View style={styles.detailItem}>
            <Ionicons name="time-outline" size={16} color="#666" />
            <Text style={styles.detailText}>{item.duration}</Text>
          </View>
          <View style={styles.detailItem}>
            <Ionicons name="fitness-outline" size={16} color="#666" />
            <Text style={styles.detailText}>{item.difficulty}</Text>
          </View>
          <View style={styles.detailItem}>
            <Ionicons name="flame-outline" size={16} color="#666" />
            <Text style={styles.detailText}>{item.calories} cal</Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity 
            onPress={() => navigation.goBack()}
            style={styles.backButton}
          >
            <Ionicons name="chevron-back" size={28} color="#000" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>{category} Workouts</Text>
          <View style={styles.headerRight} />
        </View>

        {/* Workout List */}
        <ScrollView contentContainerStyle={styles.content}>
          <FlatList
            data={workouts}
            renderItem={renderWorkoutItem}
            keyExtractor={item => item.id}
            scrollEnabled={false}
          />
        </ScrollView>

        {/* Workout Detail Modal */}
        {selectedWorkout && (
          <View style={styles.modalContainer}>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>{selectedWorkout.name}</Text>
                <TouchableOpacity 
                  onPress={() => setSelectedWorkout(null)}
                  style={styles.closeButton}
                >
                  <Ionicons name="close" size={24} color="#000" />
                </TouchableOpacity>
              </View>
              
              <Image 
                source={{ uri: selectedWorkout.image }} 
                style={styles.modalImage}
                resizeMode="cover"
              />
              
              <View style={styles.workoutStats}>
                <View style={styles.statItem}>
                  <Ionicons name="time-outline" size={20} color="#4A90E2" />
                  <Text style={styles.statValue}>{selectedWorkout.duration}</Text>
                  <Text style={styles.statLabel}>Duration</Text>
                </View>
                <View style={styles.statItem}>
                  <Ionicons name="fitness-outline" size={20} color="#4A90E2" />
                  <Text style={styles.statValue}>{selectedWorkout.difficulty}</Text>
                  <Text style={styles.statLabel}>Difficulty</Text>
                </View>
                <View style={styles.statItem}>
                  <Ionicons name="flame-outline" size={20} color="#4A90E2" />
                  <Text style={styles.statValue}>{selectedWorkout.calories}</Text>
                  <Text style={styles.statLabel}>Calories</Text>
                </View>
              </View>
              
              <Text style={styles.sectionTitle}>Description</Text>
              <Text style={styles.description}>{selectedWorkout.description}</Text>
              
              <Text style={styles.sectionTitle}>Steps</Text>
              {selectedWorkout.steps.map((step, index) => (
                <View key={index} style={styles.stepItem}>
                  <View style={styles.stepNumber}>
                    <Text style={styles.stepNumberText}>{index + 1}</Text>
                  </View>
                  <Text style={styles.stepText}>{step}</Text>
                </View>
              ))}
              
              <TouchableOpacity 
                style={styles.startButton}
                onPress={() => startWorkout(selectedWorkout)}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator color="#FFFFFF" />
                ) : (
                  <>
                    <Ionicons name="play" size={20} color="#FFFFFF" />
                    <Text style={styles.startButtonText}>Start Workout</Text>
                  </>
                )}
              </TouchableOpacity>
            </View>
          </View>
        )}
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
  },
  workoutCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    overflow: 'hidden',
  },
  workoutImage: {
    width: '100%',
    height: 150,
  },
  workoutInfo: {
    padding: 15,
  },
  workoutName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 10,
  },
  workoutDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  detailText: {
    marginLeft: 5,
    color: '#666',
    fontSize: 14,
  },
  modalContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 12,
    width: '100%',
    maxHeight: '80%',
    padding: 20,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#000',
  },
  closeButton: {
    padding: 5,
  },
  modalImage: {
    width: '100%',
    height: 200,
    borderRadius: 8,
    marginBottom: 15,
  },
  workoutStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#000',
    marginTop: 5,
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000',
    marginTop: 15,
    marginBottom: 10,
  },
  description: {
    fontSize: 16,
    color: '#333',
    lineHeight: 24,
    marginBottom: 15,
  },
  stepItem: {
    flexDirection: 'row',
    marginBottom: 10,
  },
  stepNumber: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#4A90E2',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  stepNumberText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  stepText: {
    flex: 1,
    fontSize: 16,
    color: '#333',
    lineHeight: 24,
  },
  startButton: {
    backgroundColor: '#4A90E2',
    borderRadius: 30,
    paddingVertical: 15,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 20,
  },
  startButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 10,
  },
});

export default WorkoutDetailScreen; 