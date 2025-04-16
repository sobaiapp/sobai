import React, { useEffect, useRef, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Animated, Platform, Easing, Dimensions } from 'react-native';
import Icon from 'react-native-vector-icons/Feather';

const { width, height } = Dimensions.get('window');

const ConfettiPiece = ({ colors, sizeRange }) => {
  const left = useRef(Math.random() * width).current;
  const color = colors[Math.floor(Math.random() * colors.length)];
  const size = Math.random() * (sizeRange[1] - sizeRange[0]) + sizeRange[0];
  const angle = Math.random() * 360;
  const duration = 3000 + Math.random() * 3000;
  
  const anim = useRef(new Animated.Value(0)).current;
  const opacityAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    const fall = Animated.timing(anim, {
      toValue: height + 100,
      duration,
      useNativeDriver: true,
      easing: Easing.linear,
    });

    const fade = Animated.timing(opacityAnim, {
      toValue: 0,
      duration: duration * 0.1,
      delay: duration * 0.9,
      useNativeDriver: true,
    });

    const loop = () => {
      anim.setValue(-100);
      opacityAnim.setValue(1);
      Animated.parallel([fall, fade]).start(loop);
    };

    const timeout = setTimeout(() => {
      loop();
    }, Math.random() * 2000);

    return () => clearTimeout(timeout);
  }, []);

  const spin = anim.interpolate({
    inputRange: [0, height],
    outputRange: ['0deg', `${angle + 360 * 3}deg`]
  });

  return (
    <Animated.View
      style={{
        position: 'absolute',
        left,
        top: -100,
        width: size,
        height: size,
        backgroundColor: color,
        borderRadius: size / 2,
        transform: [
          { translateY: anim },
          { rotate: spin }
        ],
        opacity: opacityAnim,
      }}
    />
  );
};

const Confetti = ({ count = 50 }) => {
  const colors = ['#ff5773', '#ff884b', '#ffcc5c', '#88d8b0', '#96ceb4', '#ffeead', '#4CAF50'];
  const sizeRange = [5, 12];
  
  return (
    <>
      {Array.from({ length: count }).map((_, i) => (
        <ConfettiPiece key={i} colors={colors} sizeRange={sizeRange} />
      ))}
    </>
  );
};

const SuccessScreen = ({ navigation }) => {
  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.5)).current;
  const checkSpin = useRef(new Animated.Value(0)).current;
  const [itemsVisible, setItemsVisible] = useState(0);

  // Animation effects
  useEffect(() => {
    // Main content fade in
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 800,
      useNativeDriver: true,
    }).start();

    // Checkmark scale and spin animation
    Animated.parallel([
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 600,
        easing: Easing.elastic(1.2),
        useNativeDriver: true,
      }),
      Animated.timing(checkSpin, {
        toValue: 1,
        duration: 800,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      })
    ]).start();

    // Checklist items sequential appearance
    const interval = setInterval(() => {
      setItemsVisible(prev => (prev < checklistItems.length ? prev + 1 : prev));
    }, 200);

    return () => clearInterval(interval);
  }, []);

  // Checklist data
  const checklistItems = [
    'Sobriety plan created',
    'Nutrition guide ready',
    'Progress tracker set',
    'Weekly goals configured',
    'Expert tips included'
  ];

  // Checkmark spin interpolation
  const spin = checkSpin.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg']
  });

  return (
    <View style={styles.container}>
      {/* Confetti background */}
      <Confetti count={60} />
      
      {/* Main content with fade animation */}
      <Animated.View style={[styles.content, { opacity: fadeAnim }]}>
        {/* Animated checkmark */}
        <Animated.View style={[
          styles.checkContainer,
          {
            transform: [
              { scale: scaleAnim },
              { rotate: spin }
            ]
          }
        ]}>
          <Icon name="check" size={32} color="#fff" />
        </Animated.View>

        <Text style={styles.title}>All Set!</Text>
        <Text style={styles.subtitle}>Your custom plan is ready to go</Text>

        <View style={styles.checklistContainer}>
          {checklistItems.map((item, index) => (
            <Animated.View 
              key={`checklist-${index}`}
              style={[
                styles.checklistItem,
                {
                  opacity: itemsVisible > index ? 1 : 0,
                  transform: [{
                    translateY: itemsVisible > index ? 
                      new Animated.Value(0) : 
                      new Animated.Value(10)
                  }]
                }
              ]}
            >
              <Icon name="check" size={22} color="#4CAF50" style={styles.checkIcon} />
              <Text style={styles.checklistText}>{item}</Text>
            </Animated.View>
          ))}
        </View>

        <TouchableOpacity
          style={styles.button}
          onPress={() => navigation.navigate('Paywall')}
          activeOpacity={0.7}
          testID="continue-button"
        >
          <Text style={styles.buttonText}>Continue</Text>
        </TouchableOpacity>
      </Animated.View>
    </View>
  );
};

// Styles remain the same as in your original code
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
    width: '100%',
  },
  checkContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#4CAF50',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 5,
      },
      android: {
        elevation: 5,
      },
    }),
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    color: '#000',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 18,
    color: '#555',
    textAlign: 'center',
    marginBottom: 36,
    lineHeight: 24,
    paddingHorizontal: 20,
  },
  checklistContainer: {
    width: '90%',
    maxWidth: 400,
    backgroundColor: '#f9f9f9',
    borderRadius: 12,
    padding: 24,
    marginBottom: 36,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  checklistItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    paddingVertical: 4,
  },
  checkIcon: {
    marginRight: 16,
  },
  checklistText: {
    fontSize: 18,
    color: '#000',
    flex: 1,
    fontWeight: '500',
  },
  button: {
    width: '90%',
    maxWidth: 400,
    paddingVertical: 16,
    backgroundColor: '#000',
    borderRadius: 10,
    alignItems: 'center',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 3,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  buttonText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#fff',
  },
});

export default SuccessScreen;