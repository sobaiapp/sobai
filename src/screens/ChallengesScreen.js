import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, Alert, ScrollView } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ProgressBar } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';

const ChallengesScreen = () => {
  const navigation = useNavigation();
  const [activeChallenges, setActiveChallenges] = useState([]);
  const [completedChallenges, setCompletedChallenges] = useState([]);
  const [loading, setLoading] = useState(true);

  // Load saved challenges on component mount
  useEffect(() => {
    const loadChallenges = async () => {
      try {
        const savedActive = await AsyncStorage.getItem('@activeChallenges');
        const savedCompleted = await AsyncStorage.getItem('@completedChallenges');
        
        if (savedActive) setActiveChallenges(JSON.parse(savedActive));
        if (savedCompleted) setCompletedChallenges(JSON.parse(savedCompleted));
      } catch (error) {
        console.error('Error loading challenges:', error);
      } finally {
        setLoading(false);
      }
    };
    
    loadChallenges();
  }, []);

  // Save challenges whenever they change
  useEffect(() => {
    if (!loading) {
      AsyncStorage.setItem('@activeChallenges', JSON.stringify(activeChallenges));
      AsyncStorage.setItem('@completedChallenges', JSON.stringify(completedChallenges));
    }
  }, [activeChallenges, completedChallenges, loading]);

  // Available challenges
  const availableChallenges = [
    {
      id: '1',
      title: '7 Days Without Sugar',
      description: 'Quit sugar for 7 days and feel the difference!',
      imageUrl: 'https://img.freepik.com/free-vector/eating-donuts-concept-illustration_114360-5213.jpg',
      category: 'Nutrition',
      duration: 7,
    },
    {
      id: '2',
      title: '30 Days of Meditation',
      description: 'Practice mindfulness every day for 30 days!',
      imageUrl: 'https://img.freepik.com/free-vector/man-meditating-concept_23-2148508453.jpg',
      category: 'Mental Wellness',
      duration: 30,
    },
    {
      id: '3',
      title: '14 Days of Exercise',
      description: 'Get active for 14 days in a row!',
      imageUrl: 'https://img.freepik.com/free-vector/coach-concept-illustration_114360-28592.jpg',
      category: 'Fitness',
      duration: 14,
    },
    {
      id: '4',
      title: '5 Days Without Alcohol',
      description: 'Take a break from alcohol for 5 days!',
      imageUrl: 'https://img.freepik.com/free-vector/social-distancing-restaurant_23-2148548336.jpg',
      category: 'Sobriety',
      duration: 5,
    },
    {
      id: '5',
      title: '21 Days of Yoga',
      description: 'Commit to 21 days of yoga practice!',
      imageUrl: 'https://img.freepik.com/free-vector/flat-illustration-international-yoga-day-celebration_23-2150384558.jpg',
      category: 'Fitness',
      duration: 21,
    },
    {
      id: '6',
      title: '14 Days of Reading',
      description: 'Read at least 10 pages every day for 14 days!',
      imageUrl: 'https://img.freepik.com/free-vector/hand-drawn-flat-design-literature-illustration_23-2149292129.jpg',
      category: 'Mental Wellness',
      duration: 14,
    },
    {
      id: '7',
      title: '7 Days Without Junk Food',
      description: 'Say no to junk food for 7 days!',
      imageUrl: 'https://img.freepik.com/free-vector/healthy-food-vs-fast-food-concept-illustration_114360-13379.jpg',
      category: 'Nutrition',
      duration: 7,
    },
    {
      id: '8',
      title: '30 Days of Hydration',
      description: 'Drink at least 2 liters of water every day for 30 days!',
      imageUrl: 'https://img.freepik.com/free-vector/drinking-water-concept-illustration_114360-10607.jpg',
      category: 'Fitness',
      duration: 30,
    },
  ];

  // Start a new challenge
  const startChallenge = (challenge) => {
    const alreadyActive = activeChallenges.some(c => c.id === challenge.id);
    if (alreadyActive) {
      Alert.alert('Already Active', 'You have already started this challenge!');
      return;
    }

    const newChallenge = {
      ...challenge,
      startDate: new Date().toISOString(),
      completedDays: 0,
      dailyCheckins: Array(challenge.duration).fill(false)
    };

    setActiveChallenges([...activeChallenges, newChallenge]);
    Alert.alert('Challenge Started', `You've started: ${challenge.title}`);
  };

  // Mark a day as completed
  const toggleDayComplete = (challengeId, dayIndex) => {
    setActiveChallenges(prev => prev.map(challenge => {
      if (challenge.id === challengeId) {
        const updatedCheckins = [...challenge.dailyCheckins];
        updatedCheckins[dayIndex] = !updatedCheckins[dayIndex];
        
        const completedDays = updatedCheckins.filter(Boolean).length;
        const isCompleted = completedDays === challenge.duration;
        
        if (isCompleted) {
          // Move to completed challenges
          setCompletedChallenges([...completedChallenges, {
            ...challenge,
            completedDays,
            dailyCheckins: updatedCheckins,
            endDate: new Date().toISOString()
          }]);
          
          // Remove from active challenges
          return null;
        }
        
        return {
          ...challenge,
          completedDays,
          dailyCheckins: updatedCheckins
        };
      }
      return challenge;
    }).filter(Boolean)); // Filter out null values (completed challenges)
  };

  // Delete an active challenge
  const deleteActiveChallenge = (challengeId) => {
    Alert.alert(
      'Delete Challenge',
      'Are you sure you want to delete this active challenge?',
      [
        {
          text: 'Cancel',
          style: 'cancel'
        },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            setActiveChallenges(activeChallenges.filter(c => c.id !== challengeId));
          }
        }
      ]
    );
  };

  // Delete a completed challenge
  const deleteCompletedChallenge = (challengeId) => {
    Alert.alert(
      'Delete Challenge',
      'Are you sure you want to delete this completed challenge?',
      [
        {
          text: 'Cancel',
          style: 'cancel'
        },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            setCompletedChallenges(completedChallenges.filter(c => c.id !== challengeId));
          }
        }
      ]
    );
  };

  // Clear all completed challenges
  const clearAllCompleted = () => {
    if (completedChallenges.length === 0) return;
    
    Alert.alert(
      'Clear All Completed',
      'Are you sure you want to delete all completed challenges?',
      [
        {
          text: 'Cancel',
          style: 'cancel'
        },
        {
          text: 'Clear All',
          style: 'destructive',
          onPress: () => {
            setCompletedChallenges([]);
          }
        }
      ]
    );
  };

  // Calculate progress for a challenge
  const calculateProgress = (challenge) => {
    return challenge.completedDays / challenge.duration;
  };

  // Group challenges by category
  const groupByCategory = (challenges) => {
    return challenges.reduce((result, challenge) => {
      (result[challenge.category] = result[challenge.category] || []).push(challenge);
      return result;
    }, {});
  };

  const groupedAvailableChallenges = groupByCategory(availableChallenges);
  const groupedActiveChallenges = groupByCategory(activeChallenges);

  // Format date
  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Text>Loading your challenges...</Text>
      </View>
    );
  }

  return (
    <View style={styles.fullContainer}>
      {/* Header with Back Button */}
      <View style={styles.headerContainer}>
        <TouchableOpacity 
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          <Text style={styles.backButtonText}>←</Text>
        </TouchableOpacity>
        <Text style={styles.header}>Challenges & Goals</Text>
      </View>
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        {/* Active Challenges Section */}
        {activeChallenges.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionHeader}>Your Active Challenges</Text>
            
            {Object.keys(groupedActiveChallenges).map((category, categoryIndex) => (
              <View key={`active-${categoryIndex}`} style={styles.challengeCategory}>
                <Text style={styles.categoryHeading}>{category}</Text>
                
                {groupedActiveChallenges[category].map((challenge, index) => (
                  <View key={`active-${index}`} style={styles.activeCard}>
                    <View style={styles.activeCardHeader}>
                      <Image source={{ uri: challenge.imageUrl }} style={styles.activeCardImage} />
                      <View style={styles.activeCardInfo}>
                        <Text style={styles.activeCardTitle}>{challenge.title}</Text>
                        <Text style={styles.activeCardDates}>
                          Started: {formatDate(challenge.startDate)}
                        </Text>
                        <Text style={styles.activeCardProgress}>
                          {challenge.completedDays}/{challenge.duration} days completed
                        </Text>
                      </View>
                      <TouchableOpacity 
                        onPress={() => deleteActiveChallenge(challenge.id)}
                        style={styles.deleteButton}
                      >
                        <Text style={styles.deleteButtonText}>×</Text>
                      </TouchableOpacity>
                    </View>
                    
                    <ProgressBar 
                      progress={calculateProgress(challenge)} 
                      color="#4CAF50"
                      style={styles.progressBar}
                    />
                    
                    <Text style={styles.dailyCheckinsTitle}>Daily Check-ins:</Text>
                    <View style={styles.dailyCheckinsContainer}>
                      {challenge.dailyCheckins.map((completed, dayIndex) => (
                        <TouchableOpacity 
                          key={dayIndex}
                          onPress={() => toggleDayComplete(challenge.id, dayIndex)}
                          style={styles.dayButton}
                        >
                          <View style={[
                            styles.dayBox,
                            completed && styles.dayBoxCompleted
                          ]}>
                            <Text style={styles.dayText}>{dayIndex + 1}</Text>
                          </View>
                        </TouchableOpacity>
                      ))}
                    </View>
                  </View>
                ))}
              </View>
            ))}
          </View>
        )}

        {/* Available Challenges Section */}
        <View style={styles.section}>
          <Text style={styles.sectionHeader}>Available Challenges</Text>
          
          {Object.keys(groupedAvailableChallenges).map((category, categoryIndex) => (
            <View key={`available-${categoryIndex}`} style={styles.challengeCategory}>
              <Text style={styles.categoryHeading}>{category}</Text>
              
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.row}>
                {groupedAvailableChallenges[category].map((challenge, index) => {
                  const isActive = activeChallenges.some(c => c.id === challenge.id);
                  return (
                    <View key={`available-${index}`} style={styles.card}>
                      <Image source={{ uri: challenge.imageUrl }} style={styles.cardImage} />
                      <Text style={styles.cardTitle}>{challenge.title}</Text>
                      <Text style={styles.cardDescription}>{challenge.description}</Text>
                      <Text style={styles.cardDuration}>{challenge.duration} days</Text>
                      
                      <TouchableOpacity
                        style={[
                          styles.cardButton,
                          isActive && styles.cardButtonDisabled
                        ]}
                        onPress={() => startChallenge(challenge)}
                        disabled={isActive}
                      >
                        <Text style={styles.cardButtonText}>
                          {isActive ? 'Already Started' : 'Start Challenge'}
                        </Text>
                      </TouchableOpacity>
                    </View>
                  );
                })}
              </ScrollView>
            </View>
          ))}
        </View>

        {/* Completed Challenges Section */}
        {completedChallenges.length > 0 && (
          <View style={styles.section}>
            <View style={styles.completedHeader}>
              <Text style={styles.sectionHeader}>Completed Challenges</Text>
              <TouchableOpacity onPress={clearAllCompleted}>
                <Text style={styles.clearAllText}>Clear All</Text>
              </TouchableOpacity>
            </View>
            
            {completedChallenges.map((challenge, index) => (
              <View key={`completed-${index}`} style={styles.completedCard}>
                <View style={styles.completedCardHeader}>
                  <Text style={styles.completedCardTitle}>{challenge.title}</Text>
                  <TouchableOpacity 
                    onPress={() => deleteCompletedChallenge(challenge.id)}
                    style={styles.deleteButton}
                  >
                    <Text style={styles.deleteButtonText}>×</Text>
                  </TouchableOpacity>
                </View>
                <Text style={styles.completedCardText}>
                  Completed on: {formatDate(challenge.endDate)}
                </Text>
                <Text style={styles.completedCardText}>
                  Duration: {challenge.duration} days
                </Text>
              </View>
            ))}
          </View>
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  fullContainer: {
    flex: 1,
    backgroundColor: '#f9f9f9',
    marginTop: -13

  },
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 50,
    paddingHorizontal: 20,
    paddingBottom: 10,
    backgroundColor: '#f9f9f9',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  backButton: {
    marginRight: 15,
    padding: 5,
  },
  backButtonText: {
    fontSize: 28,
    color: '#000',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    fontFamily: 'Helvetica Neue',
  },
  subtitle: {
    fontSize: 16,
    marginBottom: 20,
    color: '#4a4a4a',
    fontFamily: 'Helvetica Neue',
    paddingHorizontal: 20,
  },
  container: {
    flex: 1,
    backgroundColor: '#f9f9f9',
  },
  section: {
    marginBottom: 30,
    paddingHorizontal: 20,
  },
  sectionHeader: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 15,
    color: '#333',
    fontFamily: 'Helvetica Neue',
  },
  challengeCategory: {
    marginBottom: 25,
  },
  categoryHeading: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 10,
    color: '#000',
    fontFamily: 'Helvetica Neue',
  },
  row: {
    flexDirection: 'row',
    marginBottom: 10,
  },
  card: {
    width: 280,
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 10,
    marginRight: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
  },
  cardImage: {
    width: '100%',
    height: 120,
    borderRadius: 8,
    marginBottom: 10,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  cardDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 5,
  },
  cardDuration: {
    fontSize: 14,
    color: '#888',
    marginBottom: 10,
    fontStyle: 'italic',
  },
  cardButton: {
    backgroundColor: '#000',
    paddingVertical: 10,
    borderRadius: 25,
    alignItems: 'center',
  },
  cardButtonDisabled: {
    backgroundColor: '#888',
  },
  cardButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  activeCard: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 10,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
  },
  activeCardHeader: {
    flexDirection: 'row',
    marginBottom: 10,
  },
  activeCardImage: {
    width: 80,
    height: 80,
    borderRadius: 8,
    marginRight: 10,
  },
  activeCardInfo: {
    flex: 1,
    justifyContent: 'center',
  },
  activeCardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  activeCardDates: {
    fontSize: 12,
    color: '#666',
    marginBottom: 3,
  },
  activeCardProgress: {
    fontSize: 14,
    color: '#4CAF50',
    fontWeight: '600',
  },
  progressBar: {
    height: 10,
    borderRadius: 5,
    backgroundColor: '#e0e0e0',
    marginBottom: 15,
  },
  dailyCheckinsTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 10,
    color: '#333',
  },
  dailyCheckinsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  dayButton: {
    width: '12%',
    aspectRatio: 1,
    marginBottom: 8,
  },
  dayBox: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f0f0f0',
    borderRadius: 4,
  },
  dayBoxCompleted: {
    backgroundColor: '#4CAF50',
  },
  dayText: {
    fontSize: 12,
    color: '#333',
  },
  completedCard: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  completedCardTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  completedCardText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 3,
  },
  deleteButton: {
    padding: 5,
    marginLeft: 10,
  },
  deleteButtonText: {
    fontSize: 24,
    color: '#ff4444',
  },
  completedHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  clearAllText: {
    color: '#ff4444',
    fontSize: 16,
  },
  completedCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 5,
  },
});

export default ChallengesScreen;