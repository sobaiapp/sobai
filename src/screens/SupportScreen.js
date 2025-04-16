import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ScrollView } from 'react-native';

const SupportScreen = () => {
  const [message, setMessage] = useState('');

  // Function to handle message submission (for example, send it to your backend or support team)
  const handleMessageSubmit = () => {
    if (message.trim()) {
      Alert.alert('Message sent', 'Your message has been sent to our support team.');
      setMessage(''); // Reset the message after sending
    } else {
      Alert.alert('Error', 'Please enter a message before submitting.');
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Support</Text>
      
      <Text style={styles.subtitle}>Frequently Asked Questions</Text>
      <View style={styles.faqSection}>
        <Text style={styles.faqQuestion}>1. How do I reset my password?</Text>
        <Text style={styles.faqAnswer}>Go to Settings > Account > Reset Password</Text>

        <Text style={styles.faqQuestion}>2. How can I contact customer support?</Text>
        <Text style={styles.faqAnswer}>You can use the contact form below to send a message.</Text>
      </View>

      <Text style={styles.subtitle}>Contact Support</Text>

      <TextInput
        style={styles.input}
        placeholder="Enter your message"
        value={message}
        onChangeText={setMessage}
        multiline
        numberOfLines={4}
      />

      <TouchableOpacity style={styles.button} onPress={handleMessageSubmit}>
        <Text style={styles.buttonText}>Send Message</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.callButton}>
        <Text style={styles.callButtonText}>Call Support</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: '#f9f9f9',
    padding: 20,
    paddingTop: 40,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#555',
    marginTop: 20,
  },
  faqSection: {
    marginVertical: 10,
    paddingLeft: 10,
  },
  faqQuestion: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
    marginTop: 5,
  },
  faqAnswer: {
    fontSize: 16,
    color: '#888',
    marginBottom: 10,
  },
  input: {
    width: '100%',
    height: 120,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 10,
    backgroundColor: '#fff',
    marginTop: 10,
    fontSize: 16,
    color: '#333',
  },
  button: {
    backgroundColor: '#000',
    paddingVertical: 15,
    borderRadius: 8,
    marginTop: 20,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  callButton: {
    backgroundColor: '#34B7F1',
    paddingVertical: 15,
    borderRadius: 8,
    marginTop: 20,
    alignItems: 'center',
  },
  callButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default SupportScreen;
