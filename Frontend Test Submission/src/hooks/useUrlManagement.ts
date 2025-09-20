import { useCallback } from 'react';
import { useAppContext } from '../context/AppContext';
import { logger } from '../services/logger';

export function useUrlManagement() {
  const { state, dispatch } = useAppContext();

  const removeUrl = useCallback((id: number) => {
    dispatch({ type: 'REMOVE_URL', payload: id });
    logger.info('hook', `URL removed with id: ${id}`);
  }, [dispatch]);

  const switchTab = useCallback((tab: 'shortener' | 'statistics') => {
    dispatch({ type: 'SET_CURRENT_TAB', payload: tab });
    logger.info('hook', `Tab switched to: ${tab}`);
  }, [dispatch]);

  const shortenUrls = useCallback(() => {
    if (state.urlList.length === 0) {
      const error = 'No URLs to shorten';
      dispatch({ type: 'SET_ERROR', payload: error });
      logger.warn('hook', error);
      return;
    }

    dispatch({ type: 'SET_LOADING', payload: true });
    logger.info('hook', `Shortening ${state.urlList.length} URLs`);
    
    // Simulate API call
    setTimeout(() => {
      dispatch({ type: 'SET_LOADING', payload: false });
      logger.info('hook', 'URLs shortened successfully (demo)');
      alert(`${state.urlList.length} URLs shortened successfully! (This is just a demo)`);
    }, 1000);
  }, [state.urlList.length, dispatch]);

  const clearError = useCallback(() => {
    dispatch({ type: 'SET_ERROR', payload: null });
  }, [dispatch]);

  return {
    urlList: state.urlList,
    currentTab: state.currentTab,
    isLoading: state.isLoading,
    error: state.error,
    removeUrl,
    switchTab,
    shortenUrls,
    clearError,
  };
}