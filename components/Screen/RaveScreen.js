import React, { useEffect, useState } from 'react';
import { View, Text, Button, ActivityIndicator, FlatList, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { Audio } from 'expo-av';
import * as FileSystem from 'expo-file-system';
import * as DocumentPicker from 'expo-document-picker';
import { useSelector } from 'react-redux';
import { useDispatch } from 'react-redux';
import axios from 'axios';
import { useNavigation } from '@react-navigation/native';
import { loadRecordingsToRedux } from '../../utils/loadRecordings';

export default function RaveScreen() {
  const server = useSelector((state) => state.connection);
  const recordings = useSelector((state) => state.recordings.list); 
  const [models, setModels] = useState([]);
  const [selectedModel, setSelectedModel] = useState(null);
  const [selectedAudio, setSelectedAudio] = useState(null);
  const [transformedUri, setTransformedUri] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigation = useNavigation();
  const isServerConfigured = server.ip && server.port; 
  const [alertShown, setAlertShown] = useState(false);
  const dispatch = useDispatch();

  const BASE_URL = `http://${server.ip}:${server.port}`;

  useEffect(() => {
    if ((!server.ip || !server.port) && !alertShown) {
      Alert.alert(
        "Connexion requise",
        "Veuillez d'abord renseigner l'adresse IP et le port dans l'écran d'accueil.",
        [
          {
            text: "OK",
            onPress: () => navigation.navigate('Home')
          }
        ]
      );
      setAlertShown(true);
    }
  }, [server.ip, server.port, alertShown]);

  useEffect(() => {
    const setup = async () => {
      try {
        await loadRecordingsToRedux(dispatch);
        await fetchModels();
      } catch (err) {
        console.error("Erreur dans setup() : ", err);
      }
    }
    if (server.ip && server.port) {
      setAlertShown(false);
      setup();
    }
  }, [server.ip, server.port]);

  if (!isServerConfigured) {
    return (
      <View style={styles.container}>
        <Text style={styles.header}>Veuillez configurer la connexion dans l'écran d'accueil.</Text>
        <Button title="Aller à l'accueil" onPress={() => navigation.navigate('Home')} />
      </View>
    );
  }


  const fetchModels = async () => {
    try {
      console.log('BASE_URL utilisé :', BASE_URL);
      const res = await axios.get(`${BASE_URL}/getmodels`);
      console.log('Modèles récupérés :', res.data);
      setModels(res.data.models);
    } catch (e) {
      Alert.alert('Erreur', 'Impossible de récupérer les modèles.');
    }
  };

  const handleSelectModel = async (model) => {
    try {
      await axios.get(`${BASE_URL}/selectModel/${model}`);
      setSelectedModel(model);
    } catch {
      Alert.alert('Erreur', 'Sélection du modèle impossible.');
    }
  };

  const pickFileFromDevice = async () => {
    const result = await DocumentPicker.getDocumentAsync({ type: 'audio/*' });
    if (result.assets && result.assets[0]) {
      setSelectedAudio({ name: result.assets[0].name, uri: result.assets[0].uri });
    }
  };

  const sendAudio = async () => {
    console.log('selectedAudio:', selectedAudio);
    console.log('selectedModel:', selectedModel);
    if (!selectedAudio || !selectedModel) {
      Alert.alert('Erreur', 'Audio ou modèle manquant.');
      return;
    }

    try {
      setLoading(true);
      const formData = new FormData();
      const fileExt = selectedAudio.name.split('.').pop();

      formData.append('file', {
        uri: selectedAudio.uri,
        name: selectedAudio.name,
        type: `audio/${fileExt}`,
      });

      await axios.post(`${BASE_URL}/upload`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      const transformedPath = `${FileSystem.documentDirectory}transformed.wav`;
      const res = await FileSystem.downloadAsync(`${BASE_URL}/download`, transformedPath);
      setTransformedUri(res.uri);
    } catch (err) {
      Alert.alert('Erreur', 'Échec du transfert ou du téléchargement.');
    } finally {
      setLoading(false);
    }
  };

  const playAudio = async (uri) => {
    const { sound } = await Audio.Sound.createAsync({ uri });
    await sound.playAsync();
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Sélection du modèle :</Text>
      <View style={styles.modelsListContainer}>
        <FlatList
          data={models}
          keyExtractor={(item) => item}
          renderItem={({ item }) => (
            <TouchableOpacity onPress={() => handleSelectModel(item)} style={styles.modelButton}>
              <Text style={item === selectedModel ? styles.modelSelected : styles.model}>
                {item === selectedModel ? '✅ ' : ''}{item}
              </Text>
            </TouchableOpacity>
          )}
        />
      </View>

      <Text style={styles.header}>Choix du clip :</Text>
      <View style={styles.recordingsListContainer}>
        <FlatList
          data={recordings}
          keyExtractor={(item) => item.uri}
          renderItem={({ item }) => {
            const isSelected = selectedAudio?.uri === item.uri;

            return (
              <TouchableOpacity onPress={() => setSelectedAudio(item)} style={[styles.recordingItem, isSelected && styles.selectedRecording]}>
                <Text style={isSelected && styles.selectedRecordingText}>{item.name}</Text>
              </TouchableOpacity>
            );
          }}
          ListEmptyComponent={
            <Text style={styles.emptyText}>Aucun enregistrement disponible</Text>
          }
        />
      </View>

      <View style={styles.buttonContainer}>
        <Button title="Choisir un fichier audio" onPress={pickFileFromDevice} />
      </View>

      {selectedAudio && (
        <>
          <Text>Audio sélectionné : {selectedAudio.name}</Text>
          <View style={styles.buttonContainer}>
            <Button title="▶️ Écouter original" onPress={() => playAudio(selectedAudio.uri)} />
          </View>
        </>
      )}

      <View style={styles.buttonContainer}>
        <Button title="Envoyer au serveur" onPress={sendAudio} disabled={loading} />
      </View>

      {transformedUri && (
        <>
          <Text>Résultat transformé :</Text>
          <View style={styles.buttonContainer}>
            <Button title="▶️ Écouter transformé" onPress={() => playAudio(transformedUri)} />
          </View>
        </>
      )}

    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  header: { fontSize: 18, fontWeight: 'bold', marginVertical: 10 },
  modelButton: { padding: 10 },
  model: { color: 'blue' },
  modelSelected: { color: 'green', fontWeight: 'bold' },
  recordingItem: { paddingVertical: 5 },
  emptyText: {
    textAlign: 'center',
    color: 'gray',
    marginTop: 20,
    fontStyle: 'italic',
  },
  modelButton: {
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
  },
  recordingsListContainer: {
    maxHeight: 150,
    marginBottom: 10,
  },
  modelsListContainer: {
    maxHeight: 150, 
    marginBottom: 10,
  },
  recordingItem: {
    paddingVertical: 5,
    paddingHorizontal: 10,
  },
  selectedRecording: {
    backgroundColor: '#d0ebff',
    borderRadius: 5,
  },
  selectedRecordingText: {
    fontWeight: 'bold',
    color: '#0077cc',
  },
  buttonContainer: {
    marginTop: 10,
  },
});
