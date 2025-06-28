import { createSlice } from '@reduxjs/toolkit';

const recordingsSlice = createSlice({
  name: 'recordings',
  initialState: { list: [] },
  reducers: {
    addRecording: (state, action) => {
      state.list.push(action.payload);
    },
    deleteRecording: (state, action) => {
      state.list = state.list.filter(r => r.uri !== action.payload.uri);
    },
  },
});

export const { addRecording, deleteRecording } = recordingsSlice.actions;
export default recordingsSlice.reducer;
