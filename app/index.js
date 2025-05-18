
import { useRouter, useRootNavigationState } from 'expo-router';
import { useEffect, useState } from 'react';
import { View, ActivityIndicator, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function Index() {
  const router = useRouter();
  const navigationState = useRootNavigationState();
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const token = await AsyncStorage.getItem('token');
        const userData = await AsyncStorage.getItem('user');
        const staffData = await AsyncStorage.getItem('staff');

        console.log('index.js - token:', token);
        console.log('index.js - userData:', userData);
        console.log('index.js - staffData:', staffData);

        if (navigationState?.key && isCheckingAuth) {
          if (token && userData) {
            const user = JSON.parse(userData);
            console.log('index.js - parsed user:', user);
            if (user.role === 'resident') {
              console.log('Redirecting to (tabs)');
              router.replace('/(tabs)');
            } else if (user.role === 'staff') {
              console.log('Redirecting to (staff-tabs)/Issues');
              router.replace('/(staff-tabs)/Issues');
            } else {
              console.log('Invalid role, clearing storage');
              await AsyncStorage.removeItem('token');
              await AsyncStorage.removeItem('user');
              await AsyncStorage.removeItem('staff');
              router.replace('/LoginScreen');
              Alert.alert('Error', 'Invalid user role. Please log in again.');
            }
          } else {
            console.log('No token or userData, redirecting to LoginScreen');
            router.replace('/LoginScreen');
          }
          setIsCheckingAuth(false);
        }
      } catch (error) {
        console.error('Error checking auth:', error);
        await AsyncStorage.removeItem('token');
        await AsyncStorage.removeItem('user');
        await AsyncStorage.removeItem('staff');
        router.replace('/LoginScreen');
        Alert.alert('Error', 'Failed to verify authentication. Please log in again.');
        setIsCheckingAuth(false);
      }
    };

    if (navigationState?.key) {
      checkAuth();
    }
  }, [navigationState, isCheckingAuth]);

  if (!navigationState?.key || isCheckingAuth) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#007bff" />
      </View>
    );
  }

  return <View />;
}