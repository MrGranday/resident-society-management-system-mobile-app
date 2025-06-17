


import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import { MaterialIcons, Ionicons } from '@expo/vector-icons';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [generalError, setGeneralError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const validateEmail = (emailInput) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailInput) {
      setEmailError('Email is required');
    } else if (!emailRegex.test(emailInput)) {
      setEmailError('Please enter a valid email address');
    } else {
      setEmailError('');
    }
    setEmail(emailInput);
  };

  const validatePassword = (passwordInput) => {
    if (!passwordInput) {
      setPasswordError('Password is required');
    } else {
      setPasswordError('');
    }
    setPassword(passwordInput);
  };

  const handleLogin = async () => {
    // Clear all errors
    setEmailError('');
    setPasswordError('');
    setGeneralError('');

    // Validate inputs
    validateEmail(email);
    validatePassword(password);

    if (emailError || passwordError || !email || !password) {
      return;
    }

    setLoading(true);
    try {
      console.log('Sending resident login request:', { email, password });
      const response = await fetch('http://localhost:3000/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();
      console.log('Server response:', data);

      if (!response.ok) {
        // Handle all server errors under the login button
        if (data.message === 'Resident profile not found') {
          setGeneralError('No account found with this email');
        } else if (data.message === "Password doesn't match") {
          setGeneralError('Incorrect password');
        } else if (data.message === 'Waiting for approval') {
          setGeneralError('Your request is waiting for approval.');
        } else {
          setGeneralError(data.message || 'An error occurred. Please check your details.');
        }
        return;
      }

      const { token, user } = data;
      if (!user._id || !user.society || !user.role) {
        throw new Error('Invalid user data: missing _id, society, or role');
      }

      // Store data in AsyncStorage
      await AsyncStorage.multiSet([
        ['token', token],
        ['user', JSON.stringify(user)],
        ['userType', user.role === 'resident' ? 'resident' : 'staff'],
        ['userId', user._id.toString()],
        ['societyId', user.society.toString()],
      ]);

      console.log('LoginScreen - Stored token:', token);
      console.log('LoginScreen - Stored user:', JSON.stringify(user));
      console.log('LoginScreen - Stored userType:', user.role === 'resident' ? 'resident' : 'staff');
      console.log('LoginScreen - Stored userId:', user._id.toString());
      console.log('LoginScreen - Stored societyId:', user.society.toString());

      // Redirect based on role
      router.replace({
        pathname: user.role === 'resident' ? '/(tabs)' : '/(staff-tabs)/Issues',
        params: { userType: user.role === 'resident' ? 'resident' : 'staff' },
      });
    } catch (error) {
      console.error('Resident login error:', error.message);
      setGeneralError('An unexpected error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = () => {
    router.push('/SignupScreen');
  };

  const handleStaffLogin = () => {
    router.push('/StaffLoginScreen');
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.heading}>Welcome Back!</Text>
      <Text style={styles.subheading}>Login to continue</Text>

      <View style={styles.inputContainer}>
        <MaterialIcons name="email" size={24} color="#666" style={styles.icon} />
        <TextInput
          style={styles.input}
          placeholder="Email"
          value={email}
          onChangeText={validateEmail}
          keyboardType="email-address"
          autoCapitalize="none"
        />
      </View>
      {emailError ? <Text style={styles.errorText}>{emailError}</Text> : null}

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
        onPress={handleLogin}
        disabled={loading}
      >
        <Text style={styles.buttonText}>{loading ? 'Logging in...' : 'Login'}</Text>
      </TouchableOpacity>
      {generalError ? <Text style={styles.errorText}>{generalError}</Text> : null}

      <TouchableOpacity onPress={handleRegister}>
        <Text style={styles.registerText}>
          Don't have an account? <Text style={styles.registerLink}>Register</Text>
        </Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={handleStaffLogin}>
        <Text style={styles.staffLoginText}>
          Are you a staff member? <Text style={styles.staffLoginLink}>Staff Login</Text>
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
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
  },
  errorText: {
    color: '#dc3545',
    fontSize: 14,
    marginBottom: 10,
    alignSelf: 'flex-start',
    marginLeft: 10,
  },
  registerText: {
    marginTop: 20,
    fontSize: 14,
    color: '#666',
  },
  registerLink: {
    color: '#007bff',
    fontWeight: 'bold',
    textDecorationLine: 'underline',
  },
  staffLoginText: {
    marginTop: 15,
    fontSize: 14,
    color: '#666',
  },
  staffLoginLink: {
    color: '#007bff',
    fontWeight: 'bold',
    textDecorationLine: 'underline',
  },
});