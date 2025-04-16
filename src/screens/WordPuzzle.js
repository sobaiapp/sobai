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

const WordPuzzle = ({ navigation }) => {
  const [words, setWords] = useState([]);
  const [selectedWords, setSelectedWords] = useState([]);
  const [score, setScore] = useState(0);
  const [level, setLevel] = useState(1);

  const triggerWords = [
    'stress',
    'anxiety',
    'loneliness',
    'boredom',
    'anger',
    'sadness',
    'celebration',
    'social',
    'pressure',
    'temptation'
  ];

  useEffect(() => {
    generatePuzzle();
  }, [level]);

  const generatePuzzle = () => {
    const shuffledWords = [...triggerWords]
      .sort(() => Math.random() - 0.5)
      .slice(0, 5);
    setWords(shuffledWords);
    setSelectedWords([]);
  };

  const handleWordPress = (word) => {
    if (selectedWords.includes(word)) {
      setSelectedWords(selectedWords.filter(w => w !== word));
    } else {
      setSelectedWords([...selectedWords, word]);
    }
  };

  const checkAnswer = () => {
    if (selectedWords.length === words.length) {
      setScore(score + 10);
      Alert.alert(
        'Correct!',
        'You identified all the trigger words!',
        [{ text: 'Next Level', onPress: () => setLevel(level + 1) }]
      );
    } else {
      Alert.alert(
        'Try Again',
        'Make sure you select all the trigger words',
        [{ text: 'OK', onPress: generatePuzzle }]
      );
    }
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
          <Text style={styles.headerTitle}>Trigger Words</Text>
          <View style={styles.scoreContainer}>
            <Text style={styles.scoreText}>Score: {score}</Text>
            <Text style={styles.levelText}>Level: {level}</Text>
          </View>
        </View>
      </LinearGradient>

      <View style={styles.gameContainer}>
        <Text style={styles.instruction}>
          Select all the trigger words you see
        </Text>
        <View style={styles.wordsContainer}>
          {words.map((word, index) => (
            <TouchableOpacity
              key={index}
              style={[
                styles.wordButton,
                selectedWords.includes(word) && styles.selectedWord
              ]}
              onPress={() => handleWordPress(word)}
            >
              <Text style={styles.wordText}>{word}</Text>
            </TouchableOpacity>
          ))}
        </View>
        <TouchableOpacity
          style={styles.checkButton}
          onPress={checkAnswer}
        >
          <Text style={styles.checkButtonText}>Check Answer</Text>
        </TouchableOpacity>
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
  selectedWord: {
    backgroundColor: '#000',
  },
  wordText: {
    fontSize: 16,
    color: '#000',
  },
  checkButton: {
    backgroundColor: '#000',
    paddingHorizontal: 30,
    paddingVertical: 15,
    borderRadius: 10,
  },
  checkButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default WordPuzzle; 