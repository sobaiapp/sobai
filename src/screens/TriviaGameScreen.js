import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';

const questions = [
  {
    question: "What is the first step in Alcoholics Anonymous (AA)?",
    options: [
      "Admit powerlessness over alcohol",
      "Make amends to those harmed",
      "Help another person with addiction",
      "Meditate daily"
    ],
    correctAnswer: "Admit powerlessness over alcohol",
  },
  {
    question: "Which of the following is a common withdrawal symptom from alcohol?",
    options: [
      "Increased energy",
      "Hallucinations",
      "Improved sleep",
      "Better memory"
    ],
    correctAnswer: "Hallucinations",
  },
  {
    question: "What is a common strategy to maintain sobriety?",
    options: [
      "Avoiding support groups",
      "Surrounding yourself with triggers",
      "Practicing mindfulness and self-care",
      "Keeping struggles to yourself"
    ],
    correctAnswer: "Practicing mindfulness and self-care",
  },
  {
    question: "Which vitamin is often depleted in people with alcohol addiction?",
    options: [
      "Vitamin A",
      "Vitamin B1 (Thiamine)",
      "Vitamin D",
      "Vitamin K"
    ],
    correctAnswer: "Vitamin B1 (Thiamine)",
  },
];

const TriviaGameScreen = ({ navigation }) => {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [score, setScore] = useState(0);

  const handleAnswerPress = (selectedAnswer) => {
    const correctAnswer = questions[currentQuestionIndex].correctAnswer;

    if (selectedAnswer === correctAnswer) {
      setScore(score + 1);
    }

    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    } else {
      Alert.alert(
        "Game Over!",
        `Your score: ${score + (selectedAnswer === correctAnswer ? 1 : 0)}/${questions.length}`,
        [{ text: "OK", onPress: () => navigation.goBack() }]
      );
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Trivia Challenge</Text>
      <Text style={styles.question}>{questions[currentQuestionIndex].question}</Text>

      {questions[currentQuestionIndex].options.map((option, index) => (
        <TouchableOpacity
          key={index}
          style={styles.optionButton}
          onPress={() => handleAnswerPress(option)}
        >
          <Text style={styles.optionText}>{option}</Text>
        </TouchableOpacity>
      ))}

      <Text style={styles.score}>Score: {score}</Text>
    </View>
  );
};

export default TriviaGameScreen;

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
  question: {
    fontSize: 20,
    fontWeight: '500',
    textAlign: 'center',
    marginBottom: 20,
    color: '#000',
  },
  optionButton: {
    backgroundColor: '#E6E6E6',
    padding: 15,
    borderRadius: 10,
    marginVertical: 10,
    width: '90%',
    alignItems: 'center',
  },
  optionText: {
    fontSize: 18,
    fontWeight: '500',
    color: '#000',
  },
  score: {
    marginTop: 20,
    fontSize: 18,
    fontWeight: 'bold',
    color: '#555',
  },
});
