import React, { useState } from 'react';
import { SafeAreaView, StyleSheet, TextInput, Text, TouchableOpacity, View, StatusBar } from 'react-native';

export default function Verification({ route, navigation }) {
  const { email, code } = route.params;
  const [vercode, setVerCode] = useState('');

  const handleNext = async ()  => {
    if (vercode === code) { 
      // Navigate to SignUpFormScreen after successful verification
      navigation.navigate('SignUpName', {email});
    } else {
      alert('Invalid code, please try again.');
    }
  };

  const handleResendPress = async () => {
    
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar 
        barStyle="dark-content"
        translucent={false}
        backgroundColor="transparent" 
      />
      <Text style={styles.title}>Verification</Text>
      <Text style={styles.subtitle}>Enter the 4-digit code sent to: {email}</Text>

      {/* Code Input */}
      <TextInput
        style={styles.input}
        placeholder="Enter Code"
        keyboardType="numeric"
        maxLength={4}
        value={vercode} 
        onChangeText={setVerCode}
      />

      {/* Resend and Next Section */}
      <View style={styles.resendContainer}>
        <Text>Didn't receive the code? </Text>
        <Text style={styles.resendText} onPress={handleResendPress}>Resend</Text>
      </View>

      {/* Next Button */}
      <TouchableOpacity onPress={handleNext} style={styles.button}>
        <Text style={styles.buttonText}>Next</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 16,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 20,
  },
  subtitle: {
    fontSize: 16,
    color: '#000',
    marginBottom: 30,
    textAlign: 'center',
  },
  input: {
    width: '80%',
    height: 50,
    borderColor: '#000',
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 16,
    marginBottom: 20,
    textAlign: 'center',
  },
  resendContainer: {
    flexDirection: 'row',
    marginBottom: 30,
  },
  resendText: {
    color: '#9B51E0',
    fontWeight: 'bold',
  },
  button: {
    width: '80%',
    height: 50,
    backgroundColor: '#9B51E0',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 10,
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
});
