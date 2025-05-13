

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

// export default function StaffEvents() {
//   const [staff, setStaff] = useState(null);
//   const [societyName, setSocietyName] = useState('Loading...');
//   const [events, setEvents] = useState([]);
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
//   }
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

//         const eventsResponse = await axios.get(`http://localhost:3000/api/events/staff/${parsedStaff._id}`, {
//           headers: { Authorization: `Bearer ${token}` },
//         });
//         setEvents(eventsResponse.data);

//         console.log('Fetched events:', eventsResponse.data.map(e => ({ _id: e._id, title: e.title, role: e.role })));
//       } catch (error) {
//         console.error('Fetch staff data error:', error);
//         Alert.alert('Error', error.message || 'Failed to load events');
//         setSocietyName('Error loading society');
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchStaffData();
//   }, []);

//   const handleFinishEvent = async (eventId) => {
//     try {
//       const token = await AsyncStorage.getItem('token');
//       const response = await axios.patch(
//         `http://localhost:3000/api/events/${eventId}/finish`,
//         {},
//         { headers: { Authorization: `Bearer ${token}` } }
//       );
//       setEvents(events.filter(event => event._id !== eventId));
//       Alert.alert('Success', response.data.message);
//       console.log('Event finished:', response.data.event);
//     } catch (error) {
//       console.error('Finish event error:', error);
//       Alert.alert('Error', error.response?.data?.message || 'Failed to finish event');
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
//       <Text style={styles.subheading}>Assigned Events</Text>

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

//       <Text style={styles.sectionTitle}>Assigned Events</Text>
//       <FlatList
//         data={events}
//         keyExtractor={(item) => item._id}
//         renderItem={({ item }) => (
//           <View style={styles.eventItem}>
//             <Text style={styles.eventTitle}>{item.title}</Text>
//             <Text style={styles.eventDescription}>{item.description}</Text>
//             {item.image && item.image.startsWith('data:image/') && (
//               <Image
//                 source={{ uri: item.image }}
//                 style={styles.eventImage}
//                 resizeMode="contain"
//                 onError={(e) => console.log('Event image error:', e.nativeEvent.error, 'URL:', item.image)}
//               />
//             )}
//             <Text style={styles.eventDetail}>
//               Event Date: {formatDateTime(item.dateTime)}
//             </Text>
//             <Text style={styles.eventDetail}>
//               Posted On: {formatDateTime(item.createdAt)}
//             </Text>
//             <Text style={styles.eventDetail}>Location: {item.location}</Text>
//             <Text style={styles.eventDetail}>Category: {item.category}</Text>
//             <Text style={styles.eventDetail}>Role: {item.role}</Text>
//             <Text style={[styles.eventStatus, { color: '#FF9800' }]}>
//               Status: {item.status}
//             </Text>
//             <TouchableOpacity
//               style={styles.finishButton}
//               onPress={() => handleFinishEvent(item._id)}
//             >
//               <Text style={styles.finishButtonText}>Finish Event</Text>
//             </TouchableOpacity>
//           </View>
//         )}
//         ListEmptyComponent={
//           <Text style={styles.emptyText}>No open events assigned to you.</Text>
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
//   eventItem: {
//     padding: 20,
//     backgroundColor: '#fff',
//     borderRadius: 10,
//     marginBottom: 15,
//     elevation: 2,
//   },
//   eventTitle: {
//     fontSize: 18,
//     fontWeight: 'bold',
//     color: '#333',
//   },
//   eventDescription: {
//     fontSize: 16,
//     color: '#555',
//     marginTop: 8,
//   },
//   eventImage: {
//     width: '100%',
//     height: 150,
//     borderRadius: 10,
//     marginTop: 8,
//     marginBottom: 8,
//   },
//   eventDetail: {
//     fontSize: 14,
//     color: '#777',
//     marginTop: 8,
//   },
//   eventStatus: {
//     fontSize: 14,
//     marginTop: 8,
//     fontWeight: '600',
//   },
//   finishButton: {
//     marginTop: 10,
//     padding: 10,
//     borderRadius: 10,
//     alignItems: 'center',
//     backgroundColor: '#FF4444',
//   },
//   finishButtonText: {
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

export default function StaffEvents() {
  const [staff, setStaff] = useState(null);
  const [societyName, setSocietyName] = useState('Loading...');
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const fetchStaffData = async () => {
      try {
        const staffData = await AsyncStorage.getItem('staff');
        const token = await AsyncStorage.getItem('token');

        console.log('Events.js - staffData:', staffData);
        console.log('Events.js - token:', token);

        if (!staffData || !token) {
          Alert.alert('Error', 'No staff data found. Please log in again.');
          router.replace('/StaffLoginScreen');
          return;
        }

        const parsedStaff = JSON.parse(staffData);
        setStaff(parsedStaff);
        console.log('Events.js - parsedStaff:', { _id: parsedStaff._id, role: parsedStaff.role, society: parsedStaff.society });

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
        console.log('Events.js - society:', societyData);

        const eventsResponse = await axios.get(`http://localhost:3000/api/events/staff/${parsedStaff._id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        console.log('Events.js - eventsResponse:', { status: eventsResponse.status, data: eventsResponse.data });
        setEvents(eventsResponse.data);

        console.log('Fetched events:', eventsResponse.data.map(e => ({ 
          _id: e._id, 
          title: e.title, 
          role: e.role, 
          status: e.status, 
          organizer: e.organizer, 
          dateTime: e.dateTime,
          society: e.society
        })));
      } catch (error) {
        console.error('Fetch staff data error:', error);
        Alert.alert('Error', error.response?.data?.message || error.message || 'Failed to load events');
        setSocietyName('Error loading society');
      } finally {
        setLoading(false);
      }
    };

    fetchStaffData();
  }, []);

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
      <Text style={styles.subheading}>Assigned Events</Text>

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

      <Text style={styles.sectionTitle}>Assigned Events</Text>
      <FlatList
        data={events}
        keyExtractor={(item) => item._id}
        renderItem={({ item }) => (
          <View style={styles.eventItem}>
            <Text style={styles.eventTitle}>{item.title}</Text>
            <Text style={styles.eventDescription}>{item.description}</Text>
            {item.image && (
              <Image
                source={{ uri: item.image.startsWith('data:image/') ? item.image : `http://localhost:3000${item.image}` }}
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
          </View>
        )}
        ListEmptyComponent={
          <Text style={styles.emptyText}>No open events assigned to you.</Text>
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
  emptyText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginTop: 20,
  },
});