
// import { useRouter, useRootNavigationState } from 'expo-router';
// import { useEffect, useState } from 'react';
// import { View, ActivityIndicator, Alert } from 'react-native';
// import AsyncStorage from '@react-native-async-storage/async-storage';

// export default function Index() {
//   const router = useRouter();
//   const navigationState = useRootNavigationState();
//   const [isCheckingAuth, setIsCheckingAuth] = useState(true);

//   useEffect(() => {
//     const checkAuth = async () => {
//       try {
//         const token = await AsyncStorage.getItem('token');
//         const userData = await AsyncStorage.getItem('user');
//         const staffData = await AsyncStorage.getItem('staff');

//         console.log('index.js - token:', token);
//         console.log('index.js - userData:', userData);
//         console.log('index.js - staffData:', staffData);

//         if (navigationState?.key && isCheckingAuth) {
//           if (token && userData) {
//             const user = JSON.parse(userData);
//             console.log('index.js - parsed user:', user);
//             if (user.role === 'resident') {
//               console.log('Redirecting to (tabs)');
//               router.replace('/(tabs)');
//             } else if (user.role === 'staff') {
//               console.log('Redirecting to (staff-tabs)/Issues');
//               router.replace('/(staff-tabs)/Issues');
//             } else {
//               console.log('Invalid role, clearing storage');
//               await AsyncStorage.removeItem('token');
//               await AsyncStorage.removeItem('user');
//               await AsyncStorage.removeItem('staff');
//               router.replace('/LoginScreen');
//               Alert.alert('Error', 'Invalid user role. Please log in again.');
//             }
//           } else {
//             console.log('No token or userData, redirecting to LoginScreen');
//             router.replace('/LoginScreen');
//           }
//           setIsCheckingAuth(false);
//         }
//       } catch (error) {
//         console.error('Error checking auth:', error);
//         await AsyncStorage.removeItem('token');
//         await AsyncStorage.removeItem('user');
//         await AsyncStorage.removeItem('staff');
//         router.replace('/LoginScreen');
//         Alert.alert('Error', 'Failed to verify authentication. Please log in again.');
//         setIsCheckingAuth(false);
//       }
//     };

//     if (navigationState?.key) {
//       checkAuth();
//     }
//   }, [navigationState, isCheckingAuth]);

//   if (!navigationState?.key || isCheckingAuth) {
//     return (
//       <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
//         <ActivityIndicator size="large" color="#007bff" />
//       </View>
//     );
//   }

//   return <View />;
// }

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

            // Validate required fields
            if (!user._id || !user.society || !user.role) {
              console.error('index.js - Missing user._id, user.society, or user.role:', user);
              await AsyncStorage.clear();
              router.replace('/LoginScreen');
              Alert.alert('Error', 'Invalid user data. Please log in again.');
              return;
            }

            const userType = user.role === 'resident' ? 'resident' : 'staff';
            await AsyncStorage.setItem('userType', userType);
            await AsyncStorage.setItem('userId', user._id.toString());
            await AsyncStorage.setItem('societyId', user.society.toString());
            await AsyncStorage.setItem('user', JSON.stringify(user)); // Ensure user data is persisted
            console.log('index.js - Stored userType:', userType);
            console.log('index.js - Stored userId:', user._id.toString());
            console.log('index.js - Stored societyId:', user.society.toString());
            console.log('index.js - Stored user:', JSON.stringify(user));

            if (user.role === 'resident') {
              console.log('Redirecting to (tabs) with userType: resident');
              router.replace({
                pathname: '/(tabs)',
                params: { userType: 'resident' },
              });
            } else if (user.role === 'staff') {
              console.log('Redirecting to (staff-tabs)/Issues with userType: staff');
              router.replace({
                pathname: '/(staff-tabs)/Issues',
                params: { userType: 'staff' },
              });
            } else {
              console.log('Invalid role, clearing storage');
              await AsyncStorage.clear();
              router.replace('/LoginScreen');
              Alert.alert('Error', 'Invalid user role. Please log in again.');
            }
          } else {
            console.log('No token or userData, redirecting to LoginScreen');
            await AsyncStorage.clear();
            router.replace('/LoginScreen');
          }
          setIsCheckingAuth(false);
        }
      } catch (error) {
        console.error('Error checking auth:', error);
        await AsyncStorage.clear();
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