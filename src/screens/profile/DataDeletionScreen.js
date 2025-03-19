import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  Alert,
  Platform,
} from 'react-native';
import { Text, Surface, Portal, Dialog } from 'react-native-paper';
import { StatusBar } from 'expo-status-bar';
import CustomButton from '../../components/CustomButton';
import { theme } from '../../theme';
import { useAuth } from '../../contexts/AuthContext';
import supabase from '../../config/supabase';

const DataDeletionScreen = ({ navigation }) => {
  const [loading, setLoading] = useState(false);
  const [showConfirmationDialog, setShowConfirmationDialog] = useState(false);
  const [showSuccessDialog, setShowSuccessDialog] = useState(false);
  const { user, signOut } = useAuth();

  const handleRequestDeletion = () => {
    setShowConfirmationDialog(true);
  };

  const handleConfirmDeletion = async () => {
    setLoading(true);
    setShowConfirmationDialog(false);

    try {
      // In a real implementation, you would:
      // 1. Flag the user account for deletion in your database
      // 2. Queue up a secure deletion process on your backend
      // 3. Notify relevant administrators or data protection officers
      
      // For this simulation, we'll just mark the account for deletion in Supabase
      if (user) {
        const { error } = await supabase
          .from('profiles')
          .update({ 
            deletion_requested: true,
            deletion_requested_at: new Date().toISOString()
          })
          .eq('id', user.id);
          
        if (error) {
          throw error;
        }
      }

      // Show success dialog
      setShowSuccessDialog(true);
      
    } catch (error) {
      console.error('Error requesting data deletion:', error);
      Alert.alert(
        'Error',
        'There was a problem processing your request. Please try again or contact support.',
        [{ text: 'OK' }]
      );
    } finally {
      setLoading(false);
    }
  };

  const handleCompleteProcess = async () => {
    setShowSuccessDialog(false);
    // Sign the user out after successful deletion request
    await signOut();
    // Navigate to Welcome screen
    navigation.reset({
      index: 0,
      routes: [{ name: 'Welcome' }],
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" />
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        <Text style={styles.headerTitle}>Data Deletion</Text>
        
        <Surface style={styles.infoCard}>
          <Text style={styles.infoTitle}>What happens when you delete your data</Text>
          <Text style={styles.infoText}>
            When you request data deletion, we will:
          </Text>
          <Text style={styles.bulletPoint}>• Remove your personal information from our systems</Text>
          <Text style={styles.bulletPoint}>• Delete your assessment results and history</Text>
          <Text style={styles.bulletPoint}>• Cancel any active subscriptions</Text>
          <Text style={styles.bulletPoint}>• Remove your account completely</Text>
          <Text style={styles.infoText}>
            This process may take up to 30 days to complete across all our systems and backups. 
            You will receive an email confirmation when the process is complete.
          </Text>
        </Surface>
        
        <Surface style={styles.warningCard}>
          <Text style={styles.warningTitle}>Important</Text>
          <Text style={styles.warningText}>
            Data deletion is permanent and cannot be undone. You will lose all your assessment 
            results and account information. Any active subscriptions will be canceled without refund.
          </Text>
        </Surface>
        
        <View style={styles.buttonContainer}>
          <CustomButton
            mode="outlined"
            onPress={() => navigation.goBack()}
            style={styles.backButton}
          >
            Cancel
          </CustomButton>
          
          <CustomButton
            mode="contained"
            onPress={handleRequestDeletion}
            style={styles.deleteButton}
            loading={loading}
            disabled={loading}
          >
            Request Data Deletion
          </CustomButton>
        </View>
      </ScrollView>
      
      {/* Confirmation Dialog */}
      <Portal>
        <Dialog
          visible={showConfirmationDialog}
          onDismiss={() => setShowConfirmationDialog(false)}
          style={styles.dialog}
        >
          <Dialog.Title style={styles.dialogTitle}>Confirm Data Deletion</Dialog.Title>
          <Dialog.Content>
            <Text style={styles.dialogText}>
              Are you absolutely sure you want to delete all your data? This action cannot be undone.
            </Text>
          </Dialog.Content>
          <Dialog.Actions style={styles.dialogActions}>
            <CustomButton
              mode="text"
              onPress={() => setShowConfirmationDialog(false)}
            >
              Cancel
            </CustomButton>
            <CustomButton
              mode="contained"
              onPress={handleConfirmDeletion}
              loading={loading}
              disabled={loading}
              style={styles.confirmButton}
            >
              Yes, Delete My Data
            </CustomButton>
          </Dialog.Actions>
        </Dialog>
      </Portal>
      
      {/* Success Dialog */}
      <Portal>
        <Dialog
          visible={showSuccessDialog}
          onDismiss={handleCompleteProcess}
          style={styles.dialog}
        >
          <Dialog.Title style={styles.dialogTitle}>Request Submitted</Dialog.Title>
          <Dialog.Content>
            <Text style={styles.dialogText}>
              Your data deletion request has been submitted successfully. We have sent a confirmation 
              email with details about the process. Your data will be completely removed within 30 days.
            </Text>
          </Dialog.Content>
          <Dialog.Actions>
            <CustomButton
              mode="contained"
              onPress={handleCompleteProcess}
            >
              OK
            </CustomButton>
          </Dialog.Actions>
        </Dialog>
      </Portal>
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
    marginBottom: theme.spacing.xl,
    textAlign: 'center',
  },
  infoCard: {
    borderRadius: theme.roundness,
    padding: theme.spacing.l,
    marginBottom: theme.spacing.xl,
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
  infoTitle: {
    fontSize: theme.typography.sizes.title3,
    fontWeight: '600',
    color: theme.colors.text,
    marginBottom: theme.spacing.m,
  },
  infoText: {
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
  warningCard: {
    borderRadius: theme.roundness,
    padding: theme.spacing.l,
    marginBottom: theme.spacing.xl,
    backgroundColor: theme.colors.lowScore + '15', // 15% opacity of error color
    borderLeftWidth: 4,
    borderLeftColor: theme.colors.lowScore,
  },
  warningTitle: {
    fontSize: theme.typography.sizes.title3,
    fontWeight: '600',
    color: theme.colors.lowScore,
    marginBottom: theme.spacing.s,
  },
  warningText: {
    fontSize: theme.typography.sizes.body,
    color: theme.colors.text,
    lineHeight: 22,
  },
  buttonContainer: {
    marginTop: theme.spacing.xl,
  },
  backButton: {
    marginBottom: theme.spacing.m,
  },
  deleteButton: {
    backgroundColor: theme.colors.lowScore,
  },
  dialog: {
    borderRadius: theme.roundness,
    backgroundColor: theme.colors.surface,
  },
  dialogTitle: {
    textAlign: 'center',
    fontSize: theme.typography.sizes.title3,
    color: theme.colors.text,
    fontWeight: '600',
  },
  dialogText: {
    textAlign: 'center',
    fontSize: theme.typography.sizes.body,
    color: theme.colors.text,
    lineHeight: 22,
  },
  dialogActions: {
    justifyContent: 'space-between',
    paddingHorizontal: theme.spacing.m,
  },
  confirmButton: {
    backgroundColor: theme.colors.lowScore,
  },
});

export default DataDeletionScreen;