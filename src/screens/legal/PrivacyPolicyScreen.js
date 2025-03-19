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

const PrivacyPolicyScreen = ({ navigation }) => {
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" />
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        <Text style={styles.headerTitle}>Privacy Policy</Text>
        <Text style={styles.lastUpdated}>Last updated: March 13, 2025</Text>
        
        <Text style={styles.paragraph}>
          Status AI ("we," "our," or "us") is committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our mobile application.
        </Text>
        
        <Text style={styles.sectionTitle}>1. Information We Collect</Text>
        <Text style={styles.paragraph}>
          We collect information that you provide directly to us when you:
        </Text>
        <Text style={styles.bulletPoint}>• Create an account (email address and password)</Text>
        <Text style={styles.bulletPoint}>• Complete assessments (responses to questionnaire items)</Text>
        <Text style={styles.bulletPoint}>• Make purchases (payment information is processed by Apple, not stored by us)</Text>
        <Text style={styles.bulletPoint}>• Contact our support team</Text>

        <Text style={styles.paragraph}>
          Additionally, we automatically collect certain information when you use the app:
        </Text>
        <Text style={styles.bulletPoint}>• Device information (model, operating system)</Text>
        <Text style={styles.bulletPoint}>• App usage data (features used, time spent)</Text>
        <Text style={styles.bulletPoint}>• Error logs to improve app performance</Text>

        <Text style={styles.sectionTitle}>2. How We Use Your Information</Text>
        <Text style={styles.paragraph}>
          We use the information we collect to:
        </Text>
        <Text style={styles.bulletPoint}>• Provide, maintain, and improve our services</Text>
        <Text style={styles.bulletPoint}>• Process your transactions and manage your account</Text>
        <Text style={styles.bulletPoint}>• Generate assessment results and predictions</Text>
        <Text style={styles.bulletPoint}>• Send you technical notices, updates, and support messages</Text>
        <Text style={styles.bulletPoint}>• Respond to your comments and questions</Text>
        <Text style={styles.bulletPoint}>• Analyze usage patterns to improve our service</Text>

        <Text style={styles.sectionTitle}>3. Data Security</Text>
        <Text style={styles.paragraph}>
          We implement appropriate security measures to protect your personal information from unauthorized access, alteration, disclosure, or destruction. These measures include encryption of sensitive data, secure authentication procedures, and regular security assessments.
        </Text>

        <Text style={styles.paragraph}>
          However, no method of transmission over the Internet or electronic storage is 100% secure, so we cannot guarantee absolute security. You are responsible for maintaining the confidentiality of your account credentials.
        </Text>

        <Text style={styles.sectionTitle}>4. Data Retention</Text>
        <Text style={styles.paragraph}>
          We retain your personal information for as long as your account is active or as needed to provide you services. You can request deletion of your data at any time through your account settings or by contacting our support team. We may retain certain information as required by law or for legitimate business purposes.
        </Text>

        <Text style={styles.sectionTitle}>5. Your Rights</Text>
        <Text style={styles.paragraph}>
          Depending on your location, you may have certain rights regarding your personal information:
        </Text>
        <Text style={styles.bulletPoint}>• Access and receive a copy of your data</Text>
        <Text style={styles.bulletPoint}>• Correct inaccurate data</Text>
        <Text style={styles.bulletPoint}>• Delete your data</Text>
        <Text style={styles.bulletPoint}>• Object to or restrict processing of your data</Text>
        <Text style={styles.bulletPoint}>• Data portability</Text>

        <Text style={styles.paragraph}>
          To exercise these rights, please contact us using the information provided in the "Contact Us" section.
        </Text>

        <Text style={styles.sectionTitle}>6. Children's Privacy</Text>
        <Text style={styles.paragraph}>
          Our services are not intended for individuals under the age of 18. We do not knowingly collect personal information from children. If you believe we have collected information from a child, please contact us immediately.
        </Text>

        <Text style={styles.sectionTitle}>7. Third-Party Services</Text>
        <Text style={styles.paragraph}>
          Our app may contain links to third-party websites and services. We are not responsible for the content or privacy practices of these third parties. We encourage you to read the privacy policies of any third-party services you access.
        </Text>

        <Text style={styles.paragraph}>
          We use the following third-party services:
        </Text>
        <Text style={styles.bulletPoint}>• Supabase for user authentication and data storage</Text>
        <Text style={styles.bulletPoint}>• Apple App Store for payment processing</Text>

        <Text style={styles.sectionTitle}>8. Changes to This Policy</Text>
        <Text style={styles.paragraph}>
          We may update this Privacy Policy from time to time. We will notify you of any changes by posting the new policy on this page and updating the "last updated" date. You are advised to review this Privacy Policy periodically for any changes.
        </Text>

        <Text style={styles.sectionTitle}>9. Contact Us</Text>
        <Text style={styles.paragraph}>
          If you have questions or concerns about this Privacy Policy or our data practices, please contact us at:
        </Text>
        <Text style={styles.paragraph}>
          Email: privacy@statusaiapp.com
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

export default PrivacyPolicyScreen;