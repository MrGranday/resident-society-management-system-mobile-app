


// import React, { useEffect, useState } from 'react';
// import { StyleSheet, View, Text, FlatList, TouchableOpacity, Image, Alert, Platform, Modal } from 'react-native';
// import axios from 'axios';
// import AsyncStorage from '@react-native-async-storage/async-storage';
// import { useRouter } from 'expo-router';
// import { MaterialIcons, FontAwesome } from '@expo/vector-icons';

// export default function HomeScreen() {
//   const [issues, setIssues] = useState([]);
//   const [filteredIssues, setFilteredIssues] = useState([]);
//   const [filterStatus, setFilterStatus] = useState('Open');
//   const [user, setUser] = useState(null);
//   const [notificationCount, setNotificationCount] = useState(0);
//   const [logoutModalVisible, setLogoutModalVisible] = useState(false); // New state for modal
//   const router = useRouter();

//   useEffect(() => {
//     loadUserData();
//     fetchIssues();
//   }, []);

//   const loadUserData = async () => {
//     try {
//       const userData = await AsyncStorage.getItem('user');
//       if (userData) {
//         const parsedUser = JSON.parse(userData);
//         setUser(parsedUser);
//       } else {
//         Alert.alert('Error', 'Session expired. Please log in again.');
//         await AsyncStorage.removeItem('token');
//         await AsyncStorage.removeItem('user');
//         router.replace('/LoginScreen');
//       }
//     } catch (error) {
//       console.error('Failed to load user data:', error);
//       Alert.alert('Error', 'Failed to load user data. Please log in again.');
//       router.replace('/LoginScreen');
//     }
//   };

//   const fetchIssues = async () => {
//     try {
//       const token = await AsyncStorage.getItem('token');
//       const response = await axios.get('http://localhost:3000/api/issues', {
//         headers: { Authorization: `Bearer ${token}` },
//       });
//       const fetchedIssues = response.data;
//       console.log('Fetched issues:', fetchedIssues.map(issue => ({ _id: issue._id, status: issue.status, role: issue.role, image: !!issue.image, createdAt: issue.createdAt })));
//       setIssues(fetchedIssues);
//       applyFilter(filterStatus, fetchedIssues);
//       updateNotifications(fetchedIssues);
//     } catch (error) {
//       console.error('Failed to fetch issues:', error);
//       if (error.response?.status === 401) {
//         await AsyncStorage.removeItem('token');
//         await AsyncStorage.removeItem('user');
//         router.replace('/LoginScreen');
//       } else {
//         Alert.alert('Error', 'Failed to fetch issues');
//       }
//     }
//   };

//   const applyFilter = (status, issuesToFilter = issues) => {
//     console.log('Applying filter:', status);
//     setFilterStatus(status);
//     const filtered = issuesToFilter.filter(issue => {
//       const issueStatus = issue.status ? issue.status.trim().toLowerCase() : '';
//       const filterStatusLower = status.toLowerCase();
//       return issueStatus === filterStatusLower && issueStatus !== 'resolved';
//     });
//     filtered.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
//     console.log('Filtered issues:', filtered.map(issue => ({ _id: issue._id, status: issue.status, createdAt: issue.createdAt })));
//     setFilteredIssues(filtered);
//     setNotificationCount(filtered.length);
//   };

//   const updateNotifications = async (issuesToCheck) => {
//     try {
//       const lastViewed = await AsyncStorage.getItem('lastIssueView');
//       const lastViewedTime = lastViewed ? new Date(lastViewed) : new Date(0);
//       let count = 0;

//       issuesToCheck.forEach(issue => {
//         if (new Date(issue.createdAt) > lastViewedTime && issue.status !== 'Resolved') {
//           count++;
//         }
//       });

//       setNotificationCount(count);
//       await AsyncStorage.setItem('lastIssueView', new Date().toISOString());
//     } catch (error) {
//       console.error('Failed to update notifications:', error);
//     }
//   };

//   const handleLogout = async () => {
//     console.log('handleLogout called');
//     try {
//       console.log('Starting logout process...');
//       await AsyncStorage.removeItem('token');
//       console.log('Token removed');
//       await AsyncStorage.removeItem('user');
//       console.log('User removed');
//       console.log('Navigating to /LoginScreen');
//       router.push('/LoginScreen');
//       console.log('Navigation command executed');
//     } catch (error) {
//       console.error('Failed to logout:', error);
//       Alert.alert('Error', 'Failed to logout');
//     }
//   };

//   const getInitials = (name) => {
//     if (!name) return 'R';
//     const names = name.trim().split(' ');
//     return names.map(n => n[0]).slice(0, 2).join('').toUpperCase();
//   };

//   return (
//     <View style={styles.container}>
//       <View style={styles.header}>
//         <Text style={styles.headerTitle}>Issue Dashboard</Text>
//         <TouchableOpacity
//           style={styles.logoutButton}
//           onPress={() => {
//             console.log('Logout button pressed');
//             setLogoutModalVisible(true); // Show modal instead of window.confirm
//           }}
//         >
//           <FontAwesome name="sign-out" size={24} color="#FF4444" />
//         </TouchableOpacity>
//       </View>

//       {user && (
//         <View style={styles.welcomeCard}>
//           <View style={styles.avatar}>
//             <Text style={styles.avatarText}>{getInitials(user.name)}</Text>
//           </View>
//           <View style={styles.welcomeContent}>
//             <Text style={styles.welcomeText}>
//               Welcome, {user.name || 'Resident'}!
//             </Text>
//             <Text style={styles.welcomeSubText}>
//               View and report community issues below.
//             </Text>
//           </View>
//           {notificationCount > 0 && (
//             <View style={styles.notificationBadge}>
//               <Text style={styles.notificationText}>{notificationCount}</Text>
//             </View>
//           )}
//         </View>
//       )}

//       <Text style={styles.title}>Reported Issues About Society</Text>

//       <View style={styles.filterContainer}>
//         {['Open', 'Under Review'].map(status => (
//           <TouchableOpacity
//             key={status}
//             style={[
//               styles.filterButton,
//               filterStatus === status && styles.filterButtonActive,
//             ]}
//             onPress={() => applyFilter(status)}
//           >
//             <Text
//               style={[
//                 styles.filterButtonText,
//                 filterStatus === status && styles.filterButtonTextActive,
//               ]}
//             >
//               {status}
//             </Text>
//           </TouchableOpacity>
//         ))}
//       </View>

//       <FlatList
//         data={filteredIssues}
//         keyExtractor={(item) => item._id}
//         renderItem={({ item }) => (
//           <View style={styles.issueItem}>
//             <Text style={styles.issueTitle}>{item.title}</Text>
//             <Text style={styles.issueDescription}>{item.description}</Text>
//             {item.image && (
//               <Image
//                 source={{ uri: item.image }}
//                 style={styles.issueImage}
//                 resizeMode="contain"
//                 onError={() => console.log('Failed to load issue image')}
//               />
//             )}
//             <Text style={styles.issueReporter}>Reported by: {item.reporter}</Text>
//             <Text style={styles.issueRole}>Assigned to: {item.role}</Text>
//             <Text
//               style={[
//                 styles.issueStatus,
//                 {
//                   color: item.status === 'Under Review' ? '#007bff' : '#FF9800',
//                 },
//               ]}
//             >
//               Status: {item.status}
//             </Text>
//           </View>
//         )}
//         ListEmptyComponent={
//           <Text style={styles.emptyText}>No issues found for this filter.</Text>
//         }
//         contentContainerStyle={styles.flatListContent}
//       />

//       {/* Logout Confirmation Modal */}
//       <Modal
//         animationType="slide"
//         transparent={true}
//         visible={logoutModalVisible}
//         onRequestClose={() => setLogoutModalVisible(false)}
//       >
//         <View style={styles.modalContainer}>
//           <View style={styles.modalContent}>
//             <Text style={styles.modalTitle}>Confirm Logout</Text>
//             <Text style={styles.modalText}>
//               Are you sure you want to log out?
//             </Text>
//             <View style={styles.modalButtonContainer}>
//               <TouchableOpacity
//                 style={[styles.modalButton, styles.cancelButton]}
//                 onPress={() => {
//                   console.log('Logout cancelled');
//                   setLogoutModalVisible(false);
//                 }}
//               >
//                 <Text style={styles.modalButtonText}>Cancel</Text>
//               </TouchableOpacity>
//               <TouchableOpacity
//                 style={[styles.modalButton, styles.confirmButton]}
//                 onPress={() => {
//                   setLogoutModalVisible(false);
//                   handleLogout();
//                 }}
//               >
//                 <Text style={styles.modalButtonText}>Confirm</Text>
//               </TouchableOpacity>
//             </View>
//           </View>
//         </View>
//       </Modal>
//     </View>
//   );
// }

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     backgroundColor: '#f5f5f5',
//     paddingTop: 40,
//   },
//   header: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     justifyContent: 'space-between',
//     paddingHorizontal: 20,
//     paddingVertical: 10,
//     backgroundColor: '#fff',
//     borderBottomWidth: 1,
//     borderBottomColor: '#eee',
//   },
//   headerTitle: {
//     fontSize: 24,
//     fontWeight: 'bold',
//     color: '#333',
//   },
//   logoutButton: {
//     padding: 10,
//   },
//   welcomeCard: {
//     backgroundColor: '#fff',
//     borderRadius: 10,
//     padding: 20,
//     margin: 20,
//     elevation: 2,
//     flexDirection: 'row',
//     alignItems: 'center',
//     position: 'relative',
//   },
//   avatar: {
//     width: 50,
//     height: 50,
//     borderRadius: 25,
//     backgroundColor: '#007bff',
//     justifyContent: 'center',
//     alignItems: 'center',
//     marginRight: 15,
//   },
//   avatarText: {
//     fontSize: 20,
//     fontWeight: 'bold',
//     color: '#fff',
//   },
//   welcomeContent: {
//     flex: 1,
//   },
//   welcomeText: {
//     fontSize: 22,
//     fontWeight: 'bold',
//     color: '#007bff',
//     marginBottom: 8,
//   },
//   welcomeSubText: {
//     fontSize: 16,
//     color: '#666',
//   },
//   notificationBadge: {
//     position: 'absolute',
//     top: 10,
//     right: 10,
//     backgroundColor: '#FF4444',
//     borderRadius: 12,
//     minWidth: 24,
//     height: 24,
//     justifyContent: 'center',
//     alignItems: 'center',
//     paddingHorizontal: 6,
//   },
//   notificationText: {
//     fontSize: 14,
//     color: '#fff',
//     fontWeight: 'bold',
//   },
//   title: {
//     fontSize: 28,
//     fontWeight: 'bold',
//     textAlign: 'center',
//     marginVertical: 20,
//     color: '#333',
//   },
//   filterContainer: {
//     flexDirection: 'row',
//     justifyContent: 'center',
//     marginBottom: 20,
//   },
//   filterButton: {
//     paddingVertical: 8,
//     paddingHorizontal: 20,
//     borderRadius: 20,
//     backgroundColor: '#eee',
//     marginHorizontal: 5,
//   },
//   filterButtonActive: {
//     backgroundColor: '#4CAF50',
//   },
//   filterButtonText: {
//     fontSize: 16,
//     color: '#333',
//     fontWeight: '500',
//   },
//   filterButtonTextActive: {
//     color: '#fff',
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
//   emptyText: {
//     fontSize: 16,
//     color: '#666',
//     textAlign: 'center',
//     marginTop: 20,
//   },
//   flatListContent: {
//     paddingHorizontal: 20,
//     paddingBottom: 20,
//   },
//   // Modal styles (copied from SignupScreen.js)
//   modalContainer: {
//     flex: 1,
//     justifyContent: 'center',
//     alignItems: 'center',
//     backgroundColor: 'rgba(0, 0, 0, 0.5)',
//   },
//   modalContent: {
//     width: '85%',
//     backgroundColor: '#fff',
//     borderRadius: 10,
//     padding: 20,
//     elevation: 2,
//   },
//   modalTitle: {
//     fontSize: 22,
//     fontWeight: 'bold',
//     color: '#333',
//     marginBottom: 10,
//   },
//   modalText: {
//     fontSize: 16,
//     color: '#666',
//     textAlign: 'center',
//     marginBottom: 20,
//   },
//   modalButtonContainer: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     width: '100%',
//   },
//   modalButton: {
//     flex: 1,
//     padding: 10,
//     borderRadius: 10,
//     marginHorizontal: 5,
//     alignItems: 'center',
//   },
//   cancelButton: {
//     backgroundColor: '#6c757d',
//   },
//   confirmButton: {
//     backgroundColor: '#007bff',
//   },
//   modalButtonText: {
//     fontSize: 16,
//     fontWeight: 'bold',
//     color: '#fff',
//   },
// });

import React, { useEffect, useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  FlatList,
  TouchableOpacity,
  Image,
  Alert,
  Modal,
  Animated,
} from 'react-native';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';

export default function HomeScreen() {
  const [issues, setIssues] = useState([]);
  const [filteredIssues, setFilteredIssues] = useState([]);
  const [filterStatus, setFilterStatus] = useState('Open');
  const [user, setUser] = useState(null);
  const [notificationCount, setNotificationCount] = useState(0);
  const [menuVisible, setMenuVisible] = useState(false);
  const [logoutModalVisible, setLogoutModalVisible] = useState(false);
  const [menuSlide] = useState(new Animated.Value(300));
  const router = useRouter();

  useEffect(() => {
    loadUserData();
    fetchIssues();
  }, []);

  const loadUserData = async () => {
    try {
      const userData = await AsyncStorage.getItem('user');
      if (userData) {
        const parsedUser = JSON.parse(userData);
        setUser(parsedUser);
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

  const fetchIssues = async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      const response = await axios.get('http://localhost:3000/api/issues', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const fetchedIssues = response.data;
      console.log(
        'Fetched issues:',
        fetchedIssues.map(issue => ({
          _id: issue._id,
          status: issue.status,
          role: issue.role,
          image: !!issue.image,
          createdAt: issue.createdAt,
        }))
      );
      setIssues(fetchedIssues);
      applyFilter(filterStatus, fetchedIssues);
      updateNotifications(fetchedIssues);
    } catch (error) {
      console.error('Failed to fetch issues:', error);
      if (error.response?.status === 401) {
        await AsyncStorage.removeItem('token');
        await AsyncStorage.removeItem('user');
        router.replace('/LoginScreen');
      } else {
        Alert.alert('Error', 'Failed to fetch issues');
      }
    }
  };

  const applyFilter = (status, issuesToFilter = issues) => {
    console.log('Applying filter:', status);
    setFilterStatus(status);
    const filtered = issuesToFilter.filter(issue => {
      const issueStatus = issue.status ? issue.status.trim().toLowerCase() : '';
      const filterStatusLower = status.toLowerCase();
      return issueStatus === filterStatusLower && issueStatus !== 'resolved';
    });
    filtered.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    console.log(
      'Filtered issues:',
      filtered.map(issue => ({ _id: issue._id, status: issue.status, createdAt: issue.createdAt }))
    );
    setFilteredIssues(filtered);
    setNotificationCount(filtered.length);
  };

  const updateNotifications = async (issuesToCheck) => {
    try {
      const lastViewed = await AsyncStorage.getItem('lastIssueView');
      const lastViewedTime = lastViewed ? new Date(lastViewed) : new Date(0);
      let count = 0;

      issuesToCheck.forEach(issue => {
        if (new Date(issue.createdAt) > lastViewedTime && issue.status !== 'Resolved') {
          count++;
        }
      });

      setNotificationCount(count);
      await AsyncStorage.setItem('lastIssueView', new Date().toISOString());
    } catch (error) {
      console.error('Failed to update notifications:', error);
    }
  };

  const handleLogout = async () => {
    console.log('handleLogout called');
    try {
      console.log('Starting logout process...');
      await AsyncStorage.removeItem('token');
      console.log('Token removed');
      await AsyncStorage.removeItem('user');
      console.log('User removed');
      console.log('Navigating to /LoginScreen');
      router.push('/LoginScreen');
      console.log('Navigation command executed');
    } catch (error) {
      console.error('Failed to logout:', error);
      Alert.alert('Error', 'Failed to logout');
    }
  };

  const toggleMenu = () => {
    if (menuVisible) {
      Animated.timing(menuSlide, {
        toValue: 300,
        duration: 300,
        useNativeDriver: true,
      }).start(() => setMenuVisible(false));
    } else {
      setMenuVisible(true);
      Animated.timing(menuSlide, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }).start();
    }
  };

  const getInitials = (name) => {
    if (!name) return 'R';
    const names = name.trim().split(' ');
    return names.map(n => n[0]).slice(0, 2).join('').toUpperCase();
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Issue Dashboard</Text>
        <TouchableOpacity style={styles.menuButton} onPress={toggleMenu}>
          <MaterialIcons name="menu" size={24} color="#333" />
        </TouchableOpacity>
      </View>

      {user && (
        <View style={styles.welcomeCard}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{getInitials(user.name)}</Text>
          </View>
          <View style={styles.welcomeContent}>
            <Text style={styles.welcomeText}>
              Welcome, {user.name || 'Resident'}!
            </Text>
            <Text style={styles.welcomeSubText}>
              View and report community issues below.
            </Text>
          </View>
          {notificationCount > 0 && (
            <View style={styles.notificationBadge}>
              <Text style={styles.notificationText}>{notificationCount}</Text>
            </View>
          )}
        </View>
      )}

      <Text style={styles.title}>Reported Issues About Society</Text>

      <View style={styles.filterContainer}>
        {['Open', 'Under Review'].map(status => (
          <TouchableOpacity
            key={status}
            style={[
              styles.filterButton,
              filterStatus === status && styles.filterButtonActive,
            ]}
            onPress={() => applyFilter(status)}
          >
            <Text
              style={[
                styles.filterButtonText,
                filterStatus === status && styles.filterButtonTextActive,
              ]}
            >
              {status}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <FlatList
        data={filteredIssues}
        keyExtractor={item => item._id}
        renderItem={({ item }) => (
          <View style={styles.issueItem}>
            <Text style={styles.issueTitle}>{item.title}</Text>
            <Text style={styles.issueDescription}>{item.description}</Text>
            {item.image && (
              <Image
                source={{ uri: item.image }}
                style={styles.issueImage}
                resizeMode="contain"
                onError={() => console.log('Failed to load issue image')}
              />
            )}
            <Text style={styles.issueReporter}>Reported by: {item.reporter}</Text>
            <Text style={styles.issueRole}>Assigned to: {item.role}</Text>
            <Text
              style={[
                styles.issueStatus,
                {
                  color: item.status === 'Under Review' ? '#007bff' : '#FF9800',
                },
              ]}
            >
              Status: {item.status}
            </Text>
          </View>
        )}
        ListEmptyComponent={
          <Text style={styles.emptyText}>No issues found for this filter.</Text>
        }
        contentContainerStyle={styles.flatListContent}
      />

      {/* Hamburger Menu Modal */}
      <Modal
        animationType="none"
        transparent={true}
        visible={menuVisible}
        onRequestClose={toggleMenu}
      >
        <TouchableOpacity
          style={styles.menuOverlay}
          activeOpacity={1}
          onPress={toggleMenu}
        >
          <Animated.View
            style={[
              styles.menuContainer,
              { transform: [{ translateX: menuSlide }] },
            ]}
          >
            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => {
                toggleMenu();
                router.push('/account');
              }}
            >
              <MaterialIcons name="account-circle" size={24} color="#333" />
              <Text style={styles.menuItemText}>Account</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => {
                toggleMenu();
                router.push('/Announcements');
              }}
            >
              <MaterialIcons name="announcement" size={24} color="#333" />
              <Text style={styles.menuItemText}>Announcements</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => {
                toggleMenu();
                setLogoutModalVisible(true);
              }}
            >
              <MaterialIcons name="logout" size={24} color="#FF4444" />
              <Text style={styles.menuItemText}>Logout</Text>
            </TouchableOpacity>
          </Animated.View>
        </TouchableOpacity>
      </Modal>

      {/* Logout Confirmation Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={logoutModalVisible}
        onRequestClose={() => setLogoutModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Confirm Logout</Text>
            <Text style={styles.modalText}>
              Are you sure you want to log out?
            </Text>
            <View style={styles.modalButtonContainer}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => {
                  console.log('Logout cancelled');
                  setLogoutModalVisible(false);
                }}
              >
                <Text style={styles.modalButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.confirmButton]}
                onPress={() => {
                  setLogoutModalVisible(false);
                  handleLogout();
                }}
              >
                <Text style={styles.modalButtonText}>Confirm</Text>
              </TouchableOpacity>
            </View>
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
    paddingTop: 40,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
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
  menuButton: {
    padding: 10,
  },
  welcomeCard: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 20,
    margin: 20,
    elevation: 2,
    flexDirection: 'row',
    alignItems: 'center',
    position: 'relative',
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#007bff',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  avatarText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
  },
  welcomeContent: {
    flex: 1,
  },
  welcomeText: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#007bff',
    marginBottom: 8,
  },
  welcomeSubText: {
    fontSize: 16,
    color: '#666',
  },
  notificationBadge: {
    position: 'absolute',
    top: 10,
    right: 10,
    backgroundColor: '#FF4444',
    borderRadius: 12,
    minWidth: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 6,
  },
  notificationText: {
    fontSize: 14,
    color: '#fff',
    fontWeight: 'bold',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'center',
    marginVertical: 20,
    color: '#333',
  },
  filterContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 20,
  },
  filterButton: {
    paddingVertical: 8,
    paddingHorizontal: 20,
    borderRadius: 20,
    backgroundColor: '#eee',
    marginHorizontal: 5,
  },
  filterButtonActive: {
    backgroundColor: '#4CAF50',
  },
  filterButtonText: {
    fontSize: 16,
    color: '#333',
    fontWeight: '500',
  },
  filterButtonTextActive: {
    color: '#fff',
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
  menuOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  menuContainer: {
    position: 'absolute',
    right: 0,
    top: 0,
    bottom: 0,
    width: 250,
    backgroundColor: '#fff',
    paddingTop: 60,
    paddingHorizontal: 20,
    elevation: 5,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  menuItemText: {
    fontSize: 18,
    color: '#333',
    marginLeft: 15,
  },
});