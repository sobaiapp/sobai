import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  Dimensions,
  Image,
  SafeAreaView,
  TextInput,
  Modal,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StatusBar,
  ActivityIndicator
} from 'react-native';
import { Ionicons, MaterialIcons, Feather, FontAwesome } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import * as ImagePicker from 'expo-image-picker';
import * as Haptics from 'expo-haptics';
import { databases, ID, Query, storage } from '../services/appwrite';
import { getCurrentUser } from '../services/appwrite';

const { width } = Dimensions.get('window');

const CommunityScreen = () => {
  const navigation = useNavigation();
  const [activeTab, setActiveTab] = useState('feed');
  const [modalVisible, setModalVisible] = useState(false);
  const [postText, setPostText] = useState('');
  const [selectedImage, setSelectedImage] = useState(null);
  const [posts, setPosts] = useState([]);
  const [events, setEvents] = useState([]);
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    loadUser();
    loadData();
  }, []);

  const loadUser = async () => {
    try {
      const user = await getCurrentUser();
      setCurrentUser(user);
    } catch (error) {
      console.error('Error loading user:', error);
    }
  };

  const loadData = async () => {
    try {
      setLoading(true);
      await Promise.all([
        loadPosts(),
        loadEvents(),
        loadGroups()
      ]);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadPosts = async () => {
    try {
      const response = await databases.listDocuments(
        '67ead41e00391c4d579f', // Database ID
        'community_posts',
        [Query.orderDesc('createdAt')]
      );

      // Fetch user details for each post
      const postsWithUsers = await Promise.all(
        response.documents.map(async (post) => {
          try {
            // Try to get profile document
            const profile = await databases.getDocument(
              '67ead41e00391c4d579f', // Database ID
              '67eb25180014d70eed51', // Profiles Collection ID
              post.userId
            );
            return {
              ...post,
              user: {
                name: profile.name || 'User',
                avatar: profile.avatar || null
              }
            };
          } catch (error) {
            console.error('Error fetching profile:', error);
            return {
              ...post,
              user: {
                name: 'User',
                avatar: null
              }
            };
          }
        })
      );

      setPosts(postsWithUsers);
    } catch (error) {
      console.error('Error loading posts:', error);
    }
  };

  const loadEvents = async () => {
    try {
      const response = await databases.listDocuments(
        '67ead41e00391c4d579f', // Your database ID
        'community_events',
        [Query.orderDesc('date')]
      );
      setEvents(response.documents);
    } catch (error) {
      console.error('Error loading events:', error);
    }
  };

  const loadGroups = async () => {
    try {
      const response = await databases.listDocuments(
        '67ead41e00391c4d579f', // Your database ID
        'community_groups',
        [Query.orderDesc('createdAt')]
      );
      setGroups(response.documents);
    } catch (error) {
      console.error('Error loading groups:', error);
    }
  };

  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.canceled) {
      setSelectedImage(result.assets[0].uri);
    }
  };

  const handlePostSubmit = async () => {
    if (!postText.trim() || !currentUser) return;
    
    try {
      setLoading(true);
      const postData = {
        userId: currentUser.$id,
      content: postText,
        likes: [],
        comments: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      if (selectedImage) {
        try {
          // Convert image URI to blob
          const response = await fetch(selectedImage);
          const blob = await response.blob();
          
          // Upload image to storage
          const imageId = ID.unique();
          await storage.createFile(
            'community_images',
            imageId,
            blob
          );
          
          // Get the file URL
          const fileUrl = storage.getFileView('community_images', imageId);
          postData.image = fileUrl;
        } catch (error) {
          console.error('Error uploading image:', error);
          // Continue without image if upload fails
        }
      }

      // Create the post document
      await databases.createDocument(
        '67ead41e00391c4d579f',
        'community_posts',
        ID.unique(),
        postData
      );

      // Reset form and refresh data
    setPostText('');
    setSelectedImage(null);
    setModalVisible(false);
      await loadPosts();
      
      // Show success feedback
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch (error) {
      console.error('Error creating post:', error);
      // Show error feedback
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    } finally {
      setLoading(false);
    }
  };

  const handleLike = async (postId) => {
    if (!currentUser) return;
    
    try {
      const post = posts.find(p => p.$id === postId);
      if (!post) return;

      const updatedLikes = post.likes.includes(currentUser.$id)
        ? post.likes.filter(id => id !== currentUser.$id)
        : [...post.likes, currentUser.$id];

      await databases.updateDocument(
        '67ead41e00391c4d579f', // Your database ID
        'community_posts',
        postId,
        { likes: updatedLikes }
      );

      await loadPosts();
    } catch (error) {
      console.error('Error updating like:', error);
    }
  };

  const renderPost = ({ item }) => (
    <View style={styles.postCard}>
      <View style={styles.postHeader}>
        <Image 
          source={{ 
            uri: item.user?.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(item.user?.name || 'User')}&background=random` 
          }} 
          style={styles.postAvatar} 
        />
        <View style={styles.postUserInfo}>
          <Text style={styles.postUserName}>{item.user?.name || 'User'}</Text>
          <Text style={styles.postTime}>{new Date(item.createdAt).toLocaleDateString()}</Text>
        </View>
      </View>
      
      <Text style={styles.postContent}>{item.content}</Text>
      
      {item.image && (
        <Image 
          source={{ uri: item.image }} 
          style={styles.postImage} 
          resizeMode="cover" 
        />
      )}
      
      <View style={styles.postActions}>
        <TouchableOpacity 
          style={styles.postAction}
          onPress={() => handleLike(item.$id)}
        >
          <Ionicons 
            name={item.likes?.includes(currentUser?.$id) ? "heart" : "heart-outline"} 
            size={20} 
            color={item.likes?.includes(currentUser?.$id) ? "#ff0000" : "#6c757d"} 
          />
          <Text style={styles.postActionText}>{item.likes?.length || 0}</Text>
          </TouchableOpacity>
        <TouchableOpacity style={styles.postAction}>
          <Ionicons name="chatbubble-outline" size={20} color="#6c757d" />
          <Text style={styles.postActionText}>{item.comments?.length || 0}</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.postAction}>
          <Ionicons name="share-outline" size={20} color="#6c757d" />
          <Text style={styles.postActionText}>Share</Text>
          </TouchableOpacity>
        </View>
    </View>
  );

  const renderEventCard = (event) => (
            <TouchableOpacity 
      key={event.$id} 
      style={styles.eventCard}
      onPress={() => navigation.navigate('EventDetail', { eventId: event.$id })}
    >
      <View style={styles.eventImageContainer}>
        {event.image && (
          <Image 
            source={{ uri: `https://cloud.appwrite.io/v1/storage/buckets/community_images/files/${event.image}/view?project=679926010035434b938c` }} 
            style={styles.eventImage} 
          />
        )}
        <View style={styles.eventDate}>
          <Text style={styles.eventDay}>{new Date(event.date).getDate()}</Text>
          <Text style={styles.eventMonth}>{new Date(event.date).toLocaleString('default', { month: 'short' }).toUpperCase()}</Text>
        </View>
      </View>
      <View style={styles.eventInfo}>
        <Text style={styles.eventTitle}>{event.title}</Text>
        <Text style={styles.eventLocation}>{event.location}</Text>
        <View style={styles.eventStats}>
          <View style={styles.eventStat}>
            <Ionicons name="time-outline" size={16} color="#6c757d" />
            <Text style={styles.eventStatText}>{event.time}</Text>
          </View>
          <View style={styles.eventStat}>
            <Ionicons name="people-outline" size={16} color="#6c757d" />
            <Text style={styles.eventStatText}>{event.attendees?.length || 0} attending</Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );

  const renderGroupCard = (group) => (
    <TouchableOpacity 
      key={group.$id} 
      style={styles.supportGroupCard}
      onPress={() => navigation.navigate('GroupDetail', { groupId: group.$id })}
            >
      <View style={styles.groupHeader}>
        <View style={styles.groupIconContainer}>
          <Ionicons name="people" size={24} color="#000" />
          </View>
        <View style={styles.groupInfo}>
          <Text style={styles.groupName}>{group.name}</Text>
          <Text style={styles.groupLocation}>{group.location}</Text>
        </View>
        <View style={styles.groupStats}>
          <Text style={styles.groupMembers}>{group.members?.length || 0} members</Text>
        </View>
      </View>
      <View style={styles.groupTags}>
        {group.tags?.map((tag, index) => (
          <View key={index} style={styles.tag}>
            <Text style={styles.tagText}>{tag}</Text>
          </View>
        ))}
      </View>
            </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#000" />
          </View>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" />
      <View style={styles.container}>
        <View style={styles.header}>
          <View style={styles.headerContent}>
            <Text style={styles.headerTitle}>Community</Text>
            <TouchableOpacity style={styles.searchButton}>
              <Ionicons name="search" size={24} color="#000" />
            </TouchableOpacity>
          </View>
          <View style={styles.tabs}>
            <TouchableOpacity
              style={[styles.tab, activeTab === 'feed' && styles.activeTab]}
              onPress={() => setActiveTab('feed')}
            >
              <Text style={[styles.tabText, activeTab === 'feed' && styles.activeTabText]}>
                Feed
              </Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.tab, activeTab === 'nearby' && styles.activeTab]}
              onPress={() => setActiveTab('nearby')}
            >
              <Text style={[styles.tabText, activeTab === 'nearby' && styles.activeTabText]}>
                Nearby Groups
              </Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.tab, activeTab === 'events' && styles.activeTab]}
              onPress={() => setActiveTab('events')}
            >
              <Text style={[styles.tabText, activeTab === 'events' && styles.activeTabText]}>
                Events
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {activeTab === 'feed' ? (
        <FlatList
            data={posts}
            renderItem={renderPost}
            keyExtractor={item => item.$id}
            contentContainerStyle={styles.feedContent}
          showsVerticalScrollIndicator={false}
            refreshing={loading}
            onRefresh={loadData}
        />
        ) : activeTab === 'nearby' ? (
          <ScrollView style={styles.content}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Support Groups Near You</Text>
              <TouchableOpacity>
                <Text style={styles.seeAll}>See All</Text>
              </TouchableOpacity>
            </View>
            {groups.map(renderGroupCard)}
          </ScrollView>
        ) : (
          <ScrollView style={styles.content}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Upcoming Events</Text>
              <TouchableOpacity>
                <Text style={styles.seeAll}>See All</Text>
              </TouchableOpacity>
            </View>
            {events.map(renderEventCard)}
          </ScrollView>
        )}

        <TouchableOpacity 
          style={styles.createButton}
          onPress={() => setModalVisible(true)}
        >
          <Ionicons name="add" size={24} color="#fff" />
        </TouchableOpacity>

        <Modal
          animationType="slide"
          transparent={false}
          visible={modalVisible}
          onRequestClose={() => setModalVisible(false)}
        >
          <SafeAreaView style={styles.modalSafeArea}>
            <View style={styles.modalContainer}>
              <View style={styles.modalHeader}>
                <TouchableOpacity 
                  onPress={() => setModalVisible(false)}
                  style={styles.modalCloseButton}
                >
                  <Ionicons name="close" size={28} color="#65676B" />
                </TouchableOpacity>
                <Text style={styles.modalTitle}>Create Post</Text>
                <TouchableOpacity 
                  onPress={handlePostSubmit}
                  style={[styles.postButton, !postText && styles.disabledButton]}
                  disabled={!postText}
                >
                  <Text style={styles.postButtonText}>Post</Text>
                </TouchableOpacity>
              </View>

              <KeyboardAvoidingView 
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={styles.modalContent}
                keyboardVerticalOffset={Platform.OS === 'ios' ? 60 : 0}
              >
                <View style={styles.modalUserInfo}>
                  <Image 
                    source={{ uri: currentUser?.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(currentUser?.name || 'User')}&background=random` }} 
                    style={styles.modalAvatar} 
                  />
                  <Text style={styles.modalUserName}>{currentUser?.name || 'User'}</Text>
                </View>

                <TextInput
                  style={styles.postInput}
                  placeholder="What's on your mind?"
                  placeholderTextColor="#65676B"
                  multiline
                  value={postText}
                  onChangeText={setPostText}
                  autoFocus
                />

                {selectedImage && (
                  <View style={styles.imagePreviewContainer}>
                    <Image 
                      source={{ uri: selectedImage }} 
                      style={styles.selectedImage} 
                      resizeMode="cover"
                    />
                    <TouchableOpacity 
                      style={styles.removeImageButton}
                      onPress={() => setSelectedImage(null)}
                    >
                      <Ionicons name="close-circle" size={24} color="#FFF" />
                    </TouchableOpacity>
                  </View>
                )}

                <View style={styles.addToPostContainer}>
                  <Text style={styles.addToPostText}>Add to your post</Text>
                  <View style={styles.addToPostOptions}>
                    <TouchableOpacity 
                      style={styles.addToPostButton}
                      onPress={pickImage}
                    >
                      <Ionicons name="image" size={24} color="#45BD62" />
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.addToPostButton}>
                      <Ionicons name="happy" size={24} color="#F7B928" />
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.addToPostButton}>
                      <Ionicons name="location" size={24} color="#F5533D" />
                    </TouchableOpacity>
                  </View>
                </View>
              </KeyboardAvoidingView>
            </View>
          </SafeAreaView>
        </Modal>
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
    backgroundColor: '#f8f9fa',
  },
  header: {
    backgroundColor: '#fff',
    paddingBottom: 8,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#000',
  },
  searchButton: {
    padding: 8,
  },
  tabs: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    marginTop: 8,
  },
  tab: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    marginRight: 16,
  },
  activeTab: {
    borderBottomWidth: 2,
    borderBottomColor: '#000',
  },
  tabText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#6c757d',
  },
  activeTabText: {
    color: '#000',
  },
  content: {
    flex: 1,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000',
  },
  seeAll: {
    fontSize: 14,
    color: '#007AFF',
    fontWeight: '500',
  },
  supportGroupCard: {
    backgroundColor: '#fff',
    marginHorizontal: 16,
    marginBottom: 12,
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  groupHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  groupIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#e3f2fd',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  groupInfo: {
    flex: 1,
  },
  groupName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
    marginBottom: 2,
  },
  groupLocation: {
    fontSize: 14,
    color: '#6c757d',
  },
  groupStats: {
    alignItems: 'flex-end',
  },
  groupMembers: {
    fontSize: 13,
    color: '#6c757d',
    marginBottom: 2,
  },
  groupTags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 8,
  },
  tag: {
    backgroundColor: '#f1f3f5',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginRight: 8,
    marginBottom: 8,
  },
  tagText: {
    fontSize: 12,
    color: '#495057',
  },
  eventCard: {
    backgroundColor: '#fff',
    marginHorizontal: 16,
    marginBottom: 12,
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  eventImageContainer: {
    height: 160,
    position: 'relative',
  },
  eventImage: {
    width: '100%',
    height: '100%',
  },
  eventDate: {
    position: 'absolute',
    top: 12,
    left: 12,
    backgroundColor: '#fff',
    padding: 8,
    borderRadius: 8,
    alignItems: 'center',
  },
  eventDay: {
    fontSize: 16,
    fontWeight: '700',
    color: '#000',
  },
  eventMonth: {
    fontSize: 12,
    color: '#6c757d',
  },
  eventInfo: {
    padding: 16,
  },
  eventTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
    marginBottom: 4,
  },
  eventLocation: {
    fontSize: 14,
    color: '#6c757d',
    marginBottom: 8,
  },
  eventStats: {
    flexDirection: 'row',
  },
  eventStat: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 16,
  },
  eventStatText: {
    fontSize: 13,
    color: '#6c757d',
    marginLeft: 4,
  },
  createButton: {
    position: 'absolute',
    right: 16,
    bottom: 16,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#000',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  feedContent: {
    paddingVertical: 12,
  },
  postCard: {
    backgroundColor: '#fff',
    marginHorizontal: 16,
    marginBottom: 12,
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
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
  postUserInfo: {
    flex: 1,
  },
  postUserName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
  },
  postTime: {
    fontSize: 13,
    color: '#6c757d',
  },
  postContent: {
    fontSize: 15,
    color: '#000',
    lineHeight: 20,
    marginBottom: 12,
  },
  postImage: {
    width: '100%',
    height: 200,
    borderRadius: 8,
    marginBottom: 12,
  },
  postActions: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: '#f1f3f5',
    paddingTop: 12,
  },
  postAction: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 24,
  },
  postActionText: {
    marginLeft: 4,
    fontSize: 13,
    color: '#6c757d',
  },
  modalSafeArea: {
    flex: 1,
    backgroundColor: '#fff',
  },
  modalContainer: {
    flex: 1,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f3f5',
  },
  modalCloseButton: {
    padding: 4,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000',
  },
  postButton: {
    backgroundColor: '#000',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
  },
  disabledButton: {
    backgroundColor: '#e9ecef',
  },
  postButtonText: {
    color: '#fff',
    fontWeight: '600',
  },
  modalContent: {
    flex: 1,
    padding: 16,
  },
  modalUserInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  modalAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
  },
  modalUserName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
  },
  postInput: {
    fontSize: 16,
    minHeight: 100,
    color: '#000',
    textAlignVertical: 'top',
  },
  imagePreviewContainer: {
    marginTop: 16,
    borderRadius: 8,
    overflow: 'hidden',
    position: 'relative',
  },
  selectedImage: {
    width: '100%',
    height: 200,
  },
  removeImageButton: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: 12,
    padding: 4,
  },
  addToPostContainer: {
    marginTop: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#f1f3f5',
    borderRadius: 8,
  },
  addToPostText: {
    fontSize: 14,
    color: '#6c757d',
    marginBottom: 12,
  },
  addToPostOptions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  addToPostButton: {
    padding: 8,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default CommunityScreen;