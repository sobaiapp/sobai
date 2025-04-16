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

const TriggerWords = ({ navigation }) => {
  const [currentLevel, setCurrentLevel] = useState(1);
  const [score, setScore] = useState(0);
  const [showScore, setShowScore] = useState(false);
  const [fadeAnim] = useState(new Animated.Value(0));

  const triggerWords = [
    {
      word: "Party",
      isTrigger: true,
      explanation: "Social gatherings can be challenging in early recovery"
    },
    {
      word: "Stress",
      isTrigger: true,
      explanation: "High stress situations can increase cravings"
    },
    {
      word: "Celebration",
      isTrigger: true,
      explanation: "Special occasions often involve alcohol"
    },
    {
      word: "Boredom",
      isTrigger: true,
      explanation: "Idle time can lead to cravings"
    },
    {
      word: "Peace",
      isTrigger: false,
      explanation: "A positive state of mind"
    },
    {
      word: "Exercise",
      isTrigger: false,
      explanation: "A healthy coping mechanism"
    },
    {
      word: "Meditation",
      isTrigger: false,
      explanation: "A helpful recovery tool"
    },
    {
      word: "Support",
      isTrigger: false,
      explanation: "Essential for recovery"
    }
  ];

  const [currentWord, setCurrentWord] = useState(null);
  const [shuffledWords, setShuffledWords] = useState([]);

  useEffect(() => {
    shuffleWords();
  }, []);

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true
    }).start();
  }, [currentWord]);

  const shuffleWords = () => {
    const shuffled = [...triggerWords].sort(() => Math.random() - 0.5);
    setShuffledWords(shuffled);
    setCurrentWord(shuffled[0]);
  };

  const handleAnswer = (isTrigger) => {
    if (currentWord.isTrigger === isTrigger) {
      setScore(score + 1);
      Alert.alert(
        "Correct!",
        currentWord.explanation,
        [{ text: "Continue", onPress: nextWord }]
      );
    } else {
      Alert.alert(
        "Incorrect",
        currentWord.explanation,
        [{ text: "Continue", onPress: nextWord }]
      );
    }
  };

  const nextWord = () => {
    const currentIndex = shuffledWords.indexOf(currentWord);
    if (currentIndex < shuffledWords.length - 1) {
      setCurrentWord(shuffledWords[currentIndex + 1]);
      fadeAnim.setValue(0);
    } else {
      setShowScore(true);
    }
  };

  const resetGame = () => {
    setScore(0);
    setShowScore(false);
    shuffleWords();
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
            <Text style={styles.headerTitle}>Game Complete!</Text>
          </View>
        </LinearGradient>

        <View style={styles.scoreContainer}>
          <Text style={styles.scoreTitle}>Your Score</Text>
          <Text style={styles.score}>{score}/{triggerWords.length}</Text>
          <Text style={styles.scoreSubtitle}>
            {score === triggerWords.length ? "Perfect! 🎉" : 
             score >= triggerWords.length/2 ? "Good job! 👍" : 
             "Keep practicing! 💪"}
          </Text>
          
          <TouchableOpacity 
            style={styles.restartButton}
            onPress={resetGame}
          >
            <Text style={styles.restartButtonText}>Play Again</Text>
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
          <Text style={styles.headerTitle}>Trigger Words</Text>
          <Text style={styles.progressText}>
            Word {shuffledWords.indexOf(currentWord) + 1}/{triggerWords.length}
          </Text>
        </View>
      </LinearGradient>

      <Animated.View 
        style={[
          styles.gameContainer,
          { opacity: fadeAnim }
        ]}
      >
        <View style={styles.wordContainer}>
          <Text style={styles.wordText}>{currentWord?.word}</Text>
        </View>

        <View style={styles.buttonsContainer}>
          <TouchableOpacity
            style={[styles.button, styles.triggerButton]}
            onPress={() => handleAnswer(true)}
          >
            <Text style={styles.buttonText}>Trigger</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.button, styles.safeButton]}
            onPress={() => handleAnswer(false)}
          >
            <Text style={styles.buttonText}>Safe</Text>
          </TouchableOpacity>
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
  wordContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  wordText: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#000',
    textAlign: 'center',
  },
  buttonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 40,
  },
  button: {
    paddingHorizontal: 40,
    paddingVertical: 20,
    borderRadius: 30,
    minWidth: 140,
    alignItems: 'center',
  },
  triggerButton: {
    backgroundColor: '#FF6B6B',
  },
  safeButton: {
    backgroundColor: '#4ECDC4',
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
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

export default TriggerWords; 