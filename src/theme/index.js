import { DefaultTheme } from 'react-native-paper';
import { Platform } from 'react-native';

// Theme with white background, black text, and score-based accent colors
export const theme = {
  ...DefaultTheme,
  dark: false,
  colors: {
    ...DefaultTheme.colors,
    // Core colors
    primary: '#2D3748',       // Dark gray/almost black for primary elements
    secondary: '#4A5568',     // Medium gray
    background: '#FFFFFF',    // Clean white background 
    surface: '#FFFFFF',
    card: '#FFFFFF',
    text: '#1A202C',          // Very dark gray, almost black
    subtext: '#718096',       // Medium gray for secondary text
    placeholder: '#A0AEC0',
    disabled: '#E2E8F0',
    
    // Score-based colors
    highScore: '#38A169',     // Green for high scores
    midScore: '#3182CE',      // Blue for average scores
    lowScore: '#E53E3E',      // Red for low scores
    
    // Additional score colors for smoother transitions
    veryHighScore: '#22883E', // Darker green for very high scores
    highMidScore: '#38B2AC',  // Teal for high-mid scores
    midLowScore: '#805AD5',   // Purple for mid-low scores
    veryLowScore: '#C53030',  // Darker red for very low scores
    
    // UI colors
    error: '#E53E3E',         // Red
    success: '#38A169',       // Green
    warning: '#F6AD55',       // Orange
    info: '#3182CE',          // Blue
    border: '#E2E8F0',        // Very light gray
    highlight: '#EBF8FF',     // Very light blue
  },
  spacing: {
    xs: 4,
    s: 8,
    m: 16,
    l: 24,
    xl: 32,
    xxl: 48,
  },
  roundness: 16,
  animation: {
    scale: 1.0,
  },
  // Platform specific elevation
  elevation: Platform.select({
    ios: {
      small: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 3,
      },
      medium: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 8,
      },
      large: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.2,
        shadowRadius: 16,
      }
    },
    android: {
      small: { elevation: 2 },
      medium: { elevation: 4 },
      large: { elevation: 8 },
    }
  }),
  typography: {
    fontWeights: {
      light: '300',
      regular: '400',
      medium: '500',
      semibold: '600',
      bold: '700',
    },
    sizes: {
      caption: 12,
      footnote: 13,
      subhead: 15,
      body: 17,
      title3: 20,
      title2: 22,
      title1: 28,
      largeTitle: 34,
    }
  }
};

/**
 * Returns appropriate color based on score value with improved color transitions
 * @param {number} score - Score value between 0-100
 * @returns {string} - Color code for the score
 */
export const getScoreColor = (score) => {
  const numScore = parseFloat(score) || 0;
  
  // More granular color transitions based on score ranges
  if (numScore >= 90) return theme.colors.veryHighScore;   // Dark green for excellent (90-100)
  if (numScore >= 75) return theme.colors.highScore;       // Green for very good (75-89)
  if (numScore >= 65) return theme.colors.highMidScore;    // Teal for good (65-74)
  if (numScore >= 50) return theme.colors.midScore;        // Blue for average (50-64)
  if (numScore >= 35) return theme.colors.midLowScore;     // Purple for below average (35-49)
  if (numScore >= 20) return theme.colors.lowScore;        // Red for poor (20-34)
  return theme.colors.veryLowScore;                       // Dark red for very poor (0-19)
};

/**
 * Adjusts color opacity
 * @param {string} color - HEX color
 * @param {number} opacity - Opacity value between 0-1
 * @returns {string} - RGBA color
 */
export const withOpacity = (color, opacity = 0.5) => {
  // Convert hex to rgb
  let r = 0, g = 0, b = 0;
  
  // 3 digits
  if (color.length === 4) {
    r = parseInt(color[1] + color[1], 16);
    g = parseInt(color[2] + color[2], 16);
    b = parseInt(color[3] + color[3], 16);
  } 
  // 6 digits
  else if (color.length === 7) {
    r = parseInt(color.substring(1, 3), 16);
    g = parseInt(color.substring(3, 5), 16);
    b = parseInt(color.substring(5, 7), 16);
  }
  
  return `rgba(${r}, ${g}, ${b}, ${opacity})`;
};

/**
 * Gets a color gradient for score visualization
 * @param {number} score - Score value between 0-100
 * @returns {Object} - Object with start and end colors for gradient
 */
export const getScoreGradient = (score) => {
  const numScore = parseFloat(score) || 0;
  
  if (numScore >= 90) {
    return {
      start: '#38A169', // Green
      end: '#22883E'    // Dark green
    };
  } else if (numScore >= 75) {
    return {
      start: '#48BB78', // Light green
      end: '#38A169'    // Green
    };
  } else if (numScore >= 65) {
    return {
      start: '#38B2AC', // Teal
      end: '#48BB78'    // Light green
    };
  } else if (numScore >= 50) {
    return {
      start: '#4299E1', // Light blue
      end: '#3182CE'    // Blue
    };
  } else if (numScore >= 35) {
    return {
      start: '#805AD5', // Purple
      end: '#6B46C1'    // Dark purple
    };
  } else if (numScore >= 20) {
    return {
      start: '#F56565', // Light red
      end: '#E53E3E'    // Red
    };
  } else {
    return {
      start: '#E53E3E', // Red
      end: '#C53030'    // Dark red
    };
  }
};

export default theme;