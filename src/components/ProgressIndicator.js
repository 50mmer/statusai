// src/components/ProgressIndicator.js (Updated with React.memo and optimizations)
import React, { useEffect, useState, memo, useMemo } from 'react';
import { View, StyleSheet, Platform, Animated, Easing } from 'react-native';
import { Text, ActivityIndicator } from 'react-native-paper';
import { theme } from '../theme';

const ProgressIndicator = ({
  progress,
  status,
  subtitle,
  retryAttempt = 0,
  maxRetries = 5
}) => {
  // Animation for progress bar
  const [progressAnim] = useState(new Animated.Value(0));
  
  // Update animation when progress changes
  useEffect(() => {
    Animated.timing(progressAnim, {
      toValue: progress,
      duration: 300,
      easing: Easing.ease,
      useNativeDriver: false // We need to animate width which isn't supported by native driver
    }).start();
  }, [progress, progressAnim]);
  
  // Create animated width style - use useMemo to optimize
  const progressWidthStyle = useMemo(() => ({
    width: progressAnim.interpolate({
      inputRange: [0, 100],
      outputRange: ['0%', '100%'],
      extrapolate: 'clamp'
    })
  }), [progressAnim]);
  
  // Use useMemo to optimize retry text generation
  const retryText = useMemo(() => {
    if (retryAttempt > 0) {
      return `Retry attempt ${retryAttempt} of ${maxRetries}`;
    }
    return null;
  }, [retryAttempt, maxRetries]);
  
  return (
    <View style={styles.container}>
      <View style={styles.progressContainer}>
        <Animated.View 
          style={[
            styles.progressBar,
            progressWidthStyle,
            { backgroundColor: theme.colors.midScore }
          ]}
        />
      </View>
      
      <ActivityIndicator 
        size="large" 
        color={theme.colors.primary}
        style={styles.spinner}
      />
      
      <Text style={styles.status}>
        {status}
      </Text>
      
      {subtitle && (
        <Text style={styles.subtitle}>
          {subtitle}
        </Text>
      )}

      {retryAttempt > 0 && (
        <View style={styles.retryContainer}>
          <Text style={styles.retryText}>
            {retryText}
          </Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    padding: theme.spacing.l,
    width: '100%',
    maxWidth: 400,
    alignSelf: 'center',
  },
  progressContainer: {
    width: '100%',
    height: 8,
    backgroundColor: theme.colors.disabled,
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: theme.spacing.xl,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
      },
      android: {
        elevation: 2
      },
      web: {
        boxShadow: '0px 1px 3px rgba(0, 0, 0, 0.1)'
      }
    }),
  },
  progressBar: {
    height: '100%',
    borderRadius: 4,
  },
  spinner: {
    marginVertical: theme.spacing.l,
  },
  status: {
    fontSize: theme.typography.sizes.title3,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: theme.spacing.s,
    color: theme.colors.text,
  },
  subtitle: {
    fontSize: theme.typography.sizes.subhead,
    textAlign: 'center',
    lineHeight: 22,
    maxWidth: '90%',
    color: theme.colors.subtext,
  },
  retryContainer: {
    marginTop: theme.spacing.xl,
    paddingHorizontal: theme.spacing.l,
    paddingVertical: theme.spacing.s,
    backgroundColor: theme.colors.highlight,
    borderRadius: 20,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
      },
      android: {
        elevation: 1
      },
      web: {
        boxShadow: '0px 1px 2px rgba(0, 0, 0, 0.1)'
      }
    }),
  },
  retryText: {
    fontSize: theme.typography.sizes.footnote,
    textAlign: 'center',
    color: theme.colors.primary,
  },
});

// Using memo to prevent unnecessary re-renders
export default memo(ProgressIndicator);