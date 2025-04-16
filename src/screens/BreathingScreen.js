import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  ImageBackground, 
  TouchableOpacity, 
  StyleSheet, 
  Animated,
  Easing,
  Dimensions
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const { width } = Dimensions.get('window');

const BreathingScreen = () => {
  const [isActive, setIsActive] = useState(false);
  const [currentPhase, setCurrentPhase] = useState('inhale');
  const [cycleCount, setCycleCount] = useState(0);
  const [duration, setDuration] = useState(4); // seconds per phase
  const scaleValue = new Animated.Value(1);
  const opacityValue = new Animated.Value(1);

  const breathImages = [
    'https://images.unsplash.com/photo-1506744038136-46273834b3fb', // nature 1
    'https://images.unsplash.com/photo-1476231682828-37e571bc172f', // nature 2
    'https://images.unsplash.com/photo-1465146344425-f00d5f5c8f07', // nature 3
    'https://images.unsplash.com/photo-1454372182658-c712e4c5a1db'  // nature 4
  ];
  const [currentImage, setCurrentImage] = useState(breathImages[0]);

  const phases = {
    inhale: {
      text: 'Breathe In',
      color: '#4a8fe7',
      duration: duration,
      next: 'hold1'
    },
    hold1: {
      text: 'Hold',
      color: '#4ac1e7',
      duration: duration/2,
      next: 'exhale'
    },
    exhale: {
      text: 'Breathe Out',
      color: '#e74a4a',
      duration: duration,
      next: 'hold2'
    },
    hold2: {
      text: 'Hold',
      color: '#e7b54a',
      duration: duration/2,
      next: 'inhale'
    }
  };

  useEffect(() => {
    let timer;
    if (isActive) {
      animateBreath();
      timer = setTimeout(() => {
        const nextPhase = phases[currentPhase].next;
        if (nextPhase === 'inhale') {
          setCycleCount(prev => prev + 1);
          // Change background image every 2 cycles
          if ((cycleCount + 1) % 2 === 0) {
            const nextImageIndex = (breathImages.indexOf(currentImage) + 1) % breathImages.length;
            setCurrentImage(breathImages[nextImageIndex]);
          }
        }
        setCurrentPhase(nextPhase);
      }, phases[currentPhase].duration * 1000);
    }

    return () => clearTimeout(timer);
  }, [isActive, currentPhase]);

  const animateBreath = () => {
    if (currentPhase === 'inhale') {
      // Scale up animation for inhale
      Animated.parallel([
        Animated.timing(scaleValue, {
          toValue: 1.3,
          duration: phases[currentPhase].duration * 1000,
          easing: Easing.linear,
          useNativeDriver: true
        }),
        Animated.timing(opacityValue, {
          toValue: 0.8,
          duration: phases[currentPhase].duration * 1000,
          easing: Easing.linear,
          useNativeDriver: true
        })
      ]).start();
    } else if (currentPhase === 'exhale') {
      // Scale down animation for exhale
      Animated.parallel([
        Animated.timing(scaleValue, {
          toValue: 1,
          duration: phases[currentPhase].duration * 1000,
          easing: Easing.linear,
          useNativeDriver: true
        }),
        Animated.timing(opacityValue, {
          toValue: 1,
          duration: phases[currentPhase].duration * 1000,
          easing: Easing.linear,
          useNativeDriver: true
        })
      ]).start();
    }
  };

  const toggleBreathing = () => {
    if (!isActive) {
      setCurrentPhase('inhale');
      setCycleCount(0);
    }
    setIsActive(!isActive);
  };

  const changeDuration = (newDuration) => {
    setDuration(newDuration);
    if (isActive) {
      setIsActive(false);
      setTimeout(() => setIsActive(true), 100);
    }
  };

  return (
    <ImageBackground 
      source={{ uri: currentImage }} 
      style={styles.container}
      blurRadius={2}
    >
      <View style={styles.overlay} />
      
      <View style={styles.content}>
        <Text style={styles.title}>Breathwork</Text>
        <Text style={styles.subtitle}>Focus on your breath to relax and center yourself</Text>
        
        <View style={styles.breathContainer}>
          <Animated.View 
            style={[
              styles.breathCircle,
              { 
                backgroundColor: phases[currentPhase].color,
                transform: [{ scale: scaleValue }],
                opacity: opacityValue
              }
            ]}
          >
            <Text style={styles.breathText}>{phases[currentPhase].text}</Text>
            <Text style={styles.breathTimer}>{phases[currentPhase].duration}s</Text>
          </Animated.View>
        </View>
        
        <View style={styles.controls}>
          <TouchableOpacity 
            style={[styles.controlButton, styles.mainButton]}
            onPress={toggleBreathing}
          >
            <Ionicons 
              name={isActive ? 'pause' : 'play'} 
              size={32} 
              color="#fff" 
            />
            <Text style={styles.controlButtonText}>
              {isActive ? 'Pause' : 'Begin'}
            </Text>
          </TouchableOpacity>
          
          <View style={styles.durationControls}>
            <Text style={styles.durationLabel}>Duration:</Text>
            {[4, 5, 6].map((sec) => (
              <TouchableOpacity
                key={sec}
                style={[
                  styles.durationButton,
                  duration === sec && styles.activeDurationButton
                ]}
                onPress={() => changeDuration(sec)}
              >
                <Text style={[
                  styles.durationButtonText,
                  duration === sec && styles.activeDurationButtonText
                ]}>
                  {sec}s
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
        
        <View style={styles.stats}>
          <Text style={styles.statText}>Cycles: {cycleCount}</Text>
          <Text style={styles.statText}>Current: {currentPhase}</Text>
        </View>
      </View>
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
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
    marginBottom: 40,
    textAlign: 'center',
    textShadowColor: 'rgba(0,0,0,0.3)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  breathContainer: {
    width: width * 0.8,
    height: width * 0.8,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 40,
  },
  breathCircle: {
    width: width * 0.6,
    height: width * 0.6,
    borderRadius: width * 0.3,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10,
  },
  breathText: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 10,
  },
  breathTimer: {
    fontSize: 20,
    color: 'rgba(255,255,255,0.8)',
  },
  controls: {
    width: '100%',
    alignItems: 'center',
    marginBottom: 30,
  },
  controlButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 30,
    marginBottom: 20,
  },
  mainButton: {
    backgroundColor: 'rgba(106, 90, 205, 0.9)',
  },
  controlButtonText: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
    marginLeft: 10,
  },
  durationControls: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
  },
  durationLabel: {
    color: '#fff',
    marginRight: 15,
    fontSize: 16,
  },
  durationButton: {
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderRadius: 20,
    marginHorizontal: 5,
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
  activeDurationButton: {
    backgroundColor: 'rgba(106, 90, 205, 0.9)',
  },
  durationButtonText: {
    color: '#fff',
    fontSize: 16,
  },
  activeDurationButtonText: {
    fontWeight: 'bold',
  },
  stats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '80%',
  },
  statText: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 14,
  },
});

export default BreathingScreen;