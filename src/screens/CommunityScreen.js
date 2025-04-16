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
  StatusBar
} from 'react-native';
import { Ionicons, MaterialIcons, Feather, FontAwesome } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import * as ImagePicker from 'expo-image-picker';
import * as Haptics from 'expo-haptics';

const { width } = Dimensions.get('window');

// Mock data
const communityFeedData = [
  { 
    id: '1', 
    description: 'Celebrating 6 months sober today! Never thought I could do it but here we are. One day at a time.', 
    user: 'Alex Johnson',
    avatar: 'https://randomuser.me/api/portraits/men/1.jpg',
    time: '2 hours ago',
    likes: 24,
    comments: 8,
    image: 'https://images.unsplash.com/photo-1498837167922-ddd27525d352?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60'
  },
  { 
    id: '2', 
    description: 'Found this amazing sober meetup group in my area. Anyone else in the Denver area want to join?', 
    user: 'Sarah Miller',
    avatar: 'https://randomuser.me/api/portraits/women/1.jpg',
    time: '1 day ago',
    likes: 56,
    comments: 12
  },
  { 
    id: '3', 
    description: 'Daily check-in: Today was tough but I made it through without drinking. Grateful for this community.', 
    user: 'Michael Chen',
    avatar: 'https://randomuser.me/api/portraits/men/2.jpg',
    time: '3 days ago',
    likes: 102,
    comments: 25,
    image: 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60'
  },
];

const eventData = [
  { 
    id: '1', 
    title: 'Morning Yoga & Meditation', 
    description: 'Join us for a gentle morning yoga session followed by guided meditation to start your day with intention and peace.', 
    day: '15',
    month: 'JUN',
    time: '7:00 AM - 8:00 AM',
    location: 'Central Park, Meet at the Fountain',
    image: 'https://images.unsplash.com/photo-1545205597-3d9d02c29597?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60'
  },
  { 
    id: '2', 
    title: 'Mindfulness Workshop', 
    description: 'Learn practical mindfulness techniques you can incorporate into your daily life to reduce stress and increase focus.', 
    day: '22',
    month: 'JUN',
    time: '6:30 PM - 8:00 PM',
    location: 'Community Center Room 3B',
    image: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60'
  },
];

const discussionTopics = [
  { 
    id: '1', 
    title: 'How do you cope with stress and cravings?', 
    description: 'I\'ve been finding it particularly hard to manage stress lately, which leads to cravings. What are your go-to strategies?', 
    user: 'Jessica Brown',
    avatar: 'https://randomuser.me/api/portraits/women/2.jpg',
    time: '5 hours ago',
    replies: 24,
    views: 156
  },
  { 
    id: '2', 
    title: 'Favorite healthy alternatives to drinking?', 
    description: 'Looking for new ideas to replace my old habits. What are your favorite alcohol-free drinks or activities?', 
    user: 'Robert Taylor',
    avatar: 'https://randomuser.me/api/portraits/men/4.jpg',
    time: '1 day ago',
    replies: 18,
    views: 203
  },
];

const CommunityScreen = () => {
  const navigation = useNavigation();
  const [activeTab, setActiveTab] = useState('feed');
  const [modalVisible, setModalVisible] = useState(false);
  const [postText, setPostText] = useState('');
  const [selectedImage, setSelectedImage] = useState(null);
  const [posts, setPosts] = useState([
    {
      id: '1',
      user: 'John D.',
      avatar: 'https://randomuser.me/api/portraits/men/1.jpg',
      content: 'Celebrating 6 months of sobriety today! One day at a time.',
      time: '2h ago',
      likes: 24,
      comments: 8,
      image: 'https://images.unsplash.com/photo-1498837167922-ddd27525d352?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60'
    },
    {
      id: '2',
      user: 'Sarah M.',
      avatar: 'https://randomuser.me/api/portraits/women/1.jpg',
      content: 'Found this amazing sober meetup group in my area. Anyone else in the Denver area want to join?',
      time: '1d ago',
      likes: 56,
      comments: 12
    }
  ]);

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

  const handlePostSubmit = () => {
    if (!postText.trim()) return;
    
    const newPost = {
      id: Math.random().toString(),
      user: 'You',
      avatar: 'https://randomuser.me/api/portraits/men/5.jpg',
      content: postText,
      time: 'Just now',
      likes: 0,
      comments: 0,
      image: selectedImage
    };

    setPosts([newPost, ...posts]);
    setPostText('');
    setSelectedImage(null);
    setModalVisible(false);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  };

  const renderPost = ({ item }) => (
    <View style={styles.postCard}>
      <View style={styles.postHeader}>
        <Image source={{ uri: item.avatar }} style={styles.postAvatar} />
        <View style={styles.postUserInfo}>
          <Text style={styles.postUserName}>{item.user}</Text>
          <Text style={styles.postTime}>{item.time}</Text>
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
        <TouchableOpacity style={styles.postAction}>
          <Ionicons name="heart-outline" size={20} color="#6c757d" />
          <Text style={styles.postActionText}>{item.likes}</Text>
          </TouchableOpacity>
        <TouchableOpacity style={styles.postAction}>
          <Ionicons name="chatbubble-outline" size={20} color="#6c757d" />
          <Text style={styles.postActionText}>{item.comments}</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.postAction}>
          <Ionicons name="share-outline" size={20} color="#6c757d" />
          <Text style={styles.postActionText}>Share</Text>
          </TouchableOpacity>
        </View>
    </View>
  );

  const renderSupportGroupCard = (group) => (
            <TouchableOpacity 
      key={group.id} 
      style={styles.supportGroupCard}
      onPress={() => navigation.navigate('GroupDetail', { groupId: group.id })}
            >
      <View style={styles.groupHeader}>
        <View style={styles.groupIconContainer}>
          <Ionicons name={group.icon} size={24} color="#000" />
          </View>
        <View style={styles.groupInfo}>
          <Text style={styles.groupName}>{group.name}</Text>
          <Text style={styles.groupLocation}>{group.location}</Text>
        </View>
        <View style={styles.groupStats}>
          <Text style={styles.groupMembers}>{group.members} members</Text>
          <Text style={styles.groupDistance}>{group.distance} away</Text>
        </View>
      </View>
      <View style={styles.groupTags}>
        {group.tags.map((tag, index) => (
          <View key={index} style={styles.tag}>
            <Text style={styles.tagText}>{tag}</Text>
          </View>
        ))}
      </View>
            </TouchableOpacity>
  );

  const renderEventCard = (event) => (
    <TouchableOpacity 
      key={event.id} 
      style={styles.eventCard}
      onPress={() => navigation.navigate('EventDetail', { eventId: event.id })}
    >
      <View style={styles.eventImageContainer}>
        <Image source={{ uri: event.image }} style={styles.eventImage} />
        <View style={styles.eventDate}>
          <Text style={styles.eventDay}>{event.day}</Text>
          <Text style={styles.eventMonth}>{event.month}</Text>
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
            <Text style={styles.eventStatText}>{event.attendees} attending</Text>
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
            keyExtractor={item => item.id}
            contentContainerStyle={styles.feedContent}
          showsVerticalScrollIndicator={false}
        />
        ) : activeTab === 'nearby' ? (
          <ScrollView style={styles.content}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Support Groups Near You</Text>
              <TouchableOpacity>
                <Text style={styles.seeAll}>See All</Text>
              </TouchableOpacity>
            </View>
            {supportGroups.map(renderSupportGroupCard)}
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
                    source={{ uri: 'https://randomuser.me/api/portraits/men/5.jpg' }} 
                    style={styles.modalAvatar} 
                  />
                    <Text style={styles.modalUserName}>You</Text>
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
  groupDistance: {
    fontSize: 13,
    color: '#007AFF',
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
});

// Sample data
const supportGroups = [
  {
    id: '1',
    name: 'Morning Recovery Group',
    location: 'Downtown Community Center',
    members: 24,
    distance: '0.5 mi',
    icon: 'people',
    tags: ['Morning', 'In-person', 'Beginner-friendly'],
  },
  {
    id: '2',
    name: 'Virtual Support Circle',
    location: 'Online',
    members: 45,
    distance: 'Virtual',
    icon: 'globe',
    tags: ['Virtual', 'All levels', '24/7'],
  },
];

const events = [
  {
    id: '1',
    title: 'Sober Social Meetup',
    location: 'Central Park',
    time: '2:00 PM',
    attendees: 32,
    day: '15',
    month: 'MAR',
    image: 'https://example.com/event1.jpg',
  },
  {
    id: '2',
    title: 'Recovery Workshop',
    location: 'Community Hall',
    time: '6:00 PM',
    attendees: 18,
    day: '20',
    month: 'MAR',
    image: 'https://example.com/event2.jpg',
  },
];

export default CommunityScreen;