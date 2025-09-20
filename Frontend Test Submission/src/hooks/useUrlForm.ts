import { useState, useCallback } from 'react';
import { useAppContext } from '../context/AppContext';
import { logger } from '../services/logger';

export interface UrlFormData {
  longUrl: string;
  validity: string;
  customCode: string;
}

export function useUrlForm() {
  const { state, dispatch } = useAppContext();

  const updateLongUrl = useCallback((url: string) => {
    dispatch({ type: 'SET_LONG_URL', payload: url });
    logger.debug('hook', `Long URL updated: ${url}`);
  }, [dispatch]);

  const updateValidity = useCallback((validity: string) => {
    dispatch({ type: 'SET_VALIDITY', payload: validity });
    logger.debug('hook', `Validity updated: ${validity}`);
  }, [dispatch]);

  const updateCustomCode = useCallback((code: string) => {
    dispatch({ type: 'SET_CUSTOM_CODE', payload: code });
    logger.debug('hook', `Custom code updated: ${code}`);
  }, [dispatch]);

  const clearForm = useCallback(() => {
    dispatch({ type: 'CLEAR_FORM' });
    logger.info('hook', 'Form cleared');
  }, [dispatch]);

  const generateShortCode = useCallback((): string => {
    const letters = 'abcdefghijklmnopqrstuvwxyz0123456789';
    let code = '';
    for (let i = 0; i < 5; i++) {
      code += letters[Math.floor(Math.random() * letters.length)];
    }
    logger.debug('hook', `Generated short code: ${code}`);
    return code;
  }, []);

  const addUrl = useCallback(() => {
    if (!state.longUrl.trim()) {
      const error = 'Please enter a URL';
      dispatch({ type: 'SET_ERROR', payload: error });
      logger.warn('hook', error);
      return false;
    }

    const newUrl = {
      id: Date.now(),
      url: state.longUrl,
      code: state.customCode || generateShortCode(),
      time: state.validity,
      createdAt: new Date(),
    };

    dispatch({ type: 'ADD_URL', payload: newUrl });
    clearForm();
    logger.info('hook', `URL added successfully: ${newUrl.url}`);
    return true;
  }, [state.longUrl, state.customCode, state.validity, dispatch, generateShortCode, clearForm]);

  return {
    formData: {
      longUrl: state.longUrl,
      validity: state.validity,
      customCode: state.customCode,
    },
    updateLongUrl,
    updateValidity,
    updateCustomCode,
    clearForm,
    addUrl,
    error: state.error,
  };
}