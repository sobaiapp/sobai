import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  SafeAreaView,
  FlatList,
  Image,
  ActivityIndicator
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useNavigation } from '@react-navigation/native';

// Mock data for vegan recipes
const VEGAN_RECIPES = [
  {
    id: '1',
    name: 'Chickpea Curry',
    image: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c',
    calories: 420,
    protein: 18,
    carbs: 58,
    fat: 12,
    prepTime: '20 mins',
    cookTime: '25 mins',
    servings: 4,
    ingredients: [
      '2 cans chickpeas',
      '1 onion, diced',
      '3 cloves garlic',
      '1 can coconut milk',
      '2 tbsp curry powder'
    ],
    instructions: [
      'Sauté onion and garlic',
      'Add spices and toast for 1 minute',
      'Add chickpeas and coconut milk',
      'Simmer for 20 minutes'
    ]
  },
  {
    id: '2',
    name: 'Quinoa Buddha Bowl',
    image: 'https://images.unsplash.com/photo-1490645935967-10de6ba17061',
    calories: 380,
    protein: 15,
    carbs: 52,
    fat: 14,
    prepTime: '15 mins',
    cookTime: '20 mins',
    servings: 2,
    ingredients: [
      '1 cup cooked quinoa',
      '1 avocado',
      '1 cup roasted sweet potato',
      '1/2 cup chickpeas',
      '2 cups mixed greens'
    ],
    instructions: [
      'Cook quinoa according to package',
      'Roast sweet potatoes',
      'Assemble all ingredients in bowl',
      'Top with tahini dressing'
    ]
  },
  {
    id: '3',
    name: 'Vegan Tacos',
    image: 'https://images.unsplash.com/photo-1551504734-5ee1c4a1479b',
    calories: 320,
    protein: 12,
    carbs: 42,
    fat: 10,
    prepTime: '15 mins',
    cookTime: '10 mins',
    servings: 3,
    ingredients: [
      '6 corn tortillas',
      '1 cup black beans',
      '1 cup diced tomatoes',
      '1 avocado',
      '1/2 cup vegan cheese'
    ],
    instructions: [
      'Warm tortillas',
      'Mash black beans with spices',
      'Assemble tacos with all ingredients',
      'Top with lime juice'
    ]
  },
  {
    id: '4',
    name: 'Lentil Soup',
    image: 'https://images.unsplash.com/photo-1547592180-85f173990554',
    calories: 280,
    protein: 16,
    carbs: 38,
    fat: 6,
    prepTime: '10 mins',
    cookTime: '35 mins',
    servings: 6,
    ingredients: [
      '1 cup dried lentils',
      '1 onion',
      '2 carrots',
      '3 cloves garlic',
      '6 cups vegetable broth'
    ],
    instructions: [
      'Sauté vegetables',
      'Add lentils and broth',
      'Simmer for 30 minutes',
      'Season to taste'
    ]
  },
  {
    id: '5',
    name: 'Avocado Toast',
    image: 'https://images.unsplash.com/photo-1512058564366-18510be2db19',
    calories: 220,
    protein: 6,
    carbs: 22,
    fat: 14,
    prepTime: '5 mins',
    cookTime: '5 mins',
    servings: 1,
    ingredients: [
      '2 slices whole grain bread',
      '1 avocado',
      '1 tbsp lemon juice',
      'Red pepper flakes',
      'Salt and pepper'
    ],
    instructions: [
      'Toast bread',
      'Mash avocado with lemon juice',
      'Spread on toast',
      'Season with salt, pepper, and chili flakes'
    ]
  }
];

const VeganRecipesScreen = () => {
  const navigation = useNavigation();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate loading data
    const timer = setTimeout(() => {
      setLoading(false);
    }, 1000);
    
    return () => clearTimeout(timer);
  }, []);

  const renderRecipeItem = ({ item }) => (
    <TouchableOpacity 
      style={styles.recipeCard}
      onPress={() => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        navigation.navigate('RecipeDetail', { recipe: item });
      }}
    >
      <Image source={{ uri: item.image }} style={styles.recipeImage} />
      <View style={styles.recipeInfo}>
        <Text style={styles.recipeName}>{item.name}</Text>
        <View style={styles.nutritionRow}>
          <View style={styles.nutritionItem}>
            <Ionicons name="flame" size={16} color="#FF6B6B" />
            <Text style={styles.nutritionText}>{item.calories} cal</Text>
          </View>
          <View style={styles.nutritionItem}>
            <Ionicons name="barbell" size={16} color="#4ECDC4" />
            <Text style={styles.nutritionText}>{item.protein}g protein</Text>
          </View>
          <View style={styles.nutritionItem}>
            <Ionicons name="time" size={16} color="#FFD166" />
            <Text style={styles.nutritionText}>{item.prepTime}</Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#4CAF50" />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity 
            onPress={() => navigation.goBack()}
            style={styles.backButton}
          >
            <Ionicons name="chevron-back" size={28} color="#000" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Vegan Recipes</Text>
          <View style={styles.headerRight} />
        </View>

        {/* Content */}
        <FlatList
          data={VEGAN_RECIPES}
          renderItem={renderRecipeItem}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
        />
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
  content: {
    padding: 15,
    paddingBottom: 30,
  },
  recipeCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 5,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
    overflow: 'hidden',
  },
  recipeImage: {
    width: '100%',
    height: 180,
    resizeMode: 'cover',
  },
  recipeInfo: {
    padding: 15,
  },
  recipeName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 10,
  },
  nutritionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  nutritionItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  nutritionText: {
    fontSize: 14,
    color: '#555',
    marginLeft: 5,
  },
});

export default VeganRecipesScreen;