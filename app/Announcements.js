


const React = require('react');
const { useState, useEffect } = React;
const {
  StyleSheet,
  View,
  Text,
  FlatList,
  Alert,
  ActivityIndicator,
  Platform,
} = require('react-native');
const AsyncStorage = require('@react-native-async-storage/async-storage');
const { useRouter } = require('expo-router');

// Web fallback for AsyncStorage using localStorage
const storage = Platform.OS === 'web' ? {
  getItem: async (key) => {
    try {
      const value = localStorage.getItem(key);
      return value !== null ? value : null;
    } catch (e) {
      console.error('localStorage.getItem error:', e);
      return null;
    }
  },
  setItem: async (key, value) => {
    try {
      localStorage.setItem(key, value);
    } catch (e) {
      console.error('localStorage.setItem error:', e);
    }
  },
  removeItem: async (key) => {
    try {
      localStorage.removeItem(key);
    } catch (e) {
      console.error('localStorage.removeItem error:', e);
    }
  },
} : AsyncStorage;

export default function Announcements() {
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const router = useRouter();

  useEffect(() => {
    fetchAnnouncements();
  }, []);

  const fetchAnnouncements = async () => {
    try {
      const token = await storage.getItem('token');
      const userData = await storage.getItem('user');
      if (!token || !userData) {
        throw new Error('Session expired');
      }
      const user = JSON.parse(userData);
      const society = user?.society;
      console.log('User data:', user);
      console.log('Society ID:', society);
      if (!society) {
        throw new Error('Society ID not found in user data');
      }
      const apiUrl = `http://localhost:3000/api/${society}/announcements`;
      console.log('Fetching announcements from:', apiUrl);
      const response = await fetch(apiUrl, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const fetchedAnnouncements = await response.json();
      console.log(
        'Fetched announcements:',
        fetchedAnnouncements.map(ann => ({
          _id: ann._id,
          title: ann.title,
          createdAt: ann.createdAt,
        }))
      );
      setAnnouncements(fetchedAnnouncements);
      setLoading(false);
    } catch (error) {
      console.error('Failed to fetch announcements:', error);
      setLoading(false);
      if (error.message === 'Session expired' || (error.message.includes('HTTP error') && error.message.includes('401'))) {
        await storage.removeItem('token');
        await storage.removeItem('user');
        router.replace('/LoginScreen');
      } else if (error.message.includes('403')) {
        setError(
          error.message || 'Only managers can view announcements'
        );
      } else {
        setError('Failed to load announcements: ' + (error.message || 'Unknown error'));
        Alert.alert('Error', 'Failed to fetch announcements');
      }
    }
  };

  const renderAnnouncement = ({ item }) => (
    <View style={styles.announcementCard}>
      <Text style={styles.announcementTitle}>{item.title}</Text>
      <Text style={styles.announcementContent} numberOfLines={3}>
        {item.content}
      </Text>
      <Text style={styles.announcementDate}>
        Created: {new Date(item.createdAt).toLocaleDateString()}
      </Text>
      {item.updatedAt && new Date(item.updatedAt) > new Date(item.createdAt) && (
        <Text style={styles.announcementDate}>
          Updated: {new Date(item.updatedAt).toLocaleDateString()}
        </Text>
      )}
    </View>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#4CAF50" />
        <Text style={styles.loadingText}>Loading announcements...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>{error}</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.headerTitle}>Announcements</Text>
      <FlatList
        data={announcements}
        keyExtractor={item => item._id.toString()}
        renderItem={renderAnnouncement}
        ListEmptyComponent={
          <Text style={styles.emptyText}>No announcements at this time.</Text>
        }
        contentContainerStyle={styles.flatListContent}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    paddingTop: 40,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'center',
    marginVertical: 20,
    color: '#333',
  },
  announcementCard: {
    padding: 20,
    borderRadius: 12,
    marginBottom: 15,
    elevation: 3,
    borderLeftWidth: 4,
    // borderLeftColor: '#4CAF50',
    backgroundColor: '#fff',
  },
  announcementTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#2c3e50',
    textTransform: 'uppercase',
    marginBottom: 10,
    borderBottomWidth: 2,
    borderBottomColor: '#4CAF50',
    paddingBottom: 5,
  },
  announcementContent: {
    fontSize: 16,
    color: '#34495e',
    marginBottom: 10,
    lineHeight: 22,
  },
  announcementDate: {
    fontSize: 14,
    color: '#777',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  loadingText: {
    fontSize: 16,
    color: '#333',
    marginTop: 10,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  errorText: {
    fontSize: 16,
    color: '#FF4444',
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginTop: 20,
  },
  flatListContent: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
});