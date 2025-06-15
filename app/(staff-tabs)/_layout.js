

// import { Tabs } from 'expo-router';
// import { MaterialIcons } from '@expo/vector-icons';

// export default function StaffTabsLayout() {
//   return (
//     <Tabs
//       screenOptions={{
//         headerShown: false,
//         tabBarActiveTintColor: '#007bff',
//         tabBarInactiveTintColor: '#666',
//         tabBarStyle: {
//           backgroundColor: '#fff',
//           borderTopWidth: 1,
//           borderTopColor: '#eee',
//         },
//       }}
//     >
//       <Tabs.Screen
//         name="Issues"
//         options={{
//           title: 'Issues',
//           tabBarIcon: ({ color, size }) => (
//             <MaterialIcons name="report-problem" size={size} color={color} />
//           ),
//         }}
//       />
//       <Tabs.Screen
//         name="Events"
//         options={{
//           title: 'Events',
//           tabBarIcon: ({ color, size }) => (
//             <MaterialIcons name="event" size={size} color={color} />
//           ),
//         }}
//       />
//       <Tabs.Screen
//         name="PersonalIssues"
//         options={{
//           title: 'Personal Issues',
//           tabBarIcon: ({ color, size }) => (
//             <MaterialIcons name="person" size={size} color={color} />
//           ),
//         }}
//       />
//     </Tabs>
//   );
// }

import { Tabs } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useEffect, useState } from 'react';

export default function StaffTabsLayout() {
  const [userType, setUserType] = useState('staff');

  useEffect(() => {
    const checkUserType = async () => {
      try {
        const storedUserType = await AsyncStorage.getItem('userType');
        if (storedUserType) {
          setUserType(storedUserType);
          console.log('StaffTabsLayout - userType:', storedUserType);
        }
      } catch (error) {
        console.error('Error fetching userType:', error);
      }
    };
    checkUserType();
  }, []);

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: '#007bff',
        tabBarInactiveTintColor: '#666',
        tabBarStyle: {
          backgroundColor: '#fff',
          borderTopWidth: 1,
          borderTopColor: '#eee',
          height: 60,
          paddingBottom: 5,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          marginBottom: 5,
        },
      }}
    >
      <Tabs.Screen
        name="Issues"
        options={{
          title: 'Issues',
          tabBarIcon: ({ color, size }) => (
            <MaterialIcons name="report-problem" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="Events"
        options={{
          title: 'Events',
          tabBarIcon: ({ color, size }) => (
            <MaterialIcons name="event" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="PersonalIssues"
        options={{
          title: 'Personal Issues',
          tabBarIcon: ({ color, size }) => (
            <MaterialIcons name="person" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="chat"
        options={{
          title: 'Chat',
          tabBarIcon: ({ color, size }) => (
            <MaterialIcons name="chat" size={size} color={color} />
          ),
        }}
        initialParams={{ userType: 'staff' }}
      />
    </Tabs>
  );
}