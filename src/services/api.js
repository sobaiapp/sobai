import AsyncStorage from '@react-native-async-storage/async-storage';

const FALLBACK_QUOTE = {
  text: "Every day is a new beginning. Take a deep breath and start again.",
  id: 'fallback'
};

const fetchWithRetry = async (url, retries = 3) => {
  for (let i = 0; i < retries; i++) {
    try {
      const response = await fetch(url);
      if (response.ok) {
        return await response.json();
      }
    } catch (error) {
      console.log(`Attempt ${i + 1} failed:`, error);
      if (i === retries - 1) throw error;
      // Wait for 1 second before retrying
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  }
  throw new Error('All retry attempts failed');
};

export const getMotivationalQuote = async () => {
  try {
    // Get the last quote ID from storage to avoid duplicates
    const lastQuoteId = await AsyncStorage.getItem('lastQuoteId');
    
    try {
      // Try to fetch from Quotable API with retry logic
      const quote = await fetchWithRetry('https://api.quotable.io/random?tags=motivational|inspirational');
      
      // Check if this is the same quote as last time
      if (quote._id === lastQuoteId) {
        // If it's the same quote, fetch another one
        return getMotivationalQuote();
      }
      
      // Save the new quote ID
      await AsyncStorage.setItem('lastQuoteId', quote._id);
      
      return {
        text: `${quote.content} - ${quote.author}`,
        id: quote._id
      };
    } catch (apiError) {
      console.log('Falling back to default quote due to API error:', apiError);
      return FALLBACK_QUOTE;
    }
  } catch (error) {
    console.error('Error in getMotivationalQuote:', error);
    return FALLBACK_QUOTE;
  }
}; 