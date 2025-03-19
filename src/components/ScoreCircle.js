// src/components/ScoreCircle.js (Updated with React.memo and optimizations)
import React, { memo, useMemo } from 'react';
import { View, StyleSheet, Platform, Text } from 'react-native';
import { theme, getScoreColor } from '../theme';

const ScoreCircle = ({ 
  score, 
  label,
  size = 100,
  labelStyle,
  showProgress = true,
  strokeWidth = 10
}) => {
  // Ensure score is a simple number - using useMemo to optimize
  const scoreNum = useMemo(() => {
    if (typeof score === 'string') return parseInt(score, 10);
    if (typeof score === 'number') return score;
    return 50;
  }, [score]);
  
  // Get appropriate color based on score - using useMemo to optimize
  const scoreColor = useMemo(() => getScoreColor(scoreNum), [scoreNum]);
  
  // Calculate styles based on props - using useMemo to optimize
  const circleContainerStyle = useMemo(() => [
    styles.circleContainer, 
    { 
      width: size, 
      height: size,
      borderRadius: size / 2,
      borderWidth: strokeWidth,
      borderColor: scoreColor,
      backgroundColor: 'transparent'
    }
  ], [size, strokeWidth, scoreColor]);
  
  const scoreTextStyle = useMemo(() => [
    styles.scoreText,
    { fontSize: size * 0.36 }
  ], [size]);
  
  const labelTextStyle = useMemo(() => [
    styles.label, 
    { 
      fontSize: size * 0.14,
      marginTop: 8
    },
    labelStyle
  ], [size, labelStyle]);
  
  const progressCircleStyle = useMemo(() => [
    styles.progressCircle,
    {
      width: showProgress ? `${scoreNum}%` : '0%',
      backgroundColor: scoreColor,
      opacity: 0.2
    }
  ], [showProgress, scoreNum, scoreColor]);
  
  // For iOS, render a simpler circle without SVG
  if (Platform.OS === 'ios') {
    return (
      <View style={[styles.container, { width: size }]}>
        <View style={circleContainerStyle}>
          <Text style={scoreTextStyle}>
            {scoreNum}
          </Text>
        </View>
        
        {label && (
          <Text 
            style={labelTextStyle}
            numberOfLines={1}
          >
            {label}
          </Text>
        )}
      </View>
    );
  }
  
  // For Android and Web, render a simple circle
  return (
    <View style={[styles.container, { width: size }]}>
      <View style={circleContainerStyle}>
        <View style={progressCircleStyle} />
        
        <Text style={scoreTextStyle}>
          {scoreNum}
        </Text>
      </View>
      
      {label && (
        <Text 
          style={labelTextStyle}
          numberOfLines={1}
        >
          {label}
        </Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  circleContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  progressCircle: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  scoreText: {
    fontWeight: '700',
    color: theme.colors.text,
    textAlign: 'center',
  },
  label: {
    textAlign: 'center',
    color: theme.colors.text,
    fontWeight: '600',
  }
});

// Using memo to prevent unnecessary re-renders
export default memo(ScoreCircle);