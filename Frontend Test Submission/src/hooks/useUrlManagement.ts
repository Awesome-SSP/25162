import { useCallback } from 'react';
import { useAppContext } from '../context/AppContext';
import { logger } from '../services/logger';

export function useUrlManagement() {
  const { state, dispatch } = useAppContext();

  const removeUrl = useCallback((id: string) => {
    // This feature is not implemented in the current architecture
    logger.warn('hook', `Remove URL feature not implemented for id: ${id}`);
  }, []);

  const switchTab = useCallback((tab: 'shortener' | 'statistics') => {
    dispatch({ type: 'SET_CURRENT_TAB', payload: tab });
    logger.info('hook', `Tab switched to: ${tab}`);
  }, [dispatch]);

  const shortenUrls = useCallback(() => {
    // This functionality is handled by the UrlForm component
    logger.info('hook', 'Shorten URLs called - handled by UrlForm component');
  }, []);

  const clearError = useCallback(() => {
    dispatch({ type: 'SET_ERROR', payload: null });
  }, [dispatch]);

  return {
    urlEntries: state.urlEntries,
    shortenedUrls: state.shortenedUrls,
    urlStatistics: state.urlStatistics,
    currentTab: state.currentTab,
    isLoading: state.isLoading,
    error: state.error,
    removeUrl,
    switchTab,
    shortenUrls,
    clearError,
  };
}