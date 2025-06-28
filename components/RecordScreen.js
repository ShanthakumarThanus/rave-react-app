import React, { useState, useEffect } from 'react';
import { View, Button, Text, TextInput, FlatList, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { Audio } from 'expo-av';
import * as FileSystem from 'expo-file-system';
import { useDispatch } from 'react-redux';
import { addRecording } from '../redux/recordingsSlice';

export default function RecordScreen() {
  const [recording, setRecording] = useState(null);
  const [sound, setSound] = useState(null);
  const [recordings, setRecordings] = useState([]);
  const [recordName, setRecordName] = useState('');
  const dispatch = useDispatch();

  const recordingsDir = FileSystem.documentDirectory + 'recordings/';

  useEffect(() => {
    // Créer le dossier au démarrage
    FileSystem.makeDirectoryAsync(recordingsDir, { intermediates: true }).catch(() => {});
    loadRecordings();
  }, []);

  const loadRecordings = async () => {
    const files = await FileSystem.readDirectoryAsync(recordingsDir);
    const list = files.map((file) => ({
      name: file,
      uri: recordingsDir + file,
    }));
    setRecordings(list);
  };

  const startRecording = async () => {
    try {
      await Audio.requestPermissionsAsync();
      await Audio.setAudioModeAsync({ allowsRecordingIOS: true, playsInSilentModeIOS: true });

      const { recording } = await Audio.Recording.createAsync(Audio.RecordingOptionsPresets.HIGH_QUALITY);
      setRecording(recording);
    } catch (err) {
      console.error('Échec démarrage enregistrement', err);
    }
  };

  const stopRecording = async () => {
    try {
      await recording.stopAndUnloadAsync();
      const uri = recording.getURI();
      setRecording(null);
      setSound(null);
      Alert.alert('Nom du clip', 'Choisis un nom ci-dessous et appuie sur Sauvegarder.');
      setSound({ uri });
    } catch (err) {
      console.error('Erreur arrêt enregistrement', err);
    }
  };

  const saveRecording = async () => {
    if (!recordName || !sound?.uri) return;

    const newPath = recordingsDir + recordName + '.m4a';
    await FileSystem.moveAsync({
      from: sound.uri,
      to: newPath,
    });

    dispatch(addRecording({ name: recordName, ur: newPath }));

    setRecordName('');
    setSound(null);
    loadRecordings();
  };

  const playSound = async (uri) => {
    const { sound } = await Audio.Sound.createAsync({ uri });
    await sound.playAsync();
  };

  const deleteRecording = async (uri) => {
    await FileSystem.deleteAsync(uri);
    loadRecordings();
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Enregistreur</Text>

      {recording ? (
        <Button title="Arrêter" onPress={stopRecording} />
      ) : (
        <Button title="Démarrer l'enregistrement" onPress={startRecording} />
      )}

      {sound && (
        <>
          <Button title="Écouter l'enregistrement" onPress={() => playSound(sound.uri)} />
          <TextInput
            placeholder="Nom de l'enregistrement"
            value={recordName}
            onChangeText={setRecordName}
            style={styles.input}
          />
          <Button title="Sauvegarder" onPress={saveRecording} />
        </>
      )}

      <Text style={styles.subtitle}>Enregistrements :</Text>
      <FlatList
        data={recordings}
        keyExtractor={(item) => item.uri}
        renderItem={({ item }) => (
          <View style={styles.recordItem}>
            <Text>{item.name}</Text>
            <View style={styles.actions}>
              <Button title="▶️" onPress={() => playSound(item.uri)} />
              <Button title="🗑️" color="red" onPress={() => deleteRecording(item.uri)} />
            </View>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 10 },
  subtitle: { fontSize: 18, marginTop: 20, marginBottom: 10 },
  input: {
    borderWidth: 1, borderColor: '#ccc', padding: 8, marginVertical: 10, borderRadius: 5,
  },
  recordItem: {
    paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: '#eee',
  },
  actions: { flexDirection: 'row', justifyContent: 'space-between', width: 100, marginTop: 5 },
});
