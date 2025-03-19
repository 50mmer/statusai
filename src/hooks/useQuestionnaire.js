import { useState, useCallback, useMemo } from 'react';
import { Alert } from 'react-native';

// Categories and their fields mapping - moved outside component for better performance
const CATEGORY_FIELDS = {
  1: ['annualIncome', 'netWorth', 'lifestyle'],
  2: ['height', 'bodyType', 'strengthLevel'],
  3: ['leadershipRole', 'socialReach', 'networkStrength'],
  4: ['problemSolving', 'skillLevel', 'achievements'],
  5: ['discipline', 'productiveHours', 'stressResilience'],
  6: ['relationshipStatus', 'attractiveness', 'legacy']
};

const CATEGORY_TITLES = {
  1: "Wealth & Resources",
  2: "Physical Fitness",
  3: "Power & Influence",
  4: "Intelligence & Mastery",
  5: "Willpower & Mental Toughness",
  6: "Legacy & Success"
};

// Initial state moved outside component to prevent recreation on each render
const initialAnswers = {
  annualIncome: '',
  netWorth: '',
  lifestyle: '',
  height: '',
  bodyType: '',
  strengthLevel: '',
  leadershipRole: '',
  socialReach: '',
  networkStrength: '',
  problemSolving: '',
  skillLevel: '',
  achievements: '',
  discipline: '',
  productiveHours: '',
  stressResilience: '',
  relationshipStatus: '',
  attractiveness: '',
  legacy: ''
};

export const useQuestionnaire = () => {
  const [currentCategory, setCurrentCategory] = useState(1);
  const [answers, setAnswers] = useState(initialAnswers);

  const updateAnswer = useCallback((field, value) => {
    setAnswers(prev => ({
      ...prev,
      [field]: value
    }));
  }, []);

  const validateCategory = useCallback((category) => {
    const fields = CATEGORY_FIELDS[category] || [];
    const hasEmptyFields = fields.some(field => !answers[field]);
    
    if (hasEmptyFields) {
      Alert.alert(
        'Incomplete Answers',
        'Please complete all fields before proceeding.',
        [{ text: 'OK' }]
      );
      return false;
    }
    return true;
  }, [answers]);

  const getCategoryTitle = useCallback((category) => {
    return CATEGORY_TITLES[category] || "";
  }, []);

  const moveToNextCategory = useCallback(() => {
    if (!validateCategory(currentCategory)) {
      return false;
    }
    if (currentCategory < 6) {
      setCurrentCategory(prev => prev + 1);
      return false;
    }
    return true;
  }, [currentCategory, validateCategory]);

  const moveToPreviousCategory = useCallback(() => {
    if (currentCategory > 1) {
      setCurrentCategory(prev => prev - 1);
      return false;
    }
    return true;
  }, [currentCategory]);

  // Use useMemo to prevent unnecessary recalculations
  const getCategoryFields = useCallback((category) => {
    return CATEGORY_FIELDS[category] || [];
  }, []);
  
  return {
    currentCategory,
    answers,
    updateAnswer,
    validateCategory,
    getCategoryTitle,
    moveToNextCategory,
    moveToPreviousCategory,
    getCategoryFields
  };
};

// Options for each question field
export const QUESTION_OPTIONS = {
  annualIncome: [
    { label: 'Less than $10,000', value: '<$10k' },
    { label: '$10,000 - $50,000', value: '$10k-$50k' },
    { label: '$50,000 - $100,000', value: '$50k-$100k' },
    { label: '$100,000 - $500,000', value: '$100k-$500k' },
    { label: '$500,000 - $1,000,000', value: '$500k-$1M' },
    { label: '$1,000,000+', value: '$1M+' }
  ],
  netWorth: [
    { label: 'Less than $10,000', value: '<$10k' },
    { label: '$10,000 - $50,000', value: '$10k-$50k' },
    { label: '$50,000 - $100,000', value: '$50k-$100k' },
    { label: '$100,000 - $500,000', value: '$100k-$500k' },
    { label: '$500,000 - $1,000,000', value: '$500k-$1M' },
    { label: '$1,000,000+', value: '$1M+' }
  ],
  lifestyle: [
    { label: 'Budget lifestyle', value: 'budget' },
    { label: 'Comfortable lifestyle', value: 'comfortable' },
    { label: 'Luxury lifestyle', value: 'luxury' }
  ],
  height: [
    { label: 'Under 5ft 6in (168cm)', value: 'under_5_6' },
    { label: '5ft 6in - 5ft 8in (168-173cm)', value: '5_6_to_5_8' },
    { label: '5ft 9in - 5ft 11in (175-180cm)', value: '5_9_to_5_11' },
    { label: '6ft 0in - 6ft 2in (183-188cm)', value: '6_0_to_6_2' },
    { label: 'Over 6ft 2in (188cm)', value: 'over_6_2' }
  ],
  bodyType: [
    { label: 'Underweight', value: 'underweight' },
    { label: 'Athletic', value: 'athletic' },
    { label: 'Muscular', value: 'muscular' },
    { label: 'Overweight', value: 'overweight' },
    { label: 'Obese', value: 'obese' }
  ],
  strengthLevel: [
    { label: 'Below average', value: 'below_average' },
    { label: 'Average', value: 'average' },
    { label: 'Above average', value: 'above_average' },
    { label: 'Elite', value: 'elite' }
  ],
  leadershipRole: [
    { label: 'None', value: 'none' },
    { label: 'Small team', value: 'small_team' },
    { label: 'Organization/department', value: 'organization' },
    { label: 'CEO/Public Figure', value: 'ceo' }
  ],
  socialReach: [
    { label: 'Less than 1k followers', value: '<1k' },
    { label: '1k - 10k followers', value: '1k-10k' },
    { label: '10k - 100k followers', value: '10k-100k' },
    { label: '100k+ followers', value: '100k+' }
  ],
  networkStrength: [
    { label: 'Local', value: 'local' },
    { label: 'National', value: 'national' },
    { label: 'Global', value: 'global' }
  ],
  problemSolving: Array.from({ length: 10 }, (_, i) => ({
    label: i === 0 ? '1 - Basic' : i === 9 ? '10 - Exceptional' : String(i + 1),
    value: String(i + 1)
  })),
  skillLevel: [
    { label: 'No specialized skills', value: 'no_skills' },
    { label: 'One specialized skill', value: 'one_skill' },
    { label: 'Multi-skilled', value: 'multi_skilled' },
    { label: 'World-class expertise', value: 'world_class' }
  ],
  achievements: [
    { label: 'None', value: 'none' },
    { label: 'Degree/certification', value: 'degree' },
    { label: 'Industry awards', value: 'awards' },
    { label: 'Global impact', value: 'global' }
  ],
  discipline: Array.from({ length: 10 }, (_, i) => ({
    label: i === 0 ? '1 - Very Low' : i === 9 ? '10 - Exceptional' : String(i + 1),
    value: String(i + 1)
  })),
  productiveHours: [
    { label: 'Less than 2 hours', value: '<2' },
    { label: '2-4 hours', value: '2-4' },
    { label: '5-7 hours', value: '5-7' },
    { label: '8+ hours', value: '8+' }
  ],
  stressResilience: [
    { label: 'Crumbles under pressure', value: 'crumbles' },
    { label: 'Handles moderate stress', value: 'moderate' },
    { label: 'Thrives under high stress', value: 'thrives' }
  ],
  relationshipStatus: [
    { label: 'Single', value: 'single' },
    { label: 'Dating', value: 'dating' },
    { label: 'Married', value: 'married' },
    { label: 'Multiple Partners', value: 'multiple' }
  ],
  attractiveness: Array.from({ length: 10 }, (_, i) => ({
    label: i === 0 ? '1 - Very Low' : i === 9 ? '10 - Exceptional' : String(i + 1),
    value: String(i + 1)
  })),
  legacy: [
    { label: 'No legacy', value: 'none' },
    { label: 'Small impact', value: 'small' },
    { label: 'Large family', value: 'large' },
    { label: 'Global legacy', value: 'global' }
  ]
};