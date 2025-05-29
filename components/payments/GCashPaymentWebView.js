import React, { useState } from 'react';
import { WebView } from 'react-native-webview';
import { View, ActivityIndicator, Alert } from 'react-native';
import { db, collection, updateDoc, query, where, getDocs, serverTimestamp } from '../backend/firebase';

const GCashPaymentWebView = ({ route, navigation }) => {
    const { checkoutUrl, userData, amount } = route.params;
    const balance = userData[0].balance; // Corrected
    const email = userData[0].email; // Corrected

    const getData = async () => {
        const userEmailRef = collection(db, 'Users');
        const q = query(userEmailRef, where('email', '==', email));

        try {
            const querySnapshot = await getDocs(q);
            const data = [];
            querySnapshot.forEach((doc) => {
                data.push({ ...doc.data() });
            });
            return data; // Return fetched data
        } catch (error) {
            console.error('Error fetching data:', error);
            return []; // Return empty array on error
        }
    };

    const handlePaymentAdding = async (amount) => {
        const userEmailRef = collection(db, 'Users');
        const q = query(userEmailRef, where('email', '==', email));
        const querySnapshot = await getDocs(q);

        if (!querySnapshot.empty) {
            const docRef = querySnapshot.docs[0].ref;
            const newBalance = balance + amount;

            try {
                await updateDoc(docRef, {
                    balance: newBalance,
                });
                console.log('Balance updated for existing email');
            } catch (error) {
                console.error('Error updating balance:', error);
            }
        } else {
            console.error('No documents found for the given email.');
        }
    };

    const handleWebViewNavigationStateChange = async (newNavState) => {
        const { url } = newNavState;

        if (url.includes('success')) {
            Alert.alert('Payment Success', 'Your payment was successful.');
            await handlePaymentAdding(amount);
            const updatedData = await getData(); // Get updated data
            navigation.navigate('Balance', { userData: updatedData });
        } else if (url.includes('failed')) {
            Alert.alert('Payment Failed', 'Your payment failed.');
            const updatedData = await getData(); // Get updated data
            navigation.navigate('Balance', { userData: updatedData });
        }
    };

    return (
        <WebView
            source={{ uri: checkoutUrl }}
            startInLoadingState={true}
            renderLoading={() => (
                <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                    <ActivityIndicator size="large" />
                </View>
            )}
            onNavigationStateChange={handleWebViewNavigationStateChange}
        />
    );
};

export default GCashPaymentWebView;
