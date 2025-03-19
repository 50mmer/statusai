// src/components/CustomPicker.js (Updated with React.memo and optimizations)
import React, { memo, useState, useCallback } from 'react';
import { 
  View, 
  StyleSheet, 
  Platform, 
  TouchableOpacity, 
  FlatList,
  Modal,
  SafeAreaView, 
  Text,
  Dimensions
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { theme } from '../theme';

// Get screen dimensions
const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

const CustomPicker = ({
  label,
  value,
  onValueChange,
  items = [],
  placeholder = 'Select an option',
  error = false,
  helperText = '',
}) => {
  const [modalVisible, setModalVisible] = useState(false);
  
  // Find the selected item's label - memoize to avoid re-calculation
  const selectedItem = items.find(item => item.value === value);
  const displayText = selectedItem ? selectedItem.label : placeholder;

  // Handle option selection with useCallback
  const handleSelectOption = useCallback((itemValue) => {
    onValueChange(itemValue);
    setModalVisible(false);
  }, [onValueChange]);

  // Toggle modal visibility with useCallback
  const toggleModal = useCallback(() => {
    setModalVisible(prev => !prev);
  }, []);

  // For iOS, use a simple modal approach - much more stable
  if (Platform.OS === 'ios') {
    return (
      <View style={styles.container}>
        {label && <Text style={styles.label}>{label}</Text>}
        
        <TouchableOpacity
          style={[
            styles.pickerContainer,
            error && styles.errorContainer
          ]}
          onPress={toggleModal}
          activeOpacity={0.7}
        >
          <Text style={[
            styles.pickerText,
            !value && styles.placeholderText
          ]}
            numberOfLines={1}
          >
            {displayText}
          </Text>
          <MaterialCommunityIcons 
            name="chevron-down" 
            size={24} 
            color={theme.colors.primary} 
          />
        </TouchableOpacity>
        
        {helperText ? (
          <Text style={[
            styles.helperText,
            error && styles.errorText
          ]}>
            {helperText}
          </Text>
        ) : null}
        
        <Modal
          visible={modalVisible}
          transparent={true}
          animationType="slide"
          onRequestClose={toggleModal}
        >
          <SafeAreaView style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{label || "Select an option"}</Text>
              <TouchableOpacity 
                onPress={toggleModal}
                hitSlop={{top: 20, right: 20, bottom: 20, left: 20}}
              >
                <Text style={styles.doneButton}>Done</Text>
              </TouchableOpacity>
            </View>
            
            <FlatList
              data={items}
              keyExtractor={(item) => String(item.value)}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[
                    styles.optionItem,
                    value === item.value && styles.selectedItem
                  ]}
                  onPress={() => handleSelectOption(item.value)}
                >
                  <Text style={styles.optionText}>{item.label}</Text>
                  {value === item.value && (
                    <MaterialCommunityIcons 
                      name="check" 
                      size={20} 
                      color={theme.colors.primary} 
                    />
                  )}
                </TouchableOpacity>
              )}
              style={styles.optionsList}
              initialNumToRender={20} // Ensure all items render
              maxToRenderPerBatch={20}
              windowSize={20}
            />
          </SafeAreaView>
        </Modal>
      </View>
    );
  }
  
  // For Android, use the native Picker
  if (Platform.OS === 'android') {
    return (
      <View style={styles.container}>
        {label && <Text style={styles.label}>{label}</Text>}
        <View style={[
          styles.pickerContainer,
          error && styles.errorContainer
        ]}>
          <Picker
            selectedValue={value}
            onValueChange={onValueChange}
            style={styles.picker}
            dropdownIconColor={theme.colors.primary}
            mode="dropdown"
          >
            <Picker.Item 
              label={placeholder}
              value=""
              color={theme.colors.placeholder}
              enabled={!value}
            />
            {items.map(({ label, value: itemValue }) => (
              <Picker.Item
                key={String(itemValue)}
                label={label}
                value={itemValue}
                color={theme.colors.text}
              />
            ))}
          </Picker>
        </View>
        {helperText ? (
          <Text style={[
            styles.helperText,
            error && styles.errorText
          ]}>
            {helperText}
          </Text>
        ) : null}
      </View>
    );
  }
  
  // For web, use the standard Picker implementation
  return (
    <View style={styles.container}>
      {label && <Text style={styles.label}>{label}</Text>}
      <View style={[
        styles.pickerContainer,
        error && styles.errorContainer
      ]}>
        <Picker
          selectedValue={value}
          onValueChange={onValueChange}
          style={styles.picker}
          dropdownIconColor={theme.colors.primary}
          mode="dropdown"
        >
          <Picker.Item 
            label={placeholder}
            value=""
            color={theme.colors.placeholder}
            enabled={!value}
          />
          {items.map(({ label, value: itemValue }) => (
            <Picker.Item
              key={String(itemValue)}
              label={label}
              value={itemValue}
              color={theme.colors.text}
            />
          ))}
        </Picker>
      </View>
      {helperText ? (
        <Text style={[
          styles.helperText,
          error && styles.errorText
        ]}>
          {helperText}
        </Text>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
    width: '100%',
  },
  label: {
    fontSize: 15,
    fontWeight: '500',
    marginBottom: 8,
    color: theme.colors.text,
  },
  pickerContainer: {
    backgroundColor: theme.colors.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: theme.colors.border,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    paddingVertical: 14,
    height: 50,
  },
  pickerText: {
    fontSize: 16,
    color: theme.colors.text,
    flex: 1,
  },
  placeholderText: {
    color: theme.colors.placeholder,
  },
  errorContainer: {
    borderColor: theme.colors.error,
  },
  picker: {
    width: '100%',
    height: 50,
    backgroundColor: 'transparent',
    color: theme.colors.text,
  },
  helperText: {
    fontSize: 12,
    marginTop: 4,
    marginLeft: 4,
    color: theme.colors.subtext,
  },
  errorText: {
    color: theme.colors.error,
  },
  
  // Modal styles for iOS
  modalContainer: {
    flex: 1,
    backgroundColor: 'white',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '500',
    color: theme.colors.text,
  },
  doneButton: {
    fontSize: 16,
    color: theme.colors.primary,
    fontWeight: '600',
  },
  optionsList: {
    flex: 1,
  },
  optionItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  selectedItem: {
    backgroundColor: '#f8f8f8',
  },
  optionText: {
    fontSize: 16,
    color: theme.colors.text,
  },
});

// Using memo to prevent unnecessary re-renders
export default memo(CustomPicker);