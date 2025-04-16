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

const PatternGame = ({ navigation }) => {
  const [pattern, setPattern] = useState([]);
  const [userInput, setUserInput] = useState([]);
  const [score, setScore] = useState(0);
  const [level, setLevel] = useState(1);
  const [showPattern, setShowPattern] = useState(true);

  const recoveryPatterns = [
    ['meeting', 'sponsor', 'step'],
    ['trigger', 'craving', 'coping'],
    ['sober', 'support', 'strength'],
    ['recovery', 'relapse', 'rebuild'],
    ['hope', 'heal', 'help']
  ];

  useEffect(() => {
    generatePattern();
  }, [level]);

  const generatePattern = () => {
    const randomPattern = recoveryPatterns[Math.floor(Math.random() * recoveryPatterns.length)];
    setPattern(randomPattern);
    setUserInput([]);
    setShowPattern(true);

    setTimeout(() => {
      setShowPattern(false);
    }, 2000);
  };

  const handleWordPress = (word) => {
    const newInput = [...userInput, word];
    setUserInput(newInput);

    if (newInput.length === pattern.length) {
      checkPattern(newInput);
    }
  };

  const checkPattern = (input) => {
    const isCorrect = input.every((word, index) => word === pattern[index]);
    
    if (isCorrect) {
      setScore(score + 10);
      Alert.alert(
        'Correct!',
        'Great job identifying the recovery pattern!',
        [{ text: 'Next Level', onPress: () => setLevel(level + 1) }]
      );
    } else {
      Alert.alert(
        'Incorrect',
        'Try to identify the pattern in recovery terms',
        [{ text: 'Try Again', onPress: generatePattern }]
      );
    }
  };

  const renderWordButton = (word) => (
    <TouchableOpacity
      key={word}
      style={styles.wordButton}
      onPress={() => handleWordPress(word)}
    >
      <Text style={styles.wordText}>{word}</Text>
    </TouchableOpacity>
  );

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
          <Text style={styles.headerTitle}>Pattern Recognition</Text>
          <View style={styles.scoreContainer}>
            <Text style={styles.scoreText}>Score: {score}</Text>
            <Text style={styles.levelText}>Level: {level}</Text>
          </View>
        </View>
      </LinearGradient>

      <View style={styles.gameContainer}>
        {showPattern ? (
          <View style={styles.patternContainer}>
            {pattern.map((word, index) => (
              <Text key={index} style={styles.patternWord}>
                {word}
              </Text>
            ))}
          </View>
        ) : (
          <>
            <Text style={styles.instruction}>
              Recreate the recovery pattern you just saw
            </Text>
            <View style={styles.wordsContainer}>
              {recoveryPatterns.flat().map(renderWordButton)}
            </View>
            <View style={styles.inputContainer}>
              {userInput.map((word, index) => (
                <Text key={index} style={styles.inputWord}>
                  {word}
                </Text>
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
    justifyContent: 'center',
  },
  patternContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 30,
  },
  patternWord: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#000',
    marginHorizontal: 10,
  },
  instruction: {
    fontSize: 18,
    color: '#666',
    textAlign: 'center',
    marginBottom: 30,
  },
  wordsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    marginBottom: 30,
  },
  wordButton: {
    backgroundColor: '#f5f5f5',
    padding: 15,
    borderRadius: 10,
    margin: 5,
  },
  wordText: {
    fontSize: 16,
    color: '#000',
  },
  inputContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 20,
  },
  inputWord: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#000',
    marginHorizontal: 10,
  },
});

export default PatternGame; 