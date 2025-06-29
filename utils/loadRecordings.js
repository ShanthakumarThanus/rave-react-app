import * as FileSystem from 'expo-file-system';
import { addRecording, clearRecordings } from '../redux/recordingsSlice';

export const loadRecordingsToRedux = async (dispatch) => {
  const recordingsDir = FileSystem.documentDirectory + 'recordings/';
  try {
    await FileSystem.makeDirectoryAsync(recordingsDir, { intermediates: true });
  } catch (e) {}

  const files = await FileSystem.readDirectoryAsync(recordingsDir);

  dispatch(clearRecordings());

  files.forEach((file) => {
    dispatch(addRecording({
      name: file,
      uri: recordingsDir + file,
    }));
  });
};
