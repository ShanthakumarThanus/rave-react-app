import React, { useState, useEffect } from 'react';
import { View, Button, Text, TextInput, FlatList, StyleSheet, Alert } from 'react-native';
import { Audio } from 'expo-av';
import * as FileSystem from 'expo-file-system';
import { useSelector, useDispatch } from 'react-redux';
import { loadRecordingsToRedux } from '../../utils/loadRecordings';
import { addRecording } from '../../redux/recordingsSlice';

export default function RecordScreen() {
  const [recording, setRecording] = useState(null);
  const [sound, setSound] = useState(null);
  const recordings = useSelector((state) => state.recordings.list);
  const [recordName, setRecordName] = useState('');
  const [playbackInstance, setPlaybackInstance] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [playingUri, setPlayingUri] = useState(null);
  const dispatch = useDispatch();

  const recordingsDir = FileSystem.documentDirectory + 'recordings/';

  useEffect(() => {
    FileSystem.makeDirectoryAsync(recordingsDir, { intermediates: true }).catch(() => {});
    loadRecordingsToRedux(dispatch);
  }, []);

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
      Alert.alert('Nom du clip', 'Choisis un nom ci-dessous et appuie sur Sauvegarder.');
      setSound({ uri });
    } catch (err) {
      console.error('Erreur arrêt enregistrement', err);
    }
  };

  const saveRecording = async () => {
    if (!recordName || !sound?.uri) return;

    const newPath = recordingsDir + recordName + '.m4a';
    await FileSystem.moveAsync({ from: sound.uri, to: newPath });

    dispatch(addRecording({ name: recordName + '.m4a', uri: newPath }));
    setRecordName('');
    setSound(null);
  };

  const togglePlayback = async (uri) => {
    if (playbackInstance) {
      await playbackInstance.stopAsync();
      await playbackInstance.unloadAsync();
      setPlaybackInstance(null);
      setIsPlaying(false);
      if (playingUri === uri) {
        setPlayingUri(null);
        return;
      }
    }

    const { sound } = await Audio.Sound.createAsync({ uri });
    setPlaybackInstance(sound);
    setIsPlaying(true);
    setPlayingUri(uri);
    await sound.playAsync();

    sound.setOnPlaybackStatusUpdate((status) => {
      if (status.didJustFinish) {
        setIsPlaying(false);
        setPlaybackInstance(null);
        setPlayingUri(null);
      }
    });
  };

  const deleteRecording = async (uri) => {
    await FileSystem.deleteAsync(uri);
    await loadRecordingsToRedux(dispatch);
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
          <Button title="Écouter l'enregistrement" onPress={() => togglePlayback(sound.uri)} />
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
        ListEmptyComponent={<Text style={styles.emptyText}>Aucun enregistrement disponible</Text>}
        renderItem={({ item }) => (
          <View style={styles.recordItem}>
            <Text>{item.name}</Text>
            <View style={styles.actions}>
              <Button title={playingUri === item.uri && isPlaying ? '⏸️ Pause' : '▶️ Lecture'} onPress={() => togglePlayback(item.uri)} />
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
  emptyText: {
    textAlign: 'center',
    color: 'gray',
    marginTop: 20,
    fontStyle: 'italic',
  },
});
