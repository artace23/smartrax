import React, { useState } from 'react';
import { SafeAreaView, StyleSheet, TextInput, Text, TouchableOpacity, View, StatusBar } from 'react-native';
import CheckBox from 'expo-checkbox';
import { db, addDoc, collection, serverTimestamp } from './backend/firebase';

export default function SignUpPassword({ route, navigation }) {
  // State to hold password, confirm password, and checkbox status
  const { email, fullName, gender, birthdate } = route.params;
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isAgreed, setIsAgreed] = useState(false);
  const [isError, setIsError] = useState(false);
  const balance = 0; // Changed from { balance } to const balance

  // Handle the form submission (registration logic)
  const handleRegister = async () => {
    if (password !== confirmPassword) {
      alert('Passwords do not match');
      return;
    }

    // Ensure terms and conditions are agreed to
    if (!isAgreed) {
      alert('Please agree to the terms and conditions.');
      return;
    }

    try {
      const userEmailRef = collection(db, 'Users');
      await addDoc(userEmailRef, {
        fullName,
        email,
        password,
        gender,
        birthdate,
        createdAt: serverTimestamp(),
        balance,
        session: 'active',
      });

      console.log('New document added in Users');
      alert('Registration Successful');
      navigation.reset({
        index: 0,
        routes: [{ name: 'Home', params: { email } }],
      });

    } catch (error) { // Catching the error correctly
      console.error('Error adding document:', error.message || error);
      alert('Registration failed. Please try again.');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar 
        barStyle="dark-content"
        translucent={false}
        backgroundColor="transparent" 
      />
      {/* Heading */}
      <Text style={styles.heading}>Set Password</Text>

      {/* Password Input */}
      <TextInput
        style={[styles.input, isError && styles.errorInput]}
        placeholder="Password"
        secureTextEntry={true}
        value={password}
        onChangeText={setPassword}
      />

      {/* Confirm Password Input */}
      <TextInput
        style={[styles.input, isError && styles.errorInput]}
        placeholder="Confirm Password"
        secureTextEntry={true}
        value={confirmPassword}
        onChangeText={setConfirmPassword}
      />

      {/* Terms & Conditions */}
      <View style={styles.termsContainer}>
        <CheckBox
          value={isAgreed}
          onValueChange={setIsAgreed}
          style={styles.checkbox}
        />
        <Text style={styles.termsText}>Agree with Terms & Conditions</Text>
      </View>

      {/* Register Button */}
      <TouchableOpacity onPress={handleRegister} style={styles.button}>
        <Text style={styles.buttonText}>Register</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

// Styling
const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#fff',
  },
  heading: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#7B1FA2',
    textAlign: 'center',
    marginBottom: 32,
  },
  input: {
    width: '80%',
    height: 50,
    borderColor: '#A0A0A0',
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 16,
    marginBottom: 20,
    fontSize: 16,
  },
  errorInput: {
    borderColor: 'red',
  },
  termsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 30,
  },
  checkbox: {
    marginRight: 10,
  },
  termsText: {
    color: '#9B51E0',
    fontSize: 14,
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
