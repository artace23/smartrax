import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity, StatusBar } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { db, collection, query, where, getDocs } from './backend/firebase'; // Adjust imports based on your Firebase setup

export default function RentalHistoryScreen({ route, navigation }) {
    const { email, userData } = route.params; // Get email from route params
    const [rentalLogs, setRentalLogs] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchRentalLogs = async () => {
            try {
                console.log(`Fetching rental logs for email: ${email}`); // Log the email being queried
                const q = query(collection(db, 'RentalLogs'), where('userEmail', '==', email)); // Ensure the field name matches
                const querySnapshot = await getDocs(q);
                
                if (querySnapshot.empty) {
                    console.log('No rental logs found.'); // Log if no logs found
                } else {
                    const logs = [];
                    querySnapshot.forEach((doc) => {
                        logs.push({ id: doc.id, ...doc.data() }); // Push log data into array
                    });
                    setRentalLogs(logs);
                }
            } catch (error) {
                console.error('Error fetching rental logs:', error);
            } finally {
                setLoading(false); // Set loading to false after fetching
            }
        };

        fetchRentalLogs();
    }, [email]);

    // Render loading state or rental logs
    if (loading) {
        return <Text>Loading...</Text>; // You can replace this with a loading spinner
    }

    const handleBackBtn = () => {
        navigation.navigate('Home', { email: userData[0].email });
    };

    const renderLogItem = ({ item }) => {
        return (
            <View style={styles.logItem}>
                <Text style={styles.logText}>Rental ID: {item.id}</Text>
                <Text style={styles.logText}>Total Amount: {item.cost}</Text>
                <Text style={styles.logText}>Duration: {item.duration} minutes</Text>
                <Text style={styles.logText}>E-Bike Number: {item.eBikeNumber}</Text>
            </View>
        );
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
                <Text style={styles.headerText}>Rent History</Text>
            </View>
            <FlatList
                data={rentalLogs}
                renderItem={renderLogItem}
                keyExtractor={(item) => item.id} // Unique key for each log
                contentContainerStyle={{ paddingBottom: 20 }} // Padding at the bottom
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 30,
        marginBottom: 20,
    },
    headerText: {
        fontSize: 20,
        fontWeight: 'bold',
        marginLeft: 10,
    },
    logItem: {
        padding: 15,
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 5,
        marginBottom: 10,
        backgroundColor: '#f9f9f9', // Light background color for items
    },
    logText: {
        fontSize: 16,
        marginBottom: 5,
    },
});
