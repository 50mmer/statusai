// src/config/subscriptionPlans.js
// Configuration for subscription plans

export const SUBSCRIPTION_PLANS = {
    // One-day access plan
    ONE_DAY: {
      id: 'one_day_access',
      name: 'One-Day Access',
      price: '£3.49',
      duration: '1 day',
      features: [
        'Full assessment',
        'Detailed category breakdown',
        'Global percentile ranking',
        '10-year prediction'
      ],
      durationInMs: 24 * 60 * 60 * 1000, // 24 hours in milliseconds
    },
    
    // Monthly subscription plan
    MONTHLY: {
      id: 'monthly_access',
      name: 'Monthly Access',
      price: '£4.99',
      duration: '1 month',
      features: [
        'Everything in One-Day Access',
        'Unlimited reassessments',
        'Progress tracking',
        'Detailed analytics'
      ],
      isPopular: true,
      durationInMs: 30 * 24 * 60 * 60 * 1000, // 30 days in milliseconds
    }
  };
  
  // Function to get human-readable time remaining for a subscription
  export const getTimeRemaining = (expiryDate) => {
    if (!expiryDate) return 'Expired';
    
    const now = new Date();
    const expiry = new Date(expiryDate);
    const diffMs = expiry - now;
    
    // If expired
    if (diffMs <= 0) return 'Expired';
    
    // Convert to days/hours/minutes
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    const diffHours = Math.floor((diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    
    if (diffDays > 0) {
      return `${diffDays} day${diffDays !== 1 ? 's' : ''} remaining`;
    } else {
      return `${diffHours} hour${diffHours !== 1 ? 's' : ''} remaining`;
    }
  };
  
  // Check if a subscription is active
  export const isSubscriptionActive = (expiryDate) => {
    if (!expiryDate) return false;
    const now = new Date();
    const expiry = new Date(expiryDate);
    return expiry > now;
  };