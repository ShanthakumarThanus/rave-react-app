// Slice Redux utilisé pour gérer les enregistrements audio dans l'application

import { createSlice } from '@reduxjs/toolkit';

const recordingsSlice = createSlice({
  name: 'recordings',
  initialState: { list: [] },
  reducers: {
    // Actions pour ajouter, supprimer un enregistrement présent dans la liste + action pour vider la liste 
    addRecording: (state, action) => {
      state.list.push(action.payload);
    },
    deleteRecording: (state, action) => {
      state.list = state.list.filter(r => r.uri !== action.payload.uri);
    },
    clearRecordings: (state) => {
      state.list = [];
    }
  },
});

export const { addRecording, deleteRecording, clearRecordings } = recordingsSlice.actions;
export default recordingsSlice.reducer;
