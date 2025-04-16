import React, { useState, useRef } from 'react';
import { View, Text, TouchableOpacity, Animated, StyleSheet, Dimensions, Platform, SafeAreaView, ScrollView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import Ionicons from 'react-native-vector-icons/Ionicons';

const { width, height } = Dimensions.get('window');

const Header = ({ title }) => {
  const [menuVisible, setMenuVisible] = useState(false);
  const slideAnim = useRef(new Animated.Value(-width * 0.7)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const navigation = useNavigation();

  const toggleMenu = () => {
    if (menuVisible) {
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: -width * 0.7,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start(() => setMenuVisible(false));
    } else {
      setMenuVisible(true);
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 400,
          useNativeDriver: true,
        }),
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();
    }
  };

  const handleNavigation = (screen) => {
    toggleMenu();
    navigation.navigate(screen);
  };

  return (
    <>
      {/* Header Bar - Fixed to top with SafeAreaView */}
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.headerContainer}>
          <TouchableOpacity 
            onPress={toggleMenu}
            style={styles.headerButton}
            activeOpacity={0.7}
          >
            <Icon name={menuVisible ? "close" : "menu"} size={28} color="#333" />
          </TouchableOpacity>
          
          <Text style={styles.headerTitle}>{title}</Text>
          
          <TouchableOpacity 
            onPress={() => navigation.navigate('Profile')}
            style={styles.headerButton}
            activeOpacity={0.7}
          >
            <Icon name="account-circle" size={30} color="#333" />
          </TouchableOpacity>
        </View>
      </SafeAreaView>

      {/* Animated Backdrop */}
      {menuVisible && (
        <Animated.View style={[styles.backdrop, { opacity: fadeAnim }]}>
          <TouchableOpacity 
            style={styles.backdropTouchable}
            onPress={toggleMenu}
            activeOpacity={1}
          />
        </Animated.View>
      )}

      {/* Slide-Out Menu */}
      <Animated.View style={[
        styles.menuContainer, 
        { 
          transform: [{ translateX: slideAnim }],
          shadowOpacity: fadeAnim.interpolate({
            inputRange: [0, 1],
            outputRange: [0, 0.2]
          })
        }
      ]}>
        <View style={styles.menuHeader}>
          <Text style={styles.menuTitle}>Menu</Text>
        </View>
        
        <ScrollView 
          style={styles.menuList}
          showsVerticalScrollIndicator={false}
        >
          {[
            { icon: "home", text: "Home", screen: "Home" },
            { icon: "notebook", text: "Journal", screen: "JournalScreen" },
            { icon: "meditation", text: "Meditation", screen: "MeditationScreen" },
            { icon: "account-group", text: "Community", screen: "CommunityScreen" },
            { icon: "game-controller-outline", text: "Games", screen: "Games", iconSet: Ionicons },
            { icon: "chart-line", text: "Progress", screen: "Progress" },
            { icon: "trophy", text: "Milestones", screen: "Milestones" },
            { icon: "trophy-outline", text: "Achievements", screen: "Achievements", iconSet: Ionicons },
            { icon: "alert-circle", text: "Triggers", screen: "Triggers" },
            { icon: "book-open-outline", text: "Resources", screen: "ResourcesScreen" },
            { icon: "headset", text: "Support", screen: "SupportScreen" },
          ].map((item, index) => {
            const IconComponent = item.iconSet || Icon;
            return (
              <TouchableOpacity 
                key={index}
                style={styles.menuItem}
                onPress={() => handleNavigation(item.screen)}
                activeOpacity={0.7}
              >
                <IconComponent name={item.icon} size={24} color="#555" />
                <Text style={styles.menuText}>{item.text}</Text>
                <Icon name="chevron-right" size={20} color="#aaa" style={styles.menuArrow} />
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </Animated.View>
    </>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    backgroundColor: '#fff',
    zIndex: 100,
  },
  headerContainer: {
    width: '100%',
    height: 60,
    position: 'absolute',
    top: 35,
    backgroundColor: '#fff',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  headerButton: {
    padding: 0,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#333',
    textAlign: 'center',
  },
  backdrop: {
    position: 'absolute',
    width: '100%',
    height: height,
    backgroundColor: 'rgba(0,0,0,0.5)',
    zIndex: 150,
  },
  backdropTouchable: {
    flex: 1,
  },
  menuContainer: {
    position: 'absolute',
    width: width * 0.7,
    height: height,
    backgroundColor: '#fff',
    left: 0,
    top: 0,
    zIndex: 200,
    shadowColor: '#000',
    shadowOffset: { width: 2, height: 0 },
    shadowRadius: 10,
    elevation: 20,
  },
  menuHeader: {
    paddingTop: Platform.OS === 'ios' ? 50 : 30,
    paddingBottom: 20,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  menuTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#333',
  },
  menuList: {
    paddingHorizontal: 15,
    paddingTop: 10,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 15,
    paddingHorizontal: 15,
    marginBottom: 5,
    borderRadius: 10,
  },
  menuText: {
    fontSize: 16,
    color: '#333',
    marginLeft: 15,
    flex: 1,
    fontWeight: '500',
  },
  menuArrow: {
    marginLeft: 10,
  },
});

// Usage in your screen component:
/*
const Screen = () => {
  return (
    <View style={{ flex: 1 }}>
      <Header title="My App" />
      <View style={{ flex: 1, paddingTop: 60 }}>  // Add paddingTop equal to header height
        {/* Your main content goes here * /}
      </View>
    </View>
  );
}
*/

export default Header;