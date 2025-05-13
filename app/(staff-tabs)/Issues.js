// import React, { useState, useEffect } from 'react';
// import {
//   View,
//   Text,
//   TouchableOpacity,
//   Alert,
//   StyleSheet,
//   ScrollView,
//   FlatList,
//   Image,
// } from 'react-native';
// import AsyncStorage from '@react-native-async-storage/async-storage';
// import { useRouter } from 'expo-router';
// import { MaterialIcons } from '@expo/vector-icons';
// import axios from 'axios';

// export default function StaffIssues() {
//   const [staff, setStaff] = useState(null);
//   const [societyName, setSocietyName] = useState('Loading...');
//   const [issues, setIssues] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const router = useRouter();

//   useEffect(() => {
//     const fetchStaffData = async () => {
//       try {
//         const staffData = await AsyncStorage.getItem('staff');
//         const token = await AsyncStorage.getItem('token');

//         if (!staffData || !token) {
//           Alert.alert('Error', 'No staff data found. Please log in again.');
//           router.replace('/StaffLoginScreen');
//           return;
//         }

//         const parsedStaff = JSON.parse(staffData);
//         setStaff(parsedStaff);

//         const societyResponse = await fetch(`http://localhost:3000/api/societies/${parsedStaff.society}`, {
//           headers: {
//             'Authorization': `Bearer ${token}`,
//             'Content-Type': 'application/json',
//           },
//         });

//         if (!societyResponse.ok) {
//           throw new Error('Failed to fetch society details');
//         }

//         const societyData = await societyResponse.json();
//         setSocietyName(societyData.name || 'Unknown Society');

//         const issuesResponse = await axios.get(`http://localhost:3000/api/issues/staff/${parsedStaff._id}`, {
//           headers: { Authorization: `Bearer ${token}` },
//         });
//         const openIssues = issuesResponse.data.filter(issue => issue.status === 'Open');
//         setIssues(openIssues);

//         console.log('Fetched issues:', openIssues.map(i => ({ _id: i._id, title: i.title })));
//       } catch (error) {
//         console.error('Fetch staff data error:', error);
//         Alert.alert('Error', error.message || 'Failed to load issues');
//         setSocietyName('Error loading society');
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchStaffData();
//   }, []);

//   const handleUpdateStatus = async (issueId) => {
//     try {
//       const token = await AsyncStorage.getItem('token');
//       const response = await axios.put(
//         `http://localhost:3000/api/issues/${issueId}/status`,
//         { status: 'Under Review' },
//         { headers: { Authorization: `Bearer ${token}` } }
//       );
//       setIssues(issues.filter(issue => issue._id !== issueId));
//       Alert.alert('Success', response.data.message);
//     } catch (error) {
//       console.error('Failed to update issue status:', error);
//       Alert.alert('Error', error.response?.data?.message || 'Failed to update status');
//     }
//   };

//   const handleLogout = async () => {
//     try {
//       await AsyncStorage.removeItem('token');
//       await AsyncStorage.removeItem('staff');
//       router.replace('/StaffLoginScreen');
//     } catch (error) {
//       Alert.alert('Error', 'Failed to log out');
//     }
//   };

//   if (!staff || loading) {
//     return (
//       <View style={styles.container}>
//         <Text style={styles.heading}>Loading...</Text>
//       </View>
//     );
//   }

//   return (
//     <ScrollView contentContainerStyle={styles.container}>
//       <Text style={styles.heading}>Welcome, {staff.fullName}!</Text>
//       <Text style={styles.subheading}>Assigned Issues</Text>

//       <View style={styles.infoCard}>
//         <View style={styles.infoRow}>
//           <MaterialIcons name="person" size={24} color="#007bff" style={styles.icon} />
//           <Text style={styles.infoText}>Role: {staff.role}</Text>
//         </View>
//         <View style={styles.infoRow}>
//           <MaterialIcons name="home" size={24} color="#007bff" style={styles.icon} />
//           <Text style={styles.infoText}>Society: {societyName}</Text>
//         </View>
//         <View style={styles.infoRow}>
//           <MaterialIcons name="phone" size={24} color="#007bff" style={styles.icon} />
//           <Text style={styles.infoText}>Phone: {staff.phoneNumber}</Text>
//         </View>
//         <View style={styles.infoRow}>
//           <MaterialIcons name="event" size={24} color="#007bff" style={styles.icon} />
//           <Text style={styles.infoText}>
//             Start Date: {new Date(staff.startDate).toLocaleDateString()}
//           </Text>
//         </View>
//       </View>

//       <Text style={styles.sectionTitle}>Assigned Issues</Text>
//       <FlatList
//         data={issues}
//         keyExtractor={(item) => item._id}
//         renderItem={({ item }) => (
//           <View style={styles.issueItem}>
//             <Text style={styles.issueTitle}>{item.title}</Text>
//             <Text style={styles.issueDescription}>{item.description}</Text>
//             {item.image && item.image.startsWith('data:image/') && (
//               <Image
//                 source={{ uri: item.image }}
//                 style={styles.issueImage}
//                 resizeMode="contain"
//                 onError={(e) => console.log('Issue image error:', e.nativeEvent.error, 'URL:', item.image)}
//               />
//             )}
//             <Text style={styles.issueReporter}>Reported by: {item.reporter}</Text>
//             <Text style={styles.issueRole}>Role: {item.role}</Text>
//             <Text style={[styles.issueStatus, { color: '#FF9800' }]}>
//               Status: {item.status}
//             </Text>
//             <TouchableOpacity
//               style={styles.statusButton}
//               onPress={() => handleUpdateStatus(item._id)}
//             >
//               <Text style={styles.statusButtonText}>Mark as Under Review</Text>
//             </TouchableOpacity>
//           </View>
//         )}
//         ListEmptyComponent={
//           <Text style={styles.emptyText}>No open issues assigned to you.</Text>
//         }
//       />

//       <TouchableOpacity style={[styles.button, styles.logoutButton]} onPress={handleLogout}>
//         <Text style={styles.buttonText}>Logout</Text>
//       </TouchableOpacity>
//     </ScrollView>
//   );
// }

// const styles = StyleSheet.create({
//   container: {
//     flexGrow: 1,
//     padding: 20,
//     backgroundColor: '#f5f5f5',
//   },
//   heading: {
//     fontSize: 28,
//     fontWeight: 'bold',
//     marginBottom: 10,
//     color: '#333',
//     textAlign: 'center',
//   },
//   subheading: {
//     fontSize: 16,
//     color: '#666',
//     marginBottom: 20,
//     textAlign: 'center',
//   },
//   sectionTitle: {
//     fontSize: 22,
//     fontWeight: '600',
//     color: '#333',
//     marginTop: 20,
//     marginBottom: 15,
//     textAlign: 'center',
//   },
//   infoCard: {
//     width: '100%',
//     backgroundColor: '#fff',
//     borderRadius: 10,
//     padding: 15,
//     elevation: 2,
//     marginBottom: 20,
//   },
//   infoRow: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     marginBottom: 10,
//   },
//   icon: {
//     marginRight: 10,
//   },
//   infoText: {
//     fontSize: 16,
//     color: '#333',
//   },
//   issueItem: {
//     padding: 20,
//     backgroundColor: '#fff',
//     borderRadius: 10,
//     marginBottom: 15,
//     elevation: 2,
//   },
//   issueTitle: {
//     fontSize: 18,
//     fontWeight: 'bold',
//     color: '#333',
//   },
//   issueDescription: {
//     fontSize: 16,
//     color: '#555',
//     marginTop: 8,
//   },
//   issueImage: {
//     width: '100%',
//     height: 150,
//     borderRadius: 10,
//     marginTop: 8,
//     marginBottom: 8,
//   },
//   issueReporter: {
//     fontSize: 14,
//     color: '#777',
//     marginTop: 8,
//   },
//   issueRole: {
//     fontSize: 14,
//     color: '#777',
//     marginTop: 8,
//   },
//   issueStatus: {
//     fontSize: 14,
//     marginTop: 8,
//     fontWeight: '600',
//   },
//   statusButton: {
//     marginTop: 10,
//     padding: 10,
//     borderRadius: 10,
//     alignItems: 'center',
//     backgroundColor: '#007bff',
//   },
//   statusButtonText: {
//     fontSize: 16,
//     color: '#fff',
//     fontWeight: 'bold',
//   },
//   emptyText: {
//     fontSize: 16,
//     color: '#666',
//     textAlign: 'center',
//     marginTop: 20,
//   },
//   button: {
//     width: '100%',
//     height: 50,
//     backgroundColor: '#007bff',
//     justifyContent: 'center',
//     alignItems: 'center',
//     borderRadius: 10,
//     marginBottom: 10,
//   },
//   logoutButton: {
//     backgroundColor: '#ff4444',
//   },
//   buttonText: {
//     fontSize: 18,
//     fontWeight: 'bold',
//     color: '#fff',
//   },
// });

// import React, { useState, useEffect } from 'react';
// import {
//   View,
//   Text,
//   TouchableOpacity,
//   Alert,
//   StyleSheet,
//   ScrollView,
//   FlatList,
//   Image,
// } from 'react-native';
// import AsyncStorage from '@react-native-async-storage/async-storage';
// import { useRouter } from 'expo-router';
// import { MaterialIcons } from '@expo/vector-icons';
// import axios from 'axios';

// export default function StaffIssues() {
//   const [staff, setStaff] = useState(null);
//   const [societyName, setSocietyName] = useState('Loading...');
//   const [issues, setIssues] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const router = useRouter();

//   useEffect(() => {
//     const fetchStaffData = async () => {
//       try {
//         const staffData = await AsyncStorage.getItem('staff');
//         const token = await AsyncStorage.getItem('token');

//         if (!staffData || !token) {
//           Alert.alert('Error', 'No staff data found. Please log in again.');
//           router.replace('/StaffLoginScreen');
//           return;
//         }

//         const parsedStaff = JSON.parse(staffData);
//         setStaff(parsedStaff);

//         const societyResponse = await fetch(`http://localhost:3000/api/societies/${parsedStaff.society}`, {
//           headers: {
//             'Authorization': `Bearer ${token}`,
//             'Content-Type': 'application/json',
//           },
//         });

//         if (!societyResponse.ok) {
//           throw new Error('Failed to fetch society details');
//         }

//         const societyData = await societyResponse.json();
//         setSocietyName(societyData.name || 'Unknown Society');

//         const issuesResponse = await axios.get(`http://localhost:3000/api/issues/staff/${parsedStaff._id}`, {
//           headers: { Authorization: `Bearer ${token}` },
//         });
//         const openIssues = issuesResponse.data.filter(issue => issue.status === 'Open');
//         setIssues(openIssues);

//         console.log('Fetched issues:', openIssues.map(i => ({ _id: i._id, title: i.title })));
//       } catch (error) {
//         console.error('Fetch staff data error:', error);
//         Alert.alert('Error', error.message || 'Failed to load issues');
//         setSocietyName('Error loading society');
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchStaffData();
//   }, []);

//   const handleUpdateStatus = async (issueId) => {
//     try {
//       const token = await AsyncStorage.getItem('token');
//       const response = await axios.put(
//         `http://localhost:3000/api/issues/${issueId}/status`,
//         { status: 'Under Review' },
//         { headers: { Authorization: `Bearer ${token}` } }
//       );
//       setIssues(issues.filter(issue => issue._id !== issueId));
//       Alert.alert('Success', response.data.message);
//     } catch (error) {
//       console.error('Failed to update issue status:', error);
//       Alert.alert('Error', error.response?.data?.message || 'Failed to update status');
//     }
//   };

//   const handleLogout = async () => {
//     try {
//       await AsyncStorage.removeItem('token');
//       await AsyncStorage.removeItem('staff');
//       await AsyncStorage.removeItem('user');
//       router.replace('/StaffLoginScreen');
//       console.log('Logged out successfully');
//     } catch (error) {
//       console.error('Logout error:', error);
//       Alert.alert('Error', 'Failed to log out');
//     }
//   };

//   if (!staff || loading) {
//     return (
//       <View style={styles.container}>
//         <Text style={styles.heading}>Loading...</Text>
//       </View>
//     );
//   }

//   return (
//     <ScrollView contentContainerStyle={styles.container}>
//       <View style={styles.headerContainer}>
//         <Text style={styles.heading}>Welcome, {staff.fullName}!</Text>
//         <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
//           <MaterialIcons name="logout" size={24} color="#fff" />
//         </TouchableOpacity>
//       </View>
//       <Text style={styles.subheading}>Assigned Issues</Text>

//       <View style={styles.infoCard}>
//         <View style={styles.infoRow}>
//           <MaterialIcons name="person" size={24} color="#007bff" style={styles.icon} />
//           <Text style={styles.infoText}>Role: {staff.role}</Text>
//         </View>
//         <View style={styles.infoRow}>
//           <MaterialIcons name="home" size={24} color="#007bff" style={styles.icon} />
//           <Text style={styles.infoText}>Society: {societyName}</Text>
//         </View>
//         <View style={styles.infoRow}>
//           <MaterialIcons name="phone" size={24} color="#007bff" style={styles.icon} />
//           <Text style={styles.infoText}>Phone: {staff.phoneNumber}</Text>
//         </View>
//         <View style={styles.infoRow}>
//           <MaterialIcons name="event" size={24} color="#007bff" style={styles.icon} />
//           <Text style={styles.infoText}>
//             Start Date: {new Date(staff.startDate).toLocaleDateString()}
//           </Text>
//         </View>
//       </View>

//       <Text style={styles.sectionTitle}>Assigned Issues</Text>
//       <FlatList
//         data={issues}
//         keyExtractor={(item) => item._id}
//         renderItem={({ item }) => (
//           <View style={styles.issueItem}>
//             <Text style={styles.issueTitle}>{item.title}</Text>
//             <Text style={styles.issueDescription}>{item.description}</Text>
//             {item.image && item.image.startsWith('data:image/') && (
//               <Image
//                 source={{ uri: item.image }}
//                 style={styles.issueImage}
//                 resizeMode="contain"
//                 onError={(e) => console.log('Issue image error:', e.nativeEvent.error, 'URL:', item.image)}
//               />
//             )}
//             <Text style={styles.issueReporter}>Reported by: {item.reporter}</Text>
//             <Text style={styles.issueRole}>Role: {item.role}</Text>
//             <Text style={[styles.issueStatus, { color: '#FF9800' }]}>
//               Status: {item.status}
//             </Text>
//             <TouchableOpacity
//               style={styles.statusButton}
//               onPress={() => handleUpdateStatus(item._id)}
//             >
//               <Text style={styles.statusButtonText}>Mark as Under Review</Text>
//             </TouchableOpacity>
//           </View>
//         )}
//         ListEmptyComponent={
//           <Text style={styles.emptyText}>No open issues assigned to you.</Text>
//         }
//       />
//     </ScrollView>
//   );
// }

// const styles = StyleSheet.create({
//   container: {
//     flexGrow: 1,
//     padding: 20,
//     backgroundColor: '#f5f5f5',
//   },
//   headerContainer: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     alignItems: 'center',
//     marginBottom: 10,
//   },
//   heading: {
//     fontSize: 28,
//     fontWeight: 'bold',
//     color: '#333',
//   },
//   subheading: {
//     fontSize: 16,
//     color: '#666',
//     marginBottom: 20,
//     textAlign: 'center',
//   },
//   sectionTitle: {
//     fontSize: 22,
//     fontWeight: '600',
//     color: '#333',
//     marginTop: 20,
//     marginBottom: 15,
//     textAlign: 'center',
//   },
//   infoCard: {
//     width: '100%',
//     backgroundColor: '#fff',
//     borderRadius: 10,
//     padding: 15,
//     elevation: 2,
//     marginBottom: 20,
//   },
//   infoRow: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     marginBottom: 10,
//   },
//   icon: {
//     marginRight: 10,
//   },
//   infoText: {
//     fontSize: 16,
//     color: '#333',
//   },
//   issueItem: {
//     padding: 20,
//     backgroundColor: '#fff',
//     borderRadius: 10,
//     marginBottom: 15,
//     elevation: 2,
//   },
//   issueTitle: {
//     fontSize: 18,
//     fontWeight: 'bold',
//     color: '#333',
//   },
//   issueDescription: {
//     fontSize: 16,
//     color: '#555',
//     marginTop: 8,
//   },
//   issueImage: {
//     width: '100%',
//     height: 150,
//     borderRadius: 10,
//     marginTop: 8,
//     marginBottom: 8,
//   },
//   issueReporter: {
//     fontSize: 14,
//     color: '#777',
//     marginTop: 8,
//   },
//   issueRole: {
//     fontSize: 14,
//     color: '#777',
//     marginTop: 8,
//   },
//   issueStatus: {
//     fontSize: 14,
//     marginTop: 8,
//     fontWeight: '600',
//   },
//   statusButton: {
//     marginTop: 10,
//     padding: 10,
//     borderRadius: 10,
//     alignItems: 'center',
//     backgroundColor: '#007bff',
//   },
//   statusButtonText: {
//     fontSize: 16,
//     color: '#fff',
//     fontWeight: 'bold',
//   },
//   emptyText: {
//     fontSize: 16,
//     color: '#666',
//     textAlign: 'center',
//     marginTop: 20,
//   },
//   logoutButton: {
//     backgroundColor: '#ff4444',
//     padding: 10,
//     borderRadius: 50,
//     justifyContent: 'center',
//     alignItems: 'center',
//   },
// });

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
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import axios from 'axios';

export default function StaffIssues() {
  const [staff, setStaff] = useState(null);
  const [societyName, setSocietyName] = useState('Loading...');
  const [issues, setIssues] = useState([]);
  const [loading, setLoading] = useState(true);
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

        const issuesResponse = await axios.get(`http://localhost:3000/api/issues/staff/${parsedStaff._id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setIssues(issuesResponse.data);

        console.log('Fetched issues:', issuesResponse.data.map(i => ({ _id: i._id, title: i.title, status: i.status })));
      } catch (error) {
        console.error('Fetch staff data error:', error);
        Alert.alert('Error', error.message || 'Failed to load issues');
        setSocietyName('Error loading society');
      } finally {
        setLoading(false);
      }
    };

    fetchStaffData();
  }, []);

  const handleUpdateStatus = async (issueId) => {
    console.log('Attempting to update issue with ID:', issueId);
    try {
      const token = await AsyncStorage.getItem('token');
      if (!token) {
        throw new Error('No token found');
      }
      const response = await axios.put(
        `http://localhost:3000/api/issues/${issueId}/status`,
        { status: 'Under Review' },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setIssues(issues.filter(issue => issue._id !== issueId));
      Alert.alert('Success', response.data.message);
    } catch (error) {
      console.error('Failed to update issue status:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
        issueId
      });
      Alert.alert('Error', error.response?.data?.message || 'Failed to update status');
    }
  };

  const handleLogout = async () => {
    try {
      await AsyncStorage.removeItem('token');
      await AsyncStorage.removeItem('staff');
      await AsyncStorage.removeItem('user');
      router.replace('/StaffLoginScreen');
      console.log('Logged out successfully');
    } catch (error) {
      console.error('Logout error:', error);
      Alert.alert('Error', 'Failed to log out');
    }
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
      <View style={styles.headerContainer}>
        <Text style={styles.heading}>Welcome, {staff.fullName}!</Text>
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <MaterialIcons name="logout" size={24} color="#fff" />
        </TouchableOpacity>
      </View>
      <Text style={styles.subheading}>Assigned Issues</Text>

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
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 20,
    backgroundColor: '#f5f5f5',
  },
  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  heading: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
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
  emptyText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginTop: 20,
  },
  logoutButton: {
    backgroundColor: '#ff4444',
    padding: 10,
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
  },
});