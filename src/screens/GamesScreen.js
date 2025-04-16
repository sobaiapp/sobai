import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet,
  TouchableOpacity, 
  ScrollView, 
  Platform,
  StatusBar,
  SafeAreaView
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';
import { LinearGradient } from 'expo-linear-gradient';

const GamesScreen = ({ navigation }) => {
  const { user } = useAuth();
  const [selectedCategory, setSelectedCategory] = useState('all');

  const games = [
    {
      id: '1',
      title: 'Sobriety Quiz',
      description: 'Test your knowledge about recovery and sobriety',
      icon: 'help-circle',
      color: '#000000',
      category: 'quiz',
      route: 'DailyQuiz'
    },
    {
      id: '2',
      title: 'Trigger Words',
      description: 'Identify and manage trigger words and situations',
      icon: 'warning',
      color: '#000000',
      category: 'puzzle',
      route: 'WordPuzzle'
    },
    {
      id: '3',
      title: 'Milestone Memory',
      description: 'Match sobriety milestones and achievements',
      icon: 'trophy',
      color: '#000000',
      category: 'memory',
      route: 'MemoryGame'
    },
    {
      id: '4',
      title: 'Coping Skills',
      description: 'Practice healthy coping mechanisms',
      icon: 'heart',
      color: '#000000',
      category: 'math',
      route: 'MathChallenge'
    },
    {
      id: '5',
      title: 'Pattern Recognition',
      description: 'Identify patterns in recovery journey',
      icon: 'git-branch',
      color: '#000000',
      category: 'puzzle',
      route: 'PatternGame'
    },
    {
      id: '6',
      title: 'Affirmation Chain',
      description: 'Build positive affirmations and mantras',
      icon: 'chatbubble',
      color: '#000000',
      category: 'word',
      route: 'WordChain'
    },
    {
      id: '7',
      title: 'Quick Response',
      description: 'Practice quick responses to challenging situations',
      icon: 'flash',
      color: '#000000',
      category: 'reaction',
      route: 'ReactionGame'
    }
  ];

  const categories = [
    { id: 'all', name: 'All Games' },
    { id: 'quiz', name: 'Knowledge' },
    { id: 'puzzle', name: 'Triggers' },
    { id: 'memory', name: 'Milestones' },
    { id: 'math', name: 'Coping' },
    { id: 'word', name: 'Affirmations' },
    { id: 'reaction', name: 'Practice' }
  ];

  const filteredGames = selectedCategory === 'all' 
    ? games 
    : games.filter(game => game.category === selectedCategory);

  const renderGameCard = (game) => (
    <TouchableOpacity
      key={game.id}
      style={styles.gameCard}
      onPress={() => navigation.navigate(game.route)}
      activeOpacity={0.9}
    >
      <View style={styles.gameIconContainer}>
        <Ionicons name={game.icon} size={24} color="#000" />
      </View>
      <View style={styles.gameInfo}>
        <Text style={styles.gameTitle}>{game.title}</Text>
        <Text style={styles.gameDescription}>{game.description}</Text>
      </View>
      <View style={styles.playButton}>
        <Text style={styles.playButtonText}>Play</Text>
        <Ionicons name="chevron-forward" size={20} color="#000" />
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <LinearGradient
        colors={['#ffffff', '#f8f8f8']}
        style={styles.headerGradient}
      >
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Games</Text>
          <Text style={styles.headerSubtitle}>Train your mind with these games</Text>
        </View>

        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          style={styles.categoriesContainer}
          contentContainerStyle={styles.categoriesContent}
        >
          {categories.map(category => (
          <TouchableOpacity 
              key={category.id}
              style={[
                styles.categoryButton,
                selectedCategory === category.id && styles.selectedCategory
              ]}
              onPress={() => setSelectedCategory(category.id)}
                activeOpacity={0.8}
              >
              <Text style={[
                styles.categoryText,
                selectedCategory === category.id && styles.selectedCategoryText
              ]}>
                {category.name}
              </Text>
              </TouchableOpacity>
            ))}
        </ScrollView>
      </LinearGradient>

      <ScrollView 
        style={styles.gamesContainer}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.gamesContent}
      >
        {filteredGames.map(renderGameCard)}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  headerGradient: {
    paddingTop: Platform.OS === 'ios' ? 0 : StatusBar.currentHeight,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  header: {
    paddingHorizontal: 20,
    paddingVertical: 20,
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#666',
  },
  categoriesContainer: {
    maxHeight: 50,
    marginBottom: 20,
  },
  categoriesContent: {
    paddingHorizontal: 20,
  },
  categoryButton: {
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
    backgroundColor: '#f5f5f5',
  },
  selectedCategory: {
    backgroundColor: '#000',
  },
  categoryText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
  },
  selectedCategoryText: {
    color: '#fff',
  },
  gamesContainer: {
    flex: 1,
  },
  gamesContent: {
    padding: 20,
  },
  gameCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  gameIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
    backgroundColor: '#f5f5f5',
  },
  gameInfo: {
    flex: 1,
  },
  gameTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000',
    marginBottom: 4,
  },
  gameDescription: {
    fontSize: 14,
    color: '#666',
  },
  playButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#f5f5f5',
  },
  playButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#000',
    marginRight: 4,
  },
});

export default GamesScreen;