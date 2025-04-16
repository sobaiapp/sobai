import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  StatusBar,
  Image,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import * as Haptics from 'expo-haptics';

const { width } = Dimensions.get('window');

const MEAL_OPTIONS = {
  'Vegan': [
    { 
      id: '1', 
      name: 'Tofu Scramble', 
      calories: 320, 
      protein: 20, 
      carbs: 15, 
      fat: 18, 
      image: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80' 
    },
    { 
      id: '2', 
      name: 'Chickpea Curry', 
      calories: 450, 
      protein: 18, 
      carbs: 60, 
      fat: 12, 
      image: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80' 
    },
    { 
      id: '3', 
      name: 'Vegan Buddha Bowl', 
      calories: 380, 
      protein: 15, 
      carbs: 45, 
      fat: 14, 
      image: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80' 
    },
  ],
  'Meats': [
    { 
      id: '1', 
      name: 'Grilled Chicken', 
      calories: 280, 
      protein: 35, 
      carbs: 0, 
      fat: 12, 
      image: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80' 
    },
    { 
      id: '2', 
      name: 'Beef Steak', 
      calories: 350, 
      protein: 40, 
      carbs: 0, 
      fat: 20, 
      image: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80' 
    },
    { 
      id: '3', 
      name: 'Salmon Fillet', 
      calories: 320, 
      protein: 30, 
      carbs: 0, 
      fat: 18, 
      image: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80' 
    },
  ],
  'Grains': [
    { 
      id: '1', 
      name: 'Quinoa Bowl', 
      calories: 350, 
      protein: 12, 
      carbs: 45, 
      fat: 8, 
      image: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80' 
    },
    { 
      id: '2', 
      name: 'Brown Rice', 
      calories: 220, 
      protein: 5, 
      carbs: 45, 
      fat: 2, 
      image: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80' 
    },
    { 
      id: '3', 
      name: 'Whole Wheat Pasta', 
      calories: 200, 
      protein: 8, 
      carbs: 40, 
      fat: 1, 
      image: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80' 
    },
  ],
  'Vegetables': [
    { 
      id: '1', 
      name: 'Roasted Vegetables', 
      calories: 120, 
      protein: 3, 
      carbs: 15, 
      fat: 5, 
      image: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80' 
    },
    { 
      id: '2', 
      name: 'Steamed Broccoli', 
      calories: 55, 
      protein: 4, 
      carbs: 11, 
      fat: 1, 
      image: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80' 
    },
    { 
      id: '3', 
      name: 'Mixed Salad', 
      calories: 80, 
      protein: 2, 
      carbs: 10, 
      fat: 4, 
      image: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80' 
    },
  ],
  'Fruits': [
    { 
      id: '1', 
      name: 'Fruit Salad', 
      calories: 150, 
      protein: 2, 
      carbs: 35, 
      fat: 1, 
      image: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80' 
    },
    { 
      id: '2', 
      name: 'Apple Slices', 
      calories: 95, 
      protein: 0, 
      carbs: 25, 
      fat: 0, 
      image: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80' 
    },
    { 
      id: '3', 
      name: 'Berry Mix', 
      calories: 70, 
      protein: 1, 
      carbs: 15, 
      fat: 0, 
      image: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80' 
    },
  ],
  'Dairy': [
    { 
      id: '1', 
      name: 'Greek Yogurt', 
      calories: 100, 
      protein: 17, 
      carbs: 6, 
      fat: 0, 
      image: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80' 
    },
    { 
      id: '2', 
      name: 'Cottage Cheese', 
      calories: 120, 
      protein: 14, 
      carbs: 4, 
      fat: 5, 
      image: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80' 
    },
    { 
      id: '3', 
      name: 'Milk', 
      calories: 150, 
      protein: 8, 
      carbs: 12, 
      fat: 8, 
      image: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80' 
    },
  ],
  'Fats': [
    { 
      id: '1', 
      name: 'Avocado Toast', 
      calories: 250, 
      protein: 8, 
      carbs: 30, 
      fat: 12, 
      image: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80' 
    },
    { 
      id: '2', 
      name: 'Nuts Mix', 
      calories: 180, 
      protein: 6, 
      carbs: 6, 
      fat: 16, 
      image: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80' 
    },
    { 
      id: '3', 
      name: 'Olive Oil Dressing', 
      calories: 120, 
      protein: 0, 
      carbs: 0, 
      fat: 14, 
      image: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80' 
    },
  ],
};

const MealDetail = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { category } = route.params;
  const [selectedMeal, setSelectedMeal] = useState(null);
  const [isMealModalVisible, setIsMealModalVisible] = useState(false);

  const handleMealSelect = (meal) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setSelectedMeal(meal);
    setIsMealModalVisible(true);
  };

  const renderMealCard = (meal) => (
    <TouchableOpacity
      key={meal.id}
      style={styles.mealCard}
      onPress={() => handleMealSelect(meal)}
    >
      <Image source={{ uri: meal.image }} style={styles.mealImage} />
      <View style={styles.mealInfo}>
        <Text style={styles.mealName}>{meal.name}</Text>
        <Text style={styles.mealCalories}>{meal.calories} kcal</Text>
        <View style={styles.nutritionInfo}>
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
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" />
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="chevron-back" size={24} color="#000" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>{category} Meals</Text>
          <View style={styles.headerRight} />
        </View>

        <ScrollView style={styles.content}>
          <View style={styles.mealList}>
            {MEAL_OPTIONS[category]?.map(renderMealCard)}
          </View>
        </ScrollView>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#fff',
  },
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#000',
  },
  headerRight: {
    width: 40,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  mealList: {
    gap: 16,
  },
  mealCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  mealImage: {
    width: '100%',
    height: 200,
    resizeMode: 'cover',
  },
  mealInfo: {
    padding: 16,
  },
  mealName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000',
    marginBottom: 4,
  },
  mealCalories: {
    fontSize: 14,
    color: '#666',
    marginBottom: 12,
  },
  nutritionInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  nutritionItem: {
    alignItems: 'center',
  },
  nutritionLabel: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
  },
  nutritionValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#000',
  },
});

export default MealDetail; 