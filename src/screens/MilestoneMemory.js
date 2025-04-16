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

const MilestoneMemory = ({ navigation }) => {
  const [cards, setCards] = useState([]);
  const [flippedCards, setFlippedCards] = useState([]);
  const [matchedPairs, setMatchedPairs] = useState(0);
  const [moves, setMoves] = useState(0);
  const [gameComplete, setGameComplete] = useState(false);

  const milestones = [
    { id: 1, title: "24 Hours", description: "First day of sobriety" },
    { id: 2, title: "1 Week", description: "First week milestone" },
    { id: 3, title: "30 Days", description: "One month of recovery" },
    { id: 4, title: "90 Days", description: "Three months sober" },
    { id: 5, title: "6 Months", description: "Half year achievement" },
    { id: 6, title: "1 Year", description: "First year celebration" }
  ];

  useEffect(() => {
    initializeGame();
  }, []);

  const initializeGame = () => {
    const gameCards = [...milestones, ...milestones]
      .map((card, index) => ({
        ...card,
        id: `${card.id}-${index}`,
        isFlipped: false,
        isMatched: false
      }))
      .sort(() => Math.random() - 0.5);

    setCards(gameCards);
    setFlippedCards([]);
    setMatchedPairs(0);
    setMoves(0);
    setGameComplete(false);
  };

  const handleCardPress = (cardId) => {
    if (flippedCards.length >= 2 || cards.find(card => card.id === cardId).isMatched) {
      return;
    }

    const updatedCards = cards.map(card => {
      if (card.id === cardId && !card.isFlipped) {
        return { ...card, isFlipped: true };
      }
      return card;
    });

    setCards(updatedCards);
    setFlippedCards([...flippedCards, cardId]);
    setMoves(moves + 1);

    if (flippedCards.length === 1) {
      checkForMatch(cardId);
    }
  };

  const checkForMatch = (secondCardId) => {
    const firstCard = cards.find(card => card.id === flippedCards[0]);
    const secondCard = cards.find(card => card.id === secondCardId);

    if (firstCard.title === secondCard.title) {
      const updatedCards = cards.map(card => {
        if (card.id === firstCard.id || card.id === secondCard.id) {
          return { ...card, isMatched: true };
        }
        return card;
      });

      setCards(updatedCards);
      setMatchedPairs(matchedPairs + 1);
      setFlippedCards([]);

      if (matchedPairs + 1 === milestones.length) {
        setGameComplete(true);
      }
    } else {
      setTimeout(() => {
        const updatedCards = cards.map(card => {
          if (card.id === firstCard.id || card.id === secondCard.id) {
            return { ...card, isFlipped: false };
          }
          return card;
        });

        setCards(updatedCards);
        setFlippedCards([]);
      }, 1000);
    }
  };

  if (gameComplete) {
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
          <Text style={styles.scoreTitle}>Congratulations!</Text>
          <Text style={styles.score}>You matched all pairs in {moves} moves</Text>
          <Text style={styles.scoreSubtitle}>
            Each milestone represents an important achievement in recovery
          </Text>
          
          <TouchableOpacity 
            style={styles.restartButton}
            onPress={initializeGame}
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
          <Text style={styles.headerTitle}>Milestone Memory</Text>
          <Text style={styles.progressText}>
            Pairs: {matchedPairs}/{milestones.length}
          </Text>
        </View>
      </LinearGradient>

      <View style={styles.gameContainer}>
        <View style={styles.grid}>
          {cards.map((card) => (
            <TouchableOpacity
              key={card.id}
              style={[
                styles.card,
                card.isFlipped && styles.cardFlipped,
                card.isMatched && styles.cardMatched
              ]}
              onPress={() => handleCardPress(card.id)}
              disabled={card.isMatched}
            >
              {card.isFlipped ? (
                <View style={styles.cardContent}>
                  <Text style={styles.cardTitle}>{card.title}</Text>
                  <Text style={styles.cardDescription}>{card.description}</Text>
                </View>
              ) : (
                <Ionicons name="help-circle" size={32} color="#000" />
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
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  card: {
    width: '48%',
    aspectRatio: 1,
    backgroundColor: '#f5f5f5',
    borderRadius: 16,
    marginBottom: 16,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  cardFlipped: {
    backgroundColor: '#fff',
  },
  cardMatched: {
    backgroundColor: '#4ECDC4',
  },
  cardContent: {
    padding: 12,
    alignItems: 'center',
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 4,
  },
  cardDescription: {
    fontSize: 14,
    color: '#666',
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

export default MilestoneMemory; 