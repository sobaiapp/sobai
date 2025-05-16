// src/screens/ProfileScreen.js
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  FlatList,
  ActivityIndicator,
  Alert,
  Platform,
  RefreshControl,
  TextInput
} from 'react-native';
import { Ionicons, Feather } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { 
  getUserProfile,
  logoutUser,
  uploadProfilePicture,
  updateUserProfile,
  searchUsers,
  sendFriendRequest,
  acceptFriendRequest,
  rejectFriendRequest,
  removeFriend,
  getFriendRequests,
  createUserProfile,
  getMessages,
  databases,
  Query,
  DATABASE_ID,
  MESSAGES_COLLECTION_ID,
  Permission,
  Role,
  ID,
  PROFILES_COLLECTION_ID,
  STATS_COLLECTION_ID,
  ACHIEVEMENTS_COLLECTION_ID,
  POSTS_COLLECTION_ID,
  verifySession,
  account
} from '../services/appwrite';
import { useAuth } from '../context/AuthContext';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

const ProfileScreen = ({ navigation, route }) => {
  const { user, profile, loading: authLoading, error: authError, updateProfile, loadUserData: loadAuthUserData } = useAuth();
  const [activeTab, setActiveTab] = useState('friends');
  const [friends, setFriends] = useState([]);
  const [milestones, setMilestones] = useState([]);
  const [messages, setMessages] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const [recentActivity, setRecentActivity] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [friendRequests, setFriendRequests] = useState([]);
  const [showSearch, setShowSearch] = useState(false);
  const [localProfile, setLocalProfile] = useState(null);
  const [stats, setStats] = useState(null);
  const [achievements, setAchievements] = useState([]);
  const [posts, setPosts] = useState([]);
  const [newPost, setNewPost] = useState('');
  const [isPosting, setIsPosting] = useState(false);

  // Check session on mount and when user changes
  useEffect(() => {
    const checkSession = async () => {
      try {
        console.log('Checking session...');
        // Test Appwrite connection first
        try {
          const currentUser = await account.get();
          console.log('Current user:', currentUser);
        } catch (error) {
          console.error('Appwrite connection error:', error);
          setError('Failed to connect to Appwrite. Please check your internet connection.');
          return;
        }

        const isSessionValid = await verifySession();
        console.log('Session valid:', isSessionValid);
        if (!isSessionValid) {
          console.log('Session invalid, redirecting to Start screen');
          navigation.reset({
            index: 0,
            routes: [{ name: 'Start' }]
          });
          return;
        }
        if (user) {
          console.log('User found, loading profile data...');
          // Reset all state when user changes
          setLocalProfile(null);
          setFriends([]);
          setFriendRequests([]);
          setMessages([]);
          setPosts([]);
          setStats(null);
          setAchievements([]);
          loadProfileData();
        } else {
          console.log('No user found in state');
        }
      } catch (error) {
        console.error('Session verification error:', error);
        navigation.reset({
          index: 0,
          routes: [{ name: 'Start' }]
        });
      }
    };
    checkSession();
  }, [user]);

  // Handle profile updates from EditProfile screen
  useEffect(() => {
    if (route.params?.updatedProfile) {
      updateProfile(route.params.updatedProfile);
    }
  }, [route.params]);

  const loadProfileData = async () => {
    if (!user) {
      console.log('No user found');
      setError('No user found. Please log in again.');
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // Log IDs and user
      console.log('Loading profile data with:');
      console.log('- DATABASE_ID:', DATABASE_ID);
      console.log('- PROFILES_COLLECTION_ID:', PROFILES_COLLECTION_ID);
      console.log('- User ID:', user.$id);
      console.log('- User object:', user);

      // Reset all state when loading new profile
      setLocalProfile(null);
      setFriends([]);
      setFriendRequests([]);
      setMessages([]);
      setPosts([]);
      setStats(null);
      setAchievements([]);

      console.log('Fetching profile from database...');
      let profileResponse;
      try {
        profileResponse = await databases.listDocuments(
          DATABASE_ID,
          PROFILES_COLLECTION_ID,
          [Query.equal('userId', user.$id)]
        );
        console.log('Profile response:', profileResponse);
      } catch (fetchError) {
        console.error('Error fetching profile:', fetchError);
        console.error('Error details:', {
          message: fetchError.message,
          code: fetchError.code,
          type: fetchError.type,
          response: fetchError.response
        });
        setError('Failed to fetch profile. Please check your network or permissions.');
        setLoading(false);
        return;
      }

      let profile = profileResponse.documents[0];
      console.log('Found profile:', profile);

      if (!profile) {
        try {
          console.log('No profile found, creating new one...');
          // Create a new profile if one doesn't exist
          profile = await databases.createDocument(
            DATABASE_ID,
            PROFILES_COLLECTION_ID,
            'unique()',
            {
              userId: user.$id,
              name: user.name,
              email: user.email,
              createdAt: new Date().toISOString()
            }
          );
          console.log('Created new profile:', profile);
        } catch (createError) {
          console.error('Error creating profile:', createError);
          console.error('Error details:', {
            message: createError.message,
            code: createError.code,
            type: createError.type,
            response: createError.response
          });
          setError('Failed to create profile. Please check your permissions.');
          setLoading(false);
          return;
        }
      }

      setLocalProfile(profile);
      updateProfile(profile);
      console.log('Profile set in state');

      // Load other data in parallel
      console.log('Loading additional profile data...');
      try {
        const [
          friendRequestsData,
          friendsData,
          messagesData,
          statsData,
          achievementsData,
          postsData
        ] = await Promise.all([
          getFriendRequests(user.$id),
          databases.listDocuments(DATABASE_ID, PROFILES_COLLECTION_ID, [
            Query.equal('friends', user.$id)
          ]),
          getMessages(user.$id),
          databases.listDocuments(DATABASE_ID, STATS_COLLECTION_ID, [
            Query.equal('userId', user.$id)
          ]),
          databases.listDocuments(DATABASE_ID, ACHIEVEMENTS_COLLECTION_ID, [
            Query.equal('userId', user.$id)
          ]),
          databases.listDocuments(DATABASE_ID, POSTS_COLLECTION_ID, [
            Query.equal('userId', user.$id)
          ])
        ]);

        console.log('Additional data loaded:');
        console.log('- Friend requests:', friendRequestsData);
        console.log('- Friends:', friendsData.documents);
        console.log('- Messages:', messagesData);
        console.log('- Stats:', statsData.documents[0]);
        console.log('- Achievements:', achievementsData.documents);
        console.log('- Posts:', postsData.documents);

        setFriendRequests(friendRequestsData);
        setFriends(friendsData.documents);
        setMessages(messagesData);
        setStats(statsData.documents[0] || null);
        setAchievements(achievementsData.documents);
        setPosts(postsData.documents);
      } catch (otherDataError) {
        console.error('Error loading additional profile data:', otherDataError);
        console.error('Error details:', {
          message: otherDataError.message,
          code: otherDataError.code,
          type: otherDataError.type,
          response: otherDataError.response
        });
        setError('Failed to load additional profile data. Some features may not work.');
      }
    } catch (error) {
      console.error('Error loading profile data:', error);
      console.error('Error details:', {
        message: error.message,
        code: error.code,
        type: error.type,
        response: error.response
      });
      setError('Failed to load profile data. Please try again.');
    } finally {
      setLoading(false);
      console.log('Profile loading complete');
    }
  };

  // Show loading indicator while either auth or profile data is loading
  if (authLoading || loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#000" />
      </View>
    );
  }

  // Show error if there's an auth error
  if (authError) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>{authError}</Text>
        <TouchableOpacity
          style={styles.button}
          onPress={() => navigation.navigate('Start')}
        >
          <Text style={styles.buttonText}>Go to Login</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // Show error if there's no user
  if (!user) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Please log in to view your profile</Text>
        <TouchableOpacity
          style={styles.button}
          onPress={() => navigation.navigate('Start')}
        >
          <Text style={styles.buttonText}>Go to Login</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const onRefresh = () => {
    setRefreshing(true);
    loadProfileData();
  };

  const handleLogout = async () => {
    try {
      await logoutUser();
      navigation.reset({
        index: 0,
        routes: [{ name: 'Start' }]
      });
    } catch (error) {
      Alert.alert('Logout Failed', error.message);
    }
  };

  const pickImage = async () => {
    if (Platform.OS !== 'web') {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission required', 'We need camera roll permissions to upload photos');
        return;
      }
    }

    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled) {
        await uploadImage(result.assets[0].uri);
      }
    } catch (error) {
      console.error('Image picker error:', error);
      Alert.alert('Error', 'Failed to pick image');
    }
  };

  const uploadImage = async (uri) => {
    try {
      if (!user || !user.$id) {
        throw new Error('User not available. Please log in again.');
      }
  
      setUploading(true);
      
      const file = {
        uri,
        name: `profile_${user.$id}.jpg`,
        type: 'image/jpeg'
      };
  
      const newAvatarUrl = await uploadProfilePicture(user.$id, file);
      
      // Update the profile in context
      const updatedProfile = { ...localProfile, avatar: newAvatarUrl };
      updateProfile(updatedProfile);
      
      Alert.alert('Success', 'Profile picture updated!');
    } catch (error) {
      console.error('Upload error:', error);
      Alert.alert('Error', error.message || 'Failed to upload profile picture');
    } finally {
      setUploading(false);
    }
  };

  const navigateToEditProfile = () => {
    navigation.navigate('EditProfile', { 
      profile: localProfile,
      onUpdate: (updatedData) => {
        // Update in context
        const updatedProfile = { ...localProfile, ...updatedData };
        updateProfile(updatedProfile);
        // Update in database
        updateUserProfile(user.$id, updatedData);
      }
    });
  };

  const renderFriendItem = ({ item }) => (
    <TouchableOpacity 
      style={styles.friendCircleContainer}
      onPress={() => navigation.navigate('FriendProfile', { friendId: item.userId })}
    >
      <Image 
        source={{ uri: item.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(item.name || 'User')}&background=random` }} 
        style={styles.friendCircleAvatar} 
      />
      <Text style={styles.friendCircleName} numberOfLines={1}>
        {item.name || 'Unknown User'}
      </Text>
    </TouchableOpacity>
  );

  const renderMilestoneItem = ({ item }) => (
    <View style={[styles.card, !item.achieved && styles.pendingCard]}>
      <View style={styles.cardContent}>
        <View style={styles.milestoneHeader}>
          <Text style={styles.cardTitle}>{item.title}</Text>
          {item.achieved ? (
            <Feather name="check-circle" size={20} color="#4CAF50" />
          ) : (
            <Feather name="clock" size={20} color="#888" />
          )}
        </View>
        <Text style={styles.cardSubtitle}>
          {item.achieved 
            ? `Completed on ${new Date(item.achieved).toLocaleDateString()}`
            : `Created on ${new Date(item.date).toLocaleDateString()}`
          }
        </Text>
      </View>
    </View>
  );

  const renderActivityItem = ({ item }) => (
    <View style={styles.activityItem}>
      <Feather 
        name={item.type === 'check-in' ? 'check-circle' : 
              item.type === 'post' ? 'message-circle' : 'user'} 
        size={18} 
        color="#000" 
      />
      <Text style={styles.activityText}>{item.text}</Text>
      {item.time ? <Text style={styles.activityTime}>{item.time}</Text> : null}
    </View>
  );

  const renderMessageItem = ({ item }) => {
    const isFromMe = item.fromUserId === user.$id;
    const otherUser = item.otherUser;
    
    // Generate fallback avatar URL if no avatar is set
    const avatarUrl = otherUser?.avatar 
      ? otherUser.avatar 
      : `https://ui-avatars.com/api/?name=${encodeURIComponent(otherUser?.name || 'User')}&background=FFD700`;
    
    return (
      <TouchableOpacity 
        style={styles.messageItem}
        onPress={() => navigation.navigate('Message', { friendId: otherUser.userId })}
      >
        <View style={styles.messageAvatarContainer}>
        <Image 
            source={{ uri: avatarUrl }} 
          style={styles.messageAvatar} 
        />
        </View>
        <View style={styles.messageContent}>
          <Text style={styles.messageName}>{otherUser?.name || 'Unknown User'}</Text>
          <Text style={styles.messageText} numberOfLines={2}>
            {isFromMe ? 'You: ' : ''}{item.text}
          </Text>
          <Text style={styles.messageTime}>
            {new Date(item.createdAt).toLocaleString([], {
              hour: '2-digit',
              minute: '2-digit',
              month: 'short',
              day: 'numeric'
            })}
          </Text>
        </View>
        <Ionicons 
          name="chevron-forward" 
          size={20} 
          color="#999" 
          style={styles.messageArrow}
        />
      </TouchableOpacity>
    );
  };

  const renderTabContent = () => {
    switch(activeTab) {
      case 'friends':
        return (
          <View style={styles.friendsContainer}>
            {friends.length > 0 ? (
          <FlatList
            data={friends}
                renderItem={({ item }) => (
                  <TouchableOpacity 
                    style={styles.friendCircleContainer}
                    onPress={() => navigation.navigate('FriendProfile', { friendId: item.userId })}
                  >
                    <Image 
                      source={{ uri: item.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(item.name || 'User')}&background=random` }} 
                      style={styles.friendCircleAvatar} 
                    />
                    <Text style={styles.friendCircleName} numberOfLines={1}>
                      {item.name || 'Unknown User'}
                    </Text>
                  </TouchableOpacity>
                )}
            keyExtractor={item => item.$id}
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.friendsList}
          />
            ) : (
              <Text style={styles.emptyStateText}>No friends yet</Text>
            )}
          </View>
        );
      case 'milestones':
        return milestones.length > 0 ? (
          <FlatList
            data={milestones}
            renderItem={renderMilestoneItem}
            keyExtractor={item => item.$id}
            scrollEnabled={false}
            contentContainerStyle={styles.listContent}
          />
        ) : (
          <Text style={styles.emptyStateText}>No milestones yet</Text>
        );
      case 'messages':
        return messages.length > 0 ? (
          <FlatList
            data={messages}
            renderItem={renderMessageItem}
            keyExtractor={item => item.$id}
            scrollEnabled={false}
            contentContainerStyle={styles.listContent}
          />
        ) : (
          <Text style={styles.emptyStateText}>No messages yet</Text>
        );
      default:
        return null;
    }
  };

  const handleSearch = async (query) => {
    setSearchQuery(query);
    if (query.length < 2) {
      setSearchResults([]);
      return;
    }
    
    try {
      console.log('Starting search with query:', query);
      const results = await searchUsers(query);
      console.log('Raw search results:', results);
      
      // Filter out current user
      const filteredResults = results.filter(result => result.$id !== user.$id);
      console.log('Filtered search results:', filteredResults);
      
      setSearchResults(filteredResults);
    } catch (error) {
      console.error('Search error:', error);
      Alert.alert('Error', 'Failed to search users');
    }
  };

  const handleSendFriendRequest = async (friendId) => {
    try {
      await sendFriendRequest(user.$id, friendId);
      Alert.alert('Success', 'Friend request sent!');
      setSearchResults(searchResults.filter(result => result.$id !== friendId));
    } catch (error) {
      console.error('Friend request error:', error);
      Alert.alert('Error', 'Failed to send friend request');
    }
  };

  const handleAcceptFriendRequest = async (requestId) => {
    try {
      console.log('Starting friend request acceptance process for request:', requestId);
      
      // Get the friend request details first
      const request = friendRequests.find(r => r.$id === requestId);
      if (!request) {
        throw new Error('Friend request not found');
      }
      
      console.log('Found friend request:', request);
      
      // Accept the friend request with all required parameters
      await acceptFriendRequest(
        requestId,
        request.fromUserId,
        request.toUserId
      );
      
      // Reload user data to update friends list
      await loadProfileData();
      
      // Update friend requests state
      setFriendRequests(friendRequests.filter(r => r.$id !== requestId));
      
      Alert.alert('Success', 'Friend request accepted!');
    } catch (error) {
      console.error('Accept friend request error:', error);
      Alert.alert('Error', 'Failed to accept friend request. Please try again.');
    }
  };

  const handleRejectFriendRequest = async (requestId) => {
    try {
      await rejectFriendRequest(requestId);
      setFriendRequests(friendRequests.filter(request => request.$id !== requestId));
      Alert.alert('Success', 'Friend request rejected');
    } catch (error) {
      console.error('Reject friend request error:', error);
      Alert.alert('Error', 'Failed to reject friend request');
    }
  };

  const handleRemoveFriend = async (friendId) => {
    Alert.alert(
      'Remove Friend',
      'Are you sure you want to remove this friend?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: async () => {
            try {
              await removeFriend(user.$id, friendId);
              setFriends(friends.filter(friend => friend.$id !== friendId));
              Alert.alert('Success', 'Friend removed');
            } catch (error) {
              console.error('Remove friend error:', error);
              Alert.alert('Error', 'Failed to remove friend');
            }
          }
        }
      ]
    );
  };

  const renderSearchResult = ({ item }) => {
    if (!item) return null;

    console.log('Rendering search result:', item);
    const isFriend = friends.some(friend => friend.$id === item.$id);
    const hasPendingRequest = friendRequests.some(request => 
      (request.fromUserId === item.$id && request.toUserId === user.$id) ||
      (request.fromUserId === user.$id && request.toUserId === item.$id)
    );

    return (
      <TouchableOpacity 
        style={styles.searchResultItem}
        onPress={() => navigation.navigate('FriendProfile', { friendId: item.$id })}
      >
        <Image 
          source={{ 
            uri: item.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(item.name || 'User')}&background=random` 
          }} 
          style={styles.searchResultAvatar} 
        />
        <View style={styles.searchResultInfo}>
          <Text style={styles.searchResultName}>{item.name || 'Unknown User'}</Text>
          <Text style={styles.searchResultEmail}>{item.email || 'No email provided'}</Text>
        </View>
        {!isFriend && !hasPendingRequest && (
          <TouchableOpacity
            style={styles.addFriendButton}
            onPress={() => handleSendFriendRequest(item.$id)}
          >
            <Ionicons name="person-add" size={24} color="#007AFF" />
          </TouchableOpacity>
        )}
        {isFriend && (
          <View style={styles.friendBadge}>
            <Text style={styles.friendBadgeText}>Friends</Text>
          </View>
        )}
        {hasPendingRequest && (
          <View style={styles.pendingBadge}>
            <Text style={styles.pendingBadgeText}>Pending</Text>
          </View>
        )}
      </TouchableOpacity>
    );
  };

  const calculateDaysClean = (cleanDate) => {
    if (!cleanDate) return 0;
    const today = new Date();
    const clean = new Date(cleanDate);
    const diffTime = Math.abs(today - clean);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const handleCreatePost = async () => {
    if (!newPost.trim()) {
      Alert.alert('Error', 'Please enter some text for your post');
      return;
    }

    try {
      setIsPosting(true);
      
      const post = await databases.createDocument(
        DATABASE_ID,
        POSTS_COLLECTION_ID,
        'unique()',
        {
          userId: user.$id,
          content: newPost.trim(),
          likes: 0,
          comments: []
        }
      );

      setPosts([post, ...posts]);
      setNewPost('');
      Alert.alert('Success', 'Post created successfully');
    } catch (error) {
      console.error('Error creating post:', error);
      Alert.alert('Error', 'Failed to create post');
    } finally {
      setIsPosting(false);
    }
  };

  const renderPost = ({ item }) => (
    <View style={styles.postCard}>
      <View style={styles.postHeader}>
        <Image
          source={{ uri: localProfile?.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(localProfile?.name || '')}&background=random` }}
          style={styles.postAvatar}
        />
        <View style={styles.postHeaderInfo}>
          <Text style={styles.postName}>{localProfile?.name || 'Anonymous'}</Text>
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

  const loadMessages = async () => {
    try {
      setLoading(true);
      console.log('Loading messages for user:', user?.$id);
      
      if (!user?.$id) {
        console.log('No user ID available');
        setMessages([]);
        return;
      }

      // Get messages where the user is either the sender or receiver
      const response = await databases.listDocuments(
        DATABASE_ID,
        '67eb25180014d70eed51', // messages collection ID
        [
          Query.equal('senderId', user.$id),
          Query.equal('receiverId', user.$id)
        ]
      );

      console.log('Messages loaded:', response.documents);
      setMessages(response.documents);
    } catch (error) {
      console.error('Error loading messages:', error);
      // If there's an error, set messages to an empty array instead of showing error
      setMessages([]);
    } finally {
      setLoading(false);
    }
  };

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorTitle}>Profile Error</Text>
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity 
          style={styles.retryButton}
          onPress={loadProfileData}
        >
          <Text style={styles.retryButtonText}>Try Again</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <GestureHandlerRootView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color="#000" />
        </TouchableOpacity>
        <View style={styles.headerTitleContainer}>
          <Text style={styles.headerTitle}>Profile</Text>
        </View>
        <TouchableOpacity 
          style={styles.logoutButtonHeader}
          onPress={handleLogout}
        >
          <Ionicons name="log-out-outline" size={24} color="#FF3B30" />
        </TouchableOpacity>
      </View>

    <ScrollView 
        style={styles.content}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
            tintColor="#000"
          />
        }
        showsVerticalScrollIndicator={false}
      >
      <View style={styles.profileSection}>
        <TouchableOpacity onPress={pickImage} disabled={uploading}>
          <View style={styles.profilePicContainer}>
            <Image 
                source={{ uri: localProfile?.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(localProfile?.name || '')}&background=random` }} 
              style={styles.profilePic} 
            />
            {uploading ? (
              <ActivityIndicator style={styles.uploadIndicator} color="#fff" />
            ) : (
              <View style={styles.editIcon}>
                <Feather name="edit" size={16} color="#fff" />
              </View>
            )}
          </View>
        </TouchableOpacity>
          <Text style={styles.name}>{localProfile?.name}</Text>
          <Text style={styles.cleanDays}>{calculateDaysClean(localProfile?.cleanDate)} days clean</Text>
          {localProfile?.bio && <Text style={styles.bio}>{localProfile.bio}</Text>}
      </View>

      <TouchableOpacity 
        style={styles.editProfileButton}
        onPress={navigateToEditProfile}
      >
        <Text style={styles.editProfileButtonText}>Edit Profile</Text>
      </TouchableOpacity>

        <View style={styles.searchContainer}>
          <TouchableOpacity
            style={styles.searchButton}
            onPress={() => setShowSearch(!showSearch)}
          >
            <Ionicons name="search" size={24} color="#007AFF" />
            <Text style={styles.searchButtonText}>
              {showSearch ? 'Hide Search' : 'Search Friends'}
            </Text>
          </TouchableOpacity>

          {showSearch && (
            <View style={styles.searchInputContainer}>
              <TextInput
                style={styles.searchInput}
                placeholder="Search by name or email"
                value={searchQuery}
                onChangeText={handleSearch}
                autoCapitalize="none"
                autoCorrect={false}
              />
              {searchQuery.length > 0 && (
                <Text style={styles.searchStatus}>
                  {searchResults.length > 0 
                    ? `Found ${searchResults.length} results` 
                    : 'No results found'}
                </Text>
              )}
              {searchResults.length > 0 && (
                <View style={styles.searchResults}>
                  {searchResults.map((item, index) => (
                    <View key={item.$id || index}>
                      {renderSearchResult({ item })}
                    </View>
                  ))}
                </View>
              )}
            </View>
          )}
        </View>

      <View style={styles.tabs}>
        <TouchableOpacity 
          style={[styles.tab, activeTab === 'friends' && styles.activeTab]}
          onPress={() => setActiveTab('friends')}
        >
          <Feather name="users" size={18} color={activeTab === 'friends' ? "#fff" : "#000"} />
          <Text style={[styles.tabText, activeTab === 'friends' && styles.activeTabText]}>Friends</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.tab, activeTab === 'milestones' && styles.activeTab]}
          onPress={() => setActiveTab('milestones')}
        >
          <Feather name="award" size={18} color={activeTab === 'milestones' ? "#fff" : "#000"} />
          <Text style={[styles.tabText, activeTab === 'milestones' && styles.activeTabText]}>Milestones</Text>
        </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.tab, activeTab === 'messages' && styles.activeTab]}
            onPress={() => setActiveTab('messages')}
          >
            <Feather name="message-circle" size={18} color={activeTab === 'messages' ? "#fff" : "#000"} />
            <Text style={[styles.tabText, activeTab === 'messages' && styles.activeTabText]}>Messages</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.tabContent}>
        {renderTabContent()}
      </View>

      <Text style={styles.sectionTitle}>Recent Activity</Text>
      <View style={styles.activityCard}>
        {recentActivity.length > 0 ? (
          <FlatList
            data={recentActivity}
            renderItem={renderActivityItem}
            keyExtractor={item => item.id}
            scrollEnabled={false}
            contentContainerStyle={styles.listContent}
          />
        ) : (
          <Text style={styles.emptyStateText}>No recent activity</Text>
        )}
      </View>

        {friendRequests.length > 0 && (
          <View style={styles.friendRequestsSection}>
            <Text style={styles.sectionTitle}>Friend Requests</Text>
            <View style={styles.friendRequestsList}>
              {friendRequests.map(request => (
                <View key={request.$id} style={styles.friendRequestItem}>
                  <Image
                    source={{ uri: request.fromUser?.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(request.fromUser?.name || '')}&background=random` }}
                    style={styles.friendRequestAvatar}
                  />
                  <View style={styles.friendRequestInfo}>
                    <Text style={styles.friendRequestName}>{request.fromUser?.name}</Text>
                    <Text style={styles.friendRequestEmail}>{request.fromUser?.email}</Text>
                  </View>
                  <View style={styles.friendRequestActions}>
                    <TouchableOpacity
                      style={[styles.friendRequestButton, styles.acceptButton]}
                      onPress={() => handleAcceptFriendRequest(request.$id)}
                    >
                      <Feather name="check" size={16} color="#fff" />
      </TouchableOpacity>
                    <TouchableOpacity
                      style={[styles.friendRequestButton, styles.rejectButton]}
                      onPress={() => handleRejectFriendRequest(request.$id)}
                    >
                      <Feather name="x" size={16} color="#fff" />
                    </TouchableOpacity>
                  </View>
                </View>
              ))}
            </View>
          </View>
        )}

        <View style={styles.postInputSection}>
          <View style={styles.postInputContainer}>
            <TextInput
              style={styles.postInput}
              placeholder="What's on your mind?"
              value={newPost}
              onChangeText={setNewPost}
              multiline
              maxLength={500}
            />
            <TouchableOpacity 
              style={styles.postButton}
              onPress={handleCreatePost}
              disabled={isPosting}
            >
              {isPosting ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <Text style={styles.postButtonText}>Post</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.wallSection}>
          <Text style={styles.sectionTitle}>Your Posts</Text>
          {posts.length > 0 ? (
            <FlatList
              data={posts}
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
    </GestureHandlerRootView>
  );
};

// Add to your existing styles
const styles = StyleSheet.create({
  bio: {
    fontSize: 14,
    color: '#555',
    textAlign: 'center',
    marginTop: 8,
    paddingHorizontal: 20,
  },
  // ... (keep all your existing styles)
  container: {
    flex: 1,
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    paddingTop: Platform.OS === 'ios' ? 20 : 10,
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
  errorTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#ff3333',
    marginBottom: 10,
  },
  errorText: {
    fontSize: 16,
    color: '#555',
    textAlign: 'center',
    marginBottom: 20,
  },
  retryButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 5,
  },
  retryButtonText: {
    color: 'white',
    fontSize: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    marginBottom: 8,
    marginTop: Platform.OS === 'ios' ? 20 : 0,
  },
  headerTitleContainer: {
    flex: 1,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#000',
  },
  backButton: {
    width: 24,
    height: 24,
  },
  profileSection: {
    alignItems: 'center',
    marginBottom: 16,
  },
  profilePicContainer: {
    position: 'relative',
    marginBottom: 12,
  },
  profilePic: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  editIcon: {
    position: 'absolute',
    right: 5,
    bottom: 5,
    backgroundColor: '#000',
    borderRadius: 12,
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  uploadIndicator: {
    position: 'absolute',
    right: 5,
    bottom: 5,
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: 12,
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  name: {
    fontSize: 22,
    fontWeight: '600',
    color: '#000',
    marginBottom: 4,
  },
  streak: {
    fontSize: 16,
    color: '#000',
    fontWeight: '500',
  },
  editProfileButton: {
    backgroundColor: '#f0f0f0',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 20,
    alignSelf: 'center',
    marginBottom: 24,
  },
  editProfileButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#000',
  },
  tabs: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    padding: 4,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: 6,
    gap: 8,
  },
  activeTab: {
    backgroundColor: '#000',
  },
  tabText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#000',
  },
  activeTabText: {
    color: '#fff',
  },
  tabContent: {
    marginBottom: 24,
  },
  listContent: {
    gap: 12,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 16,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  pendingCard: {
    opacity: 0.7,
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginBottom: 12,
  },
  cardContent: {
    flex: 1,
  },
  milestoneHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
    marginBottom: 4,
  },
  cardSubtitle: {
    fontSize: 14,
    color: '#555',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000',
    marginBottom: 12,
  },
  activityCard: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 16,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    gap: 12,
    marginBottom: 24,
  },
  activityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  activityText: {
    flex: 1,
    fontSize: 14,
    color: '#000',
  },
  activityTime: {
    fontSize: 12,
    color: '#888',
  },
  logoutButton: {
    backgroundColor: '#f8d7da',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 30,
  },
  logoutButtonText: {
    color: '#721c24',
    fontWeight: '600',
  },
  emptyStateText: {
    textAlign: 'center',
    color: '#666',
    marginTop: 20,
    fontSize: 16,
  },
  searchContainer: {
    padding: 16,
    backgroundColor: '#fff',
    marginBottom: 8,
  },
  searchButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    backgroundColor: '#f0f0f0',
    borderRadius: 8,
  },
  searchButtonText: {
    marginLeft: 8,
    fontSize: 16,
    color: '#007AFF',
  },
  searchInputContainer: {
    marginTop: 8,
  },
  searchInput: {
    padding: 12,
    backgroundColor: '#f0f0f0',
    borderRadius: 8,
    fontSize: 16,
  },
  searchResults: {
    marginTop: 8,
  },
  searchResultItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    backgroundColor: '#fff',
    borderRadius: 8,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  searchResultAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
  },
  searchResultInfo: {
    flex: 1,
  },
  searchResultName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
  },
  searchResultEmail: {
    fontSize: 14,
    color: '#666',
  },
  addFriendButton: {
    padding: 8,
  },
  friendBadge: {
    backgroundColor: '#E8F5E9',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  friendBadgeText: {
    color: '#2E7D32',
    fontSize: 12,
    fontWeight: '600',
  },
  pendingBadge: {
    backgroundColor: '#FFF3E0',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  pendingBadgeText: {
    color: '#E65100',
    fontSize: 12,
    fontWeight: '600',
  },
  friendRequestsContainer: {
    padding: 16,
    backgroundColor: '#fff',
    marginBottom: 8,
  },
  friendRequestItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  friendRequestAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  friendRequestInfo: {
    flex: 1,
    marginLeft: 12,
  },
  friendRequestName: {
    fontSize: 16,
    fontWeight: '600',
  },
  friendRequestEmail: {
    fontSize: 14,
    color: '#666',
  },
  friendRequestActions: {
    flexDirection: 'row',
  },
  friendRequestButton: {
    padding: 8,
    marginLeft: 8,
  },
  acceptButton: {
    backgroundColor: '#E8F5E9',
    borderRadius: 20,
  },
  rejectButton: {
    backgroundColor: '#FFEBEE',
    borderRadius: 20,
  },
  friendsContainer: {
    flex: 1,
    paddingVertical: 16,
  },
  friendsList: {
    paddingHorizontal: 16,
    gap: 16,
  },
  friendCircleContainer: {
    alignItems: 'center',
    width: 80,
  },
  friendCircleAvatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginBottom: 8,
  },
  friendCircleName: {
    fontSize: 12,
    fontWeight: '500',
    color: '#000',
    textAlign: 'center',
  },
  searchStatus: {
    fontSize: 14,
    color: '#888',
    marginTop: 8,
  },
  messageItem: {
    flexDirection: 'row',
    padding: 15,
    backgroundColor: '#fff',
    borderRadius: 12,
    marginBottom: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#eee',
  },
  messageAvatarContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    overflow: 'hidden',
    marginRight: 15,
    backgroundColor: '#f0f0f0',
  },
  messageAvatar: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  messageContent: {
    flex: 1,
  },
  messageName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
    marginBottom: 4,
  },
  messageText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  messageTime: {
    fontSize: 12,
    color: '#999',
  },
  messageArrow: {
    marginLeft: 8,
  },
  cleanDays: {
    fontSize: 16,
    color: '#4CAF50',
    fontWeight: '500',
    marginBottom: 4,
  },
  postInputSection: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  postInputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  postInput: {
    flex: 1,
    backgroundColor: '#f8f8f8',
    borderRadius: 20,
    padding: 12,
    paddingTop: 12,
    paddingBottom: 12,
    marginRight: 12,
    fontSize: 14,
    minHeight: 40,
    maxHeight: 100,
  },
  postButton: {
    backgroundColor: '#000',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    minWidth: 80,
  },
  postButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
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
  emptyText: {
    textAlign: 'center',
    color: '#888',
    paddingVertical: 20,
  },
  friendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    backgroundColor: '#fff',
    borderRadius: 8,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  friendAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
  },
  friendInfo: {
    flex: 1,
  },
  friendName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
  },
  friendEmail: {
    fontSize: 14,
    color: '#666',
  },
  removeFriendButton: {
    padding: 8,
  },
  logoutButtonHeader: {
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default ProfileScreen;