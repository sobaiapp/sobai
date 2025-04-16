import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Alert,
  Platform,
  FlatList,
  SafeAreaView,
} from 'react-native';
import { Ionicons, Feather } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';
import { 
  databases,
  Query,
  DATABASE_ID,
  PROFILES_COLLECTION_ID,
  STATS_COLLECTION_ID,
  ACHIEVEMENTS_COLLECTION_ID,
  POSTS_COLLECTION_ID
} from '../services/appwrite';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

const FriendProfile = ({ navigation, route }) => {
  const { friendId } = route.params;
  const { user } = useAuth();
  const [friendProfile, setFriendProfile] = useState(null);
  const [friendStats, setFriendStats] = useState(null);
  const [friendAchievements, setFriendAchievements] = useState([]);
  const [friendPosts, setFriendPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isFriend, setIsFriend] = useState(false);

  useEffect(() => {
    loadFriendData();
  }, [friendId]);

  const loadFriendData = async () => {
    try {
      setLoading(true);
      
      // Load friend's profile
      const profileResponse = await databases.listDocuments(
        DATABASE_ID,
        PROFILES_COLLECTION_ID,
        [Query.equal('userId', friendId)]
      );

      if (profileResponse.documents.length > 0) {
        const profile = profileResponse.documents[0];
        setFriendProfile(profile);
        
        // Check if they are friends
        const currentUserProfile = await databases.listDocuments(
          DATABASE_ID,
          PROFILES_COLLECTION_ID,
          [Query.equal('userId', user.$id)]
        );
        
        if (currentUserProfile.documents.length > 0) {
          const currentUser = currentUserProfile.documents[0];
          setIsFriend(currentUser.friends?.includes(friendId) || false);
        }

        // Load friend's stats
        const statsResponse = await databases.listDocuments(
          DATABASE_ID,
          STATS_COLLECTION_ID,
          [Query.equal('userId', friendId)]
        );

        if (statsResponse.documents.length > 0) {
          setFriendStats(statsResponse.documents[0]);
        }

        // Load friend's achievements
        const achievementsResponse = await databases.listDocuments(
          DATABASE_ID,
          ACHIEVEMENTS_COLLECTION_ID,
          [Query.equal('userId', friendId)]
        );

        setFriendAchievements(achievementsResponse.documents);

        // Load friend's posts
        const postsResponse = await databases.listDocuments(
          DATABASE_ID,
          POSTS_COLLECTION_ID,
          [
            Query.equal('userId', friendId),
            Query.orderDesc('$createdAt')
          ]
        );

        setFriendPosts(postsResponse.documents);
      }
    } catch (error) {
      console.error('Error loading friend data:', error);
      Alert.alert('Error', 'Failed to load friend profile');
    } finally {
      setLoading(false);
    }
  };

  const handleAddFriend = async () => {
    try {
      // Add friend to current user's friends list
      const currentUserProfile = await databases.listDocuments(
        DATABASE_ID,
        PROFILES_COLLECTION_ID,
        [Query.equal('userId', user.$id)]
      );

      if (currentUserProfile.documents.length > 0) {
        const currentUser = currentUserProfile.documents[0];
        const updatedFriends = [...(currentUser.friends || []), friendId];
        
        await databases.updateDocument(
          DATABASE_ID,
          PROFILES_COLLECTION_ID,
          currentUser.$id,
          { friends: updatedFriends }
        );

        setIsFriend(true);
        Alert.alert('Success', 'Friend added successfully');
      }
    } catch (error) {
      console.error('Error adding friend:', error);
      Alert.alert('Error', 'Failed to add friend');
    }
  };

  const handleRemoveFriend = async () => {
    try {
      // Remove friend from current user's friends list
      const currentUserProfile = await databases.listDocuments(
        DATABASE_ID,
        PROFILES_COLLECTION_ID,
        [Query.equal('userId', user.$id)]
      );

      if (currentUserProfile.documents.length > 0) {
        const currentUser = currentUserProfile.documents[0];
        const updatedFriends = (currentUser.friends || []).filter(id => id !== friendId);
        
        await databases.updateDocument(
          DATABASE_ID,
          PROFILES_COLLECTION_ID,
          currentUser.$id,
          { friends: updatedFriends }
        );

        setIsFriend(false);
        Alert.alert('Success', 'Friend removed successfully');
      }
    } catch (error) {
      console.error('Error removing friend:', error);
      Alert.alert('Error', 'Failed to remove friend');
    }
  };

  const calculateDaysSober = (cleanDate) => {
    if (!cleanDate) return 0;
    const clean = new Date(cleanDate);
    const today = new Date();
    const diffTime = Math.abs(today - clean);
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  const renderPost = ({ item }) => (
    <View style={styles.postCard}>
      <View style={styles.postHeader}>
        <Image
          source={{ uri: friendProfile.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(friendProfile.name || '')}&background=random` }}
          style={styles.postAvatar}
        />
        <View style={styles.postHeaderInfo}>
          <Text style={styles.postName}>{friendProfile.name || 'Anonymous'}</Text>
          <Text style={styles.postDate}>
            {new Date(item.$createdAt).toLocaleDateString()}
          </Text>
        </View>
      </View>
      <Text style={styles.postContent}>{item.content}</Text>
      <View style={styles.postActions}>
        <TouchableOpacity style={styles.postActionButton}>
          <Ionicons name="heart-outline" size={20} color="#666" />
          <Text style={styles.postActionText}>{item.likes || 0}</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.postActionButton}>
          <Ionicons name="chatbubble-outline" size={20} color="#666" />
          <Text style={styles.postActionText}>{item.comments?.length || 0}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#000" />
      </View>
    );
  }

  if (!friendProfile) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Profile not found</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color="#000" />
        </TouchableOpacity>
        <View style={styles.headerTitleContainer}>
          <Text style={styles.headerTitle}>{friendProfile?.name || 'Friend Profile'}</Text>
        </View>
        <View style={styles.backButton} />
      </View>

      <ScrollView style={styles.content}>
        <View style={styles.profileSection}>
          <Image
            source={{ uri: friendProfile.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(friendProfile.name || '')}&background=random` }}
            style={styles.profileImage}
          />
          <Text style={styles.name}>{friendProfile.name || 'Anonymous'}</Text>
          <Text style={styles.email}>{friendProfile.email}</Text>
          
          {!isFriend ? (
            <TouchableOpacity 
              style={styles.addFriendButton}
              onPress={handleAddFriend}
            >
              <Ionicons name="person-add" size={20} color="#fff" />
              <Text style={styles.addFriendButtonText}>Add Friend</Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity 
              style={styles.removeFriendButton}
              onPress={handleRemoveFriend}
            >
              <Ionicons name="person-remove" size={20} color="#fff" />
              <Text style={styles.removeFriendButtonText}>Remove Friend</Text>
            </TouchableOpacity>
          )}
        </View>

        <View style={styles.statsSection}>
          <View style={styles.statCard}>
            <View style={styles.statIconContainer}>
              <Ionicons name="calendar" size={24} color="#007AFF" />
            </View>
            <Text style={styles.statValue}>{calculateDaysSober(friendProfile.cleanDate)}</Text>
            <Text style={styles.statLabel}>Days Sober</Text>
          </View>
          <View style={styles.statCard}>
            <View style={styles.statIconContainer}>
              <Ionicons name="trophy" size={24} color="#34C759" />
            </View>
            <Text style={styles.statValue}>{friendStats?.successRate || 0}%</Text>
            <Text style={styles.statLabel}>Success Rate</Text>
          </View>
          <View style={styles.statCard}>
            <View style={styles.statIconContainer}>
              <Ionicons name="checkmark-circle" size={24} color="#FF9500" />
            </View>
            <Text style={styles.statValue}>{friendStats?.totalCheckIns || 0}</Text>
            <Text style={styles.statLabel}>Check-ins</Text>
          </View>
        </View>

        {friendProfile.cleanDate && (
          <View style={styles.infoCard}>
            <Text style={styles.infoTitle}>Clean Since</Text>
            <Text style={styles.infoValue}>
              {new Date(friendProfile.cleanDate).toLocaleDateString()}
            </Text>
          </View>
        )}

        {friendProfile.bio && (
          <View style={styles.infoCard}>
            <Text style={styles.infoTitle}>About</Text>
            <Text style={styles.infoValue}>{friendProfile.bio}</Text>
          </View>
        )}

        <View style={styles.achievementsSection}>
          <Text style={styles.sectionTitle}>Achievements</Text>
          {friendAchievements.length > 0 ? (
            <View style={styles.achievementsGrid}>
              {friendAchievements.map(achievement => (
                <View key={achievement.$id} style={styles.achievementCard}>
                  <Text style={styles.achievementIcon}>{achievement.icon || '🏆'}</Text>
                  <Text style={styles.achievementTitle}>{achievement.title}</Text>
                  <Text style={styles.achievementDate}>
                    {new Date(achievement.dateEarned).toLocaleDateString()}
                  </Text>
                </View>
              ))}
            </View>
          ) : (
            <Text style={styles.emptyText}>No achievements yet</Text>
          )}
        </View>

        <View style={styles.wallSection}>
          <Text style={styles.sectionTitle}>Wall</Text>
          {friendPosts.length > 0 ? (
            <FlatList
              data={friendPosts}
              renderItem={renderPost}
              keyExtractor={item => item.$id}
              scrollEnabled={false}
              contentContainerStyle={styles.postsList}
            />
          ) : (
            <Text style={styles.emptyText}>No posts yet</Text>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
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
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    fontSize: 16,
    color: '#666',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  headerTitleContainer: {
    flex: 1,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000',
  },
  backButton: {
    width: 24,
    height: 24,
  },
  content: {
    flex: 1,
  },
  profileSection: {
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  profileImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
    marginBottom: 16,
    borderWidth: 2,
    borderColor: '#000',
  },
  name: {
    fontSize: 24,
    fontWeight: '600',
    color: '#000',
    marginBottom: 4,
  },
  email: {
    fontSize: 16,
    color: '#666',
    marginBottom: 16,
  },
  addFriendButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#000',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    marginTop: 8,
  },
  addFriendButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  removeFriendButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FF3B30',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    marginTop: 8,
  },
  removeFriendButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  statsSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 16,
    backgroundColor: '#fff',
    marginTop: 8,
  },
  statCard: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: '#f8f8f8',
    borderRadius: 12,
    padding: 16,
    marginHorizontal: 4,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  statIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(0, 122, 255, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  statValue: {
    fontSize: 24,
    fontWeight: '700',
    color: '#000',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
  infoCard: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
    marginBottom: 8,
  },
  infoValue: {
    fontSize: 14,
    color: '#666',
  },
  achievementsSection: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000',
    marginBottom: 16,
  },
  achievementsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  achievementCard: {
    width: '48%',
    backgroundColor: '#f8f8f8',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    alignItems: 'center',
  },
  achievementIcon: {
    fontSize: 24,
    marginBottom: 8,
  },
  achievementTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#000',
    textAlign: 'center',
    marginBottom: 4,
  },
  achievementDate: {
    fontSize: 12,
    color: '#666',
  },
  emptyText: {
    textAlign: 'center',
    color: '#666',
    marginTop: 8,
  },
  wallSection: {
    padding: 20,
  },
  postsList: {
    paddingBottom: 20,
  },
  postCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#eee',
  },
  postHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  postAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
  },
  postHeaderInfo: {
    flex: 1,
  },
  postName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
  },
  postDate: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  postContent: {
    fontSize: 14,
    color: '#333',
    lineHeight: 20,
    marginBottom: 12,
  },
  postActions: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: '#eee',
    paddingTop: 12,
  },
  postActionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 20,
  },
  postActionText: {
    fontSize: 14,
    color: '#666',
    marginLeft: 4,
  },
});

export default FriendProfile; 