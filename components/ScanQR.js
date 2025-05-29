import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, TextInput, TouchableOpacity, BackHandler, StatusBar } from 'react-native';
import { Camera } from 'expo-camera/legacy';
import { MaterialIcons } from '@expo/vector-icons';


export default function App({ navigation, route }) {
    const { userData } = route.params;
    const [hasPermission, setHasPermission] = useState(null);
    const [scanned, setScanned] = useState(false);
    const [eBikeNumber, setEBikeNumber] = useState('');
    console.log(userData);

    useEffect(() => {
        const requestCameraPermission = async () => {
            const { status } = await Camera.requestCameraPermissionsAsync();
            setHasPermission(status === 'granted');
        };

        requestCameraPermission();

        const handleHardwareBackButton = () => {
            navigation.navigate('Home', { email: userData[0].email });
            return true; // Prevent default behavior
        };

        // Add event listener for hardware back button
        BackHandler.addEventListener('hardwareBackPress', handleHardwareBackButton);

        // Cleanup the event listener on component unmount
        return () => {
            BackHandler.removeEventListener('hardwareBackPress', handleHardwareBackButton);
        };
        
    }, [navigation, userData]); // Ensure dependencies are set

    const handleBarCodeScanned = ({ type, data }) => {
        setScanned(true);
        setEBikeNumber(data);
    };

    const handleProceed = () => {
        console.log('E-Bike Number:', eBikeNumber);
        if(eBikeNumber != "") {
          navigation.navigate('Rent', {eBikeNumber, userData});
        }
    };

    if (hasPermission === null) {
        return <Text>Requesting for camera permission...</Text>;
    }
    if (hasPermission === false) {
        return <Text>No access to camera</Text>;
    }

    return (
        <View style={styles.container}>
          <StatusBar 
            barStyle="dark-content"
            translucent={false}
            backgroundColor="transparent" 
          />
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.navigate('Home', { email: userData[0].email })}>
                    <MaterialIcons name="arrow-back" size={24} color="black" />
                </TouchableOpacity>
            </View>
            <View style={styles.content}>
                {/* QR Scanner with a bordered square */}
                <View style={styles.scannerContainer}>
                    <Camera
                        onBarCodeScanned={scanned ? undefined : handleBarCodeScanned} // Prevents multiple scans
                        style={styles.scanner} // Make this area a square for scanning
                    />
                </View>

                <Text style={styles.orText}>OR</Text>

                {/* Input field */}
                <TextInput
                    style={styles.input}
                    placeholder="Enter E-Bike Number"
                    value={eBikeNumber}
                    onChangeText={setEBikeNumber}
                />

                {/* Proceed button */}
                <TouchableOpacity style={styles.proceedButton} onPress={handleProceed}>
                    <Text style={styles.proceedButtonText}>PROCEED</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 40,
    paddingHorizontal: 20,
  },
  headerText: {
    fontSize: 20,
    fontWeight: 'bold',
    marginLeft: 10,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  scannerContainer: {
    width: 300,
    height: 300,
    borderColor: '#9B51E0', // Purple border as seen in the image
    borderWidth: 2,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  scanner: {
    width: '200%',
    height: '200%',
  },
  orText: {
    fontSize: 18,
    color: '#9B51E0',
    marginVertical: 20,
  },
  input: {
    width: '90%',
    borderColor: '#9B51E0',
    borderWidth: 2,
    borderRadius: 10,
    padding: 10,
    fontSize: 16,
    color: '#000',
    textAlign: 'center',
    marginBottom: 20,
  },
  proceedButton: {
    width: '90%',
    backgroundColor: '#9B51E0',
    paddingVertical: 15,
    borderRadius: 10,
    alignItems: 'center',
  },
  proceedButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
});
