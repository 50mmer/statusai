import React from 'react';
import { View, StyleSheet, SafeAreaView } from 'react-native';
import { Text } from 'react-native-paper';
import { StatusBar } from 'expo-status-bar';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import CustomButton from '../../components/CustomButton';
import { theme } from '../../theme';

const RegistrationSuccessScreen = ({ navigation, route }) => {
  const { email } = route.params || { email: 'your email' };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" />
      <View style={styles.contentContainer}>
        <View style={styles.iconContainer}>
          <MaterialCommunityIcons
            name="email-check"
            size={80}
            color={theme.colors.primary}
          />
        </View>

        <Text style={styles.title}>Verify Your Email</Text>
        
        <Text style={styles.message}>
          We've sent a verification email to:
        </Text>
        
        <Text style={styles.email}>{email}</Text>
        
        <Text style={styles.instructions}>
          Please check your inbox and follow the verification link to activate your account.
          If you don't see the email, check your spam folder.
        </Text>

        <View style={styles.buttonContainer}>
          <CustomButton
            mode="contained"
            onPress={() => navigation.navigate('Login')}
            style={styles.button}
          >
            Go to Login
          </CustomButton>
          
          <CustomButton
            mode="text"
            onPress={() => navigation.navigate('Welcome')}
            style={styles.secondaryButton}
          >
            Back to Welcome
          </CustomButton>
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  contentContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: theme.spacing.xl,
  },
  iconContainer: {
    marginBottom: theme.spacing.xl,
    padding: theme.spacing.l,
    backgroundColor: theme.colors.primary + '15', // 15% opacity
    borderRadius: 50,
  },
  title: {
    fontSize: theme.typography.sizes.title1,
    fontWeight: 'bold',
    color: theme.colors.text,
    marginBottom: theme.spacing.l,
    textAlign: 'center',
  },
  message: {
    fontSize: theme.typography.sizes.body,
    color: theme.colors.subtext,
    textAlign: 'center',
    marginBottom: theme.spacing.s,
  },
  email: {
    fontSize: theme.typography.sizes.body,
    fontWeight: '600',
    color: theme.colors.primary,
    marginBottom: theme.spacing.l,
    textAlign: 'center',
  },
  instructions: {
    fontSize: theme.typography.sizes.subhead,
    color: theme.colors.subtext,
    textAlign: 'center',
    marginBottom: theme.spacing.xl,
    maxWidth: '90%',
    lineHeight: 22,
  },
  buttonContainer: {
    width: '100%',
    maxWidth: 400,
    marginTop: theme.spacing.l,
  },
  button: {
    marginBottom: theme.spacing.m,
  },
  secondaryButton: {
    marginTop: theme.spacing.s,
  },
});

export default RegistrationSuccessScreen;