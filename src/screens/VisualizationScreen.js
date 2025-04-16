import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  ImageBackground, 
  TouchableOpacity, 
  StyleSheet, 
  ScrollView,
  Animated,
  Dimensions
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const { width, height } = Dimensions.get('window');

const visualizationImages = [
  'https://images.unsplash.com/photo-1476231682828-37e571bc172f', // beach
  'https://images.unsplash.com/photo-1465146344425-f00d5f5c8f07', // forest
  'https://images.unsplash.com/photo-1454372182658-c712e4c5a1db', // mountain
  'https://images.unsplash.com/photo-1506744038136-46273834b3fb', // lake
  'https://images.unsplash.com/photo-1470114716159-e389f8712fda', // sunset
  'https://images.unsplash.com/photo-1500382017468-9049fed747ef'  // field
];

const visualizationPrompts = [
  {
    title: "Peaceful Beach",
    description: "Imagine the gentle waves lapping at the shore, the warm sun on your skin, and the soft sand beneath your feet.",
    audio: "waves.mp3"
  },
  {
    title: "Serene Forest",
    description: "Picture yourself walking through a lush green forest, hearing the birds chirping and leaves rustling in the breeze.",
    audio: "forest.mp3"
  },
  {
    title: "Mountain Vista",
    description: "Visualize standing on a mountain peak, breathing in the crisp air and taking in the breathtaking panoramic views.",
    audio: "mountains.mp3"
  },
  {
    title: "Tranquil Lake",
    description: "See yourself by a calm lake, watching the water ripple gently as dragonflies skim the surface.",
    audio: "lake.mp3"
  }
];

const VisualizationScreen = () => {
  const [currentImage, setCurrentImage] = useState(visualizationImages[0]);
  const [currentPrompt, setCurrentPrompt] = useState(visualizationPrompts[0]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [timer, setTimer] = useState(300); // 5 minutes in seconds
  const fadeAnim = new Animated.Value(0);

  useEffect(() => {
    // Fade animation when image changes
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 1000,
      useNativeDriver: true
    }).start();
  }, [currentImage]);

  useEffect(() => {
    let interval;
    if (isPlaying && timer > 0) {
      interval = setInterval(() => {
        setTimer(prev => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isPlaying, timer]);

  const changeScene = (index) => {
    fadeAnim.setValue(0);
    setCurrentImage(visualizationImages[index]);
    setCurrentPrompt(visualizationPrompts[index]);
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  const togglePlay = () => {
    setIsPlaying(!isPlaying);
  };

  const resetTimer = () => {
    setIsPlaying(false);
    setTimer(300);
  };

  return (
    <View style={styles.container}>
      <Animated.View style={{ opacity: fadeAnim }}>
        <ImageBackground 
          source={{ uri: currentImage }} 
          style={styles.backgroundImage}
          blurRadius={isPlaying ? 0 : 2}
        >
          <View style={styles.overlay} />
          
          <View style={styles.content}>
            <Text style={styles.title}>Guided Visualization</Text>
            <Text style={styles.subtitle}>Immerse yourself in a peaceful mental space</Text>
            
            {isPlaying ? (
              <View style={styles.visualizationActive}>
                <Text style={styles.promptTitle}>{currentPrompt.title}</Text>
                <Text style={styles.promptText}>{currentPrompt.description}</Text>
                <Text style={styles.timer}>{formatTime(timer)}</Text>
                
                <View style={styles.controls}>
                  <TouchableOpacity onPress={togglePlay} style={styles.controlButton}>
                    <Ionicons name={isPlaying ? 'pause' : 'play'} size={36} color="#fff" />
                  </TouchableOpacity>
                  <TouchableOpacity onPress={resetTimer} style={styles.controlButton}>
                    <Ionicons name="refresh" size={30} color="#fff" />
                  </TouchableOpacity>
                </View>
              </View>
            ) : (
              <ScrollView 
                style={styles.sceneSelector}
                contentContainerStyle={styles.sceneContainer}
                horizontal
                showsHorizontalScrollIndicator={false}
              >
                {visualizationImages.map((image, index) => (
                  <TouchableOpacity 
                    key={index} 
                    style={styles.sceneOption}
                    onPress={() => changeScene(index)}
                  >
                    <ImageBackground 
                      source={{ uri: image }} 
                      style={styles.sceneImage}
                      imageStyle={{ borderRadius: 10 }}
                    >
                      <View style={styles.sceneOverlay}>
                        <Text style={styles.sceneTitle}>
                          {visualizationPrompts[index]?.title || "Peaceful Scene"}
                        </Text>
                      </View>
                    </ImageBackground>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            )}
            
            <TouchableOpacity 
              style={styles.startButton}
              onPress={togglePlay}
            >
              <Text style={styles.startButtonText}>
                {isPlaying ? 'Pause Visualization' : 'Begin Visualization'}
              </Text>
            </TouchableOpacity>
          </View>
        </ImageBackground>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  backgroundImage: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  content: {
    width: '90%',
    alignItems: 'center',
    paddingVertical: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 8,
    textShadowColor: 'rgba(0,0,0,0.5)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
  },
  subtitle: {
    fontSize: 18,
    color: 'rgba(255,255,255,0.9)',
    marginBottom: 30,
    textAlign: 'center',
    textShadowColor: 'rgba(0,0,0,0.3)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  sceneSelector: {
    width: '100%',
    marginBottom: 30,
  },
  sceneContainer: {
    paddingHorizontal: 10,
  },
  sceneOption: {
    width: width * 0.6,
    height: height * 0.3,
    marginRight: 15,
    borderRadius: 10,
    overflow: 'hidden',
  },
  sceneImage: {
    width: '100%',
    height: '100%',
    justifyContent: 'flex-end',
  },
  sceneOverlay: {
    backgroundColor: 'rgba(0,0,0,0.5)',
    padding: 15,
  },
  sceneTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  visualizationActive: {
    width: '100%',
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: 15,
    padding: 20,
    marginBottom: 30,
    alignItems: 'center',
  },
  promptTitle: {
    color: '#fff',
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center',
  },
  promptText: {
    color: 'rgba(255,255,255,0.9)',
    fontSize: 16,
    lineHeight: 24,
    textAlign: 'center',
    marginBottom: 20,
  },
  timer: {
    color: '#fff',
    fontSize: 36,
    fontWeight: 'bold',
    marginVertical: 15,
  },
  controls: {
    flexDirection: 'row',
    justifyContent: 'center',
    width: '100%',
    marginTop: 10,
  },
  controlButton: {
    marginHorizontal: 20,
    padding: 15,
  },
  startButton: {
    backgroundColor: 'rgba(106, 90, 205, 0.9)',
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 30,
  },
  startButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default VisualizationScreen;