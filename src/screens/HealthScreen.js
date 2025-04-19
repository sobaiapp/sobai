import React, { useEffect, useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  SafeAreaView,
  FlatList,
  ActivityIndicator,
  Modal,
  TextInput,
  Alert,
} from 'react-native';

import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import DaysSoberCard from '../components/DaysSoberCard';
import { useAuth } from '../context/AuthContext';
import { getUserProfile } from '../services/appwrite';
import { Pedometer } from 'expo-sensors';

const TABS = ['Stats', 'Workouts', 'Meals', 'Insights'];

// Enhanced mock data
const WORKOUT_CATEGORIES = [
  { id: '1', name: 'Bodyweight', icon: 'body' },
  { id: '2', name: 'Strength', icon: 'barbell' },
  { id: '3', name: 'Cardio', icon: 'walk' },
  { id: '4', name: 'HIIT', icon: 'speedometer' },
  { id: '5', name: 'Stretching', icon: 'fitness' },
  { id: '6', name: 'Mobility', icon: 'move' },
  { id: '7', name: 'Yoga', icon: 'flower' },
  { id: '8', name: 'Plyometrics', icon: 'jump' },
  { id: '9', name: 'Core', icon: 'ellipse' },
];

// Update MEAL_CATEGORIES with API mapping
const MEAL_CATEGORIES = [
  { id: '1', name: 'Vegan', icon: 'leaf', apiCategory: 'Vegan' },
  { id: '2', name: 'Beef', icon: 'nutrition', apiCategory: 'Beef' },
  { id: '3', name: 'Dessert', icon: 'ice-cream', apiCategory: 'Dessert' },
  { id: '4', name: 'Vegetarian', icon: 'leaf', apiCategory: 'Vegetarian' },
  { id: '5', name: 'Pasta', icon: 'bread', apiCategory: 'Pasta' },
  { id: '6', name: 'Dairy', icon: 'ice-cream', apiCategory: 'Dessert' },
  { id: '7', name: 'Seafood', icon: 'fish', apiCategory: 'Seafood' },
  { id: '8', name: 'Breakfast', icon: 'water', apiCategory: 'Breakfast' },
  { id: '9', name: 'Misc', icon: 'cafe', apiCategory: 'Miscellaneous' }
];

const INSIGHTS = [
  { 
    id: '1', 
    title: 'Sleep Quality', 
    content: 'Your sleep quality has improved by 15% this week compared to last week.',
    icon: 'moon'
  },
  { 
    id: '2', 
    title: 'Activity Level', 
    content: 'You\'ve been consistently active for 5 days in a row. Keep it up!',
    icon: 'stats-chart'
  },
  { 
    id: '3', 
    title: 'Nutrition Balance', 
    content: 'Your protein intake is good, but try adding more vegetables to your meals.',
    icon: 'nutrition'
  },
  { 
    id: '4', 
    title: 'Heart Health', 
    content: 'Your resting heart rate has decreased by 3 BPM this month.',
    icon: 'heart'
  },
  { 
    id: '5', 
    title: 'Hydration', 
    content: 'You\'ve met your daily water goal 4 out of 7 days this week.',
    icon: 'water'
  },
];

/*const MEAL_OPTIONS = {
  'Vegan': [
    { name: 'Tofu Scramble', calories: 320, protein: 20, carbs: 15, fat: 18 },
    { name: 'Chickpea Curry', calories: 450, protein: 18, carbs: 60, fat: 12 },
    { name: 'Vegan Buddha Bowl', calories: 380, protein: 15, carbs: 45, fat: 14 },
  ],
  'Meats': [
    { name: 'Grilled Chicken', calories: 280, protein: 35, carbs: 0, fat: 12 },
    { name: 'Beef Steak', calories: 350, protein: 40, carbs: 0, fat: 20 },
    { name: 'Salmon Fillet', calories: 320, protein: 30, carbs: 0, fat: 18 },
  ],
  'Fruits': [
    { name: 'Fruit Salad', calories: 150, protein: 2, carbs: 35, fat: 0 },
    { name: 'Smoothie Bowl', calories: 280, protein: 8, carbs: 45, fat: 5 },
    { name: 'Apple with Peanut Butter', calories: 200, protein: 6, carbs: 25, fat: 10 },
  ],
  'Vegetables': [
    { name: 'Roasted Vegetables', calories: 180, protein: 5, carbs: 25, fat: 8 },
    { name: 'Stir Fry', calories: 220, protein: 8, carbs: 30, fat: 10 },
    { name: 'Salad Bowl', calories: 150, protein: 6, carbs: 20, fat: 5 },
  ],
  'Grains': [
    { name: 'Quinoa Bowl', calories: 320, protein: 12, carbs: 45, fat: 8 },
    { name: 'Brown Rice', calories: 220, protein: 5, carbs: 45, fat: 2 },
    { name: 'Oatmeal', calories: 150, protein: 5, carbs: 25, fat: 3 },
  ],
  'Dairy': [
    { name: 'Greek Yogurt', calories: 120, protein: 15, carbs: 8, fat: 5 },
    { name: 'Cottage Cheese', calories: 100, protein: 12, carbs: 4, fat: 3 },
    { name: 'Cheese Plate', calories: 280, protein: 15, carbs: 2, fat: 22 },
  ],
  'Seafood': [
    { name: 'Protein Shake', calories: 200, protein: 30, carbs: 15, fat: 5 },
    { name: 'Egg Whites', calories: 100, protein: 20, carbs: 0, fat: 0 },
    { name: 'Protein Bar', calories: 220, protein: 20, carbs: 25, fat: 8 },
  ],
  'Smoothies': [
    { name: 'Green Smoothie', calories: 180, protein: 5, carbs: 30, fat: 5 },
    { name: 'Berry Blast', calories: 220, protein: 8, carbs: 35, fat: 6 },
    { name: 'Protein Smoothie', calories: 280, protein: 25, carbs: 30, fat: 8 },
  ],
  'Snacks': [
    { name: 'Trail Mix', calories: 160, protein: 5, carbs: 15, fat: 10 },
    { name: 'Protein Balls', calories: 120, protein: 8, carbs: 12, fat: 6 },
    { name: 'Veggie Chips', calories: 140, protein: 2, carbs: 20, fat: 7 },
  ],
};*/

const HealthScreen = () => {
  const navigation = useNavigation();
  const { user } = useAuth();
  const [selectedTab, setSelectedTab] = useState('Stats');
  const [healthStats, setHealthStats] = useState({
    daysSober: 0,
    stepsToday: 0,
    heartRate: 0,
    caloriesBurned: 0,
    sleepHours: 0,
    waterIntake: 0,
    connectHealth: 0,
  });
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState(null);
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [stepCount, setStepCount] = useState(0);
  const [pedometerAvailable, setPedometerAvailable] = useState(false);
  const [selectedMealCategory, setSelectedMealCategory] = useState(null);
  const [isMealModalVisible, setIsMealModalVisible] = useState(false);
  const [meals, setMeals] = useState([]);
  const [loadingMeals, setLoadingMeals] = useState(false);
  const [insights, setInsights] = useState([]);

  useEffect(() => {
    loadProfile();
    checkPedometerAvailability();
  }, []);

  // Add a focus effect to refresh health data when the screen is focused
  useFocusEffect(
    React.useCallback(() => {
      if (pedometerAvailable) {
        startStepCounter();
      }
    }, [pedometerAvailable])
  );

  const checkPedometerAvailability = async () => {
    try {
      const isAvailable = await Pedometer.isAvailableAsync();
      setPedometerAvailable(isAvailable);
      setIsAuthorized(isAvailable);
      
      if (isAvailable) {
        startStepCounter();
      }
    } catch (error) {
      console.error('Error checking pedometer availability:', error);
    }
  };

  const startStepCounter = async () => {
    try {
      if (pedometerAvailable) {
        const subscription = Pedometer.watchStepCount(result => {
          setStepCount(result.steps);
          updateHealthStats(result.steps);
        });
        return () => subscription.remove();
      }
    } catch (error) {
      console.error('Error starting step counter:', error);
    }
  };

  const generateInsights = () => {
    const newInsights = [];
    
    // Sleep Quality Insight
    if (healthStats.sleepHours > 0) {
      const sleepQuality = healthStats.sleepHours >= 7 ? 'good' : 'needs improvement';
      newInsights.push({
        id: '1',
        title: 'Sleep Quality',
        content: `Your average sleep duration is ${healthStats.sleepHours.toFixed(1)} hours. ${sleepQuality === 'good' ? 'Great job maintaining healthy sleep habits!' : 'Try to aim for 7-9 hours of sleep for optimal recovery.'}`,
        icon: 'moon',
        type: 'sleep'
      });
    }

    // Activity Level Insight
    if (healthStats.stepsToday > 0) {
      const activityLevel = healthStats.stepsToday >= 10000 ? 'active' : 'moderate';
      newInsights.push({
        id: '2',
        title: 'Activity Level',
        content: `You've taken ${healthStats.stepsToday.toLocaleString()} steps today. ${activityLevel === 'active' ? 'Excellent activity level!' : 'Try to reach 10,000 steps for optimal health benefits.'}`,
        icon: 'stats-chart',
        type: 'activity'
      });
    }

    // Heart Health Insight
    if (healthStats.heartRate > 0) {
      const heartHealth = healthStats.heartRate < 80 ? 'good' : 'elevated';
      newInsights.push({
        id: '3',
        title: 'Heart Health',
        content: `Your current heart rate is ${healthStats.heartRate} BPM. ${heartHealth === 'good' ? 'Your heart rate is in a healthy range.' : 'Consider adding more cardio exercises to improve heart health.'}`,
        icon: 'heart',
        type: 'heart'
      });
    }

    // Hydration Insight
    if (healthStats.waterIntake > 0) {
      const hydrationLevel = healthStats.waterIntake >= 2.5 ? 'good' : 'needs improvement';
      newInsights.push({
        id: '4',
        title: 'Hydration',
        content: `You've consumed ${healthStats.waterIntake.toFixed(1)}L of water today. ${hydrationLevel === 'good' ? 'Great job staying hydrated!' : 'Try to drink at least 2.5L of water daily.'}`,
        icon: 'water',
        type: 'hydration'
      });
    }

    // Recovery Progress Insight
    if (healthStats.daysSober > 0) {
      newInsights.push({
        id: '5',
        title: 'Recovery Progress',
        content: `You've been sober for ${healthStats.daysSober} days. Your commitment to health and wellness is showing in your daily activities.`,
        icon: 'trophy',
        type: 'recovery'
      });
    }

    setInsights(newInsights);
  };

  const updateHealthStats = (steps) => {
    // Calculate estimated calories based on steps (rough estimate: 1 step = 0.04 calories)
    const estimatedCalories = Math.round(steps * 0.04);
    
    // Calculate estimated distance in meters (rough estimate: 1 step = 0.762 meters)
    const estimatedDistance = Math.round(steps * 0.762);
    
    // Update health stats with real step data and estimated values for other metrics
    setHealthStats({
      ...healthStats,
      stepsToday: steps || 0,
      heartRate: 72, // Default value
      caloriesBurned: estimatedCalories || 0,
      sleepHours: 7.5, // Default value
      waterIntake: 2.5, // Default value in liters
      connectHealth: pedometerAvailable ? 'Connected' : 'Not Connected'
    });
    generateInsights();
  };

  const loadProfile = async () => {
    try {
      if (user) {
        const userProfile = await getUserProfile(user.$id);
        setProfile(userProfile);
      }
        } catch (error) {
      console.error('Error loading profile:', error);
        } finally {
          setLoading(false);
        }
      };

  const renderWorkoutCategory = ({ item }) => (
    <TouchableOpacity 
      style={styles.categoryCard}
      onPress={() => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        navigation.navigate('WorkoutDetail', { category: item.name });
      }}
    >
      <Ionicons name={item.icon} size={24} color="#000" />
      <Text style={styles.categoryTitle}>{item.name}</Text>
    </TouchableOpacity>
  );

  // Function to fetch meals from TheMealDB API
  const fetchMealsByCategory = async (category) => {
    try {
      setLoadingMeals(true);
      const apiCategory = MEAL_CATEGORIES.find(cat => cat.name === category)?.apiCategory;
      if (!apiCategory) return;

      const response = await fetch(`https://www.themealdb.com/api/json/v1/1/filter.php?c=${apiCategory}`);
      const data = await response.json();
      
      if (data.meals) {
        const detailedMeals = await Promise.all(
          data.meals.map(async (meal) => {
            const detailResponse = await fetch(`https://www.themealdb.com/api/json/v1/1/lookup.php?i=${meal.idMeal}`);
            const detailData = await detailResponse.json();
            return {
              ...meal,
              ...detailData.meals[0],
              ingredients: getIngredients(detailData.meals[0])
            };
          })
        );
        setMeals(detailedMeals);
      } else {
        setMeals([]);
      }
    } catch (error) {
      console.error('Error fetching meals:', error);
      Alert.alert('Error', 'Failed to fetch meals. Please try again.');
    } finally {
      setLoadingMeals(false);
    }
  };

  // Helper function to extract ingredients from meal data
  const getIngredients = (meal) => {
    const ingredients = [];
    for (let i = 1; i <= 20; i++) {
      const ingredient = meal[`strIngredient${i}`];
      const measure = meal[`strMeasure${i}`];
      if (ingredient && ingredient.trim() !== '') {
        ingredients.push({
          ingredient,
          measure: measure || ''
        });
      }
    }
    return ingredients;
  };

  const renderMealCategory = ({ item }) => (
    <TouchableOpacity 
      style={styles.categoryCard}
      onPress={() => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        navigation.navigate('MealList', { 
          category: item.name,
          apiCategory: item.apiCategory 
        });
      }}
    >
      <Ionicons name={item.icon} size={24} color="#000" />
      <Text style={styles.categoryTitle}>{item.name}</Text>
    </TouchableOpacity>
  );

  const renderInsight = ({ item }) => (
    <View style={styles.insightCard}>
      <View style={styles.insightHeader}>
        <Ionicons name={item.icon} size={24} color="#4A90E2" />
        <Text style={styles.insightTitle}>{item.title}</Text>
      </View>
      <Text style={styles.insightContent}>{item.content}</Text>
      <View style={styles.insightFooter}>
        <Text style={styles.insightType}>{item.type.toUpperCase()}</Text>
        <Text style={styles.insightTime}>Updated just now</Text>
      </View>
    </View>
  );

  const renderStatCard = (value, label, icon) => (
    <View style={styles.statCard}>
      <Ionicons name={icon} size={24} color="#000" style={styles.statIcon} />
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );

  const HealthMetricCard = ({ icon, title, value, unit }) => (
    <View style={styles.metricCard}>
      <Ionicons name={icon} size={24} color="#4A90E2" />
      <Text style={styles.metricTitle}>{title}</Text>
      <Text style={styles.metricValue}>
        {value} {unit}
      </Text>
    </View>
  );

  const renderMealModal = () => (
    <Modal
      animationType="slide"
      transparent={true}
      visible={isMealModalVisible}
      onRequestClose={() => setIsMealModalVisible(false)}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>{selectedMealCategory?.name} Meals</Text>
            <TouchableOpacity 
              style={styles.closeButton}
              onPress={() => setIsMealModalVisible(false)}
            >
              <Ionicons name="close" size={24} color="#000" />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalScrollView}>
            {selectedMealCategory && MEAL_OPTIONS[selectedMealCategory.name] && (
              <View style={styles.mealOptions}>
                {MEAL_OPTIONS[selectedMealCategory.name].map((meal, index) => (
                  <TouchableOpacity
                    key={index}
                    style={styles.mealOption}
                    onPress={() => {
                      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                      // Handle meal selection
                      setIsMealModalVisible(false);
                    }}
                  >
                    <View style={styles.mealInfo}>
                      <Text style={styles.mealName}>{meal.name}</Text>
                      <Text style={styles.mealCalories}>{meal.calories} kcal</Text>
                    </View>
                    <View style={styles.mealNutrition}>
                      <View style={styles.nutritionItem}>
                        <Text style={styles.nutritionLabel}>Protein</Text>
                        <Text style={styles.nutritionValue}>{meal.protein}g</Text>
                      </View>
                      <View style={styles.nutritionItem}>
                        <Text style={styles.nutritionLabel}>Carbs</Text>
                        <Text style={styles.nutritionValue}>{meal.carbs}g</Text>
                      </View>
                      <View style={styles.nutritionItem}>
                        <Text style={styles.nutritionLabel}>Fat</Text>
                        <Text style={styles.nutritionValue}>{meal.fat}g</Text>
                      </View>
                    </View>
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#000" />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        {/* Header with Back Button */}
        <View style={styles.header}>
          <TouchableOpacity 
            onPress={() => navigation.goBack()}
            style={styles.backButton}
          >
            <Ionicons name="chevron-back" size={28} color="#000" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Health Dashboard</Text>
          <View style={styles.headerRight} />
        </View>

        {/* Tab Navigation */}
        <View style={styles.tabContainer}>
          {TABS.map((tab) => (
            <TouchableOpacity
              key={tab}
              style={[styles.tab, selectedTab === tab && styles.activeTab]}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                setSelectedTab(tab);
              }}
            >
              <Text style={[styles.tabText, selectedTab === tab && styles.activeTabText]}>{tab}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Content */}
        <ScrollView contentContainerStyle={styles.content}>
          {selectedTab === 'Stats' && (
            <View style={styles.statsContainer}>
              <DaysSoberCard showDatePicker={false} />
              
              {!pedometerAvailable && (
                <TouchableOpacity 
                  style={styles.connectHealthButton}
                  onPress={checkPedometerAvailability}
                >
                  <Ionicons name="footsteps" size={24} color="#FFFFFF" />
                  <Text style={styles.connectHealthText}>Connect Step Counter</Text>
                </TouchableOpacity>
              )}
              
              <View style={styles.statsGrid}>
                {renderStatCard(healthStats.stepsToday.toLocaleString(), 'Steps Today', 'footsteps')}
                {renderStatCard(`${healthStats.heartRate} BPM`, 'Heart Rate', 'heart')}
                {renderStatCard(`${healthStats.caloriesBurned.toLocaleString()} kcal`, 'Calories Burned', 'flame')}
                {renderStatCard(`${healthStats.sleepHours.toFixed(1)} hrs`, 'Sleep', 'moon')}
                {renderStatCard(`${healthStats.waterIntake.toFixed(1)} L`, 'Water Intake', 'water')}
                {renderStatCard(healthStats.connectHealth, 'Health Status', 'checkmark-circle')}
              </View>
            </View>
          )}

          {selectedTab === 'Workouts' && (
            <View style={styles.tabContent}>
              <Text style={styles.sectionTitle}>Workout Categories</Text>
              <FlatList
                data={WORKOUT_CATEGORIES}
                renderItem={renderWorkoutCategory}
                keyExtractor={item => item.id}
                numColumns={3}
                columnWrapperStyle={styles.categoryRow}
                scrollEnabled={false}
              />
            </View>
          )}

          {selectedTab === 'Meals' && (
            <View style={styles.tabContent}>
              <Text style={styles.sectionTitle}>Meal Categories</Text>
              <FlatList
                data={MEAL_CATEGORIES}
                renderItem={renderMealCategory}
                keyExtractor={item => item.id}
                numColumns={3}
                columnWrapperStyle={styles.categoryRow}
                scrollEnabled={false}
              />
            </View>
          )}

          {selectedTab === 'Insights' && (
            <View style={styles.tabContent}>
              <Text style={styles.sectionTitle}>Health Insights</Text>
              <FlatList
                data={insights}
                renderItem={renderInsight}
                keyExtractor={item => item.id}
                scrollEnabled={false}
              />
            </View>
          )}
        </ScrollView>
      </View>
      {renderMealModal()}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#fff',
    marginTop: -13

  },
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  backButton: {
    padding: 5,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#000',
  },
  headerRight: {
    width: 28,
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  tab: {
    flex: 1,
    paddingVertical: 15,
    alignItems: 'center',
  },
  activeTab: {
    borderBottomWidth: 3,
    borderBottomColor: '#000',
  },
  tabText: {
    fontSize: 16,
    color: '#555',
  },
  activeTabText: {
    color: '#000',
    fontWeight: '600',
  },
  content: {
    padding: 15,
    paddingBottom: 30,
  },
  statsContainer: {
    flex: 1,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginTop: 15,
  },
  statCard: {
    width: '48%',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 15,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 5,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
    alignItems: 'center',
  },
  statIcon: {
    marginBottom: 10,
  },
  statValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 5,
  },
  statLabel: {
    fontSize: 14,
    color: '#555',
  },
  tabContent: {
    flex: 1,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 15,
  },
  categoryRow: {
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  categoryCard: {
    width: '32%',
    aspectRatio: 1,
    backgroundColor: '#fff',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 5,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
    marginBottom: 10,
  },
  categoryTitle: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
    marginTop: 8,
  },
  insightCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 15,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 5,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
  },
  insightHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  insightTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#000',
    marginLeft: 10,
  },
  insightContent: {
    fontSize: 14,
    color: '#555',
    lineHeight: 20,
  },
  insightFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 10,
  },
  insightType: {
    fontSize: 12,
    color: '#6c757d',
  },
  insightTime: {
    fontSize: 12,
    color: '#6c757d',
  },
  metricCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 15,
    width: '48%',
    marginBottom: 15,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  metricTitle: {
    fontSize: 14,
    color: '#666666',
    marginTop: 8,
  },
  metricValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333333',
    marginTop: 4,
  },
  connectHealthButton: {
    backgroundColor: '#4A90E2',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 15,
    borderRadius: 12,
    marginVertical: 15,
  },
  connectHealthText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 10,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#000',
  },
  closeButton: {
    padding: 8,
  },
  modalScrollView: {
    flex: 1,
  },
  mealOptions: {
    gap: 16,
  },
  mealOption: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  mealInfo: {
    marginBottom: 12,
  },
  mealName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
    marginBottom: 4,
  },
  mealCalories: {
    fontSize: 14,
    color: '#6c757d',
  },
  mealNutrition: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  nutritionItem: {
    alignItems: 'center',
  },
  nutritionLabel: {
    fontSize: 12,
    color: '#6c757d',
    marginBottom: 4,
  },
  nutritionValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#000',
  },
});

export default HealthScreen;