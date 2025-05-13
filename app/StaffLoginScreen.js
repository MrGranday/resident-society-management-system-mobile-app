// import React, { useState } from 'react';
// import { View, Text, TextInput, TouchableOpacity, Alert, StyleSheet, ScrollView } from 'react-native';
// import AsyncStorage from '@react-native-async-storage/async-storage';
// import { useRouter } from 'expo-router';
// import { MaterialIcons, Ionicons } from '@expo/vector-icons';

// export default function StaffLoginScreen() {
//   const [phoneNumber, setPhoneNumber] = useState('');
//   const [password, setPassword] = useState('');
//   const [loading, setLoading] = useState(false);
//   const router = useRouter();

//   // const handleStaffLogin = async () => {
//   //   if (!phoneNumber || !password) {
//   //     Alert.alert('Error', 'Please fill in all fields');
//   //     return;
//   //   }

//   //   setLoading(true);
//   //   try {
//   //     const response = await fetch('http://localhost:3000/api/auth/staff/staff-login', {
//   //       method: 'POST',
//   //       headers: {
//   //         'Content-Type': 'application/json',
//   //       },
//   //       body: JSON.stringify({ phoneNumber, password }),
//   //     });

//   //     const data = await response.json();

//   //     if (!response.ok) {
//   //       throw new Error(data.message || 'Invalid phone number or password');
//   //     }

//   //     const { token, staff } = data;
//   //     await AsyncStorage.setItem('token', token);
//   //     await AsyncStorage.setItem('staff', JSON.stringify(staff));
//   //     router.replace('/StaffDashboard');
//   //   } catch (error) {
//   //     Alert.alert('Error', error.message || 'Invalid phone number or password');
//   //   } finally {
//   //     setLoading(false);
//   //   }
//   // };

//   const handleStaffLogin = async () => {
//     if (!phoneNumber || !password) {
//       Alert.alert('Error', 'Please fill in all fields');
//       return;
//     }
  
//     setLoading(true);
//     try {
//       console.log('Sending login request:', { phoneNumber, password }); // Add this
//       const response = await fetch('http://localhost:3000/api/auth/staff/staff-login', {
//         method: 'POST',
//         headers: {
//           'Content-Type': 'application/json',
//         },
//         body: JSON.stringify({ phoneNumber, password }),
//       });
  
//       const data = await response.json();
//       console.log('Server response:', data); // Add this
  
//       if (!response.ok) {
//         throw new Error(data.message || 'Invalid phone number or password');
//       }
  
//       const { token, staff } = data;
//       await AsyncStorage.setItem('token', token);
//       await AsyncStorage.setItem('staff', JSON.stringify(staff));
//       router.replace('/StaffDashboard');
  
//     } catch (error) {
//       console.error('Login error:', error.message); // Add this
//       Alert.alert('Error', error.message || 'Invalid phone number or password');
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleBackToLogin = () => {
//     router.push('/LoginScreen');
//   };

//   return (
//     <ScrollView contentContainerStyle={styles.container}>
//       <Text style={styles.heading}>Staff Login</Text>
//       <Text style={styles.subheading}>Login with your phone number</Text>

//       <View style={styles.inputContainer}>
//         <MaterialIcons name="phone" size={24} color="#666" style={styles.icon} />
//         <TextInput
//           style={styles.input}
//           placeholder="Phone Number"
//           value={phoneNumber}
//           onChangeText={setPhoneNumber}
//           keyboardType="phone-pad"
//           maxLength={11}
//           autoCapitalize="none"
//         />
//       </View>

//       <View style={styles.inputContainer}>
//         <Ionicons name="lock-closed" size={24} color="#666" style={styles.icon} />
//         <TextInput
//           style={styles.input}
//           placeholder="Password"
//           value={password}
//           onChangeText={setPassword}
//           secureTextEntry
//         />
//       </View>

//       <TouchableOpacity
//         style={styles.button}
//         onPress={handleStaffLogin}
//         disabled={loading}
//       >
//         <Text style={styles.buttonText}>{loading ? 'Logging in...' : 'Login'}</Text>
//       </TouchableOpacity>

//       <TouchableOpacity onPress={handleBackToLogin}>
//         <Text style={styles.backText}>
//           Back to <Text style={styles.backLink}>Resident Login</Text>
//         </Text>
//       </TouchableOpacity>
//     </ScrollView>
//   );
// }

// const styles = StyleSheet.create({
//   container: {
//     flexGrow: 1,
//     justifyContent: 'center',
//     alignItems: 'center',
//     padding: 20,
//     backgroundColor: '#f5f5f5',
//   },
//   heading: {
//     fontSize: 28,
//     fontWeight: 'bold',
//     marginBottom: 10,
//     color: '#333',
//   },
//   subheading: {
//     fontSize: 16,
//     color: '#666',
//     marginBottom: 30,
//   },
//   inputContainer: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     width: '100%',
//     marginBottom: 15,
//     backgroundColor: '#fff',
//     borderRadius: 10,
//     paddingHorizontal: 10,
//     elevation: 2,
//   },
//   icon: {
//     marginRight: 10,
//   },
//   input: {
//     flex: 1,
//     height: 50,
//     fontSize: 16,
//     color: '#333',
//   },
//   button: {
//     width: '100%',
//     height: 50,
//     backgroundColor: '#007bff',
//     justifyContent: 'center',
//     alignItems: 'center',
//     borderRadius: 10,
//     marginTop: 20,
//   },
//   buttonText: {
//     fontSize: 18,
//     fontWeight: 'bold',
//     color: '#fff',
//   },
//   backText: {
//     marginTop: 20,
//     fontSize: 14,
//     color: '#666',
//   },
//   backLink: {
//     color: '#007bff',
//     fontWeight: 'bold',
//     textDecorationLine: 'underline',
//   },
// });


import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert, StyleSheet, ScrollView } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import { MaterialIcons, Ionicons } from '@expo/vector-icons';

export default function StaffLoginScreen() {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleStaffLogin = async () => {
    if (!phoneNumber || !password) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    setLoading(true);
    try {
      console.log('Sending login request:', { phoneNumber, password });
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
      await AsyncStorage.setItem('token', token);
      await AsyncStorage.setItem('staff', JSON.stringify(staff));
      await AsyncStorage.setItem('user', JSON.stringify({ role: 'staff', ...staff }));

      console.log('Stored token:', token);
      console.log('Stored staff:', staff);
      console.log('Stored user:', { role: 'staff', ...staff });

      console.log('Navigating to StaffDashboard');
      router.replace('/(staff-tabs)/Issues');

      // Log AsyncStorage contents after setting
      const storedToken = await AsyncStorage.getItem('token');
      const storedStaff = await AsyncStorage.getItem('staff');
      const storedUser = await AsyncStorage.getItem('user');
      console.log('After login - token:', storedToken, 'staff:', storedStaff, 'user:', storedUser);
    } catch (error) {
      console.error('Login error:', error.message);
      Alert.alert('Error', error.message || 'Invalid phone number or password');
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
          onChangeText={setPhoneNumber}
          keyboardType="phone-pad"
          maxLength={11}
          autoCapitalize="none"
        />
      </View>

      <View style={styles.inputContainer}>
        <Ionicons name="lock-closed" size={24} color="#666" style={styles.icon} />
        <TextInput
          style={styles.input}
          placeholder="Password"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
        />
      </View>

      <TouchableOpacity
        style={styles.button}
        onPress={handleStaffLogin}
        disabled={loading}
      >
        <Text style={styles.buttonText}>{loading ? 'Logging in...' : 'Login'}</Text>
      </TouchableOpacity>

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
  buttonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
  },
  backText: {
    marginTop: 20,
    fontSize: 14,
    color: '#666',
  },
  backLink: {
    color: '#007bff',
    fontWeight: 'bold',
    textDecorationLine: 'underline',
  },
});