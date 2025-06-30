// Store Redux centralisé de l'application
// Ce store combine plusieurs "slices" (sous-états indépendants)

import { configureStore } from '@reduxjs/toolkit';

// Import du reducer de connexion (stocke l'adresse IP et le port du serveur)
import connectionReducer from './connectionSlice';

// Import du reducer des enregistrements (gère la liste des audios enregistrés)
import recordingsReducer from './recordingsSlice';

export const store = configureStore({
  reducer: {
    connection: connectionReducer,
    recordings: recordingsReducer,
  },
});
