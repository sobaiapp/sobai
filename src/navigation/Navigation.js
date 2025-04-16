import React, { useEffect, useState } from 'react';
import { View, StyleSheet, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Icon from 'react-native-vector-icons/Ionicons';
import LinearGradient from 'expo-linear-gradient';

// Import screens
import StartScreen from '../screens/StartScreen';
import LoginScreen from '../screens/LoginScreen';
import OnboardingScreen from '../screens/OnboardingScreen';
import PaywallScreen from '../screens/PaywallScreen';
import PaywallScreenTwo from '../screens/PaywallScreenTwo';
import HomeScreen from '../screens/HomeScreen';
import LearnScreen from '../screens/LearnScreen';
import AiScreen from '../screens/AiScreen';
import MotivationScreen from '../screens/MotivationScreen';
import SettingsScreen from '../screens/SettingsScreen';
import ProfileScreen from '../screens/ProfileScreen';
import EditProfile from '../screens/EditProfile';
import SuccessScreen from '../screens/SuccessScreen';
import HealthScreen from '../screens/HealthScreen';
import MeetingsScreen from '../screens/MeetingsScreen';
import MeditationScreen from '../screens/MeditationScreen';
import JournalScreen from '../screens/JournalScreen';
import CheckInScreen from '../screens/CheckInScreen';
import ChallengesScreen from '../screens/ChallengesScreen';
import CommunityScreen from '../screens/CommunityScreen';
import ResourcesScreen from '../screens/ResourcesScreen';
import SupportScreen from '../screens/SupportScreen';
import PanicScreen from '../screens/PanicScreen';
import RelapsePreventionScreen from '../screens/RelapsePreventionScreen';
import MindfulnessScreen from '../screens/MindfulnessScreen';
import MemoryGameScreen from '../screens/MemoryGameScreen';
import TriviaGameScreen from '../screens/TriviaGameScreen';
import QuizGameScreen from '../screens/QuizGameScreen';
import PuzzleGameScreen from '../screens/PuzzleGameScreen';
import GuidedMeditationScreen from '../screens/GuidedMeditation';
import ProgressScreen from '../screens/ProgressScreen';
import TriggersScreen from '../screens/TriggersScreen';
import Header from '../components/Header';
import GamesScreen from '../screens/GamesScreen';
import MilestonesScreen from '../screens/MilestonesScreen';
import BreathingScreen from '../screens/BreathingScreen';
import VisualizationScreen from '../screens/VisualizationScreen';
import BodyWeightScreen from '../screens/BodyWeightScreen';
import RegisterScreen from '../screens/RegisterScreen';
import VeganRecipesScreen from '../screens/health/meals/vegan/VeganRecipesScreen';
import FriendProfile from '../screens/FriendProfile';
import MessageScreen from '../screens/MessageScreen';
import WorkoutCompleteScreen from '../screens/WorkoutCompleteScreen';
import WorkoutDetailScreen from '../screens/WorkoutDetailScreen';
import MealDetail from '../screens/MealDetail';
import AchievementsScreen from '../screens/AchievementsScreen';
import DailyQuiz from '../screens/DailyQuiz';
import MathChallenge from '../screens/MathChallenge';
import PatternGame from '../screens/PatternGame';
import ReactionGame from '../screens/ReactionGame';
import WordChain from '../screens/WordChain';
import WordPuzzle from '../screens/WordPuzzle';
import MealList from '../screens/MealList';

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

const ScreenWrapper = ({ children, title }) => (
  <View style={styles.safeArea}>
    <Header title={title} />
    <View style={styles.screenContainer}>{children}</View>
  </View>
);

const MainTabs = () => (
  <Tab.Navigator
    screenOptions={({ route }) => ({
      tabBarIcon: ({ color, size }) => {
        let iconName;
        switch (route.name) {
          case 'Home':
            iconName = 'home-outline';
            break;
          case 'Learn':
            iconName = 'bulb-outline';
            break;
          case 'Ai':
            iconName = 'sparkles-outline';
            break;
          case 'Motivation':
            iconName = 'heart-outline';
            break;
          case 'Settings':
            iconName = 'settings-outline';
            break;
        }
        return <Icon name={iconName} size={size} color={color} />;
      },
      tabBarActiveTintColor: '#000',
      tabBarInactiveTintColor: 'gray',
      tabBarStyle: { 
        backgroundColor: '#fff', 
        paddingBottom: 5,
        marginBottom: 5,
        height: 65,
      },
      headerShown: false,
    })}
  >
    <Tab.Screen name="Home">
      {({ navigation }) => (
        <ScreenWrapper title="Home">
          <HomeScreen navigation={navigation} />
        </ScreenWrapper>
      )}
    </Tab.Screen>
    <Tab.Screen name="Learn">
      {() => <ScreenWrapper title="Learn"><LearnScreen /></ScreenWrapper>}
    </Tab.Screen>
    <Tab.Screen name="Ai">
      {() => <ScreenWrapper title="AI"><AiScreen /></ScreenWrapper>}
    </Tab.Screen>
    <Tab.Screen name="Motivation">
      {() => <ScreenWrapper title="Motivation"><MotivationScreen /></ScreenWrapper>}
    </Tab.Screen>
    <Tab.Screen name="Settings">
      {() => <ScreenWrapper title="Settings"><SettingsScreen /></ScreenWrapper>}
    </Tab.Screen>
  </Tab.Navigator>
);

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F9F9F9',
  },
  screenContainer: {
    flex: 1,
    paddingTop: 40,
    backgroundColor: '#F9F9F9',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F9F9F9',
  },
  mainContainer: {
    flex: 1,
    backgroundColor: '#F9F9F9',
  },
});

const Navigation = () => {
  const [isFirstLaunch, setIsFirstLaunch] = useState(null);

  useEffect(() => {
    const checkOnboarding = async () => {
      const onboardingCompleted = await AsyncStorage.getItem('onboardingCompleted');
      setIsFirstLaunch(onboardingCompleted === null);
    };
    checkOnboarding();
  }, []);

  if (isFirstLaunch === null) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#000" />
      </View>
    );
  }

  return (
    <NavigationContainer>
      <View style={styles.mainContainer}>
        <Stack.Navigator screenOptions={{ headerShown: false }}>
          {isFirstLaunch ? (
            <>
              <Stack.Screen name="Start" component={StartScreen} />
              <Stack.Screen name="Onboarding" component={OnboardingScreen} />
              <Stack.Screen name="Paywall" component={PaywallScreen} />
            </>
          ) : null}
          <Stack.Screen name="Success" component={SuccessScreen} />
          <Stack.Screen name="PaywallScreenTwo" component={PaywallScreenTwo} />
          <Stack.Screen name="Main" component={MainTabs} options={{ gestureEnabled: false }} />
          <Stack.Screen name="Profile" component={ProfileScreen} />
          <Stack.Screen name="EditProfile" component={EditProfile} />
          <Stack.Screen name="FriendProfile" component={FriendProfile} />
          <Stack.Screen name="Achievements" component={AchievementsScreen} />
          <Stack.Screen 
            name="Message" 
            component={MessageScreen}
            options={{
              headerShown: true,
              headerTitle: 'Chat',
              headerBackTitle: 'Back',
            }}
          />
          <Stack.Screen name="Health" component={HealthScreen} />
          <Stack.Screen name="Meetings" component={MeetingsScreen} />
          <Stack.Screen name="MeditationScreen" component={MeditationScreen} />
          <Stack.Screen name="JournalScreen" component={JournalScreen} />
          <Stack.Screen name="CheckIn" component={CheckInScreen} />
          <Stack.Screen name="Challenges" component={ChallengesScreen} />
          <Stack.Screen name="CommunityScreen" component={CommunityScreen} />
          <Stack.Screen name="ResourcesScreen" component={ResourcesScreen} />
          <Stack.Screen name="SupportScreen" component={SupportScreen} />
          <Stack.Screen name="PanicScreen" component={PanicScreen} />
          <Stack.Screen name="Login" component={LoginScreen} />
          <Stack.Screen name="Games" component={GamesScreen} />
          <Stack.Screen name="MemoryGame" component={MemoryGameScreen} />
          <Stack.Screen name="TriviaGame" component={TriviaGameScreen} />
          <Stack.Screen name="QuizGame" component={QuizGameScreen} />
          <Stack.Screen name="PuzzleGame" component={PuzzleGameScreen} />
          <Stack.Screen name="RelapsePrevention" component={RelapsePreventionScreen} />
          <Stack.Screen name="Mindfulness" component={MindfulnessScreen} />
          <Stack.Screen name="GuidedMeditation" component={GuidedMeditationScreen} />
          <Stack.Screen name="Progress" component={ProgressScreen} />
          <Stack.Screen name="Milestones" component={MilestonesScreen} />
          <Stack.Screen name="Triggers" component={TriggersScreen} />
          <Stack.Screen name="Breathing" component={BreathingScreen} />
          <Stack.Screen name="Visualization" component={VisualizationScreen} />
          <Stack.Screen name="Bodyweight" component={BodyWeightScreen} />
          <Stack.Screen name="Register" component={RegisterScreen} />
          <Stack.Screen name="VeganRecipes" component={VeganRecipesScreen} />
          <Stack.Screen name="WorkoutComplete" component={WorkoutCompleteScreen} />
          <Stack.Screen name="WorkoutDetail" component={WorkoutDetailScreen} />
          <Stack.Screen name="MealDetail" component={MealDetail} />
          <Stack.Screen name="DailyQuiz" component={DailyQuiz} />
          <Stack.Screen name="MathChallenge" component={MathChallenge} />
          <Stack.Screen name="PatternGame" component={PatternGame} />
          <Stack.Screen name="ReactionGame" component={ReactionGame} />
          <Stack.Screen name="WordChain" component={WordChain} />
          <Stack.Screen name="WordPuzzle" component={WordPuzzle} />
          <Stack.Screen name="MealList" component={MealList} />
        </Stack.Navigator>
      </View>
    </NavigationContainer>
  );
};

export default Navigation;