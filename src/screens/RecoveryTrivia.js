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

const RecoveryTrivia = ({ navigation }) => {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [score, setScore] = useState(0);
  const [showScore, setShowScore] = useState(false);
  const [fadeAnim] = useState(new Animated.Value(0));

  const questions = [
    {
      question: "What is the first step in the 12-step program?",
      options: [
        "Admitted we were powerless over alcohol",
        "Made a decision to turn our will over to God",
        "Made a searching and fearless moral inventory",
        "Made direct amends to those we had harmed"
      ],
      correctAnswer: 0
    },
    {
      question: "What does H.A.L.T. stand for in recovery?",
      options: [
        "Hungry, Angry, Lonely, Tired",
        "Happy, Active, Loving, Trusting",
        "Help, Acceptance, Love, Trust",
        "Hope, Action, Love, Time"
      ],
      correctAnswer: 0
    },
    {
      question: "What is a common trigger for relapse?",
      options: [
        "Stress",
        "Celebration",
        "Boredom",
        "All of the above"
      ],
      correctAnswer: 3
    },
    {
      question: "What is the most important tool in early recovery?",
      options: [
        "Support network",
        "Medication",
        "Exercise",
        "Diet"
      ],
      correctAnswer: 0
    },
    {
      question: "What is the purpose of a sponsor?",
      options: [
        "To provide financial support",
        "To guide you through the steps",
        "To be your therapist",
        "To make decisions for you"
      ],
      correctAnswer: 1
    }
  ];

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true
    }).start();
  }, [currentQuestion]);

  const handleAnswer = (selectedAnswer) => {
    if (selectedAnswer === questions[currentQuestion].correctAnswer) {
      setScore(score + 1);
      Alert.alert(
        "Correct!",
        "Great job! You're learning well.",
        [{ text: "Continue", onPress: nextQuestion }]
      );
    } else {
      Alert.alert(
        "Incorrect",
        "That's okay! Keep learning.",
        [{ text: "Continue", onPress: nextQuestion }]
      );
    }
  };

  const nextQuestion = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
      fadeAnim.setValue(0);
    } else {
      setShowScore(true);
    }
  };

  const resetGame = () => {
    setCurrentQuestion(0);
    setScore(0);
    setShowScore(false);
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
            <Text style={styles.headerTitle}>Quiz Complete!</Text>
          </View>
        </LinearGradient>

        <View style={styles.scoreContainer}>
          <Text style={styles.scoreTitle}>Your Score</Text>
          <Text style={styles.score}>{score}/{questions.length}</Text>
          <Text style={styles.scoreSubtitle}>
            {score === questions.length ? "Perfect! 🎉" : 
             score >= questions.length/2 ? "Good job! 👍" : 
             "Keep learning! 💪"}
          </Text>
          
          <TouchableOpacity 
            style={styles.restartButton}
            onPress={resetGame}
          >
            <Text style={styles.restartButtonText}>Try Again</Text>
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
          <Text style={styles.headerTitle}>Recovery Trivia</Text>
          <Text style={styles.progressText}>
            Question {currentQuestion + 1}/{questions.length}
          </Text>
        </View>
      </LinearGradient>

      <Animated.View 
        style={[
          styles.gameContainer,
          { opacity: fadeAnim }
        ]}
      >
        <View style={styles.questionContainer}>
          <Text style={styles.questionText}>
            {questions[currentQuestion].question}
          </Text>
        </View>

        <View style={styles.optionsContainer}>
          {questions[currentQuestion].options.map((option, index) => (
            <TouchableOpacity
              key={index}
              style={styles.optionButton}
              onPress={() => handleAnswer(index)}
            >
              <Text style={styles.optionText}>{option}</Text>
            </TouchableOpacity>
          ))}
        </View>
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
  questionContainer: {
    flex: 1,
    justifyContent: 'center',
    padding: 20,
  },
  questionText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#000',
    textAlign: 'center',
  },
  optionsContainer: {
    gap: 16,
  },
  optionButton: {
    backgroundColor: '#f5f5f5',
    padding: 20,
    borderRadius: 16,
  },
  optionText: {
    fontSize: 18,
    color: '#000',
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
    fontSize: 48,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 20,
  },
  scoreSubtitle: {
    fontSize: 20,
    color: '#666',
    marginBottom: 40,
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

export default RecoveryTrivia; 