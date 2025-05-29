import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import SignUp from './components/SignUp';
import Verification from './components/Verification';
import SignUpFormScreen from './components/SignUpName';
import SignUpPassword from './components/SignUpPassword';
import Home from './components/Home';
import Login from './components/Login';
import ScanQR from './components/ScanQR';
import Rent from './components/Rent';
import Balance from './components/Balance';
import TransactionHistory from './components/TransactionHistory';
import GCashPaymentWebView from './components/payments/GCashPaymentWebView';
import TimerScreen from './components/Timer';
import ProfileScreen from './components/Profile';
import HistoryScreen from './components/History';

const Stack = createStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="SignUp">
        <Stack.Screen 
          name="SignUp" 
          component={SignUp} 
          options={{ headerShown: false }} 
        />

      <Stack.Screen 
          name="Login" 
          component={Login} 
          options={{ headerShown: false }} 
        />
        
        <Stack.Screen 
          name="Verification" 
          component={Verification} 
          options={{ headerShown: false }} 
        />
        
        <Stack.Screen 
          name="SignUpName" 
          component={SignUpFormScreen} 
          options={{ title: '' }} 
        />

        <Stack.Screen 
          name="SignUpPassword" 
          component={SignUpPassword} 
          options={{ title: '' }} 
        />

        <Stack.Screen 
          name="Home" 
          component={Home} 
          options={{ headerShown: false, title: '' }} 
        />

        <Stack.Screen 
          name="ScanQR" 
          component={ScanQR}
          options={{ headerShown: false, title: '' }} 
        />

        <Stack.Screen 
          name="Rent" 
          component={Rent}
          options={{ title: '' }} 
        />
        
        <Stack.Screen 
          name="Balance" 
          component={Balance}
          options={{ headerShown: false, title: '' }} 
        />

        <Stack.Screen 
          name="TransactionHistory" 
          component={TransactionHistory}
          options={{ headerShown: false, title: '' }} 
        />

        <Stack.Screen 
          name="GCashPaymentWebView" 
          component={GCashPaymentWebView}
          options={{ headerShown: false, title: '' }} 
        />

        <Stack.Screen
          name="Timer"
          component={TimerScreen}
          options={{ headerShown: false }}
        />

        <Stack.Screen
          name="Profile"
          component={ProfileScreen}
          options={{ headerShown: false }}
        />

        <Stack.Screen
          name="History"
          component={HistoryScreen}
          options={{ headerShown: false }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
