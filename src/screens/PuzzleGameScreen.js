import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from 'react-native';

const words = [
  { scrambled: "TYROBSIE", answer: "SOBRIETY" },
  { scrambled: "NEDPEECNEDNI", answer: "INDEPENDENCE" },
  { scrambled: "YHLETAH", answer: "HEALTHY" },
  { scrambled: "MUOYINMTC", answer: "COMMUNITY" },
];

const PuzzleGameScreen = ({ navigation }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [userInput, setUserInput] = useState("");
  const [score, setScore] = useState(0);

  const checkAnswer = () => {
    if (userInput.toUpperCase() === words[currentIndex].answer) {
      setScore(score + 1);
      Alert.alert("Correct!", "Great job! Let's try the next one.");
    } else {
      Alert.alert("Oops!", "That's not correct. Try again!");
      return;
    }

    if (currentIndex < words.length - 1) {
      setCurrentIndex(currentIndex + 1);
      setUserInput("");
    } else {
      Alert.alert(
        "Game Over!",
        `Your final score: ${score + 1}/${words.length}`,
        [{ text: "OK", onPress: () => navigation.goBack() }]
      );
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Puzzle Game</Text>
      <Text style={styles.instruction}>Unscramble the word:</Text>
      <Text style={styles.scrambledWord}>{words[currentIndex].scrambled}</Text>

      <TextInput
        style={styles.input}
        value={userInput}
        onChangeText={setUserInput}
        placeholder="Enter answer"
        autoCapitalize="characters"
      />

      <TouchableOpacity style={styles.button} onPress={checkAnswer}>
        <Text style={styles.buttonText}>Submit</Text>
      </TouchableOpacity>

      <Text style={styles.score}>Score: {score}</Text>
    </View>
  );
};

export default PuzzleGameScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F9F9F9',
    padding: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#333',
  },
  instruction: {
    fontSize: 18,
    marginBottom: 10,
    color: '#555',
  },
  scrambledWord: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#000',
  },
  input: {
    width: '80%',
    height: 50,
    borderColor: '#999',
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 10,
    fontSize: 18,
    backgroundColor: '#FFF',
    marginBottom: 20,
    textAlign: 'center',
  },
  button: {
    backgroundColor: '#4CAF50',
    padding: 15,
    borderRadius: 10,
    width: '80%',
    alignItems: 'center',
  },
  buttonText: {
    fontSize: 18,
    color: '#FFF',
    fontWeight: 'bold',
  },
  score: {
    marginTop: 20,
    fontSize: 18,
    fontWeight: 'bold',
    color: '#555',
  },
});
