

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  StyleSheet,
  FlatList,
  Modal,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ActivityIndicator,
  Image,
} from 'react-native';
import axios from 'axios';
import { useRouter } from 'expo-router';
import { MaterialIcons, FontAwesome, Ionicons } from '@expo/vector-icons';
import debounce from 'lodash.debounce';


export default function SignupScreen() {
  const [name, setName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [address, setAddress] = useState('');
  const [houseNumber, setHouseNumber] = useState('');
  const [societies, setSocieties] = useState([]);
  const [filteredSocieties, setFilteredSocieties] = useState([]);
  const [selectedSocietyId, setSelectedSocietyId] = useState('');
  const [selectedSocietyName, setSelectedSocietyName] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [nameError, setNameError] = useState('');
  const [phoneError, setPhoneError] = useState('');
  const [emailError, setEmailError] = useState('');
  const [emailValid, setEmailValid] = useState(null);
  const [passwordError, setPasswordError] = useState('');
  const [confirmPasswordError, setConfirmPasswordError] = useState('');
  const [societyError, setSocietyError] = useState('');
  const [formError, setFormError] = useState('');
  const [modalVisible, setModalVisible] = useState(false);
  const [emailLoading, setEmailLoading] = useState(false);
  const [gravatarUrl, setGravatarUrl] = useState(null);
  const router = useRouter();

  useEffect(() => {
    fetchSocieties(true);
  }, []);

  const fetchSocieties = async (reset = false) => {
    if (loadingMore || !hasMore) return;
    setLoadingMore(true);
    try {
      const response = await axios.get('http://localhost:3000/api/societies', {
        params: { page, limit: 50 },
      });
      const newSocieties = response.data;
      console.log('Fetched societies:', newSocieties.map(s => ({
        id: s._id,
        name: s.name,
        manager: s.manager,
        managerEmail: s.managerEmail,
        managerName: s.managerName
      })));
      if (newSocieties.length === 0) {
        setHasMore(false);
        return;
      }
      setSocieties((prev) => {
        const existingIds = new Set(prev.map((s) => s._id));
        const uniqueNewSocieties = newSocieties.filter((s) => !existingIds.has(s._id));
        return reset ? uniqueNewSocieties : [...prev, ...uniqueNewSocieties];
      });
      setFilteredSocieties((prev) => {
        const existingIds = new Set(prev.map((s) => s._id));
        const uniqueNewSocieties = newSocieties.filter((s) => !existingIds.has(s._id));
        return reset ? uniqueNewSocieties : [...prev, ...uniqueNewSocieties];
      });
      setPage((prev) => prev + 1);
    } catch (error) {
      console.error('Fetch societies error:', error);
      Alert.alert('Error', 'Failed to fetch societies');
    } finally {
      setLoadingMore(false);
    }
  };

  const handleLoadMore = () => {
    if (!loadingMore && hasMore) {
      fetchSocieties();
    }
  };

  const filterSocieties = debounce((query) => {
    if (query) {
      const filtered = societies.filter((society) =>
        society.name.toLowerCase().includes(query.toLowerCase())
      );
      setFilteredSocieties(filtered);
    } else {
      setFilteredSocieties(societies);
    }
  }, 300);

  const validateName = (nameInput) => {
    const nameRegex = /^[A-Za-z\s]+$/;
    if (!nameInput) {
      setNameError('Name is required');
    } else if (!nameRegex.test(nameInput)) {
      setNameError('Name must contain only letters and spaces');
    } else {
      setNameError('');
    }
    setName(nameInput);
  };

  const validatePhoneNumber = (number) => {
    const numericNumber = number.replace(/\D/g, '');
    if (numericNumber.length === 11) {
      setPhoneError('');
    } else {
      setPhoneError('Phone number must be 11 digits');
    }
    setPhoneNumber(numericNumber);
  };

  const debouncedValidateEmail = debounce(async (emailInput) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    setEmailValid(null);
    setEmailError('');
    setEmailLoading(true);
    setGravatarUrl(null);

    if (!emailInput) {
      setEmailError('Email is required');
      setEmailLoading(false);
      return;
    }
    if (!emailRegex.test(emailInput)) {
      setEmailError('Please enter a valid email address');
      setEmailLoading(false);
      return;
    }

    try {
      const response = await axios.get('https://api.zeruh.com/v1/verify', {
        params: {
          api_key: '5beabb9bcc373adf9976de879f8bf8a9cc83b96885d4652a75e2215e23d9a393',
     
          email_address: emailInput,
        },
      });
      const result = response.data.result;
      console.log('Zeruh API response:', result);

      const isValid =
        result.validation_details.format_valid &&
        result.status === 'deliverable';

      setEmailValid(isValid);
      setGravatarUrl(result.gravatar_url || null);

      if (!isValid) {
        if (!result.validation_details.format_valid) {
          setEmailError('Email format is invalid');
        }
      }
    } catch (error) {
      console.error('Email validation error:', error);
      setEmailValid(true); // Allow signup despite API failure
      setEmailError('Email validation failed, but you may proceed');
    } finally {
      setEmailLoading(false);
    }
  }, 500);

  const validateEmail = (emailInput) => {
    setEmail(emailInput);
    debouncedValidateEmail(emailInput);
  };

  const validatePassword = (passwordInput) => {
    const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{6,}$/;
    if (!passwordInput) {
      setPasswordError('Password is required');
    } else if (!passwordRegex.test(passwordInput)) {
      setPasswordError('Password must be at least 6 characters with letters and numbers');
    } else {
      setPasswordError('');
    }
    setPassword(passwordInput);
    if (confirmPassword && confirmPassword !== passwordInput) {
      setConfirmPasswordError('Passwords do not match');
    } else {
      setConfirmPasswordError('');
    }
  };

  const validateConfirmPassword = (confirm) => {
    if (!confirm) {
      setConfirmPasswordError('Confirm password is required');
    } else if (confirm !== password) {
      setConfirmPasswordError('Passwords do not match');
    } else {
      setConfirmPasswordError('');
    }
    setConfirmPassword(confirm);
  };

  const handleSocietySelect = (society) => {
    console.log('Selected society:', {
      id: society._id,
      name: society.name,
      manager: society.manager,
      managerEmail: society.managerEmail,
      managerName: society.managerName
    });
    if (!society.manager) {
      setSocietyError('This society has no manager assigned');
      return;
    }
    if (!/^[0-9a-fA-F]{24}$/.test(society.manager)) {
      setSocietyError('Invalid manager ID for this society');
      return;
    }
    setSelectedSocietyId(society._id.toString());
    setSelectedSocietyName(society.name);
    setSearchQuery(society.name);
    setFilteredSocieties(societies);
    setSocietyError('');
    setModalVisible(true);
  };

  const requestVerification = async () => {
    const managerId = societies.find((s) => s._id.toString() === selectedSocietyId)?.manager;
    console.log('Manager ID for request:', managerId);
    const payload = {
      name,
      phoneNumber,
      email,
      password,
      address,
      houseNumber,
      societyId: selectedSocietyId,
      managerId,
    };
    console.log('Sending verification request:', payload);
    try {
      setLoading(true);
      const response = await axios.post('http://localhost:3000/api/auth/request-verification', payload);
      console.log('Verification response:', response.data);
      Alert.alert('Verification Sent', response.data.message);
      router.push({
        pathname: '/VerificationSentScreen',
        params: { email },
      });
    } catch (error) {
      console.error('Verification request error:', error.response?.data || error.message);
      const message = error.response?.data?.message || 'Failed to send verification link. Please try again.';
      setFormError(message);
    } finally {
      setLoading(false);
    }
  };

  const proceedWithSignup = () => {
    setModalVisible(false);
    setFormError('');
    if (!name || !phoneNumber || !email || !password || !confirmPassword || !address || !houseNumber || !selectedSocietyId) {
      setFormError('Please fill in all fields');
      return;
    }
    const managerId = societies.find((s) => s._id.toString() === selectedSocietyId)?.manager;
    console.log('Manager ID for signup:', managerId);
    if (!managerId) {
      setSocietyError('Selected society has no manager assigned');
      return;
    }
    if (!/^[0-9a-fA-F]{24}$/.test(managerId)) {
      setSocietyError('Invalid manager ID for this society');
      return;
    }
    if (nameError || phoneError || emailError || passwordError || confirmPasswordError || societyError) {
      setFormError('Please fix the errors in the form');
      return;
    }
    requestVerification();
  };

  const handleSignup = () => {
    setFormError('');
    if (!nameError && name && !phoneError && phoneNumber && !passwordError && password && !confirmPasswordError && confirmPassword) {
      if (!selectedSocietyId) {
        setSocietyError('Please select a society');
        return;
      }
      setModalVisible(true);
    } else {
      setFormError('Please enter valid name, phone number, email, and password');
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }} // Fixed: Added closing brace
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <View style={styles.container}>
        <ScrollView contentContainerStyle={styles.scrollContainer}>
          <Text style={styles.heading}>Join Your Society</Text>
          <Text style={styles.subheading}>Sign up to join</Text>

          <View style={styles.inputContainer}>
            <MaterialIcons name="person" size={24} color="#666" style={styles.icon} />
            <TextInput
              style={styles.input}
              placeholder="Name"
              placeholderTextColor="#A1A1AA"
              value={name}
              onChangeText={validateName}
              autoCapitalize="words"
            />
          </View>
          {nameError ? <Text style={styles.errorText}>{nameError}</Text> : null}

          <View style={styles.inputContainer}>
            <FontAwesome name="phone" size={24} color="#666" style={styles.icon} />
            <TextInput
              style={styles.input}
              placeholder="Phone Number"
              placeholderTextColor="#A1A1AA"
              value={phoneNumber}
              onChangeText={validatePhoneNumber}
              keyboardType="phone-pad"
              maxLength={11}
            />
          </View>
          {phoneError ? <Text style={styles.errorText}>{phoneError}</Text> : null}

          <View style={styles.inputContainer}>
            {emailLoading ? (
              <ActivityIndicator size={24} color="#666" style={styles.icon} />
            ) : gravatarUrl && emailValid === true ? (
              <Image
                source={{ uri: gravatarUrl }}
                style={[styles.icon, styles.gravatar]}
                resizeMode="cover"
              />
            ) : (
              <MaterialIcons name="email" size={24} color="#666" style={styles.icon} />
            )}
            <TextInput
              style={styles.input}
              placeholder="Email"
              placeholderTextColor="#A1A1AA"
              value={email}
              onChangeText={validateEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              editable={true}
              key="email-input"
            />
          </View>
          {emailError ? <Text style={styles.errorText}>{emailError}</Text> : null}
          {emailValid === true ? (
            <Text style={styles.validText}>Email verified</Text>
          ) : emailValid === false ? (
            <Text style={styles.errorText}>Email validation failed</Text>
          ) : null}

          <View style={styles.inputContainer}>
            <Ionicons name="lock-closed" size={24} color="#666" style={styles.icon} />
            <TextInput
              style={styles.input}
              placeholder="Password"
              placeholderTextColor="#A1A1AA"
              value={password}
              onChangeText={validatePassword}
              secureTextEntry
              autoCapitalize="none"
            />
          </View>
          {passwordError ? <Text style={styles.errorText}>{passwordError}</Text> : null}

          <View style={styles.inputContainer}>
            <Ionicons name="lock-closed" size={24} color="#666" style={styles.icon} />
            <TextInput
              style={styles.input}
              placeholder="Confirm Password"
              placeholderTextColor="#A1A1AA"
              value={confirmPassword}
              onChangeText={validateConfirmPassword}
              secureTextEntry
              autoCapitalize="none"
            />
          </View>
          {confirmPasswordError ? <Text style={styles.errorText}>{confirmPasswordError}</Text> : null}

          <View style={styles.inputContainer}>
            <MaterialIcons name="home" size={24} color="#666" style={styles.icon} />
            <TextInput
              style={styles.input}
              placeholder="Address"
              placeholderTextColor="#A1A1AA"
              value={address}
              onChangeText={setAddress}
            />
          </View>

          <View style={styles.inputContainer}>
            <MaterialIcons name="location-city" size={24} color="#666" style={styles.icon} />
            <TextInput
              style={styles.input}
              placeholder="House Number"
              placeholderTextColor="#A1A1AA"
              value={houseNumber}
              onChangeText={setHouseNumber}
            />
          </View>

          <View style={styles.inputContainer}>
            <MaterialIcons name="search" size={24} color="#666" style={styles.icon} />
            <TextInput
              style={styles.input}
              placeholder="Search Society"
              placeholderTextColor="#A1A1AA"
              value={searchQuery}
              onChangeText={(text) => {
                setSearchQuery(text);
                filterSocieties(text);
              }}
              autoCapitalize="none"
            />
          </View>
          {societyError ? <Text style={styles.errorText}>{societyError}</Text> : null}

          {searchQuery ? (
            <FlatList
              data={filteredSocieties}
              keyExtractor={(item) => item._id.toString()}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.societyItem}
                  onPress={() => handleSocietySelect(item)}
                >
                  <Text style={styles.societyText}>{item.name}</Text>
                  <Text style={styles.societySubText}>{item.address}</Text>
                </TouchableOpacity>
              )}
              onEndReached={handleLoadMore}
              onEndReachedThreshold={0.5}
              ListFooterComponent={
                loadingMore ? (
                  <Text style={styles.loadingText}>Loading...</Text>
                ) : !hasMore ? (
                  <Text style={styles.loadingText}>No more societies</Text>
                ) : null
              }
              style={styles.societyList}
            />
          ) : null}

          {formError ? <Text style={styles.errorText}>{formError}</Text> : null}

          <TouchableOpacity
            style={[styles.button, loading && styles.buttonDisabled]}
            onPress={handleSignup}
            disabled={loading}
          >
            <Text style={styles.buttonText}>{loading ? 'Processing...' : 'Signup'}</Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={() => router.push('/LoginScreen')}>
            <Text style={styles.loginText}>
              Already have an account? <Text style={styles.loginLink}>Login</Text>
            </Text>
          </TouchableOpacity>
        </ScrollView>

        <Modal
          animationType="slide"
          transparent={true}
          visible={modalVisible}
          onRequestClose={() => setModalVisible(false)}
        >
          <View style={styles.modalContainer}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>Confirm Society</Text>
              <Text style={styles.modalText}>
                Are you sure you want to select <Text style={styles.boldText}>{selectedSocietyName}</Text>?
              </Text>
              <View style={styles.modalButtonContainer}>
                <TouchableOpacity
                  style={[styles.modalButton, styles.cancelButton]}
                  onPress={() => {
                    setSelectedSocietyId('');
                    setSelectedSocietyName('');
                    setSearchQuery('');
                    setModalVisible(false);
                  }}
                >
                  <Text style={styles.modalButtonText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.modalButton, styles.confirmButton]}
                  onPress={proceedWithSignup}
                >
                  <Text style={styles.modalButtonText}>Confirm</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  heading: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
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
    width: 24,
    height: 24,
    color: '#666',
  },
  gravatar: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  input: {
    flex: 1,
    height: 50,
    fontSize: 16,
    color: '#333',
  },
  societyItem: {
    padding: 10,
    backgroundColor: '#fff',
    borderRadius: 10,
    marginBottom: 8,
    elevation: 2,
  },
  societyText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  societySubText: {
    fontSize: 14,
    color: '#666',
  },
  societyList: {
    maxHeight: 240,
    width: '100%',
    marginBottom: 15,
  },
  loadingText: {
    textAlign: 'center',
    color: '#666',
    fontSize: 14,
    padding: 10,
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
  validText: {
    color: '#28a745',
    fontSize: 14,
    marginBottom: 10,
    alignSelf: 'flex-start',
    marginLeft: 10,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    width: '85%',
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 20,
    elevation: 2,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
  },
  modalText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 20,
  },
  boldText: {
    fontWeight: '600',
    color: '#333',
  },
  modalButtonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
  modalButton: {
    flex: 1,
    padding: 10,
    borderRadius: 10,
    marginHorizontal: 5,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: '#6c757d',
  },
  confirmButton: {
    backgroundColor: '#007bff',
  },
  modalButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
  },
  loginText: {
    marginTop: 20,
    fontSize: 14,
    color: '#666',
  },
  loginLink: {
    color: '#007bff',
    fontWeight: 'bold',
    textDecorationLine: 'underline',
  },
});