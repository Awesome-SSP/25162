import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { logger } from '../services/logger';

export interface UrlItem {
  id: number;
  url: string;
  code: string;
  time: string;
  createdAt: string;
}

interface UrlState {
  urls: UrlItem[];
  loading: boolean;
  error: string | null;
}

const initialState: UrlState = {
  urls: [],
  loading: false,
  error: null,
};

const urlSlice = createSlice({
  name: 'urls',
  initialState,
  reducers: {
    addUrl: (state, action: PayloadAction<UrlItem>) => {
      logger.info('state', `Adding URL: ${action.payload.url}`);
      state.urls.push(action.payload);
    },
    removeUrl: (state, action: PayloadAction<number>) => {
      logger.info('state', `Removing URL with id: ${action.payload}`);
      state.urls = state.urls.filter(url => url.id !== action.payload);
    },
    clearUrls: (state) => {
      logger.info('state', 'Clearing all URLs');
      state.urls = [];
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
      if (action.payload) {
        logger.error('state', `URL slice error: ${action.payload}`);
      }
    },
  },
});

export const { addUrl, removeUrl, clearUrls, setLoading, setError } = urlSlice.actions;
export default urlSlice.reducer;