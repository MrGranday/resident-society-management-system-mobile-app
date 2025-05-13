import React from 'react';
   import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
   import { useRouter, useLocalSearchParams } from 'expo-router';
   import { LinearGradient } from 'expo-linear-gradient';
   import { MaterialIcons } from '@expo/vector-icons';

   export default function VerificationSuccessScreen() {
     const router = useRouter();
     const { message, email } = useLocalSearchParams();

     return (
       <LinearGradient colors={['#14B8A6', '#0F766E']} style={styles.container}>
         <View style={styles.content}>
           <MaterialIcons name="check-circle" size={80} color="#E0F2FE" style={styles.icon} />
           <Text style={styles.title}>Email Verified</Text>
           <Text style={styles.message}>
             {message || `Your email ${email} has been verified successfully. Your registration is pending manager approval.`}
           </Text>
           <TouchableOpacity
             style={styles.button}
             onPress={() => router.push('/LoginScreen')}
           >
             <LinearGradient
               colors={['#F472B6', '#EC4899']}
               style={StyleSheet.absoluteFill}
             />
             <Text style={styles.buttonText}>Go to Login</Text>
           </TouchableOpacity>
         </View>
       </LinearGradient>
     );
   }

   const styles = StyleSheet.create({
     container: {
       flex: 1,
       justifyContent: 'center',
       alignItems: 'center',
     },
     content: {
       padding: 24,
       alignItems: 'center',
       width: '90%',
     },
     icon: {
       marginBottom: 24,
     },
     title: {
       fontSize: 28,
       fontWeight: 'bold',
       color: '#F0FDFA',
       marginBottom: 16,
       textAlign: 'center',
     },
     message: {
       fontSize: 16,
       color: '#E0F2FE',
       textAlign: 'center',
       marginBottom: 32,
     },
     button: {
       width: '100%',
       height: 56,
       justifyContent: 'center',
       alignItems: 'center',
       borderRadius: 12,
       overflow: 'hidden',
       elevation: 3,
       shadowColor: '#000',
       shadowOffset: { width: 0, height: 2 },
       shadowOpacity: 0.2,
       shadowRadius: 4,
     },
     buttonText: {
       fontSize: 18,
       fontWeight: 'bold',
       color: '#FFFFFF',
       zIndex: 1,
     },
   });