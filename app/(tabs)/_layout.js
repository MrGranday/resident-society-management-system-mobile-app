// // import { Tabs } from 'expo-router';
// // import { MaterialIcons, FontAwesome } from '@expo/vector-icons';
// // import AsyncStorage from '@react-native-async-storage/async-storage';
// // import { Alert, TouchableOpacity } from 'react-native';
// // import { router } from 'expo-router';

// // export default function TabsLayout() {
  

// //   return (
// //     <Tabs
// //       screenOptions={{
// //         headerShown: false,
// //         tabBarActiveTintColor: '#4CAF50',
// //         tabBarInactiveTintColor: '#666',
// //         tabBarStyle: {
// //           backgroundColor: '#fff',
// //           borderTopWidth: 1,
// //           borderTopColor: '#eee',
// //           height: 60,
// //           paddingBottom: 5,
// //         },
// //         tabBarLabelStyle: {
// //           fontSize: 12,
// //           marginBottom: 5,
// //         },
// //       }}
// //     >
// //       <Tabs.Screen
// //         name="index"
// //         options={{
// //           title: 'Home',
// //           tabBarIcon: ({ color, size }) => (
// //             <MaterialIcons name="home" size={size} color={color} />
// //           ),
// //         }}
// //       />
// //       <Tabs.Screen
// //         name="report"
// //         options={{
// //           title: 'Report',
// //           tabBarIcon: ({ color, size }) => (
// //             <MaterialIcons name="report-problem" size={size} color={color} />
// //           ),
// //         }}
// //       />
// //       <Tabs.Screen
// //         name="history"
// //         options={{
// //           title: 'History',
// //           tabBarIcon: ({ color, size }) => (
// //             <MaterialIcons name="history" size={size} color={color} />
// //           ),
// //         }}
// //       />
// //       <Tabs.Screen
// //         name="account"
// //         options={{
// //           title: 'Account',
// //           tabBarIcon: ({ color, size }) => (
// //             <FontAwesome name="user-circle" size={size} color={color} />
// //           ),
// //         }}
// //       />
     
// //     </Tabs>
// //   );
// // }

// import { Tabs } from 'expo-router';
// import { MaterialIcons, FontAwesome } from '@expo/vector-icons';
// import AsyncStorage from '@react-native-async-storage/async-storage';
// import { Alert, TouchableOpacity } from 'react-native';
// import { router } from 'expo-router';

// export default function TabsLayout() {
//   return (
//     <Tabs
//       screenOptions={{
//         headerShown: false,
//         tabBarActiveTintColor: '#4CAF50',
//         tabBarInactiveTintColor: '#666',
//         tabBarStyle: {
//           backgroundColor: '#fff',
//           borderTopWidth: 1,
//           borderTopColor: '#eee',
//           height: 60,
//           paddingBottom: 5,
//         },
//         tabBarLabelStyle: {
//           fontSize: 12,
//           marginBottom: 5,
//         },
//       }}
//     >
//       <Tabs.Screen
//         name="index"
//         options={{
//           title: 'Home',
//           tabBarIcon: ({ color, size }) => (
//             <MaterialIcons name="home" size={size} color={color} />
//           ),
//         }}
//       />
//       <Tabs.Screen
//         name="report"
//         options={{
//           title: 'Report',
//           tabBarIcon: ({ color, size }) => (
//             <MaterialIcons name="report-problem" size={size} color={color} />
//           ),
//         }}
//       />
//       <Tabs.Screen
//         name="history"
//         options={{
//           title: 'History',
//           tabBarIcon: ({ color, size }) => (
//             <MaterialIcons name="history" size={size} color={color} />
//           ),
//         }}
//       />
//       <Tabs.Screen
//         name="events"
//         options={{
//           title: 'Events',
//           tabBarIcon: ({ color, size }) => (
//             <MaterialIcons name="event" size={size} color={color} />
//           ),
//         }}
//       />
//       <Tabs.Screen
//         name="account"
//         options={{
//           title: 'Account',
//           tabBarIcon: ({ color, size }) => (
//             <FontAwesome name="user-circle" size={size} color={color} />
//           ),
//         }}
//       />
//     </Tabs>
//   );
// }

import { Tabs } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Alert, TouchableOpacity } from 'react-native';
import { router } from 'expo-router';

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: '#4CAF50',
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
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color, size }) => (
            <MaterialIcons name="home" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="report"
        options={{
          title: 'Report',
          tabBarIcon: ({ color, size }) => (
            <MaterialIcons name="report-problem" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="history"
        options={{
          title: 'History',
          tabBarIcon: ({ color, size }) => (
            <MaterialIcons name="history" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="events"
        options={{
          title: 'Events',
          tabBarIcon: ({ color, size }) => (
            <MaterialIcons name="event" size={size} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}