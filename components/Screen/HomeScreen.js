import React, { useState } from 'react';
import { View, TextInput, Button, StyleSheet, ToastAndroid, Platform, Alert, Text } from 'react-native';
import axios from 'axios';

export default function HomeScreen({ navigation }) {
  const [ip, setIp] = useState('');
  const [port, setPort] = useState('');

  const showMessage = (msg) => {
    if (Platform.OS === 'android') {
      ToastAndroid.show(msg, ToastAndroid.SHORT);
    } else {
      Alert.alert(msg);
    }
  };

  const testConnection = async () => {
    if (!ip || !port) {
      showMessage("Veuillez saisir l'adresse IP et le port.");
      return;
    }

    try {
      const response = await axios.get(`http://${ip}:${port}/`);
      if (response.data.includes("Connexion success")) {
        showMessage("Connexion réussie !");
        // Tu peux stocker l'IP/port dans Redux ici
      } else {
        showMessage("Le serveur a répondu, mais le message est inattendu.");
      }
    } catch (error) {
      showMessage("Erreur de connexion au serveur.");
      console.error(error.message);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Adresse IP du serveur :</Text>
      <TextInput
        style={styles.input}
        placeholder="Ex: 192.168.0.10"
        value={ip}
        onChangeText={setIp}
        keyboardType="numeric"
      />

      <Text style={styles.label}>Port :</Text>
      <TextInput
        style={styles.input}
        placeholder="Ex: 5000"
        value={port}
        onChangeText={setPort}
        keyboardType="numeric"
      />

      <Button title="Tester la connexion" onPress={testConnection} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    flex: 1,
    justifyContent: 'center',
    backgroundColor: '#fff',
  },
  input: {
    borderWidth: 1,
    borderColor: '#999',
    borderRadius: 5,
    padding: 10,
    marginBottom: 15,
  },
  label: {
    fontWeight: 'bold',
    marginBottom: 5,
  },
});
