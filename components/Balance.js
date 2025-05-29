import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, BackHandler, Alert, ActivityIndicator, ScrollView, RefreshControl, StatusBar } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import axios from 'axios';
import { Buffer } from 'buffer'; // Import the Buffer polyfill

export default function PaymentScreen({ navigation, route }) {
    const { userData } = route.params;
    const [loading, setLoading] = useState(false);
    const [refreshing, setRefreshing] = useState(false);

    const handleBackBtn = () => {
        navigation.navigate('Home', { email: userData[0].email });
    };

    const handleTransactionHistoryBtn = () => {
        navigation.navigate('TransactionHistory', { userData });
    };

    const handleHardwareBackButton = () => {
        handleBackBtn();
        return true;
    };

    useEffect(() => {
        BackHandler.addEventListener('hardwareBackPress', handleHardwareBackButton);
        return () => {
            BackHandler.removeEventListener('hardwareBackPress', handleHardwareBackButton);
        };
    }, []);

    // Function to reload data
    const reloadData = async () => {
        setRefreshing(true);
        // Here you can add your logic to reload the data, for example, fetching user data again
        // Simulate a network request
        try {
            navigation.navigate('Balance' , { userData});
        } catch (error) {
            console.error('Error reloading data: ', error);
            Alert.alert('Error', 'Failed to reload data.');
        } finally {
            setRefreshing(false);
        }
    };

    // PayMongo API request to create a payment link for GCash with redirect
    const handleGCash100Payment = async () => {
        setLoading(true);
        try {
            const apiKey = 'sk_test_E3jEwBcm2gz7j9n83emQh3Nu'; // Replace with your PayMongo secret test key
            const headers = {
                Authorization: `Basic ${Buffer.from(apiKey + ':').toString('base64')}`, // Use Buffer to encode the API key
                'Content-Type': 'application/json',
            };

            const data = {
                data: {
                    attributes: {
                        amount: 10000, // Amount in centavos (100 PHP)
                        description: 'Top up via GCash',
                        remarks: 'GCash Top-up',
                    },
                },
            };

            const response = await axios.post('https://api.paymongo.com/v1/links', data, { headers });
            const checkoutUrl = response.data.data.attributes.checkout_url;

            // Redirect to GCash for payment inside the WebView
            navigation.navigate('GCashPaymentWebView', { checkoutUrl, userData, amount: 100 });
        } catch (error) {
            console.error('Error processing GCash payment: ', error);
            Alert.alert('Payment Error', 'Failed to process payment.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <ScrollView
            style={styles.container}
            refreshControl={
                <RefreshControl refreshing={refreshing} onRefresh={reloadData} />
            }
        >
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={handleBackBtn}>
                    <MaterialIcons name="arrow-back" size={24} color="black" />
                </TouchableOpacity>
                <Text style={styles.headerText}>Balance</Text>
            </View>
            <StatusBar 
                barStyle="dark-content"
                translucent={false}
                backgroundColor="transparent" 
            />

            {/* Payment Methods */}
            <View style={styles.paymentContainer}>
                <Text style={styles.sectionTitle}>Payment Methods</Text>

                <View style={styles.balanceContainer}>
                    <View style={styles.walletInfo}>
                        <Text style={styles.balanceText}>Balance:</Text>
                        <Text style={styles.subText}>Top up your account</Text>
                    </View>
                    <View style={styles.amountContainer}>
                        <Text style={styles.amount}>{userData[0].balance} PHP</Text>
                        <Text style={styles.amountLabel}>Wallet</Text>
                    </View>
                </View>

                {/* GCash Payment Button */}
                <TouchableOpacity onPress={handleGCash100Payment} disabled={loading}>
                    <View style={styles.gcashContainer}>
                        <Image
                            source={require('../assets/icons/g_logo.png')} // GCash logo
                            style={styles.gcashIcon}
                        />
                        <Text style={styles.gcashText}>PHP 100.00</Text>
                    </View>
                </TouchableOpacity>

                {loading && <ActivityIndicator size="large" color="#007AFF" />}
            </View>

            {/* Transaction History */}
            <TouchableOpacity style={styles.transactionButton} onPress={handleTransactionHistoryBtn}>
                <Text style={styles.transactionButtonText}>Transaction History</Text>
                <MaterialIcons name="navigate-next" size={24} color="black" />
            </TouchableOpacity>
        </ScrollView>
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
    paymentContainer: {
        backgroundColor: '#f9f9f9',
        borderRadius: 10,
        padding: 15,
        marginBottom: 20,
    },
    balanceContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 20,
    },
    walletInfo: {
        flexDirection: 'column',
    },
    balanceText: {
        fontSize: 18,
        fontWeight: 'bold',
    },
    subText: {
        color: '#888',
    },
    amountContainer: {
        alignItems: 'center',
    },
    amount: {
        fontSize: 16,
        fontWeight: 'bold',
    },
    amountLabel: {
        color: '#888',
        fontSize: 12,
    },
    gcashContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 10,
    },
    gcashIcon: {
        width: 100,
        height: 50,
    },
    gcashText: {
        fontSize: 16,
        marginLeft: 10,
    },
    transactionButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: 15,
        paddingHorizontal: 20,
        borderRadius: 10,
        backgroundColor: '#f1f1f1',
    },
    transactionButtonText: {
        fontSize: 16,
        fontWeight: 'bold',
    },
});
