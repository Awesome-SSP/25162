import { configureStore } from '@reduxjs/toolkit';
import urlReducer from './urlSlice';
import { logger } from '../services/logger';

export const store = configureStore({
  reducer: {
    urls: urlReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [],
      },
    }).concat((_store: any) => (next: any) => (action: any) => {
      logger.debug('state', `Redux action dispatched: ${action.type}`);
      return next(action);
    }),
});

logger.info('state', 'Redux store configured');

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;