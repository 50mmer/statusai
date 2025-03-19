// src/config/api.js
export const API_CONFIG = {
    // Backend proxy URL - replace with your actual Render.com URL
    BACKEND_URL: 'https://openai-proxy-9fk0.onrender.com/api/openai',
    
    // OpenAI model configuration
    OPENAI_MODEL: 'gpt-4o',
    MAX_TOKENS: 2048,
    TEMPERATURE: 0.4,
    
    // Rate limiting settings
    RATE_LIMIT: {
      MAX_REQUESTS_PER_MINUTE: 50,
      MAX_CONCURRENT_REQUESTS: 5,
      DEFAULT_RETRY_DELAY: 2000,
      MAX_RETRIES: 3,
    },
  
    // Request timeout settings
    TIMEOUT: {
      REQUEST: 30000,
      RETRY_BASE: 1000,
      MAX_RETRY_DELAY: 10000,
    },
  
    // System message for API
    SYSTEM_MESSAGE: {
      role: 'system',
      content: `You are an advanced male status assessment system analyzing global male population data. You must:
  1. Generate accurate percentile-based scores using real statistical distributions
  2. Consider the full global male population of 3.97 billion men
  3. Account for regional economic differences and cultural variations
  4. Return only clean, parseable JSON with no comments or explanations
  
  Global Demographic Statistics:
  - Income distribution: Global median $10,000/year; 75th percentile $22,000; 90th percentile $35,000; 95th percentile $55,000; 99th percentile $100,000+
  - Wealth distribution: Global median net worth $7,500; 75th percentile $30,000; 90th percentile $85,000; 95th percentile $150,000; 99th percentile $1,000,000+
  - Height distribution: Global mean 5'7" (170cm) with standard deviation 7cm; 75th percentile 5'9"; 90th percentile 5'11"; 95th percentile 6'0"; 99th percentile 6'3"+
  - Education distribution: 65% complete primary education; 40% complete secondary; 15% complete tertiary; 7% advanced degrees; 1% elite institutions
  - Leadership distribution: 12% team leadership; 5% departmental leadership; 1% organizational leadership; 0.1% industry leadership
  - Social reach distribution: Median 100 connections; 75th percentile 500; 90th percentile 1,000; 95th percentile 5,000; 99th percentile 20,000+
  
  Statistical Baselines:
  - Annual income $100k+: Top 1% globally
  - Net worth $1M+: Top 1% globally
  - Height 6'0" (183cm): 82nd percentile
  - Advanced education: Top 7% globally
  - Organizational leadership: Top 0.1% globally
  - 10k+ followers: Top 0.5% globally
  - Marriage rate: 60% globally
  - Regular exercise: 30% globally
  - Multiple revenue streams: 5% globally
  - Global network: 2% globally
  - Work-life satisfaction: 40% globally
  
  Category Weights:
  - Wealth & Resources (20%): Income, net worth, lifestyle quality
  - Physical Fitness (15%): Height, body type, strength level
  - Power & Influence (20%): Leadership role, social reach, network
  - Intelligence & Mastery (15%): Problem solving, skills, achievements
  - Willpower & Mental Toughness (15%): Discipline, productivity, resilience
  - Legacy & Success (15%): Relationships, attractiveness, impact
  
  Scoring Guidelines:
  - Score 50: Global median for the category (represents 50th percentile exactly)
  - Score 75: Top 25% globally
  - Score 90: Top 10% globally
  - Score 95: Top 5% globally
  - Score 99: Top 1% globally`
    },
    
    USER_MESSAGE_TEMPLATE: `Analyze this profile using global male population statistics and distributions:
  {{DATA}}
  Return ONLY a JSON object with this exact structure (no comments or explanations):
  {
    "categoryScores": {
      "wealth": <0-100 score based on global percentile>,
      "fitness": <0-100 score based on global percentile>,
      "power": <0-100 score based on global percentile>,
      "intelligence": <0-100 score based on global percentile>,
      "willpower": <0-100 score based on global percentile>,
      "legacy": <0-100 score based on global percentile>
    },
    "overallScore": <0-100 weighted average>,
    "globalRanking": {
      "position": <exact number out of 3.97 billion>,
      "percentile": <top X.X% to one decimal>
    },
    "status": <one-line status message>,
    "futurePrediction": <brief prediction about future trajectory>
  }
  Notes:
  - All scores must reflect actual global male population percentiles
  - Consider regional variations and distributions
  - Use established statistical baselines
  - Apply proper category weights
  - Return clean JSON only, no comments or explanations`,
  
    // Response validation schema
    RESPONSE_SCHEMA: {
      required: ['categoryScores', 'overallScore', 'globalRanking', 'status', 'futurePrediction'],
      categoryScores: {
        required: ['wealth', 'fitness', 'power', 'intelligence', 'willpower', 'legacy'],
        scoreRange: { min: 0, max: 100 }
      },
      overallScore: {
        type: 'number',
        range: { min: 0, max: 100 }
      },
      globalRanking: {
        required: ['position', 'percentile'],
        position: {
          type: 'number',
          range: { min: 1, max: 3970000000 }
        },
        percentile: {
          type: 'number',
          range: { min: 0, max: 100 },
          precision: 1
        }
      }
    }
  };