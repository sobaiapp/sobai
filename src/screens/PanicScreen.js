import React, { useState, useEffect, useRef } from 'react';
import { 
  View, 
  Text, 
  TouchableOpacity, 
  StyleSheet, 
  ScrollView, 
  Linking, 
  Animated, 
  Easing, 
  Vibration,
  SafeAreaView,
  StatusBar,
  Platform,
  Dimensions
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';

const { width } = Dimensions.get('window');

const PanicScreen = () => {
  const navigation = useNavigation();
  const [showTips, setShowTips] = useState(false);
  const [showDistractions, setShowDistractions] = useState(false);
  const [showBreathing, setShowBreathing] = useState(false);
  const [breathPhase, setBreathPhase] = useState('inhale');
  const [breathCount, setBreathCount] = useState(0);
  const [scaleAnim] = useState(new Animated.Value(1));
  const [fadeAnim] = useState(new Animated.Value(0));
  const [isBreathing, setIsBreathing] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [showEmergency, setShowEmergency] = useState(false);
  const [showResources, setShowResources] = useState(false);
  const [showGrounding, setShowGrounding] = useState(false);
  const [showCoping, setShowCoping] = useState(false);
  const [showSupport, setShowSupport] = useState(false);
  
  const pulseAnim = useRef(new Animated.Value(0)).current;

  // Emergency contacts (could be loaded from storage)
  const emergencyContacts = [
    { name: 'Sponsor', number: '555-123-4567' },
    { name: 'Therapist', number: '555-987-6543' },
    { name: 'Support Friend', number: '555-456-7890' }
  ];

  const breathingSteps = [
    { text: "Breathe in...", duration: 4000 },
    { text: "Hold...", duration: 4000 },
    { text: "Breathe out...", duration: 4000 },
    { text: "Hold...", duration: 4000 }
  ];

  const groundingExercises = [
    "Name 5 things you can see",
    "Name 4 things you can touch",
    "Name 3 things you can hear",
    "Name 2 things you can smell",
    "Name 1 thing you can taste"
  ];

  const copingStrategies = [
    "Progressive muscle relaxation",
    "Positive self-talk",
    "Visualization of a safe place",
    "Counting backwards from 100",
    "Focus on a calming object"
  ];

  const supportResources = [
    "Call a trusted friend",
    "Text a support group",
    "Reach out to your sponsor",
    "Contact a crisis hotline",
    "Schedule a therapy session"
  ];

  useEffect(() => {
    // Start animation when component mounts
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 500,
      easing: Easing.ease,
      useNativeDriver: true,
    }).start();

    // Breathing animation
    if (showBreathing) {
      startBreathingAnimation();
    }

    if (isBreathing) {
      const interval = setInterval(() => {
        setCurrentStep((prev) => (prev + 1) % breathingSteps.length);
      }, breathingSteps[currentStep].duration);

      return () => clearInterval(interval);
    }
  }, [showBreathing, isBreathing, currentStep]);

  const startBreathingAnimation = () => {
    const breathSequence = () => {
      // Inhale (4 seconds)
      setBreathPhase('inhale');
      Animated.timing(scaleAnim, {
        toValue: 1.2,
        duration: 4000,
        useNativeDriver: true,
      }).start(() => {
        // Hold (2 seconds)
        setBreathPhase('hold');
        setTimeout(() => {
          // Exhale (6 seconds)
          setBreathPhase('exhale');
          Animated.timing(scaleAnim, {
            toValue: 0.8,
            duration: 6000,
            useNativeDriver: true,
          }).start(() => {
            setBreathCount(prev => prev + 1);
            if (breathCount < 5) {
              breathSequence();
            } else {
              setShowBreathing(false);
              setBreathCount(0);
              scaleAnim.setValue(1);
            }
          });
        }, 2000);
      });
    };
    breathSequence();
  };

  const handleEmergencyCall = (number = '911') => {
    Vibration.vibrate(100); // Tactile feedback
    Linking.openURL(`tel:${number}`);
  };

  const toggleTips = () => {
    setShowTips(!showTips);
    setShowDistractions(false);
    setShowBreathing(false);
  };

  const toggleDistractions = () => {
    setShowDistractions(!showDistractions);
    setShowTips(false);
    setShowBreathing(false);
  };

  const startBreathingExercise = () => {
    setShowBreathing(true);
    setShowTips(false);
    setShowDistractions(false);
  };

  const distractionActivities = [
    'Go for a 5-minute walk',
    'Drink a glass of cold water',
    'Do 10 push-ups or squats',
    'Listen to your favorite song',
    'Call a supportive friend',
    'Write down your thoughts',
    'Play a quick mobile game',
    'Chew gum or eat a mint',
    'Name 5 things you can see around you',
    'Solve a puzzle or brain teaser'
  ];

  const startBreathing = () => {
    setIsBreathing(true);
    setCurrentStep(0);
    startPulseAnimation();
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  };

  const stopBreathing = () => {
    setIsBreathing(false);
    setCurrentStep(0);
    stopPulseAnimation();
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
  };

  const startPulseAnimation = () => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 4000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 0,
          duration: 4000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    ).start();
  };

  const stopPulseAnimation = () => {
    pulseAnim.setValue(0);
  };

  const handleEmergency = () => {
    setShowEmergency(true);
    Vibration.vibrate([0, 500, 200, 500]);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" />
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton} 
          onPress={() => navigation.goBack()}
          activeOpacity={0.7}
        >
          <Icon name="arrow-left" size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Urge Support</Text>
        <View style={styles.headerRightPlaceholder} />
      </View>

      <ScrollView 
        contentContainerStyle={styles.container}
        showsVerticalScrollIndicator={false}
      >
        <Animated.View style={{ opacity: fadeAnim, width: '100%' }}>
          <Text style={styles.message}>
            You're experiencing an urge, but you've got this! Let's work through it together.
          </Text>

          <View style={styles.buttonRow}>
            <TouchableOpacity 
              style={[styles.smallButton, showTips && styles.activeButton]} 
              onPress={toggleTips}
              activeOpacity={0.7}
            >
              <Icon name="lightbulb-on" size={20} color="#fff" />
              <Text style={styles.smallButtonText}>Tips</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={[styles.smallButton, showDistractions && styles.activeButton]} 
              onPress={toggleDistractions}
              activeOpacity={0.7}
            >
              <Icon name="run" size={20} color="#fff" />
              <Text style={styles.smallButtonText}>Distract</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={[styles.smallButton, showBreathing && styles.activeButton]} 
              onPress={startBreathingExercise}
              activeOpacity={0.7}
            >
              <Icon name="weather-windy" size={20} color="#fff" />
              <Text style={styles.smallButtonText}>Breathe</Text>
            </TouchableOpacity>
          </View>

          {showTips && (
            <View style={styles.tipsContainer}>
              <Text style={styles.sectionTitle}>Urge Management Tips</Text>
              <Text style={styles.tipText}>• The urge will pass whether you use or not - it typically lasts 15-30 minutes</Text>
              <Text style={styles.tipText}>• Rate your urge from 1-10 and watch it change</Text>
              <Text style={styles.tipText}>• Play the tape forward - imagine the consequences of giving in</Text>
              <Text style={styles.tipText}>• Remember your reasons for staying sober</Text>
              <Text style={styles.tipText}>• Delay any decision - tell yourself "not now, maybe later"</Text>
            </View>
          )}

          {showDistractions && (
            <View style={styles.tipsContainer}>
              <Text style={styles.sectionTitle}>Quick Distractions</Text>
              {distractionActivities.map((activity, index) => (
                <Text key={index} style={styles.tipText}>• {activity}</Text>
              ))}
            </View>
          )}

          {showBreathing && (
            <View style={styles.breathingContainer}>
              <Text style={styles.sectionTitle}>Calming Breath Exercise</Text>
              <Text style={styles.breathPhaseText}>
                {breathPhase === 'inhale' ? 'Breathe IN (4 sec)' : 
                breathPhase === 'hold' ? 'Hold (2 sec)' : 'Breathe OUT (6 sec)'}
              </Text>
              <Animated.View style={[styles.breathCircle, { transform: [{ scale: scaleAnim }] }]}>
                <Icon name="circle" size={100} color="#3498db" />
              </Animated.View>
              <Text style={styles.breathCount}>Cycle: {breathCount}/5</Text>
              <Text style={styles.tipText}>Follow the circle's movement with your breath</Text>
            </View>
          )}

          <Text style={styles.emergencyTitle}>Emergency Contacts</Text>
          {emergencyContacts.map((contact, index) => (
            <TouchableOpacity 
              key={index} 
              style={styles.contactButton}
              onPress={() => handleEmergencyCall(contact.number)}
              activeOpacity={0.7}
            >
              <Text style={styles.contactText}>{contact.name}: {contact.number}</Text>
            </TouchableOpacity>
          ))}

          <TouchableOpacity 
            style={styles.emergencyButton} 
            onPress={() => handleEmergencyCall()}
            activeOpacity={0.7}
          >
            <Icon name="phone" size={20} color="#fff" />
            <Text style={styles.buttonText}>Call Emergency Services</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.homeButton} 
            onPress={() => navigation.goBack()}
            activeOpacity={0.7}
          >
            <Text style={styles.buttonText}>I'm Feeling Better</Text>
          </TouchableOpacity>

          <View style={styles.footer}>
            <Text style={styles.footerText}>You're not alone in this. Reach out if you need help.</Text>
          </View>
        </Animated.View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#f7f7f7',
    marginTop: -13
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
    backgroundColor: '#fff',
  },
  backButton: {
    padding: 5,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#000',
  },
  headerRightPlaceholder: {
    width: 24,
  },
  container: {
    flexGrow: 1,
    alignItems: 'center',
    padding: 20,
    paddingTop: 15,
    backgroundColor: '#f7f7f7',
  },
  message: {
    fontSize: 18,
    color: '#34495e',
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 24,
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginBottom: 20,
  },
  smallButton: {
    backgroundColor: '#2c3e50',
    paddingVertical: 12,
    paddingHorizontal: 15,
    borderRadius: 30,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
    marginHorizontal: 5,
  },
  activeButton: {
    backgroundColor: '#3498db',
  },
  smallButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
    marginLeft: 5,
  },
  tipsContainer: {
    marginBottom: 20,
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 10,
    width: '100%',
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 10,
    textAlign: 'center',
  },
  tipText: {
    fontSize: 16,
    color: '#34495e',
    marginBottom: 8,
    lineHeight: 22,
  },
  breathingContainer: {
    marginBottom: 20,
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 10,
    width: '100%',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  breathCircle: {
    marginVertical: 20,
  },
  breathPhaseText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 10,
  },
  breathCount: {
    fontSize: 16,
    color: '#7f8c8d',
    marginBottom: 10,
  },
  emergencyTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginTop: 20,
    marginBottom: 10,
    textAlign: 'center',
  },
  contactButton: {
    backgroundColor: '#2c3e50',
    padding: 12,
    borderRadius: 8,
    marginBottom: 10,
    width: '100%',
  },
  contactText: {
    color: '#fff',
    fontSize: 14,
    textAlign: 'center',
  },
  emergencyButton: {
    backgroundColor: '#e74c3c',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 30,
    marginTop: 15,
    marginBottom: 15,
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  homeButton: {
    backgroundColor: '#27ae60',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 30,
    marginBottom: 15,
    width: '100%',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
    marginLeft: 5,
  },
  footer: {
    marginTop: 30,
    paddingHorizontal: 20,
  },
  footerText: {
    fontSize: 16,
    color: '#7f8c8d',
    textAlign: 'center',
    fontStyle: 'italic',
  },
});

export default PanicScreen;