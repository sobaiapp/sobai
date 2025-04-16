import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Image } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/Ionicons';

// Import your mindfulness screen
import MindfulnessScreen from './MindfulnessScreen'; // Adjust the path as necessary

const MeditationScreen = () => {
  const navigation = useNavigation();

  // Replace with images from Pexels
  const images = [
    'https://img.freepik.com/free-vector/user-practicing-mindfulness-meditation-lotus-pose-mindful-meditating-mental-calmness-self-consciousness-focusing-releasing-stress-concept-vector-isolated-illustration_335657-2250.jpg?t=st=1742180106~exp=1742183706~hmac=c0d03a4f5294579c9745d3ad6995546df4280b18e4e7363d02777cdce3e80fd1&w=996', // Mindfulness
    'https://img.freepik.com/free-vector/businessman-work-from-home-sits-with-crossed-legs-meditates-house-dressed-home-clothes-flat-illustration_1150-41122.jpg?t=st=1742180188~exp=1742183788~hmac=16c4647dbaad28671e775e6c07511ddd4d5285b34e167536f77b97251cce4467&w=740', // Guided Meditation
    'https://img.freepik.com/free-vector/breathing-exercise-concept-illustration_114360-8960.jpg?t=st=1742180289~exp=1742183889~hmac=8279696d67a41a1a840d89963af60218a97c3f4743fbf9d150ad09609ce548ee&w=740', // Breathing Exercise
    'https://img.freepik.com/free-vector/hand-drawn-mindfulness-concept-with-characters_52683-69073.jpg?t=st=1742180377~exp=1742183977~hmac=b1242e06be130f761943cdd6e72a790c9ca6af51926c08a1c4bb1ffb79ce1999&w=740', // Visualization
    'https://img.freepik.com/free-vector/insomnia-concept-with-woman-sheep_23-2148658207.jpg?t=st=1742180425~exp=1742184025~hmac=4f61e97299e58ddb8c59344d84cb301246d4c6b134fb065b73f50bbed9718dbb&w=740',
    'https://img.freepik.com/free-vector/flat-happy-teen-girl-headphones-sitting-home-bean-bag-chair-using-smartphone-online-education-woman-relaxing-listening-music-audio-podcast-radio-audiobook-mobile-phone_88138-540.jpg?t=st=1742180504~exp=1742184104~hmac=db7aec0a916fadd0a02bb4f1c02bce7c4f30357a906e17428fdf2ff14ea93b4b&w=826',
    'https://img.freepik.com/free-vector/holistic-medicine-abstract-concept-vector-illustration-alternative-natural-medicine-holistic-mental-therapy-whole-body-treatment-health-practice-disease-integrative-doctor-abstract-metaphor_335657-4142.jpg?t=st=1742180563~exp=1742184163~hmac=ec4eeeef041bc6c07eeb58a117bd1ae239a79dde893813b0f006d1e3b5cc179e&w=740',
    'https://img.freepik.com/free-vector/breathing-exercise-concept-illustration_114360-8920.jpg?t=st=1742180601~exp=1742184201~hmac=28b34af6e30992f69c3133b8839a1fda385721acd1c387fc1a6be208547a729a&w=740',
    'https://img.freepik.com/free-vector/training-home-concept_23-2148479238.jpg?uid=R191926172&ga=GA1.1.243460665.1742179649&semt=ais_hybrid',
    'https://img.freepik.com/free-vector/organic-flat-people-meditating-illustration_23-2148922436.jpg?uid=R191926172&ga=GA1.1.243460665.1742179649&semt=ais_hybrid',
    'https://img.freepik.com/free-vector/healthy-woman-cartoon-self-care-illustration-vector_53876-156457.jpg?uid=R191926172&ga=GA1.1.243460665.1742179649&semt=ais_hybrid',
    'https://img.freepik.com/free-vector/flat-design-business-person-meditating_23-2148910162.jpg?uid=R191926172&ga=GA1.1.243460665.1742179649&semt=ais_hybrid'
  ];

  const meditationCategories = [
    {
      title: 'Meditation',
      items: [
        { title: 'Mindfulness', description: 'Focus on your breath and the present moment.', image: images[0] },
        { title: 'Guided Meditation', description: 'Follow a guide to help you meditate and relax.', image: images[1] },
        { title: 'Breathing Exercise', description: 'Focus on your breath to relax and center yourself.', image: images[2] },
        { title: 'Visualization', description: 'Visualize a peaceful place to calm your mind.', image: images[3] },
      ],
    },
    {
      title: 'Sleep Meditation',
      items: [
        { title: 'Deep Sleep', description: 'Relax your body for a peaceful night\'s sleep.', image: images[4] },
        { title: 'Relaxing Sounds', description: 'Listen to soothing sounds to help you fall asleep.', image: images[5] },
        { title: 'Body Scan', description: 'A meditation to relax your entire body.', image: images[6] },
        { title: 'Breath Focus', description: 'Focus on your breath to fall into a deep sleep.', image: images[7] },
      ],
    },
    {
      title: 'Stress Relief Meditation',
      items: [
        { title: 'Progressive Muscle Relaxation', description: 'Relax each muscle group to relieve stress.', image: images[8] },
        { title: 'Stress-Free Breathing', description: 'A breathing exercise to calm your nerves.', image: images[9] },
        { title: 'Self-Compassion Meditation', description: 'Focus on kindness and compassion towards yourself.', image: images[10] },
        { title: 'Guided Relaxation', description: 'A guided session to release stress from your body and mind.', image: images[11] },
      ],
    },
  ];

  return (
    
    <ScrollView contentContainerStyle={styles.container}>
      {/* Back button */}
      <View style={styles.topSection}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Icon name="arrow-back-outline" size={28} color="black" />
        </TouchableOpacity>
      </View>

      {/* Meditation Categories */}
      {meditationCategories.map((category, index) => (
        <View key={index} style={styles.categorySection}>
          <Text style={styles.categoryHeader}>{category.title}</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {category.items.map((item, idx) => (
              <TouchableOpacity
                key={idx}
                style={styles.card}
                onPress={() => {
                  if (item.title === 'Mindfulness') {
                    navigation.navigate('Mindfulness'); // Navigate to MindfulnessScreen
                  } else if (item.title === 'Guided Meditation') {
                    navigation.navigate('GuidedMeditation'); // Navigate to GuidedMeditationScreen
                  }
                  else if (item.title === 'Breathing Exercise') {
                    navigation.navigate('Breathing'); // Navigate to GuidedMeditationScreen
                  }
                  else if (item.title === 'Visualization') {
                    navigation.navigate('Visualization'); // Navigate to GuidedMeditationScreen
                  }
                }}
              >
                <Image source={{ uri: item.image }} style={styles.cardImage} />
                <Text style={styles.cardTitle}>{item.title}</Text>
                <Text style={styles.cardDescription}>{item.description}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      ))}
    </ScrollView>
  );
};

export default MeditationScreen;

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: '#f1f1f1',
    paddingTop: 60,
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  topSection: {
    width: '100%',
    paddingBottom: 40,
    alignItems: 'center',
  },
  backButton: {
    position: 'absolute',
    top: 0,
    left: 10,
    zIndex: 10,
  },
  cardsContainer: {
    marginTop: 20,
    marginBottom: 20,
  },
  card: {
    width: 300,
    backgroundColor: '#fff',
    padding: 15,
    marginRight: 15,
    marginBottom: 15,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
  },
  cardImage: {
    width: '100%',
    height: 120,
    borderRadius: 10,
    marginBottom: 10,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  cardDescription: {
    fontSize: 14,
    color: '#555',
  },
  categorySection: {
    marginTop: 20,
  },
  categoryHeader: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
  },
});
