import React, { useState, useRef, useEffect } from 'react';
import { 
  View, 
  Text, 
  ScrollView, 
  TouchableOpacity, 
  StyleSheet, 
  Dimensions,
  Platform,
  ActivityIndicator,
  Image,
  Linking
} from 'react-native';
import * as Haptics from 'expo-haptics';
import Modal from 'react-native-modal';
import Icon from 'react-native-vector-icons/MaterialIcons';
import YoutubePlayer from 'react-native-youtube-iframe';

// Import all your articles
import tipsToStaySober from '../articles/tipsToStaySober';
import handlingTriggers from '../articles/handlingTriggers';
import buildingSupport from '../articles/buildingSupport';
import buildingHealthyHabits from '../articles/buildingHealthHabits';
import dealingWithCravings from '../articles/dealingWithCravings';
import managingStressInSobriety from '../articles/managingStressInSobriety';
import rebuildingRelationships from '../articles/rebuildingRelationships';
import findingPurposeInSobriety from '../articles/findingPurposeInSobriety';

const LearnScreen = () => {
  const [selectedTab, setSelectedTab] = useState('Articles');
  const [isModalVisible, setModalVisible] = useState(false);
  const [selectedContent, setSelectedContent] = useState(null);
  const [videoError, setVideoError] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const playerRef = useRef(null);

  // All your articles in an array
  const articles = [
    tipsToStaySober,
    handlingTriggers,
    buildingSupport,
    buildingHealthyHabits,
    dealingWithCravings,
    managingStressInSobriety,
    rebuildingRelationships,
    findingPurposeInSobriety
  ];

  // YouTube video content data
  const videoData = [
    { 
      title: 'Understanding Sobriety', 
      description: 'Learn the fundamentals of maintaining sobriety and building a healthy lifestyle.',
      youtubeId: 'vcDX5jeKDJE', // YouTube video ID
      thumbnail: 'https://img.youtube.com/vi/vcDX5jeKDJE/hqdefault.jpg'
    },
    { 
      title: 'Coping With Cravings', 
      description: 'Effective techniques to manage and overcome substance cravings.',
      youtubeId: '3NycM9lYdRI',
      thumbnail: 'https://img.youtube.com/vi/3NycM9lYdRI/hqdefault.jpg'
    },
    { 
      title: 'Building a Support System', 
      description: 'How to develop strong relationships that support your recovery journey.',
      youtubeId: '5r6aKk0XdWI',
      thumbnail: 'https://img.youtube.com/vi/5r6aKk0XdWI/hqdefault.jpg'
    },
    { 
      title: 'Mindfulness in Recovery', 
      description: 'Using mindfulness techniques to maintain sobriety.',
      youtubeId: 'mMMerxh_1K4',
      thumbnail: 'https://img.youtube.com/vi/mMMerxh_1K4/hqdefault.jpg'
    },
    { 
      title: 'Relapse Prevention', 
      description: 'Strategies to prevent relapse and maintain long-term recovery.',
      youtubeId: '9G2Y4XWsl5o',
      thumbnail: 'https://img.youtube.com/vi/9G2Y4XWsl5o/hqdefault.jpg'
    }
  ];

  // Podcast content data
  const podcastData = [
    {
      title: 'The Recovery Journey',
      description: 'Hear inspiring stories from people who have successfully navigated the path to sobriety.',
      audioUrl: 'https://example.com/podcasts/recovery-journey.mp3'
    },
    {
      title: 'Mindfulness in Recovery',
      description: 'Learn how mindfulness practices can support your sobriety and mental health.',
      audioUrl: 'https://example.com/podcasts/mindfulness-recovery.mp3'
    }
  ];

  const contentData = {
    Articles: articles,
    Videos: videoData,
    Podcasts: podcastData,
  };

  const handlePress = async (content) => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setSelectedContent(content);
    setModalVisible(true);
    setVideoError(false);
    setIsPlaying(false);
  };

  const handleVideoError = (error) => {
    console.error('Video error:', error);
    setVideoError(true);
  };

  const togglePlaying = () => {
    setIsPlaying(prev => !prev);
  };

  const openInYouTube = () => {
    if (selectedContent?.youtubeId) {
      Linking.openURL(`https://www.youtube.com/watch?v=${selectedContent.youtubeId}`);
    }
  };

  useEffect(() => {
    return () => {
      setIsPlaying(false);
    };
  }, []);

  const renderModalContent = () => {
    if (!selectedContent) return null;

    if (selectedTab === 'Videos') {
      return (
        <View style={styles.videoModalContent}>
          <View style={styles.videoContainer}>
            {videoError ? (
              <View style={styles.videoErrorContainer}>
                <Icon name="error-outline" size={50} color="#ff4444" />
                <Text style={styles.errorText}>Video failed to load</Text>
                <TouchableOpacity 
                  style={styles.youtubeButton}
                  onPress={openInYouTube}
                >
                  <Text style={styles.youtubeButtonText}>Open in YouTube</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <YoutubePlayer
                ref={playerRef}
                height={Dimensions.get('window').width * 0.5625} // 16:9 aspect ratio
                width={Dimensions.get('window').width}
                videoId={selectedContent.youtubeId}
                play={isPlaying}
                onChangeState={event => {
                  if (event.state === 'ended') {
                    setIsPlaying(false);
                  }
                }}
                onError={handleVideoError}
                webViewProps={{
                  allowsFullscreenVideo: false,
                }}
              />
            )}
          </View>
          <View style={styles.videoControls}>
            <TouchableOpacity onPress={togglePlaying}>
              <Icon 
                name={isPlaying ? "pause-circle-filled" : "play-circle-filled"} 
                size={40} 
                color="#6200ee" 
              />
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.youtubeButton}
              onPress={openInYouTube}
            >
              <Icon name="open-in-new" size={20} color="#fff" />
              <Text style={styles.youtubeButtonText}>Open in YouTube</Text>
            </TouchableOpacity>
          </View>
          <Text style={styles.modalTitle}>{selectedContent.title}</Text>
          <Text style={styles.modalDescription}>{selectedContent.description}</Text>
        </View>
      );
    }

    return (
      <>
        <Text style={styles.modalTitle}>{selectedContent.title}</Text>
        <ScrollView style={styles.modalDescriptionContainer}>
          <Text style={styles.modalDescription}>
            {selectedContent.content || selectedContent.description}
          </Text>
        </ScrollView>
      </>
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Learn About Sobriety</Text>

      <View style={styles.tabsContainer}>
        {['Articles', 'Videos', 'Podcasts'].map((tab) => (
          <TouchableOpacity
            key={tab}
            style={[styles.tab, selectedTab === tab && styles.selectedTab]}
            onPress={() => setSelectedTab(tab)}
          >
            <Text style={[styles.tabText, selectedTab === tab && styles.selectedTabText]}>
              {tab}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {contentData[selectedTab].map((item, index) => (
          <TouchableOpacity 
            key={`${selectedTab}-${index}`}
            style={styles.contentCard}
            onPress={() => handlePress(item)}
          >
            {selectedTab === 'Videos' && (
              <View style={styles.videoThumbnail}>
                <Image
                  source={{ uri: item.thumbnail }}
                  style={styles.thumbnailImage}
                  resizeMode="cover"
                />
                <View style={styles.playIconContainer}>
                  <Icon name="play-circle-filled" size={40} color="rgba(255,255,255,0.9)" />
                </View>
              </View>
            )}
            {selectedTab === 'Podcasts' && (
              <View style={styles.podcastIconContainer}>
                <Icon name="podcasts" size={40} color="#6200ee" />
              </View>
            )}
            <View style={styles.contentTextContainer}>
              <Text style={styles.contentTitle}>{item.title}</Text>
              <Text style={styles.contentDescription} numberOfLines={2}>
                {item.description || (item.content ? item.content.substring(0, 100) + '...' : '')}
              </Text>
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <Modal
        isVisible={isModalVisible}
        onBackdropPress={() => setModalVisible(false)}
        animationIn="slideInUp"
        animationOut="slideOutDown"
        style={styles.modal}
        deviceHeight={Dimensions.get('window').height}
      >
        <View style={[
          styles.modalContent,
          selectedTab === 'Videos' && styles.videoModalContent
        ]}>
          {renderModalContent()}
          <TouchableOpacity 
            style={styles.closeButton} 
            onPress={() => setModalVisible(false)}
          >
            <Text style={styles.closeButtonText}>Close</Text>
          </TouchableOpacity>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9F9F9',
    padding: 20,
  },
  header: {
    fontSize: 26,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#000',
  },
  tabsContainer: {
    flexDirection: 'row',
    marginBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
  },
  tab: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
  },
  selectedTab: {
    borderBottomWidth: 3,
    borderBottomColor: '#000',
  },
  tabText: {
    fontSize: 18,
    color: '#777',
  },
  selectedTabText: {
    color: '#000',
    fontWeight: 'bold',
  },
  contentCard: {
    backgroundColor: '#FFF',
    padding: 15,
    borderRadius: 10,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
    flexDirection: 'row',
    alignItems: 'center',
  },
  videoThumbnail: {
    width: 80,
    height: 60,
    borderRadius: 5,
    marginRight: 15,
    overflow: 'hidden',
    position: 'relative',
  },
  thumbnailImage: {
    width: '100%',
    height: '100%',
  },
  playIconContainer: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.3)',
  },
  podcastIconContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'rgba(98,0,238,0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  contentTextContainer: {
    flex: 1,
  },
  contentTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  contentDescription: {
    fontSize: 14,
    color: '#666',
  },
  modal: {
    justifyContent: 'flex-end',
    margin: 0,
  },
  modalContent: {
    backgroundColor: 'white',
    padding: 10,
    borderTopLeftRadius: 15,
    borderTopRightRadius: 15,
    maxHeight: Dimensions.get('window').height * 0.85,
  },
  videoModalContent: {
    padding: 0,
  },
  videoContainer: {
    width: '100%',
    backgroundColor: '#000',
  },
  videoControls: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 10,
    backgroundColor: '#f5f5f5',
  },
  videoErrorContainer: {
    height: Dimensions.get('window').width * 0.5625,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#000',
  },
  errorText: {
    color: '#fff',
    fontSize: 16,
    marginTop: 10,
    marginBottom: 20,
  },
  youtubeButton: {
    flexDirection: 'row',
    backgroundColor: '#ff0000',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 5,
    alignItems: 'center',
  },
  youtubeButtonText: {
    color: '#fff',
    fontSize: 16,
    marginLeft: 5,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    marginVertical: 20,
    color: '#333',
    paddingHorizontal: 20,
  },
  modalDescriptionContainer: {
    marginBottom: 20,
    paddingHorizontal: 20,
  },
  modalDescription: {
    fontSize: 16,
    color: '#000',
    lineHeight: 24,
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  closeButton: {
    backgroundColor: '#000',
    paddingVertical: 12,
    borderRadius: 8,
    marginHorizontal: 20,
    marginBottom: Platform.OS === 'ios' ? 20 : 10,
  },
  closeButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
  },
});

export default LearnScreen;