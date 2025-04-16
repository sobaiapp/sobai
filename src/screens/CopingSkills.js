import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Platform,
  StatusBar,
  SafeAreaView,
  Animated,
  Alert
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

const CopingSkills = ({ navigation }) => {
  const [currentSkill, setCurrentSkill] = useState(null);
  const [score, setScore] = useState(0);
  const [showScore, setShowScore] = useState(false);
  const [fadeAnim] = useState(new Animated.Value(0));

  const copingSkills = [
    {
      id: 1,
      title: "Deep Breathing",
      description: "Take slow, deep breaths to calm your mind",
      steps: [
        "Find a quiet place",
        "Inhale deeply for 4 seconds",
        "Hold for 4 seconds",
        "Exhale slowly for 4 seconds",
        "Repeat 5 times"
      ]
    },
    {
      id: 2,
      title: "Progressive Muscle Relaxation",
      description: "Tense and relax each muscle group",
      steps: [
        "Start with your feet",
        "Tense muscles for 5 seconds",
        "Release and relax",
        "Move up to calves",
        "Continue to head"
      ]
    },
    {
      id: 3,
      title: "Mindful Walking",
      description: "Focus on each step and your surroundings",
      steps: [
        "Walk at a comfortable pace",
        "Notice your breathing",
        "Feel your feet touching ground",
        "Observe your surroundings",
        "Stay present in the moment"
      ]
    },
    {
      id: 4,
      title: "Gratitude Journaling",
      description: "Write down things you're thankful for",
      steps: [
        "Get a notebook",
        "List 3 things you're grateful for",
        "Describe why you're grateful",
        "Reflect on positive feelings",
        "Make it a daily habit"
      ]
    },
    {
      id: 5,
      title: "Guided Meditation",
      description: "Follow a calming meditation guide",
      steps: [
        "Find a quiet space",
        "Close your eyes",
        "Focus on your breath",
        "Follow the guide's voice",
        "Let thoughts come and go"
      ]
    }
  ];

  useEffect(() => {
    shuffleSkills();
  }, []);

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true
    }).start();
  }, [currentSkill]);

  const shuffleSkills = () => {
    const shuffled = [...copingSkills].sort(() => Math.random() - 0.5);
    setCurrentSkill(shuffled[0]);
  };

  const nextSkill = () => {
    const currentIndex = copingSkills.indexOf(currentSkill);
    if (currentIndex < copingSkills.length - 1) {
      setCurrentSkill(copingSkills[currentIndex + 1]);
      fadeAnim.setValue(0);
    } else {
      setShowScore(true);
    }
  };

  const resetGame = () => {
    setScore(0);
    setShowScore(false);
    shuffleSkills();
    fadeAnim.setValue(0);
  };

  if (showScore) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="dark-content" />
        <LinearGradient
          colors={['#ffffff', '#f8f8f8']}
          style={styles.headerGradient}
        >
          <View style={styles.header}>
            <TouchableOpacity 
              onPress={() => navigation.goBack()}
              style={styles.backButton}
            >
              <Ionicons name="chevron-back" size={24} color="#000" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Practice Complete!</Text>
          </View>
        </LinearGradient>

        <View style={styles.scoreContainer}>
          <Text style={styles.scoreTitle}>Great Job!</Text>
          <Text style={styles.score}>You practiced {copingSkills.length} coping skills</Text>
          <Text style={styles.scoreSubtitle}>
            Keep practicing these skills daily to build resilience
          </Text>
          
          <TouchableOpacity 
            style={styles.restartButton}
            onPress={resetGame}
          >
            <Text style={styles.restartButtonText}>Practice Again</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <LinearGradient
        colors={['#ffffff', '#f8f8f8']}
        style={styles.headerGradient}
      >
        <View style={styles.header}>
          <TouchableOpacity 
            onPress={() => navigation.goBack()}
            style={styles.backButton}
          >
            <Ionicons name="chevron-back" size={24} color="#000" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Coping Skills</Text>
          <Text style={styles.progressText}>
            Skill {copingSkills.indexOf(currentSkill) + 1}/{copingSkills.length}
          </Text>
        </View>
      </LinearGradient>

      <Animated.View 
        style={[
          styles.gameContainer,
          { opacity: fadeAnim }
        ]}
      >
        <View style={styles.skillContainer}>
          <Text style={styles.skillTitle}>{currentSkill?.title}</Text>
          <Text style={styles.skillDescription}>{currentSkill?.description}</Text>
          
          <View style={styles.stepsContainer}>
            {currentSkill?.steps.map((step, index) => (
              <View key={index} style={styles.stepItem}>
                <View style={styles.stepNumber}>
                  <Text style={styles.stepNumberText}>{index + 1}</Text>
                </View>
                <Text style={styles.stepText}>{step}</Text>
              </View>
            ))}
          </View>
        </View>

        <TouchableOpacity
          style={styles.nextButton}
          onPress={nextSkill}
        >
          <Text style={styles.nextButtonText}>Next Skill</Text>
        </TouchableOpacity>
      </Animated.View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  headerGradient: {
    paddingTop: Platform.OS === 'ios' ? 0 : StatusBar.currentHeight,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  header: {
    paddingHorizontal: 20,
    paddingVertical: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  backButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: '#f5f5f5',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#000',
  },
  progressText: {
    fontSize: 16,
    color: '#666',
  },
  gameContainer: {
    flex: 1,
    padding: 20,
    justifyContent: 'space-between',
  },
  skillContainer: {
    flex: 1,
  },
  skillTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 16,
    textAlign: 'center',
  },
  skillDescription: {
    fontSize: 18,
    color: '#666',
    marginBottom: 32,
    textAlign: 'center',
  },
  stepsContainer: {
    gap: 16,
  },
  stepItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    padding: 16,
    borderRadius: 16,
  },
  stepNumber: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#000',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  stepNumberText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  stepText: {
    flex: 1,
    fontSize: 16,
    color: '#000',
  },
  nextButton: {
    backgroundColor: '#000',
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 30,
    marginTop: 32,
  },
  nextButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
    textAlign: 'center',
  },
  scoreContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  scoreTitle: {
    fontSize: 24,
    color: '#666',
    marginBottom: 20,
  },
  score: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 20,
  },
  scoreSubtitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 40,
    textAlign: 'center',
  },
  restartButton: {
    backgroundColor: '#000',
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 30,
  },
  restartButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
});

export default CopingSkills; 