import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  ip: '',
  port: '',
};

const connectionSlice = createSlice({
  name: 'connection',
  initialState,
  reducers: {
    setConnectionInfo: (state, action) => {
      state.ip = action.payload.ip;
      state.port = action.payload.port;
    },
  },
});

export const { setConnectionInfo } = connectionSlice.actions;
export default connectionSlice.reducer;
