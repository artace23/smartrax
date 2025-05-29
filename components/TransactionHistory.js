import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, StatusBar } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import axios from 'axios';

const PAYMONGO_API_URL = 'https://api.paymongo.com/v1'; // Replace with actual API endpoint
const PAYMONGO_SECRET_KEY = 'sk_test_E3jEwBcm2gz7j9n83emQh3Nu'; // Add your PayMongo secret key here

export default function HistoryScreen({ navigation, route }) {
    const { userData } = route.params;
    const [transactions, setTransactions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const handleBackBtn = () => {
        navigation.navigate('Balance', { userData });
    };

    const fetchTransactionHistory = async () => {
        try {
            const response = await axios.get(`${PAYMONGO_API_URL}/transactions?email=${userData.email}`, {
                headers: {
                    Authorization: `Basic ${btoa('pk_test_b2pED4UvmTyCPAEi2GMkRERh' + ':')}`, // Use your test key here
                    'Content-Type': 'application/json',
                },
            });
    
            setTransactions(response.data.data);
        } catch (err) {
            setError('Failed to fetch transaction history.');
            console.error('Error fetching transactions:', err);
        } finally {
            setLoading(false);
        }
    };
    

    useEffect(() => {
        fetchTransactionHistory();
    }, []);

    return (
        <View style={styles.container}>
            <StatusBar 
                barStyle="dark-content"
                translucent={false}
                backgroundColor="transparent" 
            />
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={handleBackBtn}>
                    <MaterialIcons name="arrow-back" size={24} color="black" />
                </TouchableOpacity>
                <Text style={styles.headerText}>History</Text>
            </View>

            {/* Transaction History Section */}
            <View style={styles.historyContainer}>
                <Text style={styles.sectionTitle}>Transaction History</Text>

                {loading ? (
                    <ActivityIndicator size="large" color="#0000ff" />
                ) : error ? (
                    <Text style={styles.errorText}>{error}</Text>
                ) : transactions.length > 0 ? (
                    transactions.map((transaction) => (
                        <View key={transaction.id} style={styles.transactionItem}>
                            <Text style={styles.transactionText}>{transaction.description}</Text>
                            <Text style={styles.transactionAmount}>
                                {transaction.amount} PHP
                            </Text>
                        </View>
                    ))
                ) : (
                    <Text>No transactions found.</Text>
                )}
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
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
    sectionTitle: {
        fontSize: 16,
        color: '#888',
        marginBottom: 10,
    },
    historyContainer: {
        backgroundColor: '#f9f9f9',
        borderRadius: 10,
        padding: 15,
        marginBottom: 20,
    },
    transactionItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingVertical: 10,
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
    },
    transactionText: {
        fontSize: 16,
    },
    transactionAmount: {
        fontSize: 16,
        fontWeight: 'bold',
    },
    errorText: {
        color: 'red',
        textAlign: 'center',
    },
});
