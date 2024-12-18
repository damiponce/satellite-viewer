import { configureStore } from '@reduxjs/toolkit';
import settingsReducer from '@/lib/settings/settingsSlice';
import satelliteReducer from '@/lib/satellites/satelliteSlice';
import timeReducer from '@/lib/time/timeSlice';
import selectionsReducer from '../selections/selectionsSlice';

export const store = configureStore({
  reducer: {
    settings: settingsReducer,
    selections: selectionsReducer,
    satellites: satelliteReducer,
    time: timeReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({ serializableCheck: false, immutableCheck: false }),
});

if (process.env.NODE_ENV !== 'production' && module.hot) {
  module.hot.accept('./store', () => {
    const newRootReducer = require('./store').default;
    store.replaceReducer(newRootReducer);
  });
}

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
