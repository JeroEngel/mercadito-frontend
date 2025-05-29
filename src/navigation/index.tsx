import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { RootStackParamList } from '../types';

// Import screens
import LoginScreen from '../screens/LoginScreen';
import RegisterScreen from '../screens/RegisterScreen';
import HomeScreen from '../screens/HomeScreen';
import TransferScreen from '../screens/TransferScreen';
import TransactionHistoryScreen from '../screens/TransactionHistoryScreen';
import ContactsScreen from '../screens/ContactsScreen';

const Stack = createNativeStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator();

const MainTabs = () => {
  return (
    <Tab.Navigator>
      <Tab.Screen 
        name="Home" 
        component={HomeScreen}
        options={{
          title: 'Home',
          // tabBarTestID: 'home-tab',
          // tabBarAccessibilityLabel: 'Home tab'
        }}
      />
      <Tab.Screen 
        name="TransactionHistory" 
        component={TransactionHistoryScreen}
        options={{
          title: 'History',
          // tabBarTestID: 'history-tab',
          // tabBarAccessibilityLabel: 'Transaction history tab'
        }}
      />
      <Tab.Screen 
        name="Contacts" 
        component={ContactsScreen}
        options={{
          title: 'Contacts',
          // tabBarTestID: 'contacts-tab',
          // tabBarAccessibilityLabel: 'Contacts tab'
        }}
      />
    </Tab.Navigator>
  );
};

export const Navigation = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Login">
        <Stack.Screen 
          name="Login" 
          component={LoginScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen 
          name="Register" 
          component={RegisterScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen 
          name="Main" 
          component={MainTabs}
          options={{ headerShown: false }}
        />
        <Stack.Screen 
          name="Transfer" 
          component={TransferScreen}
          options={{ title: 'Transfer Money' }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}; 