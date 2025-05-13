import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  Image,
  Alert,
  ScrollView,
  Modal,
  Picker,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';

export default function EventsScreen() {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [image, setImage] = useState(null);
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  tomorrow.setHours(12, 0, 0, 0);
  const [dateTime, setDateTime] = useState(tomorrow);
  const [datePickerModalVisible, setDatePickerModalVisible] = useState(false);
  const [tempYear, setTempYear] = useState(tomorrow.getFullYear());
  const [tempMonth, setTempMonth] = useState(tomorrow.getMonth());
  const [tempDay, setTempDay] = useState(tomorrow.getDate());
  const [tempHour, setTempHour] = useState(12);
  const [tempMinute, setTempMinute] = useState(0);
  const [tempAmPm, setTempAmPm] = useState('PM');
  const [postedTime, setPostedTime] = useState(new Date().toLocaleString());
  const [location, setLocation] = useState('');
  const [category, setCategory] = useState('Other');
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [formError, setFormError] = useState('');
  const [categoryModalVisible, setCategoryModalVisible] = useState(false);
  const [userId, setUserId] = useState(null);
  const router = useRouter();

  useEffect(() => {
    loadUserData();
    fetchEvents();
  }, []);

  const loadUserData = async () => {
    try {
      const userData = await AsyncStorage.getItem('user');
      if (userData) {
        const parsedUser = JSON.parse(userData);
        console.log('Loaded user:', { _id: parsedUser._id });
        setUserId(parsedUser._id);
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

  const fetchEvents = async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      const response = await fetch('http://localhost:3000/api/events', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Failed to fetch events');
      console.log('Fetched events:', data.map(e => ({ _id: e._id, title: e.title, status: e.status, organizer: e.organizer?._id, dateTime: e.dateTime, image: e.image ? 'base64' : null })));
      setEvents(data);
    } catch (error) {
      console.error('Fetch events error:', error.message);
      if (error.message.includes('Invalid token')) {
        await AsyncStorage.removeItem('token');
        await AsyncStorage.removeItem('user');
        router.replace('/LoginScreen');
      } else {
        Alert.alert('Error', 'Failed to fetch events');
      }
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
      const asset = result.assets[0];
      console.log('Selected image:', { uri: asset.uri, mimeType: asset.mimeType });
      const response = await fetch(asset.uri);
      const blob = await response.blob();
      const sizeInMB = blob.size / (1024 * 1024);
      if (sizeInMB > 5) {
        Alert.alert('Error', 'Image size must not exceed 5MB');
        return;
      }
      const base64Image = `data:${asset.mimeType};base64,${asset.base64}`;
      setImage(base64Image);
    }
  };

  const handlePostEvent = async () => {
    setFormError('');
    if (!title || !description || !dateTime || !location || !category) {
      setFormError('Please fill in all required fields');
      return;
    }
    const now = new Date();
    console.log('Current time:', now, 'Selected dateTime:', dateTime);
    if (dateTime <= now) {
      setFormError('Event date and time must be in the future');
      return;
    }

    try {
      setLoading(true);
      const token = await AsyncStorage.getItem('token');
      const response = await fetch('http://localhost:3000/api/events', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title,
          description,
          dateTime: dateTime.toISOString(),
          location,
          category,
          image,
        }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Failed to post event');

      console.log('Event posted:', data.event);
      Alert.alert('Success', 'Event posted successfully');
      setTitle('');
      setDescription('');
      setImage(null);
      setDateTime(tomorrow);
      setPostedTime(new Date().toLocaleString());
      setLocation('');
      setCategory('Other');
      fetchEvents();
    } catch (error) {
      console.error('Post event error:', error.message);
      setFormError(error.message || 'Failed to post event');
    } finally {
      setLoading(false);
    }
  };

  const handleFinishEvent = async (eventId) => {
    try {
      const token = await AsyncStorage.getItem('token');
      const response = await fetch(`http://localhost:3000/api/events/${eventId}/finish`, {
        method: 'PATCH',
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Failed to finish event');
      console.log('Event finished:', data.event);
      Alert.alert('Success', 'Event marked as finished');
      await fetchEvents();
    } catch (error) {
      console.error('Finish event error:', error.message);
      Alert.alert('Error', error.message || 'Failed to finish event');
    }
  };

  const formatDateTime = (date) => {
    return new Date(date).toLocaleString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
  };

  const years = Array.from({ length: 10 }, (_, i) => tomorrow.getFullYear() + i);
  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];
  const getDaysInMonth = (year, month) => new Date(year, month + 1, 0).getDate();
  const days = Array.from({ length: getDaysInMonth(tempYear, tempMonth) }, (_, i) => i + 1);
  const hours = Array.from({ length: 12 }, (_, i) => i + 1);
  const minutes = ['00', '15', '30', '45'];
  const amPmOptions = ['AM', 'PM'];

  useEffect(() => {
    const maxDays = getDaysInMonth(tempYear, tempMonth);
    if (tempDay > maxDays) {
      setTempDay(maxDays);
    }
  }, [tempYear, tempMonth]);

  const handleDateConfirm = () => {
    try {
      const hour = tempAmPm === 'PM' && tempHour !== 12 ? tempHour + 12 : tempAmPm === 'AM' && tempHour === 12 ? 0 : tempHour;
      const selectedDate = new Date(Date.UTC(tempYear, tempMonth, tempDay, hour, tempMinute));
      console.log('Selected date:', selectedDate);
      const now = new Date();
      console.log('Validation:', { selectedDate, now, isFuture: selectedDate > now });
      if (selectedDate <= now) {
        Alert.alert('Error', 'Please select a future date and time');
        return;
      }
      setDateTime(selectedDate);
      setDatePickerModalVisible(false);
      console.log('Date confirmed:', selectedDate);
    } catch (error) {
      console.error('Date confirm error:', error);
      Alert.alert('Error', 'Failed to confirm date');
    }
  };

  const categories = ['Social', 'Meeting', 'Sports', 'Workshop', 'Other'];

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <Text style={styles.heading}>Post an Event</Text>
        <Text style={styles.subheading}>Share community events</Text>

        <View style={styles.inputContainer}>
          <MaterialIcons name="title" size={24} color="#666" style={styles.icon} />
          <TextInput
            style={styles.input}
            placeholder="Event Title"
            placeholderTextColor="#A1A1AA"
            value={title}
            onChangeText={setTitle}
          />
        </View>

        <View style={styles.inputContainer}>
          <MaterialIcons name="description" size={24} color="#666" style={styles.icon} />
          <TextInput
            style={[styles.input, styles.multilineInput]}
            placeholder="Description"
            placeholderTextColor="#A1A1AA"
            value={description}
            onChangeText={setDescription}
            multiline
            numberOfLines={4}
          />
        </View>

        <View style={styles.inputContainer}>
          <MaterialIcons name="event" size={24} color="#666" style={styles.icon} />
          <TouchableOpacity
            style={styles.input}
            onPress={() => {
              console.log('Opening date picker modal');
              setDatePickerModalVisible(true);
            }}
          >
            <Text style={styles.dateText}>
              Event will be held: {formatDateTime(dateTime)}
            </Text>
          </TouchableOpacity>
          <MaterialIcons
            name="calendar-today"
            size={20}
            color="#007bff"
            style={styles.calendarIcon}
          />
        </View>

        <View style={styles.inputContainer}>
          <MaterialIcons name="access-time" size={24} color="#666" style={styles.icon} />
          <Text style={styles.input}>Posted on: {postedTime}</Text>
        </View>

        <View style={styles.inputContainer}>
          <MaterialIcons name="location-on" size={24} color="#666" style={styles.icon} />
          <TextInput
            style={styles.input}
            placeholder="Location"
            placeholderTextColor="#A1A1AA"
            value={location}
            onChangeText={setLocation}
          />
        </View>

        <View style={styles.inputContainer}>
          <MaterialIcons name="category" size={24} color="#666" style={styles.icon} />
          <TouchableOpacity
            style={styles.input}
            onPress={() => setCategoryModalVisible(true)}
          >
            <Text style={styles.dateText}>{category}</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.inputContainer}>
          <MaterialIcons name="person" size={24} color="#666" style={styles.icon} />
          <Text style={styles.input}>Event Manager</Text>
        </View>

        <TouchableOpacity
          style={styles.imagePickerButton}
          onPress={pickImage}
        >
          <Text style={styles.imagePickerText}>
            {image ? 'Change Image (Optional)' : 'Upload Image (Optional)'}
          </Text>
        </TouchableOpacity>
        {image && (
          <Image
            source={{ uri: image }}
            style={styles.previewImage}
            resizeMode="contain"
            onError={(e) => console.log('Preview image error:', e.nativeEvent.error)}
          />
        )}

        {formError ? <Text style={styles.errorText}>{formError}</Text> : null}

        <TouchableOpacity
          style={[styles.submitButton, loading && styles.buttonDisabled]}
          onPress={handlePostEvent}
          disabled={loading}
        >
          <Text style={styles.submitButtonText}>
            {loading ? 'Posting...' : 'Post Event'}
          </Text>
        </TouchableOpacity>

        <Text style={styles.eventsTitle}>Upcoming Events</Text>
        <FlatList
          data={events}
          keyExtractor={(item) => item._id.toString()}
          renderItem={({ item }) => (
            <View style={styles.eventItem}>
              <Text style={styles.eventTitle}>{item.title}</Text>
              <Text style={styles.eventDescription}>{item.description}</Text>
              {item.image && (
                <Image
                  source={{ uri: item.image }}
                  style={styles.eventImage}
                  resizeMode="contain"
                  onError={(e) => console.log('Event image error:', e.nativeEvent.error, 'URL:', item.image)}
                />
              )}
              <Text style={styles.eventDetail}>
                Event Date: {formatDateTime(item.dateTime)}
              </Text>
              <Text style={styles.eventDetail}>
                Posted On: {formatDateTime(item.createdAt)}
              </Text>
              <Text style={styles.eventDetail}>Location: {item.location}</Text>
              <Text style={styles.eventDetail}>Category: {item.category}</Text>
              <Text style={styles.eventDetail}>Role: {item.role}</Text>
              <Text style={styles.eventDetail}>
                Organizer: {item.organizer?.name || 'Unknown'}
              </Text>
              {item.organizer?._id === userId && item.status === 'Open' && (
                <TouchableOpacity
                  style={styles.finishButton}
                  onPress={() => handleFinishEvent(item._id)}
                >
                  <Text style={styles.finishButtonText}>Finish Event</Text>
                </TouchableOpacity>
              )}
            </View>
          )}
          ListEmptyComponent={
            <Text style={styles.emptyText}>No open events found.</Text>
          }
          contentContainerStyle={styles.eventList}
        />
      </ScrollView>

      <Modal
        animationType="slide"
        transparent={true}
        visible={datePickerModalVisible}
        onRequestClose={() => setDatePickerModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Select Event Date and Time</Text>
            <Picker
              selectedValue={tempYear}
              onValueChange={(value) => setTempYear(value)}
              style={styles.picker}
            >
              {years.map((year) => (
                <Picker.Item key={year} label={String(year)} value={year} />
              ))}
            </Picker>
            <Picker
              selectedValue={tempMonth}
              onValueChange={(value) => setTempMonth(value)}
              style={styles.picker}
            >
              {months.map((month, index) => (
                <Picker.Item key={month} label={month} value={index} />
              ))}
            </Picker>
            <Picker
              selectedValue={tempDay}
              onValueChange={(value) => setTempDay(value)}
              style={styles.picker}
            >
              {days.map((day) => (
                <Picker.Item key={day} label={String(day)} value={day} />
              ))}
            </Picker>
            <View style={styles.timePickerContainer}>
              <Picker
                selectedValue={tempHour}
                onValueChange={(value) => setTempHour(value)}
                style={[styles.picker, styles.timePicker]}
              >
                {hours.map((hour) => (
                  <Picker.Item key={hour} label={String(hour)} value={hour} />
                ))}
              </Picker>
              <Picker
                selectedValue={tempMinute}
                onValueChange={(value) => setTempMinute(value)}
                style={[styles.picker, styles.timePicker]}
              >
                {minutes.map((minute) => (
                  <Picker.Item key={minute} label={minute} value={parseInt(minute)} />
                ))}
              </Picker>
              <Picker
                selectedValue={tempAmPm}
                onValueChange={(value) => setTempAmPm(value)}
                style={[styles.picker, styles.timePicker]}
              >
                {amPmOptions.map((option) => (
                  <Picker.Item key={option} label={option} value={option} />
                ))}
              </Picker>
            </View>
            <TouchableOpacity
              style={styles.modalButton}
              onPress={handleDateConfirm}
              activeOpacity={0.7}
            >
              <Text style={styles.modalButtonText}>Confirm</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.modalButton, styles.cancelButton]}
              onPress={() => setDatePickerModalVisible(false)}
              activeOpacity={0.7}
            >
              <Text style={styles.modalButtonText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <Modal
        animationType="slide"
        transparent={true}
        visible={categoryModalVisible}
        onRequestClose={() => setCategoryModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Select Category</Text>
            {categories.map((cat) => (
              <TouchableOpacity
                key={cat}
                style={styles.modalOption}
                onPress={() => {
                  setCategory(cat);
                  setCategoryModalVisible(false);
                }}
              >
                <Text style={styles.modalOptionText}>{cat}</Text>
              </TouchableOpacity>
            ))}
            <TouchableOpacity
              style={[styles.modalButton, styles.cancelButton]}
              onPress={() => setCategoryModalVisible(false)}
            >
              <Text style={styles.modalButtonText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  scrollContainer: {
    flexGrow: 1,
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
    marginBottom: 20,
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
  calendarIcon: {
    marginLeft: 10,
    marginRight: 5,
  },
  input: {
    flex: 1,
    height: 50,
    fontSize: 16,
    color: '#333',
  },
  multilineInput: {
    height: 100,
    textAlignVertical: 'top',
    paddingTop: 10,
  },
  dateText: {
    fontSize: 16,
    color: '#333',
    lineHeight: 50,
  },
  imagePickerButton: {
    width: '100%',
    height: 50,
    backgroundColor: '#007bff',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 10,
    marginBottom: 15,
  },
  imagePickerText: {
    fontSize: 16,
    color: '#fff',
    fontWeight: 'bold',
  },
  previewImage: {
    width: '100%',
    height: 150,
    borderRadius: 10,
    marginBottom: 15,
  },
  errorText: {
    color: '#dc3545',
    fontSize: 14,
    marginBottom: 10,
    alignSelf: 'flex-start',
  },
  submitButton: {
    width: '100%',
    height: 50,
    backgroundColor: '#4CAF50',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 10,
    marginBottom: 20,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  submitButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
  },
  eventsTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginVertical: 20,
  },
  eventItem: {
    padding: 20,
    backgroundColor: '#fff',
    borderRadius: 10,
    marginBottom: 15,
    elevation: 2,
  },
  eventTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  eventDescription: {
    fontSize: 16,
    color: '#555',
    marginTop: 8,
  },
  eventImage: {
    width: '100%',
    height: 150,
    borderRadius: 10,
    marginTop: 8,
    marginBottom: 8,
  },
  eventDetail: {
    fontSize: 14,
    color: '#777',
    marginTop: 4,
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginTop: 20,
  },
  eventList: {
    paddingBottom: 20,
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
  modalOption: {
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  modalOptionText: {
    fontSize: 16,
    color: '#333',
  },
  modalButton: {
    padding: 10,
    borderRadius: 10,
    marginTop: 10,
    alignItems: 'center',
    backgroundColor: '#007bff',
  },
  cancelButton: {
    backgroundColor: '#6c757d',
  },
  modalButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
  },
  finishButton: {
    width: '100%',
    height: 40,
    backgroundColor: '#FF4444',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 10,
    marginTop: 10,
  },
  finishButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
  },
  picker: {
    width: '100%',
    height: 50,
    marginVertical: 5,
  },
  timePickerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  timePicker: {
    width: '30%',
  },
});