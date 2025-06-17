


import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert, StyleSheet, ScrollView } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import { MaterialIcons, Ionicons } from '@expo/vector-icons';

export default function StaffLoginScreen() {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [password, setPassword] = useState('');
  const [phoneError, setPhoneError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [generalError, setGeneralError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const validatePhoneNumber = (phoneInput) => {
    const phoneRegex = /^[0-9]{10,15}$/;
    if (!phoneInput) {
      setPhoneError('Phone number is required');
    } else if (!phoneRegex.test(phoneInput)) {
      setPhoneError('Please enter a valid phone number (10-15 digits)');
    } else {
      setPhoneError('');
    }
    setPhoneNumber(phoneInput);
  };

  const validatePassword = (passwordInput) => {
    if (!passwordInput) {
      setPasswordError('Password is required');
    } else {
      setPasswordError('');
    }
    setPassword(passwordInput);
  };

  const handleStaffLogin = async () => {
    setPhoneError('');
    setPasswordError('');
    setGeneralError('');

    validatePhoneNumber(phoneNumber);
    validatePassword(password);

    if (phoneError || passwordError || !phoneNumber || !password) {
      return;
    }

    setLoading(true);
    try {
      console.log('Sending staff login request:', { phoneNumber, password });
      const response = await fetch('http://localhost:3000/api/auth/staff/staff-login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ phoneNumber, password }),
      });

      const data = await response.json();
      console.log('Server response:', data);

      if (!response.ok) {
        throw new Error(data.message || 'Invalid phone number or password');
      }

      const { token, staff } = data;
      if (!staff._id || !staff.society || !staff.role) {
        throw new Error('Invalid staff data: missing _id, society, or role');
      }

      // Fetch userId from the server
      const userResponse = await fetch(`http://localhost:3000/api/chat/staff/${staff._id}/user`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });
      const userData = await userResponse.json();
      if (!userResponse.ok) {
        throw new Error(userData.error || 'Failed to fetch user ID');
      }
      const userId = userData.userId;

      await AsyncStorage.multiSet([
        ['token', token],
        ['staff', JSON.stringify(staff)],
        ['user', JSON.stringify({ role: staff.role || 'staff', ...staff, userId })],
        ['userType', 'staff'],
        ['staffId', staff._id.toString()],
        ['userId', userId.toString()],
        ['societyId', staff.society.toString()],
      ]);

      console.log('StaffLoginScreen - Stored token:', token);
      console.log('StaffLoginScreen - Stored staff:', JSON.stringify(staff));
      console.log('StaffLoginScreen - Stored user:', JSON.stringify({ role: staff.role || 'staff', ...staff, userId }));
      console.log('StaffLoginScreen - Stored userType:', 'staff');
      console.log('StaffLoginScreen - Stored staffId:', staff._id.toString());
      console.log('StaffLoginScreen - Stored userId:', userId.toString());
      console.log('StaffLoginScreen - Stored societyId:', staff.society.toString());

      const storedData = await AsyncStorage.multiGet(['token', 'staff', 'user', 'userType', 'staffId', 'userId', 'societyId']);
      console.log('StaffLoginScreen - AsyncStorage after login:', Object.fromEntries(storedData));

      console.log('Navigating to StaffDashboard');
      router.replace({
        pathname: '/(staff-tabs)/Issues',
        params: { userType: 'staff' },
      });
    } catch (error) {
      console.error('Staff login error:', error.message);
      setGeneralError(error.message || 'Invalid phone number or password');
    } finally {
      setLoading(false);
    }
  };

  const handleBackToLogin = () => {
    router.push('/LoginScreen');
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.heading}>Staff Login</Text>
      <Text style={styles.subheading}>Login with your phone number</Text>

      <View style={styles.inputContainer}>
        <MaterialIcons name="phone" size={24} color="#666" style={styles.icon} />
        <TextInput
          style={styles.input}
          placeholder="Phone Number"
          value={phoneNumber}
          onChangeText={validatePhoneNumber}
          keyboardType="phone-pad"
          maxLength={15}
          autoCapitalize="none"
        />
      </View>
      {phoneError ? <Text style={styles.errorText}>{phoneError}</Text> : null}

      <View style={styles.inputContainer}>
        <Ionicons name="lock-closed" size={24} color="#666" style={styles.icon} />
        <TextInput
          style={styles.input}
          placeholder="Password"
          value={password}
          onChangeText={validatePassword}
          secureTextEntry
        />
      </View>
      {passwordError ? <Text style={styles.errorText}>{passwordError}</Text> : null}

      <TouchableOpacity
        style={[styles.button, loading && styles.buttonDisabled]}
        onPress={handleStaffLogin}
        disabled={loading}
      >
        <Text style={styles.buttonText}>{loading ? 'Logging in...' : 'Login'}</Text>
      </TouchableOpacity>
      {generalError ? <Text style={styles.errorText}>{generalError}</Text> : null}

      <TouchableOpacity onPress={handleBackToLogin}>
        <Text style={styles.backText}>
          Back to <Text style={styles.backLink}>Resident Login</Text>
        </Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#f5f5f5',
  },
  heading: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#333',
  },
  subheading: {
    fontSize: 16,
    color: '#666',
    marginBottom: 30,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    marginBottom: 15,
    backgroundColor: '#fff',
    borderRadius: 10,
    paddingHorizontal: 10,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  icon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    height: 50,
    fontSize: 16,
    color: '#333',
  },
  button: {
    width: '100%',
    height: 50,
    backgroundColor: '#007bff',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 10,
    marginTop: 20,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  buttonDisabled: {
    backgroundColor: '#cccccc',
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
  errorText: {
    color: '#d32f2f',
    fontSize: 14,
    marginBottom: 10,
    textAlign: 'center',
    width: '100%',
  },
  backText: {
    fontSize: 14,
    color: '#666',
    marginTop: 20,
  },
  backLink: {
    color: '#007bff',
    fontWeight: '600',
  },
});