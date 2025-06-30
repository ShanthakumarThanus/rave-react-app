// Utilitaires pour charger les enregistrements audio stockés localement et les injecter dans le Redux store

import * as FileSystem from 'expo-file-system';
import { addRecording, clearRecordings } from '../redux/recordingsSlice';

export const loadRecordingsToRedux = async (dispatch) => {
  const recordingsDir = FileSystem.documentDirectory + 'recordings/';
  try {
    await FileSystem.makeDirectoryAsync(recordingsDir, { intermediates: true });
  } catch (e) {}

  const files = await FileSystem.readDirectoryAsync(recordingsDir);

  dispatch(clearRecordings());

  // Pour chaque fichier trouvé, on l'ajoute au store
  files.forEach((file) => {
    dispatch(addRecording({
      name: file,
      uri: recordingsDir + file,
    }));
  });
};
