import React from 'react';
import { 
  View, 
  Text, 
  ScrollView, 
  TouchableOpacity, 
  Linking, 
  StyleSheet,
  SafeAreaView,
  Image
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import * as Haptics from 'expo-haptics';

const resources = [
  { 
    title: 'Alcoholics Anonymous (AA)', 
    url: 'https://www.aa.org/',
    description: 'International fellowship for alcohol addiction recovery',
    icon: 'people'
  },
  { 
    title: 'Narcotics Anonymous (NA)', 
    url: 'https://www.na.org/',
    description: 'Community-based recovery for drug addiction',
    icon: 'medkit'
  },
  { 
    title: 'SMART Recovery', 
    url: 'https://www.smartrecovery.org/',
    description: 'Science-based addiction recovery program',
    icon: 'flask'
  },
  { 
    title: 'SAMHSA National Helpline', 
    url: 'https://www.samhsa.gov/find-help/national-helpline',
    description: 'Free, confidential treatment referral service',
    icon: 'call'
  },
  { 
    title: 'Recovery Dharma', 
    url: 'https://recoverydharma.org/',
    description: 'Buddhist-inspired recovery approach',
    icon: 'leaf'
  },
  { 
    title: 'Refuge Recovery', 
    url: 'https://www.refugerecovery.org/',
    description: 'Mindfulness-based recovery program',
    icon: 'body'
  },
  { 
    title: 'Sober Grid', 
    url: 'https://www.sobergrid.com/',
    description: 'Social network for sober living',
    icon: 'grid'
  },
  { 
    title: 'In The Rooms', 
    url: 'https://www.intherooms.com/',
    description: 'Online recovery meetings worldwide',
    icon: 'videocam'
  },
];

const ResourcesScreen = () => {
  const navigation = useNavigation();

  const openLink = async (url) => {
    try {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      const supported = await Linking.canOpenURL(url);
      
      if (supported) {
        await Linking.openURL(url);
      } else {
        Alert.alert('Error', 'Cannot open this resource');
      }
    } catch (error) {
      console.error('Failed to open URL:', error);
      Alert.alert('Error', 'Failed to open the resource');
    }
  };

  const renderResourceCard = (resource, index) => (
    <TouchableOpacity 
      key={index} 
      style={styles.resourceCard}
      onPress={() => openLink(resource.url)}
      activeOpacity={0.8}
    >
      <View style={styles.cardContent}>
        <View style={styles.iconContainer}>
          <Ionicons name={resource.icon} size={24} color="#000" />
        </View>
        <View style={styles.textContainer}>
          <Text style={styles.resourceTitle}>{resource.title}</Text>
          <Text style={styles.resourceDescription}>{resource.description}</Text>
        </View>
        <Ionicons name="chevron-forward" size={20} color="#999" />
      </View>
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
          <Text style={styles.headerTitle}>Recovery Resources</Text>
          <View style={styles.headerRight} />
        </View>

        {/* Hero Section */}
        <View style={styles.heroContainer}>
       
          <Text style={styles.heroText}>
            Explore these trusted recovery resources to support your journey
          </Text>
        </View>

        {/* Resources List */}
        <ScrollView 
          style={styles.scrollContainer}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
        >
          {resources.map((resource, index) => renderResourceCard(resource, index))}
        </ScrollView>
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
  heroContainer: {
    padding: 20,
    alignItems: 'center',
    backgroundColor: '#F8F9FA',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  heroImage: {
    width: '100%',
    height: 150,
    marginBottom: 15,
  },
  heroText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    lineHeight: 24,
  },
  scrollContainer: {
    flex: 1,
  },
  listContent: {
    padding: 15,
    paddingBottom: 30,
  },
  resourceCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 15,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 5,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  cardContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconContainer: {
    backgroundColor: '#E3F2FD',
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  textContainer: {
    flex: 1,
  },
  resourceTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
    marginBottom: 3,
  },
  resourceDescription: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
});

export default ResourcesScreen;