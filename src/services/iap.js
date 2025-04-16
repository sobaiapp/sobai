import { Platform } from 'react-native';
import * as RNIap from 'react-native-iap';

// Product IDs from App Store Connect
export const PRODUCT_IDS = {
  MONTHLY_SUBSCRIPTION: '002',
  YEARLY_SUBSCRIPTION: '003',
};

export const initializeIAP = async () => {
  try {
    await RNIap.initConnection();
    console.log('IAP initialized successfully');
  } catch (error) {
    console.error('Error initializing IAP:', error);
    throw error;
  }
};

export const getProducts = async () => {
  try {
    const products = await RNIap.getProducts([
      PRODUCT_IDS.MONTHLY_SUBSCRIPTION,
      PRODUCT_IDS.YEARLY_SUBSCRIPTION,
    ]);
    return products;
  } catch (error) {
    console.error('Error getting products:', error);
    throw error;
  }
};

export const purchaseSubscription = async (productId) => {
  try {
    const purchase = await RNIap.requestPurchase(productId);
    if (purchase) {
      await verifyPurchase(purchase);
      return purchase;
    }
    throw new Error('Purchase failed');
  } catch (error) {
    console.error('Error purchasing subscription:', error);
    throw error;
  }
};

export const restorePurchases = async () => {
  try {
    const purchases = await RNIap.getAvailablePurchases();
    return purchases;
  } catch (error) {
    console.error('Error restoring purchases:', error);
    throw error;
  }
};

const verifyPurchase = async (purchase) => {
  try {
    // Implement your server-side verification logic here
    // This should verify the purchase receipt with Apple's servers
    console.log('Verifying purchase:', purchase);
    return true;
  } catch (error) {
    console.error('Error verifying purchase:', error);
    throw error;
  }
}; 