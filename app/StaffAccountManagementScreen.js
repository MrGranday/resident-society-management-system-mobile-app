import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import { MaterialIcons, Ionicons } from '@expo/vector-icons';

export default function StaffAccountManagementScreen() {
  const [staff, setStaff] = useState(null);
  const [formData, setFormData] = useState({
    fullName: '',
    phoneNumber: '',
  });
  const [passwords, setPasswords] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [loading, setLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [phoneValid, setPhoneValid] = useState(true);
  const [passwordVisibility, setPasswordVisibility] = useState({
    current: false,
    new: false,
    confirm: false,
  });
  const router = useRouter();

  useEffect(() => {
    loadStaffData();
  }, []);

  const loadStaffData = async () => {
    try {
      const staffData = await AsyncStorage.getItem('staff');
      if (staffData) {
        const parsedStaff = JSON.parse(staffData);
        setStaff(parsedStaff);
        setFormData({
          fullName: parsedStaff.fullName || '',
          phoneNumber: parsedStaff.phoneNumber || '',
        });
        setPhoneValid(validatePhoneNumber(parsedStaff.phoneNumber || ''));
      }
    } catch (error) {
      console.error('Failed to load staff data', error);
    }
  };

  const validatePhoneNumber = (number) => /^\d{1,11}$/.test(number);

  const handleUpdateProfile = async () => {
    if (!formData.fullName || !formData.phoneNumber) {
      Alert.alert('Error', 'Name and phone number are required');
      return;
    }

    if (!validatePhoneNumber(formData.phoneNumber)) {
      Alert.alert('Error', 'Please enter a valid phone number (1-11 digits)');
      return;
    }

    setLoading(true);
    try {
      const token = await AsyncStorage.getItem('token');
      const response = await fetch('http://localhost:3000/api/auth/staff/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Profile update failed');

      await AsyncStorage.setItem('staff', JSON.stringify({ ...staff, ...formData }));
      setStaff({ ...staff, ...formData });
      setIsEditing(false);
      Alert.alert('Success', 'Profile updated');
    } catch (error) {
      Alert.alert('Error', error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleChangePassword = async () => {
    const { currentPassword, newPassword, confirmPassword } = passwords;

    if (!currentPassword || !newPassword || !confirmPassword) {
      Alert.alert('Error', 'All password fields are required');
      return;
    }

    if (newPassword !== confirmPassword) {
      Alert.alert('Error', 'Passwords do not match');
      return;
    }

    if (!/^(?=.*\d)(?=.*[!@#$%^&*]).{8,}$/.test(newPassword)) {
      Alert.alert('Error', 'Password must be 8+ chars with a number and special character');
      return;
    }

    setLoading(true);
    try {
      const token = await AsyncStorage.getItem('token');
      const response = await fetch('http://localhost:3000/api/auth/staff/change-password', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ currentPassword, newPassword }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Password change failed');

      setPasswords({ currentPassword: '', newPassword: '', confirmPassword: '' });
      Alert.alert('Success', 'Password updated');
    } catch (error) {
      Alert.alert('Error', error.message);
    } finally {
      setLoading(false);
    }
  };

  const InputField = ({ icon, placeholder, value, onChange, secure, toggleSecure, isSecure, ...props }) => (
    <View style={styles.inputContainer}>
      {icon}
      <TextInput
        style={styles.input}
        placeholder={placeholder}
        value={value}
        onChangeText={onChange}
        secureTextEntry={isSecure}
        placeholderTextColor="#666"
        {...props}
      />
      {secure && (
        <TouchableOpacity onPress={toggleSecure}>
          <Ionicons name={isSecure ? 'eye-off' : 'eye'} size={20} color="#666" />
        </TouchableOpacity>
      )}
    </View>
  );

  if (!staff) return (
    <View style={styles.loadingContainer}>
      <ActivityIndicator size="large" color="#007bff" />
    </View>
  );

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.push('/StaffDashboard')}>
            <MaterialIcons name="arrow-back-ios" size={24} color="#007bff" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Staff Profile Settings</Text>
        </View>

        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardTitle}>Personal Info</Text>
            <TouchableOpacity onPress={() => setIsEditing(!isEditing)}>
              <Text style={styles.editToggle}>{isEditing ? 'Cancel' : 'Edit'}</Text>
            </TouchableOpacity>
          </View>

          <InputField
            icon={<MaterialIcons name="person" size={24} color="#666" />}
            placeholder="Full Name"
            value={formData.fullName}
            onChange={(text) => setFormData({ ...formData, fullName: text })}
            editable={isEditing}
          />

          <InputField
            icon={<MaterialIcons name="phone" size={24} color="#666" />}
            placeholder="Phone Number"
            value={formData.phoneNumber}
            onChange={(text) => {
              setFormData({ ...formData, phoneNumber: text });
              setPhoneValid(validatePhoneNumber(text));
            }}
            editable={isEditing}
            keyboardType="phone-pad"
            style={!phoneValid && styles.inputError}
          />

          {isEditing && (
            <TouchableOpacity
              style={[styles.button, loading && styles.buttonDisabled]}
              onPress={handleUpdateProfile}
              disabled={loading}
            >
              <Text style={styles.buttonText}>{loading ? 'Saving...' : 'Save Changes'}</Text>
            </TouchableOpacity>
          )}
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Security</Text>

          <InputField
            icon={<Ionicons name="lock-closed" size={24} color="#666" />}
            placeholder="Current Password"
            value={passwords.currentPassword}
            onChange={(text) => setPasswords({ ...passwords, currentPassword: text })}
            secure
            toggleSecure={() => setPasswordVisibility({ ...passwordVisibility, current: !passwordVisibility.current })}
            isSecure={!passwordVisibility.current}
          />

          <InputField
            icon={<Ionicons name="lock-open" size={24} color="#666" />}
            placeholder="New Password"
            value={passwords.newPassword}
            onChange={(text) => setPasswords({ ...passwords, newPassword: text })}
            secure
            toggleSecure={() => setPasswordVisibility({ ...passwordVisibility, new: !passwordVisibility.new })}
            isSecure={!passwordVisibility.new}
          />

          <InputField
            icon={<Ionicons name="checkmark-circle" size={24} color="#666" />}
            placeholder="Confirm Password"
            value={passwords.confirmPassword}
            onChange={(text) => setPasswords({ ...passwords, confirmPassword: text })}
            secure
            toggleSecure={() => setPasswordVisibility({ ...passwordVisibility, confirm: !passwordVisibility.confirm })}
            isSecure={!passwordVisibility.confirm}
          />

          <TouchableOpacity
            style={[styles.button, loading && styles.buttonDisabled]}
            onPress={handleChangePassword}
            disabled={loading}
          >
            <Text style={styles.buttonText}>{loading ? 'Updating...' : 'Update Password'}</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
      {loading && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color="#007bff" />
        </View>
      )}
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 32,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginLeft: 12,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 15,
    marginBottom: 20,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  editToggle: {
    fontSize: 16,
    color: '#007bff',
    fontWeight: '500',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 10,
    paddingHorizontal: 10,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#ccc',
  },
  input: {
    flex: 1,
    height: 50,
    fontSize: 16,
    color: '#333',
    paddingVertical: 0,
    marginLeft: 10,
  },
  inputError: {
    borderColor: '#ff4444',
  },
  button: {
    width: '100%',
    height: 50,
    backgroundColor: '#007bff',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 10,
    marginTop: 10,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
  },
});