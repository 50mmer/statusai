// src/components/RatingBar.js (Updated with React.memo and optimizations)
import React, { memo, useMemo } from 'react';
import { View, StyleSheet, Text as RNText } from 'react-native';
import { Text } from 'react-native-paper';
import { theme, getScoreColor } from '../theme';

const RatingBar = ({ 
  label, 
  score, 
  maxWidth = '100%',
  height = 8,
  showValue = true
}) => {
  // Ensure score is a valid number
  const scoreNum = useMemo(() => {
    if (typeof score === 'string') return parseInt(score, 10);
    if (typeof score === 'number') return score;
    return 50;
  }, [score]);
  
  // Get score color - use useMemo to prevent recalculation
  const scoreColor = useMemo(() => getScoreColor(scoreNum), [scoreNum]);
  
  // Calculate bar styles using useMemo
  const barStyles = useMemo(() => [
    styles.barFill, 
    { 
      width: `${scoreNum}%`,
      height,
      backgroundColor: scoreColor
    }
  ], [scoreNum, height, scoreColor]);
  
  return (
    <View style={[styles.container, { maxWidth }]}>
      <View style={styles.labelRow}>
        <Text style={styles.label}>{label}</Text>
        {showValue && (
          <RNText style={[styles.value, { color: scoreColor }]}>{scoreNum}</RNText>
        )}
      </View>
      <View style={[styles.barBackground, { height }]}>
        <View style={barStyles} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
    width: '100%',
  },
  labelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: theme.colors.text,
  },
  value: {
    fontSize: 14,
    fontWeight: '600',
  },
  barBackground: {
    width: '100%',
    backgroundColor: theme.colors.disabled,
    borderRadius: 4,
    overflow: 'hidden',
  },
  barFill: {
    borderRadius: 4,
  },
});

// Using memo to prevent unnecessary re-renders
export default memo(RatingBar);