import React, { useEffect, useState } from 'react';
import { StyleSheet, View, Text, FlatList, TouchableOpacity, Image, ActivityIndicator, Alert } from 'react-native';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { router } from 'expo-router';

export default function HistoryScreen() {
  const [issues, setIssues] = useState([]);
  const [sortOrder, setSortOrder] = useState('desc');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchResolvedIssues();
  }, [sortOrder]);

  const fetchResolvedIssues = async () => {
    setLoading(true);
    try {
      const token = await AsyncStorage.getItem('token');
      if (!token) {
        throw new Error('No token found. Please log in again.');
      }

      const response = await axios.get('http://localhost:3000/api/issues/resolved', {
        headers: { Authorization: `Bearer ${token}` },
        params: { sort: sortOrder },
      });

      console.log('Fetched resolved issues:', response.data.map(i => ({
        _id: i._id,
        title: i.title,
        status: i.status,
        createdAt: i.createdAt,
        resolvedAt: i.resolvedAt,
      })));

      setIssues(response.data);
    } catch (error) {
      console.error('Failed to fetch resolved issues:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
      });

      if (error.response?.status === 401) {
        await AsyncStorage.removeItem('token');
        await AsyncStorage.removeItem('user');
        router.replace('/LoginScreen');
        Alert.alert('Session Expired', 'Please log in again.');
      } else {
        Alert.alert('Error', error.response?.data?.message || 'Failed to fetch resolved issues. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const toggleSortOrder = () => {
    setSortOrder(sortOrder === 'desc' ? 'asc' : 'desc');
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007bff" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Resolved Issues History</Text>
      </View>

      <View style={styles.filterContainer}>
        <TouchableOpacity style={styles.sortButton} onPress={toggleSortOrder}>
          <Text style={styles.sortButtonText}>
            Sort by Reported Date: {sortOrder === 'desc' ? 'Newest First' : 'Oldest First'}
          </Text>
        </TouchableOpacity>
      </View>

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
                onError={(e) => console.log('Failed to load issue image:', e.nativeEvent.error)}
              />
            )}
            <Text style={styles.issueReporter}>Reported by: {item.reporter}</Text>
            <Text style={styles.issueRole}>Assigned to: {item.role}</Text>
            <Text style={styles.issueDate}>Reported: {formatDate(item.createdAt)}</Text>
            <Text style={[styles.issueStatus, { color: '#4CAF50' }]}>
              {/* Resolved: {item.resolvedAt ? formatDate(item.resolvedAt) : 'N/A'} */}
            </Text>
          </View>
        )}
        ListEmptyComponent={
          <Text style={styles.emptyText}>No resolved issues found.</Text>
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
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
  },
  filterContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginVertical: 20,
  },
  sortButton: {
    paddingVertical: 8,
    paddingHorizontal: 20,
    borderRadius: 20,
    backgroundColor: '#007bff',
  },
  sortButtonText: {
    fontSize: 16,
    color: '#fff',
    fontWeight: '500',
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
  issueDate: {
    fontSize: 14,
    color: '#777',
    marginTop: 8,
  },
  issueStatus: {
    fontSize: 14,
    marginTop: 8,
    fontWeight: '600',
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