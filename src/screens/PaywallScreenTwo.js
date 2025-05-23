import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert, SafeAreaView } from 'react-native';
import * as Haptic from 'expo-haptics';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { initializeIAP, getProducts, purchaseSubscription, restorePurchases, PRODUCT_IDS } from '../services/iap';

const PaywallScreenTwo = ({ navigation }) => {
  const [selectedPlan, setSelectedPlan] = useState('Yearly');
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const initIAP = async () => {
      try {
        await initializeIAP();
        await loadProducts();
      } catch (error) {
        console.error('Error initializing IAP:', error);
        Alert.alert('Error', 'Failed to initialize in-app purchases. Please try again later.');
      }
    };

    initIAP();
  }, []);

  const loadProducts = async () => {
    try {
      const availableProducts = await getProducts();
      setProducts(availableProducts);
    } catch (error) {
      console.error('Error loading products:', error);
      Alert.alert('Error', 'Failed to load subscription options. Please try again later.');
    }
  };

  const selectPlan = (plan) => {
    Haptic.impactAsync(Haptic.ImpactFeedbackStyle.Medium);
    setSelectedPlan(plan);
  };

  const handlePurchase = async () => {
    try {
      setLoading(true);
      const productId = selectedPlan === 'Yearly' 
        ? PRODUCT_IDS.YEARLY_SUBSCRIPTION 
        : PRODUCT_IDS.MONTHLY_SUBSCRIPTION;
      
      await purchaseSubscription(productId);
      Alert.alert('Success', 'Your subscription has been activated!');
      navigation.navigate('Home');
    } catch (error) {
      console.error('Purchase error:', error);
      Alert.alert('Error', 'Failed to complete purchase. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleRestore = async () => {
    try {
      setLoading(true);
      const purchases = await restorePurchases();
      if (purchases.length > 0) {
        Alert.alert('Success', 'Your purchases have been restored!');
        navigation.navigate('Home');
      } else {
        Alert.alert('No Purchases', 'No previous purchases found to restore.');
      }
    } catch (error) {
      console.error('Restore error:', error);
      Alert.alert('Error', 'Failed to restore purchases. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const getProductPrice = (productId) => {
    const product = products.find(p => p.productId === productId);
    return product ? product.priceString : 'Loading...';
  };

  const TimelineItem = ({ day, title, description, isActive, isLast }) => {
    return (
      <View style={styles.timelineItem}>
        <View style={styles.timelineItemContent}>
          <View style={styles.timelineDotContainer}>
            <View style={[
              styles.timelineDot,
              isActive && styles.activeDot,
              isLast && styles.lastDot
            ]}>
              {isActive && <View style={styles.innerDot} />}
            </View>
            {!isLast && <View style={styles.timelineConnector} />}
          </View>
          <View style={styles.timelineTextContainer}>
            <Text style={styles.timelineDay}>{day}</Text>
            <Text style={styles.timelineTitle}>{title}</Text>
            <Text style={styles.timelineDescription}>{description}</Text>
          </View>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>
            {selectedPlan === 'Monthly'
              ? 'Unlock Premium Access'
              : 'Start Your Free Trial'}
          </Text>
          <Text style={styles.subtitle}>
            {selectedPlan === 'Monthly'
              ? 'Get unlimited access to all features'
              : 'Try all premium features free for 3 days'}
          </Text>
        </View>

        {/* Benefits */}
        <View style={styles.benefitsContainer}>
          <View style={styles.benefitItem}>
            <View style={styles.benefitIcon}>
              <Ionicons name="infinite-outline" size={24} color="#000" />
            </View>
            <View style={styles.benefitContent}>
              <Text style={styles.benefitTitle}>Unlimited Access</Text>
              <Text style={styles.benefitText}>Access all premium features and content</Text>
            </View>
          </View>
          <View style={styles.benefitItem}>
            <View style={styles.benefitIcon}>
              <Ionicons name="notifications-outline" size={24} color="#000" />
            </View>
            <View style={styles.benefitContent}>
              <Text style={styles.benefitTitle}>Daily Motivation</Text>
              <Text style={styles.benefitText}>Get personalized reminders and insights</Text>
            </View>
          </View>
          <View style={styles.benefitItem}>
            <View style={styles.benefitIcon}>
              <Ionicons name="people-outline" size={24} color="#000" />
            </View>
            <View style={styles.benefitContent}>
              <Text style={styles.benefitTitle}>Community Access</Text>
              <Text style={styles.benefitText}>Connect with others on the same journey</Text>
            </View>
          </View>
        </View>

        {/* Plan Selection */}
        <View style={styles.plansContainer}>
          <TouchableOpacity
            onPress={() => selectPlan('Monthly')}
            style={[
              styles.planButton,
              selectedPlan === 'Monthly' && styles.selectedPlan
            ]}
            disabled={loading}
          >
            <View style={styles.planContent}>
              <Text style={styles.planName}>Monthly</Text>
              <Text style={styles.planPrice}>{getProductPrice(PRODUCT_IDS.MONTHLY_SUBSCRIPTION)}</Text>
            </View>
            <View style={[styles.planRadio, selectedPlan === 'Monthly' && styles.selectedRadio]}>
              <View style={selectedPlan === 'Monthly' ? styles.radioInnerSelected : styles.radioInner} />
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => selectPlan('Yearly')}
            style={[
              styles.planButton,
              selectedPlan === 'Yearly' && styles.selectedPlan,
              styles.yearlyPlan
            ]}
            disabled={loading}
          >
            <View style={styles.planContent}>
              <View style={styles.planBadge}>
                <Text style={styles.planBadgeText}>SAVE 50%</Text>
              </View>
              <Text style={styles.planName}>Yearly</Text>
              <Text style={styles.planPrice}>{getProductPrice(PRODUCT_IDS.YEARLY_SUBSCRIPTION)}</Text>
              <Text style={styles.planBilling}>Includes 3-day free trial</Text>
            </View>
            <View style={[styles.planRadio, selectedPlan === 'Yearly' && styles.selectedRadio]}>
              <View style={selectedPlan === 'Yearly' ? styles.radioInnerSelected : styles.radioInner} />
            </View>
          </TouchableOpacity>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <TouchableOpacity 
            onPress={handlePurchase} 
            style={styles.subscribeButton}
            disabled={loading}
          >
            <Text style={styles.subscribeText}>
              {loading ? 'Processing...' : 
                selectedPlan === 'Yearly' ? 'Start Free Trial' : 'Start My Journey'}
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            onPress={handleRestore}
            style={styles.restoreButton}
            disabled={loading}
          >
            <Text style={styles.restoreText}>Restore Purchase</Text>
          </TouchableOpacity>

          <Text style={styles.footerText}>
            Cancel anytime. Subscription auto-renews unless canceled 24h before renewal. Terms apply.
          </Text>
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  content: {
    flex: 1,
    padding: 24,
  },
  header: {
    marginBottom: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#000000',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#666666',
    textAlign: 'center',
    lineHeight: 22,
  },
  benefitsContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 0,
  },
  benefitItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    width: '100%',
    maxWidth: 300,
  },
  benefitIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F7F7F7',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  benefitContent: {
    flex: 1,
    alignItems: 'flex-start',
  },
  benefitTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000000',
    marginBottom: 4,
    textAlign: 'left',
  },
  benefitText: {
    fontSize: 14,
    color: '#666666',
    lineHeight: 20,
    textAlign: 'left',
  },
  plansContainer: {
    marginTop: 'auto',
    marginBottom: 24,
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  planButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F7F7F7',
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    minHeight: 80,
  },
  selectedPlan: {
    backgroundColor: '#FFFFFF',
    borderColor: '#000000',
    borderWidth: 2,
  },
  planContent: {
    flex: 1,
  },
  planName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000000',
    marginBottom: 2,
  },
  planPrice: {
    fontSize: 15,
    color: '#000000',
    fontWeight: '600',
    marginBottom: 2,
  },
  planBilling: {
    fontSize: 12,
    color: '#666666',
  },
  planBadge: {
    backgroundColor: '#000000',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 12,
    alignSelf: 'flex-start',
    marginBottom: 4,
  },
  planBadgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '600',
  },
  planRadio: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#CCCCCC',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 12,
  },
  selectedRadio: {
    borderColor: '#000000',
  },
  radioInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#CCCCCC',
  },
  radioInnerSelected: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#000000',
  },
  footer: {
    marginTop: 0,
    paddingTop: 0,
  },
  subscribeButton: {
    backgroundColor: '#000000',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginBottom: 12,
  },
  subscribeText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
  },
  restoreButton: {
    padding: 12,
    alignItems: 'center',
    marginBottom: 12,
  },
  restoreText: {
    color: '#000000',
    fontSize: 16,
    fontWeight: '500',
  },
  footerText: {
    fontSize: 12,
    color: '#666666',
    textAlign: 'center',
    lineHeight: 18,
  },
});

export default PaywallScreenTwo;