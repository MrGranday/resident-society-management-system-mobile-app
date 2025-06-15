

import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, TextInput, TouchableOpacity, Image, Picker, Alert, ScrollView } from 'react-native';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { router } from 'expo-router';
import { MaterialIcons, FontAwesome } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';

export default function ReportIssueScreen() {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [reporter, setReporter] = useState('');
  const [role, setRole] = useState('');
  const [society, setSociety] = useState('');
  const [image, setImage] = useState(null);
  const [issueType, setIssueType] = useState('General');

  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
    try {
      const userData = await AsyncStorage.getItem('user');
      const token = await AsyncStorage.getItem('token');
      console.log('ReportIssueScreen.js - userData:', userData);
      console.log('ReportIssueScreen.js - token:', token);

      if (userData) {
        const parsedUser = JSON.parse(userData);
        setReporter(parsedUser.name || 'Resident');
        setSociety(parsedUser.society || '');
        console.log('ReportIssueScreen.js - parsedUser:', { _id: parsedUser._id, name: parsedUser.name, society: parsedUser.society });
      } else {
        Alert.alert('Error', 'Session expired. Please log in again.');
        await AsyncStorage.removeItem('token');
        await AsyncStorage.removeItem('user');
        router.replace('/LoginScreen');
      }
    } catch (error) {
      console.error('Failed to load user data:', error);
      Alert.alert('Error', 'Failed to load user data. Please log in again.');
      router.replace('/LoginScreen');
    }
  };

  const pickImage = async () => {
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permissionResult.granted) {
      Alert.alert('Error', 'Permission to access photos is required!');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      base64: true,
      quality: 0.8,
    });

    if (!result.canceled && result.assets && result.assets.length > 0) {
      const uri = result.assets[0].uri;
      const response = await fetch(uri);
      const blob = await response.blob();
      const sizeInMB = blob.size / (1024 * 1024); // Original size in MB
      if (sizeInMB > 5) {
        Alert.alert('Error', 'Image size must not exceed 5MB');
        return;
      }
      const base64Image = `data:${result.assets[0].mimeType};base64,${result.assets[0].base64}`;
      setImage(base64Image);
    }
  };

  const reportIssue = async () => {
    if (!title || !description || !reporter || !role || !society || !issueType) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    try {
      const token = await AsyncStorage.getItem('token');
      const payload = { title, description, reporter, role, society, image, issueType };
      console.log('ReportIssueScreen.js - Sending payload:', payload);

      const response = await axios.post(
        'http://localhost:3000/api/issues',
        payload,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      console.log('ReportIssueScreen.js - Response:', {
        status: response.status,
        data: response.data
      });

      setTitle('');
      setDescription('');
      setRole('');
      setImage(null);
      setIssueType('General');
      Alert.alert('Success', 'Issue reported successfully', [
        {
          text: 'OK',
          onPress: () => router.push('/(tabs)'),
        },
      ]);
    } catch (error) {
      console.error('ReportIssueScreen.js - Failed to report issue:', error);
      if (error.response) {
        console.log('ReportIssueScreen.js - Error response:', {
          status: error.response.status,
          data: error.response.data
        });
      }
      Alert.alert('Error', error.response?.data?.message || 'Failed to report issue. Please check server connection.');
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.push('/(tabs)')}>
          <MaterialIcons name="arrow-back-ios" size={24} color="#007bff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Report New Issue About Society</Text>
      </View>

      <View style={styles.formContainer}>
        <View style={styles.inputContainer}>
          <MaterialIcons name="title" size={24} color="#666" style={styles.icon} />
          <TextInput
            style={styles.input}
            value={title}
            onChangeText={setTitle}
            placeholder="Enter issue title"
          />
        </View>

        <View style={styles.inputContainer}>
          <MaterialIcons name="description" size={24} color="#666" style={styles.icon} />
          <TextInput
            style={styles.input}
            value={description}
            onChangeText={setDescription}
            placeholder="Enter issue description"
            multiline
            numberOfLines={4}
          />
        </View>

        <View style={styles.inputContainer}>
          <FontAwesome name="user" size={24} color="#666" style={styles.icon} />
          <Text style={styles.readOnlyInput}>{reporter || 'Your Name'}</Text>
        </View>

        <View style={styles.inputContainer}>
          <MaterialIcons name="work" size={24} color="#666" style={styles.icon} />
          <Picker
            selectedValue={role}
            onValueChange={(itemValue) => setRole(itemValue)}
            style={styles.picker}
          >
            <Picker.Item label="Select a role" value="" />
            <Picker.Item label="Cleaner" value="Cleaner" />
            <Picker.Item label="Gardener" value="Gardener" />
            <Picker.Item label="Event Manager" value="Event Manager" />
            <Picker.Item label="Security" value="Security" />
            <Picker.Item label="Maintenance" value="Maintenance" />
          </Picker>
        </View>

        <View style={styles.inputContainer}>
          <MaterialIcons name="category" size={24} color="#666" style={styles.icon} />
          <View style={styles.toggleContainer}>
            <TouchableOpacity
              style={[styles.toggleButton, issueType === 'General' ? styles.toggleButtonActive : null]}
              onPress={() => setIssueType('General')}
            >
              <Text style={[styles.toggleButtonText, issueType === 'General' ? styles.toggleButtonTextActive : null]}>
                General
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.toggleButton, issueType === 'Personal' ? styles.toggleButtonActive : null]}
              onPress={() => setIssueType('Personal')}
            >
              <Text style={[styles.toggleButtonText, issueType === 'Personal' ? styles.toggleButtonTextActive : null]}>
                Personal
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.inputContainer}>
          <MaterialIcons name="image" size={24} color="#666" style={styles.icon} />
          <TouchableOpacity style={styles.imagePickerButton} onPress={pickImage}>
            <Text style={styles.imagePickerText}>
              {image ? 'Image Selected' : 'Upload Image (Optional)'}
            </Text>
          </TouchableOpacity>
        </View>

        {image && (
          <Image
            source={{ uri: image }}
            style={styles.previewImage}
            resizeMode="contain"
          />
        )}

        <TouchableOpacity style={styles.reportButton} onPress={reportIssue}>
          <Text style={styles.reportButtonText}>Submit Issue</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.cancelButton}
          onPress={() => {
            setTitle('');
            setDescription('');
            setRole('');
            setImage(null);
            setIssueType('General');
            router.push('/(tabs)');
          }}
        >
          <Text style={styles.cancelButtonText}>Cancel</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: '#f5f5f5',
    paddingBottom: 80,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 10,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginLeft: 12,
  },
  formContainer: {
    padding: 20,
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
    fontSize: 16,
    color: '#333',
    paddingVertical: 10,
  },
  readOnlyInput: {
    flex: 1,
    fontSize: 16,
    color: '#333',
    paddingVertical: 10,
  },
  imagePickerButton: {
    flex: 1,
    paddingVertical: 10,
  },
  imagePickerText: {
    fontSize: 16,
    color: '#333',
  },
  previewImage: {
    width: '100%',
    height: 150,
    borderRadius: 10,
    marginBottom: 15,
  },
  picker: {
    flex: 1,
    height: 50,
    color: '#333',
  },
  toggleContainer: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  toggleButton: {
    flex: 1,
    padding: 10,
    borderRadius: 5,
    backgroundColor: '#eee',
    alignItems: 'center',
    marginHorizontal: 5,
  },
  toggleButtonActive: {
    backgroundColor: '#007bff',
  },
  toggleButtonText: {
    fontSize: 16,
    color: '#333',
  },
  toggleButtonTextActive: {
    color: '#fff',
    fontWeight: 'bold',
  },
  reportButton: {
    backgroundColor: '#4CAF50',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 10,
  },
  reportButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  cancelButton: {
    backgroundColor: '#ccc',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 10,
  },
  cancelButtonText: {
    color: '#333',
    fontWeight: 'bold',
    fontSize: 16,
  },
});