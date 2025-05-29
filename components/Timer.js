import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert, Image } from 'react-native';
import MapView, { Marker, Polyline } from 'react-native-maps';
import * as Location from 'expo-location';
import { db, collection, query, doc, where, getDocs, updateDoc } from './backend/firebase';
import geolib from 'geolib'; // Import geolib for location validation
import { BleManager } from 'react-native-ble-plx';

const TimerScreen = ({ route, navigation }) => {
  const { planDuration, eBikeNumber, email } = route.params;
  const [location, setLocation] = useState(null);
  const [minutes, setMinutes] = useState(planDuration);
  const [seconds, setSeconds] = useState(0);
  const [timerRunning, setTimerRunning] = useState(true);
  const mapRef = React.useRef(null);
  const [isInDesignatedArea, setIsInDesignatedArea] = useState(true);;
  const [totalDistance, setTotalDistance] = useState(0); // State to store distance
  const [lastLocation, setLastLocation] = useState(null); 

  useEffect(() => {
    const getLocation = async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Denied', 'Location access is required.');
        return;
      }

      const currentLocation = await Location.getCurrentPositionAsync({});
      updateLocation(currentLocation);

      // Start tracking location with smoother updates
      Location.watchPositionAsync(
        { accuracy: Location.Accuracy.High, timeInterval: 2000, distanceInterval: 3 },
        (newLocation) => updateLocation(newLocation)
      );
    };

    getLocation();
  }, []);

  const updateLocation = (newLocation) => {
    const currentCoords = {
      latitude: newLocation.coords.latitude,
      longitude: newLocation.coords.longitude,
    };

    setLocation({
      ...currentCoords,
      latitudeDelta: 0.002,
      longitudeDelta: 0.002,
    });

    if (mapRef.current) {
      mapRef.current.animateToRegion({
        ...currentCoords,
        latitudeDelta: 0.002,
        longitudeDelta: 0.002,
      }, 1000);
    }

    // Check if user is within designated area
    const insideArea = isPointInPolygon(currentCoords, squareCoordinates);
    setIsInDesignatedArea(insideArea);

    if (!insideArea) {
      Alert.alert('Alert', 'Please return to the designated area.');
    }

    // Calculate distance if lastLocation exists
    if (lastLocation) {
      const distance = geolib.getDistance(lastLocation, currentCoords);
      setTotalDistance((prevDistance) => prevDistance + distance);
    }

    setLastLocation(currentCoords); // Update the last location
  };

  const isPointInPolygon = (point, polygon) => {
    let x = point.latitude, y = point.longitude;
    let inside = false;
  
    for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
      let xi = polygon[i].latitude, yi = polygon[i].longitude;
      let xj = polygon[j].latitude, yj = polygon[j].longitude;
  
      let intersect = ((yi > y) !== (yj > y)) &&
                      (x < (xj - xi) * (y - yi) / (yj - yi) + xi);
      if (intersect) inside = !inside;
    }
  
    return inside;
  };

  useEffect(() => {
    let timer;
    if (timerRunning) {
      timer = setInterval(() => {
        if (seconds > 0) {
          setSeconds((prev) => prev - 1);
        } else if (minutes > 0) {
          setMinutes((prev) => prev - 1);
          setSeconds(59);
        } else {
          clearInterval(timer);
          Alert.alert('Time is up!', `You travelled ${totalDistance} meters.`);
          handleFinishRent();
        }
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [minutes, seconds, timerRunning]);

  const handleExtendTime = () => {
    if (isInDesignatedArea) {
      setMinutes((prev) => prev + 5);
    } else {
      Alert.alert('Alert', 'You must be inside the designated area to extend the time.');
    }
  };

  const handleFinishRent = async () => {
    if (isInDesignatedArea) {
      setTimerRunning(false);
      try {
        // Get reference to the Bike_Gps collection
        const bikeCollectionRef = collection(db, 'Bike_Gps');
        
        // Create and execute query to find the bike document
        const q = query(bikeCollectionRef, where('bike_id', '==', eBikeNumber));
        const querySnapshot = await getDocs(q);

        if (!querySnapshot.empty) {
          // Get the first matching document
          const bikeDoc = querySnapshot.docs[0];
          
          // Update the document
          await updateDoc(doc(db, 'Bike_Gps', bikeDoc.id), {
            distanceTravelled: totalDistance,
          });

          Alert.alert('Rental Finished', `You travelled ${totalDistance} meters. Thank you for using our service.`);
          navigation.reset({
            index: 0,
            routes: [{ name: 'Home', params: { email } }],
          });
        } else {
          throw new Error('Bike document not found');
        }
      } catch (error) {
        console.error("Error updating distance in Firestore: ", error);
        Alert.alert("Error", `Failed to finish rental: ${error.message}`);
      }
    } else {
      Alert.alert('Alert', 'You must be inside the designated area to finish the rent.');
    }
  };

  const squareCoordinates = [
    { latitude: 7.091933298346794, longitude: 125.60980972571971 }, 
    { latitude: 7.082779507466622, longitude: 125.60968711841304 }, 
    { latitude: 7.071147933601027, longitude: 125.61034069857502 }, 
    { latitude: 7.070367701003826, longitude: 125.62075789692082 }, 
    { latitude: 7.073920340222138, longitude: 125.62643987011853 }, 
    { latitude: 7.084783670395991, longitude: 125.62530532940882 }, 
    { latitude: 7.09223874890049, longitude: 125.61837543259252 },
    { latitude: 7.091933298346794, longitude: 125.60980972571971 }, 
  ];

  return (
    <View style={styles.container}>
      {location && (
        <MapView
          ref={mapRef}
          style={styles.map}
          region={location}
          showsUserLocation={true}
          toolbarEnabled={false}
        >
          <Marker coordinate={location}>
            <Image
              source={require('../assets/icons/user_marker.png')}
              style={{ width: 40, height: 40 }}
            />
          </Marker>

          <Polyline
            coordinates={squareCoordinates}
            strokeColor="#FF0000" // Red color for the boundary
            strokeWidth={2}
          />
        </MapView>
      )}

      <View style={styles.header}>
        <Text style={styles.bikeText}>{`RENTING ${eBikeNumber}`}</Text>
      </View>

      <View style={styles.footer}>
        <View style={styles.arc}>
          <Text style={styles.arcText}>
            {`${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`}
          </Text>
        </View>
        <View style={styles.buttonContainer}>
          <TouchableOpacity style={styles.finishButton} onPress={handleFinishRent}>
            <Text style={styles.buttonText}>Finish Rent</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.extendButton} onPress={handleExtendTime}>
            <Text style={styles.buttonText}>+ 5 mins</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  map: {
    flex: 1,
  },
  header: {
    position: 'absolute',
    top: 10,
    alignSelf: 'center',
    backgroundColor: 'white',
    padding: 10,
    borderRadius: 20,
    elevation: 5,
  },
  bikeText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#7E39D8',
  },
  arc: {
    position: 'absolute',
    width: 150,
    height: 150, // This is the half circle's height
    borderRadius: 75, // To make it half circle
    backgroundColor: '#7E39D8',
    bottom: 65, // Adjust this to position it correctly inside the footer
    alignItems: 'center',
    justifyContent: 'center',
  },
  arcText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 35,
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    width: '100%',
    height: 150, // Adjust height as needed to make the half-circle larger or smaller
    borderColor: '#7E39D8',
    borderWidth: 10,
    borderBottomWidth: 0,
    backgroundColor: '#ffff',
    alignItems: 'center',
    justifyContent: 'center',
    borderTopLeftRadius: 75, // Match this to the height
    borderTopRightRadius: 75, // Match this to the height
  },
  timerContainer: {
    width: '100%',
    padding: 20,
    alignItems: 'center',
  },
  timerText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'purple',
    marginBottom: 10,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 30,
    width: '90%',
  },
  finishButton: {
    backgroundColor: 'red',
    paddingVertical: 20,
    paddingHorizontal: 20,
    borderRadius: 20,
  },
  extendButton: {
    backgroundColor: 'green',
    paddingVertical: 20,
    paddingHorizontal: 20,
    borderRadius: 20,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  disabledButton: {
    opacity: 0.5,
  },
});

export default TimerScreen;
