import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  Alert,
  SafeAreaView,
  Modal,
  ScrollView,
  Dimensions,
  Platform
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useNavigation } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';

const { width, height } = Dimensions.get('window');

const MealList = ({ route }) => {
  const { category, apiCategory } = route.params;
  const [meals, setMeals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedMeal, setSelectedMeal] = useState(null);
  const [recipeDetails, setRecipeDetails] = useState(null);
  const navigation = useNavigation();

  useEffect(() => {
    fetchMeals();
  }, [apiCategory]);

  useEffect(() => {
    if (selectedMeal) {
      fetchRecipeDetails(selectedMeal.idMeal);
    }
  }, [selectedMeal]);

  const fetchMeals = async () => {
    try {
      setLoading(true);
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
      setLoading(false);
    }
  };

  const fetchRecipeDetails = async (mealId) => {
    try {
      const response = await fetch(`https://www.themealdb.com/api/json/v1/1/lookup.php?i=${mealId}`);
      const data = await response.json();
      if (data.meals && data.meals.length > 0) {
        setRecipeDetails(data.meals[0]);
      }
    } catch (error) {
      console.error('Error fetching recipe details:', error);
    }
  };

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

  const handleMealPress = (meal) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setSelectedMeal(meal);
  };

  const handleCloseModal = () => {
    setSelectedMeal(null);
    setRecipeDetails(null);
  };

  const renderMealItem = ({ item }) => (
    <TouchableOpacity
      style={styles.mealCard}
      onPress={() => handleMealPress(item)}
    >
      <Image
        source={{ uri: item.strMealThumb }}
        style={styles.mealImage}
      />
      <View style={styles.mealInfo}>
        <Text style={styles.mealName}>{item.strMeal}</Text>
        <Text style={styles.mealCategory}>{item.strCategory}</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient
        colors={['#f5f5f5', '#e0e0e0']}
        style={styles.gradient}
      >
        <View style={styles.header}>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="arrow-back" size={24} color="#000" />
          </TouchableOpacity>
          <Text style={styles.title}>{category}</Text>
        </View>

        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#000" />
          </View>
        ) : (
          <FlatList
            data={meals}
            renderItem={renderMealItem}
            keyExtractor={(item) => item.idMeal}
            contentContainerStyle={styles.listContainer}
            numColumns={2}
            ListEmptyComponent={() => (
              <View style={styles.emptyContainer}>
                <Text style={styles.emptyText}>No recipes found</Text>
              </View>
            )}
          />
        )}

        <Modal
          visible={!!selectedMeal}
          transparent={true}
          animationType="slide"
          onRequestClose={handleCloseModal}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContainer}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>{selectedMeal?.strMeal}</Text>
                <TouchableOpacity onPress={handleCloseModal}>
                  <Ionicons name="close" size={24} color="#000" />
                </TouchableOpacity>
              </View>
              <ScrollView style={styles.modalScroll}>
                <Image 
                  source={{ uri: selectedMeal?.strMealThumb }} 
                  style={styles.modalImage}
                />
                <View style={styles.modalBody}>
                  {recipeDetails ? (
                    <>
                      <Text style={styles.sectionTitle}>Ingredients:</Text>
                      {getIngredients(recipeDetails).map((item, index) => (
                        <Text key={index} style={styles.ingredientText}>
                          • {item.measure} {item.ingredient}
                        </Text>
                      ))}
                      <Text style={styles.sectionTitle}>Instructions:</Text>
                      <Text style={styles.instructionsText}>
                        {recipeDetails.strInstructions}
                      </Text>
                    </>
                  ) : (
                    <ActivityIndicator size="large" color="#000" style={styles.loader} />
                  )}
                </View>
              </ScrollView>
            </View>
          </View>
        </Modal>
      </LinearGradient>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  gradient: {
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
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  backButton: {
    marginRight: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#000',
  },
  listContainer: {
    padding: 16,
  },
  mealCard: {
    flex: 1,
    margin: 8,
    backgroundColor: '#fff',
    borderRadius: 12,
    overflow: 'hidden',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  mealImage: {
    width: '100%',
    height: 150,
    resizeMode: 'cover',
  },
  mealInfo: {
    padding: 12,
  },
  mealName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
  },
  mealCategory: {
    fontSize: 14,
    color: '#666',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContainer: {
    width: '100%',
    height: '90%',
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#000',
  },
  modalScroll: {
    flex: 1,
  },
  modalImage: {
    width: '100%',
    height: 200,
    resizeMode: 'cover',
  },
  modalBody: {
    padding: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000',
    marginTop: 16,
    marginBottom: 8,
  },
  ingredientText: {
    fontSize: 16,
    color: '#333',
    marginBottom: 4,
  },
  instructionsText: {
    fontSize: 16,
    color: '#333',
    lineHeight: 24,
  },
  loader: {
    marginVertical: 20,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
});

export default MealList; 