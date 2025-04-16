import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  SafeAreaView,
  TouchableOpacity,
  ActivityIndicator
} from 'react-native';
import { WebView } from 'react-native-webview';
import { Ionicons } from '@expo/vector-icons';

const MeetingsScreen = ({ navigation }) => {
  const [activeTab, setActiveTab] = useState('NA');
  const [loading, setLoading] = useState(true);

  // Official meeting finder URLs
  const MEETING_URLS = {
    NA: 'https://www.na.org/meetingsearch/',
    AA: 'https://www.aa.org/find-aa'
  };

  const renderLoadingIndicator = () => (
    <View style={styles.loadingContainer}>
      <ActivityIndicator size="large" color="#000" />
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Recovery Meetings</Text>
        <View style={{ width: 24 }} /> {/* Spacer for alignment */}
      </View>

      {/* Tab Navigation */}
      <View style={styles.tabContainer}>
        <TouchableOpacity 
          style={[styles.tabButton, activeTab === 'NA' && styles.activeTab]}
          onPress={() => setActiveTab('NA')}
        >
          <Text style={[styles.tabText, activeTab === 'NA' && styles.activeTabText]}>
            NA Meetings
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.tabButton, activeTab === 'AA' && styles.activeTab]}
          onPress={() => setActiveTab('AA')}
        >
          <Text style={[styles.tabText, activeTab === 'AA' && styles.activeTabText]}>
            AA Meetings
          </Text>
        </TouchableOpacity>
      </View>

      {/* Loading Indicator */}
      {loading && renderLoadingIndicator()}

      {/* WebView Content */}
      <WebView
        source={{ uri: MEETING_URLS[activeTab] }}
        style={styles.webview}
        onLoadStart={() => setLoading(true)}
        onLoadEnd={() => setLoading(false)}
        startInLoadingState={true}
        allowsInlineMediaPlayback
        javaScriptEnabled
        domStorageEnabled
        renderLoading={() => renderLoadingIndicator()}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  tabButton: {
    flex: 1,
    paddingVertical: 16,
    alignItems: 'center',
  },
  activeTab: {
    borderBottomWidth: 3,
    borderBottomColor: '#2196F3',
  },
  tabText: {
    fontSize: 16,
    color: '#555',
    fontWeight: '500',
  },
  activeTabText: {
    color: '#2196F3',
    fontWeight: '600',
  },
  loadingContainer: {
    position: 'absolute',
    top: 120,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.8)',
    zIndex: 10,
  },
  webview: {
    flex: 1,
  },
});

export default MeetingsScreen;