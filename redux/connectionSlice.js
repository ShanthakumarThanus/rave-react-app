import { createSlice } from '@reduxjs/toolkit';

const initialState = { ip: '', port: '' };

const connectionSlice = createSlice({
  name: 'connection',
  initialState,
  reducers: {
    setConnection: (state, action) => {
      state.ip = action.payload.ip;
      state.port = action.payload.port;
    },
  },
});

export const { setConnection } = connectionSlice.actions;
export default connectionSlice.reducer;
