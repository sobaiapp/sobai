import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Image,
  ActivityIndicator,
  RefreshControl,
  TouchableOpacity,
  Platform
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';
import { 
  databases,
  Query,
  DATABASE_ID,
  ACHIEVEMENTS_COLLECTION_ID,
  STATS_COLLECTION_ID
} from '../services/appwrite';

const AchievementsScreen = ({ navigation }) => {
  const { user } = useAuth();
  const [achievements, setAchievements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [stats, setStats] = useState(null);

  const loadStats = async () => {
    try {
      const response = await databases.listDocuments(
        DATABASE_ID,
        STATS_COLLECTION_ID,
        [Query.equal('userId', user.$id)]
      );
      if (response.documents.length > 0) {
        setStats(response.documents[0]);
      }
    } catch (error) {
      console.error('Error loading stats:', error);
    }
  };

  const loadAchievements = async () => {
    try {
      setLoading(true);
      await loadStats();
      
      const response = await databases.listDocuments(
        DATABASE_ID,
        ACHIEVEMENTS_COLLECTION_ID,
        [Query.equal('userId', user.$id)]
      );

      if (response.documents.length > 0) {
        setAchievements(response.documents);
      } else {
        // Create initial achievements based on stats
        const daysSober = stats?.daysSober || 0;
        const newAchievements = [];

        // Define achievement milestones
        const milestones = [
          { days: 1, title: 'First Day', description: 'Congratulations on your first day of sobriety!', icon: '🎉' },
          { days: 7, title: 'One Week', description: 'You\'ve completed your first week! Keep going!', icon: '🌟' },
          { days: 30, title: 'One Month', description: 'Amazing! You\'ve reached one month of sobriety!', icon: '🏆' },
          { days: 90, title: 'Three Months', description: 'Incredible! Three months of sobriety achieved!', icon: '💪' },
          { days: 180, title: 'Six Months', description: 'Half a year of sobriety! You\'re unstoppable!', icon: '🔥' },
          { days: 365, title: 'One Year', description: 'Congratulations on one year of sobriety!', icon: '🎊' }
        ];

        // Create achievements for completed milestones
        for (const milestone of milestones) {
          if (daysSober >= milestone.days) {
            newAchievements.push({
              userId: user.$id,
              title: milestone.title,
              description: milestone.description,
              icon: milestone.icon,
              dateEarned: new Date().toISOString(),
              milestone: milestone.days
            });
          }
        }

        // Save new achievements
        if (newAchievements.length > 0) {
          const promises = newAchievements.map(achievement => 
            databases.createDocument(
              DATABASE_ID,
              ACHIEVEMENTS_COLLECTION_ID,
              'unique()',
              achievement
            )
          );
          const results = await Promise.all(promises);
          setAchievements(results);
        } else {
          setAchievements([]);
        }
      }
    } catch (error) {
      console.error('Error loading achievements:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAchievements();
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadAchievements();
    setRefreshing(false);
  };

  const renderAchievementItem = ({ item }) => (
    <View style={styles.achievementItem}>
      <View style={styles.achievementIconContainer}>
        <Text style={styles.achievementIcon}>{item.icon || '🏆'}</Text>
      </View>
      <View style={styles.achievementContent}>
        <Text style={styles.achievementTitle}>{item.title}</Text>
        <Text style={styles.achievementDescription}>{item.description}</Text>
        <Text style={styles.achievementDate}>
          Earned on {new Date(item.dateEarned).toLocaleDateString()}
        </Text>
      </View>
    </View>
  );

  if (loading && !refreshing) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#000" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Achievements</Text>
      </View>

      <FlatList
        data={achievements}
        renderItem={renderAchievementItem}
        keyExtractor={item => item.$id}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={['#000']}
          />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No achievements yet</Text>
            <Text style={styles.emptySubtext}>Keep working on your journey to earn achievements!</Text>
          </View>
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  backButton: {
    position: 'absolute',
    left: 16,
    top: Platform.OS === 'ios' ? 60 : 40,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#000',
    textAlign: 'center',
  },
  listContent: {
    padding: 16,
  },
  achievementItem: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#eee',
  },
  achievementIconContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  achievementIcon: {
    fontSize: 24,
  },
  achievementContent: {
    flex: 1,
  },
  achievementTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
    marginBottom: 4,
  },
  achievementDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  achievementDate: {
    fontSize: 12,
    color: '#999',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000',
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
});

export default AchievementsScreen; 