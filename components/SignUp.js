import React, { useState } from 'react';
import { SafeAreaView, StyleSheet, TextInput, Text, TouchableOpacity, View, Image, StatusBar } from 'react-native';
import axios from 'axios';
import { db, collection, query, where, getDocs } from './backend/firebase';

export default function SignUp({ navigation }) {
  const [email, setEmail] = useState('');
  const [emailError, setEmailError] = useState('');

  const validateEmail = (inputEmail) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(inputEmail);
  };

  const generateCode = () => {
    return Math.floor(1000 + Math.random() * 9000).toString(); // Generate a 4-digit code
  };

  const sendVerificationEmail = async (email, code) => {
    const API_KEY = 'API_KEY';
    const API_SECRET = 'API_SECRET_KEY';

    const mailData = {
      Messages: [
        {
          From: {
            Email: 'artace23@gmail.com',
            Name: 'SmartRax',
          },
          To: [
            {
              Email: email,
            },
          ],
          Subject: 'Your verification code',
          TextPart: `Your verification code is: ${code}`,
        },
      ],
    };

    try {
      await axios.post('https://api.mailjet.com/v3.1/send', mailData, {
        auth: {
          username: API_KEY,
          password: API_SECRET,
        },
      });
      console.log('Verification email sent');
    } catch (error) {
      console.error('Error sending email:', error);
      alert('Failed to send verification email');
    }
  };

  const handleNextPress = async () => {
    if (!validateEmail(email)) {
      setEmailError('Please enter a valid email address');
      alert('Invalid Email', 'Please enter a valid email address');
      return;
    }

    try {
      // Check if the email already exists in Firestore
      const usersRef = collection(db, 'Users');
      const emailQuery = query(usersRef, where('email', '==', email));
      const querySnapshot = await getDocs(emailQuery);

      if (!querySnapshot.empty) {
        alert('Email already exists. Please use a different email.');
        return; // Stop further processing if the email exists
      }

      // Generate the code and send the verification email if the email doesn't exist
      const code = generateCode();
      await sendVerificationEmail(email, code);
      alert('Verification code sent!');
      navigation.navigate('Verification', { email, code }); // Pass the code to the next screen
    } catch (error) {
      console.error('Error checking email or sending verification:', error);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar 
        barStyle="dark-content"
        translucent={false}
        backgroundColor="transparent" 
      />
      <Image style={styles.logo} source={require('../assets/smartrax.png')} />
      <Text style={styles.title}>Sign Up</Text>
      {emailError ? <Text style={styles.errorText}>Invalid email address</Text> : null}
      <TextInput
        style={[styles.input, emailError ? styles.errorInput : null]}
        placeholder="Email"
        keyboardType="email-address"
        value={email}
        onChangeText={(text) => {
          setEmail(text);
          if (emailError && validateEmail(text)) {
            setEmailError('');
          }
        }}
      />
      <TouchableOpacity style={styles.button} onPress={handleNextPress}>
        <Text style={styles.buttonText}>Next</Text>
      </TouchableOpacity>
      <View style={styles.loginContainer}>
        <Text>Already have an account? </Text>
        <Text style={styles.loginText} onPress={() => navigation.navigate('Login')}>Login</Text>
      </View>
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
  errorInput: {
    borderColor: 'red',
  },
  errorText: {
    color: 'red',
    marginBottom: 10,
  },
  logo: {
    width: 200,
    height: 100,
    marginBottom: 30,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#9B51E0',
    marginBottom: 30,
  },
  input: {
    width: '80%',
    height: 50,
    borderColor: '#000',
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 16,
    marginBottom: 20,
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
  loginContainer: {
    marginTop: 30,
    flexDirection: 'row',
    marginBottom: 30,
  },
  loginText: {
    color: '#9B51E0',
    fontWeight: 'bold',
  },
});
