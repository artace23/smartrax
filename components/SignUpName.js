import React, { useState } from 'react';
import { SafeAreaView, StyleSheet, Text, TextInput, TouchableOpacity, View, Image, Platform, StatusBar } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';

export default function SignUpFormScreen({ route,  navigation }) {
  const { email } = route.params;
  const [fullName, setFullName] = useState('');
  const [gender, setGender] = useState('');
  const [birthdate, setBirthdate] = useState('');
  const [showDatePicker, setShowDatePicker] = useState(false); // Added state for showing date picker
  const [selectedDate, setSelectedDate] = useState(new Date()); // Added state for selected date

  const handleNextPress = () => {
    // Implement validation or pass data to the next screen
    // Navigate to next screen (e.g., Verification)
    if (!fullName || !gender || !birthdate) {
      alert('Please fill out all fields');
      return;
    }
    navigation.navigate('SignUpPassword', { email, fullName, gender, birthdate });
  };

  const handleDateChange = (event, date) => {
    if (date !== undefined) {
      setShowDatePicker(false);
      const formattedDate = formatDate(date);
      setBirthdate(formattedDate);
      setSelectedDate(date);
    } else {
      setShowDatePicker(false); // In case of user cancellation
    }
  };

  const formatDate = (date) => {
    let day = date.getDate();
    let month = date.getMonth() + 1; // Months are zero-indexed
    const year = date.getFullYear();
    if (day < 10) day = `0${day}`;
    if (month < 10) month = `0${month}`;
    return `${month}/${day}/${year}`;
  };

  const showDatePickerModal = () => {
    setShowDatePicker(true);
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar 
        barStyle="dark-content"
        translucent={false}
        backgroundColor="transparent" 
      />
      {/* Logo */}
      
      {/* Heading */}
      <Text style={styles.heading}>Set Profile</Text>

      {/* Fullname Input */}
      <TextInput
        style={styles.input}
        placeholder="Fullname"
        value={fullName}
        onChangeText={setFullName}
      />

      {/* Gender Input */}
      <TextInput
        style={styles.input}
        placeholder="Gender"
        value={gender}
        onChangeText={setGender}
      />

      {/* Birthdate Input */}
      <TextInput
        style={styles.input}
        placeholder="Birthdate"
        value={birthdate}
        onFocus={showDatePickerModal}  // Show the Date Picker when input is focused
      />
      
      {/* Date Picker (shown only when needed) */}
      {showDatePicker && (
        <DateTimePicker
          value={selectedDate}
          mode="date"
          display={Platform.OS === 'ios' ? 'spinner' : 'default'}
          onChange={handleDateChange}
          maximumDate={new Date()}  // Optional: Restrict date to today or earlier
        />
      )}

      {/* Next Button */}
      <TouchableOpacity onPress={handleNextPress} style={styles.button}>
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
});
