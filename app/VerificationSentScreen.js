import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';

export default function VerificationSentScreen() {
  const router = useRouter();
  const { email } = useLocalSearchParams();

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <MaterialIcons name="email" size={80} color="#666" style={styles.icon} />
        <Text style={styles.title}>Verification Link Sent</Text>
        <Text style={styles.message}>
          An email verification link has been sent to{' '}
          <Text style={styles.email}>{email}</Text>. Please check your inbox (and
          spam/junk folder) and click the link to complete your registration.
        </Text>
        <TouchableOpacity
          style={styles.button}
          onPress={() => router.push('/SignupScreen')}
        >
          <Text style={styles.buttonText}>Back to Signup</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5', // Match LoginScreen background
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    padding: 20, // Match LoginScreen padding
    alignItems: 'center',
    width: '100%',
    maxWidth: 400, // Constrain width for better alignment
  },
  icon: {
    marginBottom: 24,
    color: '#666', // Match LoginScreen icon color
  },
  title: {
    fontSize: 28, // Match LoginScreen heading
    fontWeight: 'bold',
    color: '#333', // Match LoginScreen heading
    marginBottom: 16,
    textAlign: 'center',
  },
  message: {
    fontSize: 16, // Match LoginScreen subheading
    color: '#666', // Match LoginScreen subtext
    textAlign: 'center',
    marginBottom: 32,
  },
  email: {
    fontWeight: 'bold',
    color: '#007bff', // Match LoginScreen link color
  },
  button: {
    width: '100%',
    height: 50, // Match LoginScreen button
    backgroundColor: '#007bff', // Match LoginScreen button
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 10, // Match LoginScreen button
    elevation: 2, // Match LoginScreen input elevation
  },
  buttonText: {
    fontSize: 18, // Match LoginScreen button text
    fontWeight: 'bold',
    color: '#fff', // Match LoginScreen button text
  },
});