import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  FlatList,
  TouchableOpacity,
  TouchableWithoutFeedback,
  Platform,
  Dimensions
} from 'react-native';
import { Video } from 'expo-av';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';

const { width } = Dimensions.get('window');
const CARD_WIDTH = width * 0.8;
const CARD_SPACING = 15;

const similarMeditations = [
  { id: '1', title: 'Guided Meditation', description: 'Follow a guide to help you meditate and relax.' },
  { id: '2', title: 'Breathing Exercise', description: 'Focus on your breath to relax and center yourself.' },
  { id: '3', title: 'Visualization', description: 'Visualize a peaceful place to calm your mind.' },
  { id: '4', title: 'Progressive Relaxation', description: 'Relax your body progressively from head to toe.' },
  { id: '5', title: 'Body Scan', description: 'Focus on different body parts to relax and unwind.' },
];

const MindfulnessScreen = ({ navigation }) => {
  const scale = useRef(new Animated.Value(1)).current;
  const opacity = useRef(new Animated.Value(0.3)).current;
  const [breathPhase, setBreathPhase] = useState('Breathe In');
  const videoRef = useRef(null);
  const animation = useRef(null);

  const startBreathingAnimation = () => {
    // Reset any existing animation
    animation.current?.stop();
    scale.setValue(1);
    opacity.setValue(0.3);

    // Create the complete breath cycle (inhale -> hold -> exhale -> hold)
    animation.current = Animated.parallel([
      // Scale animation
      Animated.sequence([
        // Inhale (3 seconds)
        Animated.timing(scale, {
          toValue: 1.5,
          duration: 3000,
          useNativeDriver: true,
        }),
        Animated.delay(1000), // Hold breath in
        // Exhale (3 seconds)
        Animated.timing(scale, {
          toValue: 1,
          duration: 3000,
          useNativeDriver: true,
        }),
        Animated.delay(1000), // Hold breath out
      ]),
      // Opacity animation for the breath bar
      Animated.sequence([
        Animated.timing(opacity, {
          toValue: 1,
          duration: 3000,
          useNativeDriver: true,
        }),
        Animated.delay(1000),
        Animated.timing(opacity, {
          toValue: 0.3,
          duration: 3000,
          useNativeDriver: true,
        }),
        Animated.delay(1000),
      ])
    ]);

    animation.current.start(({ finished }) => {
      if (finished) {
        startBreathingAnimation(); // Loop the animation
      }
    });

    // Update breath phase text with proper timing
    const phaseUpdates = [
      { delay: 0, phase: 'Breathe In' },
      { delay: 3000, phase: 'Hold' },
      { delay: 4000, phase: 'Breathe Out' },
      { delay: 7000, phase: 'Hold' },
    ];

    phaseUpdates.forEach(({ delay, phase }) => {
      setTimeout(() => {
        setBreathPhase(phase);
      }, delay);
    });
  };

  useFocusEffect(
    React.useCallback(() => {
      startBreathingAnimation();
      return () => {
        animation.current?.stop();
      };
    }, [])
  );

  const renderCard = ({ item }) => (
    <TouchableOpacity 
      style={styles.card}
      activeOpacity={0.8}
      onPress={() => console.log('Selected:', item.title)}
    >
      <Text style={styles.cardTitle}>{item.title}</Text>
      <Text style={styles.cardDescription}>{item.description}</Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      {/* Back Button */}
      <TouchableWithoutFeedback onPress={() => navigation.goBack()}>
        <View style={styles.backButton}>
          <Ionicons name="arrow-back" size={28} color="#fff" />
        </View>
      </TouchableWithoutFeedback>

      {/* Video Background */}
      <Video
        ref={videoRef}
        source={{ uri: 'https://videos.pexels.com/video-files/7297870/7297870-hd_1080_1920_30fps.mp4' }}
        style={styles.backgroundVideo}
        resizeMode="cover"
        shouldPlay
        isLooping
        isMuted
        rate={1.0}
      />

      {/* Overlay */}
      <View style={styles.overlay} />

      {/* Main Content */}
      <View style={styles.content}>
        <Text style={styles.title}>Mindful Breathing</Text>
        
        <Animated.View style={[styles.circle, { transform: [{ scale }] }]} />
        
        <View style={styles.breathIndicator}>
          <Text style={styles.breathText}>{breathPhase}</Text>
          <View style={styles.breathBarContainer}>
            <Animated.View 
              style={[
                styles.breathBar,
                { 
                  opacity,
                  transform: [{
                    scaleX: scale.interpolate({
                      inputRange: [1, 1.5],
                      outputRange: [0.1, 1]
                    })
                  }]
                }
              ]} 
            />
          </View>
        </View>
      </View>

      {/* Cards Section */}
      <View style={styles.cardsSection}>
        <Text style={styles.sectionTitle}>More Meditations</Text>
        <FlatList
          data={similarMeditations}
          keyExtractor={(item) => item.id}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.cardContainer}
          snapToInterval={CARD_WIDTH + CARD_SPACING}
          decelerationRate="fast"
          renderItem={renderCard}
        />
      </View>

      <Text style={styles.logo}>SōB AI</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121212',
  },
  backButton: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 50 : 30,
    left: 20,
    zIndex: 10,
    padding: 10,
    borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.3)',
  },
  backgroundVideo: {
    ...StyleSheet.absoluteFillObject,
    width: '100%',
    height: '100%',
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 0,
  },
  title: {
    fontSize: 28,
    color: '#fff',
    marginBottom: 30,
    fontFamily: 'Roboto-Bold',
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
    letterSpacing: 1,
  },
  circle: {
    width: 220,
    height: 220,
    backgroundColor: 'rgba(0, 240, 255, 0.7)',
    borderRadius: 110,
    marginBottom: 30,
    borderWidth: 3,
    borderColor: 'rgba(0, 184, 212, 0.8)',
    shadowColor: '#00b8d4',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.7,
    shadowRadius: 12,
    elevation: 10,
  },
  breathIndicator: {
    alignItems: 'center',
    marginTop: 30,
  },
  breathText: {
    fontSize: 24,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 15,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  breathBarContainer: {
    width: '60%',
    height: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 2,
    overflow: 'hidden',
  },
  breathBar: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#00f0ff',
    borderRadius: 2,
  },
  cardsSection: {
    position: 'absolute',
    bottom: 30,
    left: 0,
    right: 0,
    paddingBottom: 20,
  },
  sectionTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
    marginLeft: 25,
    marginBottom: 15,
    letterSpacing: 0.5,
  },
  cardContainer: {
    paddingHorizontal: 20,
  },
  card: {
    width: CARD_WIDTH,
    backgroundColor: 'rgba(0, 184, 212, 0.9)',
    padding: 20,
    borderRadius: 15,
    marginRight: CARD_SPACING,
    height: 120,
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 5,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 8,
    textAlign: 'center',
  },
  cardDescription: {
    fontSize: 14,
    color: '#fff',
    textAlign: 'center',
    lineHeight: 20,
    opacity: 0.9,
  },
  logo: {
    fontSize: 22,
    fontWeight: 'bold',
    position: 'absolute',
    bottom: 30,
    alignSelf: 'center',
    color: 'rgba(255, 255, 255, 0.5)',
    letterSpacing: 1,
  }
});

export default MindfulnessScreen;