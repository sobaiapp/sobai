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

const MemoryGame = ({ navigation }) => {
  const [cards, setCards] = useState([]);
  const [flippedCards, setFlippedCards] = useState([]);
  const [matchedPairs, setMatchedPairs] = useState([]);
  const [score, setScore] = useState(0);
  const [level, setLevel] = useState(1);

  const milestones = [
    { id: 1, text: '24 Hours', value: '1 day' },
    { id: 2, text: '1 Week', value: '7 days' },
    { id: 3, text: '30 Days', value: '1 month' },
    { id: 4, text: '90 Days', value: '3 months' },
    { id: 5, text: '6 Months', value: '180 days' },
    { id: 6, text: '1 Year', value: '365 days' }
  ];

  useEffect(() => {
    initializeGame();
  }, [level]);

  const initializeGame = () => {
    const gameCards = [...milestones, ...milestones]
      .map((card, index) => ({ ...card, id: index }))
      .sort(() => Math.random() - 0.5);
    setCards(gameCards);
    setFlippedCards([]);
    setMatchedPairs([]);
  };

  const handleCardPress = (index) => {
    if (flippedCards.length === 2 || flippedCards.includes(index) || matchedPairs.includes(index)) {
      return;
    }

    const newFlippedCards = [...flippedCards, index];
    setFlippedCards(newFlippedCards);

    if (newFlippedCards.length === 2) {
      const [firstIndex, secondIndex] = newFlippedCards;
      if (cards[firstIndex].text === cards[secondIndex].text) {
        setMatchedPairs([...matchedPairs, firstIndex, secondIndex]);
        setScore(score + 10);
        setFlippedCards([]);

        if (matchedPairs.length + 2 === cards.length) {
          Alert.alert(
            'Congratulations!',
            'You matched all the milestones!',
            [{ text: 'Next Level', onPress: () => setLevel(level + 1) }]
          );
        }
      } else {
        setTimeout(() => {
          setFlippedCards([]);
        }, 1000);
      }
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
          <Text style={styles.headerTitle}>Milestone Memory</Text>
          <View style={styles.scoreContainer}>
            <Text style={styles.scoreText}>Score: {score}</Text>
            <Text style={styles.levelText}>Level: {level}</Text>
          </View>
        </View>
      </LinearGradient>

      <View style={styles.gameContainer}>
        <View style={styles.cardsContainer}>
          {cards.map((card, index) => (
            <TouchableOpacity
              key={index}
              style={[
                styles.card,
                flippedCards.includes(index) && styles.flippedCard,
                matchedPairs.includes(index) && styles.matchedCard
              ]}
              onPress={() => handleCardPress(index)}
              disabled={matchedPairs.includes(index)}
            >
              {flippedCards.includes(index) || matchedPairs.includes(index) ? (
                <Text style={styles.cardText}>{card.text}</Text>
              ) : (
                <Text style={styles.cardText}>?</Text>
              )}
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
  cardsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 10,
  },
  card: {
    width: 80,
    height: 100,
    backgroundColor: '#f5f5f5',
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    margin: 5,
  },
  flippedCard: {
    backgroundColor: '#fff',
    borderWidth: 2,
    borderColor: '#000',
  },
  matchedCard: {
    backgroundColor: '#000',
  },
  cardText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#000',
  },
});

export default MemoryGame; 