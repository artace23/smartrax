import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Image, StatusBar } from 'react-native';
import { db, collection, query, where, getDocs } from './backend/firebase';
import { Ionicons } from '@expo/vector-icons';

export default function LoginScreen({ navigation }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [emailError, setEmailError] = useState('');
  const [passwordVisible, setPasswordVisible] = useState(false);

  const validateEmail = (inputEmail) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(inputEmail);
  };

  const handleLogin = async () => {
    if (!email || !password) {
      setEmailError('Please enter all the fields');
    } else {
      if (!validateEmail(email)) {
        setEmailError('Please enter a valid email address');
        alert('Invalid Email', 'Please enter a valid email address');
        return;
      }

      const userEmailRef = collection(db, 'Users');
      const q = query(
        userEmailRef,
        where('email', '==', email),
        where('password', '==', password)
      );

      const querySnapshot = await getDocs(q);

      if (!querySnapshot.empty) {
        console.log('User authenticated.');
        navigation.reset({
          index: 0,
          routes: [{ name: 'Home', params: { email } }],
        });
      } else {
        setEmailError('Invalid credentials');
      }
    }
  };

  const handleSignUpPress = () => {
    navigation.navigate('SignUp');
  };

  return (
    <View style={styles.container}>
      <StatusBar 
        barStyle="dark-content"
        translucent={false}
        backgroundColor="transparent" 
      />
      <Image
        style={styles.logo}
        source={require('../assets/smartrax.png')}
      />
      <Text style={styles.title}>Login</Text>

      {emailError ? <Text style={styles.errorText}>{emailError}</Text> : null}

      <TextInput
        style={[styles.input, emailError ? styles.errorInput : null]}
        placeholder="Email"
        value={email}
        onChangeText={(text) => {
          setEmail(text);
          if (emailError) setEmailError(''); // Clear the error when typing
        }}
        keyboardType="email-address"
        autoCapitalize="none"
      />

      <View style={[styles.input, styles.passwordContainer]}>
        <TextInput
          style={styles.passwordInput}
          placeholder="Password"
          value={password}
          onChangeText={(text) => {
            setPassword(text);
            if (emailError) setEmailError(''); // Clear the error when typing
          }}
          secureTextEntry={!passwordVisible} // Toggle password visibility
        />
        <TouchableOpacity onPress={() => setPasswordVisible(!passwordVisible)}>
          <Ionicons
            name={passwordVisible ? 'eye-off' : 'eye'}
            size={24}
            color="gray"
            style={styles.icon}
          />
        </TouchableOpacity>
      </View>

      <TouchableOpacity style={styles.button} onPress={handleLogin}>
        <Text style={styles.buttonText}>Login</Text>
      </TouchableOpacity>

      <View style={styles.loginContainer}>
        <Text>Create an account? </Text>
        <Text style={styles.loginText} onPress={handleSignUpPress}>
          Sign Up
        </Text>
      </View>
    </View>
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
  loginContainer: {
    marginTop: 30,
    flexDirection: 'row',
    marginBottom: 30,
  },
  loginText: {
    color: '#9B51E0',
    fontWeight: 'bold',
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
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  passwordContainer: {
    position: 'relative',
  },
  passwordInput: {
    flex: 1,
    height: '100%',
  },
  icon: {
    paddingHorizontal: 10,
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
