import React, { useEffect, useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, StatusBar } from 'react-native';
import { db, doc, updateDoc } from './backend/firebase'; // Adjust import based on your Firebase setup
import { MaterialIcons } from '@expo/vector-icons';

export default function EditProfileScreen({ navigation, route }) {
    const { email, userData } = route.params;

    // Initialize state for all user details
    const [fullName, setFullName] = useState(userData.length > 0 ? userData[0].fullName : '');
    const [gender, setGender] = useState(userData.length > 0 ? userData[0].gender : '');
    const [birthdate, setBirthdate] = useState(userData.length > 0 ? userData[0].birthdate : '');

    const handleSave = async () => {
        try {
            const userRef = doc(db, 'Users', email); // Assuming email is used as the document ID
            await updateDoc(userRef, {
                fullName: fullName,
                // No need to update gender and birthdate since they are not editable
            });
            navigation.goBack(); // Navigate back to the previous screen
        } catch (error) {
            console.error('Error updating profile:', error);
        }
    };

    const handleBackBtn = () => {
        navigation.navigate('Home', { email: userData[0].email });
    };

    return (
        <View style={styles.container}>
            <StatusBar 
                barStyle="dark-content"
                translucent={false}
                backgroundColor="transparent" 
            />
            <View style={styles.header}>
                <TouchableOpacity onPress={handleBackBtn}>
                    <MaterialIcons name="arrow-back" size={24} color="black" />
                </TouchableOpacity>
                <Text style={styles.headerText}>Edit Profile</Text>
            </View>
            
            <TextInput
                style={styles.input}
                placeholder="Email"
                value={email} // Display email but not editable
                editable={false} // Disable editing
            />
            <TextInput
                style={styles.input}
                placeholder="Full Name"
                value={fullName}
                onChangeText={setFullName}
            />
            <TextInput
                style={styles.input}
                placeholder="Gender"
                value={gender}
                editable={false} // Disable editing
            />
            <TextInput
                style={styles.input}
                placeholder="Birthdate (YYYY-MM-DD)"
                value={birthdate}
                editable={false} // Disable editing
            />
            
            <TouchableOpacity style={styles.button} onPress={handleSave}>
                <Text style={styles.buttonText}>Save</Text>
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        padding: 20,
    },
    header: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingTop: 40, // For status bar spacing
        height: 80,
        zIndex: 10, // Ensure header is above other components
    },
    headerText: {
        fontSize: 20,
        fontWeight: 'bold',
        marginLeft: 10,
    },
    input: {
        borderWidth: 1,
        borderColor: '#ccc',
        padding: 10,
        borderRadius: 5,
        marginBottom: 20,
        backgroundColor: '#f5f5f5', // Light gray background to indicate disabled state
    },
    button: {
        backgroundColor: '#9B51E0',
        padding: 15,
        borderRadius: 5,
    },
    buttonText: {
        color: '#fff',
        textAlign: 'center',
        fontWeight: 'bold',
    },
});
