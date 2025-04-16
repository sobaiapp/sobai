import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  Alert,
  Animated,
  SafeAreaView,
  Keyboard
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';

const TriggersScreen = () => {
  const navigation = useNavigation();
  const [triggers, setTriggers] = useState([
    { id: '1', name: 'Stress', selected: false, icon: 'flash' },
    { id: '2', name: 'Social Events', selected: false, icon: 'people' },
    { id: '3', name: 'Loneliness', selected: false, icon: 'person' },
    { id: '4', name: 'Negative Emotions', selected: false, icon: 'sad' },
    { id: '5', name: 'Peer Pressure', selected: false, icon: 'thumbs-down' },
  ]);
  const [newTrigger, setNewTrigger] = useState('');
  const addButtonScale = useRef(new Animated.Value(1)).current;
  const inputRef = useRef();

  const toggleTrigger = (id) => {
    setTriggers(prevTriggers =>
      prevTriggers.map(trigger =>
        trigger.id === id ? { ...trigger, selected: !trigger.selected } : trigger
      )
    );
  };

  const handleAddTrigger = () => {
    if (newTrigger.trim() === '') {
      Alert.alert('Error', 'Trigger name cannot be empty');
      return;
    } else if (newTrigger.length < 3) {
      Alert.alert('Error', 'Trigger name must be at least 3 characters');
      return;
    }

    const newEntry = { 
      id: Date.now().toString(), 
      name: newTrigger, 
      selected: false,
      icon: 'alert-circle' // Default icon for custom triggers
    };
    
    setTriggers(prev => [...prev, newEntry]);
    setNewTrigger('');
    Keyboard.dismiss();

    // Animate the add button
    Animated.sequence([
      Animated.timing(addButtonScale, {
        toValue: 1.2,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(addButtonScale, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const renderTriggerItem = ({ item }) => (
    <TouchableOpacity
      style={[
        styles.triggerItem, 
        item.selected && styles.triggerSelected,
        { borderLeftColor: item.selected ? '#4CAF50' : '#E0E0E0' }
      ]}
      onPress={() => toggleTrigger(item.id)}
      activeOpacity={0.8}
    >
      <View style={styles.triggerContent}>
        <Ionicons 
          name={item.icon} 
          size={24} 
          color={item.selected ? '#4CAF50' : '#555'} 
          style={styles.triggerIcon}
        />
        <Text style={[
          styles.triggerText,
          item.selected && styles.triggerTextSelected
        ]}>
          {item.name}
        </Text>
      </View>
      <Ionicons
        name={item.selected ? 'checkbox' : 'square-outline'}
        size={24}
        color={item.selected ? '#4CAF50' : '#999'}
      />
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        {/* Header with Back Button */}
        <View style={styles.header}>
          <TouchableOpacity 
            onPress={() => navigation.goBack()}
            style={styles.backButton}
          >
            <Ionicons name="chevron-back" size={28} color="#000" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Identify Triggers</Text>
          <View style={styles.headerRight} />
        </View>

        <Text style={styles.subtitle}>
          Select your common triggers to develop coping strategies
        </Text>

        {/* Triggers List */}
        <FlatList
          data={triggers}
          keyExtractor={(item) => item.id}
          renderItem={renderTriggerItem}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <Text style={styles.emptyText}>No triggers added yet</Text>
          }
        />

        {/* Add Trigger Section */}
        <View style={styles.addSection}>
          <TextInput
            ref={inputRef}
            style={styles.input}
            placeholder="Add a new trigger..."
            placeholderTextColor="#999"
            value={newTrigger}
            onChangeText={setNewTrigger}
            onSubmitEditing={handleAddTrigger}
            returnKeyType="done"
          />
        
          <Animated.View style={{ transform: [{ scale: addButtonScale }] }}>
            <TouchableOpacity 
              style={styles.addButton} 
              onPress={handleAddTrigger}
              disabled={!newTrigger.trim()}
            >
              <Ionicons name="add" size={24} color="white" />
            </TouchableOpacity>
          </Animated.View>
        </View>

        {/* Action Button */}
        {triggers.some(t => t.selected) && (
          <TouchableOpacity 
            style={styles.actionButton}
            onPress={() => navigation.navigate('CopingStrategies')}
          >
            <Text style={styles.actionButtonText}>View Coping Strategies</Text>
            <Ionicons name="arrow-forward" size={20} color="white" />
          </TouchableOpacity>
        )}
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
    paddingHorizontal: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 15,
    marginBottom: 10,
  },
  backButton: {
    padding: 5,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#000',
  },
  headerRight: {
    width: 28,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 20,
    paddingHorizontal: 20,
  },
  listContent: {
    paddingBottom: 20,
  },
  triggerItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
    borderRadius: 10,
    backgroundColor: '#fff',
    marginBottom: 12,
    borderLeftWidth: 5,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 5,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  triggerSelected: {
    backgroundColor: '#F5FDF7',
  },
  triggerContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  triggerIcon: {
    marginRight: 12,
  },
  triggerText: {
    fontSize: 16,
    color: '#333',
  },
  triggerTextSelected: {
    color: '#000',
    fontWeight: '500',
  },
  emptyText: {
    textAlign: 'center',
    color: '#999',
    fontSize: 16,
    marginTop: 40,
  },
  addSection: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
    backgroundColor: '#fff',
    padding: 12,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 5,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: '#333',
    padding: 8,
  },
  addButton: {
    backgroundColor: '#000',
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 10,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#000',
    padding: 15,
    borderRadius: 10,
    marginTop: 20,
    marginBottom: 30,
  },
  actionButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    marginRight: 10,
  },
});

export default TriggersScreen;