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
import { MaterialIcons, Ionicons, FontAwesome } from '@expo/vector-icons';

export default function ResidentAccountManagementScreen() {
  const [user, setUser] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phoneNumber: '',
    address: '',
  });
  const [passwords, setPasswords] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [loading, setLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [emailValid, setEmailValid] = useState(true);
  const [passwordVisibility, setPasswordVisibility] = useState({
    current: false,
    new: false,
    confirm: false,
  });
  const router = useRouter();

  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
    try {
      const userData = await AsyncStorage.getItem('user');
      if (userData) {
        const parsedUser = JSON.parse(userData);
        setUser(parsedUser);
        setFormData({
          name: parsedUser.name || '',
          email: parsedUser.email || '',
          phoneNumber: parsedUser.phoneNumber || '',
          address: parsedUser.address || '',
        });
        setEmailValid(validateEmail(parsedUser.email || ''));
      }
    } catch (error) {
      console.error('Failed to load user data', error);
    }
  };

  const validateEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  const handleUpdateProfile = async () => {
    if (!formData.name || !formData.email) {
      Alert.alert('Error', 'Name and email are required');
      return;
    }

    if (!validateEmail(formData.email)) {
      Alert.alert('Error', 'Please enter a valid email');
      return;
    }

    setLoading(true);
    try {
      const token = await AsyncStorage.getItem('token');
      const response = await fetch('http://localhost:3000/api/auth/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Profile update failed');

      await AsyncStorage.setItem('user', JSON.stringify({ ...user, ...formData }));
      setUser({ ...user, ...formData });
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
      const response = await fetch('http://localhost:3000/api/auth/change-password', {
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

  const InfoField = ({ icon, label, value }) => (
    <View style={styles.infoField}>
      {icon}
      <View style={styles.infoTextContainer}>
        <Text style={styles.infoLabel}>{label}</Text>
        <Text style={styles.infoValue}>{value || 'Not set'}</Text>
      </View>
    </View>
  );

  if (!user) return (
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
          <TouchableOpacity onPress={() => router.push('/(tabs)')}>
            <MaterialIcons name="arrow-back-ios" size={24} color="#007bff" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Profile Dashboard</Text>
        </View>

        {/* Welcome Card */}
        <View style={styles.welcomeCard}>
          <Text style={styles.welcomeText}>
            Welcome, {user.name || 'Resident'}!
          </Text>
          <Text style={styles.welcomeSubText}>
            Manage your profile and security settings below.
          </Text>
        </View>

        {/* User Info Card */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Your Information</Text>
          <InfoField
            icon={<FontAwesome name="user" size={24} color="#666" />}
            label="Full Name"
            value={user.name}
          />
          <InfoField
            icon={<MaterialIcons name="email" size={24} color="#666" />}
            label="Email"
            value={user.email}
          />
          <InfoField
            icon={<MaterialIcons name="phone" size={24} color="#666" />}
            label="Phone Number"
            value={user.phoneNumber}
          />
          <InfoField
            icon={<MaterialIcons name="location-on" size={24} color="#666" />}
            label="Address"
            value={user.address}
          />
        </View>

        {/* Edit Profile Card */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardTitle}>Edit Profile</Text>
            <TouchableOpacity onPress={() => setIsEditing(!isEditing)}>
              <Text style={styles.editToggle}>{isEditing ? 'Cancel' : 'Edit'}</Text>
            </TouchableOpacity>
          </View>

          <InputField
            icon={<FontAwesome name="user" size={24} color="#666" />}
            placeholder="Full Name"
            value={formData.name}
            onChange={(text) => setFormData({ ...formData, name: text })}
            editable={isEditing}
          />

          <InputField
            icon={<MaterialIcons name="phone" size={24} color="#666" />}
            placeholder="Phone Number"
            value={formData.phoneNumber}
            onChange={(text) => setFormData({ ...formData, phoneNumber: text })}
            editable={isEditing}
            keyboardType="phone-pad"
          />

          <InputField
            icon={<MaterialIcons name="location-on" size={24} color="#666" />}
            placeholder="Address"
            value={formData.address}
            onChange={(text) => setFormData({ ...formData, address: text })}
            editable={isEditing}
            multiline
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

        {/* Security Card */}
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
  welcomeCard: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 20,
    marginBottom: 20,
    elevation: 2,
    alignItems: 'center',
  },
  welcomeText: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#007bff',
    marginBottom: 8,
  },
  welcomeSubText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
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
  infoField: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  infoTextContainer: {
    marginLeft: 15,
    flex: 1,
  },
  infoLabel: {
    fontSize: 14,
    color: '#666',
  },
  infoValue: {
    fontSize: 16,
    color: '#333',
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