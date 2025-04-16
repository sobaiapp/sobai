import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, FlatList, Alert } from 'react-native';

const icons = ['🍏', '💪', '🌞', '🙏', '🧘', '💖']; // Sobriety-related icons
const shuffledCards = [...icons, ...icons].sort(() => Math.random() - 0.5);

const MemoryGameScreen = ({ navigation }) => {
  const [cards, setCards] = useState(shuffledCards.map((icon, index) => ({ id: index, icon, flipped: false, matched: false })));
  const [selectedCards, setSelectedCards] = useState([]);

  useEffect(() => {
    if (selectedCards.length === 2) {
      const [first, second] = selectedCards;
      if (cards[first].icon === cards[second].icon) {
        // Match found
        setCards(prevCards =>
          prevCards.map((card, index) =>
            index === first || index === second ? { ...card, matched: true } : card
          )
        );
      } else {
        // No match, flip back after a delay
        setTimeout(() => {
          setCards(prevCards =>
            prevCards.map((card, index) =>
              index === first || index === second ? { ...card, flipped: false } : card
            )
          );
        }, 800);
      }
      setSelectedCards([]);
    }
  }, [selectedCards, cards]);

  useEffect(() => {
    if (cards.every(card => card.matched)) {
      Alert.alert('Congratulations!', 'You completed the Memory Game!', [{ text: 'OK', onPress: () => navigation.goBack() }]);
    }
  }, [cards, navigation]);

  const handleCardPress = (index) => {
    if (cards[index].flipped || cards[index].matched) return;

    const updatedCards = [...cards];
    updatedCards[index].flipped = true;
    setCards(updatedCards);
    setSelectedCards([...selectedCards, index]);
  };

  const renderCard = ({ item, index }) => (
    <TouchableOpacity
      style={[styles.card, item.flipped || item.matched ? styles.cardFlipped : styles.cardHidden]}
      onPress={() => handleCardPress(index)}
    >
      <Text style={styles.cardText}>{item.flipped || item.matched ? item.icon : '?'}</Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Memory Game</Text>
      <FlatList
        data={cards}
        renderItem={renderCard}
        keyExtractor={(item) => item.id.toString()}
        numColumns={3}
      />
    </View>
  );
};

export default MemoryGameScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F9F9F9',
    marginTop: 20,
    paddingTop: 150,
    padding: 20
    
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#333',
  },
  card: {
    width: 80,
    height: 80,
    margin: 10,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 10,
    backgroundColor: '#E6E6E6',
  },
  cardFlipped: {
    backgroundColor: '#FFF',
  },
  cardHidden: {
    backgroundColor: '#CCC',
  },
  cardText: {
    fontSize: 30,
  },
});
