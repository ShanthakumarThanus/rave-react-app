import { configureStore } from '@reduxjs/toolkit';
import { connectionReducer } from './connectionSlice.js'
import recordingsReducer from './recordingsSlice';

export const store = configureStore({
  reducer: {
    connection: connectionReducer,
    recordings: recordingsReducer,
  },
});
