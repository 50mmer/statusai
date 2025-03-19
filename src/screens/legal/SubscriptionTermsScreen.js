import React from 'react';
import { 
  View, 
  StyleSheet, 
  ScrollView,
  SafeAreaView,
} from 'react-native';
import { Text } from 'react-native-paper';
import { StatusBar } from 'expo-status-bar';
import CustomButton from '../../components/CustomButton';
import { theme } from '../../theme';

const SubscriptionTermsScreen = ({ navigation }) => {
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" />
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        <Text style={styles.headerTitle}>Subscription Terms</Text>
        <Text style={styles.lastUpdated}>Last updated: March 13, 2025</Text>
        
        <Text style={styles.paragraph}>
          These Subscription Terms are part of our Terms of Service and govern your use of Status AI subscription services. By subscribing to Status AI, you agree to these terms.
        </Text>
        
        <Text style={styles.sectionTitle}>1. Subscription Plans</Text>
        <Text style={styles.paragraph}>
          Status AI offers the following subscription plans:
        </Text>
        <Text style={styles.bulletPoint}>
          <Text style={styles.bold}>One-Day Access:</Text> £3.49 for 24-hour access to the assessment features, including full assessment, detailed category breakdown, global percentile ranking, and 10-year prediction.
        </Text>
        <Text style={styles.bulletPoint}>
          <Text style={styles.bold}>Monthly Access:</Text> £4.99 for 30-day access to assessment features, unlimited reassessments, progress tracking, and detailed analytics.
        </Text>
        
        <Text style={styles.sectionTitle}>2. Billing and Renewal</Text>
        <Text style={styles.paragraph}>
          For the Monthly Access plan, your subscription will automatically renew at the end of each subscription period unless you cancel it. One-Day Access is a single payment for 24-hour access and does not auto-renew.
        </Text>
        
        <Text style={styles.paragraph}>
          The subscription fee will be charged to your Apple ID account at confirmation of purchase. Your account will be charged for renewal within 24 hours prior to the end of the current period. Subscriptions may be managed by the user and auto-renewal may be turned off by going to the user's Account Settings after purchase.
        </Text>
        
        <Text style={styles.sectionTitle}>3. Free Trials</Text>
        <Text style={styles.paragraph}>
          When offered, free trials automatically convert to paid subscriptions unless auto-renew is turned off at least 24 hours before the end of the trial period.
        </Text>
        
        <Text style={styles.paragraph}>
          To avoid charges, you must cancel before the end of the free trial period. Cancellation takes effect the day after the last day of the current subscription period.
        </Text>
        
        <Text style={styles.sectionTitle}>4. Cancellation Policy</Text>
        <Text style={styles.paragraph}>
          You can cancel your subscription at any time by going to your Apple ID account settings and selecting to cancel the subscription. The cancellation will take effect at the end of your current billing period, and you will continue to have access to your subscription until then.
        </Text>
        
        <Text style={styles.paragraph}>
          For example, if you purchase a Monthly Access subscription on January 1st and cancel on January 15th, you will still have access until January 31st when your billing period ends.
        </Text>
        
        <Text style={styles.sectionTitle}>5. Refund Policy</Text>
        <Text style={styles.paragraph}>
          We do not provide refunds for partial subscription periods or unused portions of a subscription. All purchases are final and non-refundable.
        </Text>
        
        <Text style={styles.paragraph}>
          For refund requests, please contact Apple Support directly, as all payments are processed through the Apple App Store. Any refunds are at the sole discretion of Apple.
        </Text>
        
        <Text style={styles.sectionTitle}>6. Price Changes</Text>
        <Text style={styles.paragraph}>
          We reserve the right to change our subscription prices at any time. If we change the price of a subscription, we will notify you before the price change takes effect. If you do not agree to the price change, you have the right to reject the change by canceling your subscription before the price change takes effect.
        </Text>
        
        <Text style={styles.paragraph}>
          Your continued use of our services after the price change takes effect constitutes your agreement to pay the modified subscription fee amount.
        </Text>
        
        <Text style={styles.sectionTitle}>7. Account Sharing</Text>
        <Text style={styles.paragraph}>
          Your subscription is personal to you and may not be shared with others. You are responsible for maintaining the confidentiality of your account credentials and for all activities that occur under your account.
        </Text>
        
        <Text style={styles.paragraph}>
          Any sharing of accounts or subscription benefits is prohibited and may result in the termination of your subscription without refund.
        </Text>
        
        <Text style={styles.sectionTitle}>8. Subscription Management</Text>
        <Text style={styles.paragraph}>
          You can manage your subscription by:
        </Text>
        <Text style={styles.bulletPoint}>• Opening the Settings app on your iOS device</Text>
        <Text style={styles.bulletPoint}>• Tapping your name/Apple ID at the top</Text>
        <Text style={styles.bulletPoint}>• Tapping Subscriptions</Text>
        <Text style={styles.bulletPoint}>• Finding Status AI in the list and tapping it</Text>
        <Text style={styles.bulletPoint}>• Using the options to modify or cancel your subscription</Text>
        
        <Text style={styles.sectionTitle}>9. Content and Feature Access</Text>
        <Text style={styles.paragraph}>
          Once your subscription ends or is canceled, your access to subscription-only features will be terminated. However, you will retain access to your basic account information. If you wish to regain access to subscription features, you will need to purchase a new subscription.
        </Text>
        
        <Text style={styles.paragraph}>
          We reserve the right to modify, suspend, or discontinue any part of our subscription services at any time.
        </Text>
        
        <Text style={styles.sectionTitle}>10. Contact Us</Text>
        <Text style={styles.paragraph}>
          If you have any questions about these Subscription Terms, please contact us at:
        </Text>
        <Text style={styles.paragraph}>
          Email: subscriptions@statusaiapp.com
        </Text>
        <Text style={styles.paragraph}>
          Address: 123 Main Street, Suite 101, London, UK, EC1A 1AA
        </Text>
        
        <CustomButton
          mode="contained"
          onPress={() => navigation.goBack()}
          style={styles.button}
        >
          Back
        </CustomButton>
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
  headerTitle: {
    fontSize: theme.typography.sizes.title1,
    fontWeight: 'bold',
    color: theme.colors.text,
    marginBottom: theme.spacing.s,
    textAlign: 'center',
  },
  lastUpdated: {
    fontSize: theme.typography.sizes.footnote,
    color: theme.colors.subtext,
    marginBottom: theme.spacing.xl,
    textAlign: 'center',
  },
  sectionTitle: {
    fontSize: theme.typography.sizes.title3,
    fontWeight: '600',
    color: theme.colors.text,
    marginTop: theme.spacing.l,
    marginBottom: theme.spacing.m,
  },
  paragraph: {
    fontSize: theme.typography.sizes.body,
    color: theme.colors.text,
    lineHeight: 22,
    marginBottom: theme.spacing.m,
  },
  bulletPoint: {
    fontSize: theme.typography.sizes.body,
    color: theme.colors.text,
    lineHeight: 22,
    marginLeft: theme.spacing.m,
    marginBottom: theme.spacing.s,
  },
  bold: {
    fontWeight: '700',
  },
  button: {
    marginTop: theme.spacing.xl,
  },
});

export default SubscriptionTermsScreen;