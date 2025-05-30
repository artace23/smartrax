import React, { useEffect, useState, useRef } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, Image, DrawerLayoutAndroid, Dimensions, StatusBar } from 'react-native';
import MapView, { Marker, Polyline, Callout } from 'react-native-maps';
import * as Location from 'expo-location';
import { MaterialCommunityIcons, FontAwesome5, MaterialIcons } from '@expo/vector-icons';
import { db, collection, query, where, getDocs } from './backend/firebase';
import MapViewDirections from 'react-native-maps-directions';

export default function MapScreen({ navigation, route }) {
  const { email } = route.params;
  const [location, setLocation] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);
  const [mapRef, setMapRef] = useState(null); 
  const [region, setRegion] = useState({
    latitude: 7.07235,   // Center latitude of the square
    longitude: 125.61355, // Center longitude of the square
    latitudeDelta: 0.002, // Adjusted to keep the view within the square
    longitudeDelta: 0.002,
  });
  const [userData, setUserData] = useState([]);
  const [bikeGpsData, setBikeGpsData] = useState([]); // State for bike GPS data
  const [destination, setDestination] = useState(null);
  const [distance, setDistance] = useState(null); // Store distance
  const [duration, setDuration] = useState(null); // Store duration

  const [isInsidePolygon, setIsInsidePolygon] = useState(true);


  const GOOGLE_MAPS_APIKEY = 'GOOGLE_MAPS_API_KEY___'


  const getBikeGpsData = async () => {
    const bikeInfoRef = collection(db, 'Bike_Gps'); // Replace with your Firestore collection name
    
    try {
      const querySnapshot = await getDocs(bikeInfoRef);
      const bikes = [];
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        bikes.push({
          bike_id: data.bike_id,
          latitude: parseFloat(data.lat), // Convert string to float
          longitude: parseFloat(data.long), // Convert string to float
        });
      });
      setBikeGpsData(bikes);
      console.log(bikes);
    } catch (error) {
      console.error('Error fetching bike_gps data:', error);
    }
  };

  const getBatteryIconColor = (batteryPercentage) => {
    if (batteryPercentage > 75) return "battery-full"; // Full
    if (batteryPercentage > 50) return "battery-three-quarters"; // Three-quarters
    if (batteryPercentage > 25) return "battery-half"; // Half
    if (batteryPercentage > 5) return "battery-quarter"; // Quarter
    return "battery-empty"; // Empty
  };

  useEffect(() => {
    const fetchInterval = setInterval(async () => {
      const bikeInfoRef = collection(db, 'Bike_Gps'); // Replace with your Firestore collection name
      
      try {
        const querySnapshot = await getDocs(bikeInfoRef);
        const bikes = [];
        querySnapshot.forEach((doc) => {
          const data = doc.data();
          bikes.push({
            bike_id: data.bike_id,
            latitude: parseFloat(data.lat), // Convert string to float
            longitude: parseFloat(data.long), // Convert string to float
            distanceTravelled: parseInt(data.distanceTravelled)
          });
        });
        setBikeGpsData(bikes);
        console.log('Updated Bike GPS Data:', bikes);
      } catch (error) {
        console.error('Error fetching bike_gps data:', error);
      }
    }, 5000); // Fetch every 5 seconds
  
    // Cleanup interval on unmount
    return () => clearInterval(fetchInterval);
  }, []);
  
  
  const drawer = useRef(null);

  const handleShowMyLocation = () => {
    if (location && mapRef) {
      mapRef.animateToRegion({
        latitude: location.latitude,
        longitude: location.longitude,
        latitudeDelta: 0.002, // Zoomed-in value
        longitudeDelta: 0.002, // Zoomed-in value
      }, 1000); // Duration in milliseconds
    }
  };

  const getData = async () => {
    const userEmailRef = collection(db, 'Users');
    
    const q = query(userEmailRef, 
      where('email', '==', email)
    );

    try {
      const querySnapshot = await getDocs(q);
      const data = [];
      
      querySnapshot.forEach((doc) => {
        data.push({ ...doc.data() });
      });
      
      setUserData(data);
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  useEffect(() => {
    let locationWatcher;
  
    const startLocationTracking = async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setErrorMsg('Permission to access location was denied');
        return;
      }
  
      // Watch for location changes
      locationWatcher = await Location.watchPositionAsync(
        {
          accuracy: Location.Accuracy.High,
          timeInterval: 2000, // Check every 5 seconds
          distanceInterval: 1, // Update when the user moves 10 meters
        },
        (currentLocation) => {
          const { latitude, longitude } = currentLocation.coords;
  
          console.log('Updated Lat:', latitude);
          console.log('Updated Long:', longitude);
  
          // Update location and region variables
          setLocation(currentLocation.coords);
        }
      );
    };
  
    startLocationTracking();
    getData();
    getBikeGpsData();
  
    // Cleanup location watcher on unmount
    return () => {
      if (locationWatcher) {
        locationWatcher.remove();
      }
    };
  }, []);
  
  useEffect(() => {
    if (location) {
      const inside = isPointInPolygon(location, squareCoordinates);
      setIsInsidePolygon(inside);
    }
  }, [location]);
  
  

  // Define the square coordinates in clockwise order
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


const getDistanceAndDuration = async (destinationLat, destinationLong) => {
  const origin = `${location.latitude},${location.longitude}`;
  const destination = `${destinationLat},${destinationLong}`;
  const url = `https://maps.googleapis.com/maps/api/directions/json?origin=${origin}&destination=${destination}&key=${GOOGLE_MAPS_APIKEY}`;

  try {
    const response = await fetch(url);
    const data = await response.json();

    if (data.status === 'OK') {
      const route = data.routes[0].legs[0];
      const distanceText = route.distance.text; // Distance (e.g., "5.6 km")
      const durationText = route.duration.text; // Duration (e.g., "15 mins")
      
      setDistance(`${distanceText} away`); // Set the distance

      // Extract distance value in km from the response
      const distanceValue = parseFloat(route.distance.text.split(' ')[0]); // Get the number (e.g., 5.6)

      // Calculate walking time based on average walking speed (5 km/h)
      const walkingSpeed = 4.8; // Average walking speed in km/h
      const walkingTimeInHours = distanceValue / walkingSpeed; // Time in hours
      const walkingTimeInMinutes = walkingTimeInHours * 60; // Convert to minutes

      // Set the calculated walking time
      setDuration(`${walkingTimeInMinutes.toFixed(2)} minutes`);

    } else {
      console.error('Error fetching directions:', data.status);
    }
  } catch (error) {
    console.error('Error fetching directions:', error);
  }
};


const handleMarkerPress = (gps) => {
  setDestination({ latitude: gps.latitude, longitude: gps.longitude });
  getDistanceAndDuration(gps.latitude, gps.longitude);
};


  const handleBalanceBtn = () => {
    navigation.reset({
      index: 0,
      routes: [{ name: 'Balance', params: { userData } }],
    });
  };

  const handleHistoryBtn = () => {
    navigation.reset({
      index: 0,
      routes: [{ name: 'History', params: { email, userData } }],
    });
  }

  const handleProfileBtn = () => {
    navigation.reset({
      index: 0,
      routes: [{ name: 'Profile', params: { email, userData } }],
    });
  }

  const handleLogout = () => {
    // Perform your logout logic here
    navigation.reset({
      index: 0,
      routes: [{ name: 'Login'}],
    });// Navigate back to login or any other screen
  };

  const renderDrawerContent = () => (
    <View style={styles.drawerContent}>
      <View style={styles.profileContainer}>
        {/* Logout Button Positioned on the Right */}
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <MaterialIcons name="logout" size={24} color="black" />
        </TouchableOpacity>
        
        <Image
          source={require('../assets/icons/profile.png')}
          style={styles.profileImage}
        />
        <View style={styles.profileInfo}>
          <Text style={styles.userName}>{userData.length > 0 ? userData[0].fullName : 'Loading...'}</Text>
          <TouchableOpacity onPress={handleProfileBtn}>
            <Text style={styles.editProfileText}>Edit Profile</Text>
          </TouchableOpacity>
        </View>
      </View>
      <TouchableOpacity style={styles.menuItem} onPress={handleBalanceBtn}>
        <FontAwesome5 name="money-bill-wave" size={20} color="black" />
        <Text style={styles.menuText}>Balance</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.menuItem} onPress={handleHistoryBtn}>
        <MaterialIcons name="history" size={24} color="black" />
        <Text style={styles.menuText}>History</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.menuItem}>
        <FontAwesome5 name="question-circle" size={20} color="black" />
        <Text style={styles.menuText}>Help</Text>
      </TouchableOpacity>
    </View>
  );

  const openDrawer = () => {
    drawer.current.openDrawer();
  };

  const handleScanBtn = () => {
    navigation.reset({
      index: 0,
      routes: [{ name: 'ScanQR', params: { userData } }],
    });
  };

  return (
    <DrawerLayoutAndroid
      ref={drawer}
      drawerWidth={250}
      drawerPosition="left"
      renderNavigationView={renderDrawerContent}
      style={styles.container}
    >
      {/* Custom Header */}
      
      <StatusBar 
        barStyle="dark-content"
        translucent={false}
        backgroundColor="transparent" 
      />
      
      <View style={styles.header}>
        <TouchableOpacity style={styles.menuIcon} onPress={openDrawer}>
          <MaterialCommunityIcons name="menu" size={30} color="#9B51E0" />
        </TouchableOpacity>
        <Image
          source={require('../assets/smartrax.png')}
          style={styles.logo}
        />
      </View>

      {/* Map Component */}
      <MapView
        style={styles.map}
        region={region}
        ref={(ref) => setMapRef(ref)} 
        showsUserLocation={true}
        showsMyLocationButton={false}
        toolbarEnabled={false}
        onPress={() => setDestination(null)}
      >
        {location && (
          <Marker
            coordinate={{ latitude: location.latitude, longitude: location.longitude }}
          >
            <Image
              source={require('../assets/icons/user_marker.png')}
              style={{ width: 0, height: 0 }}
            />
          </Marker>
        )}

        {/* Render fixed square markers */}
        {squareCoordinates.map((coord, index) => (
          <Marker
            key={index}
            coordinate={coord}

          >
            <Image
              source={require('../assets/icons/user_marker.png')}
              style={{ width: 50, height: 50 }}
            />
          </Marker>
        ))}
        {/* Render boundary lines for the square */}
        <Polyline
          coordinates={squareCoordinates}
          strokeColor="#FF0000" // Red color for the boundary
          strokeWidth={2}
        />

        {bikeGpsData.map((gps, index) => {
          const MAX_DISTANCE = 16;

          const calculateBatteryPercentage = (distance) => {
            if (distance >= MAX_DISTANCE) return 0;
            return ((1 - distance / MAX_DISTANCE) * 100).toFixed(2);
          };

          const batteryPercentage = calculateBatteryPercentage(gps.distanceTravelled);
          const batteryIcon = getBatteryIconColor(batteryPercentage);

          return (
            <Marker
              key={index}
              coordinate={{ latitude: gps.latitude, longitude: gps.longitude }}
              title={gps.bike_id}
              onPress={() => handleMarkerPress(gps)}
            >
              <View style={{ alignItems: 'center' }}>
                <Image
                  source={require('../assets/icons/pin.png')}
                  style={{ width: 50, height: 50 }}
                />
              </View>
              <Callout>
                  <View style={styles.calloutContainer}>
                    <Text style={styles.calloutTitle}>Bike ID: {gps.bike_id}</Text>
                    <Text style={styles.calloutDescription}>
                      {`Distance: ${distance}`}
                    </Text>
                    <Text style={styles.calloutDescription}>
                      
                      Battery: <FontAwesome5
                        name={batteryIcon}
                        size={20}
                        color={batteryPercentage > 50 ? 'green' : batteryPercentage > 25 ? 'orange' : 'red'}
                  
                      />
                    </Text>
                  </View>
                </Callout>
            </Marker>
          );
        })}
            <MapViewDirections
              origin={location}
              destination={destination}
              apikey={GOOGLE_MAPS_APIKEY}
              optimizeWaypoints={true}
              strokeWidth={5}
              strokeColor="#9B51E0"
            />
        </MapView>

      <TouchableOpacity
        style={styles.locButton}
        onPress={handleShowMyLocation}
      >
        <MaterialCommunityIcons name="crosshairs-gps" size={30} color="#9B51E0" />
      </TouchableOpacity>

      {/* SCAN Button */}
      <TouchableOpacity
        style={[styles.scanButton, { backgroundColor: isInsidePolygon ? '#9B51E0' : '#d3d3d3' }]} // Disable button style
        onPress={isInsidePolygon ? handleScanBtn : null}
        disabled={!isInsidePolygon}
      >
        <Text style={[styles.scanButtonText, { color: isInsidePolygon ? '#fff' : '#a9a9a9' }]}>
          SCAN
        </Text>
      </TouchableOpacity>

    </DrawerLayoutAndroid>
  );
}

const { width, height } = Dimensions.get('window');
// Styles
const styles = StyleSheet.create({
  calloutContainer: {
    width: 200,
    padding: 10,
  },
  calloutTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  calloutDescription: {
    fontSize: 14,
    marginTop: 5,
  },
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  profileContainer: {
    flexDirection: 'column',
    alignItems: 'center',
  },
  profileImage: {
    width: 70,
    height: 70,
    borderRadius: 25,
    marginBottom: 10,
  },
  profileInfo: {
    flexDirection: 'column',
    alignItems: 'center',
  },
  editProfileText: {
    fontSize: 14,
    color: '#9B51E0',
    marginTop: -20,
  },
  header: {
    position: 'absolute', // Keep it overlay the map
    top: 0, // Align at the top of the screen
    left: 0, // Ensure it spans full width
    right: 0,
    height: height * 0.15,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
    borderRadius: 30, // Rounded edges like the scan button
    shadowOpacity: 0.2,
    shadowRadius: 4,
    zIndex: 10, // Ensure it stays above the map
  },
  infoContainer: {
    position: 'absolute',
    bottom: height * 0.1,
    left: 10,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    padding: 10,
    borderRadius: 10,
  },
  infoText: {
    color: '#fff',
    fontSize: 16,
  },
  menuIcon: {
    position: 'absolute',
    left: width * 0.05, // 5% of screen width from the left
    top: height * 0.06, // 5% of screen height from the top
    zIndex: 10, // Ensures it's above other elements
  },
  logo: {
    width: 100,
    height: 60,
    resizeMode: 'contain',
  },
  map: {
    flex: 1,
    width:  width,
    height: height,
  },
  locButton: {
    position: 'absolute',
    right: width * 0.001, // 5% from the right side
    bottom: height * 0.15, // 20% from the bottom
    paddingHorizontal: 20,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scanButton: {
    position: 'absolute',
    bottom: height * 0.04, // 5% of the screen height
    left: width * 0.1, // 10% of the screen width
    right: width * 0.1, // 10% of the screen width
    backgroundColor: '#9B51E0',
    paddingVertical: height * 0.02, // 2% of the screen height
    borderRadius: width * 0.15, // 15% of the screen width for a circular feel
    alignItems: 'center',
  },
  scanButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  drawerContent: {
    flex: 1,
    backgroundColor: '#fff',
    paddingTop: 50,
    paddingHorizontal: 20,
  },
  userName: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
  },
  menuText: {
    fontSize: 16,
    marginLeft: 15,
  },
  logoutButton: {
    position: 'absolute',
    top: 0,
    right: 0,
    padding: 10,
  },
});
