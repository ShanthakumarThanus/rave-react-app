import 'react-native-gesture-handler';
import { StatusBar } from 'expo-status-bar';
import React from 'react';
import { Provider } from 'react-redux';
import { store } from './redux/store';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons'; // Importe les icônes Ionicons pour illustrer les onglets

import HomeScreen from './components/Screen/HomeScreen';
import RecordScreen from './components/Screen/RecordScreen';
import RaveScreen from './components/Screen/RaveScreen';

// Création de l'objet de navigation tabulaire
const Tab = createBottomTabNavigator();

export default function App() {
  return (
    // Fournit le store Redux à tous les composants de l’application via le Provider
    <Provider store={store}>
      <NavigationContainer>
        <Tab.Navigator
          screenOptions={({ route }) => ({
            tabBarIcon: ({ focused, color, size }) => {
              let iconName;

              if (route.name === 'Home') {
                iconName = focused ? 'home' : 'home-outline';
              } else if (route.name === 'Record') {
                iconName = focused ? 'mic' : 'mic-outline';
              } else if (route.name === 'RAVE') {
                iconName = focused ? 'musical-notes' : 'musical-notes-outline';
              }

              return <Ionicons name={iconName} size={size} color={color} />;
            },
            tabBarActiveTintColor: 'tomato',
            tabBarInactiveTintColor: 'gray',
          })}
        >
          {/* Définition des écrans accessibles par la barre d’onglets */}
          <Tab.Screen name="Home" component={HomeScreen} /> 
          <Tab.Screen name="Record" component={RecordScreen} />
          <Tab.Screen name="RAVE" component={RaveScreen} />
        </Tab.Navigator>
        <StatusBar style="auto" />
      </NavigationContainer>
    </Provider>
  );
}
