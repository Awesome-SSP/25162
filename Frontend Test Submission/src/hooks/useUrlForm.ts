import { useCallback } from 'react';
import { useAppContext } from '../context/AppContext';
import { apiService, CreateUrlRequest } from '../services/apiService';
import { logger } from '../services/logger';

// Helper validation functions
const validateUrl = (url: string): boolean => {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
};

const validateValidityPeriod = (period: string): { isValid: boolean; value?: number } => {
  if (!period || period.trim() === '') {
    return { isValid: true }; // Optional field
  }

  const numValue = parseInt(period, 10);
  if (isNaN(numValue) || numValue <= 0) {
    return { isValid: false };
  }

  return { isValid: true, value: numValue };
};

const validateCustomCode = (code: string): boolean => {
  if (!code || code.trim() === '') {
    return true; // Optional field
  }

  // Basic validation: alphanumeric, 3-50 characters
  const codeRegex = /^[a-zA-Z0-9]{3,50}$/;
  return codeRegex.test(code.trim());
};

export function useUrlForm() {
  const { state, dispatch } = useAppContext();

  const addUrlEntry = useCallback(() => {
    if (state.urlEntries.length >= 5) {
      logger.warn('hook', 'Cannot add more than 5 URL entries');
      dispatch({ type: 'SET_ERROR', payload: 'Maximum 5 URLs allowed' });
      return;
    }
    dispatch({ type: 'ADD_URL_ENTRY' });
    logger.info('hook', 'New URL entry added');
  }, [state.urlEntries.length, dispatch]);

  const removeUrlEntry = useCallback((id: number) => {
    if (state.urlEntries.length <= 1) {
      logger.warn('hook', 'Cannot remove the last URL entry');
      return;
    }
    dispatch({ type: 'REMOVE_URL_ENTRY', payload: id });
    logger.info('hook', `URL entry removed: ${id}`);
  }, [state.urlEntries.length, dispatch]);

  const updateUrlEntry = useCallback((id: number, field: 'longUrl' | 'validityPeriod' | 'customShortcode', value: string) => {
    dispatch({ type: 'UPDATE_URL_ENTRY', payload: { id, field, value } });
    // Clear error when user starts typing
    dispatch({ type: 'SET_URL_ENTRY_ERROR', payload: { id, field, error: undefined } });
    logger.debug('hook', `URL entry updated: ${id} - ${field}`);
  }, [dispatch]);

  const validateUrlEntry = useCallback((entry: typeof state.urlEntries[0]) => {
    const errors: typeof entry.errors = {};
    let isValid = true;

    // Validate long URL
    if (!entry.longUrl.trim()) {
      errors.longUrl = 'URL is required';
      isValid = false;
    } else if (!validateUrl(entry.longUrl)) {
      errors.longUrl = 'Please enter a valid URL';
      isValid = false;
    }

    // Validate validity period
    if (entry.validityPeriod.trim()) {
      const validation = validateValidityPeriod(entry.validityPeriod);
      if (!validation.isValid) {
        errors.validityPeriod = 'Please enter a valid number of minutes';
        isValid = false;
      }
    }

    // Validate custom shortcode
    if (entry.customShortcode.trim()) {
      if (!validateCustomCode(entry.customShortcode)) {
        errors.customShortcode = 'Custom code must be 3-50 alphanumeric characters';
        isValid = false;
      }
    }

    // Set errors
    Object.entries(errors).forEach(([field, error]) => {
      dispatch({ 
        type: 'SET_URL_ENTRY_ERROR', 
        payload: { id: entry.id, field: field as keyof typeof errors, error } 
      });
    });

    logger.debug('hook', `URL entry validation: ${entry.id} - ${isValid ? 'valid' : 'invalid'}`);
    return isValid;
  }, [dispatch]);

  const validateAllEntries = useCallback(() => {
    const validEntries = state.urlEntries.filter(entry => entry.longUrl.trim());
    
    if (validEntries.length === 0) {
      dispatch({ type: 'SET_ERROR', payload: 'Please enter at least one URL' });
      return false;
    }

    let allValid = true;
    validEntries.forEach(entry => {
      if (!validateUrlEntry(entry)) {
        allValid = false;
      }
    });

    return allValid;
  }, [state.urlEntries, validateUrlEntry, dispatch]);

  const submitUrls = useCallback(async () => {
    logger.info('hook', 'Starting URL submission process');
    dispatch({ type: 'SET_ERROR', payload: null });
    dispatch({ type: 'SET_SUCCESS_MESSAGE', payload: null });

    if (!validateAllEntries()) {
      logger.warn('hook', 'Validation failed for URL entries');
      return;
    }

    const validEntries = state.urlEntries.filter(entry => entry.longUrl.trim());
    dispatch({ type: 'SET_SUBMITTING', payload: true });

    try {
      const promises = validEntries.map(async (entry) => {
        const request: CreateUrlRequest = {
          longUrl: entry.longUrl,
          validityPeriod: entry.validityPeriod ? parseInt(entry.validityPeriod, 10) : undefined,
          customShortcode: entry.customShortcode || undefined,
        };

        logger.info('hook', `Submitting URL: ${entry.longUrl}`);
        
        try {
          const response = await apiService.createShortUrl(request);
          dispatch({ 
            type: 'ADD_SHORTENED_URL', 
            payload: { ...response, status: 'success' } 
          });
          return { success: true, response };
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Unknown error';
          dispatch({ 
            type: 'ADD_SHORTENED_URL', 
            payload: { 
              id: `error-${Date.now()}`,
              shortLink: '',
              originalUrl: entry.longUrl,
              expiry: '',
              createdAt: new Date().toISOString(),
              status: 'error',
              errorMessage 
            } 
          });
          return { success: false, error: errorMessage };
        }
      });

      const results = await Promise.all(promises);
      const successCount = results.filter(r => r.success).length;
      const errorCount = results.filter(r => !r.success).length;

      if (successCount > 0) {
        dispatch({ 
          type: 'SET_SUCCESS_MESSAGE', 
          payload: `${successCount} URL(s) shortened successfully!` 
        });
        logger.info('hook', `Successfully shortened ${successCount} URLs`);
      }

      if (errorCount > 0) {
        dispatch({ 
          type: 'SET_ERROR', 
          payload: `${errorCount} URL(s) failed to shorten. Check individual results.` 
        });
        logger.error('hook', `Failed to shorten ${errorCount} URLs`);
      }

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to submit URLs';
      dispatch({ type: 'SET_ERROR', payload: errorMessage });
      logger.error('hook', `URL submission failed: ${errorMessage}`);
    } finally {
      dispatch({ type: 'SET_SUBMITTING', payload: false });
    }
  }, [state.urlEntries, validateAllEntries, dispatch]);

  const clearForm = useCallback(() => {
    dispatch({ type: 'CLEAR_FORM' });
    logger.info('hook', 'Form cleared');
  }, [dispatch]);

  return {
    urlEntries: state.urlEntries,
    shortenedUrls: state.shortenedUrls,
    isSubmitting: state.isSubmitting,
    error: state.error,
    successMessage: state.successMessage,
    addUrlEntry,
    removeUrlEntry,
    updateUrlEntry,
    submitUrls,
    clearForm,
  };
}