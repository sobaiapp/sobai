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

const WordChain = ({ navigation }) => {
  const [currentWord, setCurrentWord] = useState('');
  const [chain, setChain] = useState([]);
  const [score, setScore] = useState(0);
  const [level, setLevel] = useState(1);
  const [timeLeft, setTimeLeft] = useState(30);

  const affirmationWords = [
    'strong',
    'brave',
    'worthy',
    'loved',
    'capable',
    'resilient',
    'peaceful',
    'hopeful',
    'grateful',
    'present'
  ];

  useEffect(() => {
    generateWord();
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

  const generateWord = () => {
    const randomWord = affirmationWords[Math.floor(Math.random() * affirmationWords.length)];
    setCurrentWord(randomWord);
  };

  const handleWordPress = (word) => {
    if (word === currentWord) {
      setChain([...chain, word]);
      setScore(score + 10);
      generateWord();
    } else {
      Alert.alert(
        'Incorrect',
        'Try to build a chain of positive affirmations',
        [{ text: 'Try Again', onPress: generateWord }]
      );
    }
  };

  const handleTimeUp = () => {
    Alert.alert(
      'Time\'s Up!',
      `Your affirmation chain: ${chain.join(' → ')}\nScore: ${score}`,
      [
        { text: 'Play Again', onPress: () => {
          setScore(0);
          setLevel(level + 1);
          setTimeLeft(30);
          setChain([]);
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
          <Text style={styles.headerTitle}>Affirmation Chain</Text>
          <View style={styles.scoreContainer}>
            <Text style={styles.scoreText}>Score: {score}</Text>
            <Text style={styles.levelText}>Level: {level}</Text>
          </View>
        </View>
      </LinearGradient>

      <View style={styles.gameContainer}>
        <Text style={styles.timerText}>Time: {timeLeft}s</Text>
        <Text style={styles.currentWord}>{currentWord}</Text>
        <Text style={styles.chainText}>
          {chain.length > 0 ? 'Your chain: ' + chain.join(' → ') : 'Start building your chain!'}
        </Text>
        <View style={styles.wordsContainer}>
          {affirmationWords.map((word, index) => (
            <TouchableOpacity
              key={index}
              style={styles.wordButton}
              onPress={() => handleWordPress(word)}
            >
              <Text style={styles.wordText}>{word}</Text>
            </TouchableOpacity>
          ))}
        </View>
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
    marginBottom: 20,
  },
  currentWord: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 20,
  },
  chainText: {
    fontSize: 18,
    color: '#666',
    textAlign: 'center',
    marginBottom: 30,
  },
  wordsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 10,
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
});

export default WordChain; 