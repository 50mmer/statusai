import React, { useState, useRef } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  TouchableOpacity,
  Platform,
  Alert,
  Linking,
} from 'react-native';
import { Text, Surface, Portal, Dialog, Divider } from 'react-native-paper';
import { StatusBar } from 'expo-status-bar';
import { CommonActions } from '@react-navigation/native';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import CustomButton from '../../components/CustomButton';
import { theme } from '../../theme';
import { useAuth, SUBSCRIPTION_TIERS } from '../../contexts/AuthContext';
import { getTimeRemaining } from '../../config/subscriptionPlans';

const ProfileScreen = ({ navigation }) => {
  const { 
    user, 
    signOut, 
    subscription, 
    hasActiveSubscription, 
    subscriptionExpiryDate
  } = useAuth();
  
  const [loading, setLoading] = useState(false);
  const [showSignOutDialog, setShowSignOutDialog] = useState(false);
  const navigationRef = useRef(navigation);

  const handleSignOut = async () => {
    setLoading(true);
    try {
      console.log('Signing out user and navigating to Welcome screen');
      
      // Close the dialog
      setShowSignOutDialog(false);
      
      // Sign out the user
      await signOut();
      
      // Navigate to Welcome screen
      navigation.dispatch(
        CommonActions.reset({
          index: 0,
          routes: [{ name: 'Welcome' }],
        })
      );
    } catch (error) {
      console.error('Sign out error:', error);
      Alert.alert('Error', 'Failed to sign out. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleRestorePurchases = async () => {
    Alert.alert(
      'Restore Purchases',
      'This will check for any previous purchases and restore them to your account.',
      [
        { 
          text: 'Cancel', 
          style: 'cancel' 
        },
        {
          text: 'Restore',
          onPress: async () => {
            try {
              // In a real implementation, you would use in-app purchase API to restore purchases
              // For now, we'll just show a mock success message
              setTimeout(() => {
                Alert.alert(
                  'Success',
                  'Your purchases have been restored.',
                  [{ text: 'OK' }]
                );
              }, 1500);
            } catch (error) {
              console.error('Error restoring purchases:', error);
              Alert.alert('Error', 'Failed to restore purchases. Please try again.');
            }
          }
        }
      ]
    );
  };

  const getFormattedEmail = () => {
    if (!user?.email) return 'No email';
    
    // Check if email is too long, truncate in the middle if needed
    const email = user.email;
    if (email.length > 25) {
      const firstPart = email.substring(0, 12);
      const lastPart = email.substring(email.length - 12);
      return `${firstPart}...${lastPart}`;
    }
    return email;
  };

  const getSubscriptionLabel = () => {
    if (!hasActiveSubscription()) return 'No active subscription';
    
    if (subscription === SUBSCRIPTION_TIERS.ONE_DAY) {
      return 'One-Day Access';
    } else if (subscription === SUBSCRIPTION_TIERS.MONTHLY) {
      return 'Monthly Access';
    }
    
    return 'No subscription';
  };

  const getSubscriptionColor = () => {
    if (!hasActiveSubscription()) return theme.colors.subtext;
    return theme.colors.highScore;
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" />
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
      >
        <View style={styles.header}>
          <View style={styles.avatarContainer}>
            <MaterialCommunityIcons
              name="account-circle"
              size={80}
              color={theme.colors.primary}
            />
          </View>
          <Text style={styles.emailText}>{getFormattedEmail()}</Text>
          <View style={styles.subscriptionBadge}>
            <Text style={[styles.subscriptionText, { color: getSubscriptionColor() }]}>
              {getSubscriptionLabel()}
            </Text>
          </View>
          
          {/* Show subscription time remaining if active */}
          {hasActiveSubscription() && subscriptionExpiryDate && (
            <Text style={styles.timeRemainingText}>
              {getTimeRemaining(subscriptionExpiryDate)}
            </Text>
          )}
        </View>

        {/* Subscription Card */}
        <Surface style={styles.card}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardTitle}>Subscription</Text>
          </View>
          
          <Divider style={styles.divider} />
          
          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => navigation.navigate('Subscription')}
          >
            <MaterialCommunityIcons 
              name={hasActiveSubscription() ? "star-circle" : "star-circle-outline"} 
              size={24} 
              color={hasActiveSubscription() ? theme.colors.highScore : theme.colors.primary} 
            />
            <Text style={styles.menuItemText}>
              {hasActiveSubscription() ? 'Manage Subscription' : 'Get Subscription'}
            </Text>
            <MaterialCommunityIcons 
              name="chevron-right" 
              size={24} 
              color={theme.colors.subtext} 
            />
          </TouchableOpacity>
          
          <TouchableOpacity
            style={styles.menuItem}
            onPress={handleRestorePurchases}
          >
            <MaterialCommunityIcons 
              name="restore" 
              size={24} 
              color={theme.colors.primary} 
            />
            <Text style={styles.menuItemText}>
              Restore Purchases
            </Text>
            <MaterialCommunityIcons 
              name="chevron-right" 
              size={24} 
              color={theme.colors.subtext} 
            />
          </TouchableOpacity>
        </Surface>

        {/* Assessment Card */}
        <Surface style={styles.card}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardTitle}>Assessment</Text>
          </View>
          
          <Divider style={styles.divider} />
          
          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => {
              if (hasActiveSubscription()) {
                navigation.navigate('Questionnaire');
              } else {
                navigation.navigate('Subscription');
              }
            }}
          >
            <MaterialCommunityIcons 
              name="clipboard-text-outline" 
              size={24} 
              color={theme.colors.primary} 
            />
            <Text style={styles.menuItemText}>
              Take Assessment
            </Text>
            <MaterialCommunityIcons 
              name="chevron-right" 
              size={24} 
              color={theme.colors.subtext} 
            />
          </TouchableOpacity>
          
          {/* Assessment history - can be a future feature */}
          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => Alert.alert('Coming Soon', 'Assessment history will be available in a future update.')}
          >
            <MaterialCommunityIcons 
              name="history" 
              size={24} 
              color={theme.colors.primary} 
            />
            <Text style={styles.menuItemText}>
              Assessment History
            </Text>
            <MaterialCommunityIcons 
              name="chevron-right" 
              size={24} 
              color={theme.colors.subtext} 
            />
          </TouchableOpacity>
        </Surface>

        {/* Legal & Privacy Card */}
        <Surface style={styles.card}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardTitle}>Legal & Privacy</Text>
          </View>
          
          <Divider style={styles.divider} />
          
          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => navigation.navigate('PrivacyPolicy')}
          >
            <MaterialCommunityIcons 
              name="shield-account" 
              size={24} 
              color={theme.colors.primary} 
            />
            <Text style={styles.menuItemText}>
              Privacy Policy
            </Text>
            <MaterialCommunityIcons 
              name="chevron-right" 
              size={24} 
              color={theme.colors.subtext} 
            />
          </TouchableOpacity>
          
          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => navigation.navigate('TermsOfService')}
          >
            <MaterialCommunityIcons 
              name="file-document" 
              size={24} 
              color={theme.colors.primary} 
            />
            <Text style={styles.menuItemText}>
              Terms of Service
            </Text>
            <MaterialCommunityIcons 
              name="chevron-right" 
              size={24} 
              color={theme.colors.subtext} 
            />
          </TouchableOpacity>
          
          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => navigation.navigate('SubscriptionTerms')}
          >
            <MaterialCommunityIcons 
              name="credit-card-outline" 
              size={24} 
              color={theme.colors.primary} 
            />
            <Text style={styles.menuItemText}>
              Subscription Terms
            </Text>
            <MaterialCommunityIcons 
              name="chevron-right" 
              size={24} 
              color={theme.colors.subtext} 
            />
          </TouchableOpacity>
          
          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => navigation.navigate('DataDeletion')}
          >
            <MaterialCommunityIcons 
              name="delete" 
              size={24} 
              color={theme.colors.lowScore} 
            />
            <Text style={[styles.menuItemText, { color: theme.colors.lowScore }]}>
              Delete My Data
            </Text>
            <MaterialCommunityIcons 
              name="chevron-right" 
              size={24} 
              color={theme.colors.subtext} 
            />
          </TouchableOpacity>
        </Surface>

        {/* Support Card */}
        <Surface style={styles.card}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardTitle}>Support</Text>
          </View>
          
          <Divider style={styles.divider} />
          
          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => Linking.openURL('mailto:support@statusai.com')}
          >
            <MaterialCommunityIcons 
              name="email-outline" 
              size={24} 
              color={theme.colors.primary} 
            />
            <Text style={styles.menuItemText}>
              Contact Support
            </Text>
            <MaterialCommunityIcons 
              name="chevron-right" 
              size={24} 
              color={theme.colors.subtext} 
            />
          </TouchableOpacity>
        </Surface>

        <CustomButton
          mode="outlined"
          onPress={() => setShowSignOutDialog(true)}
          style={styles.signOutButton}
          icon="logout"
        >
          Sign Out
        </CustomButton>

        {/* Sign Out Dialog */}
        <Portal>
          <Dialog
            visible={showSignOutDialog}
            onDismiss={() => setShowSignOutDialog(false)}
            style={styles.dialog}
          >
            <Dialog.Title style={styles.dialogTitle}>Sign Out</Dialog.Title>
            <Dialog.Content>
              <Text style={styles.dialogContent}>
                Are you sure you want to sign out?
              </Text>
            </Dialog.Content>
            <Dialog.Actions style={styles.dialogActions}>
              <CustomButton
                mode="text"
                onPress={() => setShowSignOutDialog(false)}
              >
                Cancel
              </CustomButton>
              <CustomButton
                mode="contained"
                onPress={handleSignOut}
                loading={loading}
                disabled={loading}
              >
                Sign Out
              </CustomButton>
            </Dialog.Actions>
          </Dialog>
        </Portal>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: theme.spacing.xl,
    paddingBottom: theme.spacing.xxl,
  },
  header: {
    alignItems: 'center',
    marginBottom: theme.spacing.xl,
  },
  avatarContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: theme.colors.primary + '20', // 20% opacity
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: theme.spacing.m,
  },
  emailText: {
    fontSize: theme.typography.sizes.body,
    fontWeight: '600',
    color: theme.colors.text,
    marginBottom: theme.spacing.s,
  },
  subscriptionBadge: {
    paddingHorizontal: theme.spacing.m,
    paddingVertical: theme.spacing.xs,
    borderRadius: 16,
    backgroundColor: theme.colors.surface,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  subscriptionText: {
    fontSize: theme.typography.sizes.footnote,
    fontWeight: '600',
  },
  timeRemainingText: {
    marginTop: theme.spacing.m,
    fontSize: theme.typography.sizes.footnote,
    color: theme.colors.subtext,
  },
  card: {
    borderRadius: theme.roundness,
    marginBottom: theme.spacing.l,
    overflow: 'hidden',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 3,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  cardHeader: {
    padding: theme.spacing.l,
  },
  cardTitle: {
    fontSize: theme.typography.sizes.title3,
    fontWeight: '600',
    color: theme.colors.text,
  },
  divider: {
    backgroundColor: theme.colors.border,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: theme.spacing.l,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  menuItemText: {
    flex: 1,
    fontSize: theme.typography.sizes.body,
    color: theme.colors.text,
    marginLeft: theme.spacing.l,
  },
  signOutButton: {
    marginTop: theme.spacing.l,
  },
  dialog: {
    borderRadius: theme.roundness,
    backgroundColor: theme.colors.surface,
  },
  dialogTitle: {
    textAlign: 'center',
  },
  dialogContent: {
    textAlign: 'center',
    color: theme.colors.subtext,
  },
  dialogActions: {
    justifyContent: 'space-between',
    paddingHorizontal: theme.spacing.m,
  },
});

export default ProfileScreen;