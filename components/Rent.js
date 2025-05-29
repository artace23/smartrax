import React, { useState, useEffect } from 'react';
import { PermissionsAndroid, StyleSheet, Text, View, TouchableOpacity, Alert, ActivityIndicator, Image, StatusBar } from 'react-native';
import { db, collection, addDoc, query, where, getDocs, updateDoc } from './backend/firebase';
import { BleManager } from 'react-native-ble-plx';
import { btoa } from 'react-native-quick-base64';

const App = ({ navigation, route }) => {
    const { eBikeNumber, userData } = route.params;
    const [isSending, setIsSending] = useState(false);
    const [device, setDevice] = useState(null);
    const [manager, setManager] = useState(null);

    useEffect(() => {
        // Initialize BLE manager
        const bleManager = new BleManager();
        setManager(bleManager);

        return () => {
            if (bleManager) bleManager.destroy();
        };
    }, []);

    const logRentalTransaction = async (email, bikeNumber, duration, cost) => {
        try {
            const logRef = collection(db, 'RentalLogs'); // Create a new collection for rental logs
            const logData = {
                userEmail: email,
                eBikeNumber: bikeNumber,
                duration,
                cost,
                timestamp: new Date(),
            };
            await addDoc(logRef, logData);
            console.log('Rental transaction logged successfully:', logData);
        } catch (error) {
            console.error('Error logging rental transaction:', error);
        }
    };

    const checkBluetoothPermissions = async () => {
        try {
                const granted = await PermissionsAndroid.requestMultiple([
                    PermissionsAndroid.PERMISSIONS.BLUETOOTH_SCAN,
                    PermissionsAndroid.PERMISSIONS.BLUETOOTH_CONNECT,
                    PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION, // Add location permission if required
                ]);
                
                if (granted['android.permission.BLUETOOTH_SCAN'] === PermissionsAndroid.RESULTS.GRANTED && 
                    granted['android.permission.BLUETOOTH_CONNECT'] === PermissionsAndroid.RESULTS.GRANTED && 
                    granted['android.permission.ACCESS_FINE_LOCATION'] === PermissionsAndroid.RESULTS.GRANTED) {
                    return true;
                }
        } catch (error) {
            console.error('Permission error:', error);
        }
        return false;
    };
    
    
    const checkBluetoothState = async () => {
        const state = await manager.state();
        if (state !== 'PoweredOn') {
            Alert.alert(
                'Bluetooth Disabled',
                'Please enable Bluetooth to proceed.',
                [
                    { text: 'Cancel', style: 'cancel' },
                    { text: 'Turn On', onPress: async () => await manager.enable() },
                ]
            );
            return false;
        }
        return true;
    };    

    const connectToDevice = async () => {
        const bikeNumberRef = collection(db, 'Bike_Info');
        const q = query(
            bikeNumberRef,
            where('bike_id', '==', eBikeNumber),
            where('status', '==', 'Available')
        );

        const querySnapshot = await getDocs(q);

        if(!querySnapshot.empty) {
            const bikeDoc = querySnapshot.docs[0].data();
            const serviceUUID = bikeDoc.serviceUUID;
            const characteristicUUID = bikeDoc.characteristicUUID;
            const deviceName = bikeDoc.deviceName;
            console.log(bikeDoc);
            try {
                const permissionsGranted = await checkBluetoothPermissions();
                if (!permissionsGranted) {
                    Alert.alert('Permission Denied', 'Bluetooth permissions are required.');
                    setIsSending(false);
                    return;
                }
        
                const bluetoothOn = await checkBluetoothState();
                if (!bluetoothOn) {
                    setIsSending(false);
                    return;
                }
        
                console.log('Starting BLE scan...');
                let deviceFound = false;
    
                setTimeout(() => {
                    // Only show timeout alert if the device wasn't found or connected
                    if (!deviceFound) {
                        Alert.alert('Connection Timeout', 'Could not find the ESP32 device.');
                    }
                    return false; 
                }, 15000);
    
                manager.startDeviceScan(null, null, async (error, scannedDevice) => {
                    if (error) {
                        console.error('Scan error:', error.reason || error.message);
                        return;
                    }
    
                    console.log('Scanning device:', scannedDevice.name, scannedDevice.id);
                    if (scannedDevice.name === deviceName) {
                        manager.stopDeviceScan();
                        setDevice(scannedDevice);
                        
                        try {
                            await scannedDevice.connect();
                            console.log('Connected to ESP32');
                            deviceFound = true;  // Mark the device as found and connected
                            await scannedDevice.discoverAllServicesAndCharacteristics();
                            console.log('Services discovered');
                            // Check if the device is still valid after discovery
                            if (scannedDevice && scannedDevice.isConnected()) {
                                console.log('Device is connected, proceeding to send data.');
    
                                const message = `RENT ${eBikeNumber}`;
                                const base64Message = btoa(message);
                                
                                // Ensure the characteristic exists before writing
                                const characteristic = await scannedDevice.readCharacteristicForService(serviceUUID, characteristicUUID);
                                if (characteristic) {
                                    // Write data to the characteristic
                                    await scannedDevice.writeCharacteristicWithResponseForService(serviceUUID, characteristicUUID, base64Message);
                                    console.log('Data sent to ESP32:', message); 
                                    setIsSending(true);
                                    return scannedDevice;
                                } else {
                                    console.error('Characteristic not found.');
                                    return false; 
                                } 
                                return true; 
                             } // Successfully connected, so stop sending state change
                        } catch (connectionError) {
                            console.error('Connection error:', connectionError);
                            Alert.alert('Connection Error', `Reason: ${connectionError.message}`);
                            return false;   // Stop sending state on connection failure
                        }
                    }
                });
                // 15-second timeout
            } catch (error) {
                console.error('Error during connection:', error);
                Alert.alert('Error', 'Failed to connect to the device.');
            } finally {
                return false; 
            }
        } else {
            console.log('Empty');
        }
    };
    
    const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

    const handlePlanClick = async (planDuration) => {
        const delayDuration = 5000;  
        // Connect to ESP32 via BLE
        const isConnected = await connectToDevice();
        await delay(delayDuration);
        console.log(device);
        const planCost = calculatePlanCost(planDuration);
        console.log(isSending);
        if (userData[0].balance >= planCost) {
            const updatedBalance = userData[0].balance - planCost;

            // Update user balance in Firestore
            const userRef = collection(db, 'Users');
            const q = query(userRef, where('email', '==', userData[0].email));

            const querySnapshot = await getDocs(q);
            if (!querySnapshot.empty) {
                const userDocRef = querySnapshot.docs[0].ref;
                await updateDoc(userDocRef, { balance: updatedBalance });
                await logRentalTransaction(userData[0].email, eBikeNumber, planDuration, planCost);
            }

            navigation.navigate('Timer', { eBikeNumber, planDuration, email: userData[0].email, device, bikeId: eBikeNumber });
            
        } else {
            Alert.alert('Insufficient Balance', 'You need to top up your balance to proceed.');
        }
    };

    const calculatePlanCost = (duration) => {
        const costPerMinute = 3;
        return costPerMinute * duration;
    };

    return (
        <View style={styles.container}>
            <StatusBar 
                barStyle="dark-content"
                translucent={false}
                backgroundColor="transparent" 
            />
            <Image style={styles.logo} source={require('../assets/smartrax.png')} />
            <Text style={styles.title}>{eBikeNumber}</Text>
            <TouchableOpacity style={styles.planButton} onPress={() => handlePlanClick(10)}>
                <Text style={styles.planButtonText}>10 Mins Plan</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.planButton} onPress={() => handlePlanClick(30)}>
                <Text style={styles.planButtonText}>30 Mins Plan</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.planButton} onPress={() => handlePlanClick(60)}>
                <Text style={styles.planButtonText}>60 Mins Plan</Text>
            </TouchableOpacity>
            {isSending && <ActivityIndicator size="large" color="#9B51E0" />}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
        alignItems: 'center',
        justifyContent: 'center',
    },
    logo: {
        width: 200,
        height: 100,
        marginBottom: 30,
    },
    title: {
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 20,
        color: '#9B51E0',
    },
    planButton: {
        backgroundColor: '#9B51E0',
        padding: 15,
        borderRadius: 10,
        marginBottom: 10,
        width: '80%',
    },
    planButtonText: {
        fontSize: 18,
        color: '#fff',
        textAlign: 'center',
    },
});

export default App;
