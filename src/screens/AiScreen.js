import React, { useState, useCallback, useEffect, useRef } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  FlatList, 
  StyleSheet, 
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Animated,
  Easing,
  ImageBackground,
  Dimensions
} from 'react-native';
import * as Haptics from 'expo-haptics';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Feather, Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

const { width } = Dimensions.get('window');

const AiScreen = () => {
  const [messages, setMessages] = useState([
    { 
      id: '1', 
      text: "Hello! I'm SōBi, your AI sober companion. How can I support you today?", 
      sender: 'bot',
      timestamp: new Date().toISOString()
    },
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [apiKey, setApiKey] = useState('');
  const flatListRef = useRef(null);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;

  // Load API key from storage
  useEffect(() => {
    const loadApiKey = async () => {
      try {
        const key = await AsyncStorage.getItem('@openai_api_key');
        if (key) {
          setApiKey(key);
        } else {
          setApiKey(process.env.OPENAI_API_KEY); // Use environment variable
        }
      } catch (error) {
        console.error('Error loading API key:', error);
      }
    };
    loadApiKey();
    
    // Intro animation
    Animated.sequence([
      Animated.delay(300),
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 500,
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnim, {
          toValue: 1,
          duration: 500,
          easing: Easing.out(Easing.back(1.5)),
          useNativeDriver: true,
        }),
      ]),
    ]).start();
  }, []);

  // Get AI response from OpenAI API
  const getAiResponse = async (userInput) => {
    if (!apiKey) {
      return "Please set your OpenAI API key in settings to enable full AI capabilities.";
    }

    try {
      setIsTyping(true);
      const response = await axios.post(
        'https://api.openai.com/v1/chat/completions',
        {
          model: "gpt-3.5-turbo",
          messages: [
            {
              role: "system",
              content: "You are SōBi, a compassionate AI sober companion. Provide supportive, non-judgmental advice for addiction recovery. Keep responses under 100 words. Use simple, conversational language with occasional emojis for warmth. Focus on: coping strategies, relapse prevention, positive reinforcement, and practical tips."
            },
            {
              role: "user",
              content: userInput
            }
          ],
          temperature: 0.7,
          max_tokens: 150
        },
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${apiKey}`
          }
        }
      );
      
      return response.data.choices[0].message.content.trim();
    } catch (error) {
      console.error('AI API error:', error);
      const fallbackResponses = [
        "I'm having trouble connecting right now. Remember: One day at a time. 💪",
        "Connection issue - but you're stronger than any challenge!",
        "Let me suggest: Take a deep breath. You've overcome harder things than this tech glitch. 😊",
        "Can't connect to my full capabilities, but I know you have the strength within you!"
      ];
      return fallbackResponses[Math.floor(Math.random() * fallbackResponses.length)];
    } finally {
      setIsTyping(false);
    }
  };

  // Send message function
  const handleSendMessage = useCallback(async () => {
    if (!input.trim()) return;

    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    const userMessage = { 
      id: Date.now().toString(), 
      text: input, 
      sender: 'user',
      timestamp: new Date().toISOString()
    };
    setMessages(prev => [...prev, userMessage]);
    setInput('');

    // Scroll to bottom
    setTimeout(() => {
      flatListRef.current?.scrollToEnd({ animated: true });
    }, 100);

    const aiResponse = await getAiResponse(input);
    const botMessage = { 
      id: (Date.now() + 1).toString(), 
      text: aiResponse, 
      sender: 'bot',
      timestamp: new Date().toISOString()
    };
    setMessages(prev => [...prev, botMessage]);
    
    // Scroll to bottom after response
    setTimeout(() => {
      flatListRef.current?.scrollToEnd({ animated: true });
    }, 100);
  }, [input, apiKey]);

  // Render message item
  const renderMessage = ({ item }) => (
    <Animated.View 
      style={[
        styles.messageContainer, 
        item.sender === 'user' ? styles.userMessage : styles.botMessage,
        {
          opacity: fadeAnim,
          transform: [{ scale: scaleAnim }]
        }
      ]}
    >
      {item.sender === 'bot' && (
        <View style={styles.botAvatar}>
          <ImageBackground
            source={require('../../assets/avatar.png')} // Add your avatar image
            style={styles.avatarImage}
          >
            <Feather name="cpu" size={16} color="#fff" />
          </ImageBackground>
        </View>
      )}
      <View style={[
        styles.messageBubble,
        item.sender === 'user' ? styles.userBubble : styles.botBubble
      ]}>
        <Text style={[
          styles.messageText,
          item.sender === 'user' ? styles.userText : styles.botText
        ]}>
          {item.text}
        </Text>
        <Text style={[
          styles.timestamp,
          item.sender === 'user' ? styles.userTimestamp : styles.botTimestamp
        ]}>
          {new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </Text>
      </View>
      {item.sender === 'user' && (
        <View style={styles.userAvatar}>
          <Feather name="user" size={16} color="#fff" />
        </View>
      )}
    </Animated.View>
  );

  return (
    <LinearGradient
      colors={['#F0F8FF', '#FFF0F5', '#F0F8FF']}
      style={styles.container}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.container}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
      >
        <View style={styles.header}>
          <View style={styles.headerContent}>
            <View style={styles.headerIconContainer}>
              <Ionicons name="chatbubble-ellipses" size={28} color="#000000" />
            </View>
            <View style={styles.headerTextContainer}>
              <Text style={styles.headerTitle}>SōBi AI</Text>
              <Text style={styles.headerSubtitle}>Your Sober Companion</Text>
            </View>
          </View>
        </View>

        <FlatList
          ref={flatListRef}
          data={messages}
          keyExtractor={(item) => item.id}
          renderItem={renderMessage}
          contentContainerStyle={styles.chatContainer}
          showsVerticalScrollIndicator={false}
          onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
          ListHeaderComponent={<View style={{ height: 20 }} />}
          ListFooterComponent={<View style={{ height: 20 }} />}
        />

        {isTyping && (
          <Animated.View 
            style={[
              styles.typingIndicator,
              {
                opacity: fadeAnim,
                transform: [{ scale: scaleAnim }]
              }
            ]}
          >
            <View style={styles.typingBubble}>
              <ActivityIndicator size="small" color="#000000" />
              <Text style={styles.typingText}>SōBi is thinking...</Text>
            </View>
          </Animated.View>
        )}

        <View style={styles.inputContainer}>
          <View style={styles.inputWrapper}>
            <TextInput
              style={styles.input}
              placeholder="How can I help today?"
              placeholderTextColor="#666666"
              value={input}
              onChangeText={setInput}
              multiline
              blurOnSubmit={false}
              onSubmitEditing={handleSendMessage}
              returnKeyType="send"
            />
            <TouchableOpacity 
              style={[
                styles.sendButton, 
                !input.trim() && styles.disabledButton
              ]} 
              onPress={handleSendMessage}
              disabled={!input.trim()}
            >
              <LinearGradient
                colors={input.trim() ? ['#000000', '#333333'] : ['#cccccc', '#dddddd']}
                style={styles.sendButtonGradient}
              >
                <Ionicons 
                  name="send" 
                  size={20} 
                  color="#ffffff" 
                />
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingTop: Platform.OS === 'ios' ? 20 : 0,
    paddingBottom: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.4)',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0, 0, 0, 0.1)',
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  headerIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(245, 245, 245, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  headerTextContainer: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#000000',
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#666666',
    marginTop: 2,
  },
  chatContainer: {
    paddingHorizontal: 16,
    paddingBottom: 20,
  },
  messageContainer: {
    flexDirection: 'row',
    marginVertical: 8,
    maxWidth: '80%',
  },
  userMessage: {
    alignSelf: 'flex-end',
  },
  botMessage: {
    alignSelf: 'flex-start',
  },
  botAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(245, 245, 245, 0.8)',
    marginRight: 8,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  userAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    marginLeft: 8,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  messageBubble: {
    padding: 12,
    borderRadius: 16,
    maxWidth: '100%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  userBubble: {
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    borderTopRightRadius: 4,
  },
  botBubble: {
    backgroundColor: 'rgba(245, 245, 245, 0.8)',
    borderTopLeftRadius: 4,
  },
  messageText: {
    fontSize: 16,
    lineHeight: 22,
  },
  userText: {
    color: '#ffffff',
  },
  botText: {
    color: '#000000',
  },
  timestamp: {
    fontSize: 10,
    marginTop: 4,
  },
  userTimestamp: {
    color: 'rgba(255, 255, 255, 0.7)',
    textAlign: 'right',
  },
  botTimestamp: {
    color: 'rgba(0, 0, 0, 0.5)',
  },
  typingIndicator: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  typingBubble: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(245, 245, 245, 0.8)',
    padding: 12,
    borderRadius: 16,
    maxWidth: width * 0.6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  typingText: {
    marginLeft: 8,
    color: '#666666',
    fontSize: 14,
  },
  inputContainer: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0, 0, 0, 0.1)',
    backgroundColor: 'rgba(255, 255, 255, 0.4)',
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(245, 245, 245, 0.8)',
    borderRadius: 24,
    paddingHorizontal: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  input: {
    flex: 1,
    paddingVertical: 12,
    fontSize: 16,
    maxHeight: 100,
    marginRight: 8,
  },
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    overflow: 'hidden',
  },
  sendButtonGradient: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  disabledButton: {
    opacity: 0.5,
  },
});

export default AiScreen;