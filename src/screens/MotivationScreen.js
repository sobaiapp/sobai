import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  RefreshControl,
  Platform,
  Share,
} from 'react-native';
import { Ionicons, Feather } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

const MotivationScreen = ({ navigation }) => {
  const [quotes, setQuotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [textSize, setTextSize] = useState('medium'); // 'small', 'medium', 'large'

  // Text size configurations
  const textSizes = {
    small: {
      quote: 16,
      author: 14,
      action: 14,
      status: 16,
      lineHeight: 24,
    },
    medium: {
      quote: 20,
      author: 16,
      action: 16,
      status: 18,
      lineHeight: 28,
    },
    large: {
      quote: 24,
      author: 18,
      action: 18,
      status: 20,
      lineHeight: 32,
    },
  };

  useEffect(() => {
    fetchQuotes();
  }, []);

  const fetchQuotes = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch('https://zenquotes.io/api/quotes/');
      if (!response.ok) {
        throw new Error('Failed to fetch quotes');
      }
      
      const data = await response.json();
      setQuotes(data.map(quote => ({
        text: quote.q,
        author: quote.a,
      })));
    } catch (error) {
      console.error('Error fetching quotes:', error);
      setError('Failed to load quotes. Please try again.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    fetchQuotes();
  };

  const handleShare = async (quote) => {
    try {
      await Share.share({
        message: `"${quote.text}"\n\n- ${quote.author}\n\nShared via SobAi`,
      });
    } catch (error) {
      console.error('Error sharing quote:', error);
    }
  };

  const renderTextSizeSelector = () => (
    <View style={styles.textSizeContainer}>
      <TouchableOpacity 
        style={[styles.textSizeButton, textSize === 'small' && styles.textSizeButtonActive]}
        onPress={() => setTextSize('small')}
      >
        <Text style={[styles.textSizeButtonText, textSize === 'small' && styles.textSizeButtonTextActive]}>A</Text>
      </TouchableOpacity>
      <TouchableOpacity 
        style={[styles.textSizeButton, textSize === 'medium' && styles.textSizeButtonActive]}
        onPress={() => setTextSize('medium')}
      >
        <Text style={[styles.textSizeButtonText, textSize === 'medium' && styles.textSizeButtonTextActive]}>A</Text>
      </TouchableOpacity>
      <TouchableOpacity 
        style={[styles.textSizeButton, textSize === 'large' && styles.textSizeButtonActive]}
        onPress={() => setTextSize('large')}
      >
        <Text style={[styles.textSizeButtonText, textSize === 'large' && styles.textSizeButtonTextActive]}>A</Text>
      </TouchableOpacity>
    </View>
  );

  const renderQuote = (quote, index) => (
    <LinearGradient
      key={index}
      colors={['#ffffff', '#f8f8f8']}
      style={styles.quoteCard}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
    >
      <View style={styles.quoteContent}>
        <Text style={[styles.quoteText, { fontSize: textSizes[textSize].quote, lineHeight: textSizes[textSize].lineHeight }]}>
          "{quote.text}"
        </Text>
        <Text style={[styles.quoteAuthor, { fontSize: textSizes[textSize].author }]}>
          - {quote.author}
        </Text>
      </View>
      <View style={styles.quoteActions}>
        <TouchableOpacity 
          style={styles.actionButton}
          onPress={() => handleShare(quote)}
        >
          <Ionicons name="share-outline" size={20} color="#000000" />
          <Text style={[styles.actionText, { fontSize: textSizes[textSize].action }]}>Share</Text>
        </TouchableOpacity>
      </View>
    </LinearGradient>
  );

  return (
    <LinearGradient
      colors={['#f8f8f8', '#ffffff']}
      style={styles.container}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
    >
      <ScrollView 
        style={styles.content}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor="#000000"
          />
        }
      >
        {error ? (
          <View style={styles.errorContainer}>
            <Feather name="alert-circle" size={48} color="#ff6b6b" />
            <Text style={[styles.errorText, { fontSize: textSizes[textSize].status }]}>{error}</Text>
            <TouchableOpacity 
              style={styles.retryButton}
              onPress={fetchQuotes}
            >
              <Text style={[styles.retryText, { fontSize: textSizes[textSize].status }]}>Try Again</Text>
            </TouchableOpacity>
          </View>
        ) : loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#000000" />
            <Text style={[styles.loadingText, { fontSize: textSizes[textSize].status }]}>Loading quotes...</Text>
          </View>
        ) : quotes.length > 0 ? (
          <View style={styles.quotesContainer}>
            {quotes.map(renderQuote)}
          </View>
        ) : (
          <View style={styles.emptyContainer}>
            <Feather name="inbox" size={48} color="#000000" />
            <Text style={[styles.emptyText, { fontSize: textSizes[textSize].status }]}>No quotes found</Text>
          </View>
        )}
      </ScrollView>
      <View style={styles.floatingContainer}>
        {renderTextSizeSelector()}
      </View>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
  },
  floatingContainer: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    backgroundColor: 'transparent',
  },
  textSizeContainer: {
    flexDirection: 'row',
    backgroundColor: '#ffffff',
    borderRadius: 20,
    padding: 8,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  textSizeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 4,
  },
  textSizeButtonActive: {
    backgroundColor: '#000000',
  },
  textSizeButtonText: {
    fontSize: 12,
    color: '#000000',
  },
  textSizeButtonTextActive: {
    color: '#ffffff',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    marginTop: 16,
    color: '#000000',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    marginTop: 16,
    color: '#ff6b6b',
    textAlign: 'center',
  },
  retryButton: {
    marginTop: 16,
    padding: 12,
    backgroundColor: '#000000',
    borderRadius: 8,
  },
  retryText: {
    color: '#ffffff',
    fontWeight: '600',
  },
  quotesContainer: {
    padding: 16,
  },
  quoteCard: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  quoteContent: {
    marginBottom: 16,
  },
  quoteText: {
    color: '#000000',
    marginBottom: 8,
    fontStyle: 'italic',
  },
  quoteAuthor: {
    color: '#666666',
    textAlign: 'right',
  },
  quoteActions: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
    paddingTop: 12,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  actionText: {
    color: '#000000',
    marginLeft: 4,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
  },
  emptyText: {
    color: '#000000',
    marginTop: 16,
  },
});

export default MotivationScreen;