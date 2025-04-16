import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, FlatList, Animated, Easing } from 'react-native';
import * as Haptic from 'expo-haptics';
import Ionicons from 'react-native-vector-icons/Ionicons';

// Map of icons for each answer option
const answerIcons = {
  // Question 1
  'Alcohol': 'wine',
  'Drugs': 'medical',
  'Pornography': 'eye-off',
  'Cigarettes': 'smoke',
  
  // Question 2
  'Less than 6 months': 'calendar-sharp',
  '6 months - 1 year': 'calendar',
  '1 - 3 years': 'time',
  '3+ years': 'hourglass',
  
  // Question 3
  'Better health': 'heart',
  'Save money': 'cash',
  'Improve relationships': 'people',
  'More self-control': 'barbell',
  
  // Question 4
  'Yes': 'checkmark-circle',
  'No': 'close-circle',
  
  // Question 5
  'Stress': 'flash',
  'Boredom': 'happy',
  'Social situations': 'people',
  'Loneliness': 'person',
  
  // Question 6
  'Yes': 'notifications',
  'No': 'notifications-off',
  
  // Question 7
  'Yes': 'chatbubbles',
  'No': 'chatbox',
  
  // Question 8
  'Days clean counter': 'calendar-number',
  'Weekly check-ins': 'calendar-week',
  'Personalized milestones': 'trophy',
  
  // Question 9
  '30 days': 'flag',
  '60 days': 'flag',
  '90 days': 'flag',
  'Custom': 'create',
  
  // Question 10
  'Yes': 'people-circle',
  'No': 'person-circle',
};

const questions = [
  {
    id: '1',
    question: 'What are you looking to quit?',
    answers: ['Alcohol', 'Drugs', 'Pornography', 'Cigarettes'],
    multiSelect: true,
  },
  {
    id: '2',
    question: 'How long have you been struggling with this habit?',
    answers: ['Less than 6 months', '6 months - 1 year', '1 - 3 years', '3+ years'],
  },
  {
    id: '3',
    question: 'What is your main reason for quitting?',
    answers: ['Better health', 'Save money', 'Improve relationships', 'More self-control'],
  },
  {
    id: '4',
    question: 'Have you tried quitting before?',
    answers: ['Yes', 'No'],
  },
  {
    id: '5',
    question: 'What triggers your habit the most?',
    answers: ['Stress', 'Boredom', 'Social situations', 'Loneliness'],
    multiSelect: true,
  },
  {
    id: '6',
    question: 'Would you like daily motivational messages?',
    answers: ['Yes', 'No'],
  },
  {
    id: '7',
    question: 'Do you want an AI coach to help you stay on track?',
    answers: ['Yes', 'No'],
  },
  {
    id: '8',
    question: 'How do you want to track your progress?',
    answers: ['Days clean counter', 'Weekly check-ins', 'Personalized milestones'],
  },
  {
    id: '9',
    question: 'Would you like to set a custom goal for staying sober?',
    answers: ['30 days', '60 days', '90 days', 'Custom'],
  },
  {
    id: '10',
    question: 'Are you interested in a supportive community or accountability partner?',
    answers: ['Yes', 'No'],
  },
];
const OnboardingScreen = ({ navigation }) => {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingTextIndex, setLoadingTextIndex] = useState(0);
  const [spinAnim] = useState(new Animated.Value(0));
  const [scaleAnim] = useState(new Animated.Value(1));
  
  // New animation values for questions and answers
  const [questionFadeAnim] = useState(new Animated.Value(0));
  const [answersFadeAnim] = useState(new Animated.Value(0));
  const [answerAnims] = useState(() => 
    Array(4).fill(0).map(() => new Animated.Value(0))
  );

  const currentQuestion = questions[currentQuestionIndex];

  const loadingMessages = [
    'Calculating Sobriety...',
    'Getting Score...',
    'Finalizing...',
  ];

  useEffect(() => {
    const intervalId = setInterval(() => {
      setLoadingTextIndex((prevIndex) => (prevIndex + 1) % loadingMessages.length);
    }, 3000);

    return () => clearInterval(intervalId);
  }, []);

  useEffect(() => {
    if (isLoading) {
      Animated.loop(
        Animated.timing(spinAnim, {
          toValue: 1,
          duration: 1500,
          easing: Easing.linear,
          useNativeDriver: true,
        })
      ).start();

      Animated.loop(
        Animated.sequence([
          Animated.timing(scaleAnim, {
            toValue: 1.1,
            duration: 800,
            useNativeDriver: true,
          }),
          Animated.timing(scaleAnim, {
            toValue: 1,
            duration: 800,
            useNativeDriver: true,
          }),
        ])
      ).start();
    } else {
      spinAnim.setValue(0);
      scaleAnim.setValue(1);
    }
  }, [isLoading]);

  // New useEffect for question and answer animations
  useEffect(() => {
    // Reset animations when question changes
    // Remove question fade animation reset
    answersFadeAnim.setValue(0);
    answerAnims.forEach(anim => anim.setValue(0));

    // Remove question animation and directly animate answers
    answerAnims.forEach((anim, index) => {
      Animated.timing(anim, {
        toValue: 1,
        duration: 300,
        delay: index * 100,
        easing: Easing.ease,
        useNativeDriver: true,
      }).start();
    });
  }, [currentQuestionIndex]);

  const handleNext = async () => {
    if (selectedAnswers.length === 0) return;
    await Haptic.impactAsync(Haptic.ImpactFeedbackStyle.Medium);
    if (currentQuestionIndex < questions.length - 1) {
      setSelectedAnswers([]);
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    } else {
      setIsLoading(true);
      setTimeout(() => {
        setIsLoading(false);
        navigation.navigate('Success');
      }, 2000);
    }
  };

  const handleBack = async () => {
    await Haptic.impactAsync(Haptic.ImpactFeedbackStyle.Light);
    if (currentQuestionIndex > 0) {
      setSelectedAnswers([]);
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    } else {
      navigation.goBack();
    }
  };

  const handleAnswerSelect = async (answer) => {
    await Haptic.selectionAsync();
    if (currentQuestion.multiSelect) {
      setSelectedAnswers((prev) =>
        prev.includes(answer) ? prev.filter((a) => a !== answer) : [...prev, answer]
      );
    } else {
      setSelectedAnswers([answer]);
    }
  };

  const renderAnswerItem = ({ item, index }) => (
    <Animated.View style={{ opacity: answerAnims[index] }}>
      <TouchableOpacity
        style={[
          styles.card,
          selectedAnswers.includes(item) && styles.selectedCard,
        ]}
        onPress={() => handleAnswerSelect(item)}
      >
        <View style={styles.answerContent}>
          <Ionicons 
            name={answerIcons[item]} 
            size={24} 
            color={selectedAnswers.includes(item) ? '#fff' : '#000'} 
            style={styles.answerIcon}
          />
          <Text
            style={[
              styles.cardText,
              selectedAnswers.includes(item) && styles.selectedCardText,
            ]}
          >
            {item}
          </Text>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );

  if (isLoading) {
    const spin = spinAnim.interpolate({
      inputRange: [0, 1],
      outputRange: ['0deg', '360deg'],
    });

    return (
      <View style={styles.loadingContainer}>
        <Animated.View 
          style={[
            styles.spinnerContainer,
            { 
              transform: [
                { rotate: spin },
                { scale: scaleAnim }
              ] 
            }
          ]}
        >
          <Ionicons name="infinite" size={60} color="#000" />
        </Animated.View>
        
        <Text style={styles.loadingText}>{loadingMessages[loadingTextIndex]}</Text>
        
        <View style={styles.dotsContainer}>
          {loadingMessages.map((_, index) => (
            <View 
              key={index} 
              style={[
                styles.dot, 
                index === loadingTextIndex && styles.activeDot
              ]} 
            />
          ))}
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={handleBack}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <View style={styles.progressBarContainer}>
          <View
            style={[styles.progressBar, { width: `${((currentQuestionIndex + 1) / questions.length) * 100}%` }]}
          />
        </View>
      </View>

      <Text style={styles.question}>
        {currentQuestion.question}
      </Text>

      <FlatList
        data={currentQuestion.answers}
        keyExtractor={(item) => item}
        renderItem={renderAnswerItem}
        contentContainerStyle={styles.answersContainer}
      />

      <TouchableOpacity
        style={[styles.nextButton, selectedAnswers.length === 0 && styles.disabledButton]}
        onPress={handleNext}
        disabled={selectedAnswers.length === 0}
      >
        <Text style={styles.nextButtonText}>Next</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 20,
    backgroundColor: '#F9F9F9',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingBottom: 30,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    marginTop: 40,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#000',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  progressBarContainer: {
    flex: 1,
    height: 10,
    backgroundColor: '#ccc',
    borderRadius: 5,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    backgroundColor: '#000',
  },
  question: {
    fontSize: 32,
    fontWeight: 'bold',
    textAlign: 'center',
    marginTop: 20,
    color: '#000',
  },
  answersContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  card: {
    width: 320,
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderRadius: 10,
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
    marginVertical: 10,
  },
  selectedCard: {
    backgroundColor: '#000',
  },
  answerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'left',
  },
  answerIcon: {
    marginRight: 10,
    backgroundColor: '#eee',
    padding: 7,
    borderRadius: 21
  },
  cardText: {
    fontSize: 18,
    color: '#333',
    fontWeight: '500',
  },
  selectedCardText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  nextButton: {
    width: '90%',
    paddingVertical: 15,
    backgroundColor: '#000',
    borderRadius: 50,
    alignItems: 'center',
    marginBottom: 10,
  },
  disabledButton: {
    backgroundColor: '#ccc',
  },
  nextButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F9F9F9',
  },
  spinnerContainer: {
    marginBottom: 30,
  },
  loadingText: {
    fontSize: 22,
    fontWeight: '600',
    color: '#333',
    marginTop: 20,
    marginBottom: 30,
    textAlign: 'center',
    maxWidth: '80%',
  },
  dotsContainer: {
    flexDirection: 'row',
    marginTop: 20,
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#ccc',
    marginHorizontal: 5,
  },
  activeDot: {
    backgroundColor: '#000',
  },
});

export default OnboardingScreen;

