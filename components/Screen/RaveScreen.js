import React, { useEffect, useState } from 'react';
import { View, Text, Button, ActivityIndicator, FlatList, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { Audio } from 'expo-av';
import * as FileSystem from 'expo-file-system';
import * as DocumentPicker from 'expo-document-picker';
import { useSelector } from 'react-redux';
import axios from 'axios';

export default function RaveScreen() {
  const server = useSelector((state) => state.connection);
  const recordings = useSelector((state) => state.recordings.list); // adapt if needed
  const [models, setModels] = useState([]);
  const [selectedModel, setSelectedModel] = useState(null);
  const [selectedAudio, setSelectedAudio] = useState(null);
  const [transformedUri, setTransformedUri] = useState(null);
  const [loading, setLoading] = useState(false);

  const BASE_URL = `http://${server.ip}:${server.port}`;

  useEffect(() => {
    fetchModels();
  }, []);

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
      <FlatList
        horizontal
        data={models}
        keyExtractor={(item) => item}
        renderItem={({ item }) => (
          <TouchableOpacity onPress={() => handleSelectModel(item)} style={styles.modelButton}>
            <Text style={item === selectedModel ? styles.modelSelected : styles.model}>{item}
              {item === selectedModel ? '✅ ' : ''}{item}
            </Text>
          </TouchableOpacity>
        )}
      />

      <Text style={styles.header}>Choix du clip :</Text>

      <Button title="Utiliser un son par défaut" onPress={() => {
        setSelectedAudio({ name: 'default.wav', uri: FileSystem.bundleDirectory + 'default.wav' });
      }} />

      <FlatList
        data={recordings}
        keyExtractor={(item) => item.uri}
        renderItem={({ item }) => (
          <TouchableOpacity onPress={() => setSelectedAudio(item)} style={styles.recordingItem}>
            <Text>{item.name}</Text>
          </TouchableOpacity>
        )}
      />

      <Button title="Choisir un fichier audio" onPress={pickFileFromDevice} />

      {selectedAudio && (
        <>
          <Text>Audio sélectionné : {selectedAudio.name}</Text>
          <Button title="▶️ Écouter original" onPress={() => playAudio(selectedAudio.uri)} />
        </>
      )}

      <Button title="Envoyer au serveur" onPress={sendAudio} disabled={loading} />

      {loading && <ActivityIndicator size="large" color="blue" />}

      {transformedUri && (
        <>
          <Text>Résultat transformé :</Text>
          <Button title="▶️ Écouter transformé" onPress={() => playAudio(transformedUri)} />
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
});
