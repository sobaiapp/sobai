import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  ScrollView, 
  StyleSheet, 
  Alert,
  SafeAreaView,
  FlatList,
  Keyboard
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';
import * as Haptics from 'expo-haptics';

const RelapsePreventionScreen = () => {
  const navigation = useNavigation();
  const [strategies, setStrategies] = useState([]);
  const [newStrategy, setNewStrategy] = useState('');
  const [triggers, setTriggers] = useState([]);
  const [activeTab, setActiveTab] = useState('strategies');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [storedStrategies, storedTriggers] = await Promise.all([
        AsyncStorage.getItem('relapseStrategies'),
        AsyncStorage.getItem('triggers')
      ]);
      
      if (storedStrategies) setStrategies(JSON.parse(storedStrategies));
      if (storedTriggers) setTriggers(JSON.parse(storedTriggers));
    } catch (error) {
      console.error('Error loading data:', error);
      Alert.alert('Error', 'Failed to load your data');
    }
  };

  const saveStrategies = async (updatedStrategies) => {
    try {
      await AsyncStorage.setItem('relapseStrategies', JSON.stringify(updatedStrategies));
    } catch (error) {
      console.error('Error saving strategies:', error);
      Alert.alert('Error', 'Failed to save your strategy');
    }
  };

  const addStrategy = async () => {
    if (!newStrategy.trim()) {
      Alert.alert('Required', 'Please enter a strategy');
      return;
    }

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    const updatedStrategies = [...strategies, newStrategy];
    setStrategies(updatedStrategies);
    setNewStrategy('');
    await saveStrategies(updatedStrategies);
    Keyboard.dismiss();
  };

  const removeStrategy = async (index) => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    Alert.alert(
      'Remove Strategy',
      'Are you sure you want to remove this strategy?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: async () => {
            const updatedStrategies = strategies.filter((_, i) => i !== index);
            setStrategies(updatedStrategies);
            await saveStrategies(updatedStrategies);
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
          },
        },
      ]
    );
  };

  const renderStrategyItem = ({ item, index }) => (
    <View style={styles.strategyItem}>
      <View style={styles.bulletPoint} />
      <Text style={styles.strategyText}>{item}</Text>
      <TouchableOpacity 
        onPress={() => removeStrategy(index)}
        style={styles.deleteButton}
      >
        <Ionicons name="close" size={20} color="#d9534f" />
      </TouchableOpacity>
    </View>
  );

  const renderTriggerItem = ({ item, index }) => (
    <View style={styles.triggerItem}>
      <View style={styles.bulletPoint} />
      <Text style={styles.triggerText}>{item}</Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container}>
        {/* Header with Back Button */}
        <View style={styles.header}>
          <TouchableOpacity 
            onPress={() => navigation.goBack()}
            style={styles.backButton}
          >
            <Ionicons name="chevron-back" size={28} color="#000" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Relapse Prevention</Text>
          <View style={styles.headerRight} />
        </View>

        <Text style={styles.subtitle}>"Every step forward is progress"</Text>

        {/* Tab Navigation */}
        <View style={styles.tabContainer}>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'strategies' && styles.activeTab]}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              setActiveTab('strategies');
            }}
          >
            <Text style={[styles.tabText, activeTab === 'strategies' && styles.activeTabText]}>
              Strategies
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'triggers' && styles.activeTab]}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              setActiveTab('triggers');
            }}
          >
            <Text style={[styles.tabText, activeTab === 'triggers' && styles.activeTabText]}>
              Triggers
            </Text>
          </TouchableOpacity>
        </View>

        {/* Content */}
        {activeTab === 'strategies' ? (
          <View style={styles.contentCard}>
            <Text style={styles.sectionTitle}>Your Coping Strategies</Text>
            
            {strategies.length === 0 ? (
              <View style={styles.emptyState}>
                <Ionicons name="lightbulb-outline" size={40} color="#ccc" />
                <Text style={styles.emptyText}>No strategies added yet</Text>
                <Text style={styles.emptySubtext}>Add your personal coping strategies below</Text>
              </View>
            ) : (
              <FlatList
                data={strategies}
                renderItem={renderStrategyItem}
                keyExtractor={(item, index) => index.toString()}
                scrollEnabled={false}
              />
            )}

            <View style={styles.inputContainer}>
              <TextInput
                style={styles.input}
                placeholder="Add a new strategy..."
                placeholderTextColor="#999"
                value={newStrategy}
                onChangeText={setNewStrategy}
                onSubmitEditing={addStrategy}
                returnKeyType="done"
              />
              <TouchableOpacity 
                style={styles.addButton}
                onPress={addStrategy}
                disabled={!newStrategy.trim()}
              >
                <Ionicons name="add" size={24} color="#fff" />
              </TouchableOpacity>
            </View>
          </View>
        ) : (
          <View style={styles.contentCard}>
            <Text style={styles.sectionTitle}>Your Triggers</Text>
            
            {triggers.length === 0 ? (
              <View style={styles.emptyState}>
                <Ionicons name="alert-circle-outline" size={40} color="#ccc" />
                <Text style={styles.emptyText}>No triggers identified yet</Text>
                <Text style={styles.emptySubtext}>Triggers will appear here when added</Text>
              </View>
            ) : (
              <FlatList
                data={triggers}
                renderItem={renderTriggerItem}
                keyExtractor={(item, index) => index.toString()}
                scrollEnabled={false}
              />
            )}

            <TouchableOpacity 
              style={styles.addTriggerButton}
              onPress={() => navigation.navigate('Triggers')}
            >
              <Text style={styles.addTriggerButtonText}>Manage Triggers</Text>
              <Ionicons name="chevron-forward" size={20} color="#000" />
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#fff',
    marginTop: -13
  },
  container: {
    flexGrow: 1,
    paddingBottom: 30,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
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
    textAlign: 'center',
    color: '#666',
    marginTop: 5,
    marginBottom: 20,
    fontStyle: 'italic',
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    marginHorizontal: 15,
    borderRadius: 10,
    overflow: 'hidden',
    marginBottom: 15,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 5,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  tab: {
    flex: 1,
    paddingVertical: 15,
    alignItems: 'center',
  },
  activeTab: {
    backgroundColor: '#f0f0f0',
    borderBottomWidth: 3,
    borderBottomColor: '#000',
  },
  tabText: {
    fontSize: 16,
    color: '#555',
    fontWeight: '500',
  },
  activeTabText: {
    color: '#000',
    fontWeight: '600',
  },
  contentCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    marginHorizontal: 15,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
  },
  strategyItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#f5f5f5',
  },
  bulletPoint: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#4CAF50',
    marginRight: 12,
  },
  strategyText: {
    flex: 1,
    fontSize: 16,
    color: '#333',
  },
  deleteButton: {
    padding: 5,
    marginLeft: 10,
  },
  triggerItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#f5f5f5',
  },
  triggerText: {
    flex: 1,
    fontSize: 16,
    color: '#333',
    marginLeft: 12,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 20,
    backgroundColor: '#f5f5f5',
    borderRadius: 10,
    paddingHorizontal: 15,
  },
  input: {
    flex: 1,
    paddingVertical: 12,
    fontSize: 16,
    color: '#333',
  },
  addButton: {
    backgroundColor: '#000',
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 30,
  },
  emptyText: {
    fontSize: 16,
    color: '#999',
    marginTop: 10,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#ccc',
    marginTop: 5,
  },
  addTriggerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 20,
    padding: 12,
    backgroundColor: '#f0f0f0',
    borderRadius: 10,
  },
  addTriggerButtonText: {
    fontSize: 16,
    color: '#000',
    fontWeight: '500',
    marginRight: 5,
  },
});

export default RelapsePreventionScreen;