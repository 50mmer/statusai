// src/components/CustomButton.js (Updated with React.memo)
import React, { memo } from 'react';
import { StyleSheet, Platform, TouchableOpacity, Text, View, ActivityIndicator } from 'react-native';
import { Button } from 'react-native-paper';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { theme } from '../theme';

const CustomButton = ({ 
  mode = 'contained',
  onPress,
  style,
  labelStyle,
  disabled = false,
  loading = false,
  icon,
  children,
  contentStyle,
  ...props 
}) => {
  // For iOS, create a custom button with a simpler implementation
  if (Platform.OS === 'ios') {
    // Determine background color based on mode
    const backgroundColor = mode === 'contained' 
      ? disabled ? '#E2E8F0' : theme.colors.primary 
      : 'transparent';
      
    // Determine text color based on mode
    const textColor = mode === 'contained'
      ? disabled ? '#A0AEC0' : 'white'
      : disabled ? '#A0AEC0' : theme.colors.primary;
      
    // Determine border
    const borderWidth = mode === 'outlined' ? 1.5 : 0;
    const borderColor = mode === 'outlined' ? theme.colors.primary : 'transparent';
    
    // Determine content direction
    const direction = (icon === 'arrow-right' || icon === 'check' || icon === 'share-variant')
      ? 'row-reverse'
      : 'row';
    
    return (
      <TouchableOpacity
        style={[
          {
            borderRadius: 12,
            backgroundColor,
            borderWidth,
            borderColor,
            paddingVertical: 4,
            marginVertical: 8,
          },
          style
        ]}
        onPress={onPress}
        disabled={disabled || loading}
        activeOpacity={0.7}
        {...props}
      >
        <View style={[
          {
            height: 44,
            alignItems: 'center',
            justifyContent: 'center',
            flexDirection: direction,
            paddingHorizontal: 16,
          },
          contentStyle
        ]}>
          {/* Show loading spinner if loading */}
          {loading ? (
            <ActivityIndicator 
              size="small" 
              color={textColor} 
              style={{ marginRight: 8 }}
            />
          ) : (
            /* Show icon if provided */
            icon && (
              <MaterialCommunityIcons
                name={icon}
                size={22}
                color={textColor}
                style={direction === 'row' ? { marginRight: 8 } : { marginLeft: 8 }}
              />
            )
          )}
          
          <Text style={[
            {
              fontSize: 16,
              fontWeight: '600',
              color: textColor,
              textAlign: 'center',
            },
            labelStyle
          ]}>
            {children}
          </Text>
        </View>
      </TouchableOpacity>
    );
  }
  
  // For Android and web, use react-native-paper Button
  return (
    <Button
      mode={mode}
      onPress={onPress}
      disabled={disabled || loading}
      loading={loading}
      icon={icon}
      style={[
        styles.button,
        mode === 'contained' && styles.containedButton,
        mode === 'outlined' && styles.outlinedButton,
        mode === 'text' && styles.textButton,
        disabled && styles.disabledButton,
        style,
      ]}
      labelStyle={[
        styles.label,
        mode === 'outlined' && styles.outlinedLabel,
        mode === 'text' && styles.textLabel,
        disabled && styles.disabledLabel,
        labelStyle,
      ]}
      contentStyle={[styles.content, contentStyle]}
      {...props}
    >
      {children}
    </Button>
  );
};

const styles = StyleSheet.create({
  button: {
    borderRadius: 12,
    paddingVertical: 4,
    marginVertical: 8,
    minWidth: 100,
  },
  containedButton: {
    backgroundColor: theme.colors.primary,
    elevation: 2
  },
  outlinedButton: {
    borderColor: theme.colors.primary,
    borderWidth: 1.5,
    backgroundColor: 'transparent',
  },
  textButton: {
    backgroundColor: 'transparent',
  },
  disabledButton: {
    backgroundColor: 'rgba(0, 0, 0, 0.12)',
    borderColor: 'transparent',
    opacity: 0.6,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    includeFontPadding: false,
    letterSpacing: 0.5,
    color: 'white',
    textAlign: 'center',
  },
  outlinedLabel: {
    color: theme.colors.primary,
  },
  textLabel: {
    color: theme.colors.primary,
  },
  disabledLabel: {
    color: 'rgba(0, 0, 0, 0.38)',
  },
  content: {
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    paddingHorizontal: 16,
  },
});

// Using memo to prevent unnecessary re-renders
export default memo(CustomButton);