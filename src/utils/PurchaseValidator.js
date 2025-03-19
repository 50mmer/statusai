// src/utils/PurchaseValidator.js
import AsyncStorage from '@react-native-async-storage/async-storage';
import ErrorLogger from './ErrorLogger';
import Analytics from './Analytics';

/**
 * Purchase validation utility
 * 
 * This is a simplified purchase validator for use with our mock purchase system.
 * In a real app with real Apple/Google purchases, you would:
 * 1. Send the purchase receipt to your backend for validation
 * 2. Check for valid signatures and receipt authenticity
 * 3. Maintain a database of valid purchases
 * 4. Implement proper renewal validation logic
 * 
 * This implementation provides a simple verification system that works with our mock store.
 */

// Storage key for purchase receipts
const PURCHASE_RECEIPTS_KEY = '@purchase_receipts';

/**
 * Validate a purchase receipt
 * @param {Object} receipt - The purchase receipt
 * @returns {Promise<Object>} Validation result with success flag and details
 */
export const validatePurchase = async (receipt) => {
  try {
    // In a real implementation, this would make an API request to Apple/Google
    // For our mock system, we'll just check for the expected properties
    
    if (!receipt) {
      throw new Error('No receipt provided');
    }
    
    if (!receipt.productId) {
      throw new Error('Invalid receipt: missing productId');
    }
    
    if (!receipt.transactionId) {
      throw new Error('Invalid receipt: missing transactionId');
    }
    
    if (!receipt.transactionDate) {
      throw new Error('Invalid receipt: missing transactionDate');
    }
    
    // In a real system, we'd also validate against known expiryDates
    
    // Store valid receipt
    await storePurchaseReceipt(receipt);
    
    // For simulation purposes, always return success
    return {
      success: true,
      isValid: true,
      expiryDate: receipt.expiryDate,
      productId: receipt.productId,
      originalTransactionId: receipt.transactionId
    };
  } catch (error) {
    // Log validation error
    ErrorLogger.logError(error, 'PurchaseValidator.validatePurchase', { receipt });
    
    // Track error in analytics
    Analytics.trackEvent(Analytics.EVENTS.ERROR, {
      action: 'purchase_validation',
      error_message: error.message
    });
    
    return {
      success: false,
      isValid: false,
      error: error.message
    };
  }
};

/**
 * Store a purchase receipt
 * @param {Object} receipt - The purchase receipt
 * @returns {Promise<void>}
 */
export const storePurchaseReceipt = async (receipt) => {
  try {
    // Get existing receipts
    const existingReceiptsJson = await AsyncStorage.getItem(PURCHASE_RECEIPTS_KEY);
    const existingReceipts = existingReceiptsJson ? JSON.parse(existingReceiptsJson) : [];
    
    // Add new receipt
    const updatedReceipts = [...existingReceipts, {
      ...receipt,
      validatedAt: new Date().toISOString(),
    }];
    
    // Save updated receipts
    await AsyncStorage.setItem(PURCHASE_RECEIPTS_KEY, JSON.stringify(updatedReceipts));
  } catch (error) {
    console.error('Failed to store purchase receipt:', error);
  }
};

/**
 * Check if a product has been purchased
 * @param {string} productId - The product ID to check
 * @returns {Promise<boolean>} Whether the product is purchased and valid
 */
export const isProductPurchased = async (productId) => {
  try {
    // Get all receipts
    const receiptsJson = await AsyncStorage.getItem(PURCHASE_RECEIPTS_KEY);
    const receipts = receiptsJson ? JSON.parse(receiptsJson) : [];
    
    // Find receipts for this product
    const productReceipts = receipts.filter(receipt => receipt.productId === productId);
    
    if (productReceipts.length === 0) {
      return false;
    }
    
    // Check if any receipt is still valid (not expired)
    const now = new Date();
    return productReceipts.some(receipt => {
      if (!receipt.expiryDate) return true; // Non-subscription purchases don't expire
      const expiryDate = new Date(receipt.expiryDate);
      return expiryDate > now;
    });
  } catch (error) {
    console.error('Failed to check product purchase status:', error);
    return false;
  }
};

/**
 * Get all purchase receipts
 * @returns {Promise<Array>} Array of purchase receipts
 */
export const getPurchaseReceipts = async () => {
  try {
    const receiptsJson = await AsyncStorage.getItem(PURCHASE_RECEIPTS_KEY);
    return receiptsJson ? JSON.parse(receiptsJson) : [];
  } catch (error) {
    console.error('Failed to get purchase receipts:', error);
    return [];
  }
};

/**
 * Clear all purchase receipts (for testing)
 * @returns {Promise<void>}
 */
export const clearPurchaseReceipts = async () => {
  try {
    await AsyncStorage.removeItem(PURCHASE_RECEIPTS_KEY);
  } catch (error) {
    console.error('Failed to clear purchase receipts:', error);
  }
};

export default {
  validatePurchase,
  storePurchaseReceipt,
  isProductPurchased,
  getPurchaseReceipts,
  clearPurchaseReceipts,
};