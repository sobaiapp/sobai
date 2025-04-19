import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  SafeAreaView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useNavigation } from '@react-navigation/native';

const COPING_STRATEGIES = [
  {
    id: '1',
    title: 'Deep Breathing',
    description: 'Practice 4-7-8 breathing technique to calm your mind and body.',
    icon: 'leaf',
    steps: [
      'Inhale deeply through your nose for 4 seconds',
      'Hold your breath for 7 seconds',
      'Exhale slowly through your mouth for 8 seconds',
      'Repeat 4-5 times'
    ]
  },
  {
    id: '2',
    title: 'Mindful Walking',
    description: 'Take a short walk while focusing on your surroundings.',
    icon: 'walk',
    steps: [
      'Find a quiet place to walk',
      'Focus on the sensation of your feet touching the ground',
      'Notice the sights, sounds, and smells around you',
      'If your mind wanders, gently bring it back to the present'
    ]
  },
  {
    id: '3',
    title: 'Progressive Muscle Relaxation',
    description: 'Systematically tense and relax different muscle groups.',
    icon: 'body',
    steps: [
      'Start with your toes and work your way up',
      'Tense each muscle group for 5 seconds',
      'Release and notice the difference',
      'Move to the next muscle group'
    ]
  },
  {
    id: '4',
    title: 'Gratitude Journaling',
    description: 'Write down things you are grateful for.',
    icon: 'journal',
    steps: [
      'Find a quiet place to write',
      'List 3-5 things you are grateful for',
      'Be specific and detailed',
      'Reflect on how these things make you feel'
    ]
  },
  {
    id: '5',
    title: '5-4-3-2-1 Grounding',
    description: 'Use your senses to ground yourself in the present moment.',
    icon: 'eye',
    steps: [
      'Name 5 things you can see',
      'Name 4 things you can touch',
      'Name 3 things you can hear',
      'Name 2 things you can smell',
      'Name 1 thing you can taste'
    ]
  }
];

const CopingStrategiesScreen = () => {
  const navigation = useNavigation();
  const [selectedStrategy, setSelectedStrategy] = useState(null);

  const renderStrategy = ({ item }) => (
    <TouchableOpacity
      style={styles.strategyCard}
      onPress={() => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        setSelectedStrategy(item);
      }}
    >
      <View style={styles.strategyHeader}>
        <Ionicons name={item.icon} size={24} color="#4A90E2" />
        <Text style={styles.strategyTitle}>{item.title}</Text>
      </View>
      <Text style={styles.strategyDescription}>{item.description}</Text>
    </TouchableOpacity>
  );

  const renderStrategyDetail = () => {
    if (!selectedStrategy) return null;

    return (
      <View style={styles.detailModal}>
        <View style={styles.detailHeader}>
          <Text style={styles.detailTitle}>{selectedStrategy.title}</Text>
          <TouchableOpacity
            onPress={() => setSelectedStrategy(null)}
            style={styles.closeButton}
          >
            <Ionicons name="close" size={24} color="#000" />
          </TouchableOpacity>
        </View>
        <Text style={styles.detailDescription}>{selectedStrategy.description}</Text>
        <Text style={styles.stepsTitle}>Steps:</Text>
        {selectedStrategy.steps.map((step, index) => (
          <View key={index} style={styles.stepItem}>
            <Text style={styles.stepNumber}>{index + 1}.</Text>
            <Text style={styles.stepText}>{step}</Text>
          </View>
        ))}
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={styles.backButton}
          >
            <Ionicons name="chevron-back" size={28} color="#000" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Coping Strategies</Text>
          <View style={styles.headerRight} />
        </View>

        <FlatList
          data={COPING_STRATEGIES}
          renderItem={renderStrategy}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.listContainer}
        />

        {renderStrategyDetail()}
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
    fontSize: 20,
    fontWeight: 'bold',
    color: '#000',
  },
  headerRight: {
    width: 28,
  },
  listContainer: {
    padding: 15,
  },
  strategyCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 15,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 5,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
  },
  strategyHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  strategyTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#000',
    marginLeft: 10,
  },
  strategyDescription: {
    fontSize: 14,
    color: '#555',
    lineHeight: 20,
  },
  detailModal: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    maxHeight: '80%',
  },
  detailHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  detailTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#000',
  },
  closeButton: {
    padding: 8,
  },
  detailDescription: {
    fontSize: 16,
    color: '#555',
    marginBottom: 20,
    lineHeight: 24,
  },
  stepsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 10,
  },
  stepItem: {
    flexDirection: 'row',
    marginBottom: 10,
  },
  stepNumber: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#4A90E2',
    marginRight: 10,
  },
  stepText: {
    fontSize: 16,
    color: '#555',
    flex: 1,
    lineHeight: 24,
  },
});

export default CopingStrategiesScreen; 