


import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Alert,
  StyleSheet,
  ScrollView,
  FlatList,
  Image,
  Picker,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import axios from 'axios';

export default function StaffDashboard() {
  const [staff, setStaff] = useState(null);
  const [societyName, setSocietyName] = useState('Loading...');
  const [issues, setIssues] = useState([]);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState('issues'); // 'issues' or 'events'
  const router = useRouter();

  useEffect(() => {
    const fetchStaffData = async () => {
      try {
        const staffData = await AsyncStorage.getItem('staff');
        const token = await AsyncStorage.getItem('token');

        if (!staffData || !token) {
          Alert.alert('Error', 'No staff data found. Please log in again.');
          router.replace('/StaffLoginScreen');
          return;
        }

        const parsedStaff = JSON.parse(staffData);
        setStaff(parsedStaff);

        // Fetch society details
        const societyResponse = await fetch(`http://localhost:3000/api/societies/${parsedStaff.society}`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });

        if (!societyResponse.ok) {
          throw new Error('Failed to fetch society details');
        }

        const societyData = await societyResponse.json();
        setSocietyName(societyData.name || 'Unknown Society');

        // Fetch assigned issues
        const issuesResponse = await axios.get(`http://localhost:3000/api/issues/staff/${parsedStaff._id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const openIssues = issuesResponse.data.filter(issue => issue.status === 'Open');
        setIssues(openIssues);

        // Fetch assigned events
        const eventsResponse = await axios.get('http://localhost:3000/api/events', {
          headers: { Authorization: `Bearer ${token}` },
        });
        const openEvents = eventsResponse.data.filter(
          event => event.organizer._id === parsedStaff._id && event.status === 'Open'
        );
        setEvents(openEvents);

        console.log('Fetched issues:', openIssues.map(i => ({ _id: i._id, title: i.title })));
        console.log('Fetched events:', openEvents.map(e => ({ _id: e._id, title: e.title })));
      } catch (error) {
        console.error('Fetch staff data error:', error);
        Alert.alert('Error', error.message || 'Failed to load dashboard');
        setSocietyName('Error loading society');
      } finally {
        setLoading(false);
      }
    };

    fetchStaffData();
  }, []);

  const handleUpdateStatus = async (issueId) => {
    try {
      const token = await AsyncStorage.getItem('token');
      const response = await axios.put(
        `http://localhost:3000/api/issues/${issueId}/status`,
        { status: 'Under Review' },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setIssues(issues.filter(issue => issue._id !== issueId));
      Alert.alert('Success', response.data.message);
    } catch (error) {
      console.error('Failed to update issue status:', error);
      Alert.alert('Error', error.response?.data?.message || 'Failed to update status');
    }
  };

  const handleFinishEvent = async (eventId) => {
    try {
      const token = await AsyncStorage.getItem('token');
      const response = await axios.patch(
        `http://localhost:3000/api/events/${eventId}/finish`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setEvents(events.filter(event => event._id !== eventId));
      Alert.alert('Success', response.data.message);
      console.log('Event finished:', response.data.event);
    } catch (error) {
      console.error('Finish event error:', error);
      Alert.alert('Error', error.response?.data?.message || 'Failed to finish event');
    }
  };

  const handleLogout = async () => {
    try {
      await AsyncStorage.removeItem('token');
      await AsyncStorage.removeItem('staff');
      router.replace('/StaffLoginScreen');
    } catch (error) {
      Alert.alert('Error', 'Failed to log out');
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

  if (!staff || loading) {
    return (
      <View style={styles.container}>
        <Text style={styles.heading}>Loading...</Text>
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.heading}>Welcome, {staff.fullName}!</Text>
      <Text style={styles.subheading}>Staff Dashboard</Text>

      <View style={styles.infoCard}>
        <View style={styles.infoRow}>
          <MaterialIcons name="person" size={24} color="#007bff" style={styles.icon} />
          <Text style={styles.infoText}>Role: {staff.role}</Text>
        </View>
        <View style={styles.infoRow}>
          <MaterialIcons name="home" size={24} color="#007bff" style={styles.icon} />
          <Text style={styles.infoText}>Society: {societyName}</Text>
        </View>
        <View style={styles.infoRow}>
          <MaterialIcons name="phone" size={24} color="#007bff" style={styles.icon} />
          <Text style={styles.infoText}>Phone: {staff.phoneNumber}</Text>
        </View>
        <View style={styles.infoRow}>
          <MaterialIcons name="event" size={24} color="#007bff" style={styles.icon} />
          <Text style={styles.infoText}>
            Start Date: {new Date(staff.startDate).toLocaleDateString()}
          </Text>
        </View>
      </View>

      <View style={styles.pickerContainer}>
        <Text style={styles.pickerLabel}>View:</Text>
        <Picker
          selectedValue={viewMode}
          style={styles.picker}
          onValueChange={(value) => setViewMode(value)}
        >
          <Picker.Item label="Assigned Issues" value="issues" />
          <Picker.Item label="Assigned Events" value="events" />
        </Picker>
      </View>

      {viewMode === 'issues' ? (
        <>
          <Text style={styles.sectionTitle}>Assigned Issues</Text>
          <FlatList
            data={issues}
            keyExtractor={(item) => item._id}
            renderItem={({ item }) => (
              <View style={styles.issueItem}>
                <Text style={styles.issueTitle}>{item.title}</Text>
                <Text style={styles.issueDescription}>{item.description}</Text>
                {item.image && item.image.startsWith('data:image/') && (
                  <Image
                    source={{ uri: item.image }}
                    style={styles.issueImage}
                    resizeMode="contain"
                    onError={(e) => console.log('Issue image error:', e.nativeEvent.error, 'URL:', item.image)}
                  />
                )}
                <Text style={styles.issueReporter}>Reported by: {item.reporter}</Text>
                <Text style={styles.issueRole}>Role: {item.role}</Text>
                <Text style={[styles.issueStatus, { color: '#FF9800' }]}>
                  Status: {item.status}
                </Text>
                <TouchableOpacity
                  style={styles.statusButton}
                  onPress={() => handleUpdateStatus(item._id)}
                >
                  <Text style={styles.statusButtonText}>Mark as Under Review</Text>
                </TouchableOpacity>
              </View>
            )}
            ListEmptyComponent={
              <Text style={styles.emptyText}>No open issues assigned to you.</Text>
            }
          />
        </>
      ) : (
        <>
          <Text style={styles.sectionTitle}>Assigned Events</Text>
          <FlatList
            data={events}
            keyExtractor={(item) => item._id}
            renderItem={({ item }) => (
              <View style={styles.eventItem}>
                <Text style={styles.eventTitle}>{item.title}</Text>
                <Text style={styles.eventDescription}>{item.description}</Text>
                {item.image && item.image.startsWith('data:image/') && (
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
                <Text style={[styles.eventStatus, { color: '#FF9800' }]}>
                  Status: {item.status}
                </Text>
                <TouchableOpacity
                  style={styles.finishButton}
                  onPress={() => handleFinishEvent(item._id)}
                >
                  <Text style={styles.finishButtonText}>Finish Event</Text>
                </TouchableOpacity>
              </View>
            )}
            ListEmptyComponent={
              <Text style={styles.emptyText}>No open events assigned to you.</Text>
            }
          />
        </>
      )}

      <TouchableOpacity style={[styles.button, styles.logoutButton]} onPress={handleLogout}>
        <Text style={styles.buttonText}>Logout</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 20,
    backgroundColor: '#f5f5f5',
  },
  heading: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#333',
    textAlign: 'center',
  },
  subheading: {
    fontSize: 16,
    color: '#666',
    marginBottom: 20,
    textAlign: 'center',
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: '600',
    color: '#333',
    marginTop: 20,
    marginBottom: 15,
    textAlign: 'center',
  },
  infoCard: {
    width: '100%',
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 15,
    elevation: 2,
    marginBottom: 20,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  icon: {
    marginRight: 10,
  },
  infoText: {
    fontSize: 16,
    color: '#333',
  },
  pickerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  pickerLabel: {
    fontSize: 16,
    color: '#333',
    marginRight: 10,
  },
  picker: {
    flex: 1,
    height: 50,
    backgroundColor: '#fff',
    borderRadius: 10,
    elevation: 2,
  },
  issueItem: {
    padding: 20,
    backgroundColor: '#fff',
    borderRadius: 10,
    marginBottom: 15,
    elevation: 2,
  },
  issueTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  issueDescription: {
    fontSize: 16,
    color: '#555',
    marginTop: 8,
  },
  issueImage: {
    width: '100%',
    height: 150,
    borderRadius: 10,
    marginTop: 8,
    marginBottom: 8,
  },
  issueReporter: {
    fontSize: 14,
    color: '#777',
    marginTop: 8,
  },
  issueRole: {
    fontSize: 14,
    color: '#777',
    marginTop: 8,
  },
  issueStatus: {
    fontSize: 14,
    marginTop: 8,
    fontWeight: '600',
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
    marginTop: 8,
  },
  eventStatus: {
    fontSize: 14,
    marginTop: 8,
    fontWeight: '600',
  },
  statusButton: {
    marginTop: 10,
    padding: 10,
    borderRadius: 10,
    alignItems: 'center',
    backgroundColor: '#007bff',
  },
  statusButtonText: {
    fontSize: 16,
    color: '#fff',
    fontWeight: 'bold',
  },
  finishButton: {
    marginTop: 10,
    padding: 10,
    borderRadius: 10,
    alignItems: 'center',
    backgroundColor: '#FF4444',
  },
  finishButtonText: {
    fontSize: 16,
    color: '#fff',
    fontWeight: 'bold',
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginTop: 20,
  },
  button: {
    width: '100%',
    height: 50,
    backgroundColor: '#007bff',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 10,
    marginBottom: 10,
  },
  logoutButton: {
    backgroundColor: '#ff4444',
  },
  buttonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
  },
});