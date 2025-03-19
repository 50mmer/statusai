import { useState, useCallback, useRef, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_CONFIG } from '../config/api';

export const useApi = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [progress, setProgress] = useState(0);
  const [calculationStatus, setCalculationStatus] = useState('');
  const [retryCount, setRetryCount] = useState(0);
  const isMounted = useRef(true);

  useEffect(() => {
    isMounted.current = true;
    return () => {
      isMounted.current = false;
    };
  }, []);

  const calculateScores = useCallback(async (answers) => {
    if (!isMounted.current) return null;

    try {
      setLoading(true);
      setError(null);
      setProgress(0);
      setCalculationStatus('Validating your responses...');

      await AsyncStorage.setItem('@calculation_state', JSON.stringify({
        status: 'Validating',
        progress: 0,
        retryCount,
        timestamp: Date.now()
      }));

      setProgress(20);
      setCalculationStatus('Connecting to assessment server...');

      // Prepare user message with profile data - ensure all values are strings for iOS compatibility
      const profileData = JSON.stringify({
        profile: {
          wealth: {
            income: String(answers.annualIncome || ''),
            netWorth: String(answers.netWorth || ''),
            lifestyle: String(answers.lifestyle || '')
          },
          physical: {
            height: String(answers.height || ''),
            bodyType: String(answers.bodyType || ''),
            strength: String(answers.strengthLevel || '')
          },
          power: {
            leadership: String(answers.leadershipRole || ''),
            socialReach: String(answers.socialReach || ''),
            network: String(answers.networkStrength || '')
          },
          intelligence: {
            problemSolving: String(answers.problemSolving || ''),
            skills: String(answers.skillLevel || ''),
            achievements: String(answers.achievements || '')
          },
          willpower: {
            discipline: String(answers.discipline || ''),
            productivity: String(answers.productiveHours || ''),
            resilience: String(answers.stressResilience || '')
          },
          legacy: {
            relationships: String(answers.relationshipStatus || ''),
            attractiveness: String(answers.attractiveness || ''),
            impact: String(answers.legacy || '')
          }
        }
      });

      // Insert profile data into user message template
      const userMessage = API_CONFIG.USER_MESSAGE_TEMPLATE.replace('{{DATA}}', profileData);

      // Make the API call to your backend without using abort controller
      const response = await fetch(API_CONFIG.BACKEND_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: API_CONFIG.OPENAI_MODEL,
          messages: [
            API_CONFIG.SYSTEM_MESSAGE,
            {
              role: 'user',
              content: userMessage
            }
          ],
          temperature: API_CONFIG.TEMPERATURE,
          max_tokens: API_CONFIG.MAX_TOKENS,
          response_format: { type: "json_object" }
        })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('API Error Response:', errorData);
        
        // Check if we should retry based on error type
        if (retryCount < API_CONFIG.RATE_LIMIT.MAX_RETRIES && 
            (response.status === 429 || response.status >= 500)) {
          setRetryCount(prev => prev + 1);
          setCalculationStatus('Retrying connection...');
          // Calculate backoff time
          const backoffTime = API_CONFIG.RATE_LIMIT.DEFAULT_RETRY_DELAY * Math.pow(2, retryCount);
          await new Promise(resolve => setTimeout(resolve, backoffTime));
          return calculateScores(answers);
        }
        
        throw new Error(`API request failed: ${response.status} - ${errorData.error?.message || response.statusText}`);
      }

      setProgress(40);
      setCalculationStatus('Analyzing your profile data...');

      const data = await response.json();
      console.log('Raw API Response:', data);

      if (!isMounted.current) return null;

      setProgress(70);
      setCalculationStatus('Processing results...');

      // Parse API response
      let responseData;
      try {
        const messageContent = data.choices?.[0]?.message?.content;
        if (!messageContent) {
          throw new Error('Invalid API response structure');
        }
        
        // Clean and parse the message content
        let cleanContent = messageContent;
        // Remove any potential JSON code blocks if present
        if (messageContent.includes('```json')) {
          cleanContent = messageContent.replace(/```json\n?|\n?```/g, '').trim();
        }
        responseData = JSON.parse(cleanContent);
        console.log('Parsed Response Data:', responseData);
        
        // Verify required fields are present
        const requiredFields = ['categoryScores', 'overallScore', 'globalRanking', 'status', 'futurePrediction'];
        const missingFields = requiredFields.filter(field => !responseData[field]);
        if (missingFields.length > 0) {
          throw new Error(`Missing required fields in response: ${missingFields.join(', ')}`);
        }
        
        // Verify category scores
        const requiredCategories = ['wealth', 'fitness', 'power', 'intelligence', 'willpower', 'legacy'];
        const missingCategories = requiredCategories.filter(category => 
          !responseData.categoryScores || !responseData.categoryScores[category]
        );
        if (missingCategories.length > 0) {
          throw new Error(`Missing category scores: ${missingCategories.join(', ')}`);
        }
      } catch (error) {
        console.error('Response parsing error:', error);
        
        // If parsing error, try to retry
        if (retryCount < API_CONFIG.RATE_LIMIT.MAX_RETRIES) {
          setRetryCount(prev => prev + 1);
          setCalculationStatus('Retrying analysis...');
          await new Promise(resolve => setTimeout(resolve, 
            API_CONFIG.RATE_LIMIT.DEFAULT_RETRY_DELAY * Math.pow(1.5, retryCount)
          ));
          return calculateScores(answers);
        }
        
        throw new Error('Invalid response format: ' + error.message);
      }

      // Handle percentile string - it looks like the API sometimes returns a string like "top 1.9%"
      let percentile = responseData.globalRanking.percentile;
      if (typeof percentile === 'string' && percentile.includes('%')) {
        // Extract the number from a string like "top 1.9%"
        const match = percentile.match(/[\d.]+/);
        if (match) {
          percentile = parseFloat(match[0]);
        }
      }

      // Format the final result - ensure all numeric values are properly converted
      const result = {
        categoryScores: {
          wealth: ensureValidScore(responseData.categoryScores.wealth),
          fitness: ensureValidScore(responseData.categoryScores.fitness),
          power: ensureValidScore(responseData.categoryScores.power),
          intelligence: ensureValidScore(responseData.categoryScores.intelligence),
          willpower: ensureValidScore(responseData.categoryScores.willpower),
          legacy: ensureValidScore(responseData.categoryScores.legacy)
        },
        overallScore: ensureValidScore(responseData.overallScore),
        globalRanking: {
          position: ensureValidRanking(responseData.globalRanking.position),
          percentile: ensureValidPercentile(percentile)
        },
        status: ensureValidString(responseData.status),
        futurePrediction: ensureValidString(responseData.futurePrediction)
      };

      console.log('Final formatted result:', result);
      setProgress(100);
      setCalculationStatus('Calculation complete!');
      setLoading(false);

      await AsyncStorage.removeItem('@calculation_state');
      return result;

    } catch (error) {
      console.error('API call error:', error);
      if (!isMounted.current) return null;

      // Retry if we encounter a rate limiting error
      if (retryCount < API_CONFIG.RATE_LIMIT.MAX_RETRIES && 
          (error.message.includes('Rate limit') || error.message.includes('429'))) {
        setRetryCount(prev => prev + 1);
        setCalculationStatus('Retrying connection...');
        await new Promise(resolve => setTimeout(resolve, 
          API_CONFIG.RATE_LIMIT.DEFAULT_RETRY_DELAY * Math.pow(2, retryCount)
        ));
        return calculateScores(answers);
      }

      setError(error.message);
      setLoading(false);
      throw error; // Re-throw the error to be handled by the caller
    }
  }, [retryCount]);

  // Simplified cleanup function - no abort controller to clean up
  const cleanup = useCallback(() => {
    // Just reset state
    setLoading(false);
    setError(null);
    setProgress(0);
    setCalculationStatus('');
  }, []);

  // We don't need abortCalculation anymore as we're not using abort controllers
  const abortCalculation = useCallback(() => {
    // This function is kept for API compatibility, but doesn't do anything now
    setLoading(false);
    setError('Calculation was cancelled');
  }, []);

  return {
    calculateScores,
    loading,
    error,
    progress,
    calculationStatus,
    retryCount,
    abortCalculation,
    cleanup
  };
};

// Helper functions
const ensureValidScore = (score) => {
  if (score === null || score === undefined) return 50;
  
  // Parse string scores to numbers
  const num = typeof score === 'string' ? parseFloat(score) : Number(score);
  return !isNaN(num) && num >= 0 && num <= 100 ? Math.round(num) : 50;
};

const ensureValidRanking = (position) => {
  if (position === null || position === undefined) return 1985000000;
  
  // Parse string positions to numbers
  const num = typeof position === 'string' ? parseInt(position, 10) : Number(position);
  return !isNaN(num) && num > 0 && num <= 3970000000 ? Math.round(num) : 1985000000;
};

const ensureValidPercentile = (percentile) => {
  if (percentile === null || percentile === undefined) return 50.0;
  
  // Parse string percentiles to numbers
  const num = typeof percentile === 'string' ? parseFloat(percentile) : Number(percentile);
  return !isNaN(num) && num >= 0 && num <= 100 ? Number(num.toFixed(1)) : 50.0;
};

const ensureValidString = (str) => {
  if (str === null || str === undefined) return "No data available";
  return typeof str === 'string' && str.trim() ? str.trim() : "No data available";
};