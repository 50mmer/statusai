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

const TermsOfServiceScreen = ({ navigation }) => {
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" />
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        <Text style={styles.headerTitle}>Terms of Service</Text>
        <Text style={styles.lastUpdated}>Last updated: March 13, 2025</Text>
        
        <Text style={styles.paragraph}>
          Please read these Terms of Service ("Terms") carefully before using the Status AI mobile application ("the App") operated by Status AI Ltd ("we," "us," or "our").
        </Text>
        
        <Text style={styles.paragraph}>
          By downloading, accessing, or using our App, you agree to be bound by these Terms. If you disagree with any part of the Terms, you may not access the App.
        </Text>
        
        <Text style={styles.sectionTitle}>1. Account Registration</Text>
        <Text style={styles.paragraph}>
          To use certain features of the App, you must register for an account. You agree to provide accurate, current, and complete information during the registration process and to update such information to keep it accurate, current, and complete.
        </Text>
        
        <Text style={styles.paragraph}>
          You are responsible for safeguarding your password and for all activities that occur under your account. You agree to notify us immediately of any unauthorized use of your account.
        </Text>
        
        <Text style={styles.paragraph}>
          We reserve the right to disable any user account if we believe you have violated these Terms.
        </Text>
        
        <Text style={styles.sectionTitle}>2. Description of Service</Text>
        <Text style={styles.paragraph}>
          Status AI provides assessment services to evaluate various aspects of your personal profile and compare results against global demographics. Our service includes subscription options that provide access to assessments and related features.
        </Text>
        
        <Text style={styles.paragraph}>
          The App uses statistical models to generate percentile-based scores and predictions based on your self-reported information. These scores and predictions are for entertainment and informational purposes only.
        </Text>
        
        <Text style={styles.sectionTitle}>3. Subscriptions and Payments</Text>
        <Text style={styles.paragraph}>
          The App offers subscription-based access to assessment features:
        </Text>
        <Text style={styles.bulletPoint}>• One-Day Access: £3.49 for 24-hour access</Text>
        <Text style={styles.bulletPoint}>• Monthly Access: £4.99 for 30-day access with additional features</Text>
        
        <Text style={styles.paragraph}>
          Subscriptions automatically renew unless canceled at least 24 hours before the end of the current period. You can manage and cancel subscriptions in your Apple ID account settings.
        </Text>
        
        <Text style={styles.paragraph}>
          Payment will be charged to your Apple ID account at confirmation of purchase. Prices are subject to change upon notice from us. All fees and charges are non-refundable.
        </Text>
        
        <Text style={styles.sectionTitle}>4. User Conduct</Text>
        <Text style={styles.paragraph}>
          You agree not to:
        </Text>
        <Text style={styles.bulletPoint}>• Use our services for any illegal purpose</Text>
        <Text style={styles.bulletPoint}>• Attempt to gain unauthorized access to any part of our services</Text>
        <Text style={styles.bulletPoint}>• Use automated methods to access or use our services</Text>
        <Text style={styles.bulletPoint}>• Share your account with others</Text>
        <Text style={styles.bulletPoint}>• Provide false or misleading information</Text>
        <Text style={styles.bulletPoint}>• Infringe upon the rights of others</Text>
        <Text style={styles.bulletPoint}>• Interfere with the proper functioning of the App</Text>
        
        <Text style={styles.sectionTitle}>5. Intellectual Property</Text>
        <Text style={styles.paragraph}>
          The App, including its content, features, and functionality, is owned by us and protected by copyright, trademark, and other intellectual property laws. You may not reproduce, distribute, modify, create derivative works from, or publicly display any part of our App without prior written consent.
        </Text>
        
        <Text style={styles.sectionTitle}>6. Disclaimer of Warranties</Text>
        <Text style={styles.paragraph}>
          THE APP AND ALL SERVICES ARE PROVIDED "AS IS" AND "AS AVAILABLE" WITHOUT ANY WARRANTIES OF ANY KIND, EITHER EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, OR NON-INFRINGEMENT.
        </Text>
        
        <Text style={styles.paragraph}>
          We do not guarantee that the App will be uninterrupted, secure, or error-free. Results and predictions generated by the App are for entertainment purposes only and should not be considered professional advice.
        </Text>
        
        <Text style={styles.sectionTitle}>7. Limitation of Liability</Text>
        <Text style={styles.paragraph}>
          TO THE MAXIMUM EXTENT PERMITTED BY LAW, WE SHALL NOT BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES, OR ANY LOSS OF PROFITS OR REVENUES, WHETHER INCURRED DIRECTLY OR INDIRECTLY, OR ANY LOSS OF DATA, USE, GOODWILL, OR OTHER INTANGIBLE LOSSES, RESULTING FROM YOUR ACCESS TO OR USE OF OR INABILITY TO ACCESS OR USE THE APP.
        </Text>
        
        <Text style={styles.sectionTitle}>8. Indemnification</Text>
        <Text style={styles.paragraph}>
          You agree to defend, indemnify, and hold harmless us, our affiliates, and their respective officers, directors, employees, and agents, from and against any claims, liabilities, damages, losses, and expenses, including without limitation reasonable legal and accounting fees, arising out of or in any way connected with your access to or use of the App or your violation of these Terms.
        </Text>
        
        <Text style={styles.sectionTitle}>9. Termination</Text>
        <Text style={styles.paragraph}>
          We may terminate or suspend your account and access to our services immediately, without prior notice, for conduct that we believe violates these Terms or is harmful to other users, us, or third parties, or for any other reason at our sole discretion.
        </Text>
        
        <Text style={styles.paragraph}>
          Upon termination, your right to use the App will immediately cease. All provisions of the Terms which by their nature should survive termination shall survive, including without limitation, ownership provisions, warranty disclaimers, indemnity, and limitations of liability.
        </Text>
        
        <Text style={styles.sectionTitle}>10. Governing Law</Text>
        <Text style={styles.paragraph}>
          These Terms shall be governed by and construed in accordance with the laws of the United Kingdom, without regard to its conflict of law principles.
        </Text>
        
        <Text style={styles.sectionTitle}>11. Changes to Terms</Text>
        <Text style={styles.paragraph}>
          We reserve the right to modify these Terms at any time. If we make changes, we will update the "last updated" date at the top of the Terms. Your continued use of our services after such changes constitutes your acceptance of the new Terms.
        </Text>
        
        <Text style={styles.sectionTitle}>12. Contact Us</Text>
        <Text style={styles.paragraph}>
          If you have any questions about these Terms, please contact us at:
        </Text>
        <Text style={styles.paragraph}>
          Email: terms@statusaiapp.com
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
  button: {
    marginTop: theme.spacing.xl,
  },
});

export default TermsOfServiceScreen;