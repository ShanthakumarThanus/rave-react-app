import 'react-native'
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View } from 'react-native';
import { React } from 'react';
import { Provider } from 'react-redux';
import { store } from './redux/store';
import HomeScreen from './components/HomeScreen';
import RecordScreen from './components/RecordScreen';
import RaveScreen from './components/RaveScreen';

export default function App() {
  return (
    // <View style={styles.container}>
    //   <Text>Open up App.js to start working on your app!</Text>
    //   <StatusBar style="auto" />
    // </View>
    <Tab.Navigator>
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Record" component={RecordScreen} />
      <Tab.Screen name="RAVE" component={RaveScreen} />
    </Tab.Navigator>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
