import React, { useState, useEffect } from 'react';
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

const MathChallenge = ({ navigation }) => {
  const [currentProblem, setCurrentProblem] = useState(null);
  const [score, setScore] = useState(0);
  const [level, setLevel] = useState(1);
  const [timeLeft, setTimeLeft] = useState(30);

  const copingSkills = [
    { problem: '5 + 3', answer: 8, skill: 'Deep Breathing' },
    { problem: '10 - 4', answer: 6, skill: 'Meditation' },
    { problem: '2 × 4', answer: 8, skill: 'Exercise' },
    { problem: '12 ÷ 3', answer: 4, skill: 'Journaling' },
    { problem: '7 + 5', answer: 12, skill: 'Calling a Friend' },
    { problem: '15 - 8', answer: 7, skill: 'Taking a Walk' },
    { problem: '3 × 5', answer: 15, skill: 'Listening to Music' },
    { problem: '20 ÷ 4', answer: 5, skill: 'Reading' }
  ];

  useEffect(() => {
    generateProblem();
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          handleTimeUp();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [level]);

  const generateProblem = () => {
    const randomProblem = copingSkills[Math.floor(Math.random() * copingSkills.length)];
    setCurrentProblem(randomProblem);
  };

  const handleAnswer = (answer) => {
    if (answer === currentProblem.answer) {
      setScore(score + 10);
      Alert.alert(
        'Correct!',
        `Great job! Try ${currentProblem.skill} when feeling stressed.`,
        [{ text: 'Next Problem', onPress: generateProblem }]
      );
    } else {
      Alert.alert(
        'Incorrect',
        `The correct answer is ${currentProblem.answer}. Try ${currentProblem.skill} when feeling stressed.`,
        [{ text: 'Try Again', onPress: generateProblem }]
      );
    }
  };

  const handleTimeUp = () => {
    Alert.alert(
      'Time\'s Up!',
      `Your final score is ${score}.`,
      [
        { text: 'Play Again', onPress: () => {
          setScore(0);
          setLevel(level + 1);
          setTimeLeft(30);
        }}
      ]
    );
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
          <Text style={styles.headerTitle}>Coping Skills</Text>
          <View style={styles.scoreContainer}>
            <Text style={styles.scoreText}>Score: {score}</Text>
            <Text style={styles.levelText}>Level: {level}</Text>
          </View>
        </View>
      </LinearGradient>

      <View style={styles.gameContainer}>
        <Text style={styles.timerText}>Time: {timeLeft}s</Text>
        {currentProblem && (
          <>
            <Text style={styles.problemText}>{currentProblem.problem}</Text>
            <View style={styles.optionsContainer}>
              {[currentProblem.answer - 2, currentProblem.answer - 1, currentProblem.answer, currentProblem.answer + 1]
                .sort(() => Math.random() - 0.5)
                .map((option, index) => (
                  <TouchableOpacity
                    key={index}
                    style={styles.optionButton}
                    onPress={() => handleAnswer(option)}
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
  levelText: {
    fontSize: 14,
    color: '#666',
  },
  gameContainer: {
    flex: 1,
    padding: 20,
    alignItems: 'center',
  },
  timerText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 30,
  },
  problemText: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 40,
  },
  optionsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 20,
  },
  optionButton: {
    width: 80,
    height: 80,
    backgroundColor: '#f5f5f5',
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  optionText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#000',
  },
});

export default MathChallenge; 