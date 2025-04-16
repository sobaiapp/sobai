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

const ReactionGame = ({ navigation }) => {
  const [scenario, setScenario] = useState(null);
  const [score, setScore] = useState(0);
  const [level, setLevel] = useState(1);
  const [timeLeft, setTimeLeft] = useState(10);
  const [gameStarted, setGameStarted] = useState(false);

  const scenarios = [
    {
      situation: "You're at a party and someone offers you a drink",
      options: [
        "Accept the drink",
        "Politely decline and leave",
        "Make an excuse and stay",
        "Call your sponsor"
      ],
      correctAnswer: 1
    },
    {
      situation: "You're feeling stressed and craving",
      options: [
        "Go to a bar",
        "Call a friend",
        "Isolate yourself",
        "Ignore the feeling"
      ],
      correctAnswer: 1
    },
    {
      situation: "You're invited to a gathering with old drinking buddies",
      options: [
        "Go and try to control yourself",
        "Bring your own non-alcoholic drinks",
        "Decline and suggest a sober activity",
        "Go but leave early"
      ],
      correctAnswer: 2
    },
    {
      situation: "You're feeling lonely and depressed",
      options: [
        "Drink to forget",
        "Go to a meeting",
        "Stay in bed",
        "Watch TV all day"
      ],
      correctAnswer: 1
    },
    {
      situation: "You're offered prescription painkillers after surgery",
      options: [
        "Take them as prescribed",
        "Refuse all medication",
        "Take extra for comfort",
        "Ask for non-addictive alternatives"
      ],
      correctAnswer: 3
    }
  ];

  useEffect(() => {
    if (gameStarted && timeLeft > 0) {
      const timer = setInterval(() => {
        setTimeLeft(prev => prev - 1);
      }, 1000);
      return () => clearInterval(timer);
    } else if (timeLeft === 0) {
      handleTimeUp();
    }
  }, [gameStarted, timeLeft]);

  const startGame = () => {
    setGameStarted(true);
    generateScenario();
    setTimeLeft(10);
  };

  const generateScenario = () => {
    const randomScenario = scenarios[Math.floor(Math.random() * scenarios.length)];
    setScenario(randomScenario);
  };

  const handleAnswer = (selectedAnswer) => {
    if (selectedAnswer === scenario.correctAnswer) {
      setScore(score + 20);
      Alert.alert(
        'Correct!',
        'Great decision!',
        [{ text: 'Next Scenario', onPress: generateScenario }]
      );
    } else {
      Alert.alert(
        'Incorrect',
        'Remember to make healthy choices for your recovery',
        [{ text: 'Try Again', onPress: generateScenario }]
      );
    }
    setTimeLeft(10);
  };

  const handleTimeUp = () => {
    Alert.alert(
      'Time\'s Up!',
      `Your final score is ${score}.`,
      [
        { text: 'Play Again', onPress: () => {
          setScore(0);
          setLevel(level + 1);
          setTimeLeft(10);
          setGameStarted(false);
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
          <Text style={styles.headerTitle}>Quick Response</Text>
          <View style={styles.scoreContainer}>
            <Text style={styles.scoreText}>Score: {score}</Text>
            <Text style={styles.levelText}>Level: {level}</Text>
          </View>
        </View>
      </LinearGradient>

      <View style={styles.gameContainer}>
        {!gameStarted ? (
          <TouchableOpacity
            style={styles.startButton}
            onPress={startGame}
          >
            <Text style={styles.startButtonText}>Start Game</Text>
          </TouchableOpacity>
        ) : (
          <>
            <Text style={styles.timerText}>Time: {timeLeft}s</Text>
            {scenario && (
              <>
                <Text style={styles.situationText}>{scenario.situation}</Text>
                <View style={styles.optionsContainer}>
                  {scenario.options.map((option, index) => (
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
    justifyContent: 'center',
  },
  startButton: {
    backgroundColor: '#000',
    paddingHorizontal: 30,
    paddingVertical: 15,
    borderRadius: 10,
  },
  startButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  timerText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 20,
  },
  situationText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#000',
    textAlign: 'center',
    marginBottom: 30,
  },
  optionsContainer: {
    width: '100%',
  },
  optionButton: {
    backgroundColor: '#f5f5f5',
    padding: 20,
    borderRadius: 10,
    marginBottom: 15,
  },
  optionText: {
    fontSize: 16,
    color: '#000',
    textAlign: 'center',
  },
});

export default ReactionGame; 