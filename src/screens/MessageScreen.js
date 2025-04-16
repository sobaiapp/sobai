import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Image,
  Alert
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';
import { 
  sendMessage, 
  getMessages, 
  getUserProfile,
  testAppwriteConnection
} from '../services/appwrite';

const MessageScreen = ({ route, navigation }) => {
  const { friendId } = route.params;
  const { user } = useAuth();
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [friendProfile, setFriendProfile] = useState(null);
  const flatListRef = useRef(null);

  const loadFriendProfile = async () => {
    try {
      const profile = await getUserProfile(friendId);
      setFriendProfile(profile);
      navigation.setOptions({
        title: profile.name || 'Chat'
      });
    } catch (error) {
      console.error('Error loading friend profile:', error);
    }
  };

  const loadMessages = async (isInitialLoad = false) => {
    try {
      if (isInitialLoad) {
        setLoading(true);
      }
      const messageList = await getMessages(user.$id, friendId);
      setMessages(messageList);
    } catch (error) {
      console.error('Error loading messages:', error);
      // If the collection doesn't exist, just set an empty array
      if (error.message && error.message.includes('Collection with the requested ID could not be found')) {
        setMessages([]);
      }
    } finally {
      if (isInitialLoad) {
        setLoading(false);
      }
    }
  };

  useEffect(() => {
    const loadData = async () => {
      try {
        await loadMessages(true); // Pass true for initial load
        await loadFriendProfile();
      } catch (error) {
        console.error('Error loading data:', error);
        Alert.alert(
          'Error',
          'Failed to load messages. Please try again later.',
          [{ text: 'OK' }]
        );
      }
    };

    loadData();
    
    // Set up polling for new messages without showing loading indicator
    const interval = setInterval(() => loadMessages(false), 5000);
    
    return () => clearInterval(interval);
  }, [friendId]);

  const handleSendMessage = async () => {
    if (!newMessage.trim()) return;

    try {
      setLoading(true);
      
      await sendMessage(user.$id, friendId, newMessage.trim());
      setNewMessage('');
      await loadMessages();
    } catch (error) {
      console.error('Error sending message:', error);
      // Show a more user-friendly error message
      Alert.alert(
        'Error',
        'Failed to send message. Please try again later.',
        [{ text: 'OK' }]
      );
      // If there's an error, we'll still try to load messages in case some were sent
      await loadMessages();
    } finally {
      setLoading(false);
    }
  };

  const renderMessage = ({ item }) => {
    const isMyMessage = item.fromUserId === user.$id;

    return (
      <View style={[
        styles.messageContainer,
        isMyMessage ? styles.myMessage : styles.theirMessage
      ]}>
        {!isMyMessage && (
          <View style={styles.messageAvatarContainer}>
            <Image 
              source={{ 
                uri: friendProfile?.avatar || 
                  `https://ui-avatars.com/api/?name=${encodeURIComponent(friendProfile?.name || '')}&background=FFD700` 
              }} 
              style={styles.messageAvatar} 
            />
          </View>
        )}
        <View style={[
          styles.messageBubble,
          isMyMessage ? styles.myMessageBubble : styles.theirMessageBubble
        ]}>
          <Text style={styles.messageText}>{item.text}</Text>
          <Text style={styles.messageTime}>
            {new Date(item.createdAt).toLocaleTimeString([], { 
              hour: '2-digit', 
              minute: '2-digit' 
            })}
          </Text>
        </View>
      </View>
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#000" />
      </View>
    );
  }

  return (
    <KeyboardAvoidingView 
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
    >
      <FlatList
        ref={flatListRef}
        data={messages}
        renderItem={renderMessage}
        keyExtractor={item => item.$id}
        contentContainerStyle={styles.messagesList}
        onContentSizeChange={() => flatListRef.current?.scrollToEnd()}
        onLayout={() => flatListRef.current?.scrollToEnd()}
      />
      
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          value={newMessage}
          onChangeText={setNewMessage}
          placeholder="Type a message..."
          multiline
        />
        <TouchableOpacity 
          style={styles.sendButton}
          onPress={handleSendMessage}
          disabled={!newMessage.trim()}
        >
          <Ionicons 
            name="send" 
            size={24} 
            color={newMessage.trim() ? '#007AFF' : '#999'} 
          />
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  messagesList: {
    padding: 16,
  },
  messageContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    marginVertical: 4,
    paddingHorizontal: 12,
  },
  myMessage: {
    justifyContent: 'flex-end',
  },
  theirMessage: {
    justifyContent: 'flex-start',
  },
  messageAvatarContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    overflow: 'hidden',
    marginRight: 8,
    backgroundColor: '#f0f0f0',
  },
  messageAvatar: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  messageBubble: {
    maxWidth: '70%',
    padding: 12,
    borderRadius: 18,
  },
  myMessageBubble: {
    backgroundColor: '#007AFF',
    borderBottomRightRadius: 12,
  },
  theirMessageBubble: {
    backgroundColor: '#E9E9EB',
    borderBottomLeftRadius: 12,
  },
  messageText: {
    fontSize: 16,
    color: '#000',
  },
  messageTime: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
    alignSelf: 'flex-end',
  },
  inputContainer: {
    flexDirection: 'row',
    padding: 16,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
    alignItems: 'center',
  },
  input: {
    flex: 1,
    backgroundColor: '#f0f0f0',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginRight: 8,
    maxHeight: 100,
  },
  sendButton: {
    padding: 8,
  },
});

export default MessageScreen; 