

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

//   const handleStaffLogin = async () => {
//     if (!phoneNumber || !password) {
//       Alert.alert('Error', 'Please fill in all fields');
//       return;
//     }

//     setLoading(true);
//     try {
//       console.log('Sending login request:', { phoneNumber, password });
//       const response = await fetch('http://localhost:3000/api/auth/staff/staff-login', {
//         method: 'POST',
//         headers: {
//           'Content-Type': 'application/json',
//         },
//         body: JSON.stringify({ phoneNumber, password }),
//       });

//       const data = await response.json();
//       console.log('Server response:', data);

//       if (!response.ok) {
//         throw new Error(data.message || 'Invalid phone number or password');
//       }

//       const { token, staff } = data;
//       await AsyncStorage.setItem('token', token);
//       await AsyncStorage.setItem('staff', JSON.stringify(staff));
//       await AsyncStorage.setItem('user', JSON.stringify({ role: 'staff', ...staff }));

//       console.log('Stored token:', token);
//       console.log('Stored staff:', staff);
//       console.log('Stored user:', { role: 'staff', ...staff });

//       console.log('Navigating to StaffDashboard');
//       router.replace('/(staff-tabs)/Issues');

//       // Log AsyncStorage contents after setting
//       const storedToken = await AsyncStorage.getItem('token');
//       const storedStaff = await AsyncStorage.getItem('staff');
//       const storedUser = await AsyncStorage.getItem('user');
//       console.log('After login - token:', storedToken, 'staff:', storedStaff, 'user:', storedUser);
//     } catch (error) {
//       console.error('Login error:', error.message);
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


// import React, { useState } from 'react';
// import { View, Text, TextInput, TouchableOpacity, Alert, StyleSheet, ScrollView } from 'react-native';
// import AsyncStorage from '@react-native-async-storage/async-storage';
// import { useRouter } from 'expo-router';
// import { MaterialIcons, Ionicons } from '@expo/vector-icons';

// export default function StaffLoginScreen() {
//   const [phoneNumber, setPhoneNumber] = useState('');
//   const [password, setPassword] = useState('');
//   const [phoneError, setPhoneError] = useState('');
//   const [passwordError, setPasswordError] = useState('');
//   const [generalError, setGeneralError] = useState('');
//   const [loading, setLoading] = useState(false);
//   const router = useRouter();

//   const validatePhoneNumber = (phoneInput) => {
//     const phoneRegex = /^[0-9]{10,15}$/;
//     if (!phoneInput) {
//       setPhoneError('Phone number is required');
//     } else if (!phoneRegex.test(phoneInput)) {
//       setPhoneError('Please enter a valid phone number (10-15 digits)');
//     } else {
//       setPhoneError('');
//     }
//     setPhoneNumber(phoneInput);
//   };

//   const validatePassword = (passwordInput) => {
//     if (!passwordInput) {
//       setPasswordError('Password is required');
//     } else {
//       setPasswordError('');
//     }
//     setPassword(passwordInput);
//   };

//   const handleStaffLogin = async () => {
//     // Clear all errors
//     setPhoneError('');
//     setPasswordError('');
//     setGeneralError('');

//     // Validate inputs
//     validatePhoneNumber(phoneNumber);
//     validatePassword(password);

//     if (phoneError || passwordError || !phoneNumber || !password) {
//       return;
//     }

//     setLoading(true);
//     try {
//       console.log('Sending staff login request:', { phoneNumber, password });
//       const response = await fetch('http://localhost:3000/api/auth/staff/staff-login', {
//         method: 'POST',
//         headers: {
//           'Content-Type': 'application/json',
//         },
//         body: JSON.stringify({ phoneNumber, password }),
//       });

//       const data = await response.json();
//       console.log('Server response:', data);

//       if (!response.ok) {
//         throw new Error(data.message || 'Invalid phone number or password');
//       }

//       const { token, staff } = data;
//       if (!staff._id || !staff.society || !staff.role) {
//         throw new Error('Invalid staff data: missing _id, society, or role');
//       }

//       // Store data in AsyncStorage
//       await AsyncStorage.multiSet([
//         ['token', token],
//         ['staff', JSON.stringify(staff)],
//         ['user', JSON.stringify({ role: 'staff', ...staff })],
//         ['userType', 'staff'],
//         ['userId', staff._id.toString()],
//         ['societyId', staff.society.toString()],
//       ]);

//       console.log('StaffLoginScreen - Stored token:', token);
//       console.log('StaffLoginScreen - Stored staff:', JSON.stringify(staff));
//       console.log('StaffLoginScreen - Stored user:', JSON.stringify({ role: 'staff', ...staff }));
//       console.log('StaffLoginScreen - Stored userType:', 'staff');
//       console.log('StaffLoginScreen - Stored userId:', staff._id.toString());
//       console.log('StaffLoginScreen - Stored societyId:', staff.society.toString());

//       // Log AsyncStorage contents after setting
//       const storedData = await AsyncStorage.multiGet(['token', 'staff', 'user', 'userType', 'userId', 'societyId']);
//       console.log('StaffLoginScreen - AsyncStorage after login:', Object.fromEntries(storedData));

//       console.log('Navigating to StaffDashboard');
//       router.replace({
//         pathname: '/(staff-tabs)/Issues',
//         params: { userType: 'staff' },
//       });
//     } catch (error) {
//       console.error('Staff login error:', error.message);
//       setGeneralError(error.message || 'Invalid phone number or password');
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
//           onChangeText={validatePhoneNumber}
//           keyboardType="phone-pad"
//           maxLength={15}
//           autoCapitalize="none"
//         />
//       </View>
//       {phoneError ? <Text style={styles.errorText}>{phoneError}</Text> : null}

//       <View style={styles.inputContainer}>
//         <Ionicons name="lock-closed" size={24} color="#666" style={styles.icon} />
//         <TextInput
//           style={styles.input}
//           placeholder="Password"
//           value={password}
//           onChangeText={validatePassword}
//           secureTextEntry
//         />
//       </View>
//       {passwordError ? <Text style={styles.errorText}>{passwordError}</Text> : null}

//       <TouchableOpacity
//         style={[styles.button, loading && styles.buttonDisabled]}
//         onPress={handleStaffLogin}
//         disabled={loading}
//       >
//         <Text style={styles.buttonText}>{loading ? 'Logging in...' : 'Login'}</Text>
//       </TouchableOpacity>
//       {generalError ? <Text style={styles.errorText}>{generalError}</Text> : null}

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
//   buttonDisabled: {
//     opacity: 0.6,
//   },
//   buttonText: {
//     fontSize: 18,
//     fontWeight: 'bold',
//     color: '#fff',
//   },
//   errorText: {
//     color: '#dc3545',
//     fontSize: 14,
//     marginBottom: 10,
//     alignSelf: 'flex-start',
//     marginLeft: 10,
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










// import React, { useState } from 'react';
// import { View, Text, TextInput, TouchableOpacity, Alert, StyleSheet, ScrollView } from 'react-native';
// import AsyncStorage from '@react-native-async-storage/async-storage';
// import { useRouter } from 'expo-router';
// import { MaterialIcons, Ionicons } from '@expo/vector-icons';

// export default function StaffLoginScreen() {
//   const [phoneNumber, setPhoneNumber] = useState('');
//   const [password, setPassword] = useState('');
//   const [phoneError, setPhoneError] = useState('');
//   const [passwordError, setPasswordError] = useState('');
//   const [generalError, setGeneralError] = useState('');
//   const [loading, setLoading] = useState(false);
//   const router = useRouter();

//   const validatePhoneNumber = (phoneInput) => {
//     const phoneRegex = /^[0-9]{10,15}$/;
//     if (!phoneInput) {
//       setPhoneError('Phone number is required');
//     } else if (!phoneRegex.test(phoneInput)) {
//       setPhoneError('Please enter a valid phone number (10-15 digits)');
//     } else {
//       setPhoneError('');
//     }
//     setPhoneNumber(phoneInput);
//   };

//   const validatePassword = (passwordInput) => {
//     if (!passwordInput) {
//       setPasswordError('Password is required');
//     } else {
//       setPasswordError('');
//     }
//     setPassword(passwordInput);
//   };

//   const handleStaffLogin = async () => {
//     // Clear all errors
//     setPhoneError('');
//     setPasswordError('');
//     setGeneralError('');

//     // Validate inputs
//     validatePhoneNumber(phoneNumber);
//     validatePassword(password);

//     if (phoneError || passwordError || !phoneNumber || !password) {
//       return;
//     }

//     setLoading(true);
//     try {
//       console.log('Sending staff login request:', { phoneNumber, password });
//       const response = await fetch('http://localhost:3000/api/auth/staff/staff-login', {
//         method: 'POST',
//         headers: {
//           'Content-Type': 'application/json',
//         },
//         body: JSON.stringify({ phoneNumber, password }),
//       });

//       const data = await response.json();
//       console.log('Server response:', data);

//       if (!response.ok) {
//         throw new Error(data.message || 'Invalid phone number or password');
//       }

//       const { token, staff } = data;
//       if (!staff._id || !staff.society || !staff.role) {
//         throw new Error('Invalid staff data: missing _id, society, or role');
//       }

//       // Store data in AsyncStorage
//       await AsyncStorage.multiSet([
//         ['token', token],
//         ['staff', JSON.stringify(staff)],
//         ['user', JSON.stringify({ role: staff.role || 'staff', ...staff })],
//         ['userType', 'staff'],
//         ['staffId', staff._id.toString()],
//         ['userId', staff._id.toString()], // Temporarily use staff._id as userId
//         ['societyId', staff.society.toString()],
//       ]);

//       console.log('StaffLoginScreen - Stored token:', token);
//       console.log('StaffLoginScreen - Stored staff:', JSON.stringify(staff));
//       console.log('StaffLoginScreen - Stored user:', JSON.stringify({ role: staff.role || 'staff', ...staff }));
//       console.log('StaffLoginScreen - Stored userType:', 'staff');
//       console.log('StaffLoginScreen - Stored staffId:', staff._id.toString());
//       console.log('StaffLoginScreen - Stored userId:', staff._id.toString());
//       console.log('StaffLoginScreen - Stored societyId:', staff.society.toString());

//       // Log AsyncStorage contents after setting
//       const storedData = await AsyncStorage.multiGet(['token', 'staff', 'user', 'userType', 'staffId', 'userId', 'societyId']);
//       console.log('StaffLoginScreen - AsyncStorage after login:', Object.fromEntries(storedData));

//       console.log('Navigating to StaffDashboard');
//       router.replace({
//         pathname: '/(staff-tabs)/Issues',
//         params: { userType: 'staff' },
//       });
//     } catch (error) {
//       console.error('Staff login error:', error.message);
//       setGeneralError(error.message || 'Invalid phone number or password');
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
//           onChangeText={validatePhoneNumber}
//           keyboardType="phone-pad"
//           maxLength={15}
//           autoCapitalize="none"
//         />
//       </View>
//       {phoneError ? <Text style={styles.errorText}>{phoneError}</Text> : null}

//       <View style={styles.inputContainer}>
//         <Ionicons name="lock-closed" size={24} color="#666" style={styles.icon} />
//         <TextInput
//           style={styles.input}
//           placeholder="Password"
//           value={password}
//           onChangeText={validatePassword}
//           secureTextEntry
//         />
//       </View>
//       {passwordError ? <Text style={styles.errorText}>{passwordError}</Text> : null}

//       <TouchableOpacity
//         style={[styles.button, loading && styles.buttonDisabled]}
//         onPress={handleStaffLogin}
//         disabled={loading}
//       >
//         <Text style={styles.buttonText}>{loading ? 'Logging in...' : 'Login'}</Text>
//       </TouchableOpacity>
//       {generalError ? <Text style={styles.errorText}>{generalError}</Text> : null}

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
//   buttonDisabled: {
//     opacity: 0.6,
//   },
//   buttonText: {
//     fontSize: 18,
//     fontWeight: 'bold',
//     color: '#fff',
//   },
//   errorText: {
//     color: '#dc3545',
//     fontSize: 14,
//     marginBottom: 10,
//     alignSelf: 'flex-start',
//     marginLeft: 10,
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