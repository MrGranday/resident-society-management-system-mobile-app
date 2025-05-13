

// import { Stack } from 'expo-router';

// export default function Layout() {
//   return (
//     <Stack screenOptions={{ headerShown: false }}>
//       <Stack.Screen name="index" options={{ headerShown: false }} />
//       <Stack.Screen name="LoginScreen" options={{ headerShown: false }} />
//       <Stack.Screen name="StaffLoginScreen" options={{ headerShown: false }} />
//       <Stack.Screen name="StaffDashboard" options={{ headerShown: false }} />
//       <Stack.Screen name="StaffAccountManagementScreen" options={{ headerShown: false }} />
//       <Stack.Screen name="SignupScreen" options={{ headerShown: false }} />
//       <Stack.Screen name="VerificationSentScreen" options={{ headerShown: false }} />
//       <Stack.Screen name="VerificationSuccessScreen" options={{ headerShown: false }} />
//       <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
//     </Stack>
//   );
// }

import { Stack } from 'expo-router';

export default function Layout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" options={{ headerShown: false }} />
      <Stack.Screen name="LoginScreen" options={{ headerShown: false }} />
      <Stack.Screen name="StaffLoginScreen" options={{ headerShown: false }} />
      <Stack.Screen name="StaffAccountManagementScreen" options={{ headerShown: false }} />
      <Stack.Screen name="SignupScreen" options={{ headerShown: false }} />
      <Stack.Screen name="VerificationSentScreen" options={{ headerShown: false }} />
      <Stack.Screen name="VerificationSuccessScreen" options={{ headerShown: false }} />
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen name="(staff-tabs)" options={{ headerShown: false }} />
    </Stack>
  );
}