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

// export default function PersonalIssues() {
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

//         console.log('PersonalIssues.js - staffData:', staffData);
//         console.log('PersonalIssues.js - token:', token);

//         if (!staffData || !token) {
//           Alert.alert('Error', 'No staff data found. Please log in again.');
//           router.replace('/StaffLoginScreen');
//           return;
//         }

//         const parsedStaff = JSON.parse(staffData);
//         setStaff(parsedStaff);
//         console.log('PersonalIssues.js - parsedStaff:', { _id: parsedStaff._id, role: parsedStaff.role, society: parsedStaff.society });

//         const societyResponse = await fetch(`http://localhost:3000/api/societies/${parsedStaff.society}`, {
//           headers: {
//             'Authorization': `Bearer ${token}`,
//             'Content-Type': 'application/json',
//           },
//         });

//         if (!societyResponse.ok) {
//           const errorText = await societyResponse.text();
//           throw new Error(`Failed to fetch society details: ${societyResponse.status} ${errorText}`);
//         }

//         const societyData = await societyResponse.json();
//         setSocietyName(societyData.name || 'Unknown Society');
//         console.log('PersonalIssues.js - society:', societyData);

//         const issuesResponse = await axios.get(
//           `http://localhost:3000/api/issues/staff/${parsedStaff._id}?issueType=Personal`,
//           { headers: { Authorization: `Bearer ${token}` } }
//         );
//         console.log('PersonalIssues.js - issuesResponse:', { 
//           status: issuesResponse.status, 
//           headers: issuesResponse.headers, 
//           dataLength: issuesResponse.data.length, 
//           data: issuesResponse.data.map(i => ({
//             _id: i._id,
//             title: i.title,
//             role: i.role,
//             status: i.status,
//             issueType: i.issueType || 'Unknown',
//             reporter: i.reporter,
//             reporterAddress: i.reporterUser?.address || 'Not provided',
//             society: i.society
//           }))
//         });
//         setIssues(issuesResponse.data);

//         console.log('Fetched personal issues:', issuesResponse.data.map(i => ({ 
//           _id: i._id, 
//           title: i.title, 
//           role: i.role, 
//           status: i.status, 
//           issueType: i.issueType || 'Unknown', 
//           reporter: i.reporter, 
//           reporterAddress: i.reporterUser?.address || 'Not provided',
//           society: i.society
//         })));
//       } catch (error) {
//         console.error('Fetch staff data error:', error);
//         Alert.alert('Error', error.response?.data?.message || error.message || 'Failed to load personal issues');
//         setSocietyName('Error loading society');
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchStaffData();
//   }, []);

//   const handleResolveIssue = async (issueId) => {
//     try {
//       const token = await AsyncStorage.getItem('token');
//       const response = await axios.patch(
//         `http://localhost:3000/api/issues/${issueId}/resolve`,
//         {},
//         { headers: { Authorization: `Bearer ${token}` } }
//       );
//       setIssues(issues.filter(issue => issue._id !== issueId));
//       Alert.alert('Success', response.data.message);
//       console.log('Issue resolved:', response.data.issue);
//     } catch (error) {
//       console.error('Resolve issue error:', error);
//       Alert.alert('Error', error.response?.data?.message || 'Failed to resolve issue');
//     }
//   };

//   const formatDateTime = (date) => {
//     return new Date(date).toLocaleString('en-US', {
//       weekday: 'short',
//       month: 'short',
//       day: 'numeric',
//       year: 'numeric',
//       hour: 'numeric',
//       minute: '2-digit',
//       hour12: true,
//     });
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
//       <Text style={styles.subheading}>Assigned Personal Issues</Text>

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

//       <Text style={styles.sectionTitle}>Assigned Personal Issues</Text>
//       {issues.length === 0 && !loading ? (
//         <Text style={styles.emptyText}>No open personal issues assigned to you.</Text>
//       ) : (
//         <FlatList
//           data={issues}
//           keyExtractor={(item) => item._id}
//           renderItem={({ item }) => (
//             <View style={styles.issueItem}>
//               <Text style={styles.issueTitle}>{item.title}</Text>
//               <Text style={styles.issueDescription}>{item.description}</Text>
//               {item.image && item.image.startsWith('data:image/') && (
//                 <Image
//                   source={{ uri: item.image }}
//                   style={styles.issueImage}
//                   resizeMode="contain"
//                   onError={(e) => console.log('Issue image error:', e.nativeEvent.error, 'URL:', item.image)}
//                 />
//               )}
//               <Text style={styles.issueDetail}>
//                 Reported On: {formatDateTime(item.createdAt)}
//               </Text>
//               <Text style={styles.issueDetail}>Reporter: {item.reporter}</Text>
//               <Text style={styles.issueDetail}>
//                 Address: {item.reporterUser?.address || 'Not provided'}
//               </Text>
//               <Text style={styles.issueDetail}>Role: {item.role}</Text>
//               <Text style={[styles.issueStatus, { color: '#FF9800' }]}>
//                 Status: {item.status}
//               </Text>
//               <Text style={styles.issueDetail}>Type: {item.issueType || 'Unknown'}</Text>
//               <TouchableOpacity
//                 style={styles.resolveButton}
//                 onPress={() => handleResolveIssue(item._id)}
//               >
//                 <Text style={styles.resolveButtonText}>Resolve Issue</Text>
//               </TouchableOpacity>
//             </View>
//           )}
//           ListEmptyComponent={
//             <Text style={styles.emptyText}>No open personal issues assigned to you.</Text>
//           }
//         />
//       )}
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
//   issueDetail: {
//     fontSize: 14,
//     color: '#777',
//     marginTop: 8,
//   },
//   issueStatus: {
//     fontSize: 14,
//     marginTop: 8,
//     fontWeight: '600',
//   },
//   resolveButton: {
//     marginTop: 10,
//     padding: 10,
//     borderRadius: 10,
//     alignItems: 'center',
//     backgroundColor: '#4CAF50',
//   },
//   resolveButtonText: {
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

export default function PersonalIssues() {
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

        console.log('PersonalIssues.js - staffData:', staffData);
        console.log('PersonalIssues.js - token:', token);

        if (!staffData || !token) {
          Alert.alert('Error', 'No staff data found. Please log in again.');
          router.replace('/StaffLoginScreen');
          return;
        }

        const parsedStaff = JSON.parse(staffData);
        setStaff(parsedStaff);
        console.log('PersonalIssues.js - parsedStaff:', { _id: parsedStaff._id, role: parsedStaff.role, society: parsedStaff.society });

        const societyResponse = await fetch(`http://localhost:3000/api/societies/${parsedStaff.society}`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });

        if (!societyResponse.ok) {
          const errorText = await societyResponse.text();
          throw new Error(`Failed to fetch society details: ${societyResponse.status} ${errorText}`);
        }

        const societyData = await societyResponse.json();
        setSocietyName(societyData.name || 'Unknown Society');
        console.log('PersonalIssues.js - society:', societyData);

        const issuesResponse = await axios.get(
          `http://localhost:3000/api/issues/staff/${parsedStaff._id}?issueType=Personal`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        console.log('PersonalIssues.js - issuesResponse:', { 
          status: issuesResponse.status, 
          headers: issuesResponse.headers, 
          dataLength: issuesResponse.data.length, 
          data: issuesResponse.data.map(i => ({
            _id: i._id,
            title: i.title,
            role: i.role,
            status: i.status,
            issueType: i.issueType || 'Unknown',
            reporter: i.reporter,
            reporterAddress: i.reporterUser?.address || 'Not provided',
            reporterHouseNumber: i.reporterUser?.houseNumber || 'Not provided',
            society: i.society
          }))
        });
        setIssues(issuesResponse.data);

        console.log('Fetched personal issues:', issuesResponse.data.map(i => ({ 
          _id: i._id, 
          title: i.title, 
          role: i.role, 
          status: i.status, 
          issueType: i.issueType || 'Unknown', 
          reporter: i.reporter, 
          reporterAddress: i.reporterUser?.address || 'Not provided',
          reporterHouseNumber: i.reporterUser?.houseNumber || 'Not provided',
          society: i.society
        })));
      } catch (error) {
        console.error('Fetch staff data error:', error);
        Alert.alert('Error', error.response?.data?.message || error.message || 'Failed to load personal issues');
        setSocietyName('Error loading society');
      } finally {
        setLoading(false);
      }
    };

    fetchStaffData();
  }, []);

  const handleResolveIssue = async (issueId) => {
    try {
      const token = await AsyncStorage.getItem('token');
      const response = await axios.patch(
        `http://localhost:3000/api/issues/${issueId}/resolve`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setIssues(issues.filter(issue => issue._id !== issueId));
      Alert.alert('Success', response.data.message);
      console.log('Issue resolved:', response.data.issue);
    } catch (error) {
      console.error('Resolve issue error:', error);
      Alert.alert('Error', error.response?.data?.message || 'Failed to resolve issue');
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
      <Text style={styles.subheading}>Assigned Personal Issues</Text>

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

      <Text style={styles.sectionTitle}>Assigned Personal Issues</Text>
      {issues.length === 0 && !loading ? (
        <Text style={styles.emptyText}>No open personal issues assigned to you.</Text>
      ) : (
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
              <Text style={styles.issueDetail}>
                Reported On: {formatDateTime(item.createdAt)}
              </Text>
              <Text style={styles.issueDetail}>Reporter: {item.reporter}</Text>
              <Text style={[styles.issueDetail, { fontWeight: 'bold' }]}>
                Address: {item.reporterUser?.address || 'Not provided'}
              </Text>
              <Text style={[styles.issueDetail, { fontWeight: 'bold' }]}>
                House Number: {item.reporterUser?.houseNumber || 'Not provided'}
              </Text>
              <Text style={styles.issueDetail}>Role: {item.role}</Text>
              <Text style={[styles.issueStatus, { color: '#FF9800' }]}>
                Status: {item.status}
              </Text>
              <Text style={styles.issueDetail}>Type: {item.issueType || 'Unknown'}</Text>
              <TouchableOpacity
                style={styles.resolveButton}
                onPress={() => handleResolveIssue(item._id)}
              >
                <Text style={styles.resolveButtonText}>Resolve Issue</Text>
              </TouchableOpacity>
            </View>
          )}
          ListEmptyComponent={
            <Text style={styles.emptyText}>No open personal issues assigned to you.</Text>
          }
        />
      )}
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
  issueDetail: {
    fontSize: 14,
    color: '#777',
    marginTop: 8,
  },
  issueStatus: {
    fontSize: 14,
    marginTop: 8,
    fontWeight: '600',
  },
  resolveButton: {
    marginTop: 10,
    padding: 10,
    borderRadius: 10,
    alignItems: 'center',
    backgroundColor: '#4CAF50',
  },
  resolveButtonText: {
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
});