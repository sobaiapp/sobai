import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';

const questions = [
  {
    question: "How confident do you feel about maintaining your sobriety today?",
    options: ["Very Confident", "Somewhat Confident", "Neutral", "Not Confident"],
  },
  {
    question: "Have you encountered any triggers recently?",
    options: ["Yes, but I managed them well", "Yes, and I struggled", "No, not really", "I'm not sure"],
  },
  {
    question: "What has been the most helpful in staying sober?",
    options: ["Support groups", "Self-care routines", "Friends & family", "Personal determination"],
  },
  {
    question: "How do you handle stress without turning to substances?",
    options: ["Exercise or meditation", "Talking to someone", "Finding distractions", "I struggle with this"],
  },
];

const QuizGameScreen = ({ navigation }) => {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [responses, setResponses] = useState([]);

  const handleAnswerPress = (selectedAnswer) => {
    setResponses([...responses, selectedAnswer]);

    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    } else {
      Alert.alert(
        "Quiz Completed!",
        "Thanks for reflecting on your sobriety journey!",
        [{ text: "OK", onPress: () => navigation.goBack() }]
      );
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Sobriety Quiz</Text>
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
    </View>
  );
};

export default QuizGameScreen;

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
});
