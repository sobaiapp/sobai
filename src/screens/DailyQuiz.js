import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  SafeAreaView,
  Platform,
  StatusBar
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

const DailyQuiz = ({ navigation }) => {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [score, setScore] = useState(0);
  const [showScore, setShowScore] = useState(false);

  const questions = [
    {
      question: "What does H.A.L.T. stand for in recovery?",
      options: [
        "Hungry, Angry, Lonely, Tired",
        "Happy, Active, Loving, Trusting",
        "Help, Ask, Listen, Talk",
        "Hope, Action, Love, Trust"
      ],
      correctAnswer: 0
    },
    {
      question: "What is the recommended daily water intake for recovery?",
      options: [
        "2-3 liters",
        "1-2 liters",
        "3-4 liters",
        "4-5 liters"
      ],
      correctAnswer: 0
    },
    {
      question: "What is the first step in the 12-step program?",
      options: [
        "Admitting powerlessness over addiction",
        "Finding a higher power",
        "Making amends",
        "Taking inventory"
      ],
      correctAnswer: 0
    },
    {
      question: "What is a common trigger for relapse?",
      options: [
        "All of the above",
        "Stress",
        "Social situations",
        "Emotional distress"
      ],
      correctAnswer: 0
    },
    {
      question: "What is the recommended amount of sleep for recovery?",
      options: [
        "7-9 hours",
        "5-6 hours",
        "9-10 hours",
        "6-7 hours"
      ],
      correctAnswer: 0
    }
  ];

  const handleAnswer = (selectedAnswer) => {
    if (selectedAnswer === questions[currentQuestion].correctAnswer) {
      setScore(score + 1);
    }

    if (currentQuestion + 1 < questions.length) {
      setCurrentQuestion(currentQuestion + 1);
    } else {
      setShowScore(true);
    }
  };

  const restartQuiz = () => {
    setCurrentQuestion(0);
    setScore(0);
    setShowScore(false);
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <LinearGradient
        colors={['#ffffff', '#f8f8f8']}
        style={styles.headerGradient}
      >
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="arrow-back" size={24} color="#000" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Sobriety Quiz</Text>
          <View style={styles.scoreContainer}>
            <Text style={styles.scoreText}>Score: {score}</Text>
          </View>
        </View>
      </LinearGradient>

      <View style={styles.quizContainer}>
        {showScore ? (
          <View style={styles.scoreView}>
            <Text style={styles.scoreTitle}>Quiz Complete!</Text>
            <Text style={styles.scoreResult}>
              You scored {score} out of {questions.length}
            </Text>
            <TouchableOpacity
              style={styles.restartButton}
              onPress={restartQuiz}
            >
              <Text style={styles.restartButtonText}>Restart Quiz</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <>
            <View style={styles.questionContainer}>
              <Text style={styles.questionText}>
                {questions[currentQuestion].question}
              </Text>
              <Text style={styles.questionCount}>
                Question {currentQuestion + 1}/{questions.length}
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
          </>
        )}
      </View>
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
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 20,
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#000',
  },
  scoreContainer: {
    alignItems: 'flex-end',
  },
  scoreText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
  },
  quizContainer: {
    flex: 1,
    padding: 20,
  },
  questionContainer: {
    marginBottom: 30,
  },
  questionText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 10,
  },
  questionCount: {
    fontSize: 16,
    color: '#666',
  },
  optionsContainer: {
    flex: 1,
  },
  optionButton: {
    backgroundColor: '#f5f5f5',
    padding: 20,
    borderRadius: 10,
    marginBottom: 15,
  },
  optionText: {
    fontSize: 18,
    color: '#000',
  },
  scoreView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scoreTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 20,
  },
  scoreResult: {
    fontSize: 24,
    color: '#666',
    marginBottom: 30,
  },
  restartButton: {
    backgroundColor: '#000',
    paddingHorizontal: 30,
    paddingVertical: 15,
    borderRadius: 10,
  },
  restartButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default DailyQuiz; 